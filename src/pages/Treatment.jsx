import { Badge, AIBox } from '../components/UI'

export default function Treatment({ result }) {
  if (!result) return (
    <div className="pad">
      <div className="empty"><i className="ti ti-pill" />Diagnose a plant first to see its treatment plan.</div>
    </div>
  )
  const r = result
  return (
    <div className="pad">
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>{r.disease_name}</div>
          <Badge s={r.severity} />
        </div>
        <div style={{ fontSize: 12, color: '#888' }}>{r.disease_type} · {r.affected_part}</div>
      </div>

      <div className="lbl">Step-by-step treatment</div>
      {(r.treatment_steps || []).map((s, i) => (
        <div key={i} className="card-sm" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 25, height: 25, borderRadius: '50%', background: '#1a2e1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>{s.step}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 2 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{s.detail}</div>
          </div>
        </div>
      ))}

      <div className="lbl" style={{ marginTop: 10 }}>Dosage & Schedule</div>
      <div className="card"><div style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>{r.dosage_schedule}</div></div>

      <div className="lbl" style={{ marginTop: 10 }}>Recovery Timeline</div>
      <AIBox icon="ti-clock" label="What to expect" text={r.recovery_timeline} />

      <div className="lbl" style={{ marginTop: 12 }}>Warning Signs</div>
      <div className="card-sm">
        {(r.warning_signs || []).map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
            <i className="ti ti-alert-triangle" style={{ color: '#a32d2d', fontSize: 14, flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
