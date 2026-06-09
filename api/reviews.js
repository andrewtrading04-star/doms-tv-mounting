export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  // Place ID is public (it's in the Maps URL), so hardcode the correct one.
  // Verified via Google Places API for "Doms TV Mounting Colorado".
  // NOT read from env on purpose — the Vercel GOOGLE_PLACE_ID var holds a stale/wrong value.
  const PLACE_ID = 'ChIJkRoSYfRKaYcR7awWLC--OWI';

  if (!API_KEY) {
    console.error('Missing GOOGLE_PLACES_API_KEY');
    return res.status(500).json({ error: 'API not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,name,rating,user_ratings_total&reviews_sort=newest&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google API error:', data.status, data.error_message);
      return res.status(400).json({ error: data.error_message || 'Failed to fetch reviews' });
    }

    const fiveStarReviews = (data.result.reviews || [])
      .filter(r => r.rating === 5)
      .sort((a, b) => b.time - a.time)
      .slice(0, 12)
      .map(r => ({
        author:          r.author_name,
        rating:          r.rating,
        text:            r.text,
        time:            r.time * 1000,
        relativeTime:    r.relative_time_description,
        profilePhotoUrl: r.profile_photo_url || null,
      }));

    return res.status(200).json({
      name:             data.result.name,
      overallRating:    data.result.rating,
      totalReviews:     data.result.user_ratings_total,
      fiveStarReviews,
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
