// ==UserScript==
// @name           IMDb with additional ratings
// @description    Adds additional ratings (TMDB, Douban, Metacritic, MyAnimeList). These can be deactivated individually in the configuration menu. And movie info can be copied by clicking unlinked elements below the title.
// @version        20240914
// @author         mykarean
// @icon           https://icons.duckduckgo.com/ip2/imdb.com.ico
// @match          https://*.imdb.com/title/*
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest
// @grant          GM_registerMenuCommand
// @run-at         document-start
// @compatible     chrome
// @license        GPL3
// ==/UserScript==

"use strict";

// -----------------------------------------------------------------------------------------------------
// Config/Requirements
// -----------------------------------------------------------------------------------------------------

GM_registerMenuCommand("Configuration", openConfiguration, "c");

const ratingSources = ["TMDB", "Douban", "Metacritic", "MyAnimeList"];
const imdbId = window.location.pathname.match(/title\/(tt\d+)\//)[1];
const USER_AGENT = "Mozilla/5.0 (x64; rv) Gecko Firefox";
const undefinedValue = "X";
let local;

function getTitleElement() {
    return document.querySelector('[data-testid="hero__pageTitle"]');
}
function getMainTitle() {
    return getTitleElement()?.textContent;
}
function getOriginalTitle() {
    let originalTitle = document.querySelector('[data-testid="hero__pageTitle"] ~ div')?.textContent?.match(/^.*:\ (.*)/)?.[1];
    // Unicode normalisation and removal of diacritical characters to improve search on other pages
    return originalTitle?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// -----------------------------------------------------------------------------------------------------
// General Functions
// -----------------------------------------------------------------------------------------------------

function addCss() {
    if (!document.getElementById("custom-css-style")) {
        GM_addStyle(`
            /* all Badges */
            [data-testid="hero-rating-bar__aggregate-rating"],
            .rating-bar__base-button > .ipc-btn {
                padding: 4px 3px;
                border-radius: 5px !important;
            }
            .rating-bar__base-button {
                margin-right: 0 !important;
            }

            /* added Badges */
            span[data-testid=hero-rating-bar__aggregate-rating] {
                margin: 0 3px;
                background-color: rgba(255, 255, 255, 0.08);
            }
            /* format rating content */
            span[data-testid=hero-rating-bar__aggregate-rating] .ipc-btn__text > div > div {
                 align-items: center;
            }
            /* remove /10 */
            span[data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] > span:nth-child(2) {
                display: none;
            }
            span[data-testid=hero-rating-bar__aggregate-rating] div[data-testid=hero-rating-bar__aggregate-rating__score] > span:nth-child(1) {
                padding-right: 0;
            }

            /* IMDb Badge */
            div[data-testid=hero-rating-bar__aggregate-rating] {
                /* margin-left: 6px; */
            }

            /* Badge Header */
            .rating-bar__base-button > div {
                letter-spacing: unset;
            }
            span.rating-bar__base-button[myanimelist] > div {
                letter-spacing: normal;
            }
            
            /* for badges without rating data */
            .disable-anchor {
                cursor: default !important;
            }
            .disable-anchor:before {
                background: unset !important;
            }
        `).setAttribute("id", "custom-css-style");
    }
    const imdbRatingName = document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"] > div');
    if (imdbRatingName) {
        imdbRatingName.textContent = "IMDb";
    }
}

// create the initial rating template
function createRatingBadgeTemplate(ratingSource) {
    const ratingElementImdb = document.querySelector('div[data-testid="hero-rating-bar__aggregate-rating"]');

    // ignore if the rating badge has already been created
    if (!ratingElementImdb || document.querySelector(`span.rating-bar__base-button[${ratingSource}]`)) return null;

    let clonedRatingBadge = ratingElementImdb.cloneNode(true);
    clonedRatingBadge.setAttribute(ratingSource, "");
    clonedRatingBadge.childNodes[0].innerText = ratingSource;

    // disable link per default
    clonedRatingBadge.querySelector("a").removeAttribute("href");
    // clonedRatingBadge.querySelector("a").classList.add("disable-anchor");

    const updateRatingElement = (element, rating, voteCount) => {
        let imdbRatingElement = element.querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score]");
        if (imdbRatingElement) {
            imdbRatingElement.querySelector("span").innerText = rating;
            imdbRatingElement.nextSibling.nextSibling.innerText = voteCount;
        }
    };

    if (ratingSource === "Metacritic") {
        const criticRatingElement = clonedRatingBadge.querySelector(
            "div[data-testid=hero-rating-bar__aggregate-rating__score]"
        )?.parentElement;

        if (!criticRatingElement) {
            console.error("Critic rating element not found");
            return;
        }

        // Critic rating: replace star svg element with critic rating by cloning the rating element
        let criticRating = clonedRatingBadge
            .querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score]")
            .parentElement.cloneNode(true);
        criticRating.classList.add("critic-rating");
        clonedRatingBadge
            .querySelector("div[data-testid=hero-rating-bar__aggregate-rating__score]")
            .parentElement.classList.add("user-rating");

        //  critic rating
        updateRatingElement(criticRating, undefinedValue, undefinedValue.toLowerCase());
        criticRating.title = "Metascore";
        criticRating.style.cssText = `
        background-color: rgba(255, 255, 255, 0.1);
        padding-left: 4px;
        padding-right: 2px;
        margin-right: 4px;
        border-radius: 5px;
        `;
        clonedRatingBadge.querySelector("a > span > div > div").outerHTML = criticRating.outerHTML;

        // user rating
        updateRatingElement(clonedRatingBadge.querySelector(".user-rating"), undefinedValue, undefinedValue.toLowerCase());
        clonedRatingBadge.querySelector(".user-rating").title = "User Score";
        clonedRatingBadge.querySelector(".user-rating").style.paddingRight = "0";
    } else {
        updateRatingElement(clonedRatingBadge, undefinedValue, undefinedValue.toLowerCase());
        clonedRatingBadge.querySelector("a > span > div > div").remove();
        clonedRatingBadge.querySelector(".ipc-btn__text > div > div").style.paddingRight = "0";
    }

    // convert div to span element, otherwise it will be removed from IMDb scripts
    const ratingElement = document.createElement("span");
    // Transfer all attributes from the cloned div element to the new span element
    for (let attr of clonedRatingBadge.attributes) {
        ratingElement.setAttribute(attr.name, attr.value);
    }
    // transfer the content of the cloned IMDb rating element to the new span element
    ratingElement.innerHTML = clonedRatingBadge.innerHTML;

    ratingElementImdb.insertAdjacentElement("beforebegin", ratingElement);
    return ratingElement;
}

