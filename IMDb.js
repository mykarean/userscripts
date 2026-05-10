// ==UserScript==
// @name            IMDb with additional ratings
// @description     Adds additional ratings (TMDB, Douban, Metacritic, Rotten Tomatoes, MyAnimeList) to imdb.com for movies and series. These can be activated or deactivated individually in the extension's configuration menu, which is accessible via the Tampermonkey menu. The extension also allows you to copy movie metadata by simply clicking on the runtime below the movie title.
// @version         20260510.1
// @author          mykarean
// @icon            http://imdb.com/favicon.ico
// @match           https://*.imdb.com/title/*
// @match           https://*.imdb.com/*/title/*
// @connect         api.themoviedb.org
// @connect         api.douban.com
// @connect         wikidata.org
// @connect         metacritic.com
// @connect         rottentomatoes.com
// @connect         jikan.moe
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_addStyle
// @grant           GM_xmlhttpRequest
// @grant           GM_registerMenuCommand
// @run-at          document-start
// @compatible      chrome
// @license         GPL3
// ==/UserScript==

"use strict";

// -----------------------------------------------------------------------------------------------------
// Config/Requirements
// -----------------------------------------------------------------------------------------------------

const ratingSourceOptions = ["TMDB", "Douban", "Metacritic", "Rotten Tomatoes", "My Anime List"];
const imdbId = window.location.pathname.match(/title\/(tt\d+)/)[1];
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:150.0) Gecko/20100101 Firefox/150.0";
const undefinedValue = "X";
const initialValue = 0;

// Timeout configuration for GM_xmlhttpRequest (in milliseconds)
const TIMEOUT_GM_XMLHTTP_REQUEST = 50000;

