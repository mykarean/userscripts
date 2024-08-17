// ==UserScript==
// @name           IMDb with TMDB ratings
// @description    Adds ratings from The Movie Database and allows you to copy movie information by clicking on a non href linked item under the title
// @version        20240817
// @author         resykano
// @icon           https://icons.duckduckgo.com/ip2/imdb.com.ico
// @match          https://*.imdb.com/title/*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @run-at         document-start
// @compatible     chrome
// @license        GPL3
// ==/UserScript==

"use strict";

// -----------------------------------------------------------------------------------------------------
// Config/Requirements
// -----------------------------------------------------------------------------------------------------

const imdbId = window.location.pathname.match(/title\/(tt\d+)\//)[1];

// -----------------------------------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------------------------------

// create the initial rating template
function createRatingBadgeTemplate(source) {
    const ratingElementImdb = document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"]');

    if (ratingElementImdb && !document.querySelector(`span.rating-bar__base-button[${source.toLowerCase()}]`)) {
        let clonedTempRatingElement = ratingElementImdb.cloneNode(true);
        clonedTempRatingElement.setAttribute(source.toLowerCase(), "");

        // create rating badge
        clonedTempRatingElement.childNodes[0].innerText = `${source} Rating`;
        clonedTempRatingElement.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score] > span").innerText = "X";
        clonedTempRatingElement.querySelector(
            "div[data-testid=hero-rating-bar__aggregate-rating__score]"
        ).nextSibling.nextSibling.innerText = "x";

        // convert div to span element, otherwise it will be removed from IMDb scripts
        let ratingElement = document.createElement("span");
        // Transfer all attributes from the cloned div element to the new span element
        for (let attr of clonedTempRatingElement.attributes) {
            ratingElement.setAttribute(attr.name, attr.value);
        }
        // transfer the content of the cloned IMDb rating element to the new span element
        ratingElement.innerHTML = clonedTempRatingElement.innerHTML;

        ratingElementImdb.insertAdjacentElement("beforebegin", ratingElement);
        return ratingElement;
    }
    return null;
}

// update the rating template with actual data
function updateRatingTemplate(newRatingElement, ratingData) {
    if (newRatingElement && ratingData) {
        newRatingElement.querySelector("a").href = ratingData.url;
        newRatingElement.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score] > span").innerText =
            ratingData.roundedVoteCount;
        newRatingElement.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score]").nextSibling.nextSibling.innerText =
            ratingData.voteCount;
    }
}

let tmdbDataPromise = null;
async function getTmdbData() {
    if (tmdbDataPromise) {
        return tmdbDataPromise;
    }

    if (!imdbId) {
        throw new Error("IMDb ID not found in URL.");
    }

    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMzc1ZGIzOTYwYWVhMWI1OTA1NWMwZmM3ZDcwYjYwZiIsInN1YiI6IjYwYmNhZTk0NGE0YmY2MDA1OWJhNWE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.DU51juQWlAIIfZ2lK99b3zi-c5vgc4jAwVz5h2WjOP8",
        },
    };

    tmdbDataPromise = fetch(`https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const result = data.movie_results[0] || data.tv_results[0];
            if (!result) {
                throw new Error("No data found for the provided IMDb ID.");
            }
            console.log("TMDB: ", result);
            return {
                source: "TMDB",
                id: result.id,
                roundedVoteCount: (Math.round(result.vote_average * 10) / 10).toLocaleString(), // reduce digits after comma
                voteCount: result.vote_count.toLocaleString(),
                url: `https://www.themoviedb.org/${result.media_type}/${result.id}`,
            };
        })
        .catch((error) => {
            console.error("Error fetching TMDb data:", error);
            throw error; // Re-throw the error to be handled by the caller
        });

    return tmdbDataPromise;
}

async function addTmdbRatingBadge() {
    const newRatingElement = createRatingBadgeTemplate("TMDB");

    // if the template was not created, it already exists
    if (!newRatingElement) {
        return;
    }

    const ratingData = await getTmdbData();

    updateRatingTemplate(newRatingElement, ratingData);
}

let doubanDataPromise = null;
async function getDoubanData() {
    const authorsMode = await GM_getValue("authorsMode", false);
    if (!authorsMode) return;

    if (doubanDataPromise) return doubanDataPromise;

    if (!imdbId) {
        throw new Error("IMDb ID not found in URL.");
    }

    const fetchFromDouban = (url, method = "GET", data = null) =>
        new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method,
                url,
                data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf8",
                },
                onload: (response) => {
                    if (response.status >= 200 && response.status < 400) {
                        resolve(JSON.parse(response.responseText));
                    } else {
                        console.error(`Error getting ${url}:`, response.status, response.statusText, response.responseText);
                        resolve(null);
                    }
                },
                onerror: (error) => {
                    console.error(`Error during GM_xmlhttpRequest to ${url}:`, error.statusText);
                    reject(error);
                },
            });
        });

    const getDoubanInfo = async (imdbId) => {
        const data = await fetchFromDouban(
            `https://api.douban.com/v2/movie/imdb/${imdbId}`,
            "POST",
            "apikey=0ac44ae016490db2204ce0a042db2916"
        );
        if (data && data.alt && data.alt !== "N/A") {
            const url = data.alt.replace("/movie/", "/subject/") + "/";
            return { url, rating: data.rating, title: data.title };
        }
    };

    doubanDataPromise = (async function () {
        try {
            const result = await getDoubanInfo(imdbId);
            console.log("Douban: ", result);
            if (!result) {
                throw new Error("No data found for the provided IMDb ID.");
            }

            return {
                source: "Douban",
                id: result.id,
                roundedVoteCount: parseFloat(result.rating.average).toLocaleString(),
                voteCount: result.rating.numRaters.toLocaleString(),
                url: result.url,
            };
        } catch (error) {
            console.error("Error fetching Douban data:", error);
            throw error;
        }
    })();

    return doubanDataPromise;
}

