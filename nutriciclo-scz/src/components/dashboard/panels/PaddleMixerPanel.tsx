import { useState, useEffect, useRef, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta FactoryTalk/Wonderware ───────────────────────────────────────────
const FT_BG     = '#d0d4d8'
const FT_PANEL  = '#b8bec4'
const FT_DARK   = '#2a3a4a'
const FT_TITLE  = '#1a2a6e'
const FT_GREEN  = '#00a050'
const FT_RED    = '#d03030'
const FT_BLUE   = '#1060c0'
const FT_AMBER  = '#d08010'

// ─── Tendencia de temperatura (gráfico) ──────────────────────────────────────
function TrendChart({ data, label, unit, color, min, max }: {
  data: number[]; label: string; unit: string; color: string; min: number; max: number
}) {
  const w = 320, h = 110
  const pad = { t: 16, b: 20, l: 40, r: 10 }
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  const n  = data.length

  const pts = data.map((v, i) => {
    const x = pad.l + (i / Math.max(n - 1, 1)) * iw
    const y = pad.t + ih - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * ih
    return `${x},${y}`
  }).join(' ')

  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%', background: '#0a0e14' }}>
      {/* Grid */}
      {gridLines.map(p => {
        const y = pad.t + ih * (1 - p)
        const val = min + p * (max - min)
        return (
          <g key={p}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#1a2a3a" strokeWidth="0.8"/>
            <text x={pad.l - 3} y={y + 3} fill="#607d8b" fontSize="7" textAnchor="end"
              fontFamily="monospace">{val.toFixed(0)}</text>
          </g>
        )
      })}
      {/* Línea de tiempo */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = pad.l + (i / 5) * iw
        return <line key={i} x1={x} y1={pad.t} x2={x} y2={pad.t + ih} stroke="#1a2a3a" strokeWidth="0.5"/>
      })}
      {/* Límite crítico */}
      <line x1={pad.l} y1={pad.t + ih - ((180 - min) / (max - min)) * ih}
        x2={w - pad.r} y2={pad.t + ih - ((180 - min) / (max - min)) * ih}
        stroke="#d03030" strokeWidth="1" strokeDasharray="4,2"/>
      {/* Curva de tendencia */}
      {n > 1 && <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}/>}
      {/* Punto actual */}
      {n > 0 && (() => {
        const last = data[n - 1]
        const x = pad.l + iw
        const y = pad.t + ih - ((Math.min(max, Math.max(min, last)) - min) / (max - min)) * ih
        return <circle cx={x} cy={y} r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}/>
      })()}
      {/* Títulos */}
      <text x={pad.l} y={pad.t - 4} fill="#90a4ae" fontSize="8" fontWeight="bold">{label}</text>
      <text x={w - pad.r} y={pad.t - 4} fill="#607d8b" fontSize="7" textAnchor="end">{unit}</text>
    </svg>
  )
}

// ─── Display de valor analógico ───────────────────────────────────────────────
function AnalogDisplay({ label, value, unit, color, hi, lo }: {
  label: string; value: number; unit: string; color: string; hi?: number; lo?: number
}) {
  const isHi = hi !== undefined && value >= hi
  const isLo = lo !== undefined && value <= lo
  const c = isHi || isLo ? FT_RED : color

  return (
    <div style={{ background: '#1a2030', border: `1px solid ${isHi || isLo ? FT_RED : '#2a3a50'}`,
      borderRadius: 3, padding: '3px 6px', minWidth: 80 }}>
      <div style={{ color: '#607d8b', fontSize: 7, marginBottom: 1 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold',
        color: c, textShadow: `0 0 5px ${c}66`, lineHeight: 1 }}>
        {value.toFixed(1)}
      </div>
      <div style={{ color: '#445', fontSize: 7 }}>{unit}
        {isHi && <span style={{ color: FT_RED, fontWeight: 'bold' }}> HI</span>}
        {isLo && <span style={{ color: FT_AMBER, fontWeight: 'bold' }}> LO</span>}
      </div>
    </div>
  )
}

