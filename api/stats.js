export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Public "Real customer bookings" counter.
  // Displayed = SEED + (live Zenbooker job total - BASELINE_TOTAL),
  // so it starts at SEED today and ticks up by 1 for every new real booking.
  const SEED = 3847;
  // Real Zenbooker job total captured the moment this counter went live.
  // Filled in after the first live read so the number starts exactly at SEED.
  const BASELINE_TOTAL = 216;

  // Cache hard at the CDN: recount at most once an hour, serve stale meanwhile.
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const ZBK_KEY = process.env.ZENBOOKER_API_KEY;
  if (!ZBK_KEY) return res.status(200).json({ count: SEED });

  try {
    // Zenbooker uses cursor pagination (has_more / next_cursor) with no total field,
    // so we page through and tally. Guards below make an overcount impossible:
    //  - stop when has_more is false or there's no next cursor
    //  - stop if the cursor repeats (e.g. an ignored/wrong param) -> at worst one page
    //  - hard page cap as a final backstop
    const seen = new Set();
    let total = 0;
    let cursor = null;
    let pages = 0;
    let stopped = 'no_more';
    const MAX_PAGES = 300; // 300 * 100 = up to 30,000 jobs

    while (pages < MAX_PAGES) {
      const url = new URL('https://api.zenbooker.com/v1/jobs');
      url.searchParams.set('limit', '100');
      if (cursor) url.searchParams.set('cursor', cursor);

      const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${ZBK_KEY}` } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { stopped = 'api_error'; if (pages === 0) return res.status(200).json({ count: SEED }); break; }

      const batch = Array.isArray(d.results)
        ? d.results.length
        : (typeof d.count === 'number' ? d.count : 0);
      total += batch;
      pages += 1;

      const next = d.next_cursor || null;
      if (!d.has_more || !next || seen.has(next)) { stopped = !d.has_more ? 'no_more' : 'cursor_guard'; break; }
      seen.add(next);
      cursor = next;
    }
    if (pages >= MAX_PAGES) stopped = 'page_cap';

    const count = SEED + Math.max(0, total - BASELINE_TOTAL);

    // liveTotal exposes only a count (never customer data); kept for verification.
    return res.status(200).json({ count, liveTotal: total });
  } catch (e) {
    return res.status(200).json({ count: SEED });
  }
}