function getTitleElement() {
    return document.querySelector('[data-testid="hero__pageTitle"]');
}
function getMainTitle() {
    return getTitleElement()?.textContent;
}
function getOriginalTitle() {
    const originalTitle = document.querySelector('[data-testid="hero__pageTitle"] ~ div')?.textContent?.match(/^.*:\ (.*)/)?.[1];
    // Unicode normalisation and removal of diacritical characters to improve search on other pages
    return originalTitle?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

GM_registerMenuCommand("Configuration", configurationMenu, "c");

// Apply GM_xmlhttpRequest wrapper to fix redirect handling in background requests (thumbnail search, prefetch) without affecting page scripts. Requires Tampermonkey 5.3.2+ for redirect control support.
(() => {
    // https://github.com/Tampermonkey/tampermonkey/issues/2215
    /* global GM_info, GM_xmlhttpRequest, GM */

    const HAS_GM = typeof GM !== "undefined";
    const NEW_GM = ((scope, GM) => {
        // Check if running in Tampermonkey and if version supports redirect control
        if (GM_info.scriptHandler !== "Tampermonkey" || compareVersions(GM_info.version, "5.3.2") < 0) return;

        // Backup original functions
        const GM_xmlhttpRequestOrig = GM_xmlhttpRequest;
        const GM_xmlHttpRequestOrig = GM.xmlHttpRequest;

        function compareVersions(v1, v2) {
            const parts1 = v1.split(".").map(Number);
            const parts2 = v2.split(".").map(Number);
            const length = Math.max(parts1.length, parts2.length);

            for (let i = 0; i < length; i++) {
                const num1 = parts1[i] || 0;
                const num2 = parts2[i] || 0;

                if (num1 > num2) return 1;
                if (num1 < num2) return -1;
            }
            return 0;
        }

        // Wrapper for GM_xmlhttpRequest
        function GM_xmlhttpRequestWrapper(odetails) {
            // If redirect is manually set, simply pass odetails to the original function
            if (odetails.redirect !== undefined) {
                return GM_xmlhttpRequestOrig(odetails);
            }

            // Warn if onprogress is used with settings incompatible with fetch mode used in background
            if (odetails.onprogress || odetails.fetch === false) {
                console.warn("Fetch mode does not support onprogress in the background.");
            }

            const { onload, onloadend, onerror, onabort, ontimeout, ...details } = odetails;

            // Set redirect to manual and handle redirects
            const handleRedirects = (initialDetails) => {
                const request = GM_xmlhttpRequestOrig({
                    ...initialDetails,
                    redirect: "manual",
                    onload: function (response) {
                        if (response.status >= 300 && response.status < 400) {
                            const m = response.responseHeaders.match(/Location:\s*(\S+)/i);
                            // Follow redirect manually
                            const redirectUrl = m && m[1];
                            if (redirectUrl) {
                                const absoluteUrl = new URL(redirectUrl, initialDetails.url).href;
                                handleRedirects({ ...initialDetails, url: absoluteUrl });
                                return;
                            }
                        }

                        if (onload) onload.call(this, response);
                        if (onloadend) onloadend.call(this, response);
                    },
                    onerror: function (response) {
                        if (onerror) onerror.call(this, response);
                        if (onloadend) onloadend.call(this, response);
                    },
                    onabort: function (response) {
                        if (onabort) onabort.call(this, response);
                        if (onloadend) onloadend.call(this, response);
                    },
                    ontimeout: function (response) {
                        if (ontimeout) ontimeout.call(this, response);
                        if (onloadend) onloadend.call(this, response);
                    },
                });
                return request;
            };

            return handleRedirects(details);
        }

        // Wrapper for GM.xmlHttpRequest
        function GM_xmlHttpRequestWrapper(odetails) {
            let abort;

            const p = new Promise((resolve, reject) => {
                const { onload, ontimeout, onerror, ...send } = odetails;

                send.onerror = function (r) {
                    if (onerror) {
                        resolve(r);
                        onerror.call(this, r);
                    } else {
                        reject(r);
                    }
                };
                send.ontimeout = function (r) {
                    if (ontimeout) {
                        // See comment above
                        resolve(r);
                        ontimeout.call(this, r);
                    } else {
                        reject(r);
                    }
                };
                send.onload = function (r) {
                    resolve(r);
                    if (onload) onload.call(this, r);
                };

                const a = GM_xmlhttpRequestWrapper(send).abort;
                if (abort === true) {
                    a();
                } else {
                    abort = a;
                }
            });

            p.abort = () => {
                if (typeof abort === "function") {
                    abort();
                } else {
                    abort = true;
                }
            };

            return p;
        }

        // Export wrappers
        GM_xmlhttpRequest = GM_xmlhttpRequestWrapper;
        scope.GM_xmlhttpRequestOrig = GM_xmlhttpRequestOrig;

        const gopd = Object.getOwnPropertyDescriptor(GM, "xmlHttpRequest");
        if (gopd && gopd.configurable === false) {
            return {
                __proto__: GM,
                xmlHttpRequest: GM_xmlHttpRequestWrapper,
                xmlHttpRequestOrig: GM_xmlHttpRequestOrig,
            };
        } else {
            GM.xmlHttpRequest = GM_xmlHttpRequestWrapper;
            GM.xmlHttpRequestOrig = GM_xmlHttpRequestOrig;
        }
    })(this, HAS_GM ? GM : {});

    if (HAS_GM && NEW_GM) GM = NEW_GM;
})();

// -----------------------------------------------------------------------------------------------------
// General Functions
// -----------------------------------------------------------------------------------------------------

async function addCss() {
    if (!document.getElementById("custom-css-style")) {
        GM_addStyle(`
            /* all Badges */
            .rating-bar__base-button {
                margin-right: 0 !important;
            }

            /* added Badges */
            span[data-testid="hero-rating-bar__aggregate-rating"],
            .rating-bar__base-button > .ipc-btn {
                padding: 2px 3px;
                border-radius: 5px !important;
            }
            span[data-testid=hero-rating-bar__aggregate-rating] {
                margin: 0 3px;
                background-color: rgba(255, 255, 255, 0.08);
            }
            /* format rating content */
            span[data-testid=hero-rating-bar__aggregate-rating] .ipc-btn__text > div > div {
                 align-items: center;
                 padding-right: 0;
            }
            span[data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] > span:nth-child(1) {
                padding-right: 0;
            }
            [data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] > span:nth-child(1) {
                letter-spacing: -0.4px;
            }
            /* remove /10 */
            span[data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] > span:nth-child(2) {
                display: none;
            }
            /* vote count */
            span[data-testid=hero-rating-bar__aggregate-rating] .ipc-btn__text > div > div > div {
                letter-spacing: -0.2px;
            }

            /* IMDb Badges */
            [data-testid="hero-rating-bar__popularity"],
            [data-testid="hero-rating-bar__user-rating"] {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
            [data-testid="hero-rating-bar__popularity__score"] {
                letter-spacing: -0.3px !important;
            }

            /* Badge Header */
            .rating-bar__base-button > div {
                letter-spacing: unset;
            }
            span.rating-bar__base-button[myanimelist] > div,
            span.rating-bar__base-button[rottentomatoes] > div {
                letter-spacing: -0.5px;
            }
            
            /* for badges without rating data */
            .disabled-anchor {
                cursor: default !important;
            }
            .disabled-anchor:before {
                background: unset !important;
            }

            /* notification bubbles */
            span.rating-bar__base-button {
                position: relative;
            }
            .rating-badge-error,
            .rating-badge-warning {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                font-size: 9px;
                font-weight: bold;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: help;
                z-index: 1;
                line-height: 1;
            }
            .rating-badge-error { background-color: #c0392b; }
            .rating-badge-warning { background-color: #e67e22; }

            /* title if line break */
            span.hero__primary-text {
                line-height: 40px;
                display: block;
            }
        `).setAttribute("id", "custom-css-style");
    }
    const imdbRatingName = document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"] > div');
    if (imdbRatingName && imdbRatingName.textContent !== "IMDb") {
        imdbRatingName.textContent = "IMDb";
    }

    // more compact design for authors mode
    const authorsMode = await GM_getValue("authorsMode", false);
    if (authorsMode) {
        if (!document.getElementById("authors-custom-css-style")) {
            GM_addStyle(`
                /* remove star */
                div[data-testid=hero-rating-bar__aggregate-rating] .ipc-btn__text > div > div:first-child {
                    display: none;
                }
                /* center rating */
                div[data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] {
                    align-self: center;
                }
                /* remove /10 */
                div[data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] > span:nth-child(2) {
                    display: none;
                }
            `).setAttribute("id", "authors-custom-css-style");
        }
    }
}

// create the initial rating template
function createRatingBadge(ratingSource) {
    const ratingElementImdb = document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"]');

    // ignore if the rating badge has already been created
    if (!ratingElementImdb || document.querySelector(`span.rating-bar__base-button[${ratingSource}]`)) return null;

    function updateRatingElement(element, rating, voteCount) {
        let ratingElement = element.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score]");
        if (ratingElement) {
            ratingElement.querySelector("span").innerText = rating;
            ratingElement.nextSibling.nextSibling.innerText = voteCount;
        }
    }

    const clonedRatingBadge = ratingElementImdb.cloneNode(true);
    clonedRatingBadge.setAttribute(ratingSource, "");
    clonedRatingBadge.childNodes[0].innerText = ratingSource;

    // disable link per default
    const clonedAnchor = clonedRatingBadge.querySelector("a");
    clonedAnchor.removeAttribute("href");
    clonedAnchor.classList.add("disabled-anchor");

    if (ratingSource === "Metacritic" || ratingSource === "RottenTomatoes") {
        const criticRatingElement = clonedRatingBadge.querySelector(
            "div[data-testid=hero-rating-bar__aggregate-rating__score]"
        )?.parentElement;

        if (!criticRatingElement) {
            console.error("Critic rating element not found");
            return null;
        }

        // Critic rating: replace star svg element with critic rating by cloning the rating element
        const criticRating = criticRatingElement.cloneNode(true);
        criticRating.classList.add("critic-rating");
        criticRatingElement.classList.add("user-rating");

        //  critic rating
        updateRatingElement(criticRating, initialValue, initialValue);
        criticRating.title = "Critics Rating";
        criticRating.style.cssText = `
        background-color: rgba(255, 255, 255, 0.1);
        padding-left: 2px;
        padding-right: 2px;
        margin-right: 4px;
        border-radius: 5px;
        `;
        clonedRatingBadge.querySelector("a > span > div > div").outerHTML = criticRating.outerHTML;

        // user rating
        updateRatingElement(clonedRatingBadge.querySelector(".user-rating"), initialValue, initialValue);
        clonedRatingBadge.querySelector(".user-rating").title = "User Rating";
    } else {
        updateRatingElement(clonedRatingBadge, initialValue, initialValue);
        clonedRatingBadge.querySelector("a > span > div > div").remove();
    }

    // convert div to span element, otherwise it will be removed from IMDb scripts
    const ratingElement = document.createElement("span");
    // Transfer all attributes from the cloned div element to the new span element
    for (let attr of clonedRatingBadge.attributes) {
        ratingElement.setAttribute(attr.name, attr.value);
    }
    // transfer the content of the cloned IMDb rating element to the new span element
    ratingElement.innerHTML = clonedRatingBadge.innerHTML;

    ratingElement.querySelector("a").style.opacity = "0.4";

    ratingElementImdb.insertAdjacentElement("beforebegin", ratingElement);

    fitTitleToSingleLine();

    return ratingElement;
}