// update the rating template with actual data
function updateRatingTemplate(newRatingBadge, ratingData) {
    if (!newRatingBadge || !ratingData) return;

    const selectors = {
        url: "a",
        generalRating: "div[data-testid=hero-rating-bar__aggregate-rating__score] > span",
        generalVoteCount: "div[data-testid=hero-rating-bar__aggregate-rating__score] + * + *",
        criticRating: ".critic-rating div[data-testid=hero-rating-bar__aggregate-rating__score] > span",
        criticVoteCount: ".critic-rating div[data-testid=hero-rating-bar__aggregate-rating__score] + * + *",
        userRating: ".user-rating div[data-testid=hero-rating-bar__aggregate-rating__score] > span",
        userVoteCount: ".user-rating div[data-testid=hero-rating-bar__aggregate-rating__score] + * + *",
    };

    function updateElement(selector, value, voteCount = 0) {
        const element = newRatingBadge.querySelector(selector);

        if (!voteCount) {
            element.textContent = value !== undefined && value !== 0 ? value : undefinedValue;
        } else {
            element.textContent = value !== undefined && value !== 0 ? value : undefinedValue.toLowerCase();
        }
    }

    newRatingBadge.querySelector(selectors.url).href = ratingData.url;
    // newRatingBadge.querySelector(selectors.url).classList.remove("disable-anchor");

    if (ratingData.source === "Metacritic") {
        updateElement(selectors.criticRating, ratingData.criticRating);
        updateElement(selectors.userRating, ratingData.userRating);
        updateElement(selectors.criticVoteCount, ratingData.criticVoteCount, 1);
        updateElement(selectors.userVoteCount, ratingData.userVoteCount, 1);
    } else {
        updateElement(selectors.generalRating, ratingData.rating);
        updateElement(selectors.generalVoteCount, ratingData.voteCount, 1);
    }
}

