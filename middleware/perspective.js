import fetch from 'node-fetch'

export async function moderateText(req, _res, next) {
  try {
    const key = process.env.PERSPECTIVE_API_KEY
    if (!key) return next() 

    const text = String(req.body?.body || '')
    if (!text.trim()) return next()

    const resp = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: { text },
        languages: ['en'],
        requestedAttributes: { TOXICITY: {}, INSULT: {}, PROFANITY: {} }
      })
    })
    const data = await resp.json()
    const tox =
      data.attributeScores?.TOXICITY?.summaryScore?.value ??
      data.attributeScores?.PROFANITY?.summaryScore?.value ??
      0

    // simple threshold; tune as needed
    if (tox >= 0.85) {
      const err = new Error('Comment rejected by moderation')
      err.status = 400
      return next(err)
    }
    // attach scores if you want to store/analyze later
    req.perspective = {
      TOXICITY: data.attributeScores?.TOXICITY?.summaryScore?.value ?? null,
      INSULT: data.attributeScores?.INSULT?.summaryScore?.value ?? null,
      PROFANITY: data.attributeScores?.PROFANITY?.summaryScore?.value ?? null
    }
    next()
  } catch (e) {
    // On API errors, don't block posting; just continue
    next()
  }
}