function addErrorBubble(badge, message) {
    if (badge.querySelector(".rating-badge-error")) return;
    const bubble = document.createElement("span");
    bubble.className = "rating-badge-error";
    bubble.textContent = "!";
    bubble.title = message || "Error";
    badge.appendChild(bubble);
}

function addWarningBubble(badge, message) {
    if (badge.querySelector(".rating-badge-warning")) return;
    const bubble = document.createElement("span");
    bubble.className = "rating-badge-warning";
    bubble.textContent = "!";
    bubble.title = message || "Warning";
    badge.appendChild(bubble);
}

function gmErrorHandlers(reject, label) {
    return {
        onerror:   () => { console.error(`${label}: Request Error.`);     reject("Request Error"); },
        onabort:   () => { console.error(`${label}: Request Aborted.`);   reject("Request Aborted"); },
        ontimeout: () => { console.error(`${label}: Request Timed Out.`); reject("Request Timed Out"); },
    };
}

const badgeSelectors = {
    url: "a",
    generalRating: "div[data-testid=hero-rating-bar__aggregate-rating__score] > span",
    generalVoteCount: "div[data-testid=hero-rating-bar__aggregate-rating__score] + * + *",
    criticRating: ".critic-rating div[data-testid=hero-rating-bar__aggregate-rating__score] > span",
    criticVoteCount: ".critic-rating div[data-testid=hero-rating-bar__aggregate-rating__score] + * + *",
    userRating: ".user-rating div[data-testid=hero-rating-bar__aggregate-rating__score] > span",
    userVoteCount: ".user-rating div[data-testid=hero-rating-bar__aggregate-rating__score] + * + *",
};

// update the rating template with actual data
function updateRatingBadge(newRatingBadge, ratingData) {
    if (!newRatingBadge || !ratingData) return;

    newRatingBadge.querySelector("a").style.opacity = "1";

    if (ratingData.error && !ratingData.source) {
        newRatingBadge.querySelectorAll(badgeSelectors.generalRating).forEach(el => el.textContent = undefinedValue);
        newRatingBadge.querySelectorAll(badgeSelectors.generalVoteCount).forEach(el => el.textContent = undefinedValue.toLowerCase());
        addErrorBubble(newRatingBadge, ratingData.error);
        return;
    }

    function updateElement(selector, value, isVoteCount = false) {
        const element = newRatingBadge.querySelector(selector);

        if (!isVoteCount) {
            element.textContent = value !== undefined && value !== 0 ? value : undefinedValue;
        } else {
            element.textContent = value !== undefined && value !== 0 ? value : undefinedValue.toLowerCase();
        }
    }

    const anchor = newRatingBadge.querySelector(badgeSelectors.url);
    anchor.href = ratingData.url;
    anchor.classList.remove("disabled-anchor");

    if (ratingData.criticRating !== undefined || ratingData.userRating !== undefined) {
        updateElement(badgeSelectors.criticRating, ratingData.criticRating);
        updateElement(badgeSelectors.userRating, ratingData.userRating);
        updateElement(badgeSelectors.criticVoteCount, ratingData.criticVoteCount, true);
        updateElement(badgeSelectors.userVoteCount, ratingData.userVoteCount, true);
    } else {
        updateElement(badgeSelectors.generalRating, ratingData.rating);
        updateElement(badgeSelectors.generalVoteCount, ratingData.voteCount, true);
    }

    if (ratingData.error) addErrorBubble(newRatingBadge, ratingData.error);

    fitTitleToSingleLine();
}

