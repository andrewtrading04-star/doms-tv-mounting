// TEMPORARY read-only diagnostic — inspects Zenbooker service tax config + a job's
// tax fields, to find why Dom's bookings get no tax. Token-gated, PII-stripped.
// Remove after use.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if ((req.query.token || '') !== 'dom-tax-7q2v9z4m8k3f6310x') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const KEY = process.env.ZENBOOKER_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'ZENBOOKER_API_KEY missing' });
  const H = { Authorization: `Bearer ${KEY}` };
  const get = async (path) => {
    try { const r = await fetch('https://api.zenbooker.com' + path, { headers: H });
      const j = await r.json().catch(() => ({})); return { status: r.status, j }; }
    catch (e) { return { error: e.message }; }
  };
  // pull only tax-relevant keys from any object
  const taxKeys = (o) => {
    if (!o || typeof o !== 'object') return o;
    const out = {};
    for (const k of Object.keys(o)) if (/tax/i.test(k)) out[k] = o[k];
    return out;
  };

  const out = {};

  // 1) All services + their tax config
  const svc = await get('/v1/services?limit=50');
  const svcList = svc.j?.results || svc.j?.data || (Array.isArray(svc.j) ? svc.j : []);
  out.services = (svcList || []).map(s => ({
    id: s.id, name: s.name, active: s.active,
    taxable: s.taxable, tax: s.tax, tax_rate: s.tax_rate, tax_name: s.tax_name,
    taxes: s.taxes, tax_rates: s.tax_rates, charge_tax: s.charge_tax,
    taxKeys: taxKeys(s), topKeys: Object.keys(s),
  }));

  // 2) Find job #909609 in recent jobs, dump its tax fields + booked service ids
  const since = '2026-06-01';
  const jobs = await get(`/v1/jobs?start_date_min=${since}&limit=50`);
  const jobList = jobs.j?.results || jobs.j?.data || [];
  const job = (jobList || []).find(j => String(j.job_number) === '909609' || String(j.id) === '909609');
  if (job) {
    out.job_909609 = {
      id: job.id, job_number: job.job_number, status: job.status,
      tax_exempt: job.tax_exempt,
      taxKeys: taxKeys(job),
      invoice: job.invoice ? { ...taxKeys(job.invoice), subtotal: job.invoice.subtotal, total: job.invoice.total, amount_due: job.invoice.amount_due, keys: Object.keys(job.invoice) } : null,
      services: (job.services || []).map(s => ({
        service_id: s.service_id, name: s.name, taxable: s.taxable,
        taxKeys: taxKeys(s), pricing_summary: s.pricing_summary, topKeys: Object.keys(s),
      })),
      jobTopKeys: Object.keys(job),
    };
  } else {
    out.job_909609 = { note: 'not found in jobs since ' + since, jobsScanned: (jobList || []).length };
  }

  res.status(200).json(out);
}
