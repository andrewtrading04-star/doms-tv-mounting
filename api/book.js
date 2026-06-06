export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const ZBK_KEY = process.env.ZENBOOKER_API_KEY;
  if (!ZBK_KEY) return res.status(500).json({ error: 'ZENBOOKER_API_KEY missing' });

  const {
    kind, territory_id, service_id, selectedSlot,
    customer, city, state, postal_code, zbk_selections, tip, payment_method_id,
  } = req.body || {};

  if (!territory_id)      return res.status(400).json({ error: 'territory_id required' });
  if (!service_id)        return res.status(400).json({ error: 'service_id required' });
  if (!customer?.email)   return res.status(400).json({ error: 'customer.email required' });
  if (!customer?.phone)   return res.status(400).json({ error: 'customer.phone required' });
  if (!customer?.address) return res.status(400).json({ error: 'customer.address required' });
  if (kind === 'booking' && !selectedSlot) {
    return res.status(400).json({ error: 'selectedSlot required for a booking' });
  }

  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();

  const services = [{ service_id, selections: zbk_selections || [] }];
  if (tip && Number(tip) > 0) {
    services.push({ custom_service: { name: 'Tip for technician', price: Number(tip), duration: 0, taxable: false } });
  }

  const payload = {
    territory_id,
    services,
    customer: { name: fullName, email: customer.email, phone: customer.phone },
    address: {
      line1:       customer.address,
      city:        city        || '',
      state:       state       || '',
      postal_code: postal_code || customer.zip || '',
      country:     'US',
    },
    email_notifications: false,
    sms_notifications:   false,
    ...(kind === 'booking' && selectedSlot && { timeslot_id: selectedSlot }),
  };

  try {
    const r = await fetch('https://api.zenbooker.com/v1/jobs', {
      method:  'POST',
      headers: { Authorization: `Bearer ${ZBK_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[book] Zenbooker error', r.status, JSON.stringify(data));
      return res.status(r.status).json({ error: data?.error?.message || data?.message || 'Booking failed', details: data });
    }

    const jobId = data.job_id || data.id;

    // If payment method was saved, add it as a note on the job
    if (payment_method_id && jobId) {
      try {
        await fetch(`https://api.zenbooker.com/v1/jobs/${jobId}/notes`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${ZBK_KEY}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text: `Saved payment method: ${payment_method_id}` }),
        });
      } catch (noteErr) {
        console.warn('[book] Failed to add payment note:', noteErr.message);
        // Don't fail the whole booking if the note fails
      }
    }

    return res.status(200).json({ success: true, job_id: jobId, status: data.status });
  } catch (err) {
    console.error('[book] fetch error:', err.message);
    return res.status(500).json({ error: 'Booking request failed', message: err.message });
  }
}