// -----------------------------------------------------------------------------------------------------
// TMDB
// -----------------------------------------------------------------------------------------------------

let tmdbDataPromise = null;
async function getTmdbData() {
    const configured = await GM_getValue("TMDB", false);
    if (!configured) return;

    if (tmdbDataPromise) return tmdbDataPromise;

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
                rating: (Math.round(result.vote_average * 10) / 10).toLocaleString(local, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                }),
                voteCount: result.vote_count?.toLocaleString(local),
                url: `https://www.themoviedb.org/${result.media_type}/${result.id}`,
            };
        })
        .catch((error) => {
            console.error("Error fetching TMDb data:", error);
            return 0;
        });

    return tmdbDataPromise;
}

async function addTmdbRatingBadge() {
    const configured = await GM_getValue("TMDB", false);
    if (!configured) return;

    const newRatingBadge = createRatingBadgeTemplate("TMDB");

    // if the template for the rating badge was not created, it already exists
    if (!newRatingBadge) return;

    const ratingData = await getTmdbData();

    // Copy ratingData to avoid modifying the original object
    let finalRatingData = { ...ratingData };

    // Check if ratingData or ratingData.url is undefined and provide a default value
    if (!ratingData?.url) {
        const searchTitle = getOriginalTitle() ?? getMainTitle();
        const defaultUrl = `https://www.themoviedb.org/search?query=${searchTitle}`;
        finalRatingData.url = defaultUrl;
    }

    updateRatingTemplate(newRatingBadge, finalRatingData);
}

// -----------------------------------------------------------------------------------------------------
// Douban
// -----------------------------------------------------------------------------------------------------

let doubanDataPromise = null;
async function getDoubanData() {
    const configured = await GM_getValue("Douban", false);
    if (!configured) return;

    if (doubanDataPromise) return doubanDataPromise;

    if (!imdbId) {
        throw new Error("IMDb ID not found in URL.");
    }

    const fetchFromDouban = (url, method = "GET", data = null) =>
        new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
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
                    console.error(`Error during GM.xmlHttpRequest to ${url}:`, error.statusText);
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
            if (!result) {
                throw new Error("No data found for the provided IMDb ID.");
            }

            console.log("Douban: ", result);
            return {
                source: "Douban",
                id: result.id,
                rating: Number(result.rating.average).toLocaleString(local, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                voteCount: result.rating.numRaters?.toLocaleString(local),
                url: result.url,
            };
        } catch (error) {
            console.error("Error fetching Douban data:", error);
            return 0;
        }
    })();

    return doubanDataPromise;
}

async function addDoubanRatingBadge() {
    const configured = await GM_getValue("Douban", false);
    if (!configured) return;

    const newRatingBadge = createRatingBadgeTemplate("Douban");

    // if the template for the rating badge was not created, it already exists
    if (!newRatingBadge) return;

    const ratingData = await getDoubanData();

    // Copy ratingData to avoid modifying the original object
    let finalRatingData = { ...ratingData };

    // Check if ratingData or ratingData.url is undefined and provide a default value
    if (!ratingData?.url) {
        const searchTitle = getOriginalTitle() ?? getMainTitle();
        const defaultUrl = `https://search.douban.com/movie/subject_search?search_text=${searchTitle}`;
        finalRatingData.url = defaultUrl;
    }

    updateRatingTemplate(newRatingBadge, finalRatingData);
}

