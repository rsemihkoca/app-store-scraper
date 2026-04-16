import type { App } from '../types/app.js';
import type { SearchOptions } from '../types/options.js';
import { doRequest, lookup, storeId } from './common.js';

const MZ_SEARCH_URL =
  'https://search.itunes.apple.com/WebObjects/MZStore.woa/wa/search?clientApplication=Software&media=software&term=';

function paginate<T>(arr: T[], num: number, page: number): T[] {
  const p = Math.max(1, page) - 1;
  const start = num * p;
  return arr.slice(start, start + num);
}

/**
 * Alternative search using Apple's MZStore endpoint.
 * Drop-in replacement for `search()` — same options, same return type.
 *
 * Uses the internal storefront API that the App Store web client calls,
 * which still works after Apple deprecated `itunes.apple.com/search`.
 *
 * Two-step process (same pattern as PlayStoreService.searchWithDetails):
 *   1. MZStore search → returns app IDs
 *   2. iTunes lookup by IDs → returns full App objects
 */
export async function mzSearch(options: SearchOptions): Promise<App[] | number[]> {
  const { term, num = 50, page = 1, country = 'us', lang, idsOnly, requestOptions } = options;

  if (!term) {
    throw new Error('term is required');
  }

  const url = MZ_SEARCH_URL + encodeURIComponent(term);
  const storeFront = storeId(country);
  const language = lang || 'en-us';

  const body = await doRequest(url, {
    headers: {
      'X-Apple-Store-Front': `${storeFront},24 t:native`,
      'Accept-Language': language,
      ...(requestOptions?.headers || {}),
    },
  });

  const parsed: unknown = JSON.parse(body);

  // MZStore returns { bubbles: [{ results: [{ id: number }, ...] }] }
  const bubbles = (parsed as Record<string, unknown>)?.bubbles;
  const firstBubble = Array.isArray(bubbles) ? bubbles[0] : undefined;
  const rawResults = (firstBubble as Record<string, unknown>)?.results;
  const ids: number[] = Array.isArray(rawResults)
    ? rawResults.map((r: Record<string, unknown>) => r.id as number).filter(Boolean)
    : [];

  if (ids.length === 0) return [];

  const windowedIds = paginate(ids, num, page);

  if (idsOnly) {
    return windowedIds;
  }

  // Lookup full details via iTunes API (same as the rest of the library)
  return lookup(windowedIds, 'id', country, lang, requestOptions);
}
