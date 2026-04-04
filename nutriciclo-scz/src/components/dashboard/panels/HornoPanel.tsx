import { useState, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta SCADA ─────────────────────────────────────────────────────────────
const SCADA_BG   = '#2e2e2e'
const SCADA_PANEL= '#3c3c3c'
const SCADA_DARK = '#1e1e1e'
const SCADA_BORDER = '#555'
const GREEN_ON   = '#00c853'
const RED_OFF    = '#d32f2f'
const AMBER      = '#ffa000'
const CYAN       = '#00e5ff'
const SCADA_TEXT = '#e0e0e0'

// ─── Caja de valor SCADA ──────────────────────────────────────────────────────
function ValBox({ label, value, unit = '', color = CYAN, w = 72 }: {
  label: string; value: string | number; unit?: string; color?: string; w?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ color: '#aaa', fontSize: 7, letterSpacing: 0.3 }}>{label}</span>
      <div style={{
        background: SCADA_DARK, border: `1px solid ${SCADA_BORDER}`,
        borderRadius: 2, padding: '1px 5px', width: w, textAlign: 'right',
      }}>
        <span style={{ color, fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' }}>
          {value}{unit && <span style={{ fontSize: 8, opacity: 0.7 }}> {unit}</span>}
        </span>
      </div>
    </div>
  )
}

// ─── Indicador de motor SCADA (cuadradito numerado) ───────────────────────────
function MotorBox({ id, label, on, onClick }: { id: string; label: string; on: boolean; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer' }}
      onClick={onClick}>
      <div style={{
        width: 28, height: 20, borderRadius: 2,
        background: on ? GREEN_ON : RED_OFF,
        border: `1px solid ${on ? '#00ff88' : '#ff5252'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: on ? `0 0 6px ${GREEN_ON}88` : 'none',
        transition: 'all 0.2s',
      }}>
        <span style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{id}</span>
      </div>
      <span style={{ color: '#999', fontSize: 6, maxWidth: 36, textAlign: 'center', lineHeight: 1.1 }}>{label}</span>
    </div>
  )
}

// ─── Semáforo de estado ───────────────────────────────────────────────────────
function StatusLight({ on, color }: { on: boolean; color: string }) {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%',
      background: on ? `radial-gradient(circle at 35% 30%, #fff, ${color})` : '#333',
      boxShadow: on ? `0 0 6px ${color}` : 'none',
      border: '1px solid #111',
    }}/>
  )
}

// ─── Diagrama de proceso SVG ──────────────────────────────────────────────────
function ProcessDiagram({
  isOn, kilnTemp, burnerOn, fanID, fanFD, feedOn, coolerOn,
}: {
  isOn: boolean; kilnTemp: number; burnerOn: boolean
  fanID: boolean; fanFD: boolean; feedOn: boolean; coolerOn: boolean
}) {
  const hot   = kilnTemp > 400
  const vhot  = kilnTemp > 500
  const flame = burnerOn && isOn

  const flowColor = isOn ? GREEN_ON : '#444'

  return (
    <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="kiln_body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={vhot ? '#bf360c' : hot ? '#e65100' : '#607d8b'}/>
          <stop offset="50%" stopColor={vhot ? '#7f1d1d' : hot ? '#bf360c' : '#37474f'}/>
          <stop offset="100%" stopColor={vhot ? '#4a0000' : hot ? '#7f1d1d' : '#263238'}/>
        </linearGradient>
        <linearGradient id="tower_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#546e7a"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
        <filter id="hot_glow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <marker id="flow_arr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill={flowColor}/>
        </marker>
      </defs>

      {/* Fondo */}
      <rect width="500" height="200" fill={SCADA_BG} rx="0"/>

      {/* ── Pre-calentador (ciclones verticales) ──────────────── */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={18 + i*22} y={20} width={16} height={60} rx="2"
            fill="url(#tower_g)" stroke="#607d8b" strokeWidth="1"/>
          {/* flujo interno */}
          {isOn && <line x1={26+i*22} y1={25} x2={26+i*22} y2={75}
            stroke={flowColor} strokeWidth="1" strokeDasharray="4,2" opacity="0.6"/>}
          <text x={26+i*22} y={90} fill="#90a4ae" fontSize="6" textAnchor="middle">C{i+1}</text>
          {/* temp en cada etapa */}
          <rect x={14+i*22} y={15} width={24} height={9} fill={SCADA_DARK} rx="1" stroke={SCADA_BORDER} strokeWidth="0.5"/>
          <text x={26+i*22} y={22} fill={CYAN} fontSize="6" textAnchor="middle" fontFamily="monospace">
            {isOn ? Math.round(kilnTemp * (0.25 + i*0.15)) : '--'}°
          </text>
        </g>
      ))}

      {/* Tolva alimentación */}
      <polygon points="85,50 102,50 99,80 88,80" fill="#546e7a" stroke="#90a4ae" strokeWidth="1"/>
      <text x="93" y="47" fill="#aaa" fontSize="6" textAnchor="middle">ALIM.</text>
      {feedOn && isOn && <line x1="99" y1="65" x2="115" y2="92"
        stroke={GREEN_ON} strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#flow_arr)"/>}

      {/* ── Horno rotatorio (cilindro principal) ──────────────── */}
      <rect x="115" y="88" width="220" height="34" rx="17"
        fill="url(#kiln_body)" stroke={vhot ? '#ff5722' : '#607d8b'} strokeWidth={vhot ? 2 : 1.5}
        style={vhot && isOn ? { filter:'drop-shadow(0 0 6px #ff5722)' } : undefined}/>
      {/* Anillos del horno */}
      {[145, 175, 205, 235, 265, 295].map(x => (
        <ellipse key={x} cx={x} cy={105} rx={5} ry={17}
          fill="none" stroke={vhot ? '#ff8a65' : '#546e7a'} strokeWidth="1" opacity="0.5"/>
      ))}
      {/* Texto central */}
      <text x="225" y="102" fill={vhot ? '#ffccbc' : '#b0bec5'} fontSize="9"
        textAnchor="middle" fontWeight="bold">HORNO ROTATORIO</text>
      <text x="225" y="113" fill={CYAN} fontSize="8" textAnchor="middle"
        fontFamily="monospace" fontWeight="bold"
        filter={isOn && hot ? 'url(#hot_glow)' : undefined}>
        {isOn ? `${kilnTemp.toFixed(1)} °C` : '--.- °C'}
      </text>

      {/* Soporte del horno */}
      {[155, 210, 265, 310].map(x => (
        <g key={x}>
          <rect x={x-6} y={122} width={12} height={8} rx="1" fill="#455a64" stroke="#546e7a" strokeWidth="0.5"/>
          <line x1={x} y1={130} x2={x} y2={138} stroke="#455a64" strokeWidth="2"/>
        </g>
      ))}

      {/* ── Quemador ──────────────────────────────────────────── */}
      <rect x="335" y="95" width="28" height="20" rx="3"
        fill={flame ? '#bf360c' : '#1a1a1a'} stroke={flame ? '#ff5722' : '#555'} strokeWidth="1.5"/>
      {flame && <>
        <ellipse cx="356" cy="105" rx="8" ry="5" fill="#f57c00" opacity="0.9" filter="url(#hot_glow)"/>
        <ellipse cx="353" cy="103" rx="5" ry="3" fill="#ffb300" opacity="0.8"/>
        <ellipse cx="350" cy="101" rx="3" ry="2" fill="#fff9c4" opacity="0.7"/>
      </>}
      <text x="349" y="122" fill={flame ? '#ff8a65' : '#666'} fontSize="6" textAnchor="middle">QUEM.</text>

      {/* ── Enfriador (cooler) ────────────────────────────────── */}
      <rect x="365" y="93" width="80" height="24" rx="6"
        fill={coolerOn && isOn ? '#0d47a1' : '#1e2a3a'} stroke={coolerOn && isOn ? '#1e88e5' : '#555'} strokeWidth="1.2"/>
      {coolerOn && isOn && <line x1="368" y1="105" x2="442" y2="105"
        stroke="#42a5f5" strokeWidth="1" strokeDasharray="4,2" markerEnd="url(#flow_arr)"/>}
      <text x="405" y="103" fill={coolerOn && isOn ? '#90caf9' : '#607d8b'}
        fontSize="7" textAnchor="middle" fontWeight="bold">ENFRIADOR</text>
      <text x="405" y="113" fill={CYAN} fontSize="6" textAnchor="middle" fontFamily="monospace">
        {isOn && coolerOn ? `${Math.round(kilnTemp * 0.15)} °C` : '--'}
      </text>

      {/* Descarga material */}
      <line x1="445" y1="105" x2="470" y2="105" stroke={flowColor} strokeWidth="1.5" markerEnd="url(#flow_arr)"/>
      <polygon points="468,95 480,95 480,115 468,115" fill="#546e7a" stroke="#90a4ae" strokeWidth="0.8"/>
      <text x="474" y="125" fill="#aaa" fontSize="6" textAnchor="middle">PROD.</text>

      {/* ── Fan ID (tiro inducido) ─────────────────────────────── */}
      <circle cx="410" cy="50" r="16" fill={SCADA_DARK} stroke={fanID && isOn ? GREEN_ON : '#555'} strokeWidth="1.5"
        style={fanID && isOn ? { filter:`drop-shadow(0 0 4px ${GREEN_ON})` } : undefined}/>
      {fanID && isOn && [0,60,120,180,240,300].map(deg => {
        const r2 = (deg * Math.PI) / 180
        return <line key={deg}
          x1={410+6*Math.cos(r2)} y1={50+6*Math.sin(r2)}
          x2={410+14*Math.cos(r2+0.4)} y2={50+14*Math.sin(r2+0.4)}
          stroke={GREEN_ON} strokeWidth="2"/>
      })}
      <text x="410" y="53" fill={fanID && isOn ? GREEN_ON : '#555'} fontSize="6" textAnchor="middle" fontWeight="bold">FAN</text>
      <text x="410" y="61" fill="#888" fontSize="5" textAnchor="middle">ID</text>
      <line x1="410" y1="66" x2="410" y2="93" stroke={fanID && isOn ? GREEN_ON : '#444'} strokeWidth="1" strokeDasharray="3,2"/>

      {/* ── Fan FD (tiro forzado) ─────────────────────────────── */}
      <circle cx="340" cy="50" r="14" fill={SCADA_DARK} stroke={fanFD && isOn ? '#42a5f5' : '#555'} strokeWidth="1.5"
        style={fanFD && isOn ? { filter:`drop-shadow(0 0 4px #42a5f5)` } : undefined}/>
      {fanFD && isOn && [0,60,120,180,240,300].map(deg => {
        const r2 = (deg * Math.PI) / 180
        return <line key={deg}
          x1={340+5*Math.cos(r2)} y1={50+5*Math.sin(r2)}
          x2={340+12*Math.cos(r2+0.4)} y2={50+12*Math.sin(r2+0.4)}
          stroke="#42a5f5" strokeWidth="1.8"/>
      })}
      <text x="340" y="53" fill={fanFD && isOn ? '#42a5f5' : '#555'} fontSize="6" textAnchor="middle" fontWeight="bold">FAN</text>
      <text x="340" y="61" fill="#888" fontSize="5" textAnchor="middle">FD</text>
      <line x1="340" y1="64" x2="340" y2="93" stroke={fanFD && isOn ? '#42a5f5' : '#444'} strokeWidth="1" strokeDasharray="3,2"/>

      {/* Conducto de gases */}
      <path d="M 115 93 Q 90 93 90 80 L 90 25 L 85 25" fill="none"
        stroke={isOn ? '#f57c00' : '#555'} strokeWidth="2" strokeDasharray={isOn?"6,3":"none"}/>
      <text x="60" y="20" fill={isOn?'#f57c00':'#666'} fontSize="6">GASES HOT</text>

      {/* ── Zonas de temperatura ──────────────────────────────── */}
      {[
        { x: 130, label: 'Z1', pct: 0.55 },
        { x: 180, label: 'Z2', pct: 0.80 },
        { x: 225, label: 'Z3', pct: 0.95 },
        { x: 270, label: 'Z4', pct: 1.0  },
        { x: 315, label: 'Z5', pct: 0.88 },
      ].map(z => (
        <g key={z.label}>
          <text x={z.x} y={145} fill="#607d8b" fontSize="6" textAnchor="middle">{z.label}</text>
          <rect x={z.x-10} y={148} width={20} height={8} fill={SCADA_DARK} rx="1" stroke={SCADA_BORDER} strokeWidth="0.5"/>
          <text x={z.x} y={155} fill={z.pct > 0.9 ? '#ff5722' : z.pct > 0.7 ? AMBER : CYAN}
            fontSize="6" textAnchor="middle" fontFamily="monospace">
            {isOn ? Math.round(kilnTemp * z.pct) : '--'}
          </text>
        </g>
      ))}
      <text x="225" y="170" fill="#607d8b" fontSize="6" textAnchor="middle">PERFIL DE TEMPERATURA (°C)</text>
    </svg>
  )
}

// ─── Fila de alarma ───────────────────────────────────────────────────────────
function AlarmRow({ time, desc, type }: { time: string; desc: string; type: 'warning'|'error'|'info' }) {
  const c = type === 'error' ? '#f44336' : type === 'warning' ? AMBER : '#90caf9'
  return (
    <div style={{ display: 'flex', gap: 8, padding: '1px 6px', borderBottom: '1px solid #333', alignItems: 'center' }}>
      <span style={{ color: '#666', fontSize: 8, minWidth: 50, fontFamily: 'monospace' }}>{time}</span>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }}/>
      <span style={{ color: c, fontSize: 8, flex: 1 }}>{desc}</span>
    </div>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function HornoPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq      = equipment.rotary_kiln
  const isOn    = eq.active
  const kilnT   = sensors.kilnTemp
  const boneKgh = sensors.boneFlourRate

  const [activeTab, setActiveTab] = useState(0)
  const [burnerOn,  setBurnerOn]  = useState(false)
  const [fanID,     setFanID]     = useState(false)
  const [fanFD,     setFanFD]     = useState(false)
  const [feedOn,    setFeedOn]    = useState(false)
  const [coolerOn,  setCoolerOn]  = useState(false)
  const [rpm,       setRpm]       = useState(2.5)
  const [fuelPct,   setFuelPct]   = useState(65)

  const handlePower = () => {
    toggleEquipment('rotary_kiln')
    if (isOn) {
      setBurnerOn(false); setFanID(false); setFanFD(false)
      setFeedOn(false); setCoolerOn(false)
    }
  }

  const tabs = ['PROCESO', 'MOTORES', 'TEMPERATURA', 'ALARMAS']

  const alarms = [
    ...(kilnT > 620 ? [{ time: new Date().toTimeString().slice(0,8), desc: `Temperatura crítica zona 3: ${kilnT.toFixed(1)}°C`, type: 'error' as const }] : []),
    ...(kilnT > 580 && kilnT <= 620 ? [{ time: new Date().toTimeString().slice(0,8), desc: `Temperatura elevada horno: ${kilnT.toFixed(1)}°C`, type: 'warning' as const }] : []),
    ...(!fanID && isOn ? [{ time: new Date().toTimeString().slice(0,8), desc: 'Fan ID detenido — revisar extracción de gases', type: 'warning' as const }] : []),
    { time: '08:00:00', desc: 'Sistema iniciado — Horno ΠΚ-3 en operación normal', type: 'info' as const },
  ]

  const statusColor = eq.status === 'active' ? GREEN_ON
    : eq.status === 'warning' ? AMBER
    : eq.status === 'error'   ? RED_OFF : '#6b7280'

  const s = (v: CSSProperties) => v

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      <div style={{
        background: SCADA_BG,
        border: `2px solid ${SCADA_BORDER}`,
        borderRadius: 6,
        width: '100%', maxWidth: 700,
        maxHeight: '95vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}>

        {/* ── Barra superior SCADA ────────────────────────────── */}
        <div style={{ background: SCADA_DARK, padding: '0 0 0 8px',
          display: 'flex', alignItems: 'stretch', borderBottom: `1px solid ${SCADA_BORDER}`, flexShrink: 0 }}>

          {/* Logo / zona */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 0',
            borderRight: `1px solid ${SCADA_BORDER}`, minWidth: 90 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}/>
            <div>
              <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>ΠΚ-3</div>
              <div style={{ color: '#888', fontSize: 8 }}>HORNO ROT.</div>
            </div>
          </div>

          {/* Pestañas */}
          <div style={{ display: 'flex', flex: 1 }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)}
                style={s({
                  padding: '0 14px',
                  background: activeTab === i ? SCADA_PANEL : 'transparent',
                  border: 'none',
                  borderRight: `1px solid ${SCADA_BORDER}`,
                  borderBottom: activeTab === i ? `2px solid ${GREEN_ON}` : '2px solid transparent',
                  color: activeTab === i ? '#fff' : '#888',
                  fontSize: 10, fontWeight: activeTab === i ? 'bold' : 'normal',
                  cursor: 'pointer',
                })}>
                {t}
              </button>
            ))}
          </div>

          {/* Advertencia + cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
            {alarms.some(a => a.type === 'error') && (
              <span style={{ color: RED_OFF, fontSize: 10, fontWeight: 'bold' }}>⚠ ALARMA</span>
            )}
            <span style={{ color: '#666', fontSize: 9, fontFamily: 'monospace' }}>
              {new Date().toTimeString().slice(0,8)}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* ── PESTAÑA 0: PROCESO ─────────────────────────────── */}
        {activeTab === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Diagrama */}
            <div style={{ flex: 1, padding: '6px 6px 0', minHeight: 0 }}>
              <div style={{ height: '100%', border: `1px solid ${SCADA_BORDER}`, borderRadius: 3 }}>
                <ProcessDiagram isOn={isOn} kilnTemp={kilnT} burnerOn={burnerOn}
                  fanID={fanID} fanFD={fanFD} feedOn={feedOn} coolerOn={coolerOn}/>
              </div>
            </div>

            {/* Controles rápidos */}
            <div style={{ padding: '8px 8px', display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>

              {/* Botones de sistema */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[
                  { label: isOn ? 'APAGAR' : 'ENCENDER', action: handlePower,
                    bg: isOn ? RED_OFF : GREEN_ON, active: true },
                  { label: burnerOn ? 'QUEM. ON' : 'QUEM.', action: () => { if(isOn) setBurnerOn(p=>!p) },
                    bg: burnerOn ? '#f57c00' : '#546e7a', active: isOn },
                  { label: fanID ? 'FAN-ID ON' : 'FAN-ID', action: () => { if(isOn) setFanID(p=>!p) },
                    bg: fanID ? GREEN_ON : '#546e7a', active: isOn },
                  { label: fanFD ? 'FAN-FD ON' : 'FAN-FD', action: () => { if(isOn) setFanFD(p=>!p) },
                    bg: fanFD ? '#1e88e5' : '#546e7a', active: isOn },
                  { label: feedOn ? 'ALIM. ON' : 'ALIM.', action: () => { if(isOn) setFeedOn(p=>!p) },
                    bg: feedOn ? AMBER : '#546e7a', active: isOn },
                  { label: coolerOn ? 'COOL. ON' : 'COOL.', action: () => { if(isOn) setCoolerOn(p=>!p) },
                    bg: coolerOn ? '#0288d1' : '#546e7a', active: isOn },
                ].map(b => (
                  <button key={b.label} onClick={b.action}
                    style={s({
                      background: b.bg, color: '#fff',
                      border: 'none', borderRadius: 3,
                      padding: '5px 10px', fontSize: 10, fontWeight: 'bold',
                      cursor: b.active ? 'pointer' : 'not-allowed',
                      opacity: b.active ? 1 : 0.4,
                      boxShadow: `0 2px 0 rgba(0,0,0,0.4)`,
                    })}>
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 8 }}>
                    <span>RPM</span>
                    <span style={{ color: CYAN, fontFamily: 'monospace' }}>{rpm.toFixed(1)}</span>
                  </div>
                  <input type="range" min={0.5} max={5} step={0.1} value={rpm}
                    onChange={e => setRpm(parseFloat(e.target.value))}
                    disabled={!isOn} style={{ accentColor: CYAN, opacity: isOn ? 1 : 0.3 }}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 8 }}>
                    <span>COMBUSTIBLE</span>
                    <span style={{ color: '#f57c00', fontFamily: 'monospace' }}>{fuelPct}%</span>
                  </div>
                  <input type="range" min={20} max={100} value={fuelPct}
                    onChange={e => setFuelPct(parseInt(e.target.value))}
                    disabled={!burnerOn || !isOn} style={{ accentColor: '#f57c00', opacity: burnerOn && isOn ? 1 : 0.3 }}/>
                </div>
              </div>
            </div>

            {/* Valores sensores barra inferior */}
            <div style={{ background: SCADA_DARK, padding: '5px 10px',
              display: 'flex', gap: 14, borderTop: `1px solid ${SCADA_BORDER}`, flexShrink: 0 }}>
              <ValBox label="TEMP. HORNO"  value={kilnT.toFixed(1)} unit="°C"   color={kilnT>600?RED_OFF:kilnT>500?AMBER:CYAN}/>
              <ValBox label="H. HUESO"     value={boneKgh.toFixed(1)} unit="kg/h" color="#ffd54f"/>
              <ValBox label="RPM"          value={isOn?rpm.toFixed(1):'--'}      color={GREEN_ON}/>
              <ValBox label="COMBUSTIBLE"  value={burnerOn&&isOn?fuelPct+'%':'--'} color="#f57c00"/>
              <ValBox label="STATUS"       value={eq.status.toUpperCase()}       color={statusColor} w={80}/>
            </div>
          </div>
        )}

        {/* ── PESTAÑA 1: MOTORES ─────────────────────────────── */}
        {activeTab === 1 && (
          <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
            <div style={{ color: '#90caf9', fontSize: 11, marginBottom: 10, fontWeight: 'bold' }}>
              ESTADO DE MOTORES Y ACCIONAMIENTOS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { id: 'M1', label: 'Motor Tambor',    on: isOn,            toggle: handlePower },
                { id: 'M2', label: 'Fan ID',          on: fanID && isOn,   toggle: ()=>{ if(isOn) setFanID(p=>!p) } },
                { id: 'M3', label: 'Fan FD',          on: fanFD && isOn,   toggle: ()=>{ if(isOn) setFanFD(p=>!p) } },
                { id: 'M4', label: 'Alimentador',     on: feedOn && isOn,  toggle: ()=>{ if(isOn) setFeedOn(p=>!p) } },
                { id: 'M5', label: 'Enfriador',       on: coolerOn && isOn,toggle: ()=>{ if(isOn) setCoolerOn(p=>!p) } },
                { id: 'M6', label: 'Conv. Descarga',  on: isOn && coolerOn,toggle: ()=>{ if(isOn) setCoolerOn(p=>!p) } },
                { id: 'M7', label: 'Quemador',        on: burnerOn && isOn,toggle: ()=>{ if(isOn) setBurnerOn(p=>!p) } },
                { id: 'M8', label: 'Lubricación',     on: isOn,            toggle: ()=>{} },
              ].map(m => (
                <div key={m.id} style={{ background: SCADA_PANEL, border: `1px solid ${SCADA_BORDER}`,
                  borderRadius: 4, padding: 10 }}>
                  <MotorBox id={m.id} label={m.label} on={m.on} onClick={m.toggle}/>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: 8 }}>
                      <span>Corriente</span>
                      <span style={{ color: CYAN, fontFamily: 'monospace' }}>
                        {m.on ? (Math.random() * 5 + 8).toFixed(1) + ' A' : '-- A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: 8 }}>
                      <span>Estado</span>
                      <span style={{ color: m.on ? GREEN_ON : RED_OFF, fontSize: 8, fontWeight: 'bold' }}>
                        {m.on ? 'EN MARCHA' : 'PARADO'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 2: TEMPERATURA ─────────────────────────── */}
        {activeTab === 2 && (
          <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
            <div style={{ color: '#90caf9', fontSize: 11, marginBottom: 10, fontWeight: 'bold' }}>
              PERFIL TÉRMICO — HORNO ROTATORIO
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { zone: 'Zona 1 — Carga',      pct: 0.55, sp: 280 },
                { zone: 'Zona 2 — Pre-calc.',   pct: 0.80, sp: 400 },
                { zone: 'Zona 3 — Calcinación', pct: 0.95, sp: 550 },
                { zone: 'Zona 4 — Zona Hot',    pct: 1.00, sp: 600 },
                { zone: 'Zona 5 — Descarga',    pct: 0.88, sp: 520 },
                { zone: 'Enfriador',            pct: 0.15, sp: 80  },
              ].map(z => {
                const pv = isOn ? kilnT * z.pct : 0
                const dev = Math.abs(pv - z.sp)
                const c = pv > z.sp + 30 ? RED_OFF : pv > z.sp + 10 ? AMBER : GREEN_ON
                return (
                  <div key={z.zone} style={{ background: SCADA_PANEL, border: `1px solid ${SCADA_BORDER}`,
                    borderRadius: 4, padding: '8px 10px' }}>
                    <div style={{ color: '#aaa', fontSize: 9, marginBottom: 6 }}>{z.zone}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ color: '#777', fontSize: 8 }}>PV</span>
                        <span style={{ color: c, fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold' }}>
                          {pv.toFixed(1)}°C
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                        <span style={{ color: '#777', fontSize: 8 }}>SP</span>
                        <span style={{ color: AMBER, fontFamily: 'monospace', fontSize: 13 }}>
                          {z.sp}°C
                        </span>
                      </div>
                    </div>
                    {/* Barra de temp */}
                    <div style={{ height: 6, background: '#111', borderRadius: 3, overflow: 'hidden', border: `1px solid ${SCADA_BORDER}` }}>
                      <div style={{
                        height: '100%', width: `${Math.min(100, (pv / 700) * 100)}%`,
                        background: `linear-gradient(90deg, #1565c0, ${c})`,
                        borderRadius: 3, transition: 'width 0.5s',
                        boxShadow: `0 0 6px ${c}88`,
                      }}/>
                    </div>
                    <div style={{ color: dev > 30 ? RED_OFF : '#777', fontSize: 7, marginTop: 3 }}>
                      Desv: {isOn ? (pv - z.sp).toFixed(1) : '--'} °C
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 3: ALARMAS ─────────────────────────────── */}
        {activeTab === 3 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: SCADA_PANEL, padding: '4px 8px',
              display: 'flex', gap: 8, borderBottom: `1px solid ${SCADA_BORDER}`, flexShrink: 0 }}>
              {['TODAS', 'ERRORES', 'AVISOS', 'INFO'].map(f => (
                <button key={f} style={{ background: 'none', border: 'none',
                  color: '#90caf9', fontSize: 9, cursor: 'pointer', padding: '2px 6px',
                  borderBottom: f === 'TODAS' ? `1px solid ${GREEN_ON}` : 'none' }}>{f}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, padding: '2px 6px',
                background: '#1a1a1a', borderBottom: `1px solid ${SCADA_BORDER}` }}>
                {['HORA','','DESCRIPCIÓN'].map((h, i) => (
                  <span key={i} style={{ color: '#666', fontSize: 8, minWidth: i===0?50:i===1?10:undefined, flex: i===2?1:undefined }}>{h}</span>
                ))}
              </div>
              {alarms.map((a, i) => (
                <AlarmRow key={i} time={a.time} desc={a.desc} type={a.type}/>
              ))}
              {alarms.length === 0 && (
                <div style={{ padding: 20, color: GREEN_ON, fontSize: 11, textAlign: 'center' }}>
                  ✓ Sin alarmas activas
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