// -----------------------------------------------------------------------------------------------------
// Metacritic
// -----------------------------------------------------------------------------------------------------
// wikidata solution inspired by IMDb Scout Mod

let metacriticDataPromise = null;
async function getMetacriticData() {
    const configured = await GM_getValue("Metacritic", false);
    if (!configured) return;

    if (metacriticDataPromise) return metacriticDataPromise;

    if (!imdbId) {
        throw new Error("IMDb ID not found in URL.");
    }

    async function getMetacriticId() {
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                method: "GET",
                timeout: 10000,
                headers: { "User-Agent": USER_AGENT },
                url: `https://query.wikidata.org/sparql?format=json&query=SELECT * WHERE {?s wdt:P345 "${imdbId}". OPTIONAL { ?s wdt:P1712 ?Metacritic_ID. }}`,
                onload: function (response) {
                    const result = JSON.parse(response.responseText);
                    const bindings = result.results.bindings[0];
                    const metacriticId = bindings && bindings.Metacritic_ID ? bindings.Metacritic_ID.value : "";
                    resolve(metacriticId);
                },
                onerror: function () {
                    console.error("getMetacriticId: Request Error.");
                    reject("Request Error");
                },
                onabort: function () {
                    console.error("getMetacriticId: Request Aborted.");
                    reject("Request Abort");
                },
                ontimeout: function () {
                    console.error("getMetacriticId: Request Timeout.");
                    reject("Request Timeout");
                },
            });
        });
    }

    function fetchMetacriticData(url) {
        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: "GET",
                url: url,
                headers: { "User-Agent": USER_AGENT },
                onload: function (response) {
                    const parser = new DOMParser();
                    const result = parser.parseFromString(response.responseText, "text/html");

                    let criticRating;
                    let userRating;
                    let criticVoteCount;
                    let userVoteCount;

                    const criticRatingElement = result.querySelector(".c-siteReviewScore");
                    if (criticRatingElement) {
                        const ratingText = criticRatingElement.textContent.trim();
                        criticRating = ratingText.includes(".") ? "" : !isNaN(ratingText) ? ratingText : 0;

                        if (criticRating !== 0) {
                            let criticVoteCountText = result
                                .querySelector(".c-siteReviewScore")
                                .parentElement.parentElement.parentElement.querySelector("a > span")?.textContent;
                            criticVoteCount = criticVoteCountText.match(/\d+/)[0];
                        } else {
                            criticVoteCount = 0;
                        }
                    }

                    const userRatingElement = result.querySelector(".c-siteReviewScore_user");
                    if (userRatingElement) {
                        const ratingText = userRatingElement.textContent.trim();
                        userRating = Number(ratingText).toLocaleString(local, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

                        // if (!isNaN(ratingText)) userRating = ratingText * 10;

                        if (userRating !== 0) {
                            let userVoteCountText = result
                                .querySelector(".c-siteReviewScore_user")
                                .parentElement.parentElement.parentElement.querySelector("a > span")?.textContent;
                            userVoteCount = userVoteCountText.match(/\d+/)[0];
                        } else {
                            userVoteCount = 0;
                        }
                    }

                    console.log(
                        "Critic rating: " +
                            criticRating +
                            ", User rating: " +
                            userRating +
                            ", Url: " +
                            url +
                            ", criticVoteCount: " +
                            criticVoteCount +
                            ", userVoteCount: " +
                            userVoteCount
                    );

                    // Resolve the promise with the ratings and URL
                    resolve({
                        source: "Metacritic",
                        criticRating: criticRating,
                        userRating: userRating,
                        criticVoteCount: criticVoteCount,
                        userVoteCount: userVoteCount,
                        url: url,
                    });
                },
                onerror: function () {
                    console.log("getMetacriticRatings: Request Error.");
                    reject("Request Error");
                },
                onabort: function () {
                    console.log("getMetacriticRatings: Request is aborted.");
                    reject("Request Aborted");
                },
                ontimeout: function () {
                    console.log("getMetacriticRatings: Request timed out.");
                    reject("Request Timed Out");
                },
            });
        });
    }

    metacriticDataPromise = (async () => {
        const metacriticId = await getMetacriticId();
        const url = encodeURI(`https://www.metacritic.com/${metacriticId}`);

        if (metacriticId !== "") {
            return fetchMetacriticData(url);
        }
    })();

    return 0;
}