// reduce titles font size to avoid line breaks
function fitTitleToSingleLine() {
    const element = document.querySelector('h1[data-testid="hero__pageTitle"] > span');
    if (!element) return;
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);

    while (element.offsetHeight >= 58 && fontSize >= 26) {
        fontSize -= 1;
        element.style.fontSize = fontSize + "px";
    }
}

async function addRatingBadge(sourceKey, getData, fallbackUrl) {
    const configured = await GM_getValue(sourceKey, true);
    if (!configured) return;

    const newRatingBadge = createRatingBadge(sourceKey);
    if (!newRatingBadge) return;

    const warnTimer = setTimeout(
        () => addWarningBubble(newRatingBadge, "Taking longer than usual..."),
        5000
    );

    try {
        const ratingData = await getData();
        clearTimeout(warnTimer);
        newRatingBadge.querySelector(".rating-badge-warning")?.remove();
        const searchTitle = getOriginalTitle() ?? getMainTitle();
        updateRatingBadge(newRatingBadge, {
            ...ratingData,
            url: ratingData?.url ?? fallbackUrl(searchTitle),
        });
    } catch (e) {
        clearTimeout(warnTimer);
        newRatingBadge.querySelector(".rating-badge-warning")?.remove();
        updateRatingBadge(newRatingBadge, { error: String(e) });
    }
}

// -----------------------------------------------------------------------------------------------------
// TMDB
// -----------------------------------------------------------------------------------------------------

let tmdbDataPromise = null;
async function getTmdbData() {
    const configured = await GM_getValue("TMDB", true);
    if (!configured) return;

    if (tmdbDataPromise) return tmdbDataPromise;

    const options = {
        method: "GET",
        signal: AbortSignal.timeout(30000),
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
                return { source: "TMDB", rating: initialValue, voteCount: initialValue, url: null };
            }

            console.log("TMDB: ", result);
            return {
                source: "TMDB",
                rating: result.vote_average.toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                }),
                voteCount: result.vote_count?.toLocaleString(),
                url: `https://www.themoviedb.org/${result.media_type}/${result.id}`,
            };
        })
        .catch((error) => {
            console.error("Error fetching TMDb data:", error);
            return {
                source: "TMDB",
                rating: initialValue,
                voteCount: initialValue,
                url: null,
                error: error.message,
            };
        });

    return tmdbDataPromise;
}

function addTmdbRatingBadge() {
    return addRatingBadge("TMDB", getTmdbData, (t) => `https://www.themoviedb.org/search?query=${t}`);
}

// -----------------------------------------------------------------------------------------------------
// Douban
// -----------------------------------------------------------------------------------------------------

let doubanDataPromise = null;
async function getDoubanData() {
    const configured = await GM_getValue("Douban", true);
    if (!configured) return;

    if (doubanDataPromise) return doubanDataPromise;

    const fetchFromDouban = (url, method = "GET", data = null) =>
        new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method,
                url,
                data,
                timeout: TIMEOUT_GM_XMLHTTP_REQUEST,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=utf8",
                    "User-Agent": USER_AGENT,
                },
                onload: (response) => {
                    try {
                        if (response.status >= 200 && response.status < 400) {
                            resolve(JSON.parse(response.responseText));
                        } else {
                            console.error(`Error getting ${url}:`, response.status, response.statusText);
                            resolve(null);
                        }
                    } catch (e) {
                        console.error(`Parse error for ${url}:`, e);
                        reject("Parse error");
                    }
                },
                ...gmErrorHandlers(reject, `Douban (${url})`),
            });
        });

    const getDoubanInfo = async () => {
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

    doubanDataPromise = (async () => {
        try {
            const result = await getDoubanInfo();
            if (!result) {
                return { source: "Douban", rating: initialValue, voteCount: initialValue, url: null };
            }

            const ratingRaw = result.rating.average;
            const rating =
                !isNaN(ratingRaw) && ratingRaw !== ""
                    ? Number(ratingRaw).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    : 0;
            const voteCountRaw = result.rating.numRaters;
            const voteCount = !isNaN(voteCountRaw) && voteCountRaw !== 0 ? Number(voteCountRaw).toLocaleString() : 0;

            console.log("Douban: ", result);
            return {
                source: "Douban",
                rating,
                voteCount,
                url: result.url,
            };
        } catch (error) {
            console.error("Error fetching Douban data:", error);
            return {
                source: "Douban",
                rating: initialValue,
                voteCount: initialValue,
                url: null,
                error: error?.message ?? String(error),
            };
        }
    })();

    return doubanDataPromise;
}

function addDoubanRatingBadge() {
    return addRatingBadge("Douban", getDoubanData, (t) => `https://search.douban.com/movie/subject_search?search_text=${t}`);
}

// -----------------------------------------------------------------------------------------------------
// Wikidata (shared)
// -----------------------------------------------------------------------------------------------------