async function addDoubanRatingBadge() {
    const authorsMode = await GM_getValue("authorsMode", false);

    if (authorsMode) {
        const newRatingElement = createRatingBadgeTemplate("Douban");

        // if the template was not created, it already exists
        if (!newRatingElement) {
            return;
        }

        const ratingData = await getDoubanData();

        updateRatingTemplate(newRatingElement, ratingData);
    }
}

async function addDdl() {
    const authorsMode = await GM_getValue("authorsMode", false);

    if (authorsMode) {
        const lastRatingElement = document.querySelector("span.rating-bar__base-button");

        if (!document.querySelector("a#ddl-button") && lastRatingElement) {
            let ddlElement = document.createElement("a");
            ddlElement.id = "ddl-button";
            ddlElement.href = `https://ddl-warez.cc/?s=${imdbId}`;
            ddlElement.style.marginRight = "10px";
            ddlElement.style.height = "50px";
            ddlElement.style.alignSelf = "self-end";

            let imgElement = document.createElement("img");
            imgElement.src = "https://ddl-warez.cc/wp-content/uploads/logo.png";
            imgElement.style.width = "50px";
            imgElement.style.height = "50px";

            ddlElement.appendChild(imgElement);

            lastRatingElement.insertAdjacentElement("beforebegin", ddlElement);
        }
    }
}

function addGenresToTitle() {
    if (!document.querySelector("span.genres-mod")) {
        let genres = document.querySelector("div[data-testid='interests'] div.ipc-chip-list__scroller")?.childNodes;
        let additionalMetadata = document.querySelector('[data-testid="hero__pageTitle"]')?.parentElement?.querySelector("ul");
        let additionalMetadataLastElement = additionalMetadata?.lastElementChild;

        if (genres && additionalMetadata) {
            console.log("addGenresToTitle");
            // do as long not last iteration
            let metadataIteration = additionalMetadata?.childNodes?.length;
            for (let element of additionalMetadata?.childNodes)
                if (--metadataIteration) element.innerHTML += "<span style='margin-right:5px;'> |</span>";

            // add genres to metadata
            let iteration = genres?.length;
            for (let genre of genres) {
                // first itaration
                if (iteration === genres.length) additionalMetadataLastElement.innerHTML += '<span class="genres-mod"> | </span>';

                additionalMetadataLastElement.innerHTML += genre.textContent;

                // do as long not last iteration
                if (--iteration) additionalMetadataLastElement.innerHTML += ", ";
            }

            // remove dots
            GM_addStyle(`
                [data-testid="hero__pageTitle"] ~ ul.ipc-inline-list--show-dividers li.ipc-inline-list__item:before
                {
                display: none !important;
                }
            `);
        }
    }
}

let metadataAsText = "";
function collectMetadataForClipboard() {
    let title = document.querySelector("span.hero__primary-text")?.textContent;
    let genres = document.querySelector("div[data-testid='interests'] div.ipc-chip-list__scroller")?.childNodes;
    let additionalMetadata = document.querySelector('[data-testid="hero__pageTitle"]')?.parentElement?.querySelector("ul");

    // if click listener does not exist
    if (!document.querySelector("ul.collectMetadataForClipboardListener") && title && genres && additionalMetadata) {
        if (genres && additionalMetadata) {
            if (metadataAsText === "") {
                // add title
                metadataAsText += title + " | ";
                // collect additional metadata
                for (let element of additionalMetadata?.childNodes) metadataAsText += element.textContent + " | ";
                // collect genres
                let iteration = genres?.length;
                for (let genre of genres) {
                    metadataAsText += genre.textContent;

                    // append "," as long as not last iteration
                    if (--iteration) metadataAsText += ", ";
                }
            }

            additionalMetadata.style.cursor = "pointer";
            additionalMetadata.addEventListener("click", function () {
                navigator.clipboard.writeText(metadataAsText);
            });

            // to know if click listener is still there
            additionalMetadata.classList.add("collectMetadataForClipboardListener");
        }
    }
}

// add and keep elements in header container
function main() {
    getTmdbData();
    getDoubanData();

    const observer = new MutationObserver(async () => {
        await addDoubanRatingBadge();
        await addTmdbRatingBadge();

        addDdl();
        // addGenresToTitle();
        collectMetadataForClipboard();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
}

// -----------------------------------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------------------------------

main();

// GM_setValue("authorsMode", true);
