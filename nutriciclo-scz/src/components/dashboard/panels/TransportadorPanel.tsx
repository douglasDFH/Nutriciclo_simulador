import { useState, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Diagrama HMI tipo Siemens ────────────────────────────────────────────────
function HmiScreen({ running, dir, speed }: { running: boolean; dir: 'FWD' | 'REV'; speed: number }) {
  const flowColor = running ? '#00e5ff' : '#1a3a3a'
  const arrowDir  = dir === 'FWD' ? 1 : -1

  return (
    <svg viewBox="0 0 260 150" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="hmi_bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f0fe"/>
          <stop offset="100%" stopColor="#d0dff8"/>
        </linearGradient>
        <linearGradient id="conveyor_body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#607d8b"/>
          <stop offset="100%" stopColor="#37474f"/>
        </linearGradient>
        <marker id="arrow_fwd" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={flowColor}/>
        </marker>
        <marker id="arrow_rev" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
          <path d="M6,0 L0,3 L6,6 Z" fill={flowColor}/>
        </marker>
        <filter id="screen_glow">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo pantalla */}
      <rect width="260" height="150" fill="url(#hmi_bg)" rx="2"/>

      {/* Barra superior HMI */}
      <rect width="260" height="18" fill="#1565c0"/>
      <text x="8" y="12" fill="#fff" fontSize="8" fontWeight="bold">SIEMENS</text>
      <text x="100" y="12" fill="#90caf9" fontSize="8">TRANSPORTADOR SINFÍN TSC-250</text>
      <rect x="230" y="3" width="24" height="12" rx="2" fill={running ? '#00c853' : '#b71c1c'}/>
      <text x="242" y="12" fill="#fff" fontSize="7" textAnchor="middle">{running ? 'RUN' : 'STOP'}</text>

      {/* ── Transportador sinfín 1 (tramo horizontal) ── */}
      <text x="10" y="36" fill="#1565c0" fontSize="7" fontWeight="bold">TRAMO 1 — HORIZONTAL</text>
      {/* Carcasa */}
      <rect x="10" y="40" width="155" height="22" rx="4" fill="url(#conveyor_body)" stroke="#90a4ae" strokeWidth="1"/>
      {/* Espiral / hélice */}
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={18 + i * 13} cy={51} rx={4} ry={8}
          fill="none" stroke={running ? '#80cbc4' : '#455a64'} strokeWidth="1.2" opacity="0.8"/>
      ))}
      {/* Flechas de flujo */}
      <line x1={running ? (dir === 'FWD' ? 14 : 162) : 14} y1="51"
        x2={running ? (dir === 'FWD' ? 162 : 14) : 14} y2="51"
        stroke={flowColor} strokeWidth="1.5"
        markerEnd={running ? (dir === 'FWD' ? 'url(#arrow_fwd)' : undefined) : undefined}
        markerStart={running && dir === 'REV' ? 'url(#arrow_rev)' : undefined}
        strokeDasharray={running ? '6,3' : 'none'} opacity="0.8"/>
      {/* Motor M1 */}
      <circle cx="178" cy="51" r="10" fill="#263238" stroke="#607d8b" strokeWidth="1.5"/>
      <text x="178" y="54" fill="#80cbc4" fontSize="7" textAnchor="middle" fontWeight="bold">M1</text>
      <text x="178" y="68" fill={running ? '#00c853' : '#e53935'} fontSize="6" textAnchor="middle">
        {running ? `${speed} Hz` : 'OFF'}
      </text>

      {/* Tolva entrada */}
      <polygon points="5,30 20,30 17,42 8,42" fill="#546e7a" stroke="#90a4ae" strokeWidth="0.8"/>
      <text x="12" y="28" fill="#1565c0" fontSize="5" textAnchor="middle">ALM.</text>

      {/* ── Transportador sinfín 2 (tramo inclinado) ── */}
      <text x="10" y="86" fill="#1565c0" fontSize="7" fontWeight="bold">TRAMO 2 — INCLINADO 15°</text>
      {/* Carcasa inclinada */}
      <rect x="10" y="90" width="140" height="18" rx="3"
        fill="url(#conveyor_body)" stroke="#90a4ae" strokeWidth="1"
        transform="rotate(-8, 80, 99)"/>
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx={16 + i * 13} cy={99} rx={3} ry={6}
          fill="none" stroke={running ? '#80cbc4' : '#455a64'} strokeWidth="1" opacity="0.7"
          transform="rotate(-8, 80, 99)"/>
      ))}
      {/* Motor M2 */}
      <circle cx="165" cy="88" r="9" fill="#263238" stroke="#607d8b" strokeWidth="1.5"/>
      <text x="165" y="91" fill="#80cbc4" fontSize="7" textAnchor="middle" fontWeight="bold">M2</text>
      <text x="165" y="103" fill={running ? '#00c853' : '#e53935'} fontSize="6" textAnchor="middle">
        {running ? `${Math.round(speed * 0.8)} Hz` : 'OFF'}
      </text>

      {/* Descarga */}
      <polygon points="148,75 158,75 162,90 144,90" fill="#546e7a" stroke="#f59e0b" strokeWidth="0.8"/>
      <text x="153" y="73" fill="#f59e0b" fontSize="5" textAnchor="middle">DESC.</text>

      {/* ── Valores en tiempo real ── */}
      <rect x="200" y="30" width="56" height="108" rx="3" fill="#0d1b2a" stroke="#1565c0" strokeWidth="1"/>
      <text x="228" y="43" fill="#90caf9" fontSize="6" textAnchor="middle">PARÁMETROS</text>
      {[
        { label: 'VEL.',  val: running ? `${speed} Hz` : '--', color: '#00e5ff' },
        { label: 'CORR.', val: running ? `${(speed * 0.18 + 1.2).toFixed(1)}A` : '--', color: '#ffd54f' },
        { label: 'DIR.',  val: running ? dir : '--', color: '#a5d6a7' },
        { label: 'CARGA', val: running ? `${Math.round(speed * 1.4)}%` : '--', color: '#ef9a9a' },
      ].map((r, i) => (
        <g key={r.label}>
          <text x="204" y={58 + i * 18} fill="#546e7a" fontSize="6">{r.label}</text>
          <text x="252" y={58 + i * 18} fill={r.color} fontSize="7" textAnchor="end"
            fontFamily="monospace" fontWeight="bold"
            filter={running ? 'url(#screen_glow)' : undefined}>{r.val}</text>
        </g>
      ))}

      {/* Estado general */}
      <rect x="6" y="125" width="248" height="18" rx="2"
        fill={running ? '#00c85322' : '#b71c1c22'} stroke={running ? '#00c853' : '#b71c1c'} strokeWidth="0.8"/>
      <text x="130" y="137" fill={running ? '#00c853' : '#e53935'} fontSize="8"
        textAnchor="middle" fontWeight="bold">
        {running ? `▶ OPERANDO — VELOCIDAD ${speed} Hz — DIRECCIÓN ${dir}` : '■ DETENIDO — EN ESPERA'}
      </text>
    </svg>
  )
}

