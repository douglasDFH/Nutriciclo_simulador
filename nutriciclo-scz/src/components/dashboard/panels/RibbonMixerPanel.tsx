import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta SCADA teal/azul ───────────────────────────────────────────────────
const TEAL    = '#5bc8c8'
const TEAL_D  = '#3a9898'
const TEAL_L  = '#8adede'
const PANEL_W = '#d8f0f0'
const DARK    = '#1a2a2a'
const BTN_BG  = '#c8e8e8'

// ─── Piloto LED ───────────────────────────────────────────────────────────────
function Piloto({ label, on, color = 'green' }: {
  label: string; on: boolean; color?: 'green' | 'red' | 'yellow' | 'blue' | 'orange'
}) {
  const c = {
    green:  { on: 'radial-gradient(circle at 35% 30%,#bbf7d0,#22c55e 40%,#15803d)', glow: '#22c55e' },
    red:    { on: 'radial-gradient(circle at 35% 30%,#fca5a5,#ef4444 40%,#7f1d1d)', glow: '#ef4444' },
    yellow: { on: 'radial-gradient(circle at 35% 30%,#fef08a,#f59e0b 40%,#b45309)', glow: '#f59e0b' },
    blue:   { on: 'radial-gradient(circle at 35% 30%,#bfdbfe,#3b82f6 40%,#1e3a8a)', glow: '#3b82f6' },
    orange: { on: 'radial-gradient(circle at 35% 30%,#fed7aa,#f97316 40%,#7c2d12)', glow: '#f97316' },
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 11, height: 11, borderRadius: '50%',
        background: on ? c[color].on : 'radial-gradient(circle at 35% 30%,#666,#333)',
        boxShadow: on ? `0 0 6px ${c[color].glow}` : 'inset 0 1px 2px rgba(0,0,0,0.6)',
        border: '1px solid rgba(0,0,0,0.4)',
      }}/>
      <span style={{ color: DARK, fontSize: 8, fontWeight: on ? 'bold' : 'normal' }}>{label}</span>
    </div>
  )
}

// ─── Botón estilo SCADA teal ──────────────────────────────────────────────────
function ScadaBtn({ label, color, onClick, width = 52, height = 22 }: {
  label: string; color: 'green' | 'red' | 'gray' | 'blue' | 'orange'
  onClick: () => void; width?: number; height?: number
}) {
  const [pressed, setPressed] = useState(false)
  const palette: Record<string, [string, string, string]> = {
    green:  ['#4ade80', '#16a34a', '#14532d'],
    red:    ['#f87171', '#dc2626', '#7f1d1d'],
    gray:   ['#d1d5db', '#9ca3af', '#4b5563'],
    blue:   ['#60a5fa', '#2563eb', '#1e3a8a'],
    orange: ['#fb923c', '#ea580c', '#7c2d12'],
  }
  const [top, mid, sh] = palette[color]
  const s: CSSProperties = {
    width, height,
    background: pressed ? `linear-gradient(180deg,${mid},${sh})` : `linear-gradient(180deg,${top},${mid})`,
    boxShadow: pressed
      ? `inset 0 2px 4px rgba(0,0,0,0.5)`
      : `0 3px 0 ${sh}, 0 4px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)`,
    transform: pressed ? 'translateY(2px)' : 'none',
    transition: 'transform 0.06s, box-shadow 0.06s',
    border: `1px solid ${sh}`,
    borderRadius: 3, color: '#fff', fontWeight: 'bold', fontSize: 9,
    cursor: 'pointer', userSelect: 'none' as const,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  return (
    <button style={s}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick() }}
      onMouseLeave={() => setPressed(false)}>{label}</button>
  )
}

