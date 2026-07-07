import { useCallback, useEffect, useRef, useState } from "react";
import { fallbackArticles } from "../data/floodFallback";

export interface FloodNewsArticle {
  id: string;
  title: string;
  url: string;
  domain: string;
  sourceCountry: string;
  publishedAt: Date | null;
}

interface GdeltRawArticle {
  url?: string;
  url_mobile?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
}

interface GdeltResponse {
  articles?: GdeltRawArticle[];
}

const GDELT_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";

// Public, keyless CORS proxies used only if a direct browser fetch to GDELT is blocked
// (GDELT does not always send permissive CORS headers). Two independent proxies are
// tried in sequence so a single proxy being down/rate-limited doesn't take out live
// updates entirely. If all of them fail, the hook falls back to the curated, real,
// sourced snapshot below rather than showing a dead loading/error state.
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
];

// Real-time news query — no static/mocked content. Pulls the latest English-language
// coverage of Accra/Ghana/Tema flooding directly from GDELT's global news index, which
// aggregates thousands of news outlets (Ghanaian, African and international) in near
// real time. Results are re-fetched periodically so the banner tracks whatever is
// actually being reported right now.
const QUERY =
  '("Accra flood" OR "Ghana flood" OR "Ghana floods" OR "Tema flood" OR "Accra floods" OR "Ghana flooding" OR "Accra flooding") sourcelang:english';

const CACHE_KEY = "aww:flood-news-cache:v1";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const AUTO_REFRESH_MS = 15 * 60 * 1000;

// Per-attempt cap (direct fetch, then each proxy fetch) gets up to this long...
const ATTEMPT_TIMEOUT_MS = 4000;
// ...and a hard overall watchdog that guarantees the whole operation settles even if
// something below (a browser extension silently dropping the request, a hung proxy,
// a captive portal, etc.) never actually rejects the fetch Promise on its own. This is
// the fix for the UI getting stuck on "Loading live flood news…" forever: the banner
// never actually blocks on this — see the useFloodNews state initialization below —
// but the watchdog still guarantees the background upgrade attempt settles promptly.
const HARD_WATCHDOG_MS = 9500;

function parseGdeltDate(raw?: string): Date | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length < 8) return null;
  const year = digits.slice(0, 4);
  const month = digits.slice(4, 6);
  const day = digits.slice(6, 8);
  const hour = digits.slice(8, 10) || "00";
  const minute = digits.slice(10, 12) || "00";
  const second = digits.slice(12, 14) || "00";
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalize(raw: GdeltRawArticle[]): FloodNewsArticle[] {
  const seen = new Set<string>();
  const out: FloodNewsArticle[] = [];
  for (const item of raw) {
    const url = item.url ?? item.url_mobile;
    const title = item.title?.trim();
    if (!url || !title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    let domain = item.domain ?? "";
    if (!domain) {
      try {
        domain = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        domain = "";
      }
    }
    out.push({
      id: url,
      title,
      url,
      domain,
      sourceCountry: item.sourcecountry ?? "",
      publishedAt: parseGdeltDate(item.seendate),
    });
  }
  out.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  return out;
}

interface CachedPayload {
  fetchedAt: number;
  articles: FloodNewsArticle[];
  isLive: boolean;
}

function readCache(): CachedPayload | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      fetchedAt: number;
      isLive: boolean;
      articles: (Omit<FloodNewsArticle, "publishedAt"> & { publishedAt: string | null })[];
    };
    return {
      fetchedAt: parsed.fetchedAt,
      isLive: parsed.isLive,
      articles: parsed.articles.map((a) => ({
        ...a,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
      })),
    };
  } catch {
    return null;
  }
}

function writeCache(articles: FloodNewsArticle[], isLive: boolean) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), articles, isLive }));
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — safe to ignore, just skip caching
  }
}

/** Fetch with its own short timeout, tied to a parent AbortSignal. */
async function fetchWithTimeout(url: string, parentSignal: AbortSignal): Promise<Response> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), ATTEMPT_TIMEOUT_MS);
  const onParentAbort = () => timeoutController.abort();
  parentSignal.addEventListener("abort", onParentAbort);
  try {
    return await fetch(url, { signal: timeoutController.signal, headers: { Accept: "application/json" } });
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener("abort", onParentAbort);
  }
}

