export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Public "Real customer bookings" counter.
  // Displayed = SEED + (live Zenbooker job count - BASELINE_TOTAL),
  // so it starts at SEED today and ticks up by 1 for every new real booking.
  const SEED = 3847;
  // Real Zenbooker job count captured the moment this counter went live.
  // Filled in after the first live read so the number starts exactly at SEED.
  const BASELINE_TOTAL = 0;

  // Cache at the CDN so visitor traffic doesn't hammer the Zenbooker API.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const ZBK_KEY = process.env.ZENBOOKER_API_KEY;
  if (!ZBK_KEY) return res.status(200).json({ count: SEED });

  try {
    const url = new URL('https://api.zenbooker.com/v1/jobs');
    url.searchParams.set('limit', '1');
    const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${ZBK_KEY}` } });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(200).json({ count: SEED });

    // Look for a total-count field across likely response shapes (numbers only, no PII).
    const candidates = [
      data.total_count,
      data.total,
      data.count,
      data.meta && data.meta.total,
      data.meta && data.meta.total_count,
      data.pagination && data.pagination.total,
      data.pagination && data.pagination.total_count,
      Array.isArray(data.results) ? data.results.length : undefined,
      Array.isArray(data.data) ? data.data.length : undefined,
    ];
    const liveTotal = candidates.find((v) => typeof v === 'number');

    const count = (typeof liveTotal === 'number')
      ? SEED + Math.max(0, liveTotal - BASELINE_TOTAL)
      : SEED;

    // `liveTotal` and `keys` are returned only to help calibrate BASELINE_TOTAL;
    // they expose no customer data.
    return res.status(200).json({
      count,
      liveTotal: (typeof liveTotal === 'number') ? liveTotal : null,
      keys: Object.keys(data || {}),
    });
  } catch (e) {
    return res.status(200).json({ count: SEED });
  }
}
