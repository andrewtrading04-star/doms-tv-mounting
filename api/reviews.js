// Google Business Profile API — fetches reviews for Doms TV Mounting Colorado
// Requires one-time OAuth setup. See api/auth/start.js to authenticate.

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GBP_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data));
  return data.access_token;
}

async function gbpFetch(path, accessToken) {
  const res = await fetch(`https://mybusiness.googleapis.com/v4/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

function relativeTime(isoString) {
  const diffDays = Math.floor((Date.now() - new Date(isoString)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GBP_REFRESH_TOKEN'];
  for (const key of required) {
    if (!process.env[key]) {
      return res.status(500).json({ error: `${key} environment variable not set` });
    }
  }

  try {
    const accessToken = await getAccessToken();

    // List accounts (finds Doms TV Mounting Colorado account)
    const accountsData = await gbpFetch('accounts', accessToken);
    if (!accountsData.accounts?.length) {
      return res.status(404).json({ error: 'No GBP accounts found for this Google account' });
    }

    const accountName = accountsData.accounts[0].name; // e.g. "accounts/234320491567939943"

    // List locations under account
    const locData = await gbpFetch(`${accountName}/locations?pageSize=100`, accessToken);
    const locations = locData.locations || [];

    if (!locations.length) {
      return res.status(404).json({ error: 'No locations found under this account' });
    }

    // Prefer the service area business (no fixed address) — that's the Denver one
    const location = locations.find(l => !l.address?.addressLines?.length) || locations[0];
    const locationName = location.name; // e.g. "accounts/.../locations/..."

    // Fetch reviews — newest first
    const reviewsData = await gbpFetch(
      `${locationName}/reviews?pageSize=50&orderBy=updateTime+desc`,
      accessToken,
    );

    const fiveStarReviews = (reviewsData.reviews || [])
      .filter(r => r.starRating === 'FIVE' && r.comment?.trim().length > 0)
      .slice(0, 12)
      .map(r => ({
        author:          r.reviewer?.displayName || 'Google User',
        rating:          5,
        text:            r.comment,
        time:            new Date(r.updateTime).getTime(),
        relativeTime:    relativeTime(r.updateTime),
        profilePhotoUrl: r.reviewer?.profilePhotoUrl || null,
      }));

    return res.status(200).json({
      name:          location.locationName || 'Doms TV Mounting Colorado',
      overallRating: 5.0,
      totalReviews:  location.metadata?.totalReviewCount || fiveStarReviews.length,
      fiveStarReviews,
    });
  } catch (err) {
    console.error('GBP reviews error:', err);
    return res.status(500).json({ error: err.message });
  }
}
