import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta de colores del panel ──────────────────────────────────────────────
const PANEL_BG   = 'linear-gradient(160deg,#b8c4ca 0%,#9eadb6 25%,#8fa0aa 50%,#96a8b4 75%,#aab8c0 100%)'
const RECESS_BG  = 'linear-gradient(180deg,#6a7880 0%,#58686f 100%)'
const SECTION_SH = 'inset 0 2px 5px rgba(0,0,0,0.5),0 1px 0 rgba(255,255,255,0.15)'

// ─── Manómetro SVG realista ───────────────────────────────────────────────────
function Manometro({ value, max = 2 }: { value: number; max?: number }) {
  const pct  = Math.min(1, Math.max(0, value / max))
  const angle = -220 + pct * 260
  const rad   = (angle * Math.PI) / 180
  const cx = 55, cy = 58, r = 38

  function arc(s: number, e: number, color: string, width = 6) {
    const a1 = ((-220 + s * 260) * Math.PI) / 180
    const a2 = ((-220 + e * 260) * Math.PI) / 180
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
    return (
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 0.5 ? 1 : 0} 1 ${x2} ${y2}`}
        stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />
    )
  }

  const tickAngles = [0, 0.2, 0.4, 0.6, 0.8, 1]
  const tickLabels = ['0', '0.4', '0.8', '1.2', '1.6', '2']

  return (
    <svg viewBox="0 0 110 90" className="w-full h-full">
      {/* Bisel / cuerpo exterior */}
      <circle cx={cx} cy={cy} r={52} fill="url(#bezel)" />
      <defs>
        <radialGradient id="bezel" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#d0d0d0" />
          <stop offset="60%" stopColor="#888" />
          <stop offset="100%" stopColor="#555" />
        </radialGradient>
        <radialGradient id="face" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#f5f5f0" />
          <stop offset="100%" stopColor="#ddddd5" />
        </radialGradient>
      </defs>
      {/* Cara del gauge */}
      <circle cx={cx} cy={cy} r={46} fill="url(#face)" />
      {/* Zonas de color */}
      {arc(0,   0.5,  '#16a34a')}
      {arc(0.5, 0.78, '#ca8a04')}
      {arc(0.78,1,    '#dc2626')}
      {/* Marcas y etiquetas */}
      {tickAngles.map((p, i) => {
        const a  = ((-220 + p * 260) * Math.PI) / 180
        const r1 = 30, r2 = 38
        const x1 = cx + r1 * Math.cos(a), y1 = cy + r1 * Math.sin(a)
        const x2 = cx + r2 * Math.cos(a), y2 = cy + r2 * Math.sin(a)
        const lx = cx + 23 * Math.cos(a), ly = cy + 23 * Math.sin(a)
        return (
          <g key={p}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth="1.5" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fill="#333" fontSize="5.5" fontWeight="bold">{tickLabels[i]}</text>
          </g>
        )
      })}
      {/* Mini ticks */}
      {Array.from({ length: 21 }, (_, i) => i / 20).map((p) => {
        if (tickAngles.some(t => Math.abs(t - p) < 0.04)) return null
        const a = ((-220 + p * 260) * Math.PI) / 180
        return (
          <line key={p}
            x1={cx + 34 * Math.cos(a)} y1={cy + 34 * Math.sin(a)}
            x2={cx + 38 * Math.cos(a)} y2={cy + 38 * Math.sin(a)}
            stroke="#555" strokeWidth="0.8" />
        )
      })}
      {/* Texto BAR */}
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#444" fontSize="5.5" fontStyle="italic">bar</text>
      {/* Valor */}
      <text x={cx} y={cy + 24} textAnchor="middle" fill={value > 1.4 ? '#dc2626' : '#222'}
        fontSize="7" fontWeight="bold" fontFamily="monospace">{value.toFixed(2)}</text>
      {/* Aguja */}
      <line
        x1={cx - 6 * Math.cos(rad)} y1={cy - 6 * Math.sin(rad)}
        x2={cx + 34 * Math.cos(rad)} y2={cy + 34 * Math.sin(rad)}
        stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
      />
      {/* Centro */}
      <circle cx={cx} cy={cy} r={5} fill="#555" />
      <circle cx={cx} cy={cy} r={3} fill="#888" />
      <circle cx={cx} cy={cy} r={1.5} fill="#ccc" />
    </svg>
  )
}

// ─── Display 7 segmentos ──────────────────────────────────────────────────────
function DigitalDisplay({ value, active = true }: { value: string; active?: boolean }) {
  const s: CSSProperties = {
    background: '#050f05',
    border: '2px solid #111',
    borderRadius: 4,
    padding: '6px 14px',
    fontFamily: "'Courier New', 'Lucida Console', monospace",
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
    color: active ? '#ff8c00' : '#2a1500',
    textShadow: active ? '0 0 8px #ff8c00, 0 0 18px rgba(255,140,0,0.6)' : 'none',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
    userSelect: 'none',
    minWidth: 120,
    textAlign: 'center',
  }
  return <div style={s}>{value}</div>
}

// ─── Botón físico genérico 3D ────────────────────────────────────────────────
function PhysicalButton({
  label, color, onClick, disabled = false,
  width = 70, height = 44,
}: {
  label: string; color: string; onClick: () => void
  disabled?: boolean; width?: number; height?: number
}) {
  const [pressed, setPressed] = useState(false)
  const isDown = pressed && !disabled

  const colors: Record<string, [string, string, string]> = {
    green:  ['#4ade80','#16a34a','#14532d'],
    red:    ['#f87171','#dc2626','#7f1d1d'],
    gray:   ['#d1d5db','#9ca3af','#4b5563'],
    yellow: ['#fde047','#ca8a04','#713f12'],
  }
  const [top, mid, shadow] = colors[color] ?? colors.gray

  const s: CSSProperties = {
    width, height,
    background: isDown
      ? `linear-gradient(180deg,${mid} 0%,${shadow} 100%)`
      : `linear-gradient(180deg,${top} 0%,${mid} 100%)`,
    boxShadow: isDown
      ? `inset 0 3px 6px rgba(0,0,0,0.6),0 1px 0 rgba(255,255,255,0.1)`
      : `0 5px 0 ${shadow},0 6px 10px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.35)`,
    transform: isDown ? 'translateY(4px)' : 'translateY(0)',
    transition: 'transform 0.06s,box-shadow 0.06s',
    border: `1px solid ${shadow}`,
    borderRadius: 5,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <button
      style={s}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick() }}
      onMouseLeave={() => setPressed(false)}
    >
      {label}
    </button>
  )
}

// ─── LED indicador redondo ────────────────────────────────────────────────────
function LED({ active, color, size = 40 }: { active: boolean; color: 'green' | 'amber' | 'red'; size?: number }) {
  const colors = {
    green: { on: 'radial-gradient(circle at 35% 30%,#bbf7d0,#22c55e 40%,#15803d 100%)', glow: '#22c55e' },
    amber: { on: 'radial-gradient(circle at 35% 30%,#fef08a,#f59e0b 40%,#b45309 100%)', glow: '#f59e0b' },
    red:   { on: 'radial-gradient(circle at 35% 30%,#fca5a5,#ef4444 40%,#991b1b 100%)', glow: '#ef4444' },
  }
  const c = colors[color]
  const s: CSSProperties = {
    width: size, height: size,
    borderRadius: '50%',
    background: active
      ? c.on
      : 'radial-gradient(circle at 35% 30%,#3a3a3a,#111)',
    boxShadow: active
      ? `0 0 12px ${c.glow},0 0 30px rgba(${color === 'green' ? '34,197,94' : color === 'amber' ? '245,158,11' : '239,68,68'},0.5),inset 0 1px 2px rgba(255,255,255,0.4)`
      : 'inset 0 3px 5px rgba(0,0,0,0.7),0 1px 0 rgba(255,255,255,0.1)',
    border: '3px solid #333',
    flexShrink: 0,
  }
  return <div style={s} />
}

// ─── Botón de emergencia (hongo) ──────────────────────────────────────────────
function EmergencyButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  const [pressed, setPressed] = useState(false)
  const isDown = pressed

  const body: CSSProperties = {
    width: 76, height: 76,
    borderRadius: '50%',
    background: isDown
      ? 'radial-gradient(circle at 40% 38%,#f87171,#b91c1c 50%,#7f1d1d 100%)'
      : 'radial-gradient(circle at 35% 28%,#fca5a5 0%,#ef4444 30%,#b91c1c 65%,#7f1d1d 100%)',
    boxShadow: isDown
      ? 'inset 0 4px 8px rgba(0,0,0,0.6),0 0 10px rgba(200,0,0,0.4)'
      : '0 8px 0 #450a0a,0 10px 18px rgba(0,0,0,0.6),0 0 22px rgba(200,0,0,0.35),inset 0 2px 3px rgba(255,180,180,0.3)',
    transform: isDown ? 'translateY(6px)' : 'translateY(0)',
    transition: 'transform 0.07s,box-shadow 0.07s',
    border: '4px solid #2a0a0a',
    cursor: active ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
    userSelect: 'none',
  }

  const ring: CSSProperties = {
    padding: 6,
    borderRadius: '50%',
    background: 'linear-gradient(145deg,#aaa 0%,#666 50%,#999 100%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.3)',
    display: 'inline-flex',
  }

  return (
    <div style={ring}>
      <button
        style={body}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onClick() }}
        onMouseLeave={() => setPressed(false)}
        disabled={active}
      >
        PARO
      </button>
    </div>
  )
}

// ─── Toggle switch ON/OFF ────────────────────────────────────────────────────
function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const housing: CSSProperties = {
    background: '#1a1a1a',
    border: '2px solid #555',
    borderRadius: 5,
    padding: 3,
    display: 'flex',
    gap: 2,
    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.6)',
  }

  const makeBtn = (label: string, isActive: boolean, side: 'on' | 'off'): CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 3,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1,
    cursor: 'pointer',
    border: 'none',
    background: isActive
      ? side === 'on'
        ? 'linear-gradient(180deg,#4ade80,#16a34a)'
        : 'linear-gradient(180deg,#6b7280,#4b5563)'
      : '#111',
    color: isActive ? '#fff' : '#333',
    boxShadow: isActive
      ? '0 2px 4px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.2)'
      : 'none',
    transition: 'all 0.15s',
  })

  return (
    <div style={housing}>
      <button style={makeBtn('ON', active, 'on')}
        onClick={() => !active && onToggle()}>ON</button>
      <button style={makeBtn('OFF', !active, 'off')}
        onClick={() => active && onToggle()}>OFF</button>
    </div>
  )
}

// ─── Botón de válvula cuadrado ────────────────────────────────────────────────
function ValveBtn({ icon, label, active, onClick }: {
  icon: string; label: string; active: boolean; onClick: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const isDown = pressed

  const s: CSSProperties = {
    width: 64, height: 64,
    background: isDown
      ? active ? 'linear-gradient(180deg,#0369a1,#0c4a6e)' : 'linear-gradient(180deg,#374151,#1f2937)'
      : active ? 'linear-gradient(180deg,#38bdf8,#0284c7)' : 'linear-gradient(180deg,#4b5563,#374151)',
    boxShadow: isDown
      ? 'inset 0 3px 5px rgba(0,0,0,0.5)'
      : active
        ? '0 4px 0 #075985,0 5px 8px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.2)'
        : '0 4px 0 #111,0 5px 8px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1)',
    transform: isDown ? 'translateY(3px)' : 'translateY(0)',
    transition: 'transform 0.06s,box-shadow 0.06s',
    border: '1px solid #111',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    userSelect: 'none',
  }

  return (
    <button style={s}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick() }}
      onMouseLeave={() => setPressed(false)}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 8, color: active ? '#e0f2fe' : '#9ca3af', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.1 }}>
        {label}
      </span>
    </button>
  )
}

// ─── Botón pequeño de control (SET / ▼ / ▲) ──────────────────────────────────
function CtrlBtn({ label, onClick }: { label: string; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  const s: CSSProperties = {
    padding: '4px 10px',
    background: pressed ? 'linear-gradient(180deg,#4b5563,#374151)' : 'linear-gradient(180deg,#9ca3af,#6b7280)',
    boxShadow: pressed
      ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
      : '0 3px 0 #374151,0 4px 6px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.3)',
    transform: pressed ? 'translateY(2px)' : 'translateY(0)',
    transition: 'transform 0.06s',
    border: '1px solid #333',
    borderRadius: 4,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    cursor: 'pointer',
  }
  return (
    <button style={s}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick() }}
      onMouseLeave={() => setPressed(false)}
    >
      {label}
    </button>
  )
}

// ─── Etiqueta de sección ──────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: '#e2e8f0',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

// ─── Caja de sección metálica ────────────────────────────────────────────────
function PanelBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: RECESS_BG,
      borderRadius: 8,
      border: '1px solid #3a4a52',
      boxShadow: SECTION_SH,
      padding: '10px 12px',
    }}>
      {children}
    </div>
  )
}

// ─── PANEL PRINCIPAL ──────────────────────────────────────────────────────────
export function MarmitaPanel({ onClose }: { onClose: () => void }) {
  const { equipment, toggleEquipment, sensors } = useSimulatorStore()
  const marmita = equipment.marmita

  const [targetTemp,     setTargetTemp]     = useState(100)
  const [currentTemp,    setCurrentTemp]    = useState(25)
  const [agitActive,     setAgitActive]     = useState(false)
  const [agitSpeed,      setAgitSpeed]      = useState(50)
  const [timerSet,       setTimerSet]       = useState(20 * 60)
  const [timerLeft,      setTimerLeft]      = useState(20 * 60)
  const [timerRunning,   setTimerRunning]   = useState(false)
  const [emergency,      setEmergency]      = useState(false)
  const [valves, setValves] = useState({ vapor: false, agua: false, vaciado: false })

  // Simulación temperatura
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentTemp((prev) => {
        if (!marmita.active || emergency)
          return prev <= 25 ? 25 : +(prev - 0.7 + (Math.random() - 0.5) * 0.1).toFixed(1)
        const diff = targetTemp - prev
        if (Math.abs(diff) < 0.3) return +(targetTemp + (Math.random() - 0.5) * 0.2).toFixed(1)
        return +(prev + Math.sign(diff) * Math.min(Math.abs(diff) * 0.05 + 0.4, 1.5)).toFixed(1)
      })
    }, 500)
    return () => clearInterval(iv)
  }, [marmita.active, targetTemp, emergency])

  // Temporizador
  useEffect(() => {
    if (!timerRunning) return
    const iv = setInterval(() => {
      setTimerLeft((p) => {
        if (p <= 0) { setTimerRunning(false); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [timerRunning])

  function handleEmergency() {
    if (emergency) return
    setEmergency(true)
    if (marmita.active) toggleEquipment('marmita')
    setAgitActive(false)
    setTimerRunning(false)
    setValves({ vapor: false, agua: false, vaciado: false })
    setTimeout(() => setEmergency(false), 4000)
  }

  const pressure  = Math.max(0, +((currentTemp - 25) / 75 * 1.5).toFixed(2))
  const heating   = marmita.active && currentTemp < targetTemp - 1
  const valveSafe = pressure > 1.4
  const timerM    = Math.floor(timerLeft / 60)
  const timerS    = timerLeft % 60
  const timerSetM = Math.floor(timerSet / 60)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: 16,
        border: '1px solid #475569',
        width: '100%',
        maxWidth: 860,
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>

        {/* Cabecera */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', background: '#0f172a', borderBottom: '1px solid #334155',
        }}>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: 15 }}>
              Marmita Industrial — MV-300
            </div>
            <div style={{ color: '#64748b', fontSize: 11 }}>
              Panel de Control · Jersa / Vulcano · 300 L · AISI-304 · 12 kW
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              fontSize: 11, fontWeight: 'bold', padding: '4px 10px', borderRadius: 6,
              background: emergency ? '#7f1d1d' : marmita.active ? '#14532d' : '#1e293b',
              color: emergency ? '#fca5a5' : marmita.active ? '#86efac' : '#64748b',
              border: `1px solid ${emergency ? '#991b1b' : marmita.active ? '#166534' : '#334155'}`,
              animation: emergency ? 'pulse 0.5s infinite' : 'none',
            }}>
              {emergency ? '⚠ EMERGENCIA ACTIVADA' : marmita.active ? '● EN OPERACIÓN' : '◯ DETENIDA'}
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: '#64748b',
              cursor: 'pointer', padding: 4, lineHeight: 1,
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ─── PANEL METÁLICO ─── */}
        <div style={{ background: PANEL_BG, padding: 20 }}>

          {/* ══ FILA 1 ══════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>

            {/* Interruptor General */}
            <PanelBox>
              <SectionLabel>Interruptor<br />General</SectionLabel>
              <ToggleSwitch active={marmita.active} onToggle={() => toggleEquipment('marmita')} />
            </PanelBox>

            {/* Control de Temperatura */}
            <PanelBox>
              <SectionLabel>Control de Temperatura</SectionLabel>
              <DigitalDisplay value={`${currentTemp.toFixed(1)}°C`} active={marmita.active} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center', alignItems: 'center' }}>
                <CtrlBtn label="▼" onClick={() => setTargetTemp((v) => Math.max(25, v - 5))} />
                <div style={{
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 4, padding: '3px 8px', fontSize: 10,
                  color: '#94a3b8', fontFamily: 'monospace', textAlign: 'center',
                }}>
                  SET <span style={{ color: '#fb923c', fontWeight: 'bold' }}>{targetTemp}°C</span>
                </div>
                <CtrlBtn label="▲" onClick={() => setTargetTemp((v) => Math.min(150, v + 5))} />
              </div>
            </PanelBox>

            {/* LEDs */}
            <PanelBox>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <SectionLabel>Encendido</SectionLabel>
                  <LED active={marmita.active && !emergency} color="green" size={42} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <SectionLabel>Calentando</SectionLabel>
                  <LED active={heating} color="amber" size={42} />
                </div>
              </div>
            </PanelBox>

            {/* Agitador label (como en la imagen, centrado arriba del agitador) */}
            <div style={{ textAlign: 'center', alignSelf: 'center' }}>
              <div style={{
                color: '#cbd5e1', fontSize: 11, fontWeight: 'bold',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>Agitador<br />Inicio / Paro</div>
            </div>

            {/* Temporizador */}
            <PanelBox style={{ marginLeft: 'auto' } as CSSProperties}>
              <SectionLabel>Temporizador</SectionLabel>
              <DigitalDisplay
                value={`${String(timerM).padStart(2, '0')}:${String(timerS).padStart(2, '0')}`}
                active={timerRunning || timerLeft < timerSet}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
                <CtrlBtn label="▼" onClick={() => {
                  if (timerRunning) return
                  const n = Math.max(60, timerSet - 60)
                  setTimerSet(n); setTimerLeft(n)
                }} />
                <CtrlBtn label={timerRunning ? 'STOP' : 'SET'} onClick={() => {
                  if (timerRunning) setTimerRunning(false)
                  else { setTimerLeft(timerSet); setTimerRunning(true) }
                }} />
                <CtrlBtn label="▲" onClick={() => {
                  if (timerRunning) return
                  const n = Math.min(3600, timerSet + 60)
                  setTimerSet(n); setTimerLeft(n)
                }} />
              </div>
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: 10, marginTop: 4 }}>
                Prog: {timerSetM} min
              </div>
            </PanelBox>
          </div>

          {/* ══ FILA 2 ══════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

            {/* EMERGENCIA */}
            <div style={{ textAlign: 'center' }}>
              <EmergencyButton onClick={handleEmergency} active={emergency} />
              <SectionLabel>Emergencia</SectionLabel>
            </div>

            {/* Agitador INICIO / PARO */}
            <PanelBox>
              <SectionLabel>Agitador</SectionLabel>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <LED active={agitActive} color="green" size={20} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <PhysicalButton label="INICIO" color="green"
                    disabled={!marmita.active || agitActive}
                    onClick={() => setAgitActive(true)} />
                  <PhysicalButton label="PARO" color="red"
                    disabled={!agitActive}
                    onClick={() => setAgitActive(false)} />
                </div>
              </div>
            </PanelBox>

            {/* Velocidad Agitador */}
            <PanelBox style={{ flex: 1 } as CSSProperties}>
              <SectionLabel>Velocidad Agitador</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}>MIN</span>
                <input type="range" min={0} max={100} value={agitSpeed}
                  disabled={!agitActive}
                  onChange={(e) => setAgitSpeed(+e.target.value)}
                  style={{
                    flex: 1, height: 6, accentColor: '#22c55e',
                    opacity: agitActive ? 1 : 0.4, cursor: agitActive ? 'pointer' : 'not-allowed',
                  }}
                />
                <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}>MAX</span>
              </div>
              <div style={{ textAlign: 'center', color: '#4ade80', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>
                {agitSpeed} %
              </div>
            </PanelBox>

            {/* Válvulas */}
            <PanelBox>
              <SectionLabel>Válvulas</SectionLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                <ValveBtn icon="💨" label="VAPOR"
                  active={valves.vapor} onClick={() => setValves((v) => ({ ...v, vapor: !v.vapor }))} />
                <ValveBtn icon="💧" label={"LLENADO\nAGUA"}
                  active={valves.agua} onClick={() => setValves((v) => ({ ...v, agua: !v.agua }))} />
                <ValveBtn icon="🔽" label="VACIADO"
                  active={valves.vaciado} onClick={() => setValves((v) => ({ ...v, vaciado: !v.vaciado }))} />
              </div>
            </PanelBox>

            {/* Manómetro */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 110, height: 90,
                background: 'linear-gradient(145deg,#aaa,#666,#999)',
                borderRadius: '50%',
                padding: 4,
                boxShadow: '0 4px 10px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.3)',
              }}>
                <Manometro value={pressure} max={2} />
              </div>
              <SectionLabel>Manómetro</SectionLabel>
            </div>

            {/* Válvula de Seguridad */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: '50%',
                background: valveSafe
                  ? 'radial-gradient(circle at 35% 30%,#fca5a5,#dc2626 50%,#7f1d1d)'
                  : 'radial-gradient(circle at 35% 30%,#6b7280,#374151)',
                boxShadow: valveSafe
                  ? '0 0 14px #ef4444,0 0 28px rgba(239,68,68,0.5),inset 0 1px 2px rgba(255,255,255,0.3)'
                  : 'inset 0 2px 4px rgba(0,0,0,0.6)',
                border: '3px solid #1e293b',
                transition: 'all 0.3s',
              }} />
              <SectionLabel>Válvula<br />Seguridad</SectionLabel>
              <div style={{
                fontSize: 9, fontWeight: 'bold',
                color: valveSafe ? '#fca5a5' : '#64748b',
              }}>
                {valveSafe ? '⚠ ACTIVA' : 'OK'}
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior de sensores */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, padding: '10px 20px',
          background: '#0f172a', borderTop: '1px solid #1e293b',
        }}>
          {[
            { label: 'Temp. actual',    value: `${currentTemp.toFixed(1)} °C`,              c: '#fb923c' },
            { label: 'Objetivo',        value: `${targetTemp} °C`,                          c: '#94a3b8' },
            { label: 'Presión',         value: `${pressure.toFixed(2)} bar`,                c: pressure > 1.4 ? '#f87171' : '#60a5fa' },
            { label: 'Agitador',        value: agitActive ? `${agitSpeed}%` : 'OFF',        c: agitActive ? '#4ade80' : '#475569' },
            { label: 'H. de Sangre',    value: `${sensors.bloodFlourRate.toFixed(1)} kg/h`, c: '#f87171' },
            { label: 'Timer',           value: timerRunning ? `${timerM}m ${timerS}s` : 'Detenido', c: timerRunning ? '#4ade80' : '#475569' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', gap: 6, fontSize: 11 }}>
              <span style={{ color: '#475569' }}>{s.label}:</span>
              <span style={{ color: s.c, fontFamily: 'monospace', fontWeight: 'bold' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