let wikidataPromise = null;
function getWikidataIds() {
    if (wikidataPromise) return wikidataPromise;

    // https://www.wikidata.org/w/api.php
    wikidataPromise = new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            timeout: TIMEOUT_GM_XMLHTTP_REQUEST,
            url: `https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=haswbstatement:P345=${imdbId}&format=json&srnamespace=0`,
            onload: function (response) {
                try {
                    if (response.status < 200 || response.status >= 300) {
                        console.error(`getWikidataIds: HTTP ${response.status}`);
                        reject(`HTTP Error ${response.status}`);
                        return;
                    }
                    const entityId = JSON.parse(response.responseText).query?.search?.[0]?.title;
                    if (!entityId) {
                        resolve({ metacriticId: "", rottenTomatoesId: "", myAnimeListId: "" });
                        return;
                    }
                    GM_xmlhttpRequest({
                        method: "GET",
                        timeout: TIMEOUT_GM_XMLHTTP_REQUEST,
                        url: `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims&format=json`,
                        onload: function (r2) {
                            try {
                                if (r2.status < 200 || r2.status >= 300) {
                                    console.error(`getWikidataIds: HTTP ${r2.status}`);
                                    reject(`HTTP Error ${r2.status}`);
                                    return;
                                }
                                const claims = JSON.parse(r2.responseText).entities?.[entityId]?.claims || {};
                                resolve({
                                    metacriticId: claims.P1712?.[0]?.mainsnak?.datavalue?.value ?? "",
                                    rottenTomatoesId: claims.P1258?.[0]?.mainsnak?.datavalue?.value ?? "",
                                    myAnimeListId: claims.P4086?.[0]?.mainsnak?.datavalue?.value ?? "",
                                });
                            } catch (e) {
                                console.error("getWikidataIds: Parse error.", e);
                                reject("Parse error");
                            }
                        },
                        ...gmErrorHandlers(reject, "Wikidata"),
                    });
                } catch (e) {
                    console.error("getWikidataIds: Parse error.", e);
                    reject("Parse error");
                }
            },
            ...gmErrorHandlers(reject, "Wikidata"),
        });
    });

    return wikidataPromise;
}

// -----------------------------------------------------------------------------------------------------
// Metacritic
// -----------------------------------------------------------------------------------------------------
// wikidata solution inspired by IMDb Scout Mod

let metacriticDataPromise = null;
async function getMetacriticData() {
    const configured = await GM_getValue("Metacritic", true);
    if (!configured) return;

    if (metacriticDataPromise) return metacriticDataPromise;

    function fetchMetacriticData(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                timeout: TIMEOUT_GM_XMLHTTP_REQUEST,
                headers: { "User-Agent": USER_AGENT },
                onload: function (response) {
                    try {
                        const parser = new DOMParser();
                        const result = parser.parseFromString(response.responseText, "text/html");

                        const parseRating = (ratingElement, voteSelector, divideByTen = false) => {
                            if (!ratingElement) return { rating: 0, voteCount: 0 };

                            let ratingText = ratingElement.textContent.trim();
                            let rating = !isNaN(ratingText) ? Number(ratingText) : 0;

                            if (divideByTen) {
                                rating = rating / 10;
                            }

                            // no fractions for 10 and 0
                            if (rating !== 10 && rating !== 0) {
                                rating = rating.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                            }

                            const voteCountText = result.querySelector(voteSelector)?.textContent;
                            const voteCount = voteCountText
                                ? Number(voteCountText.match(/\d{1,3}(?:,\d{3})*/)[0].replace(/,/g, "")).toLocaleString()
                                : 0;

                            if (voteCount === 0) return { rating: 0, voteCount: 0 };

                            return { rating, voteCount };
                        };

                        const criticRatingElement = result.querySelector(
                            'div[data-testid="global-score-wrapper"]:has(a[href*="critic-reviews"]) span[data-testid="global-score-value"]'
                        );
                        const { rating: criticRating, voteCount: criticVoteCount } = parseRating(
                            criticRatingElement,
                            'a[data-testid="global-score-review-count-link"][href*="critic-reviews"]',
                            true
                        );

                        const userRatingElement = result.querySelector(
                            'div[data-testid="global-score-wrapper"]:has(a[href*="user-reviews"]) span[data-testid="global-score-value"]'
                        );
                        const { rating: userRating, voteCount: userVoteCount } = parseRating(
                            userRatingElement,
                            'a[data-testid="global-score-review-count-link"][href*="user-reviews"]',
                            false
                        );

                        console.log(
                            `Critic rating: ${criticRating}, User rating: ${userRating}, Critic vote count: ${criticVoteCount}, User vote count: ${userVoteCount}, URL: ${url}`
                        );

                        resolve({
                            source: "Metacritic",
                            criticRating,
                            userRating,
                            criticVoteCount,
                            userVoteCount,
                            url,
                        });
                    } catch (e) {
                        console.error("getMetacriticRatings: Parse error.", e);
                        reject("Parse error");
                    }
                },

                ...gmErrorHandlers(reject, "Metacritic"),
            });
        });
    }

    metacriticDataPromise = (async () => {
        const { metacriticId } = await getWikidataIds();
        const url = encodeURI(`https://www.metacritic.com/${metacriticId}`);

        if (metacriticId !== "") {
            return fetchMetacriticData(url);
        } else {
            return {
                source: "Metacritic",
                criticRating: initialValue,
                userRating: initialValue,
                criticVoteCount: initialValue,
                userVoteCount: initialValue,
                url: null,
            };
        }
    })();

    return metacriticDataPromise;
}

