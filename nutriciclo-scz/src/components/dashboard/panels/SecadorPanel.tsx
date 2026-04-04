import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta ───────────────────────────────────────────────────────────────────
const PANEL_BG   = '#c8cdd1'
const RECESS_BG  = '#b0b5b9'
const DARK_RECESS= '#8a9096'

// ─── Display 7-segmentos PID ──────────────────────────────────────────────────
function PidDisplay({ label, value, setpoint, unit = '°C', active }: {
  label: string; value: number; setpoint: number; unit?: string; active: boolean
}) {
  const s7: CSSProperties = {
    background: '#0a0a0a',
    fontFamily: "'Courier New', monospace",
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: active ? '#ff2200' : '#1a0000',
    textShadow: active ? '0 0 6px #ff2200' : 'none',
    padding: '2px 6px',
    borderRadius: 2,
    minWidth: 58,
    textAlign: 'right' as const,
    display: 'block',
  }
  const spStyle: CSSProperties = { ...s7, fontSize: 14, color: active ? '#ff8800' : '#1a0500', textShadow: active ? '0 0 5px #ff8800' : 'none' }

  return (
    <div style={{
      background: '#3a3a3a',
      border: '2px solid #222',
      borderRadius: 4,
      padding: '6px 8px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.1)',
      minWidth: 100,
    }}>
      <div style={{ color: '#888', fontSize: 9, letterSpacing: 1, marginBottom: 4, textAlign: 'center' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
        <span style={s7}>{active ? value.toFixed(1) : '--.-'}</span>
        <span style={spStyle}>{setpoint.toFixed(0)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {['▼','SET','▲'].map(b => (
          <button key={b} style={{
            background: 'linear-gradient(180deg,#555,#333)',
            border: '1px solid #111',
            borderRadius: 2,
            color: '#aaa',
            fontSize: 8,
            padding: '1px 4px',
            cursor: 'pointer',
            boxShadow: '0 1px 0 #666',
          }}>{b}</button>
        ))}
      </div>
      <div style={{ color: '#555', fontSize: 8, textAlign: 'center', marginTop: 2 }}>{unit}</div>
    </div>
  )
}

// ─── Diagrama de proceso SVG ──────────────────────────────────────────────────
function ProcessDiagram({ running, temp }: { running: boolean; temp: number }) {
  const flame = running && temp > 60
  return (
    <svg viewBox="0 0 200 130" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="drum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#888"/>
          <stop offset="100%" stopColor="#555"/>
        </linearGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo */}
      <rect width="200" height="130" fill="#1a2a1a" rx="4"/>

      {/* Líneas de flujo */}
      <line x1="10" y1="65" x2="35" y2="65" stroke="#4ade80" strokeWidth="2" strokeDasharray={running?"4,2":"none"} opacity="0.7"/>
      <line x1="155" y1="65" x2="185" y2="65" stroke="#4ade80" strokeWidth="2" strokeDasharray={running?"4,2":"none"} opacity="0.7"/>
      <line x1="100" y1="15" x2="100" y2="35" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7"/>
      <line x1="100" y1="95" x2="100" y2="115" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7" strokeDasharray={running?"3,2":"none"}/>

      {/* Tolva alimentación */}
      <polygon points="5,45 20,45 17,65 8,65" fill="#555" stroke="#888" strokeWidth="1"/>
      <text x="12" y="42" fill="#aaa" fontSize="6" textAnchor="middle">ALM.</text>

      {/* Tambor rotatorio - cuerpo */}
      <rect x="35" y="45" width="120" height="40" rx="20" fill="url(#drum)" stroke="#aaa" strokeWidth="1.5"/>
      {/* Anillos del tambor */}
      {[55,75,95,115,135].map(x => (
        <line key={x} x1={x} y1="47" x2={x} y2="83" stroke="#999" strokeWidth="0.8" opacity="0.5"/>
      ))}
      {/* Texto del tambor */}
      <text x="95" y="68" fill="#ccc" fontSize="8" textAnchor="middle" fontWeight="bold">SECADOR</text>
      <text x="95" y="78" fill="#aaa" fontSize="6" textAnchor="middle">ROTATORIO</text>

      {/* Flechas de rotación si está corriendo */}
      {running && <>
        <path d="M 70 43 Q 80 36 90 43" fill="none" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <path d="M 110 87 Q 100 94 90 87" fill="none" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arr)"/>
        <defs>
          <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M 0 0 L 4 2 L 0 4 Z" fill="#4ade80"/>
          </marker>
        </defs>
      </>}

      {/* Cámara de combustión */}
      <rect x="8" y="55" width="25" height="20" rx="3" fill="#2a1000" stroke="#f97316" strokeWidth="1.5"/>
      {flame && <>
        <ellipse cx="20" cy="68" rx="5" ry="4" fill="#f97316" opacity="0.9" filter="url(#glow2)"/>
        <ellipse cx="20" cy="65" rx="3" ry="3" fill="#fbbf24" opacity="0.8" filter="url(#glow2)"/>
        <ellipse cx="20" cy="63" rx="2" ry="2" fill="#fff" opacity="0.7"/>
      </>}
      <text x="20" y="80" fill="#f97316" fontSize="5" textAnchor="middle">QUEM.</text>

      {/* Ventilador extracción */}
      <circle cx="175" cy="65" r="14" fill="#1a1a2e" stroke="#60a5fa" strokeWidth="1.5"/>
      {running && [0,60,120,180,240,300].map(deg => {
        const rad = (deg*Math.PI)/180
        const x1 = 175+5*Math.cos(rad), y1 = 65+5*Math.sin(rad)
        const x2 = 175+12*Math.cos(rad+0.5), y2 = 65+12*Math.sin(rad+0.5)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60a5fa" strokeWidth="1.5"/>
      })}
      <text x="175" y="88" fill="#60a5fa" fontSize="5" textAnchor="middle">FAN</text>

      {/* Ciclón separador */}
      <polygon points="90,10 110,10 107,30 93,30" fill="#334" stroke="#60a5fa" strokeWidth="1"/>
      <rect x="97" y="30" width="6" height="10" fill="#334" stroke="#60a5fa" strokeWidth="0.8"/>
      <text x="100" y="8" fill="#60a5fa" fontSize="5" textAnchor="middle">CICLÓN</text>

      {/* Descarga */}
      <rect x="93" y="100" width="14" height="12" fill="#554422" stroke="#f59e0b" strokeWidth="1"/>
      <text x="100" y="120" fill="#f59e0b" fontSize="5" textAnchor="middle">DESC.</text>

      {/* Temperatura display */}
      <rect x="62" y="51" width="38" height="13" rx="2" fill="#050f05"/>
      <text x="81" y="61" fill={temp>80?'#ff2200':'#880000'} fontSize="9" textAnchor="middle"
        fontFamily="monospace" fontWeight="bold" filter={running?"url(#glow2)":undefined}>
        {running ? temp.toFixed(1) : '--.-'}°C
      </text>
    </svg>
  )
}

// ─── Botón iluminado industrial ───────────────────────────────────────────────
function IllumBtn({ label, color, active, onClick, size = 44 }: {
  label: string; color: 'red' | 'green' | 'yellow' | 'blue' | 'white' | 'orange'
  active?: boolean; onClick: () => void; size?: number
}) {
  const [pressed, setPressed] = useState(false)
  const isDown = pressed

  const palette: Record<string, { top: string; mid: string; sh: string; glow: string }> = {
    red:    { top: '#f87171', mid: '#dc2626', sh: '#7f1d1d', glow: '#dc2626' },
    green:  { top: '#4ade80', mid: '#16a34a', sh: '#14532d', glow: '#22c55e' },
    yellow: { top: '#fde047', mid: '#ca8a04', sh: '#713f12', glow: '#fbbf24' },
    blue:   { top: '#93c5fd', mid: '#2563eb', sh: '#1e3a8a', glow: '#3b82f6' },
    white:  { top: '#f9fafb', mid: '#d1d5db', sh: '#6b7280', glow: '#f9fafb' },
    orange: { top: '#fb923c', mid: '#ea580c', sh: '#7c2d12', glow: '#f97316' },
  }

  const { top, mid, sh, glow } = palette[color]

  // El indicador luminoso encima del botón
  const ledGrad = active
    ? `radial-gradient(circle at 40% 30%, #fff, ${top} 40%, ${sh})`
    : `radial-gradient(circle at 40% 30%, #444, #222)`

  const btnStyle: CSSProperties = {
    width: size,
    height: size,
    background: isDown
      ? `linear-gradient(180deg,${mid},${sh})`
      : `linear-gradient(180deg,${top},${mid})`,
    boxShadow: isDown
      ? `inset 0 3px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1)`
      : `0 4px 0 ${sh}, 0 5px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)`,
    transform: isDown ? 'translateY(3px)' : 'translateY(0)',
    transition: 'transform 0.06s, box-shadow 0.06s',
    border: `1px solid ${sh}`,
    borderRadius: 4,
    cursor: 'pointer',
    userSelect: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '3px 2px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* LED indicador */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: ledGrad,
        boxShadow: active ? `0 0 6px ${glow}, 0 0 12px ${glow}66` : 'inset 0 1px 2px rgba(0,0,0,0.8)',
        border: '1px solid rgba(0,0,0,0.4)',
      }} />
      <button
        style={btnStyle}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onClick() }}
        onMouseLeave={() => setPressed(false)}
      >
        <span style={{ color: '#fff', fontSize: 7, fontWeight: 'bold', letterSpacing: 0.3, textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          {label}
        </span>
      </button>
    </div>
  )
}