// ─── Botón cuadrado industrial (estilo moderno) ───────────────────────────────
function SquareBtn({ label, color, active, onClick, size = 46 }: {
  label: string
  color: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'gray'
  active?: boolean
  onClick: () => void
  size?: number
}) {
  const [pressed, setPressed] = useState(false)

  const palette: Record<string, { face: string; sh: string; led: string; glow: string }> = {
    black:  { face: '#2d2d2d', sh: '#111',    led: '#4ade80', glow: '#22c55e' },
    red:    { face: '#c62828', sh: '#7f1d1d', led: '#f87171', glow: '#ef4444' },
    green:  { face: '#2e7d32', sh: '#14532d', led: '#4ade80', glow: '#22c55e' },
    yellow: { face: '#f9a825', sh: '#713f12', led: '#fde047', glow: '#fbbf24' },
    blue:   { face: '#1565c0', sh: '#1e3a8a', led: '#93c5fd', glow: '#3b82f6' },
    gray:   { face: '#546e7a', sh: '#263238', led: '#cbd5e1', glow: '#94a3b8' },
  }

  const { face, sh, led, glow } = palette[color]

  const s: CSSProperties = {
    width: size, height: size,
    background: pressed
      ? `linear-gradient(180deg,${sh},${sh})`
      : `linear-gradient(160deg,${face} 0%,${sh} 100%)`,
    boxShadow: pressed
      ? `inset 0 3px 6px rgba(0,0,0,0.7)`
      : `0 4px 0 ${sh}, 0 5px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
    transform: pressed ? 'translateY(3px)' : 'translateY(0)',
    transition: 'transform 0.06s, box-shadow 0.06s',
    border: `1px solid ${sh}`,
    borderRadius: 3,
    cursor: 'pointer',
    userSelect: 'none' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '3px 2px',
    position: 'relative' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* LED indicador */}
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: active
          ? `radial-gradient(circle at 35% 30%, #fff, ${led} 40%, ${sh})`
          : 'radial-gradient(circle at 35% 30%, #333, #111)',
        boxShadow: active ? `0 0 6px ${glow}, 0 0 12px ${glow}55` : 'inset 0 1px 2px rgba(0,0,0,0.9)',
        border: '1px solid rgba(0,0,0,0.5)',
      }}/>
      <button
        style={s}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onClick() }}
        onMouseLeave={() => setPressed(false)}
      >
        <span style={{
          color: '#e0e0e0',
          fontSize: 7,
          fontWeight: 'bold',
          letterSpacing: 0.3,
          textAlign: 'center',
          lineHeight: 1.2,
          textShadow: '0 1px 2px rgba(0,0,0,0.9)',
          whiteSpace: 'pre-line',
        }}>{label}</span>
      </button>
    </div>
  )
}

