import { useState } from 'react'
import Diagnose  from './pages/Diagnose.jsx'
import Treatment from './pages/Treatment.jsx'
import Organic   from './pages/Organic.jsx'
import Progress  from './pages/Progress.jsx'

const TABS = [
  { id: 'diagnose',  label: 'Diagnose',  nav: 'ti-home' },
  { id: 'treatment', label: 'Treatment', nav: 'ti-pill' },
  { id: 'organic',   label: 'Organic',   nav: 'ti-leaf' },
  { id: 'progress',  label: 'Progress',  nav: 'ti-chart-line' },
]

export default function App() {
  const [tab,    setTab]    = useState('diagnose')
  const [result, setResult] = useState(null)
  const [cases,  setCases]  = useState([])

  const addCase    = c  => setCases(p => [...p, c])
  const updateCase = (id, fn) => setCases(p => p.map(c => c.id === id ? fn(c) : c))
  const props = { result, setResult, cases, addCase, updateCase, setTab }

  return (
    <div className="app">
      <div className="header">
        <div className="header-row">
          <div>
            <div className="app-name">🌿 PlantDoc</div>
            <div className="app-tag">AI plant health companion</div>
          </div>
          <div className="hdr-ico"><i className="ti ti-plant-2" /></div>
        </div>
        <div className="tabbar">
          {TABS.map(t => (
            <button key={t.id} className={`tbtn${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="screen">
        {tab === 'diagnose'  && <Diagnose  {...props} />}
        {tab === 'treatment' && <Treatment {...props} />}
        {tab === 'organic'   && <Organic   {...props} />}
        {tab === 'progress'  && <Progress  {...props} />}
      </div>

      <nav className="navbar">
        {TABS.map(t => (
          <div key={t.id} className={`nitem${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
            <i className={`ti ${t.nav}`} />
            <span className="nlabel">{t.label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}
