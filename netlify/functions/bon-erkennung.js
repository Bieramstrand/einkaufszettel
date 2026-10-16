// Diese Funktion läuft auf dem Netlify Server, nicht im Browser.
// Der Perplexity API Key liegt hier als Umgebungsvariable (PERPLEXITY_API_KEY)
// und wird niemals an den Browser ausgeliefert. Sie liest Kassenbons aus Fotos.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Methode nicht erlaubt' }) };
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Auf dem Server ist noch kein PERPLEXITY_API_KEY hinterlegt.' })
    };
  }

  let content;
  try {
    const eingabe = JSON.parse(event.body || '{}');
    content = eingabe.content;
    if (!content) throw new Error('Kein Inhalt übergeben');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ungültige Anfrage' }) };
  }

  try {
    const antwortRoh = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'sonar',
        temperature: 0.1,
        messages: [{ role: 'user', content }]
      })
    });

    const antwortDaten = await antwortRoh.json();

    return {
      statusCode: antwortRoh.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(antwortDaten)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Serverfehler: ' + e.message })
    };
  }
};