// ─── Sección con título ───────────────────────────────────────────────────────
function Section({ title, children, style }: { title: string; children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ border: `1px solid ${TEAL_D}`, borderRadius: 2, overflow: 'hidden', ...style }}>
      <div style={{ background: TEAL_D, padding: '1px 5px', color: '#fff', fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 }}>
        {title}
      </div>
      <div style={{ background: PANEL_W, padding: 5 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Diagrama proceso SVG ─────────────────────────────────────────────────────
function ProcessDiagram({ isOn, motor, valvA, valvB, valvC, pressure, dir }: {
  isOn: boolean; motor: boolean; valvA: boolean; valvB: boolean; valvC: boolean
  pressure: number; dir: 'D' | 'I'
}) {
  const flowColor = (on: boolean) => on ? '#0891b2' : '#9ca3af'
  const full = (pct: number) => pct > 80

  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="silo_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0c4c8"/>
          <stop offset="100%" stopColor="#6a8a90"/>
        </linearGradient>
        <linearGradient id="mixer_g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#78909c"/>
          <stop offset="100%" stopColor="#37474f"/>
        </linearGradient>
        <marker id="farr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <polygon points="0,0 5,2.5 0,5" fill="#0891b2"/>
        </marker>
      </defs>

      {/* Fondo */}
      <rect width="280" height="200" fill={TEAL}/>

      {/* ── Silos PA, PB, PC ── */}
      {[
        { x: 60,  label: 'PA', valv: valvA, pct: 72, color: '#fbbf24' },
        { x: 130, label: 'PB', valv: valvB, pct: 88, color: '#f87171' },
        { x: 200, label: 'PC', valv: valvC, pct: 45, color: '#4ade80' },
      ].map(silo => (
        <g key={silo.label}>
          {/* Cuerpo silo */}
          <rect x={silo.x-18} y={8} width={36} height={55} rx="3"
            fill="url(#silo_g)" stroke="#90a4ae" strokeWidth="1"/>
          {/* Nivel contenido */}
          <rect x={silo.x-16} y={10 + 50*(1-silo.pct/100)} width={32}
            height={50*(silo.pct/100)} fill={silo.color} opacity="0.7"
            rx="1" clipPath={`url(#sc_${silo.label})`}/>
          <defs>
            <clipPath id={`sc_${silo.label}`}>
              <rect x={silo.x-16} y={10} width={32} height={50}/>
            </clipPath>
          </defs>
          {/* Cono inferior */}
          <polygon points={`${silo.x-18},63 ${silo.x+18},63 ${silo.x+6},82 ${silo.x-6},82`}
            fill="url(#silo_g)" stroke="#90a4ae" strokeWidth="1"/>
          {/* Etiqueta */}
          <text x={silo.x} y={5} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="bold">{silo.label}</text>
          {/* Triángulo alerta si lleno */}
          {full(silo.pct) && (
            <polygon points={`${silo.x-7},0 ${silo.x+7},0 ${silo.x},14`}
              fill="#f59e0b" stroke="#92400e" strokeWidth="0.8"/>
          )}
          {/* Porcentaje */}
          <text x={silo.x} y={50} fill="#fff" fontSize="7" textAnchor="middle"
            fontFamily="monospace">{silo.pct}%</text>
          {/* Válvula */}
          <circle cx={silo.x} cy={88} r={5}
            fill={silo.valv && isOn ? '#22c55e' : '#ef4444'}
            stroke="#111" strokeWidth="0.8"/>
          {/* Línea al mezclador */}
          <line x1={silo.x} y1={93} x2={silo.x} y2={130}
            stroke={flowColor(silo.valv && isOn)} strokeWidth="2"
            strokeDasharray={silo.valv && isOn ? '4,2' : 'none'}
            markerEnd={silo.valv && isOn ? 'url(#farr)' : undefined}/>
          {/* Etiqueta válvula */}
          <text x={silo.x+7} y={91} fill="#fff" fontSize="5">V{silo.label[1]}</text>
        </g>
      ))}

      {/* ── Depósito DET ── */}
      <ellipse cx="20" cy="45" rx="14" ry="30" fill="url(#silo_g)" stroke="#90a4ae" strokeWidth="1"/>
      <text x="20" y="42" fill="#fff" fontSize="6" textAnchor="middle" fontWeight="bold">DET</text>
      <line x1="34" y1="55" x2="70" y2="100"
        stroke={flowColor(isOn)} strokeWidth="1.5" strokeDasharray={isOn?"3,2":"none"}/>
      <circle cx="52" cy="78" r="4" fill={isOn ? '#f59e0b' : '#546e7a'} stroke="#111" strokeWidth="0.8"/>

      {/* ── Mezclador horizontal ── */}
      <rect x="20" y="135" width="240" height="38" rx="18"
        fill="url(#mixer_g)" stroke={isOn && motor ? '#22c55e' : '#90a4ae'}
        strokeWidth={isOn && motor ? 2 : 1}
        style={isOn && motor ? { filter: 'drop-shadow(0 0 4px #22c55e)' } : undefined}/>
      {/* Espirales de la cinta */}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx={35 + i * 23} cy={154} rx={5} ry={16}
          fill="none" stroke={motor && isOn ? '#80deea' : '#546e7a'} strokeWidth="1.2" opacity="0.7"/>
      ))}
      {/* Flechas de mezcla */}
      {motor && isOn && (
        <text x={140} y={157} fill="#80deea" fontSize="8" textAnchor="middle">
          {dir === 'D' ? '→ → → →' : '← ← ← ←'}
        </text>
      )}
      <text x="140" y="168" fill={motor && isOn ? '#b2dfdb' : '#78909c'}
        fontSize="7" textAnchor="middle" fontWeight="bold">MEZCLADOR HJJ-3000</text>

      {/* Motor */}
      <ellipse cx="268" cy="154" rx="9" ry="12" fill="#263238" stroke={motor&&isOn?'#22c55e':'#607d8b'} strokeWidth="1.5"/>
      <text x="268" y="157" fill={motor&&isOn?'#4ade80':'#607d8b'} fontSize="5" textAnchor="middle" fontWeight="bold">M</text>

      {/* Válvula descarga */}
      <rect x="110" y="173" width="40" height="12" rx="3"
        fill="#1a2a3a" stroke={isOn?'#0891b2':'#546e7a'} strokeWidth="1"/>
      <text x="130" y="182" fill={isOn?'#80deea':'#607d8b'} fontSize="6" textAnchor="middle">DESCARGA</text>

      {/* Presión display */}
      <rect x="200" y="173" width="58" height="14" rx="2" fill="#0a0a0a" stroke="#333"/>
      <text x="229" y="183" fill={pressure>40?'#ef4444':isOn?'#00e5ff':'#1a3a3a'}
        fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {isOn ? `${pressure.toFixed(1)} PSI` : '-- PSI'}
      </text>
    </svg>
  )
}

