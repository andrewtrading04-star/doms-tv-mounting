export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API not configured' });

  try {
    // Find the business by phone number
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=%2B17208006095&inputtype=phonenumber&fields=place_id,name,rating,user_ratings_total&key=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK' || !searchData.candidates?.length) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Find Doms TV Mounting Colorado (Denver) — it will have more reviews than Fort Collins
    let location = searchData.candidates[0];
    if (searchData.candidates.length > 1) {
      location = searchData.candidates.reduce((prev, curr) =>
        (curr.user_ratings_total || 0) > (prev.user_ratings_total || 0) ? curr : prev
      );
    }

    const PLACE_ID = location.place_id;

    // Fetch full details with reviews
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,name,rating,user_ratings_total&reviews_sort=newest&key=${API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    if (detailsData.status !== 'OK') {
      return res.status(400).json({ error: detailsData.error_message || 'Failed to fetch details' });
    }

    // Filter for 5-star reviews with text, newest first
    const fiveStarReviews = (detailsData.result.reviews || [])
      .filter(r => r.rating === 5 && r.text && r.text.trim().length > 0)
      .slice(0, 12)
      .map(r => ({
        author:          r.author_name,
        rating:          5,
        text:            r.text,
        time:            r.time * 1000,
        relativeTime:    r.relative_time_description,
        profilePhotoUrl: r.profile_photo_url || null,
      }));

    return res.status(200).json({
      name:          detailsData.result.name,
      overallRating: detailsData.result.rating,
      totalReviews:  detailsData.result.user_ratings_total,
      fiveStarReviews,
    });
  } catch (err) {
    console.error('Reviews API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