function addMetacriticRatingBadge() {
    return addRatingBadge("Metacritic", getMetacriticData, (t) => `https://www.metacritic.com/search/${t}`);
}

// -----------------------------------------------------------------------------------------------------
// Rotten Tomatoes
// -----------------------------------------------------------------------------------------------------
// wikidata solution inspired by IMDb Scout Mod

let rottenTomatoesDataPromise = null;
async function getRottenTomatoesData() {
    const configured = await GM_getValue("RottenTomatoes", true);
    if (!configured) return;

    if (rottenTomatoesDataPromise) return rottenTomatoesDataPromise;

    function fetchRottenTomatoesData(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                timeout: TIMEOUT_GM_XMLHTTP_REQUEST,
                headers: { "User-Agent": USER_AGENT },
                onload: function (response) {
                    try {
                        const parser = new DOMParser();
                        const result = parser.parseFromString(response.responseText, "text/html");

                        const ratingDataElement = result.getElementById("media-scorecard-json");
                        const ratingData = JSON.parse(ratingDataElement.textContent);

                        const formatRating = (rawRating) => {
                            const rating = !isNaN(rawRating) ? Number(rawRating) / 10 : 0;
                            // no fractions for 10 and 0
                            return rating === 10 || rating === 0
                                ? rating
                                : rating.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                        };

                        const formatVoteCount = (rawCount) => {
                            if (!rawCount) return 0;
                            const formattedCount = Number(String(rawCount).replace(/[^\d]/g, "")).toLocaleString();
                            return String(rawCount).includes("+") ? `${formattedCount}+` : formattedCount;
                        };

                        const criticRating = formatRating(ratingData.criticsScore.score);
                        const userRating = formatRating(ratingData.audienceScore.score);
                        const criticVoteCount = criticRating !== 0 ? formatVoteCount(ratingData.criticsScore.ratingCount) : 0;
                        const userVoteCount = userRating !== 0 ? formatVoteCount(ratingData.audienceScore.bandedRatingCount) : 0;

                        console.log(`Critic rating: ${criticRating}, User rating: ${userRating}, criticVoteCount: ${criticVoteCount}, userVoteCount: ${userVoteCount}, Url: ${url}`);

                        resolve({
                            source: "RottenTomatoes",
                            criticRating,
                            userRating,
                            criticVoteCount,
                            userVoteCount,
                            url,
                        });
                    } catch (e) {
                        console.error("getRottenTomatoesRatings: Parse error.", e);
                        reject("Parse error");
                    }
                },
                ...gmErrorHandlers(reject, "RottenTomatoes"),
            });
        });
    }

    rottenTomatoesDataPromise = (async () => {
        const { rottenTomatoesId } = await getWikidataIds();
        const url = encodeURI(`https://www.rottentomatoes.com/${rottenTomatoesId}`);

        if (rottenTomatoesId !== "") {
            return fetchRottenTomatoesData(url);
        } else {
            return {
                source: "RottenTomatoes",
                criticRating: initialValue,
                userRating: initialValue,
                criticVoteCount: initialValue,
                userVoteCount: initialValue,
                url: null,
            };
        }
    })();

    return rottenTomatoesDataPromise;
}

function addRottenTomatoesRatingBadge() {
    return addRatingBadge("RottenTomatoes", getRottenTomatoesData, (t) => `https://www.rottentomatoes.com/search?search=${t}`);
}

// -----------------------------------------------------------------------------------------------------
// MyAnimeList
// -----------------------------------------------------------------------------------------------------
// wikidata solution inspired by IMDb Scout Mod

let myAnimeListDataByImdbIdPromise = null;
async function getMyAnimeListDataByImdbId() {
    // to execute only once
    if (myAnimeListDataByImdbIdPromise) return myAnimeListDataByImdbIdPromise;

    // only if genre is anime
    const genreAnime = document.querySelector(".ipc-chip-list__scroller")?.textContent.includes("Anime");
    if (!genreAnime) return null;

    // only if enabled in settings
    const configured = await GM_getValue("MyAnimeList", true);
    if (!configured) return null;

    function fetchMyAnimeListData(myAnimeListId) {
        return new Promise((resolve, reject) => {
            const url = "https://api.jikan.moe/v4/anime/" + myAnimeListId;
            GM_xmlhttpRequest({
                method: "GET",
                timeout: TIMEOUT_GM_XMLHTTP_REQUEST,
                url: url,
                headers: { "User-Agent": USER_AGENT },
                onload: function (response) {
                    try {
                        if (response.status !== 200) {
                            console.error("MyAnimeList: HTTP Error: " + response.status);
                            reject("HTTP Error " + response.status);
                            return;
                        }
                        const result = JSON.parse(response.responseText);
                        const rating = result.data.score;
                        if (!isNaN(rating) && rating > 0) {
                            console.log("getMyAnimeListDataByImdbId: ", result.data.mal_id, result);
                            resolve({
                                source: "MyAnimeList",
                                rating: Number(rating).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                                voteCount: result.data.scored_by?.toLocaleString(),
                                url: result.data.url,
                            });
                        } else {
                            reject("Invalid rating");
                        }
                    } catch (e) {
                        console.error("MyAnimeList: Parse error.", e);
                        reject("Parse error");
                    }
                },
                ...gmErrorHandlers(reject, "MyAnimeList"),
            });
        });
    }

    myAnimeListDataByImdbIdPromise = (async () => {
        const { myAnimeListId } = await getWikidataIds();

        if (myAnimeListId !== "") {
            return fetchMyAnimeListData(myAnimeListId);
        } else {
            return null;
        }
    })();

    return myAnimeListDataByImdbIdPromise;
}