// ─── Diagrama de la mezcladora SVG ───────────────────────────────────────────
function MixerDiagram({ isOn, shaft1, shaft2, temp, discharge, lime }: {
  isOn: boolean; shaft1: boolean; shaft2: boolean; temp: number
  discharge: boolean; lime: boolean
}) {
  const hot = temp > 120
  const vhot = temp > 160

  return (
    <svg viewBox="0 0 420 160" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="mixer_body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={vhot ? '#bf360c' : hot ? '#e65100' : '#546e7a'}/>
          <stop offset="100%" stopColor={vhot ? '#7f1d1d' : hot ? '#bf360c' : '#263238'}/>
        </linearGradient>
        <linearGradient id="cylinder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78909c"/>
          <stop offset="100%" stopColor="#37474f"/>
        </linearGradient>
        <filter id="pglow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width="420" height="160" fill={FT_BG}/>

      {/* ── Tolva de alimentación (izquierda) ── */}
      <polygon points="30,10 80,10 72,50 38,50" fill="#78909c" stroke="#90a4ae" strokeWidth="1"/>
      <text x="55" y="8" fill={FT_DARK} fontSize="7" textAnchor="middle" fontWeight="bold">SÓLIDOS</text>
      <line x1="55" y1="50" x2="55" y2="68" stroke={isOn ? '#0891b2' : '#555'} strokeWidth="2"
        strokeDasharray={isOn ? '3,2' : 'none'}/>

      {/* ── Tolva cal viva (arriba-centro) ── */}
      <polygon points="165,10 215,10 207,42 173,42" fill="#d4e157" stroke="#c0ca33" strokeWidth="1"/>
      <text x="190" y="8" fill={FT_DARK} fontSize="7" textAnchor="middle" fontWeight="bold">CAL VIVA</text>
      <line x1="190" y1="42" x2="190" y2="68" stroke={lime ? '#d4e157' : '#555'} strokeWidth="2"
        strokeDasharray={lime ? '3,2' : 'none'}/>

      {/* ── Tolva mezcla húmeda (derecha) ── */}
      <polygon points="290,10 340,10 332,50 298,50" fill="#80cbc4" stroke="#4db6ac" strokeWidth="1"/>
      <text x="315" y="8" fill={FT_DARK} fontSize="7" textAnchor="middle" fontWeight="bold">MX.HÚMEDA</text>
      <line x1="315" y1="50" x2="315" y2="68" stroke={isOn ? '#0891b2' : '#555'} strokeWidth="2"
        strokeDasharray={isOn ? '3,2' : 'none'}/>

      {/* ── Cuerpo mezclador paletas (eje doble) ── */}
      <rect x="20" y="68" width="340" height="58" rx="8"
        fill="url(#mixer_body)" stroke={isOn ? (vhot ? '#ff5722' : '#607d8b') : '#455a64'}
        strokeWidth={isOn && vhot ? 2 : 1.5}
        style={isOn && vhot ? { filter: 'drop-shadow(0 0 5px #ff5722)' } : undefined}/>

      {/* EJE 1 */}
      <line x1="25" y1="87" x2="355" y2="87" stroke="#90a4ae" strokeWidth="2"/>
      {shaft1 && isOn && Array.from({ length: 12 }, (_, i) => {
        const x = 35 + i * 28
        const angle = (i * 35) % 360
        const r = (angle * Math.PI) / 180
        return (
          <g key={i}>
            <line x1={x} y1={87} x2={x + 10 * Math.cos(r)} y2={87 + 10 * Math.sin(r)}
              stroke="#80deea" strokeWidth="2.5" strokeLinecap="round"/>
          </g>
        )
      })}

      {/* EJE 2 */}
      <line x1="25" y1="107" x2="355" y2="107" stroke="#90a4ae" strokeWidth="2"/>
      {shaft2 && isOn && Array.from({ length: 12 }, (_, i) => {
        const x = 35 + i * 28
        const angle = (i * 35 + 180) % 360
        const r = (angle * Math.PI) / 180
        return (
          <g key={i}>
            <line x1={x} y1={107} x2={x + 10 * Math.cos(r)} y2={107 + 10 * Math.sin(r)}
              stroke="#a5d6a7" strokeWidth="2.5" strokeLinecap="round"/>
          </g>
        )
      })}

      {/* Etiqueta mezclador */}
      <text x="190" y="100" fill={isOn ? (vhot ? '#ffccbc' : '#b2dfdb') : '#607d8b'}
        fontSize="9" textAnchor="middle" fontWeight="bold">
        WLDH-2000 — PALETAS DOBLE EJE
      </text>

      {/* Temperatura */}
      <rect x="145" y="108" width="90" height="12" rx="2" fill="#0a0a0a" stroke="#333"/>
      <text x="190" y="117" fill={vhot ? '#ef4444' : hot ? '#f97316' : '#00e5ff'}
        fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold"
        filter={isOn ? 'url(#pglow)' : undefined}>
        {isOn ? `EXOT: ${temp.toFixed(1)} °C` : 'EXOT: -- °C'}
      </text>

      {/* Motores */}
      {[{ x: 10, label: 'M1', on: shaft1 && isOn }, { x: 358, label: 'M2', on: shaft2 && isOn }].map(m => (
        <g key={m.label}>
          <ellipse cx={m.x + 7} cy={97} rx="7" ry="20"
            fill="#263238" stroke={m.on ? FT_GREEN : '#607d8b'} strokeWidth="1.5"
            style={m.on ? { filter: `drop-shadow(0 0 3px ${FT_GREEN})` } : undefined}/>
          <text x={m.x + 7} y={100} fill={m.on ? '#4ade80' : '#607d8b'}
            fontSize="5" textAnchor="middle" fontWeight="bold">{m.label}</text>
        </g>
      ))}

      {/* ── Válvula de descarga ── */}
      <rect x="165" y="126" width="90" height="16" rx="4"
        fill={discharge ? '#1565c0' : '#1a2a3a'} stroke={discharge ? '#1e88e5' : '#546e7a'} strokeWidth="1.5"/>
      <text x="210" y="137" fill={discharge ? '#90caf9' : '#607d8b'}
        fontSize="7" textAnchor="middle" fontWeight="bold">
        {discharge ? '▼ DESCARGA ACTIVA' : '■ DESCARGA CERRADA'}
      </text>

      {/* ── Salida al producto final ── */}
      <line x1="210" y1="142" x2="210" y2="158"
        stroke={discharge ? '#1e88e5' : '#333'} strokeWidth="3"
        markerEnd={discharge ? undefined : undefined}/>
      <text x="210" y="157" fill={discharge ? '#90caf9' : '#607d8b'}
        fontSize="6" textAnchor="middle">CINTA TRANSPORT.</text>

      {/* Sensor TE */}
      <rect x="356" y="70" width="6" height="24" rx="1"
        fill={isOn ? '#ffd54f' : '#78909c'} stroke={isOn ? '#f59e0b' : '#546e7a'} strokeWidth="0.8"/>
      <text x="366" y="84" fill={FT_DARK} fontSize="6">TE-1</text>

      {/* Cal viva warning */}
      {lime && (
        <>
          <circle cx="190" cy="55" r="6" fill="#d4e157" opacity="0.8"
            filter="url(#pglow)"/>
          <text x="190" y="58" fill="#1a2900" fontSize="6" textAnchor="middle" fontWeight="bold">!</text>
        </>
      )}
    </svg>
  )
}

