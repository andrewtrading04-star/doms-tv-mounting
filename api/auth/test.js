export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GBP_REFRESH_TOKEN,
        grant_type:    'refresh_token',
      }),
    });

    const data = await tokenRes.json();

    if (data.error) {
      return res.status(400).json({
        status: 'OAuth token refresh failed',
        error: data.error,
        error_description: data.error_description,
      });
    }

    if (!data.access_token) {
      return res.status(400).json({
        status: 'No access token in response',
        response: data,
      });
    }

    // Token is valid - test the GBP accounts endpoint
    const accountRes = await fetch('https://businessprofiles.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const accountText = await accountRes.text();

    try {
      const accountData = JSON.parse(accountText);
      return res.status(200).json({
        status: 'All systems working',
        token_valid: true,
        accounts_found: accountData.accounts ? accountData.accounts.length : 0,
        accounts: accountData,
      });
    } catch (e) {
      return res.status(500).json({
        status: 'GBP API returned non-JSON',
        raw_response: accountText.substring(0, 1000),
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