function normalizeSearchString(string) {
    return string
        .replace(/Ô/g, "oo")
        .replace(/ô/g, "ou")
        .toLowerCase()
        .replace(/û/g, "uu")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function fetchWithRetry(url, retries = 0) {
    const maxRetries = 3;
    const retryDelay = 1000;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (response.status === 429) {
            if (retries < maxRetries) {
                console.log(`Rate limited. Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                return fetchWithRetry(url, retries + 1);
            } else {
                throw new Error("Max retries reached. Please try again later.");
            }
        }
        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

let myAnimeListDataByTitlePromise = null;
async function getMyAnimeListDataByTitle() {
    // to execute only once
    if (myAnimeListDataByTitlePromise) return myAnimeListDataByTitlePromise;

    const titleElement = getTitleElement();
    if (!titleElement) return null;

    // only if genre is anime
    const genreAnime = document.querySelector(".ipc-chip-list__scroller")?.textContent.includes("Anime");
    if (!genreAnime) return null;

    const mainTitle = getMainTitle();
    const originalTitle = getOriginalTitle();

    // get the year of release
    const metaData = titleElement?.parentElement?.querySelector("ul");
    const metaItems = metaData?.querySelectorAll("li");
    // If the text content type is an integer, it is a tv show, otherwise it is a movie.
    const type = isNaN(metaItems?.[0]?.textContent) ? "tv" : "movie";
    const yearIndex = type === "tv" ? 1 : 0;
    const yearText = metaItems?.[yearIndex]?.textContent;
    // Extract the first number up to the non-number sign and convert it into a integer (2018-2020)
    const year = parseInt(yearText);

    async function fetchAllPages(searchTitle) {
        let currentPage = 1;
        let allResults = [];

        while (true) {
            try {
                const response = await fetchWithRetry(
                    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTitle)}&type=${type}&page=${currentPage}`
                );
                const data = await response.json();
                allResults = allResults.concat(data.data);
                if (!data.pagination.has_next_page) break;
                currentPage++;
            } catch (error) {
                console.error("Error fetching data:", error);
                break;
            }
        }

        const normalizedSearchTitle = normalizeSearchString(searchTitle);
        const result = allResults.find((anime, index) => {
            const normalizedAnimeTitle = normalizeSearchString(anime.title);
            console.log(`Normalized Search Title: "${normalizedSearchTitle}"`);
            console.log(`Normalized Anime Title: "${normalizedAnimeTitle}"`);

            const titleMatch = normalizedAnimeTitle.includes(normalizedSearchTitle);
            const yearMatch = anime.aired?.prop?.from?.year === year;
            if (titleMatch && yearMatch) {
                console.log(`✅ Title and year match for "${anime.title}"`);
                return true;
            }

            if (!titleMatch && anime.title_english) {
                const normalizedEnglishTitle = normalizeSearchString(anime.title_english);
                const englishTitleMatch = normalizedEnglishTitle.includes(normalizedSearchTitle);
                console.log(`✅ English title match for "${anime.title_english}": ${englishTitleMatch}`);

                if (englishTitleMatch && yearMatch) {
                    console.log(`🎉 English title and year match for "${anime.title_english}"`);
                    return true;
                }
            }

            if (!titleMatch && anime.title_synonyms && anime.title_synonyms.length > 0) {
                console.log(`Checking synonyms for anime[${index}] - ${anime.title}, Synonyms: ${anime.title_synonyms}`);

                const synonymMatch = anime.title_synonyms.some((synonym) =>
                    normalizeSearchString(synonym).includes(normalizedSearchTitle)
                );

                console.log(`✅ Synonym match for anime[${index}] - ${anime.title}: ${synonymMatch}`);

                if (synonymMatch && yearMatch) {
                    console.log(`🎉 Synonym and year match for "${anime.title}"`);
                    return true;
                }
            }
            console.log(`❌ No match found for "${anime.title}"`);

            return false;
        });
        return result;
    }

    async function getAnimeData() {
        try {
            let result = await fetchAllPages(mainTitle);

            if (!result && originalTitle) {
                console.log(
                    `getMyAnimeListDataByTitle: No results found for "${mainTitle}", retrying with originalTitle "${originalTitle}"`
                );
                result = await fetchAllPages(originalTitle);
            }

            if (result) {
                console.log("getMyAnimeListDataByTitle: ", result);
                return result;
            } else {
                console.log("No results found for either title.");
                return null;
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
            return null;
        }
    }

    myAnimeListDataByTitlePromise = (async () => {
        const anime = await getAnimeData();

        if (anime?.score > 0) {
            return {
                source: "MyAnimeList",
                rating: Number(anime.score).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                voteCount: anime.scored_by?.toLocaleString(),
                url: anime.url,
            };
        } else {
            console.log("No anime data found.");
            return {
                source: "MyAnimeList",
                rating: initialValue,
                voteCount: initialValue,
                url: null,
            };
        }
    })();

    return myAnimeListDataByTitlePromise;
}

async function addMyAnimeListRatingBadge() {
    const genreAnime = document.querySelector(".ipc-chip-list__scroller")?.textContent.includes("Anime");
    if (!genreAnime) return;

    async function getMyAnimeListData() {
        let data = null;
        try {
            data = await getMyAnimeListDataByImdbId();
        } catch (e) {
            console.error("MyAnimeList ID lookup failed, falling back to title search:", e);
        }
        return data ?? await getMyAnimeListDataByTitle();
    }

    return addRatingBadge("MyAnimeList", getMyAnimeListData, (t) => `https://myanimelist.net/anime.php?q=${t}`);
}

// -----------------------------------------------------------------------------------------------------

let metadataAsText = "";
function collectMetadataForClipboard() {
    const title = document.querySelector("span.hero__primary-text")?.textContent;
    const genres = document.querySelector("div[data-testid='interests'] div.ipc-chip-list__scroller")?.childNodes;
    const additionalMetadataRuntime = document
        .querySelector('[data-testid="hero__pageTitle"]')
        ?.parentElement?.querySelector("ul li:last-of-type");
    const additionalMetadata = document.querySelector('[data-testid="hero__pageTitle"]')?.parentElement?.querySelectorAll("ul > li");

    // if click listener does not exist
    if (!document.querySelector(".collectMetadataForClipboardListener") && title) {
        if (genres && additionalMetadata && additionalMetadataRuntime) {
            if (metadataAsText === "") {
                // add title
                metadataAsText += title + " | ";
                // collect additional metadata
                for (let element of additionalMetadata) metadataAsText += element.textContent + " | ";
                // collect genres
                let iteration = genres?.length;
                for (let genre of genres) {
                    metadataAsText += genre.textContent;

                    // append "," as long as not last iteration
                    if (--iteration) metadataAsText += ", ";
                }
            }

            additionalMetadataRuntime.style.cursor = "pointer";
            additionalMetadataRuntime.addEventListener("click", function () {
                navigator.clipboard.writeText(metadataAsText);
            });

            // to know if click listener is still there
            additionalMetadataRuntime.classList.add("collectMetadataForClipboardListener");
        }
    }
}

// Configuration Modal
function configurationMenu() {
    if (!document.getElementById("modal-css-style")) {
        GM_addStyle(`
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6) !important;
        z-index: 9998;
        transition: background-color 0.5s ease;
    }
    
    .modal {
        font-family: var(--ipt-font-family);
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    .modal-title {
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: bold;
    }
    
    .checkbox-label {
        display: block;
        margin-bottom: 10px;
    }
    
    .close-button {
        display: block;
        margin: 20px auto 0;
    }
    `).setAttribute("id", "modal-css-style");
    }

    // Darken background
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0)";
    setTimeout(() => {
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }, 50);

    // Create modal
    const modal = document.createElement("div");
    modal.className = "modal";
    setTimeout(() => {
        modal.style.opacity = "1";
    }, 50);

    // Title of the modal
    const title = document.createElement("h3");
    title.innerText = "Which ratings should be displayed?";
    title.className = "modal-title";
    modal.appendChild(title);

    // Add checkboxes
    ratingSourceOptions.forEach((ratingSource) => {
        const sourceKey = ratingSource.replace(/\s/g, "");
        const label = document.createElement("label");
        label.className = "checkbox-label";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = GM_getValue(sourceKey, true);

        checkbox.addEventListener("change", () => {
            GM_setValue(sourceKey, checkbox.checked);
            if (!checkbox.checked) {
                document.querySelector(`span.rating-bar__base-button[${sourceKey}]`)?.remove();
            } else {
                // trigger observer to add new badges
                const tempElement = document.createElement("div");
                document.body.appendChild(tempElement);
                document.body.removeChild(tempElement);
            }
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${ratingSource}`));
        modal.appendChild(label);
    });

    // Add button to close
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.className =
        "close-button ipc-btn ipc-btn--half-padding ipc-btn--default-height ipc-btn--core-accent1 ipc-btn--theme-baseAlt ";

    const closeModal = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    };

    closeButton.addEventListener("click", closeModal);
    modal.appendChild(closeButton);

    // Add modal and overlay to the DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Close modal on click outside
    overlay.addEventListener("click", closeModal);
}

function isVideoGame(element) {
    const text = element.textContent;
    return (
        text.toLowerCase().includes("game") ||
        text.includes("Jeu vidéo") ||
        text.includes("Videospiel") ||
        text.includes("Videogioco") ||
        text.includes("Videojuego") ||
        text.includes("वीडियो गेम")
    );
}

// add and keep elements in header container
async function main() {
    // ignore episode view
    if (!document.title.includes('"')) {
        addCss();

        const observer = new MutationObserver(async () => {
            // ignore video games
            const metadataFirstElement = document
                .querySelector('[data-testid="hero__pageTitle"]')
                ?.parentElement?.querySelector("ul > li");
            if (metadataFirstElement && !isVideoGame(metadataFirstElement)) {
                // make sure CSS is not removed from DOM
                addCss();
                await Promise.all([
                    addMyAnimeListRatingBadge(),
                    addRottenTomatoesRatingBadge(),
                    addMetacriticRatingBadge(),
                    addDoubanRatingBadge(),
                    addTmdbRatingBadge(),
                ]).catch(e => console.error("Badge loading error:", e));

                collectMetadataForClipboard();
            }
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
}

// -----------------------------------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------------------------------

main();
// GM_setValue("authorsMode", true);
