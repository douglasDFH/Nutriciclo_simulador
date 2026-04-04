import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta SCADA gris claro (estilo Elipse/WinCC) ───────────────────────────
const BG      = '#dde3e8'
const BG2     = '#c8d0d8'
const PANEL_R = '#e8ecf0'
const PIPE    = '#0288d1'
const PIPE_OFF= '#8aabb8'
const EQ_FILL = '#2e6b8a'
const DARK    = '#1a2a3a'
const TEXT    = '#2d3748'

// ─── Caja de dato del proceso ─────────────────────────────────────────────────
function DataRow({ label, value, unit, color = DARK }: {
  label: string; value: string | number; unit?: string; color?: string
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #bcc8d4', borderRadius: 3,
      padding: '3px 7px', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ color: '#7a8fa0', fontSize: 8, letterSpacing: 0.3 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ color, fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' }}>{value}</span>
        {unit && <span style={{ color: '#9ab', fontSize: 8 }}>{unit}</span>}
      </div>
    </div>
  )
}

// ─── Flecha de flujo animada ──────────────────────────────────────────────────
function FlowArrow({ active }: { active: boolean }) {
  return (
    <span style={{
      color: active ? PIPE : PIPE_OFF,
      fontSize: 12,
      textShadow: active ? `0 0 5px ${PIPE}` : 'none',
      transition: 'color 0.3s',
    }}>►</span>
  )
}

