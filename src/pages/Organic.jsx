import { useState } from 'react'
import { AIBox } from '../components/UI'

const SEGS = [
  { id: 'pest', label: 'Pesticides', icon: 'ti-bug-off' },
  { id: 'fert', label: 'Fertilizers', icon: 'ti-leaf' },
  { id: 'spry', label: 'Sprays', icon: 'ti-droplet' },
]

export default function Organic({ result }) {
  const [seg, setSeg] = useState('pest')
  if (!result) return (
    <div className="pad">
      <div className="empty"><i className="ti ti-leaf" />Diagnose a plant first to get organic remedy suggestions.</div>
    </div>
  )
  const r = result
  return (
    <div className="pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{r.disease_name}</div>
        <span className="bdg bgn">Organic</span>
      </div>
      <div className="segrow">
        {SEGS.map(s => (
          <button key={s.id} className={`segbtn${seg === s.id ? ' on' : ''}`} onClick={() => setSeg(s.id)}>
            <i className={`ti ${s.icon}`} />{s.label}
          </button>
        ))}
      </div>

      {seg === 'pest' && (
        <>
          <div className="lbl">Organic Pesticides</div>
          <div className="rgrid">
            {(r.organic_pesticides || []).map((p, i) => (
              <div className="rcard" key={i}>
                <div className="remo">{p.emoji}</div>
                <div className="rname">{p.name}</div>
                <div className="rdesc">{p.how_to_use}</div>
                <div className="rhow">Every {p.frequency}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {seg === 'fert' && (
        <>
          <div className="lbl">Organic Fertilizers</div>
          <div className="rgrid">
            {(r.organic_fertilizers || []).map((f, i) => (
              <div className="rcard" key={i}>
                <div className="remo">{f.emoji}</div>
                <div className="rname">{f.name}</div>
                <div className="rdesc">{f.benefit}</div>
                <div className="rhow">{f.how_to_use}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {seg === 'spry' && (
        <>
          <div className="lbl">Organic Sprays & Recipes</div>
          {(r.organic_sprays || []).map((s, i) => (
            <div className="card-sm" key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <span style={{ fontSize: 17 }}>{s.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 3, fontStyle: 'italic' }}>Recipe: {s.recipe}</div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{s.how_to_use}</div>
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: 6 }}>
        <AIBox icon="ti-robot" label="AI Recommendation" text={r.organic_recommendation} />
      </div>
    </div>
  )
}
