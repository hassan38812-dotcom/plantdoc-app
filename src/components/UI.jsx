export const sevCls = s =>
  s === 'Mild' ? 'mild' : s === 'Severe' ? 'severe' : 'moderate'

export function Badge({ s }) {
  return <span className={`bdg ${sevCls(s)}`}>{s}</span>
}

export function PBar({ label, value }) {
  return (
    <div className="pbrow">
      <div className="pblbl">{label}</div>
      <div className="pbtrack"><div className="pbfill" style={{ width: `${value}%` }} /></div>
      <div className="pbval">{value}%</div>
    </div>
  )
}

export function Spin({ text }) {
  return (
    <div className="loading">
      <div className="spin" />
      <span>{text}</span>
    </div>
  )
}

export function Err({ text }) {
  return (
    <div className="errbox">
      <i className="ti ti-alert-circle" />
      <span>{text}</span>
    </div>
  )
}

export function AIBox({ label, text, icon = 'ti-robot' }) {
  return (
    <div className="aibox">
      <div className="ailbl"><i className={`ti ${icon}`} />{label}</div>
      <div className="aitxt">{text}</div>
    </div>
  )
}

export function UpZone({ onClick, title, sub, icon = 'ti-plant-2' }) {
  return (
    <div className="uz" onClick={onClick}>
      <div className="uz-ico"><i className={`ti ${icon}`} /></div>
      <div className="uz-title">{title}</div>
      {sub && <div className="uz-sub">{sub}</div>}
    </div>
  )
}

export function TrendBadge({ trend }) {
  if (trend === 'improving') return <span className="trbdg trup"><i className="ti ti-trending-up" style={{ fontSize: 11 }} /> Improving</span>
  if (trend === 'worsening') return <span className="trbdg trdown"><i className="ti ti-trending-down" style={{ fontSize: 11 }} /> Worsening</span>
  return <span className="trbdg trsame"><i className="ti ti-minus" style={{ fontSize: 11 }} /> Stable</span>
}

export function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = e => res({ url: e.target.result, b64: e.target.result.split(',')[1] })
    r.onerror = () => rej(new Error('read failed'))
    r.readAsDataURL(file)
  })
}
