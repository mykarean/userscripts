// ==UserScript==
// @name           IMDb with TMDB ratings
// @description    Adds ratings from The Movie Database and allows you to copy movie information by clicking on a non href linked item under the title
// @version        20240811
// @author         resykano
// @icon           https://icons.duckduckgo.com/ip2/imdb.com.ico
// @match          https://www.imdb.com/title/*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @run-at         document-start
// @compatible     chrome
// @license        GPL3
// ==/UserScript==

"use strict";

// -----------------------------------------------------------------------------------------------------
// Config/Requirements
// -----------------------------------------------------------------------------------------------------

const imdbId = window.location.pathname.match(/title\/(tt\d+)\//)[1];
let tmdbDataPromise = getTmdbData();

// -----------------------------------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------------------------------

async function getTmdbData() {
    try {
        if (imdbId) {
            const options = {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMzc1ZGIzOTYwYWVhMWI1OTA1NWMwZmM3ZDcwYjYwZiIsInN1YiI6IjYwYmNhZTk0NGE0YmY2MDA1OWJhNWE1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.DU51juQWlAIIfZ2lK99b3zi-c5vgc4jAwVz5h2WjOP8",
                },
            };

            const response = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`, options);
            const data = await response.json();

            if (data && (data.movie_results.length > 0 || data.tv_results.length > 0)) {
                let result;
                if (data.movie_results.length > 0) {
                    result = data.movie_results[0];
                } else if (data.tv_results.length > 0) {
                    result = data.tv_results[0];
                }
                const roundedVoteCount = Math.round(result.vote_average * 10) / 10;
                tmdbDataPromise = {
                    mediaType: result.media_type,
                    id: result.id,
                    roundedVoteCount: roundedVoteCount,
                    voteCount: result.vote_count,
                };
                return tmdbDataPromise;
            } else {
                throw new Error("No data found for the provided IMDb ID.");
            }
        } else {
            throw new Error("IMDb ID not found in URL.");
        }
    } catch (error) {
        console.error("Error fetching IMDb data:", error);
        return null;
    }
}

async function addTheMovieDbRating() {
    const ratingElementImdb = document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"]');

    if (ratingElementImdb && !document.querySelector("span.rating-bar__base-button[tmdb]")) {
        let clonedTempRatingElement = ratingElementImdb.cloneNode(true);
        clonedTempRatingElement.setAttribute("tmdb", "");

        // create TMDB Badge
        clonedTempRatingElement.childNodes[0].innerText = "TMDB-RATING";
        clonedTempRatingElement.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score] > span").innerText = "n/a";
        clonedTempRatingElement.querySelector(
            "div[data-testid=hero-rating-bar__aggregate-rating__score]"
        ).nextSibling.nextSibling.innerText = "n/a";

        // Convert div to span element, otherwise it will be removed from IMDb scripts
        let ratingElementTheMovieDb = document.createElement("span");
        // Transfer all attributes from the cloned div element to the new span element
        for (let attr of clonedTempRatingElement.attributes) {
            ratingElementTheMovieDb.setAttribute(attr.name, attr.value);
        }
        // Transfer the content of the cloned IMDb rating element to the new span element
        ratingElementTheMovieDb.innerHTML = clonedTempRatingElement.innerHTML;

        ratingElementImdb.insertAdjacentElement("beforebegin", ratingElementTheMovieDb);

        // add data from TMDB
        const tmdbData = await tmdbDataPromise;
        if (tmdbData) {
            ratingElementTheMovieDb.querySelector(
                "[aria-label='Benutzerbewertungen anzeigen']"
            ).href = `https://www.themoviedb.org/${tmdbData.mediaType}/${tmdbData.id}`;
            ratingElementTheMovieDb.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score] > span").innerText =
                tmdbData.roundedVoteCount;
            ratingElementTheMovieDb.querySelector(
                "div[data-testid=hero-rating-bar__aggregate-rating__score]"
            ).nextSibling.nextSibling.innerText = tmdbData.voteCount;
        }
    }
}

async function addDdl() {
    const authorsMode = await GM_getValue("authorsMode", false);

    if (authorsMode) {
        const ratingElementTheMovieDb = document.querySelector("span.rating-bar__base-button[tmdb]");

        if (!document.querySelector("a#ddl-button") && ratingElementTheMovieDb) {
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

            ratingElementTheMovieDb.insertAdjacentElement("beforebegin", ddlElement);
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
    const observer = new MutationObserver(() => {
        addTheMovieDbRating();
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

// for one-time debug information
(async function () {
    try {
        let tmdbData = await tmdbDataPromise;
        if (tmdbData) {
            console.log(tmdbData);
        }
    } catch (error) {
        console.error("Error when retrieving TMDB data:", error);
    }
})();

// GM_setValue("authorsMode", true);
