// ==UserScript==
// @name           IMDb with TMDB votes
// @description    Adds votes from The Movie Database and displays & formats genres under the title, as in the past
// @version        20240807
// @author         resykano
// @icon           https://icons.duckduckgo.com/ip2/imdb.com.ico
// @match          https://www.imdb.com/title/*
// @grant          GM_getValue
// @grant          GM_setValue
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

async function getHeaderContainer() {
    // return document.querySelector('[data-testid="hero__pageTitle"]').parentElement.parentElement;
    const element = await waitForElement('[data-testid="hero__pageTitle"]');
    return element.parentElement.parentElement;
}

function ratingContainer() {
    return document.querySelector("div.sc-ab3b6b3d-3.goiwap > div.sc-c6e5278a-0.fmlsaT.sc-eda143c4-1.jJHNUW");
}

function genreContainer() {
    return document.querySelector("div[data-testid='genres'] div.ipc-chip-list__scroller");
}

/**
 * Waits for an element until it exists
 *
 * @param {string} selector CSS selector of a NodeList/HTMLCollection
 * @param {number} index
 * @see source: {@link https://stackoverflow.com/a/61511955/13427318}
 * @returns Element
 */
function waitForElement(selector, index = 0) {
    return new Promise((resolve) => {
        if (selector && document.querySelector(selector) && document.querySelectorAll(selector)[index]) {
            return resolve(document.querySelectorAll(selector)[index]);
        }

        const observer = new MutationObserver((mutations, me) => {
            if (selector && document.querySelectorAll(selector) && document.querySelectorAll(selector)[index]) {
                resolve(document.querySelectorAll(selector)[index]);
                observer.disconnect();
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
        });
    });
}

/**
 * Inserts new Nodes into DOM
 *
 * @param {string} position before, after, inside
 * @param {object} newElement
 * @param {object} existingNode
 */
function insertElement(position, newElement, existingNode) {
    switch (position) {
        case "before": {
            existingNode?.parentNode.insertBefore(newElement, existingNode);
            break;
        }
        case "after": {
            existingNode?.parentNode.insertBefore(newElement, existingNode.nextSibling);
            break;
        }
        case "inside": {
            existingNode?.insertBefore(newElement, existingNode.lastElementChild);
            break;
        }
    }
}

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

function addTheMovieDb(tmdbData) {
    waitForElement('div[data-testid="hero-rating-bar__aggregate-rating"]').then((ratingElement) => {
        if (!document.querySelector("span.rating-bar__base-button[tmdb]")) {
            // console.log("addTheMovieDb");

            let clonedElement = ratingElement.cloneNode(true);
            clonedElement.setAttribute("tmdb", "");

            // add TMDb data
            clonedElement.childNodes[0].innerText = "TMDB-BEWERTUNG";
            clonedElement.querySelector(
                "[aria-label='Benutzerbewertungen anzeigen']"
            ).href = `https://www.themoviedb.org/${tmdbData.mediaType}/${tmdbData.id}`;
            clonedElement.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score] > span").innerText =
                tmdbData.roundedVoteCount;
            clonedElement.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score]").nextSibling.nextSibling.innerText =
                tmdbData.voteCount;

            //// Convert div to span element, otherwise it will be removed from remote scripts
            let theMovieDbElement = document.createElement("span");
            // Transfer all attributes from the cloned div element to the new span element
            for (let attr of clonedElement.attributes) {
                theMovieDbElement.setAttribute(attr.name, attr.value);
            }
            // Transfer the content of the cloned div element to the new span element
            theMovieDbElement.innerHTML = clonedElement.innerHTML;

            insertElement("before", theMovieDbElement, ratingElement);
        }
    });
}

