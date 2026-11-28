// ==UserScript==
// @name         Cheapest Round-Trip Dates Finder
// @description  Finds the cheapest combination of outbound and return dates using flexible travel dates. Set the trip length and how far ahead to search – the script checks all matching date combinations and compares real prices and layovers, so you don't have to click through them one by one. To start, search a route on Skyscanner and choose "Flexible Dates" under travel dates.
// @version      20261128.2
// @author       mykarean
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAABIFBMVEXe4ddkY1+iYgjz55yny/hfpPydnZhOJBT34GtmVx8oHxn84ijcqx6pLQ8Ab/ykjSsAbe+Xjl/VWRCJvPzfs0kUhP4Ab/sAqv8Af78A//+DfWg5PUe+wb3HrZM/REwAcf38yBcAAAD7/Pr90hv7tw8FAgQAbPn8lQv7pQ0Acf30igwqGALmdRAAff8AcfwACyszJgb91yoAcfwYEwsASaoAVf8Acf0AOYtNKANLNwjRqBQAcf4BWccAGU0CY9j61kzSZw0AM3hrNwMBU7gAcfwqhvzm6erDOhJZRgkAJ2fQdQvPRBKuiQ9uSAT1yipuVggAI1kAQ5iLaQkAbPkCEzYAAP+NSQTPlw/hbA//5km4lxSWdgv++K/U5fq5ubVVVFDfWB0VAAAAYHRSTlP//////////////////27/Iv//////lAMEAf///////v8A//////7//5L///8Hb////1P//wO2/////yz//////////8///////////////////wv/Af////////////988r2VAAAK10lEQVR42r1aCVviTBIOAbkd1JnZ3W/2ICTpJCZgEoJyyM2ogFwiAyIe//9fbHUnIQfBmXHHrUcRQ/K+3XV1VTdUzieFwrn95rJYPAM5Pf3baaDAZfx5sXhZKJjPnNtvHKE8//04xzfcX56dXnzP/pZ8vzg9u7zH4zr/sZ8Aj/3y7CL7brk4u7RggggKP3JHxf8B3eIoHuV+FIII/p7LFb9n/4B8LxIwP0Ehd3SR/UNycZQr+AnOc5+yf1A+bQ1B2eM/y/5RObPnQH0MvsNAfYB+PFqiyPgv34MgCOaffZ9fkjlggvMf73BPIfCtx11/nJsE/8gV3wMv3DVUkEa5uY+iCNCY4K/790xggJTEZvQ4mmpoIAQzfL//CxMU3jGB7B2KvbDhlM5xuv6ooXowQxHAMcHFLxvUlhk6ZtlwmifC6VPUC2S4wATvcaGZRlEEnsHC88DQ3OdI1C/FWK9cEhz7doxrliKDp8f9MY2JtMa+aKPOf6YhIdtUkYHQomd5Sx1lnigdUFcKwlJZ8XwalBSoo3Mqd/+z4TdRjGKpl1e0aBIGNfRETUD1NYSM6WauoREjSZVGoBXuwchHPyNQE2xYb8WpcAjd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
// @include      /^https:\/\/www\.skyscanner\.[a-z.]+\/transport\/(flights|fluge|vols|vuelos)\/.+/
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @run-at       document-start
// @compatible   chrome
// @license      GPL3
// ==/UserScript==

