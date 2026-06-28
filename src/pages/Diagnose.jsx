import { useState, useRef } from 'react'
import { callAI, errMsg, DIAGNOSE_PROMPT } from '../api'
import { Spin, Err, Badge, UpZone, readFile } from '../components/UI'

export default function Diagnose({ setResult, addCase, setTab }) {
  const [img,     setImg]     = useState(null)
  const [b64,     setB64]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [data,    setData]    = useState(null)
  const ref = useRef()

  async function onFile(e) {
    const f = e.target.files[0]; if (!f) return
    const { url, b64: b } = await readFile(f)
    setImg(url); setB64(b); setData(null); setError(null)
  }

  function reset() {
    setImg(null); setB64(null); setData(null); setError(null)
    ref.current.value = ''
  }

  async function diagnose() {
    if (!b64) return
    setLoading(true); setError(null); setData(null)
    try {
      const r = await callAI(b64, DIAGNOSE_PROMPT)
      r.imgSrc = img
      setData(r)
      setResult(r)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  function track() {
    if (!data) return
    addCase({
      id: Date.now(),
      crop: data.disease_type || 'Plant',
      disease: data.disease_name,
      severity: data.severity,
      startDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      thumb: data.imgSrc,
      checkups: [{
        day: 0,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        imgSrc: data.imgSrc,
        severity: data.severity,
        recoveryPct: 0,
        trend: 'initial',
        aiSummary: `Initial diagnosis: ${data.disease_name}. Treatment started.`
      }]
    })
    setTab('progress')
  }

  return (
    <div className="pad">
      <input type="file" accept="image/*" ref={ref} style={{ display: 'none' }} onChange={onFile} />

      {!img ? (
        <>
          <UpZone onClick={() => ref.current.click()} title="Upload plant or soil photo" sub="Clear photo in daylight gives best results" />
          <div className="lbl">Tips for better diagnosis</div>
          <div className="card-sm">
            {['Focus on the affected leaves or area','Use natural daylight, avoid flash','Include roots for soil problems','Keep camera steady for sharp image'].map(t => (
              <div className="tip" key={t}><div className="tipdot" /><div className="tiptxt">{t}</div></div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="ipwrap">
            <img src={img} alt="plant" />
            <button className="ipchg" onClick={reset}><i className="ti ti-refresh" /> Change</button>
          </div>
          {!data && !loading && (
            <button className="btn" onClick={diagnose}>
              <i className="ti ti-microscope" /> Diagnose now
            </button>
          )}
        </>
      )}

      {loading && <Spin text="Analyzing your plant with AI..." />}
      {error   && <Err  text={error} />}

      {data && (
        <>
          <div className="lbl" style={{ marginTop: 14 }}>Diagnosis result</div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111', flex: 1, paddingRight: 8 }}>{data.disease_name}</div>
              <Badge s={data.severity} />
            </div>
            <div className="inforow" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="infoico" style={{ background: '#fff3cd' }}><i className="ti ti-bug" style={{ color: '#7a5500', fontSize: 13 }} /></div>
              <div><div className="infolbl">Cause</div><div className="infotxt">{data.cause}</div></div>
            </div>
            <div className="inforow">
              <div className="infoico" style={{ background: '#e8f5e8' }}><i className="ti ti-pill" style={{ color: '#1a5c1a', fontSize: 13 }} /></div>
              <div><div className="infolbl">Treatment</div><div className="infotxt">{data.treatment_summary}</div></div>
            </div>
            <div className="inforow">
              <div className="infoico" style={{ background: '#e6f1fb' }}><i className="ti ti-shield" style={{ color: '#185fa5', fontSize: 13 }} /></div>
              <div><div className="infolbl">Prevention</div><div className="infotxt">{data.prevention}</div></div>
            </div>
          </div>

          <div className="btnrow">
            <button className="btn2" onClick={() => setTab('treatment')}><i className="ti ti-pill" /> Treatment</button>
            <button className="btn2" onClick={() => setTab('organic')}><i className="ti ti-leaf" /> Organic</button>
          </div>
          <button className="btn" onClick={track} style={{ marginTop: 8 }}>
            <i className="ti ti-chart-line" /> Track progress
          </button>
          <button className="btn2" onClick={reset} style={{ marginTop: 8, width: '100%' }}>
            <i className="ti ti-refresh" /> Scan another plant
          </button>
        </>
      )}
    </div>
  )
}