async function addMetacriticRatingBadge() {
    const configured = await GM_getValue("Metacritic", false);
    if (!configured) return;

    const newRatingBadge = createRatingBadgeTemplate("Metacritic");

    // if the template for the rating badge was not created, it already exists
    if (!newRatingBadge) return;

    const ratingData = await getMetacriticData();

    // Copy ratingData to avoid modifying the original object
    let finalRatingData = { ...ratingData };

    // Check if ratingData or ratingData.url is undefined and provide a default value
    if (!ratingData?.url) {
        const searchTitle = getOriginalTitle() ?? getMainTitle();
        const defaultUrl = `https://www.metacritic.com/search/${searchTitle}`;
        finalRatingData.url = defaultUrl;
    }

    updateRatingTemplate(newRatingBadge, finalRatingData);
}

// -----------------------------------------------------------------------------------------------------
// MyAnimeList
// -----------------------------------------------------------------------------------------------------
// wikidata solution inspired by IMDb Scout Mod

let myAnimeListDataPromise = null;
async function getMyAnimeListDataByImdbId() {
    // only if genre is anime
    const genreAnime = document.querySelector(".ipc-chip-list__scroller")?.textContent.includes("Anime");
    if (!genreAnime) return;

    // only if enabled in settings
    const configured = await GM_getValue("MyAnimeList", false);
    if (!configured) return;

    if (myAnimeListDataPromise) return myAnimeListDataPromise;

    function getAnimeID() {
        const url = `https://query.wikidata.org/sparql?format=json&query=SELECT * WHERE {?s wdt:P345 "${imdbId}". OPTIONAL {?s wdt:P4086 ?MyAnimeList_ID.} OPTIONAL {?s wdt:P8729 ?AniList_ID.}}`;

        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                method: "GET",
                timeout: 10000,
                url: url,
                headers: { "User-Agent": USER_AGENT },
                onload: function (response) {
                    const result = JSON.parse(response.responseText);
                    let myAnimeListId = "";
                    let aniListId = "";
                    if (result.results.bindings[0] !== undefined) {
                        if (result.results.bindings[0].MyAnimeList_ID !== undefined) {
                            myAnimeListId = result.results.bindings[0].MyAnimeList_ID.value;
                        } else {
                            console.log("getAnimeID: No MyAnimeList_ID found on wikidata.org");
                        }
                        if (result.results.bindings[0].AniList_ID !== undefined) {
                            aniListId = result.results.bindings[0].AniList_ID.value;
                        }
                        console.log("getAnimeID: ", result.results);
                        resolve([myAnimeListId, aniListId]);
                    }
                },
                onerror: function () {
                    console.log("getAnimeID: Request Error.");
                    reject("Request Error");
                },
                onabort: function () {
                    console.log("getAnimeID: Request Abort.");
                    reject("Request Abort");
                },
                ontimeout: function () {
                    console.log("getAnimeID: Request Timeout.");
                    reject("Request Timeout");
                },
            });
        });
    }

    function fetchMyAnimeListData(myAnimeListId) {
        return new Promise((resolve, reject) => {
            const url = "https://api.jikan.moe/v4/anime/" + myAnimeListId;
            GM.xmlHttpRequest({
                method: "GET",
                timeout: 10000,
                url: url,
                headers: { "User-Agent": USER_AGENT },
                onload: function (response) {
                    if (response.status === 200) {
                        const result = JSON.parse(response.responseText);
                        const rating = result.data.score;
                        if (!isNaN(rating) && rating > 0) {
                            console.log("fetchMyAnimeListData: ", result.data.mal_id, result);

                            resolve({
                                source: "MyAnimeList",
                                rating: parseFloat((rating || 0).toFixed(1)).toLocaleString(local),
                                voteCount: result.data.scored_by?.toLocaleString(local),
                                url: result.data.url,
                            });
                        } else {
                            reject("Invalid rating");
                        }
                    } else {
                        console.log("MyAnimeList: HTTP Error: " + response.status);
                        reject("HTTP Error");
                    }
                },
                onerror: function () {
                    console.log("MyAnimeList: Request Error.");
                    reject("Request Error");
                },
                onabort: function () {
                    console.log("MyAnimeList: Request is aborted.");
                    reject("Request Aborted");
                },
                ontimeout: function () {
                    console.log("MyAnimeList: Request timed out.");
                    reject("Request Timeout");
                },
            });
        });
    }

    myAnimeListDataPromise = (async () => {
        const id = await getAnimeID();
        const myAnimeListId = id[0];
        const aniListId = id[1];

        if (myAnimeListId !== "") {
            return fetchMyAnimeListData(myAnimeListId);
        }
    })();

    return 0;
}