// ─── Emergencia con anillo amarillo ──────────────────────────────────────────
function EmergBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#555', fontSize: 8, letterSpacing: 0.5 }}>PARO EMERGENCIA</span>
      {/* Anillo amarillo exterior */}
      <div style={{
        width: 58, height: 58, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 25%, #ffe082, #f9a825 50%, #e65100)',
        padding: 4,
        boxShadow: '0 4px 10px rgba(0,0,0,0.5), 0 0 0 2px #333',
      }}>
        <button
          style={{
            width: '100%', height: '100%', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: pressed
              ? 'radial-gradient(circle at 40% 30%, #f87171, #7f1d1d)'
              : 'radial-gradient(circle at 40% 30%, #fca5a5, #dc2626 50%, #7f1d1d)',
            boxShadow: pressed
              ? 'inset 0 4px 8px rgba(0,0,0,0.7)'
              : active
                ? '0 2px 0 #450a0a, inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 6px 0 #450a0a, 0 7px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            transform: pressed || active ? 'translateY(4px)' : 'translateY(0)',
            transition: 'transform 0.08s, box-shadow 0.08s',
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
      {active && <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 'bold' }}>ACTIVO</span>}
    </div>
  )
}

// ─── Interruptor rotatorio principal (rojo/negro) ─────────────────────────────
function RotaryIsolator({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#555', fontSize: 8, letterSpacing: 0.5 }}>DESCONECTOR</span>
      <div style={{
        width: 52, height: 52, borderRadius: 6,
        background: 'linear-gradient(160deg, #9e9e9e, #616161)',
        border: '2px solid #424242',
        boxShadow: '0 3px 8px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
      }} onClick={onClick}>
        {/* Llave central */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: on
            ? 'radial-gradient(circle at 35% 30%, #ff5252, #c62828 50%, #7f1d1d)'
            : 'radial-gradient(circle at 35% 30%, #616161, #212121)',
          border: '2px solid #111',
          boxShadow: on ? '0 0 10px #ef4444' : 'inset 0 2px 4px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: on ? 'rotate(0deg)' : 'rotate(90deg)',
          transition: 'transform 0.3s, background 0.2s',
        }}>
          <div style={{
            width: 3, height: 10, background: on ? '#ffcdd2' : '#555',
            borderRadius: 2,
          }}/>
        </div>
        {/* Labels */}
        <span style={{ position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)',
          color: '#fff', fontSize: 7, fontWeight: 'bold' }}>I</span>
        <span style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
          color: '#aaa', fontSize: 7 }}>O</span>
      </div>
      <span style={{ color: on ? '#22c55e' : '#ef4444', fontSize: 10, fontWeight: 'bold' }}>
        {on ? 'CONECTADO' : 'DESCONECTADO'}
      </span>
    </div>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function TransportadorPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq    = equipment.screw_conveyor
  const isOn  = eq.active

  const [isolator,  setIsolator]  = useState(true)
  const [emergency, setEmergency] = useState(false)
  const [dir,       setDir]       = useState<'FWD' | 'REV'>('FWD')
  const [speed,     setSpeed]     = useState(35)
  const [tramo1,    setTramo1]    = useState(false)
  const [tramo2,    setTramo2]    = useState(false)
  const [agitador,  setAgitador]  = useState(false)
  const [valvAlim,  setValvAlim]  = useState(false)
  const [valvDesc,  setValvDesc]  = useState(false)
  const [lubric,    setLubric]    = useState(false)
  const [alarma,    setAlarma]    = useState(false)

  const canOperate = isOn && isolator && !emergency

  const toggle = (fn: (v: boolean) => void, v: boolean, dep = canOperate) => {
    if (!dep) return
    fn(!v)
  }

  const handlePower = () => {
    if (!isolator || emergency) return
    toggleEquipment('screw_conveyor')
    if (isOn) { setTramo1(false); setTramo2(false); setAgitador(false) }
  }

  const handleEmergency = () => {
    setEmergency(p => {
      const next = !p
      if (next && isOn) {
        toggleEquipment('screw_conveyor')
        setTramo1(false); setTramo2(false); setAgitador(false)
      }
      return next
    })
  }

  const statusColor = eq.status === 'active' ? '#22c55e'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#ef4444' : '#78716c'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{
        background: '#d4d8db',
        borderRadius: 8,
        width: '100%', maxWidth: 480,
        boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
        border: '4px solid #9e9e9e',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}>

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div style={{ background: '#1a237e', padding: '8px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor,
                boxShadow: `0 0 8px ${statusColor}` }}/>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                TRANSPORTADOR SINFÍN — {eq.model}
              </span>
            </div>
            <div style={{ color: '#90caf9', fontSize: 11, marginTop: 2 }}>
              {eq.manufacturer} · Ø250 mm · 1–15 t/h
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#90caf9"/>
          </button>
        </div>

        {/* ── Pantalla HMI Siemens ────────────────────────────────── */}
        <div style={{ margin: '10px 12px 0',
          border: '4px solid #555', borderRadius: 6, overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.2)',
          height: 160,
          background: '#1a237e',
        }}>
          {/* Bisel superior Siemens */}
          <div style={{ background: '#1a237e', padding: '2px 6px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#90caf9', fontSize: 8, fontWeight: 'bold' }}>SIEMENS</span>
            <span style={{ color: '#64b5f6', fontSize: 8 }}>TP700 Comfort</span>
          </div>
          <div style={{ height: 145, background: '#e8f0fe' }}>
            <HmiScreen running={isOn && (tramo1 || tramo2)} dir={dir} speed={speed} />
          </div>
        </div>

        {/* ── Sección controles ──────────────────────────────────── */}
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Fila: emergencia + velocidad + dirección */}
          <div style={{ background: '#bfc4c9', borderRadius: 6, padding: '10px 12px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>

            <EmergBtn active={emergency} onClick={handleEmergency} />

            <div style={{ width: 1, height: 56, background: '#9e9e9e' }}/>

            {/* Velocidad */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 9 }}>
                <span>VELOCIDAD (Hz)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1565c0' }}>{speed} Hz</span>
              </div>
              <input type="range" min={10} max={60} value={speed}
                onChange={e => setSpeed(parseInt(e.target.value))}
                disabled={!canOperate}
                style={{ accentColor: '#1565c0', opacity: canOperate ? 1 : 0.4 }}/>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => { if (canOperate) setDir('FWD') }}
                  style={{
                    flex: 1, padding: '3px 0', fontSize: 9, fontWeight: 'bold', cursor: 'pointer',
                    background: dir === 'FWD' ? '#1565c0' : '#546e7a',
                    color: '#fff', border: '1px solid #111', borderRadius: 3,
                    opacity: canOperate ? 1 : 0.5,
                    boxShadow: dir === 'FWD' ? '0 0 6px #1565c0' : 'none',
                  }}>▶ FWD</button>
                <button
                  onClick={() => { if (canOperate) setDir('REV') }}
                  style={{
                    flex: 1, padding: '3px 0', fontSize: 9, fontWeight: 'bold', cursor: 'pointer',
                    background: dir === 'REV' ? '#6a1b9a' : '#546e7a',
                    color: '#fff', border: '1px solid #111', borderRadius: 3,
                    opacity: canOperate ? 1 : 0.5,
                    boxShadow: dir === 'REV' ? '0 0 6px #6a1b9a' : 'none',
                  }}>◀ REV</button>
              </div>
            </div>
          </div>

          {/* Cuadrícula botones cuadrados */}
          <div style={{ background: '#bfc4c9', borderRadius: 6, padding: '10px 12px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>

            {/* Fila 1 — Equipo principal */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
              <SquareBtn label={'ENCENDER\nEQUIPO'}  color="green"  active={isOn}
                onClick={handlePower} />
              <SquareBtn label={'APAGAR\nEQUIPO'}    color="red"    active={!isOn}
                onClick={handlePower} />

              <div style={{ width: 1, height: 46, background: '#9e9e9e' }}/>

              <SquareBtn label={'TRAMO 1\nINICIO'}   color="green"  active={tramo1}
                onClick={() => toggle(setTramo1, tramo1)} />
              <SquareBtn label={'TRAMO 1\nPARO'}     color="red"
                onClick={() => { if (canOperate) setTramo1(false) }} />
              <SquareBtn label={'TRAMO 2\nINICIO'}   color="green"  active={tramo2}
                onClick={() => toggle(setTramo2, tramo2)} />
              <SquareBtn label={'TRAMO 2\nPARO'}     color="red"
                onClick={() => { if (canOperate) setTramo2(false) }} />
            </div>

            {/* Fila 2 — Auxiliares */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
              <SquareBtn label={'AGITADOR\nON'}     color="blue"   active={agitador}
                onClick={() => toggle(setAgitador, agitador)} />
              <SquareBtn label={'AGITADOR\nOFF'}    color="black"
                onClick={() => { if (canOperate) setAgitador(false) }} />

              <div style={{ width: 1, height: 46, background: '#9e9e9e' }}/>

              <SquareBtn label={'VÁL.\nALIM. ON'}   color="yellow" active={valvAlim}
                onClick={() => toggle(setValvAlim, valvAlim)} />
              <SquareBtn label={'VÁL.\nALIM. OFF'}  color="black"
                onClick={() => { if (canOperate) setValvAlim(false) }} />
              <SquareBtn label={'VÁL.\nDESC. ON'}   color="yellow" active={valvDesc}
                onClick={() => toggle(setValvDesc, valvDesc)} />
              <SquareBtn label={'VÁL.\nDESC. OFF'}  color="black"
                onClick={() => { if (canOperate) setValvDesc(false) }} />
            </div>

            {/* Fila 3 — Servicios */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <SquareBtn label={'LUBRIC.\nAUTO'}    color="gray"   active={lubric}
                onClick={() => toggle(setLubric, lubric, isOn)} />
              <SquareBtn label={'RESET\nALARMA'}    color="black"
                onClick={() => setAlarma(false)} />

              <div style={{ width: 1, height: 46, background: '#9e9e9e' }}/>

              <SquareBtn label={'TEST\nLUCES'}      color="black"
                onClick={() => {}} />
              <SquareBtn label={'SEL.\nAUTO'}       color="blue"   active={true}
                onClick={() => {}} />
              <SquareBtn label={'SEL.\nMAN.'}       color="black"
                onClick={() => {}} />

              <div style={{ marginLeft: 'auto' }}>
                <RotaryIsolator on={isolator} onClick={() => {
                  if (!isOn) setIsolator(p => !p)
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Barra de estado ───────────────────────────────────── */}
        <div style={{ background: '#1a237e', padding: '7px 14px',
          display: 'flex', gap: 12, justifyContent: 'space-around' }}>
          {[
            { label: 'H. Hueso',  value: `${sensors.boneFlourRate.toFixed(1)} kg/h`, color: '#ffd54f' },
            { label: 'Velocidad', value: isOn ? `${speed} Hz`  : '-- Hz',            color: '#90caf9' },
            { label: 'Dirección', value: isOn ? dir            : '--',                color: '#a5d6a7' },
            { label: 'Tramo 1',   value: tramo1 ? 'ON'  : 'OFF',                      color: tramo1 ? '#4ade80' : '#ef4444' },
            { label: 'Tramo 2',   value: tramo2 ? 'ON'  : 'OFF',                      color: tramo2 ? '#4ade80' : '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#64b5f6', fontSize: 9 }}>{s.label}</div>
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
