import { useState, useRef } from 'react'
import { callAI, errMsg, PROGRESS_PROMPT } from '../api'
import { Badge, PBar, Spin, Err, TrendBadge, AIBox, UpZone, readFile } from '../components/UI'

export default function Progress({ cases, addCase, updateCase }) {
  const [view,    setView]    = useState('list')
  const [cid,     setCid]     = useState(null)
  const [chkImg,  setChkImg]  = useState(null)
  const [chkB64,  setChkB64]  = useState(null)
  const [day,     setDay]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [crop,    setCrop]    = useState('')
  const [disease, setDisease] = useState('')
  const ref = useRef()

  const active = cases.find(c => c.id === cid)

  function open(id) {
    setCid(id); setView('detail')
    setChkImg(null); setChkB64(null); setError(null)
    const c = cases.find(x => x.id === id)
    if (c) setDay(String((c.checkups.at(-1)?.day || 0) + 7))
  }

  function createCase() {
    if (!crop.trim() || !disease.trim()) return
    const c = {
      id: Date.now(), crop: crop.trim(), disease: disease.trim(),
      severity: 'Moderate',
      startDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      thumb: null,
      checkups: [{
        day: 0,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        imgSrc: null, severity: 'Moderate', recoveryPct: 0, trend: 'initial',
        aiSummary: 'Case created. Upload your first check-up photo to begin AI tracking.'
      }]
    }
    addCase(c); setCrop(''); setDisease(''); open(c.id)
  }

  async function onChkFile(e) {
    const f = e.target.files[0]; if (!f) return
    const { url, b64 } = await readFile(f)
    setChkImg(url); setChkB64(b64); setError(null)
  }

  async function runCheck() {
    if (!chkB64 || !active) return
    const last = active.checkups.at(-1)
    const d = parseInt(day) || last.day + 7
    setLoading(true); setError(null)
    try {
      const prompt = PROGRESS_PROMPT(active.crop, active.disease, active.checkups[0].severity, last.severity, d, last.aiSummary)
      const r = await callAI(chkB64, prompt)
      updateCase(cid, c => ({
        ...c,
        severity: r.severity,
        thumb: c.thumb || chkImg,
        checkups: [...c.checkups, {
          day: d,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          imgSrc: chkImg,
          severity: r.severity,
          recoveryPct: Math.round(Math.min(100, Math.max(0, r.recovery_percentage))),
          trend: r.trend,
          aiSummary: r.ai_summary,
          visibleChanges: r.visible_changes,
          treatmentWorking: r.treatment_working,
          nextAction: r.next_action,
          daysToRecovery: r.days_to_recovery
        }]
      }))
      setChkImg(null); setChkB64(null)
      ref.current.value = ''
      setDay(String(d + 7))
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  if (view === 'list') return (
    <div className="pad">
      <div className="lbl">Active treatment cases</div>
      {cases.length === 0 && (
        <div className="empty"><i className="ti ti-chart-line" />No cases yet.<br />Diagnose a plant and tap "Track progress", or create one below.</div>
      )}
      {cases.map(c => {
        const last = c.checkups.at(-1)
        return (
          <div className="ccard" key={c.id} onClick={() => open(c.id)}>
            <div className="crow">
              <div className="cthumb">{c.thumb ? <img src={c.thumb} alt="" /> : <i className="ti ti-plant-2" />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>{c.disease}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{c.crop} · {c.startDate}</div>
                <PBar label="Recovery" value={last.recoveryPct} />
              </div>
              <Badge s={last.severity} />
            </div>
          </div>
        )
      })}

      <div style={{ borderTop: '1px solid #eee', paddingTop: 13, marginTop: 6 }}>
        <div className="lbl">Start new case manually</div>
        <div className="dayrow"><label>Crop / plant</label><input value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g. Wheat, Tomato" /></div>
        <div className="dayrow"><label>Disease name</label><input value={disease} onChange={e => setDisease(e.target.value)} placeholder="e.g. Leaf blight" /></div>
        <button className="btn" onClick={createCase}><i className="ti ti-plus" /> Create case</button>
      </div>
    </div>
  )

  if (!active) { setView('list'); return null }
  const last = active.checkups.at(-1)

  return (
    <div className="pad">
      <button className="btnback" onClick={() => setView('list')}><i className="ti ti-arrow-left" /> All cases</button>

      <div className="recbox">
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 5 }}>{active.disease}</div>
        <div className="recpct">{last.recoveryPct}%</div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 5 }}>{active.checkups.length} check-up{active.checkups.length !== 1 ? 's' : ''} · {active.crop}</div>
        <TrendBadge trend={last.trend} />
        <PBar label="Recovery" value={last.recoveryPct} />
        {last.nextAction && (
          <div style={{ fontSize: 12, color: '#185fa5', marginTop: 7, display: 'flex', gap: 5 }}>
            <i className="ti ti-arrow-right" style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }} />{last.nextAction}
          </div>
        )}
      </div>

      <div className="lbl">Add today's check-up photo</div>
      <div className="dayrow"><label>Treatment day</label><input type="number" value={day} onChange={e => setDay(e.target.value)} placeholder="e.g. 14" min="1" /></div>

      <input type="file" accept="image/*" ref={ref} style={{ display: 'none' }} onChange={onChkFile} />

      {!chkImg ? (
        <UpZone onClick={() => ref.current.click()} title="Upload today's photo" sub="Photo of the same plant to track progress" icon="ti-camera-plus" />
      ) : (
        <>
          <div style={{ position: 'relative', borderRadius: 11, overflow: 'hidden', marginBottom: 9 }}>
            <img src={chkImg} alt="checkup" style={{ width: '100%', height: 135, objectFit: 'cover', display: 'block' }} />
            <button className="ipchg" onClick={() => { setChkImg(null); setChkB64(null); ref.current.value = '' }}><i className="ti ti-refresh" /> Change</button>
          </div>
          <button className="btn" onClick={runCheck} disabled={loading}><i className="ti ti-microscope" /> Analyze progress</button>
        </>
      )}
      {loading && <Spin text="Comparing plant progress with AI..." />}
      {error   && <Err  text={error} />}

      <div className="lbl" style={{ marginTop: 14 }}>Treatment timeline</div>
      <div className="tiwrap">
        {[...active.checkups].reverse().map((chk, i, arr) => {
          const isInit = chk.day === 0
          const isLast = i === arr.length - 1
          return (
            <div className="tirow" key={i}>
              <div className="tileft">
                <div className={`tidot${isInit ? ' init' : ''}`} />
                {!isLast && <div className="tiline" />}
              </div>
              <div className="ticard">
                <div className="tidate">Day {chk.day} · {chk.date}</div>
                {chk.imgSrc && <img src={chk.imgSrc} alt="" className="tiimg" />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>{isInit ? 'Initial diagnosis' : 'Check-up result'}</span>
                  <Badge s={chk.severity} />
                </div>
                {!isInit && <PBar label="Recovery" value={chk.recoveryPct} />}
                <div style={{ marginTop: 5 }}><AIBox icon="ti-robot" label="AI Assessment" text={chk.aiSummary} /></div>
                {chk.visibleChanges && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginTop: 7 }}>
                    <div style={{ background: '#fafafa', borderRadius: 7, padding: '7px 9px' }}>
                      <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>Visible changes</div>
                      <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{chk.visibleChanges}</div>
                    </div>
                    <div style={{ background: '#fafafa', borderRadius: 7, padding: '7px 9px' }}>
                      <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>Treatment</div>
                      <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{chk.treatmentWorking}</div>
                    </div>
                  </div>
                )}
                {chk.nextAction && !isInit && (
                  <div style={{ fontSize: 11, color: '#185fa5', marginTop: 7, display: 'flex', gap: 5 }}>
                    <i className="ti ti-arrow-right" style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }} />{chk.nextAction}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