// ─── Diagrama de proceso SVG ──────────────────────────────────────────────────
function ProcessDiagram({ isOn, level, temp, agitOn, valvUrea, valvSal, valvAgua, pumpOut }: {
  isOn: boolean; level: number; temp: number
  agitOn: boolean; valvUrea: boolean; valvSal: boolean; valvAgua: boolean; pumpOut: boolean
}) {
  const fc = (on: boolean) => on ? PIPE : PIPE_OFF

  return (
    <svg viewBox="0 0 460 230" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="tank_d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#546e7a"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
        <linearGradient id="sol_d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#80deea" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#0097a7" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="pump_d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#546e7a"/>
          <stop offset="100%" stopColor="#263238"/>
        </linearGradient>
        <marker id="arr_d" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill={PIPE}/>
        </marker>
        <marker id="arr_off" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill={PIPE_OFF}/>
        </marker>
        <clipPath id="dclip">
          <rect x="62" y="62" width="76" height="106" rx="4"/>
        </clipPath>
        <filter id="dglow">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo */}
      <rect width="460" height="230" fill={BG} rx="0"/>

      {/* ── Tolva / silo urea (arriba izquierda) ── */}
      <polygon points="30,12 75,12 70,45 35,45" fill="#607d8b" stroke="#90a4ae" strokeWidth="1"/>
      <rect x="47" y="45" width="8" height="15" fill="#607d8b" stroke="#90a4ae" strokeWidth="0.8"/>
      <text x="52" y="10" fill={TEXT} fontSize="8" textAnchor="middle" fontWeight="bold">UREA</text>
      {/* Válvula urea */}
      <circle cx="51" cy="67" r="5" fill={valvUrea && isOn ? '#f59e0b' : '#546e7a'} stroke="#333" strokeWidth="1"/>
      <text x="51" y="81" fill={TEXT} fontSize="6" textAnchor="middle">VU-01</text>
      {/* Flujo urea → batea */}
      <line x1="51" y1="72" x2="65" y2="95"
        stroke={fc(valvUrea && isOn)} strokeWidth="2"
        markerEnd={valvUrea && isOn ? 'url(#arr_d)' : 'url(#arr_off)'}
        strokeDasharray={valvUrea && isOn ? '4,2' : 'none'} opacity="0.9"/>

      {/* ── Tolva / silo sal (arriba centro-izq) ── */}
      <polygon points="95,12 140,12 135,45 100,45" fill="#607d8b" stroke="#90a4ae" strokeWidth="1"/>
      <rect x="112" y="45" width="8" height="15" fill="#607d8b" stroke="#90a4ae" strokeWidth="0.8"/>
      <text x="117" y="10" fill={TEXT} fontSize="8" textAnchor="middle" fontWeight="bold">SAL MIN.</text>
      {/* Válvula sal */}
      <circle cx="116" cy="67" r="5" fill={valvSal && isOn ? '#a78bfa' : '#546e7a'} stroke="#333" strokeWidth="1"/>
      <text x="116" y="81" fill={TEXT} fontSize="6" textAnchor="middle">VS-01</text>
      {/* Flujo sal → batea */}
      <line x1="116" y1="72" x2="110" y2="95"
        stroke={fc(valvSal && isOn)} strokeWidth="2"
        markerEnd={valvSal && isOn ? 'url(#arr_d)' : 'url(#arr_off)'}
        strokeDasharray={valvSal && isOn ? '4,2' : 'none'} opacity="0.9"/>

      {/* ── Agua (arriba derecha tolva) ── */}
      <rect x="165" y="8" width="30" height="32" rx="4" fill="#1565c0" stroke="#1e88e5" strokeWidth="1"/>
      <text x="180" y="20" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="bold">H₂O</text>
      <text x="180" y="30" fill="#90caf9" fontSize="5" textAnchor="middle">AGUA</text>
      {/* Válvula agua */}
      <circle cx="180" cy="55" r="5" fill={valvAgua && isOn ? '#1e88e5' : '#546e7a'} stroke="#333" strokeWidth="1"/>
      <text x="180" y="70" fill={TEXT} fontSize="6" textAnchor="middle">VA-01</text>
      <line x1="180" y1="40" x2="180" y2="50" stroke={fc(valvAgua&&isOn)} strokeWidth="2"/>
      <line x1="180" y1="60" x2="128" y2="90"
        stroke={fc(valvAgua && isOn)} strokeWidth="2"
        markerEnd={valvAgua && isOn ? 'url(#arr_d)' : 'url(#arr_off)'}
        strokeDasharray={valvAgua && isOn ? '4,2' : 'none'} opacity="0.9"/>

      {/* ── Batea DT-300 (tanque principal) ── */}
      {/* Cuerpo */}
      <rect x="62" y="60" width="76" height="108" rx="6"
        fill="url(#tank_d)" stroke="#90a4ae" strokeWidth="2"/>
      {/* Nivel solución */}
      <rect x="64" y={60 + 106*(1-level/100)} width="72"
        height={106*(level/100)} fill="url(#sol_d)"
        clipPath="url(#dclip)" style={{ transition: 'all 0.8s' }}/>
      {/* Líneas nivel */}
      {[25,50,75].map(p=>(
        <g key={p}>
          <line x1="60" y1={60+106*(1-p/100)} x2="65" y2={60+106*(1-p/100)}
            stroke="#546e7a" strokeWidth="0.8"/>
          <text x="56" y={64+106*(1-p/100)} fill="#607d8b" fontSize="5" textAnchor="end">{p}%</text>
        </g>
      ))}
      {/* Agitador ancla */}
      {agitOn && isOn && <>
        <line x1="100" y1="60" x2="100" y2="110" stroke="#ccc" strokeWidth="1.5"/>
        <line x1="72" y1="108" x2="128" y2="108" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
        <line x1="72" y1="108" x2="72" y2="135" stroke="#bbb" strokeWidth="1.5"/>
        <line x1="128" y1="108" x2="128" y2="135" stroke="#bbb" strokeWidth="1.5"/>
        <line x1="72" y1="130" x2="128" y2="130" stroke="#aaa" strokeWidth="1.5"/>
      </>}
      {/* Motor agitador arriba */}
      <ellipse cx="100" cy="56" rx="10" ry="6" fill="#455a64" stroke="#607d8b" strokeWidth="1"/>
      <text x="100" y="59" fill={agitOn&&isOn?'#4ade80':'#aaa'} fontSize="5" textAnchor="middle" fontWeight="bold">MT</text>
      {/* Calentador lateral */}
      <rect x="136" y="110" width="8" height="35" rx="2"
        fill={isOn?'#bf360c':'#263238'} stroke={isOn?'#ff5722':'#37474f'} strokeWidth="1"/>
      <text x="140" y="153" fill={isOn?'#ff8a65':'#546e7a'} fontSize="5" textAnchor="middle">HT</text>
      {/* Sensor temperatura */}
      <rect x="56" y="100" width="6" height="20" rx="1" fill="#ffd54f" stroke="#f59e0b" strokeWidth="0.8"/>
      <text x="53" y="130" fill={TEXT} fontSize="5" textAnchor="middle">TE</text>
      {/* Display temp dentro del tanque */}
      <rect x="70" y="75" width="50" height="14" rx="2" fill="#0d0d0d" stroke="#333"/>
      <text x="95" y="85" fill={isOn?'#ff8c00':'#1a0800'} fontSize="9" textAnchor="middle"
        fontFamily="monospace" fontWeight="bold"
        style={{ textShadow: isOn?'0 0 5px #ff8c00':'none' }}>
        {isOn ? temp.toFixed(1) : '--.-'}°C
      </text>
      {/* Nivel numérico */}
      <rect x="74" y="118" width="40" height="12" rx="2" fill="#0d0d0d" stroke="#333"/>
      <text x="94" y="127" fill={isOn?'#00e5ff':'#001a20'} fontSize="8" textAnchor="middle"
        fontFamily="monospace" fontWeight="bold">
        {level.toFixed(0)}%
      </text>
      {/* Etiquetas */}
      <text x="100" y="176" fill={TEXT} fontSize="8" textAnchor="middle" fontWeight="bold">Batea DT-300</text>
      <text x="100" y="186" fill="#607d8b" fontSize="6" textAnchor="middle">V=300L · AISI-304</text>

      {/* ── Tubería de salida → bomba → mezclador ── */}
      <line x1="138" y1="148" x2="200" y2="148"
        stroke={fc(pumpOut && isOn)} strokeWidth="2.5"
        markerEnd={pumpOut&&isOn?'url(#arr_d)':'url(#arr_off)'}
        strokeDasharray={pumpOut&&isOn?'5,2':'none'}/>

      {/* ── Bomba de transferencia ── */}
      <circle cx="215" cy="148" r="16" fill="url(#pump_d)" stroke="#607d8b" strokeWidth="1.5"/>
      {pumpOut&&isOn && [0,72,144,216,288].map(deg=>{
        const r2=(deg*Math.PI)/180
        return <line key={deg}
          x1={215+6*Math.cos(r2)} y1={148+6*Math.sin(r2)}
          x2={215+13*Math.cos(r2+0.4)} y2={148+13*Math.sin(r2+0.4)}
          stroke={PIPE} strokeWidth="2"/>
      })}
      <text x="215" y="151" fill={pumpOut&&isOn?'#4ade80':'#607d8b'} fontSize="6"
        textAnchor="middle" fontWeight="bold">BT01</text>
      <text x="215" y="170" fill={TEXT} fontSize="6" textAnchor="middle">BOMBA</text>
      <text x="215" y="178" fill="#607d8b" fontSize="5" textAnchor="middle">LKH-25</text>

      {/* ── Línea salida → mezclador ── */}
      <line x1="231" y1="148" x2="340" y2="148"
        stroke={fc(pumpOut&&isOn)} strokeWidth="2.5"
        markerEnd={pumpOut&&isOn?'url(#arr_d)':'url(#arr_off)'}
        strokeDasharray={pumpOut&&isOn?'5,2':'none'}/>
      {/* Flecha final */}
      <rect x="340" y="135" width="40" height="26" rx="4"
        fill="#1a2a3a" stroke={pumpOut&&isOn?PIPE:PIPE_OFF} strokeWidth="1.5"/>
      <text x="360" y="148" fill={pumpOut&&isOn?'#00e5ff':'#445'} fontSize="7" textAnchor="middle" fontWeight="bold">
        MEZCL.
      </text>
      <text x="360" y="157" fill="#546e7a" fontSize="5" textAnchor="middle">HJJ-3000</text>

      {/* ── Panel de operación flotante (abajo izq) ── */}
      <rect x="10" y="190" width="200" height="36" rx="3"
        fill="#fff" stroke="#bcc8d4" strokeWidth="1"/>
      <text x="16" y="202" fill={TEXT} fontSize="7" fontWeight="bold">OPERACIÓN — BATEA DT-300</text>
      {[
        { label:'Agitador:', val: agitOn&&isOn?'EN MARCHA':'PARADO', c: agitOn&&isOn?'#22c55e':'#ef4444' },
        { label:'Calefac.:',  val: isOn?'ACTIVA':'INACTIVA',           c: isOn?'#f97316':'#6b7280' },
        { label:'Bomba:',    val: pumpOut&&isOn?'ON':'OFF',            c: pumpOut&&isOn?'#22c55e':'#6b7280' },
      ].map((r,i)=>(
        <g key={r.label}>
          <text x="16" y={213+i*8} fill="#607d8b" fontSize="6">{r.label}</text>
          <text x="58" y={213+i*8} fill={r.c} fontSize="6" fontWeight="bold">{r.val}</text>
        </g>
      ))}

      {/* ── Caudal salida ── */}
      <rect x="240" y="190" width="120" height="36" rx="3" fill="#fff" stroke="#bcc8d4" strokeWidth="1"/>
      <text x="246" y="202" fill={TEXT} fontSize="7" fontWeight="bold">CAUDAL SALIDA</text>
      <text x="300" y="218" fill={pumpOut&&isOn?PIPE:'#aaa'} fontSize="16"
        textAnchor="middle" fontFamily="monospace" fontWeight="bold"
        filter={pumpOut&&isOn?'url(#dglow)':undefined}>
        {pumpOut&&isOn?'82.5':'0.0'}
      </text>
      <text x="300" y="226" fill="#607d8b" fontSize="6" textAnchor="middle">m³/h</text>
    </svg>
  )
}

