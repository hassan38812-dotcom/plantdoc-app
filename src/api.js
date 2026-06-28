// PlantDoc AI Engine — Groq (Free, Works Worldwide)
const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const URL     = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL   = 'meta-llama/llama-4-scout-17b-16e-instruct'

export async function callAI(base64, prompt) {
  if (!API_KEY) throw new Error('NO_KEY')

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: 'You are an expert agricultural scientist. Always respond with ONLY a valid JSON object. No markdown. No explanation. Just JSON.'
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
            { type: 'text', text: prompt }
          ]
        }
      ]
    })
  })

  if (res.status === 401) throw new Error('BAD_KEY')
  if (res.status === 429) throw new Error('LIMIT')
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error('FAIL:' + (e?.error?.message || res.status))
  }

  const data = await res.json()
  const raw  = data.choices?.[0]?.message?.content || ''

  // Try 3 ways to parse JSON
  try { return JSON.parse(raw) } catch {}
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch {}
  const s = raw.indexOf('{'), e2 = raw.lastIndexOf('}')
  if (s !== -1 && e2 > s) {
    try { return JSON.parse(raw.slice(s, e2 + 1)) } catch {}
  }
  console.error('Raw AI response:', raw)
  throw new Error('PARSE')
}

export function errMsg(err) {
  const m = err?.message || ''
  if (m === 'NO_KEY')  return 'API key missing. Add VITE_GROQ_API_KEY in Vercel settings.'
  if (m === 'BAD_KEY') return 'API key is wrong. Check console.groq.com/keys'
  if (m === 'LIMIT')   return 'Too many requests. Wait 1 minute and try again.'
  if (m === 'PARSE')   return 'AI gave unexpected response. Try a clearer photo.'
  return 'Failed: ' + m + '. Check internet and try again.'
}

// ── PROMPTS ──────────────────────────────────────────────────

export const DIAGNOSE_PROMPT = `
You are Dr. PlantDoc, senior agricultural scientist, 25 years experience in South Asia.
Crops you know: wheat, rice, cotton, sugarcane, maize, tomato, potato, mango, and more.

Look at this plant or soil photo carefully.
Identify the disease, pest, deficiency, or problem.
If healthy, say so.

RESPOND WITH ONLY THIS JSON — nothing else, no markdown:

{
  "disease_name": "exact disease name",
  "severity": "Mild",
  "disease_type": "Fungal",
  "affected_part": "Leaves",
  "cause": "what causes this disease in 2 sentences",
  "treatment_summary": "best treatment approach in 2-3 sentences",
  "prevention": "how to prevent in future in 1-2 sentences",
  "confidence": 85,
  "treatment_steps": [
    {"step": 1, "title": "Day 1 — Immediate action", "detail": "remove affected leaves and isolate plant"},
    {"step": 2, "title": "Day 2 — Apply treatment", "detail": "spray with fungicide mixed at 2ml per liter"},
    {"step": 3, "title": "Day 7 — Follow up", "detail": "check progress and reapply if needed"},
    {"step": 4, "title": "Ongoing — Soil care", "detail": "add compost to strengthen plant"}
  ],
  "dosage_schedule": "2ml per liter of water, spray every 7 days for 3 weeks",
  "recovery_timeline": "Visible improvement in 7-10 days, full recovery in 3-4 weeks",
  "warning_signs": [
    "spreading to new leaves means treatment not working",
    "yellowing of whole plant means severe infection"
  ],
  "organic_pesticides": [
    {"name": "Neem Oil", "emoji": "🌿", "how_to_use": "Mix 5ml neem oil and 2ml dish soap in 1 liter water. Shake well and spray on all leaves", "frequency": "Every 7 days"},
    {"name": "Garlic Extract", "emoji": "🧄", "how_to_use": "Crush 10 garlic cloves, soak in 1 liter water overnight, strain and spray", "frequency": "Every 5 days"},
    {"name": "Chili Spray", "emoji": "🌶️", "how_to_use": "Boil 10 green chilies in 1 liter water, cool, strain, spray on leaves", "frequency": "Every 7 days"}
  ],
  "organic_fertilizers": [
    {"name": "Compost", "emoji": "🌱", "how_to_use": "Mix 2 handfuls into soil around plant base", "benefit": "Strengthens plant immune system"},
    {"name": "Wood Ash", "emoji": "🍂", "how_to_use": "Sprinkle lightly around plant base, water in", "benefit": "Adds potassium, fights fungal disease"},
    {"name": "Banana Peel Water", "emoji": "💧", "how_to_use": "Soak 3 banana peels in 2 liters water for 2 days, use to water plant", "benefit": "Adds potassium and phosphorus"}
  ],
  "organic_sprays": [
    {"name": "Neem + Soap Spray", "emoji": "🫙", "recipe": "5ml neem oil + 2ml liquid soap + 1 liter warm water. Mix well.", "how_to_use": "Spray on top and bottom of all leaves in evening. Repeat every 7 days."},
    {"name": "Baking Soda Spray", "emoji": "🧴", "recipe": "1 teaspoon baking soda + 1 liter water + 3 drops soap. Mix.", "how_to_use": "Spray on affected leaves every 5 days. Works best for fungal diseases."},
    {"name": "Turmeric Spray", "emoji": "🌿", "recipe": "1 tablespoon turmeric powder + 1 liter warm water. Stir and strain.", "how_to_use": "Spray on leaves twice per week. Turmeric is antifungal and antibacterial."}
  ],
  "organic_recommendation": "For Pakistani farmers, neem oil is the best first choice — it is cheap, available everywhere, and works against most fungal and pest problems. Buy from any agricultural shop for Rs 200-400 per liter."
}
`.trim()

export function PROGRESS_PROMPT(crop, disease, startSev, lastSev, day, lastNote) {
  return `
You are Dr. PlantDoc monitoring ${crop} crop recovering from ${disease}.
Started at severity: ${startSev}. Last check severity: ${lastSev}.
This photo is from Day ${day} of treatment.
Last assessment: "${lastNote || 'this is first checkup'}"

Look at this photo carefully. Is the plant better, worse, or same?
Be honest. Do not give false hope.

RESPOND WITH ONLY THIS JSON — nothing else:

{
  "severity": "Mild",
  "recovery_percentage": 40,
  "trend": "improving",
  "ai_summary": "describe what you see in 2-3 sentences and compare to before",
  "visible_changes": "specific changes visible compared to first photo",
  "treatment_working": "Yes — explain why",
  "next_action": "single most important thing farmer should do right now",
  "days_to_recovery": 14
}
`.trim()
}
