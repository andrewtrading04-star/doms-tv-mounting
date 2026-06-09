export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`<html><body style="font-family:sans-serif;padding:40px;">
      <h2 style="color:red;">OAuth Error</h2><p>${error}</p>
    </body></html>`);
  }

  if (!code) {
    return res.status(400).send('No authorization code received.');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  'https://doms-tv-mounting.vercel.app/api/auth/callback',
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return res.status(400).send(`<html><body style="font-family:sans-serif;padding:40px;">
        <h2 style="color:red;">Token Error</h2><p>${tokens.error_description || tokens.error}</p>
      </body></html>`);
    }

    const rt = tokens.refresh_token;
    if (!rt) {
      return res.status(400).send(`<html><body style="font-family:sans-serif;padding:40px;">
        <h2 style="color:orange;">No Refresh Token</h2>
        <p>Google did not return a refresh token. This usually means the account was already authorized.
        Go back to <a href="/api/auth/start">/api/auth/start</a> and try again — make sure to click
        "Allow" even if it says the app is already connected.</p>
      </body></html>`);
    }

    res.status(200).send(`<!DOCTYPE html>
<html>
<head><title>Connected!</title></head>
<body style="font-family:-apple-system,sans-serif;padding:40px;max-width:640px;margin:0 auto;">
  <h1 style="color:#0047AB;">✅ Google Account Connected!</h1>
  <p style="font-size:16px;">Copy the refresh token below and add it to Vercel.</p>

  <div style="background:#f4f4f4;border-radius:8px;padding:16px;word-break:break-all;font-family:monospace;font-size:13px;margin:20px 0;">
    ${rt}
  </div>

  <h2>Step: Add to Vercel</h2>
  <ol style="line-height:2;">
    <li>Go to <strong>vercel.com → your doms-tv-mounting project → Settings → Environment Variables</strong></li>
    <li>Add a new variable: <strong>Name = GBP_REFRESH_TOKEN</strong></li>
    <li>Paste the token above as the value</li>
    <li>Click Save, then <strong>redeploy the project</strong></li>
  </ol>

  <p style="color:#555;">That's it — your reviews carousel will show live Google reviews!</p>
</body>
</html>`);
  } catch (err) {
    return res.status(500).send('Server error: ' + err.message);
  }
}