function addTheMovieDbOld() {
    if (getHeaderContainer) {
        // log("title hero found");
        if (getHeaderContainer() !== null || getHeaderContainer() !== undefined) {
            // getting Title
            let mainTitle = document.querySelector('[data-testid="hero__pageTitle"]')?.textContent;
            let altTitle = document.querySelector('[data-testid="hero__pageTitle"]')?.nextElementSibling.textContent;
            if (altTitle?.match(/original/i)) {
                altTitle = altTitle.replace("Original title: ", "").replace("Originaltitel: ", "");
            } else {
                altTitle = undefined;
            }
            let titleName = altTitle ?? mainTitle;
            log("titleName: " + titleName);

            // getting Year
            let titleYear1 = document
                .querySelector('[data-testid="hero__pageTitle"]')
                .parentElement?.querySelector("ul")
                .childNodes[0]?.innerText?.replace(/([0-9]{4}).*$/, "$1");
            let titleYear2 = document
                .querySelector('[data-testid="hero__pageTitle"]')
                .parentElement?.querySelector("ul")
                .childNodes[1]?.innerText?.replace(/([0-9]{4}).*$/, "$1");
            let titleYear = isFinite(titleYear1) ? titleYear1 : titleYear2;
            log("titleYear: " + titleYear);

            let theMovieDbElement = document.createElement("div");
            insertElement("before", theMovieDbElement, document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"]'));
            theMovieDbElement.innerHTML =
                '<a href="https://www.themoviedb.org/search?query=' +
                titleName +
                " y:" +
                titleYear +
                '">\
<img src="https://www.themoviedb.org/assets/2/apple-touch-icon-57ed4b3b0450fd5e9a0c20f34e814b82adaa1085c79bdde2f00ca8787b63d2c4.png" style="width:65px;"></a>';
            theMovieDbElement.style["padding-right"] = "10px";
            theMovieDbElement.style["padding-top"] = "0.25rem";
            theMovieDbElement.style["display"] = "flex";
        }
    }
}

async function addDdl() {
    const authorsMode = await GM_getValue("authorsMode", false);

    if (authorsMode) {
        waitForElement("span.rating-bar__base-button[tmdb]").then((ratingElement) => {
            if (!document.querySelector("a#ddl-button")) {
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

                insertElement("before", ddlElement, ratingElement);
            }
        });
    }
}

function addGenresToTitle() {
    if (!document.querySelector("span.genres-mod")) {
        console.log("addGenresToTitle");
        let genres = genreContainer()?.childNodes;
        let additionalTitleMetadata = document.querySelector('[data-testid="hero__pageTitle"]')?.parentElement?.querySelector("ul");
        let additionalTitleMetadataLastElement = additionalTitleMetadata?.lastElementChild;

        if (genres && additionalTitleMetadata) {
            console.log("additionalTitleMetadata");
            // do as long not last iteration
            let metadataIteration = additionalTitleMetadata?.childNodes?.length;
            for (let element of additionalTitleMetadata?.childNodes)
                if (--metadataIteration) element.innerHTML += "<span style='margin-right:5px;'> |</span>";

            // add genres to metadata
            let iteration = genres?.length;
            for (let genre of genres) {
                // first itaration
                if (iteration === genres.length) additionalTitleMetadataLastElement.innerHTML += '<span class="genres-mod"> | </span>';

                additionalTitleMetadataLastElement.innerHTML += genre.textContent;

                // do as long not last iteration
                if (--iteration) additionalTitleMetadataLastElement.innerHTML += ", ";
            }

            // remove dots
            let style = document.createElement("style");
            document.head.appendChild(style);
            style.type = "text/css";
            style.appendChild(
                document.createTextNode(`
            [data-testid="hero__pageTitle"] ~ ul.ipc-inline-list--show-dividers li.ipc-inline-list__item:before
            {
            display: none !important;
            }
        `)
            );
        }
    }
}

// add and keep Elements in Header Container
async function main() {
    addTheMovieDb(await tmdbDataPromise);
    addDdl();
    addGenresToTitle();

    const observer = new MutationObserver(async () => {
        addTheMovieDb(await tmdbDataPromise);
        addDdl();
        addGenresToTitle();
    });

    // const headerContainer = await getHeaderContainer();
    observer.observe(document.body, { childList: true, subtree: true });
}

// -----------------------------------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------------------------------

main();

// for single execution debug information
(async function () {
    try {
        let tmdbData = await tmdbDataPromise; // Warten auf die Auflösung des Promises
        if (tmdbData) {
            console.log(tmdbData);
            // if (tmdbData.id) {
            //     addTheMovieDb(tmdbData);
            // }
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der TMDB-Daten:", error);
    }
})();

// function main() {
//     // addTheMovieDb: second try
//     if (tmdbDataPromise.id) {
//         console.log("second try");
//         addTheMovieDb(tmdbDataPromise);
//     }
//     addDdl();
// }

// GM_setValue("authorsMode", true);
// document.addEventListener("DOMContentLoaded", main);
