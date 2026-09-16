const KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL_PRIMARY = 'gemini-2.5-flash'
const MODEL_FALLBACK = 'gemini-flash-latest'
const models = [MODEL_PRIMARY, MODEL_FALLBACK]
const URL = 'https://generativelanguage.googleapis.com/v1beta'

export async function chatWithAI(message, location = 'India', language = 'en') {
  if (!KEY) {
    console.error('[Gemini] API key missing from environment')
    return 'AI is not configured correctly. Please contact support.'
  }

  const langNames = { en:'English', hi:'Hindi', kn:'Kannada', ta:'Tamil',
    te:'Telugu', ml:'Malayalam', bn:'Bengali', mr:'Marathi', gu:'Gujarati', pa:'Punjabi' }

  let lastErr = null;
  for (const m of models) {
    try {
      const res = await fetch(`${URL}/models/${m}:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{
            text: `You are VANGUARD AI, a civic assistant. Respond only in ${langNames[language]||'English'}. Be concise (max 3 sentences). User location: ${location||'India'}. Question: ${message}`
          }]}],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      })

      const data = await res.json()
      console.log('[Gemini] raw response:', data)

      if (data.error) {
        console.error(`[Gemini] Model ${m} API error:`, data.error.message)
        throw new Error(data.error.message)
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        console.error(`[Gemini] Model ${m} no text in response:`, data)
        throw new Error('Empty response')
      }

      return text
    } catch (err) {
      console.warn(`Model ${m} failed:`, err)
      lastErr = err
    }
  }

  return `AI error: ${lastErr?.message || 'Could not connect to AI'}`
}

export async function analyzeIssueImage(base64Image, description = '', language = 'en') {
  if (!KEY) {
    console.error('[Gemini] API key missing')
    throw new Error('Gemini API key not configured')
  }

  let lastErr = null;
  for (const m of models) {
    try {
      const res = await fetch(`${URL}/models/${m}:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: `Analyze this civic issue image. Return ONLY valid JSON: {"category":"...","categoryLabel":"...","severity":"green|yellow|orange|red","severityLabel":"...","severityReason":"...","riskType":"...","riskPrediction":"...","impactScore":0-100,"impactFactors":["..."],"recommendedAuthority":"...","escalationLevel":"community|ward|district|emergency","reportText":"...","suggestedAction":"...","isEmergency":false}. Context: "${description||''}". Response language: ${language}` },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON in Gemini response')

      const parsed = JSON.parse(match[0])
      parsed.impactScore = Number(parsed.impactScore) || 0
      return parsed
    } catch (err) {
      console.warn(`Model ${m} failed:`, err)
      lastErr = err
    }
  }

  throw lastErr || new Error('All Gemini models failed')
}