async function getMyAnimeListDataByTitle() {
    const titleElement = getTitleElement();
    if (!titleElement) return;

    // only if genre is anime
    const genreAnime = document.querySelector(".ipc-chip-list__scroller")?.textContent.includes("Anime");
    if (!genreAnime) return;

    const mainTitle = getMainTitle();
    const originalTitle = getOriginalTitle();

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
        const maxRetries = 3;
        const retryDelay = 1000; // 5 seconds

        async function fetchWithRetry(url, retries = 0) {
            try {
                const response = await fetch(url);
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
        // console.log(searchTitle, year, type, allResults);

        const result = allResults.find((anime, index) => {
            const titleMatch = anime.title.toLowerCase().includes(searchTitle.toLowerCase());
            const yearMatch = anime.aired.prop.from.year === year;

            if (titleMatch && yearMatch) {
                // console.log(`Title and year match found for anime[${index}] - ${anime.title}`);
                return true;
            }

            if (!titleMatch && anime.title_english) {
                const englishTitleMatch = anime.title_english.toLowerCase().includes(searchTitle.toLowerCase());
                // console.log(`English title match for "${anime.title_english}": ${englishTitleMatch}`);

                if (englishTitleMatch && yearMatch) {
                    // console.log(`English title and year match found for anime[${index}] - ${anime.title}`);
                    return true;
                }
            }

            if (!titleMatch && anime.title_synonyms && anime.title_synonyms.length > 0) {
                // console.log(`Checking synonyms for anime[${index}] - ${anime.title}, Synonyms: ${anime.title_synonyms}`);

                const synonymMatch = anime.title_synonyms.some((synonym) => synonym.toLowerCase().includes(searchTitle.toLowerCase()));

                // console.log(`Synonym match for anime[${index}] - ${anime.title}: ${synonymMatch}`);

                if (synonymMatch && yearMatch) {
                    // console.log(`Synonym and year match found for anime[${index}] - ${anime.title}`);
                    return true;
                }
            }

            // console.log(`No match found for anime[${index}] - ${anime.title}`);
            return false;
        });
        return result;
    }

    async function getAnimeData() {
        try {
            let result = await fetchAllPages(mainTitle);

            if (!result && originalTitle) {
                console.log(`No results found for "${mainTitle}", retrying with originalTitle "${originalTitle}"...`);
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

    myAnimeListDataPromise = (async () => {
        const anime = await getAnimeData();

        if (anime) {
            const data = {
                source: "MyAnimeList",
                rating: Number(anime.score).toLocaleString(local, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                voteCount: anime.scored_by?.toLocaleString(local),
                url: anime.url,
            };

            // console.log("myAnimeListDataPromise: ", anime);

            return data;
        } else {
            console.log("No anime data found.");
            return null;
        }
    })();
}

async function addMyAnimeListRatingBadge() {
    // only if genre is anime
    const genreAnime = document.querySelector(".ipc-chip-list__scroller")?.textContent.includes("Anime");
    if (!genreAnime) return;

    // only if enabled in settings
    const configured = await GM_getValue("MyAnimeList", false);
    if (!configured) return;

    const newRatingBadge = createRatingBadgeTemplate("MyAnimeList");

    // if the template for the rating badge was not created, it already exists
    if (!newRatingBadge) return;

    let ratingData = await getMyAnimeListDataByImdbId();
    if (ratingData === 0) {
        ratingData = await getMyAnimeListDataByTitle();
    }

    // Copy ratingData to avoid modifying the original object
    let finalRatingData = { ...ratingData };

    // Check if ratingData or ratingData.url is undefined and provide a default value
    if (!ratingData?.url) {
        const searchTitle = getOriginalTitle() ?? getMainTitle();
        const defaultUrl = `https://myanimelist.net/anime.php?q=${searchTitle}`; // Define your default URL here
        finalRatingData.url = defaultUrl;
    }

    updateRatingTemplate(newRatingBadge, finalRatingData);
}

// -----------------------------------------------------------------------------------------------------

async function addDdl() {
    const authorsMode = await GM_getValue("authorsMode", false);
    if (!authorsMode) return;

    const targetElement = document.querySelector("[data-testid=hero__pageTitle]");

    if (!document.querySelector("a#ddl-button") && targetElement) {
        let ddlElement = document.createElement("a");
        ddlElement.id = "ddl-button";
        ddlElement.href = `https://ddl-warez.cc/?s=${imdbId}`;
        ddlElement.style.float = "right";

        let imgElement = document.createElement("img");
        imgElement.src = "https://ddl-warez.cc/wp-content/uploads/logo.png";
        imgElement.style.height = "48px";
        imgElement.style.aspectRatio = "1/1";

        ddlElement.appendChild(imgElement);

        targetElement.insertAdjacentElement("afterend", ddlElement);
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

// Configuration Modal
function openConfiguration() {
    GM_addStyle(`
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
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
    `);

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
    ratingSources.forEach((ratingSource) => {
        const label = document.createElement("label");
        label.className = "checkbox-label";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = GM_getValue(ratingSource, false);

        checkbox.addEventListener("change", () => {
            GM_setValue(ratingSource, checkbox.checked);
            if (!checkbox.checked) {
                document.querySelector(`span.rating-bar__base-button[${ratingSource}]`).remove();
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

    closeButton.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });

    modal.appendChild(closeButton);

    // Add modal and overlay to the DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Close modal on click outside
    overlay.addEventListener("click", () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
    });
}

// add and keep elements in header container
async function main() {
    // set default configuration
    ratingSources.forEach((badge) => {
        // Query default value (if does not exist, 'null' is returned)
        const existingValue = GM_getValue(badge, null);
        if (existingValue === null) {
            // Value does not exist, set default value to true
            GM_setValue(badge, true);
        }
    });

    // ignore episode view
    if (!document.title.includes('"')) {
        addCss();
        getTmdbData();
        getDoubanData();
        getMetacriticData();
        getMyAnimeListDataByImdbId();
        getMyAnimeListDataByTitle();

        const observer = new MutationObserver(async () => {
            addCss();
            await addMyAnimeListRatingBadge();
            await addMetacriticRatingBadge();
            await addDoubanRatingBadge();
            await addTmdbRatingBadge();

            addDdl();
            // addGenresToTitle();
            collectMetadataForClipboard();
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
}

// -----------------------------------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------------------------------

main();
// GM_setValue("authorsMode", true);