// ─── Interruptor selector rotatorio ──────────────────────────────────────────
function SelectorSwitch({ label, options, value, onChange }: {
  label: string; options: string[]; value: number; onChange: (v: number) => void
}) {
  const angle = -135 + (value / (options.length - 1)) * 270
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ color: '#444', fontSize: 9, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ position: 'relative', width: 44, height: 44 }}>
        {/* Cuerpo */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #888, #444 50%, #222)',
          border: '2px solid #333',
          boxShadow: '0 3px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => onChange((value + 1) % options.length)}>
          {/* Indicador */}
          <div style={{
            width: 3, height: 14,
            background: '#fff',
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.2s',
            marginBottom: 8,
            boxShadow: '0 0 4px rgba(255,255,255,0.5)',
          }}/>
        </div>
      </div>
      <div style={{ color: '#22c55e', fontSize: 10, fontWeight: 'bold' }}>{options[value]}</div>
    </div>
  )
}

// ─── Botón de emergencia ──────────────────────────────────────────────────────
function EmergencyBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ color: '#444', fontSize: 9, letterSpacing: 0.5, textAlign: 'center' }}>PARO<br/>EMERGENCIA</div>
      {/* Anillo cromado */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 25%, #e0e0e0, #999 50%, #666)',
        padding: 4,
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
      }}>
        <button
          style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: pressed
              ? 'radial-gradient(circle at 40% 30%, #f87171, #7f1d1d)'
              : 'radial-gradient(circle at 40% 30%, #fca5a5, #dc2626 50%, #7f1d1d)',
            boxShadow: pressed
              ? 'inset 0 4px 8px rgba(0,0,0,0.7)'
              : `0 ${active?2:5}px 0 #450a0a, 0 6px 12px rgba(0,0,0,0.5)`,
            transform: pressed ? 'translateY(3px)' : active ? 'translateY(3px)' : 'translateY(0)',
            transition: 'transform 0.08s, box-shadow 0.08s',
            border: 'none', cursor: 'pointer',
          }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => { setPressed(false); onClick() }}
          onMouseLeave={() => setPressed(false)}
        >
          <span style={{ color: '#fff', fontSize: 8, fontWeight: 'bold', pointerEvents: 'none' }}>
            {active ? '🔒' : '⚠'}
          </span>
        </button>
      </div>
      {active && <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 'bold', animation: 'none' }}>ACTIVO</span>}
    </div>
  )
}