// ─── Indicador tipo FactoryTalk ───────────────────────────────────────────────
function FtIndicator({ label, on, color = 'green' }: { label: string; on: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5,
      background: '#1a2030', borderRadius: 2, padding: '2px 6px', border: '1px solid #2a3a50' }}>
      <div style={{
        width: 10, height: 10, borderRadius: 2,
        background: on ? color : '#2a2a2a',
        boxShadow: on ? `0 0 6px ${color}` : 'none',
        border: `1px solid ${on ? color : '#444'}`,
      }}/>
      <span style={{ color: on ? '#e0e0e0' : '#607d8b', fontSize: 8, fontWeight: on ? 'bold' : 'normal' }}>
        {label}
      </span>
    </div>
  )
}

// ─── Botón FT estilo ─────────────────────────────────────────────────────────
function FtBtn({ label, color, onClick, active, w = 70 }: {
  label: string; color: string; onClick: () => void; active?: boolean; w?: number
}) {
  const [p, setP] = useState(false)
  const s: CSSProperties = {
    width: w, padding: '4px 0',
    background: p ? `linear-gradient(180deg,${color}88,${color}44)` : `linear-gradient(180deg,${color}cc,${color}88)`,
    border: `1px solid ${color}`,
    borderRadius: 2, color: '#fff', fontWeight: 'bold', fontSize: 9,
    cursor: 'pointer',
    boxShadow: active ? `0 0 8px ${color}88` : p ? 'none' : `0 2px 0 ${color}44`,
    transform: p ? 'translateY(1px)' : 'none',
    transition: 'transform 0.05s',
    outline: active ? `2px solid ${color}` : 'none',
  }
  return (
    <button style={s}
      onMouseDown={() => setP(true)}
      onMouseUp={() => { setP(false); onClick() }}
      onMouseLeave={() => setP(false)}>{label}</button>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function PaddleMixerPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.paddle_mixer
  const isOn = eq.active
  const exoT = sensors.exothermicTemp

  const [activeTab, setActiveTab] = useState<'overview'|'trends'|'alarms'|'report'>('overview')
  const [shaft1,    setShaft1]    = useState(false)
  const [shaft2,    setShaft2]    = useState(false)
  const [discharge, setDischarge] = useState(false)
  const [lime,      setLime]      = useState(false)
  const [rpm1,      setRpm1]      = useState(45)
  const [rpm2,      setRpm2]      = useState(45)
  const [loadPct,   setLoadPct]   = useState(0)
  const [mixTime,   setMixTime]   = useState(0)
  const [alarms,    setAlarms]    = useState<string[]>([])

  // Historial de temperatura
  const tempHistory = useRef<number[]>(Array(40).fill(25))

  useEffect(() => {
    if (!isOn) { setLoadPct(0); return }
    const id = setInterval(() => {
      tempHistory.current = [...tempHistory.current.slice(1), exoT]
      const active = [shaft1, shaft2].filter(Boolean).length
      setLoadPct(isOn ? Math.min(100, active * 40 + (Math.random() - 0.5) * 5) : 0)
    }, 800)
    return () => clearInterval(id)
  }, [isOn, shaft1, shaft2, exoT])

  // Timer de mezcla
  useEffect(() => {
    if (!isOn || (!shaft1 && !shaft2)) { return }
    const id = setInterval(() => setMixTime(p => p + 1), 1000)
    return () => clearInterval(id)
  }, [isOn, shaft1, shaft2])

  // Alarmas dinámicas
  useEffect(() => {
    const al: string[] = []
    if (exoT > 180) al.push(`⚠ Temperatura exotérmica crítica: ${exoT.toFixed(1)}°C`)
    if (exoT > 160 && exoT <= 180) al.push(`▲ Temp. exotérmica elevada: ${exoT.toFixed(1)}°C`)
    if (loadPct > 90) al.push('⚠ Carga motor elevada (>90%)')
    if (isOn && shaft1 && !shaft2) al.push('▲ Solo eje 1 activo — revisar eje 2')
    setAlarms(al)
  }, [exoT, loadPct, isOn, shaft1, shaft2])

  const handlePower = () => {
    toggleEquipment('paddle_mixer')
    if (isOn) { setShaft1(false); setShaft2(false); setDischarge(false); setLime(false); setMixTime(0) }
  }

  const canOp = isOn

  const statusColor = eq.status === 'active' ? FT_GREEN
    : eq.status === 'warning' ? FT_AMBER
    : eq.status === 'error'   ? FT_RED : '#607d8b'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends',   label: 'Trends' },
    { id: 'alarms',   label: `Active Alarms${alarms.length > 0 ? ` (${alarms.length})` : ''}` },
    { id: 'report',   label: 'Report Data' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      <div style={{
        background: FT_BG,
        width: '100%', maxWidth: 720,
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        fontFamily: 'Tahoma, Arial, sans-serif',
        border: '2px solid #8090a0',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Barra de alarmas (top) ────────────────────────── */}
        <div style={{ background: alarms.length > 0 ? '#2a0000' : '#0a1a0a',
          padding: '2px 8px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', minHeight: 20, borderBottom: '1px solid #333' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {alarms.length > 0 ? (
              <span style={{ color: FT_RED, fontSize: 8, fontWeight: 'bold' }}>
                {alarms[0]}
                {alarms.length > 1 && <span style={{ color: '#888' }}> (+{alarms.length - 1} más)</span>}
              </span>
            ) : (
              <span style={{ color: FT_GREEN, fontSize: 8 }}>✓ Sin alarmas activas</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 10 }}>
            <span style={{ color: '#888', fontSize: 8 }}>Usuario: Operador</span>
            <button style={{ background: FT_BLUE, border: 'none', color: '#fff',
              fontSize: 8, padding: '1px 8px', cursor: 'pointer', borderRadius: 2 }}>Login</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={14} color="#888"/>
            </button>
          </div>
        </div>

        {/* ── Encabezado azul ───────────────────────────────── */}
        <div style={{ background: FT_TITLE, padding: '4px 10px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}/>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
              MEZCLADORA PALETAS DOBLE EJE — {eq.model}
            </span>
          </div>
          <span style={{ color: '#90caf9', fontSize: 9 }}>{eq.manufacturer} · 45 kW</span>
        </div>

        {/* ── Cuerpo ────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', gap: 6, padding: 8 }}>

              {/* Panel izquierdo parámetros */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 160 }}>
                <div style={{ color: FT_DARK, fontSize: 9, fontWeight: 'bold',
                  borderBottom: '1px solid #8090a0', paddingBottom: 2 }}>PARÁMETROS MEZCLA</div>

                <AnalogDisplay label="TEMP. EXOTÉRMICA" value={exoT} unit="°C"
                  color={exoT > 160 ? FT_RED : exoT > 120 ? FT_AMBER : '#00e5ff'} hi={180}/>
                <AnalogDisplay label="RPM EJE 1" value={isOn && shaft1 ? rpm1 : 0} unit="rpm"
                  color={FT_GREEN} lo={10}/>
                <AnalogDisplay label="RPM EJE 2" value={isOn && shaft2 ? rpm2 : 0} unit="rpm"
                  color={FT_GREEN} lo={10}/>
                <AnalogDisplay label="CARGA MOTOR" value={loadPct} unit="%" color={FT_BLUE} hi={95}/>
                <AnalogDisplay label="TIEMPO MEZCLA"
                  value={Math.floor(mixTime / 60) + (mixTime % 60) / 100} unit="min"
                  color={FT_AMBER}/>

                {/* Indicadores */}
                <div style={{ color: FT_DARK, fontSize: 9, fontWeight: 'bold',
                  borderBottom: '1px solid #8090a0', paddingBottom: 2, marginTop: 2 }}>ESTADO</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FtIndicator label="EQUIPO ON"    on={isOn}           color={FT_GREEN}/>
                  <FtIndicator label="EJE 1"        on={shaft1 && isOn} color="#00e5ff"/>
                  <FtIndicator label="EJE 2"        on={shaft2 && isOn} color="#00e5ff"/>
                  <FtIndicator label="CAL VIVA"     on={lime && isOn}   color="#d4e157"/>
                  <FtIndicator label="DESCARGA"     on={discharge&&isOn}color={FT_BLUE}/>
                  <FtIndicator label="ALARMA"       on={alarms.length>0}color={FT_RED}/>
                </div>
              </div>

              {/* Centro: gráfico + diagrama */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>

                {/* Gráfico tendencia */}
                <div style={{ border: '1px solid #8090a0', height: 130 }}>
                  <div style={{ background: FT_DARK, padding: '2px 6px',
                    display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#90caf9', fontSize: 8, fontWeight: 'bold' }}>
                      Temperatura Exotérmica — Tendencia
                    </span>
                    <span style={{ color: '#607d8b', fontSize: 7 }}>
                      {new Date().toTimeString().slice(0,8)}
                    </span>
                  </div>
                  <div style={{ height: 108 }}>
                    <TrendChart data={tempHistory.current} label="Temp. Exotérmica" unit="°C"
                      color={exoT > 160 ? '#ef4444' : '#f97316'} min={20} max={220}/>
                  </div>
                </div>

                {/* Diagrama del mezclador */}
                <div style={{ border: '1px solid #8090a0', height: 165, overflow: 'hidden' }}>
                  <div style={{ background: FT_DARK, padding: '1px 6px' }}>
                    <span style={{ color: '#90caf9', fontSize: 8 }}>Diagrama de Proceso</span>
                  </div>
                  <div style={{ height: 148 }}>
                    <MixerDiagram isOn={isOn} shaft1={shaft1} shaft2={shaft2}
                      temp={exoT} discharge={discharge} lime={lime}/>
                  </div>
                </div>
              </div>

              {/* Panel derecho controles */}
              <div style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ color: FT_DARK, fontSize: 9, fontWeight: 'bold',
                  borderBottom: '1px solid #8090a0', paddingBottom: 2 }}>CONTROL</div>

                {/* Encender/Apagar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FtBtn label={isOn ? '■ APAGAR' : '▶ ENCENDER'} color={isOn ? FT_RED : FT_GREEN}
                    onClick={handlePower} active={isOn} w={120}/>
                  <FtBtn label={shaft1 ? 'EJE 1 ON' : 'EJE 1 OFF'} color={FT_BLUE}
                    onClick={() => { if(canOp) setShaft1(p=>!p) }} active={shaft1&&isOn} w={120}/>
                  <FtBtn label={shaft2 ? 'EJE 2 ON' : 'EJE 2 OFF'} color={FT_BLUE}
                    onClick={() => { if(canOp) setShaft2(p=>!p) }} active={shaft2&&isOn} w={120}/>
                  <FtBtn label={lime ? 'CAL: ON' : 'CAL: OFF'} color="#8bc34a"
                    onClick={() => { if(canOp) setLime(p=>!p) }} active={lime&&isOn} w={120}/>
                  <FtBtn label={discharge ? 'DESC. ON' : 'DESC. OFF'} color={FT_AMBER}
                    onClick={() => { if(canOp) setDischarge(p=>!p) }} active={discharge&&isOn} w={120}/>
                  <FtBtn label="RESET ALARMAS" color="#607d8b"
                    onClick={() => setAlarms([])} w={120}/>
                </div>

                {/* RPM */}
                <div style={{ borderTop: '1px solid #8090a0', paddingTop: 4 }}>
                  <div style={{ color: FT_DARK, fontSize: 8, marginBottom: 3 }}>RPM EJE 1</div>
                  <input type="range" min={15} max={75} value={rpm1}
                    onChange={e => setRpm1(parseInt(e.target.value))}
                    disabled={!canOp} style={{ width: '100%', accentColor: FT_BLUE, opacity: canOp?1:0.4 }}/>
                  <div style={{ color: FT_DARK, fontSize: 8, marginTop: 3, marginBottom: 3 }}>RPM EJE 2</div>
                  <input type="range" min={15} max={75} value={rpm2}
                    onChange={e => setRpm2(parseInt(e.target.value))}
                    disabled={!canOp} style={{ width: '100%', accentColor: FT_GREEN, opacity: canOp?1:0.4 }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#607d8b', fontSize: 7 }}>
                    <span>E1: {isOn&&shaft1?rpm1:0} rpm</span>
                    <span>E2: {isOn&&shaft2?rpm2:0} rpm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ border: '1px solid #8090a0', height: 180 }}>
                <div style={{ background: FT_DARK, padding: '2px 6px' }}>
                  <span style={{ color: '#90caf9', fontSize: 8, fontWeight: 'bold' }}>
                    Historial Temperatura Exotérmica (últimos 40 ticks)
                  </span>
                </div>
                <div style={{ height: 160 }}>
                  <TrendChart data={tempHistory.current} label="T° Exotérmica" unit="°C"
                    color="#f97316" min={0} max={220}/>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <AnalogDisplay label="Temp. Actual" value={exoT} unit="°C"
                  color={exoT>160?FT_RED:FT_AMBER} hi={180}/>
                <AnalogDisplay label="Temp. Max" value={Math.max(...tempHistory.current)} unit="°C" color={FT_RED}/>
                <AnalogDisplay label="Temp. Min" value={Math.min(...tempHistory.current)} unit="°C" color={FT_BLUE}/>
                <AnalogDisplay label="Temp. Prom"
                  value={tempHistory.current.reduce((a,b)=>a+b,0)/tempHistory.current.length}
                  unit="°C" color={FT_GREEN}/>
              </div>
            </div>
          )}

          {activeTab === 'alarms' && (
            <div style={{ padding: 8 }}>
              <div style={{ background: FT_DARK, padding: '3px 8px', marginBottom: 4,
                display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#90caf9', fontSize: 9, fontWeight: 'bold' }}>ALARMAS ACTIVAS</span>
                <FtBtn label="ACK TODAS" color="#607d8b" onClick={() => setAlarms([])} w={70}/>
              </div>
              {alarms.length === 0 ? (
                <div style={{ color: FT_GREEN, padding: 20, textAlign: 'center', fontSize: 11 }}>
                  ✓ No hay alarmas activas
                </div>
              ) : alarms.map((a, i) => (
                <div key={i} style={{ background: '#1a0000', border: '1px solid #ef4444',
                  borderRadius: 2, padding: '4px 8px', marginBottom: 3,
                  display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fca5a5', fontSize: 9 }}>{a}</span>
                  <span style={{ color: '#607d8b', fontSize: 8 }}>{new Date().toTimeString().slice(0,8)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'report' && (
            <div style={{ padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Modelo',          value: eq.model },
                { label: 'Fabricante',      value: eq.manufacturer },
                { label: 'Capacidad',       value: eq.specs.capacity },
                { label: 'Potencia',        value: eq.specs.power },
                { label: 'Material',        value: eq.specs.material },
                { label: 'Temp. Exot.',     value: `${exoT.toFixed(1)} °C` },
                { label: 'Tiempo mezcla',   value: `${Math.floor(mixTime/60)}:${String(mixTime%60).padStart(2,'0')} min` },
                { label: 'Estado',          value: eq.status.toUpperCase() },
              ].map(r => (
                <div key={r.label} style={{ background: '#1a2030', border: '1px solid #2a3a50',
                  borderRadius: 2, padding: '4px 8px' }}>
                  <div style={{ color: '#607d8b', fontSize: 7 }}>{r.label}</div>
                  <div style={{ color: '#e0e0e0', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pestañas inferiores (estilo FactoryTalk) ─────── */}
        <div style={{ display: 'flex', background: FT_PANEL, borderTop: '2px solid #8090a0' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '4px 14px', fontSize: 9, cursor: 'pointer',
                background: activeTab === t.id ? FT_TITLE : FT_PANEL,
                border: 'none', borderRight: '1px solid #8090a0',
                color: activeTab === t.id ? '#fff' : FT_DARK,
                fontWeight: activeTab === t.id ? 'bold' : 'normal',
              }}>
              {t.label}
            </button>
          ))}
          {/* Barra estado derecha */}
          <div style={{ marginLeft: 'auto', padding: '4px 10px', display: 'flex', gap: 12 }}>
            {[
              { label: 'Exot.', value: `${exoT.toFixed(0)}°C`, color: exoT>160?FT_RED:FT_AMBER },
              { label: 'Carga', value: `${loadPct.toFixed(0)}%`,  color: FT_BLUE },
              { label: 'E1',    value: shaft1&&isOn?`${rpm1}rpm`:'OFF', color: shaft1&&isOn?FT_GREEN:'#607d8b' },
              { label: 'E2',    value: shaft2&&isOn?`${rpm2}rpm`:'OFF', color: shaft2&&isOn?FT_GREEN:'#607d8b' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#607d8b', fontSize: 7 }}>{s.label}</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 9, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