// ─── Botón SCADA ──────────────────────────────────────────────────────────────
function ScadaBtn({ label, active, color='blue', onClick }: {
  label: string; active?: boolean; color?: string; onClick: () => void
}) {
  const c: Record<string,{bg:string;border:string;text:string}> = {
    blue:   { bg: active?'#1565c0':'#e3eaf2', border: active?'#0d47a1':'#90a4ae', text: active?'#fff':'#1565c0' },
    green:  { bg: active?'#2e7d32':'#e8f5e9', border: active?'#1b5e20':'#a5d6a7', text: active?'#fff':'#2e7d32' },
    red:    { bg: active?'#c62828':'#ffebee', border: active?'#7f1d1d':'#ef9a9a', text: active?'#fff':'#c62828' },
    orange: { bg: active?'#e65100':'#fff3e0', border: active?'#bf360c':'#ffcc80', text: active?'#fff':'#e65100' },
    gray:   { bg: '#e3eaf2', border: '#90a4ae', text: '#455a64' },
  }
  const { bg, border, text } = c[color] ?? c.blue
  return (
    <button onClick={onClick} style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 3,
      color: text, fontSize: 9, fontWeight: 'bold', padding: '4px 10px',
      cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      transition: 'all 0.15s',
    }}>{label}</button>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function DissolutionTankPanel({ onClose }: { onClose: () => void }) {
  const { equipment, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.dissolution_tank
  const isOn = eq.active

  const [agitOn,   setAgitOn]   = useState(false)
  const [valvUrea, setValvUrea] = useState(false)
  const [valvSal,  setValvSal]  = useState(false)
  const [valvAgua, setValvAgua] = useState(false)
  const [pumpOut,  setPumpOut]  = useState(false)
  const [level,    setLevel]    = useState(45.0)
  const [temp,     setTemp]     = useState(28.0)
  const [alarm,    setAlarm]    = useState(false)
  const [activeTab,setActiveTab]= useState<'proceso'|'alarmas'>('proceso')

  const spTemp  = 60
  const spLevel = 80

  // Simular nivel y temperatura
  useEffect(() => {
    if (!isOn) return
    const id = setInterval(() => {
      setLevel(prev => {
        const fill = (valvUrea||valvSal||valvAgua) ? 0.25 : 0
        const drain = pumpOut ? -0.3 : 0
        return Math.max(0, Math.min(100, prev + fill + drain + (Math.random()-0.5)*0.05))
      })
      setTemp(prev => {
        const target = isOn ? spTemp : 20
        return prev + (target - prev)*0.03 + (Math.random()-0.5)*0.2
      })
    }, 600)
    return () => clearInterval(id)
  }, [isOn, valvUrea, valvSal, valvAgua, pumpOut])

  useEffect(() => {
    if (temp > 80 || level > 95) setAlarm(true)
    else setAlarm(false)
  }, [temp, level])

  const handlePower = () => {
    toggleEquipment('dissolution_tank')
    if (isOn) {
      setAgitOn(false); setValvUrea(false); setValvSal(false)
      setValvAgua(false); setPumpOut(false)
    }
  }

  const canOp = isOn

  const statusColor = eq.status === 'active' ? '#1e88e5'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#ef4444' : '#6b7280'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      <div style={{
        background: BG, border: '2px solid #9ab0c0',
        borderRadius: 6, width: '100%', maxWidth: 700,
        boxShadow: '0 30px 80px rgba(0,0,0,0.85)',
        fontFamily: 'sans-serif', overflow: 'hidden',
      }}>

        {/* ── Barra superior SCADA ──────────────────────────────── */}
        <div style={{ background: '#2c3e50', padding: '0', display: 'flex',
          alignItems: 'stretch', borderBottom: '2px solid #1a2a3a' }}>

          {/* Botones de navegación estilo Elipse */}
          {[
            { label: 'Login', color: '#546e7a' },
            { label: 'Alarmas', color: alarm ? '#ef4444' : '#546e7a' },
          ].map(b => (
            <button key={b.label} style={{
              background: b.color, border: 'none', color: '#fff',
              padding: '5px 14px', fontSize: 10, fontWeight: 'bold', cursor: 'pointer',
              borderRight: '1px solid #1a2a3a',
            }}>{b.label}</button>
          ))}

          {/* Título central */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#e0e0e0', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
              BATEA DE DISOLUCIÓN — DT-300
            </span>
          </div>

          {/* Estado + cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}/>
            <span style={{ color: '#90a4ae', fontSize: 9, fontFamily: 'monospace' }}>
              {new Date().toTimeString().slice(0,8)}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#90a4ae"/>
            </button>
          </div>
        </div>

        {/* ── Cuerpo: diagrama + panel datos ───────────────────── */}
        <div style={{ display: 'flex', flex: 1 }}>

          {/* Diagrama proceso */}
          <div style={{ flex: 1, height: 250 }}>
            <ProcessDiagram isOn={isOn} level={level} temp={temp}
              agitOn={agitOn} valvUrea={valvUrea} valvSal={valvSal}
              valvAgua={valvAgua} pumpOut={pumpOut}/>
          </div>

          {/* Panel de datos (derecha) */}
          <div style={{ width: 155, background: PANEL_R, borderLeft: '1px solid #9ab0c0',
            padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ color: TEXT, fontSize: 9, fontWeight: 'bold', borderBottom: '1px solid #9ab0c0',
              paddingBottom: 4, marginBottom: 2 }}>Dados do Processo</div>

            <DataRow label="Nivel batea (L)"   value={isOn?(level/100*300).toFixed(0):0}   unit="L"    color={level>90?'#ef4444':PIPE}/>
            <DataRow label="Temperatura"        value={isOn?temp.toFixed(1):'--'}           unit="°C"   color={temp>75?'#ef4444':'#f97316'}/>
            <DataRow label="SP Temperatura"     value={spTemp}                              unit="°C"   color="#f59e0b"/>
            <DataRow label="Nivel (%)"          value={isOn?level.toFixed(1):'0.0'}         unit="%"    color={level<15?'#ef4444':PIPE}/>
            <DataRow label="Válv. Urea"         value={valvUrea&&isOn?'ABIERTA':'CERRADA'}              color={valvUrea&&isOn?'#f59e0b':'#6b7280'}/>
            <DataRow label="Válv. Sal"          value={valvSal&&isOn?'ABIERTA':'CERRADA'}               color={valvSal&&isOn?'#a78bfa':'#6b7280'}/>
            <DataRow label="Válv. Agua"         value={valvAgua&&isOn?'ABIERTA':'CERRADA'}              color={valvAgua&&isOn?'#1e88e5':'#6b7280'}/>
            <DataRow label="Rot. Agitador"      value={isOn&&agitOn?'664':'0'}              unit="RPM"  color={agitOn&&isOn?'#22c55e':'#6b7280'}/>

            {/* Alarma */}
            {alarm && (
              <div style={{ background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 3, padding: '3px 6px' }}>
                <div style={{ color: '#ef4444', fontSize: 8, fontWeight: 'bold' }}>⚠ ALARMA ACTIVA</div>
                {temp > 80 && <div style={{ color: '#b71c1c', fontSize: 7 }}>Temperatura alta: {temp.toFixed(1)}°C</div>}
                {level > 95 && <div style={{ color: '#b71c1c', fontSize: 7 }}>Nivel máximo</div>}
              </div>
            )}
          </div>
        </div>

        {/* ── Panel de control inferior ─────────────────────────── */}
        <div style={{ background: BG2, borderTop: '1px solid #9ab0c0',
          padding: '8px 12px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Equipo principal */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <ScadaBtn label={isOn ? '■ APAGAR' : '▶ ENCENDER'} active={isOn}
              color={isOn ? 'red' : 'green'} onClick={handlePower}/>
          </div>

          <div style={{ width: 1, height: 28, background: '#9ab0c0' }}/>

          {/* Válvulas */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ color: '#546e7a', fontSize: 9, fontWeight: 'bold' }}>VÁLVULAS:</span>
            <ScadaBtn label={valvUrea ? '● UREA' : '○ UREA'}   active={valvUrea}
              color="orange" onClick={() => { if(canOp) setValvUrea(p=>!p) }}/>
            <ScadaBtn label={valvSal  ? '● SAL'  : '○ SAL'}    active={valvSal}
              color="orange" onClick={() => { if(canOp) setValvSal(p=>!p) }}/>
            <ScadaBtn label={valvAgua ? '● AGUA' : '○ AGUA'}   active={valvAgua}
              color="blue"   onClick={() => { if(canOp) setValvAgua(p=>!p) }}/>
          </div>

          <div style={{ width: 1, height: 28, background: '#9ab0c0' }}/>

          {/* Agitador + Bomba */}
          <div style={{ display: 'flex', gap: 5 }}>
            <ScadaBtn label={agitOn ? '● AGITADOR' : '○ AGITADOR'} active={agitOn}
              color="green" onClick={() => { if(canOp) setAgitOn(p=>!p) }}/>
            <ScadaBtn label={pumpOut ? '● BOMBA OUT' : '○ BOMBA OUT'} active={pumpOut}
              color="blue" onClick={() => { if(canOp) setPumpOut(p=>!p) }}/>
          </div>

          <div style={{ width: 1, height: 28, background: '#9ab0c0' }}/>

          <ScadaBtn label="RESET AL." color="gray" onClick={() => setAlarm(false)}/>

          {/* Estado */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            {[
              { label: 'TEMP', val: `${isOn?temp.toFixed(1):'--'}°C`, c: '#f97316' },
              { label: 'NIV.',  val: `${level.toFixed(0)}%`,           c: level<15?'#ef4444':PIPE },
            ].map(s=>(
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#7a8fa0', fontSize: 7 }}>{s.label}</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 11, color: s.c }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
