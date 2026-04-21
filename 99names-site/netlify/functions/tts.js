// Netlify serverless function: proxies Google TTS to avoid CORS
exports.handler = async function(event) {
  const text = event.queryStringParameters && event.queryStringParameters.q;
  if (!text) {
    return { statusCode: 400, body: 'Missing q parameter' };
  }

  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=' 
              + encodeURIComponent(text);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return { statusCode: response.status, body: 'TTS fetch failed' };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};