(function () {
    "use strict";

    let LOCALE;
    const DEBUG = false;

    const DEFAULT_RANGE_MONTHS = 6;
    const DEFAULT_TARGET_STAY_WEEKS = 3;
    const DEFAULT_FLEXIBILITY_PERCENT = 15;
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // weekday buttons, Monday first (Date#getDay values)

    const REQUEST_DELAY_MS = 400;
    const SCRAPE_TIMEOUT_MS = 30000;
    // The outer timeout (see scrapeInTab) starts the instant the iframe is created, while the
    // inner one (see runScrapeMode) only starts once the iframe has loaded and its script is
    // running - this buffer accounts for that startup lag so the outer timeout can't fire first.
    // 2s was too tight with five iframes loading in parallel: the outer timeout won every time
    // and the inner timeout's diagnostics were thrown away.
    const IFRAME_STARTUP_BUFFER_MS = 15000;

    // ============================================================
    // LOCALE, MARKET & CURRENCY DETECTION
    // ============================================================

    // Generic TLDs that don't map to a single country/market, so the domain gives no usable signal.
    const GENERIC_TLDS = ["com", "net", "org"];

    function marketFromHostname() {
        // On a country-coded domain (e.g. skyscanner.fr), market is a site-wide setting independent
        // of the chosen display language (e.g. English UI while the market stays "France"), so
        // it can't be derived from the locale string - the domain TLD is the reliable signal
        // instead. That breaks down on the generic skyscanner.com domain, which isn't tied to any
        // one market, so callers should fall back to something else in that case.
        const match = location.hostname.match(/\.([a-z]{2,3})$/i);
        const tld = match ? match[1].toLowerCase() : null;
        if (!tld || GENERIC_TLDS.includes(tld)) return null;
        return tld.toUpperCase();
    }

    // Auto-detection has no reasonable default to fall back to - a hardcoded market/currency
    // would silently misprice every result for anyone not in that one market. So this either
    // returns real, page-derived values or null; callers fall back to a manual, user-supplied
    // locale (see loadManualLocale/saveManualLocale) instead of guessing.
    function detectLocale() {
        try {
            // The footer's "cultureText" element renders a clean, purpose-built summary like
            // "DE <middot> de-DE <middot> <symbol> EUR" (separated by U+00B7) - market, locale
            // and currency already cleanly separated, straight from Skyscanner's own state. Far
            // more reliable than picking pieces out of the header culture-selector button's
            // concatenated text (which mixes in the locale label, country name, etc. and risks
            // grabbing the wrong parenthesis/word).
            const cultureText = document.querySelector('[data-testid="cultureText"]')?.textContent || "";
            const [footerMarket, footerLocale, footerCurrency] = cultureText
                .split("·")
                .map((part) => part.replace(/ /g, " ").trim())
                .filter(Boolean);

            const codeMatch = footerCurrency?.match(/[A-Z]{3}/);
            if (!codeMatch) return null;
            const currency = codeMatch[0];
            const currencySymbol = footerCurrency.replace(currency, "").trim() || currency;

            const market = footerMarket || marketFromHostname();
            const locale = footerLocale || document.documentElement.lang;
            if (!market || !locale) return null;

            return { market, currency, locale, currencySymbol };
        } catch {
            return null;
        }
    }

    const MANUAL_LOCALE_KEY = "sky-manual-locale";

    function loadManualLocale() {
        try {
            return GM_getValue(MANUAL_LOCALE_KEY, null);
        } catch {
            return null;
        }
    }

    function saveManualLocale(locale) {
        try {
            GM_setValue(MANUAL_LOCALE_KEY, locale);
        } catch {
            // GM storage unavailable - the manual entry still works for this page load
        }
    }

    const SETTINGS_KEY = "sky-settings";

    function loadSettings() {
        try {
            return GM_getValue(SETTINGS_KEY, null);
        } catch {
            return null;
        }
    }

    function saveSettings(settings) {
        try {
            GM_setValue(SETTINGS_KEY, settings);
        } catch {
            // GM storage unavailable - the current values still work for this page load
        }
    }

    // ============================================================
    // I18N STRINGS
    // ============================================================

    const STRINGS = {
        de: {
            title: "Günstigste Hin- und Rückflugtermine",
            settings: "Einstellungen",
            searchRange: "Suchzeitraum (Monate, max 12)",
            targetStay: "Ziel-Aufenthalt (Wochen)",
            flexibility: "Flexibilität (± %)",
            outboundDays: "Hinflug-Tage",
            returnDays: "Rückflug-Tage",
            directOnly: "Nur Direktflüge",
            anyDay: "alle",
            startSearch: "Suche starten",
            searchAgain: "Erneut suchen",
            nightsRange: (min, max) => `(${min}-${max} Nächte)`,
            nightsSuffix: (n) => `${n} Nächte`,
            routeError: "Route konnte nicht aus der URL gelesen werden.",
            loading: (i, total, min, max) => `Lade ${i}/${total} (${min}-${max} Nächte)`,
            doneNoResults: (total) => `Fertig: 0 Treffer (${total} Anfragen)`,
            gridFailures: "Einige Kalender-Anfragen sind fehlgeschlagen",
            checkingPrices: (done, total) => `Prüfe Preiszugehörigkeit & Zwischenstopp-Details: ${done}/${total}`,
            realPriceFailures: "Einige echte Preise konnten nicht geladen werden",
            reloadHint: "Skyscanner blockiert evtl. Anfragen – hilft ein erneuter Versuch nicht, Seite neu laden.",
            retryFailed: "Fehlgeschlagene erneut laden",
            closePanel: "Schließen",
            openPanel: "Suche öffnen",
            direct: "Direkt ab",
            oneStop: "1 Stopp ab",
            twoOrMoreStops: "2+ Stopps ab",
            maxLayover: (h, m) => ` (max. Zwischenstopp ${h}h ${m}m)`,
            couldNotLoad: "Konnte nicht geladen werden",
            noResults: "Keine Treffer im gewählten Zeitraum",
            priceSnapshotFrom: (dt) => `Preis-Snapshot vom ${dt}`,
            localeError: "Markt/Währung konnten nicht automatisch erkannt werden. Bitte manuell angeben:",
            localeMarket: "Markt (z. B. DE)",
            localeCurrency: "Währung (z. B. EUR)",
            localeSymbol: "Symbol (z. B. €)",
            localeLocale: "Locale (z. B. de-DE)",
            localeSaveError: "Bitte Markt, Währung, Symbol und Locale ausfüllen.",
        },
        en: {
            title: "Cheapest round-trip dates",
            settings: "Settings",
            searchRange: "Search range (months, max 12)",
            targetStay: "Target stay (weeks)",
            flexibility: "Flexibility (± %)",
            outboundDays: "Outbound days",
            returnDays: "Return days",
            directOnly: "Direct flights only",
            anyDay: "any",
            startSearch: "Start search",
            searchAgain: "Search again",
            nightsRange: (min, max) => `(${min}-${max} nights)`,
            nightsSuffix: (n) => `${n} nights`,
            routeError: "Could not read the route from the URL.",
            loading: (i, total, min, max) => `Loading ${i}/${total} (${min}-${max} nights)`,
            doneNoResults: (total) => `Done: 0 matches (${total} requests)`,
            gridFailures: "Some calendar requests failed",
            checkingPrices: (done, total) => `Checking price category & layover details: ${done}/${total}`,
            realPriceFailures: "Some real prices could not be loaded",
            reloadHint: "Skyscanner may be blocking requests – if retrying doesn't help, reload the page.",
            retryFailed: "Retry failed",
            closePanel: "Close",
            openPanel: "Open search",
            direct: "Direct from",
            oneStop: "1 stop from",
            twoOrMoreStops: "2+ stops from",
            maxLayover: (h, m) => ` (max. layover ${h}h ${m}m)`,
            couldNotLoad: "Could not be loaded",
            noResults: "No matches in the selected range",
            priceSnapshotFrom: (dt) => `Price snapshot from ${dt}`,
            localeError: "Could not auto-detect market/currency. Please enter them manually:",
            localeMarket: "Market (e.g. US)",
            localeCurrency: "Currency (e.g. USD)",
            localeSymbol: "Symbol (e.g. $)",
            localeLocale: "Locale (e.g. en-US)",
            localeSaveError: "Please fill in market, currency, symbol and locale.",
        },
        es: {
            title: "Fechas de ida y vuelta más baratas",
            settings: "Ajustes",
            searchRange: "Rango de búsqueda (meses, máx. 12)",
            targetStay: "Duración objetivo (semanas)",
            flexibility: "Flexibilidad (± %)",
            outboundDays: "Días de ida",
            returnDays: "Días de vuelta",
            directOnly: "Solo vuelos directos",
            anyDay: "todos",
            startSearch: "Iniciar búsqueda",
            searchAgain: "Buscar de nuevo",
            nightsRange: (min, max) => `(${min}-${max} noches)`,
            nightsSuffix: (n) => `${n} noches`,
            routeError: "No se pudo leer la ruta desde la URL.",
            loading: (i, total, min, max) => `Cargando ${i}/${total} (${min}-${max} noches)`,
            doneNoResults: (total) => `Listo: 0 resultados (${total} solicitudes)`,
            gridFailures: "Algunas solicitudes de calendario fallaron",
            checkingPrices: (done, total) => `Comprobando categoría de precio y detalles de escalas: ${done}/${total}`,
            realPriceFailures: "Algunos precios reales no se pudieron cargar",
            reloadHint: "Skyscanner podría estar bloqueando las solicitudes: si reintentar no ayuda, recarga la página.",
            retryFailed: "Reintentar los fallidos",
            closePanel: "Cerrar",
            openPanel: "Abrir la búsqueda",
            direct: "Directo desde",
            oneStop: "1 escala desde",
            twoOrMoreStops: "2+ escalas desde",
            maxLayover: (h, m) => ` (escala máx. ${h}h ${m}m)`,
            couldNotLoad: "No se pudo cargar",
            noResults: "Sin resultados en el rango seleccionado",
            priceSnapshotFrom: (dt) => `Instantánea de precio del ${dt}`,
            localeError: "No se pudo detectar automáticamente el mercado/la moneda. Introdúzcalos manualmente:",
            localeMarket: "Mercado (p. ej. ES)",
            localeCurrency: "Moneda (p. ej. EUR)",
            localeSymbol: "Símbolo (p. ej. €)",
            localeLocale: "Configuración regional (p. ej. es-ES)",
            localeSaveError: "Por favor, complete mercado, moneda, símbolo y configuración regional.",
        },
        fr: {
            title: "Dates aller-retour les moins chères",
            settings: "Paramètres",
            searchRange: "Période de recherche (mois, max 12)",
            targetStay: "Durée du séjour visée (semaines)",
            flexibility: "Flexibilité (± %)",
            outboundDays: "Jours d'aller",
            returnDays: "Jours de retour",
            directOnly: "Vols directs uniquement",
            anyDay: "tous",
            startSearch: "Lancer la recherche",
            searchAgain: "Relancer la recherche",
            nightsRange: (min, max) => `(${min}-${max} nuits)`,
            nightsSuffix: (n) => `${n} nuits`,
            routeError: "Impossible de lire l'itinéraire depuis l'URL.",
            loading: (i, total, min, max) => `Chargement ${i}/${total} (${min}-${max} nuits)`,
            doneNoResults: (total) => `Terminé : 0 résultat (${total} requêtes)`,
            gridFailures: "Certaines requêtes de calendrier ont échoué",
            checkingPrices: (done, total) => `Vérification de la catégorie de prix et des escales : ${done}/${total}`,
            realPriceFailures: "Certains prix réels n'ont pas pu être chargés",
            reloadHint: "Skyscanner bloque peut-être les requêtes : si réessayer ne suffit pas, rechargez la page.",
            retryFailed: "Réessayer les échecs",
            closePanel: "Fermer",
            openPanel: "Ouvrir la recherche",
            direct: "Direct à partir de",
            oneStop: "1 escale à partir de",
            twoOrMoreStops: "2+ escales à partir de",
            maxLayover: (h, m) => ` (escale max. ${h}h ${m}m)`,
            couldNotLoad: "Impossible de charger",
            noResults: "Aucun résultat dans la période sélectionnée",
            priceSnapshotFrom: (dt) => `Instantané des prix du ${dt}`,
            localeError: "Impossible de détecter automatiquement le marché/la devise. Veuillez les saisir manuellement :",
            localeMarket: "Marché (p. ex. FR)",
            localeCurrency: "Devise (p. ex. EUR)",
            localeSymbol: "Symbole (p. ex. €)",
            localeLocale: "Locale (p. ex. fr-FR)",
            localeSaveError: "Veuillez renseigner le marché, la devise, le symbole et la locale.",
        },
        ja: {
            title: "最安値の往復日程",
            settings: "設定",
            searchRange: "検索範囲（月数、最大12）",
            targetStay: "希望滞在期間（週）",
            flexibility: "許容範囲（± %）",
            outboundDays: "往路の曜日",
            returnDays: "復路の曜日",
            directOnly: "直行便のみ",
            anyDay: "すべて",
            startSearch: "検索開始",
            searchAgain: "再検索",
            nightsRange: (min, max) => `(${min}〜${max}泊)`,
            nightsSuffix: (n) => `${n}泊`,
            routeError: "URLから区間を読み取れませんでした。",
            loading: (i, total, min, max) => `読み込み中 ${i}/${total} (${min}〜${max}泊)`,
            doneNoResults: (total) => `完了：0件一致（${total}件のリクエスト）`,
            gridFailures: "一部のカレンダーリクエストが失敗しました",
            checkingPrices: (done, total) => `料金カテゴリと乗り継ぎ詳細を確認中：${done}/${total}`,
            realPriceFailures: "一部の実際の料金を読み込めませんでした",
            reloadHint: "Skyscannerがリクエストをブロックしている可能性があります。再試行で改善しない場合は、ページを再読み込みしてください。",
            retryFailed: "失敗分を再試行",
            closePanel: "閉じる",
            openPanel: "検索を開く",
            direct: "直行",
            oneStop: "経由1回",
            twoOrMoreStops: "経由2回以上",
            maxLayover: (h, m) => ` (最長乗り継ぎ ${h}時間${m}分)`,
            couldNotLoad: "読み込めませんでした",
            noResults: "選択した期間に一致する結果はありません",
            priceSnapshotFrom: (dt) => `価格のスナップショット：${dt}`,
            localeError: "市場/通貨を自動検出できませんでした。手動で入力してください：",
            localeMarket: "市場（例：JP）",
            localeCurrency: "通貨（例：JPY）",
            localeSymbol: "記号（例：¥）",
            localeLocale: "ロケール（例：ja-JP）",
            localeSaveError: "市場、通貨、記号、ロケールをすべて入力してください。",
        },
    };

    // The UI's display language is a simple choice among the STRINGS keys, independent of LOCALE
    // (market/currency, used for API calls) - defaulting that to the browser's own language
    // is meaningful for everyone, unlike guessing a market/currency default would be.
    function uiLang() {
        const lang = (LOCALE?.locale || document.documentElement.lang || navigator.language || "en").split("-")[0];
        return STRINGS[lang] ? lang : "en";
    }

    function refreshLocale() {
        LOCALE = detectLocale() || loadManualLocale();
        return t();
    }

    function t() {
        return STRINGS[uiLang()];
    }

    // ============================================================
    // DATE/MONTH ARITHMETIC
    // ============================================================

    // True only for the route-selection page (.../transport/flights/origin/destination/), not
    // for a results page with dates already appended to the path (.../origin/destination/date/date/).
    // The hidden scrape iframe (see scrapeInTab) deliberately loads that dated results URL, so
    // @include itself has to stay broad enough to match it - this check gates the visible panel instead.
    function isSearchPage() {
        const parts = location.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex((p) => p === "flights" || p === "fluge" || p === "vols" || p === "vuelos");
        return idx !== -1 && parts.length === idx + 3;
    }

    function parseRoute() {
        const parts = location.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex((p) => p === "flights" || p === "fluge" || p === "vols" || p === "vuelos");
        return { origin: parts[idx + 1]?.toUpperCase(), destination: parts[idx + 2]?.toUpperCase() };
    }

    function ymAdd(year, month, delta) {
        const total = year * 12 + (month - 1) + delta;
        return { year: Math.floor(total / 12), month: (total % 12) + 1 };
    }
    function ymKey({ year, month }) {
        return `${year}-${String(month).padStart(2, "0")}`;
    }
    function ymCompare(a, b) {
        return a.year * 12 + a.month - (b.year * 12 + b.month);
    }
    function daysInMonth({ year, month }) {
        return new Date(year, month, 0).getDate();
    }
    function toDate({ year, month }, day) {
        return new Date(year, month - 1, day);
    }

    function neededPairs(rangeMonths, minNights, maxNights) {
        const today = new Date();
        const startYM = { year: today.getFullYear(), month: today.getMonth() + 1 };
        const endYM = ymAdd(startYM.year, startYM.month, rangeMonths - 1);
        const pairs = new Map();
        for (let i = 0; i < rangeMonths; i++) {
            const outYM = ymAdd(startYM.year, startYM.month, i);
            const lastDay = daysInMonth(outYM);
            const minInbound = new Date(toDate(outYM, 1).getTime() + minNights * 86400000);
            const maxInbound = new Date(toDate(outYM, lastDay).getTime() + maxNights * 86400000);
            const inboundStartYM = { year: minInbound.getFullYear(), month: minInbound.getMonth() + 1 };
            const inboundEndYM = { year: maxInbound.getFullYear(), month: maxInbound.getMonth() + 1 };
            for (let offset = 0; ; offset++) {
                const inYM = ymAdd(inboundStartYM.year, inboundStartYM.month, offset);
                if (ymCompare(inYM, inboundEndYM) > 0) break;
                pairs.set(`${ymKey(outYM)}|${ymKey(inYM)}`, { outYM, inYM });
            }
        }
        return { pairs: [...pairs.values()], endYM, today };
    }

    // ============================================================
    // CALENDAR GRID FETCH & CACHE
    // ============================================================

    const CACHE_TTL_MS = 20 * 60 * 1000;

    function cacheKey(origin, destination, outYM, inYM) {
        return `sky-grid-${LOCALE.market}-${LOCALE.currency}-${LOCALE.locale}-${origin}-${destination}-${ymKey(outYM)}-${ymKey(inYM)}`;
    }

    function readCache(key) {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            const { fetchedAt, data } = JSON.parse(raw);
            if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
            return data;
        } catch {
            return null;
        }
    }

    function writeCache(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify({ fetchedAt: Date.now(), data }));
        } catch {
            // sessionStorage full or disabled - just skip the cache
        }
    }

    async function fetchGrid(origin, destination, outYM, inYM) {
        const key = cacheKey(origin, destination, outYM, inYM);
        const cached = readCache(key);
        if (cached) return { data: cached, fromCache: true };
        const url = `/g/monthviewservice/${LOCALE.market}/${LOCALE.currency}/${LOCALE.locale}/calendar/${origin}/${destination}/${ymKey(outYM)}/${ymKey(inYM)}/?profile=minimalmonthviewgridv2`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`${res.status} for ${ymKey(outYM)}→${ymKey(inYM)}`);
        const data = await res.json();
        writeCache(key, data);
        return { data, fromCache: false };
    }

    // ============================================================
    // EXTRACTING CANDIDATES FROM A GRID RESPONSE
    // ============================================================

    function traceQuotedAt(traces, traceRefs) {
        const ref = traceRefs?.[0];
        const trace = ref != null ? traces?.[ref] : null;
        const match = trace && /^\{[^}]*\}:(\d{12})/.exec(trace);
        if (!match) return null;
        const [, ts] = match;
        const year = Number(ts.slice(0, 4));
        const month = Number(ts.slice(4, 6));
        const day = Number(ts.slice(6, 8));
        const hour = Number(ts.slice(8, 10));
        const minute = Number(ts.slice(10, 12));
        return new Date(year, month - 1, day, hour, minute);
    }

    // Debug helper: scans a raw grid response for its cheapest cell regardless of the nights
    // window, so two runs can be compared to see whether the underlying price data itself
    // changed between them (independent of any night-count filtering).
    function gridMinPrice(gridResponse) {
        const grid = gridResponse?.PriceGrids?.Grid;
        if (!grid) return null;
        let min = Infinity;
        for (let col = 0; col < (grid[0]?.length || 0); col++) {
            for (let row = 0; row < grid.length; row++) {
                const cell = grid[row][col];
                const price = Math.min(cell?.Direct?.Price ?? Infinity, cell?.Indirect?.Price ?? Infinity);
                if (price < min) min = price;
            }
        }
        return Number.isFinite(min) ? min : null;
    }

    // filters: { outDays: Set, inDays: Set (Date#getDay values), directOnly: boolean }
    function collectCandidates(gridResponse, todayDate, horizonDate, minNights, maxNights, acc, filters) {
        const grid = gridResponse?.PriceGrids?.Grid;
        if (!grid) return;
        const traces = gridResponse.Traces;
        const [outYear, outMonth] = gridResponse.Outbound.split("-").map(Number);
        const [inYear, inMonth] = gridResponse.Inbound.split("-").map(Number);
        for (let col = 0; col < grid[0]?.length || 0; col++) {
            const outDate = new Date(outYear, outMonth - 1, col + 1);
            if (outDate < todayDate || outDate > horizonDate) continue;
            if (!filters.outDays.has(outDate.getDay())) continue;
            for (let row = 0; row < grid.length; row++) {
                const cell = grid[row][col];
                const directPrice = cell?.Direct?.Price;
                const indirectPrice = cell?.Indirect?.Price;
                if (filters.directOnly ? directPrice == null : directPrice == null && indirectPrice == null) continue;
                const isDirect =
                    filters.directOnly || (directPrice != null && (indirectPrice == null || directPrice <= indirectPrice));
                const price = isDirect ? directPrice : indirectPrice;
                const traceRefs = (isDirect ? cell.Direct : cell.Indirect).TraceRefs;
                const quotedAt = traceQuotedAt(traces, traceRefs);
                const inDate = new Date(inYear, inMonth - 1, row + 1);
                const nights = Math.round((inDate - outDate) / 86400000);
                if (nights < minNights || nights > maxNights) continue;
                if (!filters.inDays.has(inDate.getDay())) continue;
                acc.push({ outDate, inDate, nights, price, isDirect, quotedAt });
            }
        }
    }

    function computeNightsWindow(targetWeeks, tolerancePct) {
        const targetNights = Math.max(1, targetWeeks) * 7;
        const tolerance = Math.max(0, tolerancePct) / 100;
        const minNights = Math.max(1, Math.round(targetNights * (1 - tolerance)));
        const maxNights = Math.round(targetNights * (1 + tolerance));
        return { minNights, maxNights, targetNights };
    }

    // ============================================================
    // FORMATTING HELPERS (DATES, LINKS, CURRENCY)
    // ============================================================

    function fmtDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }
    function fmtDateTime(d) {
        return `${fmtDate(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    function skyscannerLink(origin, destination, outDate, inDate) {
        const yymmdd = (d) => fmtDate(d).slice(2).replace(/-/g, "");
        return `${location.origin}/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${yymmdd(outDate)}/${yymmdd(inDate)}/`;
    }

    // Reads the symbol and its position (prefix/suffix) straight from one of Skyscanner's own
    // formatted prices for this card (e.g. "£621" or "417 .د.ب"), so the main price always
    // matches the currency shown in that same card's chips below - no guessing needed.
    function currencyFormatFromExample(formattedPrice) {
        const match = formattedPrice?.match(/^(\D*)[\d.,]*\d(\D*)$/);
        if (!match) return null;
        const [, before, after] = match;
        if (before.trim()) return { symbol: before.trim(), prefix: true };
        if (after.trim()) return { symbol: after.trim(), prefix: false };
        return null;
    }

    function currencyFormatFromPayload(payload) {
        const stopPrices = payload?.stopPrices;
        const example = stopPrices?.direct?.formattedPrice || stopPrices?.one?.formattedPrice || stopPrices?.twoOrMore?.formattedPrice;
        return currencyFormatFromExample(example);
    }

    const PREFIX_CURRENCY_SYMBOLS = ["$", "£", "¥", "₹"];

    function formatPrice(amount, formatHint) {
        if (formatHint)
            return formatHint.prefix ? `${formatHint.symbol}${amount.toFixed(0)}` : `${amount.toFixed(0)} ${formatHint.symbol}`;
        const symbol = LOCALE.currencySymbol;
        return PREFIX_CURRENCY_SYMBOLS.includes(symbol) ? `${symbol}${amount.toFixed(0)}` : `${amount.toFixed(0)} ${symbol}`;
    }

    // ============================================================
    // SCRAPE MODE
    // Runs inside the background iframe, extracts real prices from Skyscanner's
    // own live search, and reports back to the opener via GM storage.
    // ============================================================

    const SCRAPE_PARAM = "skyscrape";

    function scrapeParams() {
        return new URLSearchParams(location.hash.replace(/^#/, ""));
    }

    function isScrapeTab() {
        return scrapeParams().get(SCRAPE_PARAM) === "1";
    }

    function logDebug(enabled, ...args) {
        if (enabled) console.log(...args);
    }

    function maxLayoverMinutes(legs, debug) {
        let max = 0;
        for (const leg of legs || []) {
            const segs = leg.segments || [];
            const segDurationSum = segs.reduce((sum, s) => sum + (s.durationInMinutes || 0), 0);
            const durationBasedGap = (leg.durationInMinutes || 0) - segDurationSum;
            logDebug(
                debug,
                `[SkyScrape]   Leg ${leg.origin?.displayCode}→${leg.destination?.displayCode} (durationInMinutes=${leg.durationInMinutes}, sum of segment durations=${segDurationSum}, layover from duration fields=${durationBasedGap}min):`,
                segs.map(
                    (s) =>
                        `${s.origin?.displayCode}→${s.destination?.displayCode} ${s.departure} - ${s.arrival} (${s.durationInMinutes}min)`,
                ),
            );
            let legMax = 0;
            for (let i = 0; i < segs.length - 1; i++) {
                const arr = new Date(segs[i].arrival).getTime();
                const dep = new Date(segs[i + 1].departure).getTime();
                const gapMin = Math.round((dep - arr) / 60000);
                logDebug(debug, `[SkyScrape]     Layover after segment ${i + 1} (timestamp difference): ${gapMin} minutes`);
                if (gapMin > legMax) legMax = gapMin;
            }
            // With exactly one stopover, the duration-field method is timezone-safe and therefore more reliable
            if (segs.length === 2) legMax = durationBasedGap;
            if (legMax > max) max = legMax;
        }
        return max;
    }

    function cheapestPerCategory(results, debug) {
        const best = {};
        for (const itin of results || []) {
            const maxStops = Math.max(0, ...(itin.legs || []).map((l) => l.stopCount ?? 0));
            const category = maxStops === 0 ? "direct" : maxStops === 1 ? "one" : "twoOrMore";
            const price = itin.price?.raw;
            if (price == null) continue;
            if (!best[category] || price < best[category].price) {
                logDebug(debug, `[SkyScrape] New best price for category "${category}": ${price} € (id=${itin.id})`);
                best[category] = { price, maxLayoverMinutes: maxLayoverMinutes(itin.legs, debug), itinId: itin.id };
            }
        }
        logDebug(debug, "[SkyScrape] cheapestPerCategory result:", best);
        return best;
    }

    function runScrapeMode() {
        const params = scrapeParams();
        const key = params.get("skykey");
        const debug = params.get("debug") === "1";
        const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const origFetch = targetWindow.fetch;
        let done = false;
        // Collected so a failed scrape can say why (blocked, slow, empty answer) instead of just null
        const diag = { searchRequests: 0, httpStatus: null, searchStatus: null, hadStopPrices: null, parseError: null, networkError: null };
        const finish = (payload) => {
            if (done) return;
            done = true;
            if (key) GM_setValue(key, payload);
            logDebug(debug, "[SkyScrape] finish() called with:", payload);
        };
        const isSearchUrl = (url) => Boolean(url && url.includes("/radar/api/v2/web-unified-search"));
        const handleBody = (url, text, httpStatus) => {
            logDebug(debug, "[SkyScrape] Request seen:", url, `(${text?.length ?? 0} chars)`);
            if (!isSearchUrl(url)) return;
            diag.searchRequests++;
            diag.httpStatus = httpStatus ?? null;
            try {
                const json = JSON.parse(text);
                const stopPrices = json?.itineraries?.filterStats?.stopPrices;
                const status = json?.itineraries?.context?.status;
                diag.searchStatus = status ?? null;
                diag.hadStopPrices = Boolean(stopPrices);
                diag.parseError = null;
                logDebug(debug, "[SkyScrape] web-unified-search response, status =", status, stopPrices);
                if (stopPrices && status === "complete") {
                    const categories = cheapestPerCategory(json.itineraries.results, debug);
                    finish({ stopPrices, categories });
                }
            } catch (err) {
                diag.parseError = `${err?.name}: ${err?.message} (body starts: ${String(text).slice(0, 80)})`;
                logDebug(debug, "[SkyScrape] Response was not valid JSON:", err);
            }
        };
        targetWindow.fetch = function (...args) {
            const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
            return origFetch.apply(this, args).then(
                (res) => {
                    res.clone()
                        .text()
                        .then((text) => handleBody(url, text, res.status))
                        .catch(() => {});
                    return res;
                },
                (err) => {
                    if (isSearchUrl(url)) diag.networkError = `${err?.name}: ${err?.message}`;
                    throw err;
                },
            );
        };
        const origOpen = targetWindow.XMLHttpRequest.prototype.open;
        const origSend = targetWindow.XMLHttpRequest.prototype.send;
        targetWindow.XMLHttpRequest.prototype.open = function (_method, url) {
            this.__skyUrl = url;
            return origOpen.apply(this, arguments);
        };
        targetWindow.XMLHttpRequest.prototype.send = function () {
            this.addEventListener("loadend", () => handleBody(this.__skyUrl, this.responseText, this.status));
            return origSend.apply(this, arguments);
        };
        setTimeout(
            () => finish({ failure: { ...diag, pageTitle: document.title, pageUrl: location.href.split("#")[0] } }),
            SCRAPE_TIMEOUT_MS,
        );
    }

    function scrapeInTab(url) {
        return new Promise((resolve) => {
            const key = `sky-scrape-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const fullUrl = `${url}#${SCRAPE_PARAM}=1&skykey=${encodeURIComponent(key)}`;
            let settled = false;
            let listenerId;
            const iframe = document.createElement("iframe");
            iframe.style.cssText = "position:absolute; left:-9999px; top:-9999px; width:1px; height:1px; border:0;";
            iframe.addEventListener("error", () => {
                console.warn(`[Sky] iframe for ${url} failed to load (network error).`);
            });
            const cleanup = () => {
                if (listenerId != null) GM_removeValueChangeListener(listenerId);
                GM_deleteValue(key);
                iframe.remove();
            };
            const outerTimeoutMs = SCRAPE_TIMEOUT_MS + IFRAME_STARTUP_BUFFER_MS;
            const timeoutId = setTimeout(() => {
                if (settled) return;
                settled = true;
                console.warn(
                    `[Sky] No price response for ${url} within ${outerTimeoutMs / 1000}s – ` +
                        "Skyscanner may be blocking the iframe embed (CSP/X-Frame-Options), or the search is taking unusually long.",
                );
                cleanup();
                resolve(null);
            }, outerTimeoutMs);
            listenerId = GM_addValueChangeListener(key, (_name, _oldValue, newValue) => {
                if (settled || newValue === undefined) return;
                settled = true;
                clearTimeout(timeoutId);
                cleanup();
                if (newValue?.failure) {
                    // The iframe ran and gave up on its own (its internal timeout elapsed without a
                    // "complete" search result) - a different failure mode than our outer timeout
                    // above, which only fires if the iframe never responded at all.
                    console.warn(
                        `[Sky] Scrape for ${url} gave up after ${SCRAPE_TIMEOUT_MS / 1000}s inside the tab. Diagnostics:`,
                        newValue.failure,
                    );
                    resolve(null);
                    return;
                }
                resolve(newValue);
            });
            iframe.src = fullUrl;
            document.body.appendChild(iframe);
        });
    }

    // ============================================================
    // PANEL UI: STYLES, DOM BUILD, CUSTOM SCROLLBAR
    // ============================================================

    const STYLE = `
    #sky-panel, #sky-panel * { box-sizing:border-box; }
    #sky-panel { position:fixed; bottom:16px; right:16px; width:330px; max-width:calc(100vw - 32px);
      max-height:calc(100vh - 32px); max-height:calc(100dvh - 32px);
      overflow:hidden;
      background:#ffffff; color:#1f2430; font:13px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;
      z-index:999999; border:1px solid #e2e5ea; border-radius:12px;
      box-shadow:0 8px 24px rgba(20,30,50,0.12); }
    #sky-panel-scroll { max-height:calc(100vh - 34px); max-height:calc(100dvh - 34px); overflow-y:scroll; overflow-x:hidden; padding:16px;
      scrollbar-width:none; }
    #sky-panel-scroll::-webkit-scrollbar { display:none; }
    .sky-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:0 0 12px; }
    #sky-panel .sky-head h3 { margin:0; }
    #sky-panel.sky-closed { display:none; }
    #sky-fab:not([hidden]) { display:flex; }
    #sky-close { display:block; flex:0 0 auto; width:36px; height:36px; margin:-6px -6px -6px 0; padding:0; border:none;
      border-radius:50%; background:transparent; color:#5b6472; font-size:20px; line-height:1; cursor:pointer; }
    #sky-close:hover { background:#eef0f3; }
    #sky-fab { display:none; position:fixed; bottom:16px; right:16px; width:56px; height:56px; padding:0; border:none;
      border-radius:14px; background:transparent url("${GM_info.script.icon}") center/cover no-repeat;
      font-size:28px; line-height:1; cursor:pointer; align-items:center; justify-content:center; z-index:999999;
      filter:drop-shadow(0 3px 6px rgba(20,30,50,0.35)); }
    /* Phones: fill the whole screen instead of a floating panel */
    @media (max-width: 600px) {
      #sky-panel { inset:0; width:auto; max-width:none; height:100vh; height:100dvh; max-height:none;
        border:0; border-radius:0; box-shadow:none; }
      #sky-panel, #sky-panel-scroll { overscroll-behavior:contain; touch-action:pan-y; }
      html.sky-lock, html.sky-lock body { overflow:hidden !important; }
      #sky-panel-scroll { max-height:100vh; max-height:100dvh; height:100%; font-size:14px; }
      #sky-panel h3 { font-size:17px; }
      /* Title bar stays visible while the list scrolls (cancels the scroll area's 16px padding) */
      .sky-head { position:sticky; top:-16px; z-index:2; background:#fff; margin:-16px -16px 12px;
        padding:16px 16px 10px; border-bottom:1px solid #e2e5ea; }
      #sky-scroll-thumb { display:none !important; }
      #sky-settings summary { font-size:15px; color:#1f2430; padding:12px 14px; border:1px solid #d3d8e0;
        border-radius:8px; background:#f8fafc; }
      #sky-settings summary:active { background:#eef0f3; }
      #sky-panel .sky-field { margin-top:14px; }
      #sky-panel input { width:84px; padding:8px 10px; font-size:16px; }
      #sky-manual-locale .sky-field input { width:130px; }
      #sky-panel .sky-days-field { margin-top:14px; }
      #sky-panel .sky-day { padding:10px 0; font-size:13px; }
      #sky-panel input[type="checkbox"] { width:22px; height:22px; padding:0; }
      #sky-start { margin-top:18px; padding:13px; font-size:15px; }
      #sky-status, #sky-retry { font-size:13px; }
      #sky-retry { padding:10px; }
    }
    #sky-scroll-thumb { position:absolute; top:0; right:3px; width:6px; border-radius:3px;
      background:#d3d8e0; cursor:pointer; display:none; }
    #sky-scroll-thumb:hover, #sky-scroll-thumb.sky-dragging { background:#b7bfc9; }
    #sky-panel h3 { margin:0 0 12px; font-size:15px; font-weight:600; color:#0a2540; }
    #sky-settings { margin:0; }
    #sky-settings summary { display:none; cursor:pointer; font-size:12px; font-weight:600; color:#5b6472; list-style:none; }
    #sky-panel.sky-has-results #sky-settings summary { display:block; }
    #sky-settings summary::-webkit-details-marker { display:none; }
    #sky-settings summary::before { content:"▸ "; }
    #sky-settings[open] summary::before { content:"▾ "; }
    #sky-panel .sky-field { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:8px; }
    #sky-panel .sky-field label { color:#5b6472; }
    #sky-panel .sky-days-field { margin-top:8px; }
    #sky-panel .sky-days-label { display:block; color:#5b6472; margin-bottom:4px; }
    #sky-panel .sky-days-hint { color:#8a929e; }
    #sky-panel .sky-days-hint[hidden] { display:none; }
    #sky-panel .sky-days { display:flex; gap:4px; }
    #sky-panel .sky-day { flex:1 1 0; min-width:0; padding:4px 0; border:1px solid #d3d8e0; border-radius:6px;
      background:#fff; color:#5b6472; font:inherit; font-size:12px; cursor:pointer; }
    #sky-panel .sky-day[aria-pressed="true"] { background:#0062e3; border-color:#0062e3; color:#fff; font-weight:600; }
    #sky-panel input { width:60px; padding:4px 6px; border:1px solid #d3d8e0; border-radius:6px;
      font:inherit; text-align:right; }
    #sky-panel input:focus { outline:2px solid #0062e3; outline-offset:1px; }
    #sky-panel input[type="checkbox"] { width:auto; }
    #sky-manual-locale { margin-top:10px; padding-top:10px; border-top:1px solid #e2e5ea; }
    #sky-manual-locale .sky-field input { width:110px; text-align:left; }
    #sky-locale-error { color:#c0392b; font-size:12px; margin-top:8px; }
    #sky-start { width:100%; margin-top:14px; padding:9px; border:none; border-radius:8px;
      background:#0062e3; color:#fff; font:inherit; font-weight:600; cursor:pointer; }
    #sky-start:hover { background:#1f66c0; }
    #sky-status { margin-top:10px; color:#5b6472; font-size:12px; min-height:16px; }
    #sky-status.sky-status-error { color:#c0392b; }
    #sky-retry { display:block; width:100%; margin-top:8px; padding:7px 10px; border:1px solid #0062e3; border-radius:6px;
      background:#fff; color:#0062e3; font:inherit; font-size:12px; font-weight:600; cursor:pointer; }
    #sky-retry:hover { background:#eef5fd; }
    #sky-retry[hidden] { display:none; }
    #sky-progress-track { margin-top:6px; height:4px; border-radius:2px; background:#eef0f3; overflow:hidden; display:none; }
    #sky-progress-bar { height:100%; width:0%; background:#0062e3; transition:width .2s ease; }
    #sky-results { margin-top:6px; }
    .sky-card { display:block; margin-top:8px; padding:10px; border:1px solid #e2e5ea; border-radius:8px;
      background:#f8fafc; text-decoration:none; color:inherit; cursor:pointer; transition:border-color .15s ease, background .15s ease; }
    .sky-card:hover { border-color:#0062e3; background:#eef5fd; }
    .sky-card .sky-price-row { display:flex; align-items:center; gap:8px; }
    .sky-card .sky-rank { flex:0 0 auto; width:20px; height:20px; border-radius:50%; background:#e2e5ea; color:#5b6472;
      font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }
    .sky-card .sky-price { color:#1f2430; font-weight:700; font-size:17px; cursor:default; }
    .sky-card .sky-dates { color:#3a4250; margin-top:2px; }
    .sky-card .sky-real-prices { display:flex; flex-direction:column; align-items:flex-start; gap:3px; margin-top:6px; }
    .sky-card .sky-real-prices .sky-chip { background:#eef0f3; border-radius:4px; padding:2px 6px; font-size:11px; color:#3a4250; white-space:nowrap; }
    .sky-card .sky-real-prices .sky-chip-muted { background:transparent; color:#6b7280; }
    .sky-card .sky-real-prices .sky-chip-best-price { color:#0a8a4a; font-weight:700; }
    .sky-card .sky-real-prices .sky-chip-shortest-layover { outline:2px solid #0062e3; outline-offset:-2px; }
    .sky-loading { display:flex; align-items:center; gap:6px; color:#6b7280; font-size:11px; }
    .sky-spinner { width:11px; height:11px; border-radius:50%; border:2px solid #e2e5ea; border-top-color:#0062e3;
      animation: sky-spin 0.8s linear infinite; }
    @keyframes sky-spin { to { transform:rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .sky-spinner { animation:none; } }
    .sky-empty { color:#c0392b; margin-top:8px; }
    .sky-chip-error { color:#c0392b; font-size:11px; font-weight:600; }
    .sky-card.sky-card-failed { border-color:#e8b4ae; background:#fdf3f2; }
    .sky-card.sky-card-failed:hover { border-color:#c0392b; background:#fbeae8; }
  `;

    let panel, statusEl, resultsEl, progressTrack, progressBar;

    function setStatus(text, isError) {
        statusEl.textContent = text;
        statusEl.hidden = !text;
        statusEl.classList.toggle("sky-status-error", !!isError);
    }
    function setProgress(fraction) {
        const percent = Math.round(fraction * 100);
        progressTrack.style.display = "block";
        progressTrack.setAttribute("aria-valuenow", String(percent));
        progressBar.style.width = `${percent}%`;
    }
    function hideProgress(delayMs) {
        setTimeout(() => {
            progressTrack.style.display = "none";
        }, delayMs);
    }

    // Renders (or hides) the manual market/currency/locale entry fields, shown only when
    // auto-detection and any previously stored manual override both come up empty.
    function renderManualLocaleSection(s) {
        const section = panel.querySelector("#sky-manual-locale");
        if (LOCALE) {
            section.hidden = true;
            return;
        }
        section.hidden = false;
        section.innerHTML = `
      <div id="sky-locale-error">${s.localeError}</div>
      <div class="sky-field"><label for="sky-manual-market">${s.localeMarket}</label><input id="sky-manual-market" type="text" maxlength="10"></div>
      <div class="sky-field"><label for="sky-manual-currency">${s.localeCurrency}</label><input id="sky-manual-currency" type="text" maxlength="10"></div>
      <div class="sky-field"><label for="sky-manual-symbol">${s.localeSymbol}</label><input id="sky-manual-symbol" type="text" maxlength="10"></div>
      <div class="sky-field"><label for="sky-manual-locale-input">${s.localeLocale}</label><input id="sky-manual-locale-input" type="text" maxlength="20"></div>
    `;
    }

    // Reads the manual entry fields, saves them as the stored override, and updates LOCALE.
    // Returns false (and shows an error) if any field is missing.
    function applyManualLocale(s) {
        if (LOCALE) return true;
        const market = panel.querySelector("#sky-manual-market")?.value.trim().toUpperCase();
        const currency = panel.querySelector("#sky-manual-currency")?.value.trim().toUpperCase();
        const currencySymbol = panel.querySelector("#sky-manual-symbol")?.value.trim();
        const locale = panel.querySelector("#sky-manual-locale-input")?.value.trim();
        if (!market || !currency || !currencySymbol || !locale) {
            setStatus(s.localeSaveError, true);
            return false;
        }
        LOCALE = { market, currency, currencySymbol, locale };
        saveManualLocale(LOCALE);
        renderManualLocaleSection(s);
        return true;
    }

    function buildPanel() {
        const s = refreshLocale();
        const savedSettings = loadSettings();
        const rangeValue = savedSettings?.rangeMonths ?? DEFAULT_RANGE_MONTHS;
        const targetStayValue = savedSettings?.targetStayWeeks ?? DEFAULT_TARGET_STAY_WEEKS;
        const flexibilityValue = savedSettings?.flexibilityPercent ?? DEFAULT_FLEXIBILITY_PERCENT;
        // No weekday selected = every day is allowed. Older saved settings listed all seven days.
        const validDays = (v) => (Array.isArray(v) && v.length < 7 && v.every((d) => DAY_ORDER.includes(d)) ? v : []);
        const outDaysValue = validDays(savedSettings?.outDays);
        const inDaysValue = validDays(savedSettings?.inDays);
        const directOnlyValue = savedSettings?.directOnly === true;
        // Short weekday names in the UI language (2024-01-07 was a Sunday = Date#getDay 0)
        const weekdayLabel = (day) =>
            new Intl.DateTimeFormat(uiLang(), { weekday: "short" }).format(new Date(2024, 0, 7 + day)).replace(/\.$/, "");
        const daysHtml = (selected) =>
            DAY_ORDER.map(
                (d) => `<button type="button" class="sky-day" data-day="${d}" aria-pressed="${selected.includes(d)}">${weekdayLabel(d)}</button>`,
            ).join("");

        const styleTag = document.createElement("style");
        styleTag.textContent = STYLE;
        document.head.appendChild(styleTag);

        panel = document.createElement("div");
        panel.id = "sky-panel";
        panel.innerHTML = `
      <div id="sky-panel-scroll" tabindex="0">
        <div class="sky-head"><h3>${s.title}</h3><button id="sky-close" type="button" aria-label="${s.closePanel}" title="${s.closePanel}">✕</button></div>
        <details id="sky-settings" open>
          <summary>${s.settings}</summary>
          <div class="sky-field"><label for="sky-range">${s.searchRange}</label><input id="sky-range" type="number" min="1" max="12" value="${rangeValue}"></div>
          <div class="sky-field"><label for="sky-target-w">${s.targetStay}</label><input id="sky-target-w" type="number" min="1" max="6" step="0.5" value="${targetStayValue}"></div>
          <div class="sky-field"><label for="sky-tolerance">${s.flexibility} <span id="sky-nights-preview" style="color:#6b7280"></span></label><input id="sky-tolerance" type="number" min="0" max="100" value="${flexibilityValue}"></div>
          <div class="sky-days-field"><span class="sky-days-label">${s.outboundDays} <span class="sky-days-hint">· ${s.anyDay}</span></span><div class="sky-days" data-group="out">${daysHtml(outDaysValue)}</div></div>
          <div class="sky-days-field"><span class="sky-days-label">${s.returnDays} <span class="sky-days-hint">· ${s.anyDay}</span></span><div class="sky-days" data-group="in">${daysHtml(inDaysValue)}</div></div>
          <div class="sky-field"><label for="sky-direct-only">${s.directOnly}</label><input id="sky-direct-only" type="checkbox"${directOnlyValue ? " checked" : ""}></div>
          <div id="sky-manual-locale" hidden></div>
          <button id="sky-start">${s.startSearch}</button>
        </details>
        <div id="sky-status" role="status" aria-live="polite"></div>
        <button id="sky-retry" hidden>${s.retryFailed}</button>
        <div id="sky-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="sky-progress-bar"></div></div>
        <div id="sky-results"></div>
      </div>
      <div id="sky-scroll-thumb" aria-hidden="true"></div>
    `;
        document.body.appendChild(panel);

        // The panel can be closed at any screen size and reopened via the icon button.
        const fab = document.createElement("button");
        fab.id = "sky-fab";
        fab.type = "button";
        fab.hidden = true;
        fab.setAttribute("aria-label", s.openPanel);
        fab.title = s.openPanel;
        document.body.appendChild(fab);
        // While the full-screen panel is open, the page behind it must not scroll.
        const phoneQuery = window.matchMedia("(max-width: 600px)");
        const updateScrollLock = () => {
            const locked = phoneQuery.matches && !panel.classList.contains("sky-closed");
            document.documentElement.classList.toggle("sky-lock", locked);
        };
        const setClosed = (closed) => {
            panel.classList.toggle("sky-closed", closed);
            fab.hidden = !closed;
            updateScrollLock();
        };
        phoneQuery.addEventListener("change", updateScrollLock);
        updateScrollLock();
        panel.querySelector("#sky-close").onclick = () => setClosed(true);
        fab.onclick = () => setClosed(false);

        statusEl =panel.querySelector("#sky-status");
        resultsEl = panel.querySelector("#sky-results");
        progressTrack = panel.querySelector("#sky-progress-track");
        progressBar = panel.querySelector("#sky-progress-bar");
        panel.querySelector("#sky-start").onclick = runSearch;
        panel.querySelector("#sky-retry").onclick = retryFailedPrices;
        panel.querySelectorAll("input").forEach((input) => {
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") runSearch();
            });
        });

        renderManualLocaleSection(s);

        const previewEl = panel.querySelector("#sky-nights-preview");
        const rangeInput = panel.querySelector("#sky-range");
        const targetInput = panel.querySelector("#sky-target-w");
        const toleranceInput = panel.querySelector("#sky-tolerance");
        const updatePreview = () => {
            const { minNights, maxNights } = computeNightsWindow(Number(targetInput.value), Number(toleranceInput.value));
            previewEl.textContent = t().nightsRange(minNights, maxNights);
        };
        const persistSettings = () => {
            saveSettings({
                rangeMonths: Number(rangeInput.value),
                targetStayWeeks: Number(targetInput.value),
                flexibilityPercent: Number(toleranceInput.value),
                outDays: selectedDays("out"),
                inDays: selectedDays("in"),
                directOnly: panel.querySelector("#sky-direct-only").checked,
            });
        };
        // The "any" hint is only shown while no weekday of a group is selected
        const updateDayHints = () => {
            panel.querySelectorAll(".sky-days-field").forEach((field) => {
                const none = !field.querySelector('.sky-day[aria-pressed="true"]');
                field.querySelector(".sky-days-hint").hidden = !none;
            });
        };
        panel.querySelectorAll(".sky-day").forEach((btn) => {
            btn.addEventListener("click", () => {
                btn.setAttribute("aria-pressed", String(btn.getAttribute("aria-pressed") !== "true"));
                updateDayHints();
                persistSettings();
            });
        });
        updateDayHints();
        panel.querySelector("#sky-direct-only").addEventListener("change", persistSettings);
        targetInput.addEventListener("input", updatePreview);
        toleranceInput.addEventListener("input", updatePreview);
        [rangeInput, targetInput, toleranceInput].forEach((input) => input.addEventListener("input", persistSettings));
        updatePreview();

        setupCustomScrollbar();
    }

    // Weekdays (Date#getDay values) currently selected in a group; empty = none selected
    function selectedDays(group) {
        return [...panel.querySelectorAll(`.sky-days[data-group="${group}"] .sky-day[aria-pressed="true"]`)].map((b) => Number(b.dataset.day));
    }

    // Search filters from the panel; no weekday selected means every day is allowed
    function readFilters() {
        const days = (group) => new Set(selectedDays(group).length ? selectedDays(group) : DAY_ORDER);
        return { outDays: days("out"), inDays: days("in"), directOnly: panel.querySelector("#sky-direct-only").checked };
    }

    function setupCustomScrollbar() {
        const scrollEl = panel.querySelector("#sky-panel-scroll");
        const thumb = panel.querySelector("#sky-scroll-thumb");
        const MIN_THUMB_HEIGHT = 24;
        const CORNER_INSET = 12; // matches #sky-panel's border-radius so the thumb never pokes into the rounded corner

        function trackMetrics() {
            const trackHeight = scrollEl.clientHeight;
            const contentHeight = scrollEl.scrollHeight;
            const usableHeight = trackHeight - 2 * CORNER_INSET;
            const thumbHeight = Math.max(MIN_THUMB_HEIGHT, (trackHeight / contentHeight) * usableHeight);
            const maxThumbTop = usableHeight - thumbHeight;
            const scrollableDist = contentHeight - trackHeight;
            return { trackHeight, contentHeight, thumbHeight, maxThumbTop, scrollableDist };
        }

        function update() {
            const { trackHeight, contentHeight, thumbHeight, maxThumbTop, scrollableDist } = trackMetrics();
            if (contentHeight <= trackHeight + 1) {
                thumb.style.display = "none";
                return;
            }
            const thumbTop = CORNER_INSET + (scrollEl.scrollTop / scrollableDist) * maxThumbTop;
            thumb.style.display = "block";
            thumb.style.height = `${thumbHeight}px`;
            thumb.style.top = `${thumbTop}px`;
        }

        scrollEl.addEventListener("scroll", update);
        window.addEventListener("resize", update);
        new MutationObserver(update).observe(scrollEl, { childList: true, subtree: true, characterData: true });

        let dragStartY = 0;
        let dragStartScrollTop = 0;
        thumb.addEventListener("mousedown", (e) => {
            e.preventDefault();
            dragStartY = e.clientY;
            dragStartScrollTop = scrollEl.scrollTop;
            thumb.classList.add("sky-dragging");
            const { maxThumbTop, scrollableDist } = trackMetrics();
            const onMove = (moveEvent) => {
                const deltaY = moveEvent.clientY - dragStartY;
                const deltaScroll = (deltaY / maxThumbTop) * scrollableDist;
                scrollEl.scrollTop = dragStartScrollTop + deltaScroll;
            };
            const onUp = () => {
                thumb.classList.remove("sky-dragging");
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        });

        update();
    }

    // ============================================================
    // RESULT RANKING, RENDERING & REAL-PRICE LOOKUP
    // ============================================================

    function pickDiverse(candidates, limit) {
        const weekBucket = (c) => Math.floor(c.outDate.getTime() / (7 * 86400000));
        const picked = [];
        const usedBuckets = new Set();
        for (const c of candidates) {
            if (picked.length >= limit) break;
            const bucket = weekBucket(c);
            if (usedBuckets.has(bucket)) continue;
            usedBuckets.add(bucket);
            picked.push(c);
        }
        for (const c of candidates) {
            if (picked.length >= limit) break;
            if (!picked.includes(c)) picked.push(c);
        }
        return picked;
    }

    let lastTop = [];
    let lastOrigin = "";
    let lastDestination = "";

    function cardHtml(c, i, isShortestOneLayover, origin, destination) {
        const s = t();
        const realPrice = acceptablePrice(c.realStopPrices);
        const displayPrice = Number.isFinite(realPrice) ? realPrice : c.price;
        const formatHint = currencyFormatFromPayload(c.realStopPrices);
        return `
          <a class="sky-card${c.realStopPrices === null ? " sky-card-failed" : ""}" data-idx="${i}" href="${skyscannerLink(origin, destination, c.outDate, c.inDate)}" target="_blank" rel="noopener noreferrer">
            <div class="sky-price-row">
              <span class="sky-rank">${i + 1}</span>
              <span class="sky-price"${c.quotedAt ? ` title="${s.priceSnapshotFrom(fmtDateTime(c.quotedAt))}"` : ""}>${formatPrice(displayPrice, formatHint)}</span>
            </div>
            <div class="sky-dates">${fmtDate(c.outDate)} → ${fmtDate(c.inDate)} (${s.nightsSuffix(c.nights)})</div>
            <span class="sky-real-prices" data-real-prices>${c.realStopPrices !== undefined ? stopPricesLabel(c.realStopPrices, isShortestOneLayover) : ""}</span>
          </a>`;
    }

    // Rank 1 (list position) already conveys "cheapest card" - no extra card color for that,
    // so it doesn't compete on the same visual level with the chip-only highlight of the
    // shortest one-stop layover (shortestOneLayoverIdx).
    function renderCards() {
        let shortestOneLayoverIdx = -1;
        let shortestOneLayoverMinutes = Infinity;
        lastTop.forEach((c, i) => {
            const minutes = c.realStopPrices?.categories?.one?.maxLayoverMinutes;
            if (!directOnly && Number.isFinite(minutes) && minutes > 0 && minutes < shortestOneLayoverMinutes) {
                shortestOneLayoverMinutes = minutes;
                shortestOneLayoverIdx = i;
            }
        });
        resultsEl.innerHTML = lastTop.length
            ? lastTop.map((c, i) => cardHtml(c, i, i === shortestOneLayoverIdx, lastOrigin, lastDestination)).join("")
            : `<div class="sky-empty">${t().noResults}</div>`;
    }

    function renderResults(candidates, origin, destination) {
        lastTop = pickDiverse(candidates, 5);
        lastOrigin = origin;
        lastDestination = destination;
        renderCards();
    }

    function fmtLayover(minutes) {
        if (!minutes || minutes <= 0) return "";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return t().maxLayover(h, m);
    }

    // Set at the start of each search from the "Direct flights only" checkbox; retries of failed
    // price lookups keep using the value the search was started with.
    let directOnly = false;

    function directOnePrices(payload) {
        const stopPrices = payload?.stopPrices;
        const direct = stopPrices?.direct?.isPresent ? stopPrices.direct.rawPrice : Infinity;
        const one = !directOnly && stopPrices?.one?.isPresent ? stopPrices.one.rawPrice : Infinity;
        return { direct, one };
    }

    function acceptablePrice(payload) {
        const { direct, one } = directOnePrices(payload);
        return Math.min(direct, one);
    }

    function bestPriceCategory(payload) {
        const { direct, one } = directOnePrices(payload);
        if (!Number.isFinite(direct) && !Number.isFinite(one)) return null;
        return direct <= one ? "direct" : "one";
    }

    // Tiebreak order on equal price: closeness to the desired trip length beats layover time
    // beats direct-flight price, because trip length is an explicit user setting while the
    // direct-flight price is just a side aspect.
    function compareCandidates(a, b, targetNights) {
        const priceA = acceptablePrice(a.realStopPrices);
        const priceB = acceptablePrice(b.realStopPrices);
        // Infinity - Infinity is NaN, which would skip the tiebreakers below; unloaded cards stay at the end
        if (priceA !== priceB) return priceA < priceB ? -1 : 1;

        if (Number.isFinite(targetNights)) {
            const durationDiff = Math.abs(a.nights - targetNights) - Math.abs(b.nights - targetNights);
            if (durationDiff !== 0) return durationDiff;
        }

        const layoverOf = (c) => {
            const minutes = c.realStopPrices?.categories?.one?.maxLayoverMinutes;
            return Number.isFinite(minutes) ? minutes : Infinity;
        };
        const layoverDiff = layoverOf(a) - layoverOf(b);
        if (layoverDiff !== 0) return layoverDiff;

        return directOnePrices(a.realStopPrices).direct - directOnePrices(b.realStopPrices).direct;
    }

    function stopPricesLabel(payload, isShortestOneLayover) {
        const s = t();
        if (!payload?.stopPrices) return `<span class="sky-chip-error">⚠ ${s.couldNotLoad}</span>`;
        const { stopPrices, categories } = payload;
        const bestCat = bestPriceCategory(payload);
        const chip = (cat, prefix, formattedPrice, suffix, muted) => {
            const classes = ["sky-chip"];
            if (muted) classes.push("sky-chip-muted");
            if (cat === "one" && isShortestOneLayover) classes.push("sky-chip-shortest-layover");
            const priceClass = cat === bestCat ? "sky-chip-best-price" : "";
            return `<span class="${classes.join(" ")}">${prefix} <span class="${priceClass}">${formattedPrice}</span>${suffix}</span>`;
        };
        const parts = [];
        if (stopPrices.direct?.isPresent) parts.push(chip("direct", s.direct, stopPrices.direct.formattedPrice, "", false));
        else if (directOnly) parts.push(chip("direct", s.direct, "–", "", true));
        if (!directOnly && stopPrices.one?.isPresent) {
            const layover = fmtLayover(categories?.one?.maxLayoverMinutes);
            parts.push(chip("one", s.oneStop, stopPrices.one.formattedPrice, layover, false));
        }
        if (!directOnly && stopPrices.twoOrMore?.isPresent) {
            const layover = fmtLayover(categories?.twoOrMore?.maxLayoverMinutes);
            parts.push(chip("twoOrMore", s.twoOrMoreStops, stopPrices.twoOrMore.formattedPrice, layover, true));
        }
        return parts.join("");
    }

    let lastPriorNote = "";
    let lastTargetNights = NaN;

    const hasRealPrices = (c) => Boolean(c.realStopPrices?.stopPrices);

    async function fetchRealPrices(priorNote, targetNights, indices = lastTop.map((_, i) => i), isRetry = false) {
        const s = t();
        let done = 0;
        const total = indices.length;
        lastPriorNote = priorNote;
        lastTargetNights = targetNights;
        const retryEl = panel.querySelector("#sky-retry");
        retryEl.hidden = true;
        setProgress(0);
        setStatus(s.checkingPrices(0, total));

        const jobs = indices.map(async (i) => {
            const c = lastTop[i];
            const cardEl = resultsEl.querySelector(`.sky-card[data-idx="${i}"]`);
            const pricesEl = cardEl?.querySelector("[data-real-prices]");
            cardEl?.classList.remove("sky-card-failed");
            if (pricesEl) pricesEl.innerHTML = '<span class="sky-loading"><span class="sky-spinner"></span></span>';
            const url = skyscannerLink(lastOrigin, lastDestination, c.outDate, c.inDate);
            const payload = await scrapeInTab(url);
            if (isRetry) console.info(`[Sky] Retry for ${fmtDate(c.outDate)}→${fmtDate(c.inDate)}: ${payload ? "succeeded" : "failed again"}`);
            c.realStopPrices = payload;
            cardEl?.classList.toggle("sky-card-failed", !payload);
            if (pricesEl) pricesEl.innerHTML = stopPricesLabel(payload);
            const priceEl = cardEl?.querySelector(".sky-price");
            const realPrice = acceptablePrice(payload);
            if (priceEl && Number.isFinite(realPrice))
                priceEl.textContent = formatPrice(realPrice, currencyFormatFromPayload(payload));
            done++;
            setProgress(done / total);
            setStatus(s.checkingPrices(done, total));
        });
        await Promise.all(jobs);
        lastTop.sort((a, b) => compareCandidates(a, b, targetNights));
        renderCards();
        const failed = lastTop.filter((c) => !hasRealPrices(c)).length;
        const realPriceNote = failed ? s.realPriceFailures : "";
        const hint = priorNote || realPriceNote ? s.reloadHint : "";
        const combinedNote = [priorNote, realPriceNote, hint].filter(Boolean).join(" · ");
        setStatus(combinedNote, Boolean(priorNote || realPriceNote));
        retryEl.hidden = !failed;
        hideProgress(400);
    }

    function retryFailedPrices() {
        const indices = lastTop.flatMap((c, i) => (hasRealPrices(c) ? [] : [i]));
        if (indices.length) fetchRealPrices(lastPriorNote, lastTargetNights, indices, true);
    }

    // ============================================================
    // TOP-LEVEL SEARCH ORCHESTRATION
    // ============================================================

    async function runSearch() {
        const s = refreshLocale();
        if (!applyManualLocale(s)) return;
        const { origin, destination } = parseRoute();
        if (!origin || !destination) {
            setStatus(s.routeError, true);
            return;
        }
        const rangeMonths = Math.min(12, Math.max(1, Number(panel.querySelector("#sky-range").value)));
        const { minNights, maxNights, targetNights } = computeNightsWindow(
            Number(panel.querySelector("#sky-target-w").value),
            Number(panel.querySelector("#sky-tolerance").value),
        );
        const filters = readFilters();
        directOnly = filters.directOnly;
        resultsEl.innerHTML = "";
        logDebug(
            DEBUG,
            `[Sky] Search start: ${origin}→${destination}, rangeMonths=${rangeMonths}, targetNights=${targetNights}, nightsWindow=[${minNights},${maxNights}]`,
        );

        const { pairs, today, endYM } = neededPairs(rangeMonths, minNights, maxNights);
        const horizonDate = toDate(endYM, daysInMonth(endYM));
        const candidates = [];
        const failedPairs = [];

        for (let i = 0; i < pairs.length; i++) {
            const { outYM, inYM } = pairs[i];
            setProgress(i / pairs.length);
            setStatus(s.loading(i + 1, pairs.length, minNights, maxNights));
            let fromCache = false;
            try {
                const result = await fetchGrid(origin, destination, outYM, inYM);
                fromCache = result.fromCache;
                logDebug(
                    DEBUG,
                    `[Sky] Grid ${ymKey(outYM)}→${ymKey(inYM)}: ${fromCache ? "from cache" : "fresh fetch"}, raw min price (any nights)=${gridMinPrice(result.data)}`,
                );
                collectCandidates(result.data, today, horizonDate, minNights, maxNights, candidates, filters);
                logDebug(DEBUG, `[Sky]   candidates so far: ${candidates.length}`);
            } catch (err) {
                failedPairs.push(`${ymKey(outYM)}→${ymKey(inYM)}`);
                console.warn(`[Sky] Grid request failed (${ymKey(outYM)}→${ymKey(inYM)}):`, err);
            }
            if (!fromCache && i < pairs.length - 1) await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
        }

        setProgress(1);
        candidates.sort((a, b) => a.price - b.price);
        if (DEBUG) {
            const top10Str = candidates
                .slice(0, 10)
                .map((c, i) => `${i + 1}. ${fmtDate(c.outDate)}→${fmtDate(c.inDate)} (${c.nights}n) ${c.price}`)
                .join(" | ");
            logDebug(DEBUG, `[Sky] Search done: ${candidates.length} candidates total, top10: ${top10Str}`);
        }
        const gridFailureNote = failedPairs.length ? s.gridFailures : "";
        renderResults(candidates, origin, destination);
        panel.querySelector("#sky-start").textContent = s.searchAgain;
        if (!candidates.length) {
            setStatus(
                gridFailureNote ? `${gridFailureNote} · ${s.reloadHint}` : s.doneNoResults(pairs.length),
                Boolean(gridFailureNote),
            );
            hideProgress(400);
        } else {
            fetchRealPrices(gridFailureNote, targetNights);
            panel.classList.add("sky-has-results");
            const settings = panel.querySelector("#sky-settings");
            if (settings) settings.open = false;
        }
    }

    // ============================================================
    // BOOTSTRAP
    // ============================================================

    if (isScrapeTab()) {
        runScrapeMode();
    } else if (isSearchPage()) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", buildPanel);
        } else {
            buildPanel();
        }
    }
})();