// ─── Display captura (estilo SCADA original) ──────────────────────────────────
function CaptureDisplay({ valvA, valvB, valvC, timer }: {
  valvA: number; valvB: number; valvC: number; timer: number
}) {
  const s: CSSProperties = {
    background: '#0d0d0d', border: '1px inset #333',
    padding: '1px 5px', fontFamily: 'monospace',
    fontSize: 11, fontWeight: 'bold',
    color: '#ff2200', textShadow: '0 0 4px #ff2200',
    minWidth: 32, textAlign: 'right',
    display: 'inline-block',
  }
  const rows = [
    { label: 'VALVULA A', val: valvA },
    { label: 'VALVULA B', val: valvB },
    { label: 'VALVULA C', val: valvC },
    { label: 'SUMA',      val: valvA + valvB + valvC },
    { label: 'MULTIPL.',  val: (valvA + valvB + valvC) * 2 },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <span style={{ color: DARK, fontSize: 8 }}>{r.label}</span>
          <span style={s}>{String(r.val).padStart(3, '0')}</span>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${TEAL_D}`, marginTop: 2, paddingTop: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ color: DARK, fontSize: 8 }}>TIMER</span>
        <span style={{ ...s, color: '#ff8800', textShadow: '0 0 4px #ff8800', minWidth: 42 }}>
          {String(Math.floor(timer / 60)).padStart(2,'0')}:{String(timer % 60).padStart(2,'0')}
        </span>
      </div>
    </div>
  )
}

// ─── Tabla de tiempos proceso ─────────────────────────────────────────────────
function TimingTable({ isOn, proceso1, motor, evacuacion }: {
  isOn: boolean; proceso1: boolean; motor: boolean; evacuacion: boolean
}) {
  const cell: CSSProperties = {
    border: '1px solid #9ab0b0', padding: '1px 4px',
    fontSize: 8, textAlign: 'center', fontFamily: 'monospace',
    color: DARK,
  }
  const rows = [
    { label: 'MOTOR',      p1: motor&&isOn?1:0,      p2: 0 },
    { label: 'EVACUACION', p1: evacuacion&&isOn?1:0, p2: 0 },
    { label: 'LIMPIAR',    p1: 0,                    p2: 0 },
    { label: 'TIMER',      p1: proceso1?10200:0,     p2: 0 },
    { label: 'MOTOR 2',   p1: 0,                    p2: 0 },
    { label: 'DESAGUE',   p1: 0,                    p2: 0 },
    { label: 'FINAL',     p1: proceso1?1:0,         p2: 0 },
  ]
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ ...cell, background: TEAL_D, color: '#fff', fontWeight: 'bold', fontSize: 7 }}>TIEMPOS</th>
          <th style={{ ...cell, background: TEAL_D, color: '#fff', fontWeight: 'bold', fontSize: 7 }}>Proceso 1</th>
          <th style={{ ...cell, background: TEAL_D, color: '#fff', fontWeight: 'bold', fontSize: 7 }}>Proceso 2</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.label} style={{ background: i % 2 === 0 ? PANEL_W : '#c8e8e8' }}>
            <td style={cell}>{r.label}</td>
            <td style={{ ...cell, color: r.p1 > 0 ? '#16a34a' : '#999', fontWeight: r.p1>0?'bold':'normal' }}>
              {r.p1 > 1 ? r.p1 : r.p1 === 1 ? 'ON' : '0'}
            </td>
            <td style={{ ...cell, color: '#999' }}>{r.p2}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function RibbonMixerPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.ribbon_mixer
  const isOn = eq.active
  const pressure = sensors.tankPressure

  const [motor,      setMotor]     = useState(false)
  const [dir,        setDir]       = useState<'D'|'I'>('D')
  const [valvA,      setValvA]     = useState(false)
  const [valvB,      setValvB]     = useState(false)
  const [valvC,      setValvC]     = useState(false)
  const [evacuacion, setEvacuacion]= useState(false)
  const [limpieza,   setLimpieza]  = useState(false)
  const [desague,    setDesague]   = useState(false)
  const [proceso1,   setProceso1]  = useState(false)
  const [timer,      setTimer]     = useState(0)
  const [dfo,        setDfo]       = useState(false)
  const [alarm,      setAlarm]     = useState(false)

  // Contar vals capturados (simulado)
  const capA = valvA && isOn ? 3 : 0
  const capB = valvB && isOn ? 3 : 0
  const capC = valvC && isOn ? 3 : 0

  // Timer proceso
  useEffect(() => {
    if (!proceso1 || !isOn) { setTimer(0); return }
    const id = setInterval(() => setTimer(p => p + 1), 1000)
    return () => clearInterval(id)
  }, [proceso1, isOn])

  // Alarma presión
  useEffect(() => {
    if (pressure > 45) setAlarm(true)
    else if (pressure < 35) setAlarm(false)
  }, [pressure])

  const handlePower = () => {
    toggleEquipment('ribbon_mixer')
    if (isOn) {
      setMotor(false); setValvA(false); setValvB(false); setValvC(false)
      setEvacuacion(false); setLimpieza(false); setProceso1(false)
    }
  }

  const canOp = isOn

  const statusColor = eq.status === 'active' ? '#22c55e'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#ef4444' : '#6b7280'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      <div style={{
        background: TEAL,
        border: `3px solid ${TEAL_D}`,
        borderRadius: 4,
        width: '100%', maxWidth: 700,
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        fontFamily: 'Tahoma, Arial, sans-serif',
        overflow: 'hidden',
      }}>

        {/* ── Barra superior ─────────────────────────────────── */}
        <div style={{ background: '#1a4a5a', padding: '4px 10px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}/>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
              MEZCLADORA HORIZONTAL DE CINTAS — {eq.model}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#aaa', fontSize: 9 }}>{eq.manufacturer}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#aaa"/>
            </button>
          </div>
        </div>

        {/* ── Cuerpo superior: 3 columnas ───────────────────── */}
        <div style={{ display: 'flex', padding: '6px 6px 0', gap: 6 }}>

          {/* ── COL 1: Panel izquierdo ── */}
          <div style={{ width: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* DFO / DF1 */}
            <Section title="SELECTORES">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={dfo} onChange={e => setDfo(e.target.checked)}
                    style={{ accentColor: TEAL_D }}/>
                  <span style={{ color: DARK, fontSize: 8 }}>DFO</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={proceso1} onChange={e => { if(canOp) setProceso1(e.target.checked) }}
                    style={{ accentColor: TEAL_D }}/>
                  <span style={{ color: DARK, fontSize: 8 }}>DF1</span>
                </div>
              </div>
            </Section>

            {/* START / STOP / PROG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ScadaBtn label="START" color="green" onClick={handlePower} width={88} height={20}/>
              <ScadaBtn label="STOP"  color="red"   onClick={() => { if(isOn) toggleEquipment('ribbon_mixer') }} width={88} height={20}/>
              <ScadaBtn label="PROG"  color="gray"  onClick={() => {}} width={88} height={20}/>
            </div>

            {/* PILOTOS */}
            <Section title="PILOTOS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Piloto label="VALV A"    on={valvA&&isOn} color="green"/>
                <Piloto label="VALV B"    on={valvB&&isOn} color="yellow"/>
                <Piloto label="VALV C"    on={valvC&&isOn} color="orange"/>
                <Piloto label="MOTOR"     on={motor&&isOn} color="yellow"/>
                <Piloto label="EVACUAC."  on={evacuacion&&isOn} color="blue"/>
                <Piloto label="LIMPIEZA"  on={limpieza&&isOn} color="blue"/>
                <Piloto label="DESAGUE"   on={desague&&isOn} color="red"/>
                {alarm && <Piloto label="⚠ ALARMA" on={true} color="red"/>}
              </div>
            </Section>
          </div>

          {/* ── COL 2: Centro ── */}
          <div style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Section title="CAPTURA CAPTURADOS">
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: DARK, fontSize: 7 }}>CAPTURA SEL. </span>
                <select style={{ fontSize: 8, background: PANEL_W, border: `1px solid ${TEAL_D}` }}>
                  <option>A</option><option>B</option><option>C</option>
                </select>
              </div>
              <CaptureDisplay valvA={capA} valvB={capB} valvC={capC} timer={timer}/>
            </Section>

            <Section title="GIRO MOTOR">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ color: DARK, fontSize: 8, marginBottom: 2 }}>
                  {motor && isOn ? `MOTOR ${dir === 'D' ? 'DERECHA' : 'IZQUIERDA'}` : 'MOTOR PARADO'}
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  <ScadaBtn label="MO.DER" color={dir==='D'?"blue":"gray"}
                    onClick={() => { if(canOp) { setDir('D'); setMotor(true) } }} width={56} height={18}/>
                  <ScadaBtn label="MO.IZQ" color={dir==='I'?"blue":"gray"}
                    onClick={() => { if(canOp) { setDir('I'); setMotor(true) } }} width={56} height={18}/>
                </div>
                <ScadaBtn label="PARAR MOTOR" color="red"
                  onClick={() => setMotor(false)} width={115} height={18}/>

                {/* Velocidad cintas */}
                <div style={{ marginTop: 4 }}>
                  <div style={{ color: DARK, fontSize: 7, marginBottom: 2 }}>VELOCIDAD CINTAS</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {['BAJA','MED','ALTA'].map((v,i) => (
                      <ScadaBtn key={v} label={v} color={i===1?"blue":"gray"} onClick={() => {}} width={33} height={16}/>
                    ))}
                  </div>
                </div>

                {/* Válvulas */}
                <div style={{ marginTop: 3 }}>
                  <div style={{ color: DARK, fontSize: 7, marginBottom: 2 }}>VÁLVULAS INGREDIENTES</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <ScadaBtn label="A" color={valvA?"green":"gray"}
                      onClick={() => { if(canOp) setValvA(p=>!p) }} width={33} height={16}/>
                    <ScadaBtn label="B" color={valvB?"green":"gray"}
                      onClick={() => { if(canOp) setValvB(p=>!p) }} width={33} height={16}/>
                    <ScadaBtn label="C" color={valvC?"green":"gray"}
                      onClick={() => { if(canOp) setValvC(p=>!p) }} width={33} height={16}/>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* ── COL 3: Diagrama ── */}
          <div style={{ flex: 1, height: 220 }}>
            <ProcessDiagram isOn={isOn} motor={motor} valvA={valvA} valvB={valvB} valvC={valvC}
              pressure={pressure} dir={dir}/>
          </div>
        </div>

        {/* ── Panel inferior: Mezclador de ingredientes ────── */}
        <div style={{ margin: '4px 6px 6px',
          border: `2px solid ${TEAL_D}`, borderRadius: 2, overflow: 'hidden' }}>

          {/* Título */}
          <div style={{ background: '#1a4a5a', padding: '2px 8px',
            color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>
            MEZCLADOR DE INGREDIENTES
          </div>

          <div style={{ background: TEAL_L, padding: '5px 6px', display: 'flex', gap: 8 }}>

            {/* Panel control selectores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ color: DARK, fontSize: 7, fontWeight: 'bold' }}>PANEL DE CONTROL SELECTORES</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <ScadaBtn label="START" color="green" onClick={handlePower} width={44} height={20}/>
                <ScadaBtn label="STOP"  color="red"   onClick={() => { if(isOn) toggleEquipment('ribbon_mixer') }} width={44} height={20}/>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <ScadaBtn label="DFO"  color="orange" onClick={() => setDfo(p=>!p)} width={44} height={18}/>
                <ScadaBtn label="EXIT" color="gray"   onClick={onClose} width={44} height={18}/>
              </div>
              <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                <ScadaBtn label="EVACUAR" color="blue" onClick={() => { if(canOp) setEvacuacion(p=>!p) }} width={58} height={16}/>
                <ScadaBtn label="LIMPIAR" color="blue" onClick={() => { if(canOp) setLimpieza(p=>!p) }} width={58} height={16}/>
              </div>
            </div>

            {/* Tiempos */}
            <div style={{ flex: 1 }}>
              <TimingTable isOn={isOn} proceso1={proceso1} motor={motor} evacuacion={evacuacion}/>
            </div>

            {/* Proceso 1 activo */}
            <div style={{ width: 100 }}>
              <div style={{ color: DARK, fontSize: 7, fontWeight: 'bold', marginBottom: 3 }}>
                Proceso 1 {proceso1&&isOn?<span style={{ color:'#22c55e' }}>ACTIVO</span>:<span style={{color:'#ef4444'}}>INACT.</span>}
              </div>
              {[
                { label:'MOTOR',     val: motor&&isOn?'ON':'0' },
                { label:'EVACUACION',val: evacuacion&&isOn?'ON':'0' },
                { label:'LIMPIAR',   val: limpieza&&isOn?'ON':'0' },
                { label:'TIMER',     val: `${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}` },
                { label:'DESAGUE',   val: desague&&isOn?'ON':'0' },
                { label:'FINAL',     val: proceso1&&isOn?'1':'0' },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between',
                  fontSize:7, color:DARK, borderBottom:`1px solid ${TEAL}`, padding:'1px 2px' }}>
                  <span>{r.label}</span>
                  <span style={{ fontFamily:'monospace', color: r.val!=='0'?'#22c55e':DARK, fontWeight: r.val!=='0'?'bold':'normal' }}>
                    {r.val}
                  </span>
                </div>
              ))}
            </div>

            {/* RUN / STOP grandes */}
            <div style={{ display:'flex', flexDirection:'column', gap:6, justifyContent:'center' }}>
              <ScadaBtn label="RUN"  color="green" onClick={() => { if(canOp) { setMotor(true); setProceso1(true) } }} width={50} height={32}/>
              <ScadaBtn label="STOP" color="red"   onClick={() => { setMotor(false); setProceso1(false) }} width={50} height={32}/>
            </div>
          </div>
        </div>

        {/* ── Barra de estado ─────────────────────────────────── */}
        <div style={{ background: '#1a4a5a', padding: '3px 10px',
          display: 'flex', gap: 12, justifyContent: 'space-around' }}>
          {[
            { label:'Presión',  value:`${pressure.toFixed(1)} PSI`,                   color: pressure>45?'#ef4444':'#4ade80' },
            { label:'Motor',    value: motor&&isOn?`${dir==='D'?'DER':'IZQ'}`:'OFF',  color: motor&&isOn?'#4ade80':'#ef4444' },
            { label:'Válvulas', value: [valvA&&'A',valvB&&'B',valvC&&'C'].filter(Boolean).join('+') || 'CERR.', color:'#fbbf24' },
            { label:'Timer',    value:`${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`, color:'#60a5fa' },
            { label:'Proceso',  value: proceso1&&isOn?'1 ACTIVO':'INACT.',             color: proceso1&&isOn?'#4ade80':'#9ca3af' },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ color:'#7ab0c0', fontSize:8 }}>{s.label}</div>
              <div style={{ fontFamily:'monospace', fontWeight:'bold', fontSize:10, color:s.color }}>{s.value}</div>
            </div>
          ))}
          <span style={{ color:'#556', fontSize:8, alignSelf:'center' }}>
            {new Date().toLocaleDateString()} {new Date().toTimeString().slice(0,8)}
          </span>
        </div>

      </div>
    </div>
  )
}
