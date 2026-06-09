export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send('GOOGLE_CLIENT_ID environment variable not set in Vercel');
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  'https://doms-tv-mounting.vercel.app/api/auth/callback',
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/business.manage',
    access_type:   'offline',
    prompt:        'consent',
  });

  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