// ─── Panel Principal ─────────────────────────────────────────────────────────
export function SecadorPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq     = equipment.rotary_dryer
  const isOn   = eq.active
  const dryerT = sensors.dryerTemp

  // ── estado local ─────────────────────────────────────────────────────────
  const [emergency, setEmergency] = useState(false)
  const [modeIdx, setModeIdx]     = useState(0)     // AUTO / MANUAL
  const [speedIdx, setSpeedIdx]   = useState(1)     // LENTA / MEDIA / ALTA
  const [spTemp, setSpTemp]       = useState(100)   // setpoint temperatura
  const [spAire, setSpAire]       = useState(80)    // setpoint caudal aire

  // Sub-sistemas locales (ON/OFF)
  const [tambor,    setTambor]    = useState(false)
  const [quemador,  setQuemador]  = useState(false)
  const [fanEnt,    setFanEnt]    = useState(false)
  const [fanSal,    setFanSal]    = useState(false)
  const [alimenta,  setAlimenta]  = useState(false)
  const [descarga,  setDescarga]  = useState(false)
  const [ciclón,    setCiclón]    = useState(false)
  const [lubric,    setLubric]    = useState(false)
  const [alarma,    setAlarma]    = useState(false)

  // Alarma por temperatura alta
  useEffect(() => {
    if (dryerT > 130) setAlarma(true)
    else if (dryerT < 120) setAlarma(false)
  }, [dryerT])

  // Si emergency → apagar todo
  useEffect(() => {
    if (emergency) {
      setTambor(false); setQuemador(false)
      setFanEnt(false); setFanSal(false)
      setAlimenta(false); setDescarga(false)
      if (isOn) toggleEquipment('rotary_dryer')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergency])

  // Al apagar el equipo principal, apagar sub-sistemas
  useEffect(() => {
    if (!isOn) {
      setTambor(false); setQuemador(false)
      setFanEnt(false); setFanSal(false)
      setAlimenta(false); setDescarga(false)
    }
  }, [isOn])

  const toggle = (fn: (v: boolean) => void, v: boolean, dep = true) => {
    if (!dep || emergency) return
    fn(!v)
  }

  const modos   = ['AUTO', 'MANUAL']
  const velocidades = ['LENTA','MEDIA','ALTA']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{ background: PANEL_BG, borderRadius: 10, width: '100%', maxWidth: 620,
        boxShadow: '0 30px 80px rgba(0,0,0,0.8)', overflow: 'hidden',
        border: '3px solid #999', fontFamily: 'sans-serif' }}>

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div style={{ background: '#2d3748', padding: '8px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%',
                background: eq.status === 'active' ? '#22c55e' : eq.status === 'warning' ? '#f59e0b' : '#6b7280',
                boxShadow: eq.status === 'active' ? '0 0 8px #22c55e' : 'none' }}/>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                SECADOR ROTATORIO — {eq.model}
              </span>
            </div>
            <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
              {eq.manufacturer} · Flujo contracorriente · 80–120 °C
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
            <X size={18}/>
          </button>
        </div>

        {/* ── Cuerpo ────────────────────────────────────────────── */}
        <div style={{ background: PANEL_BG, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── FILA 1: Diagrama + Controladores PID ─────────────── */}
          <div style={{ display: 'flex', gap: 12 }}>

            {/* Diagrama proceso */}
            <div style={{ flex: 1, background: '#111', border: '3px solid #888',
              borderRadius: 6, overflow: 'hidden', height: 140,
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.2)' }}>
              <ProcessDiagram running={isOn && tambor} temp={dryerT} />
            </div>

            {/* Controladores PID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PidDisplay label="TEMP. SALIDA" value={dryerT}       setpoint={spTemp} active={isOn} />
              <PidDisplay label="CAUDAL AIRE"  value={isOn ? spAire * 0.9 + Math.random()*5 : 0}
                setpoint={spAire} unit="m³/h" active={isOn} />
            </div>

            {/* Ajustes setpoint */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
              <div style={{ background: DARK_RECESS, borderRadius: 6, padding: '8px 10px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ color: '#555', fontSize: 9 }}>SP TEMP (°C)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => setSpTemp(p => Math.max(60, p - 5))}
                    style={{ background: '#888', border: '1px solid #555', borderRadius: 2,
                      color: '#fff', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>▼</button>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#222', fontSize: 13, minWidth: 32, textAlign: 'center' }}>
                    {spTemp}
                  </span>
                  <button onClick={() => setSpTemp(p => Math.min(130, p + 5))}
                    style={{ background: '#888', border: '1px solid #555', borderRadius: 2,
                      color: '#fff', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>▲</button>
                </div>
                <div style={{ color: '#555', fontSize: 9 }}>SP AIRE (m³/h)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => setSpAire(p => Math.max(20, p - 10))}
                    style={{ background: '#888', border: '1px solid #555', borderRadius: 2,
                      color: '#fff', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>▼</button>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#222', fontSize: 13, minWidth: 32, textAlign: 'center' }}>
                    {spAire}
                  </span>
                  <button onClick={() => setSpAire(p => Math.min(200, p + 10))}
                    style={{ background: '#888', border: '1px solid #555', borderRadius: 2,
                      color: '#fff', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>▲</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── FILA 2: Emergencia + Selectores + LEDs estado ──────── */}
          <div style={{ background: RECESS_BG, borderRadius: 8, padding: '10px 14px',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>

            <EmergencyBtn active={emergency} onClick={() => setEmergency(p => !p)} />

            <div style={{ width: 1, height: 50, background: '#999' }}/>

            <SelectorSwitch label="MODO" options={modos} value={modeIdx} onChange={setModeIdx} />
            <SelectorSwitch label="VELOCIDAD" options={velocidades} value={speedIdx} onChange={setSpeedIdx} />

            <div style={{ width: 1, height: 50, background: '#999' }}/>

            {/* LEDs de estado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px 14px' }}>
              {[
                { label: 'ENERGÍA',   on: isOn,     color: 'green'  as const },
                { label: 'TAMBOR',    on: tambor,   color: 'green'  as const },
                { label: 'QUEMADOR',  on: quemador, color: 'orange' as const },
                { label: 'ALARMA',    on: alarma,   color: 'red'    as const },
                { label: 'FAN ENT.',  on: fanEnt,   color: 'blue'   as const },
                { label: 'FAN SAL.',  on: fanSal,   color: 'blue'   as const },
                { label: 'ALIMENTA.', on: alimenta, color: 'yellow' as const },
                { label: 'DESCARGA',  on: descarga, color: 'yellow' as const },
              ].map(l => {
                const ledC: Record<string,{on:string;glow:string}> = {
                  green:  {on:'radial-gradient(circle at 35% 30%,#bbf7d0,#22c55e 40%,#15803d)',glow:'#22c55e'},
                  orange: {on:'radial-gradient(circle at 35% 30%,#fed7aa,#f97316 40%,#7c2d12)',glow:'#f97316'},
                  red:    {on:'radial-gradient(circle at 35% 30%,#fca5a5,#ef4444 40%,#7f1d1d)',glow:'#ef4444'},
                  blue:   {on:'radial-gradient(circle at 35% 30%,#bfdbfe,#3b82f6 40%,#1e3a8a)',glow:'#3b82f6'},
                  yellow: {on:'radial-gradient(circle at 35% 30%,#fef08a,#f59e0b 40%,#b45309)',glow:'#f59e0b'},
                }
                const c = ledC[l.color]
                return (
                  <div key={l.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: l.on ? c.on : 'radial-gradient(circle at 35% 30%,#444,#111)',
                      boxShadow: l.on ? `0 0 8px ${c.glow}` : 'inset 0 1px 2px rgba(0,0,0,0.8)',
                      border: '1px solid rgba(0,0,0,0.5)',
                    }}/>
                    <span style={{ color: '#555', fontSize: 7, letterSpacing: 0.3 }}>{l.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── FILA 3: Cuadrícula de botones iluminados ─────────── */}
          <div style={{ background: RECESS_BG, borderRadius: 8, padding: '10px 14px',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)' }}>

            <div style={{ color: '#555', fontSize: 9, letterSpacing: 1, marginBottom: 10 }}>
              CONTROL DE SUBSISTEMAS
            </div>

            {/* Fila 1: Equipo principal */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <IllumBtn label={'ENCENDER\nEQUIPO'} color="green"  active={isOn}
                onClick={() => { if (!emergency) toggleEquipment('rotary_dryer') }} />
              <IllumBtn label={'APAGAR\nEQUIPO'}  color="red"    active={!isOn && !emergency}
                onClick={() => { if (isOn && !emergency) toggleEquipment('rotary_dryer') }} />

              <div style={{ width: 1, height: 44, background: '#999', alignSelf: 'center' }}/>

              <IllumBtn label={'TAMBOR\nINICIO'}  color="green"  active={tambor}
                onClick={() => toggle(setTambor, tambor, isOn)} />
              <IllumBtn label={'TAMBOR\nPARO'}    color="red"    active={false}
                onClick={() => toggle(setTambor, tambor, isOn)} />

              <div style={{ width: 1, height: 44, background: '#999', alignSelf: 'center' }}/>

              <IllumBtn label={'QUEM.\nON'}  color="orange" active={quemador}
                onClick={() => toggle(setQuemador, quemador, isOn && tambor)} />
              <IllumBtn label={'QUEM.\nOFF'} color="red"    active={false}
                onClick={() => toggle(setQuemador, quemador, isOn)} />
            </div>

            {/* Fila 2: Ventiladores + alimentación */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <IllumBtn label={'FAN\nENTRADA ON'}  color="blue"   active={fanEnt}
                onClick={() => toggle(setFanEnt, fanEnt, isOn)} />
              <IllumBtn label={'FAN\nENTRADA OFF'} color="red"    active={false}
                onClick={() => toggle(setFanEnt, fanEnt, isOn)} />

              <div style={{ width: 1, height: 44, background: '#999', alignSelf: 'center' }}/>

              <IllumBtn label={'FAN\nSALIDA ON'}   color="blue"   active={fanSal}
                onClick={() => toggle(setFanSal, fanSal, isOn)} />
              <IllumBtn label={'FAN\nSALIDA OFF'}  color="red"    active={false}
                onClick={() => toggle(setFanSal, fanSal, isOn)} />

              <div style={{ width: 1, height: 44, background: '#999', alignSelf: 'center' }}/>

              <IllumBtn label={'ALIMENT.\nON'}  color="yellow" active={alimenta}
                onClick={() => toggle(setAlimenta, alimenta, isOn && tambor)} />
              <IllumBtn label={'ALIMENT.\nOFF'} color="red"    active={false}
                onClick={() => toggle(setAlimenta, alimenta, isOn)} />
            </div>

            {/* Fila 3: Descarga + ciclón + lubricación + alarma */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <IllumBtn label={'DESCARGA\nON'}   color="yellow" active={descarga}
                onClick={() => toggle(setDescarga, descarga, isOn)} />
              <IllumBtn label={'DESCARGA\nOFF'}  color="red"    active={false}
                onClick={() => toggle(setDescarga, descarga, isOn)} />

              <div style={{ width: 1, height: 44, background: '#999', alignSelf: 'center' }}/>

              <IllumBtn label={'CICLÓN\nON'}    color="blue"   active={ciclón}
                onClick={() => toggle(setCiclón, ciclón, isOn)} />
              <IllumBtn label={'LUBRIC.\nON'}   color="white"  active={lubric}
                onClick={() => toggle(setLubric, lubric, isOn)} />

              <div style={{ width: 1, height: 44, background: '#999', alignSelf: 'center' }}/>

              <IllumBtn label={'RESET\nALARMA'} color="white"  active={false}
                onClick={() => setAlarma(false)} />
              <IllumBtn label={'TEST\nLUCES'}   color="yellow" active={false}
                onClick={() => {}} />
            </div>
          </div>
        </div>

        {/* ── Barra de estado ───────────────────────────────────── */}
        <div style={{ background: '#1a1a1a', padding: '7px 16px',
          display: 'flex', gap: 16, justifyContent: 'space-around', borderTop: '2px solid #333' }}>
          {[
            { label: 'Temp. Secador', value: `${dryerT.toFixed(1)} °C`,           color: '#f97316' },
            { label: 'SP Temp',       value: `${spTemp} °C`,                       color: '#fbbf24' },
            { label: 'Modo',          value: modos[modeIdx],                        color: '#60a5fa' },
            { label: 'Velocidad',     value: velocidades[speedIdx],                 color: '#4ade80' },
            { label: 'Caudal Aire',   value: `${isOn ? spAire : 0} m³/h`,          color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#444', fontSize: 9 }}>{s.label}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 11, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