async function fetchGdeltArticles(signal: AbortSignal): Promise<GdeltRawArticle[]> {
  const params = new URLSearchParams({
    query: QUERY,
    mode: "artlist",
    format: "json",
    maxrecords: "20",
    sort: "DateDesc",
    timespan: "3months",
  });
  const directUrl = `${GDELT_ENDPOINT}?${params.toString()}`;

  // Attempt 1: direct browser fetch
  try {
    const res = await fetchWithTimeout(directUrl, signal);
    if (res.ok) {
      const data = JSON.parse(await res.text()) as GdeltResponse;
      return data.articles ?? [];
    }
  } catch (err) {
    if ((err as Error).name === "AbortError" && signal.aborted) throw err;
    // otherwise fall through to the proxy attempt
  }

  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  // Attempts 2..N: through public CORS proxies (covers browsers/networks where GDELT's
  // response is blocked by CORS policy rather than actually unreachable). Each proxy is
  // given its own timeout window; if one is down or rate-limited we move on to the next
  // rather than surfacing a hard failure immediately.
  let lastError: unknown = null;
  for (const proxy of CORS_PROXIES) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const proxiedUrl = `${proxy}${encodeURIComponent(directUrl)}`;
      const res = await fetchWithTimeout(proxiedUrl, signal);
      if (!res.ok) {
        lastError = new Error(`News feed returned HTTP ${res.status}`);
        continue;
      }
      const data = JSON.parse(await res.text()) as GdeltResponse;
      return data.articles ?? [];
    } catch (err) {
      if ((err as Error).name === "AbortError" && signal.aborted) throw err;
      lastError = err;
      // try the next proxy
    }
  }
  throw lastError ?? new Error("All live news sources failed");
}

/** Races a promise against a hard timeout, guaranteeing settlement either way. */
function withHardTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout();
      reject(new Error("Live news feed timed out"));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export type FloodNewsStatus = "loading" | "success" | "fallback";

export function useFloodNews() {
  // Start with the real, curated fallback snapshot already loaded — never with an empty
  // array behind a bare "loading" state. This is the actual fix for the banner getting
  // stuck on "Loading live flood news…": previously the first render had nothing to show
  // and depended entirely on a network round trip (direct fetch + proxy + hard timeout)
  // completing before anything appeared. Now there is always real, sourced content on
  // screen immediately, and the hook only silently *upgrades* it to the live GDELT feed
  // in the background if that succeeds.
  const [articles, setArticles] = useState<FloodNewsArticle[]>(fallbackArticles);
  const [status, setStatus] = useState<FloodNewsStatus>("fallback");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const fetchNews = useCallback(async (_opts: { silent?: boolean } = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    setErrorMessage(null);

    const isStale = () => requestIdRef.current !== requestId;

    try {
      const rawArticles = await withHardTimeout(
        fetchGdeltArticles(controller.signal),
        HARD_WATCHDOG_MS,
        () => controller.abort(),
      );

      if (isStale()) return; // a newer request has already taken over

      const normalized = normalize(rawArticles);
      if (normalized.length === 0) {
        // Live feed reachable but returned nothing usable — still better to show the
        // real curated snapshot than an empty ticker.
        throw new Error("No live articles returned");
      }

      setArticles(normalized);
      setStatus("success");
      setLastUpdated(new Date());
      setErrorMessage(null);
      writeCache(normalized, true);
    } catch (err) {
      if (isStale()) return; // superseded by a newer request — let that one own the state

      setErrorMessage(err instanceof Error ? err.message : "Failed to load live news");
      // Never blank out content that's already on screen. If we already have a live feed
      // showing (or a previous successful fallback), leave it as-is rather than
      // downgrading mid-read; only fall back to the curated snapshot if there's somehow
      // nothing to show at all.
      setArticles((prev) => (prev.length > 0 ? prev : fallbackArticles));
      setStatus((prev) => (prev === "success" ? prev : "fallback"));
    }
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS && cached.articles.length > 0) {
      setArticles(cached.articles);
      setStatus(cached.isLive ? "success" : "fallback");
      setLastUpdated(new Date(cached.fetchedAt));
    }
    // Always attempt the live feed in the background — silently, since real content
    // (fallback or cached) is already on screen either way.
    void fetchNews({ silent: true });

    const interval = setInterval(() => void fetchNews({ silent: true }), AUTO_REFRESH_MS);
    return () => {
      clearInterval(interval);
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    articles,
    status,
    lastUpdated,
    errorMessage,
    refresh: () => void fetchNews(),
  };
}
