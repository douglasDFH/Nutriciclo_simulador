import { useState, useEffect, useRef, CSSProperties } from 'react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ── Paleta visual ─────────────────────────────────────────────────────────────
const PANEL   = '#2a2e33'
const PANEL_L = '#353a40'
const PANEL_D = '#1c1f23'
const BORDER  = '#444950'
const SCREW   = '#555c64'
const GAUGE_B = '#1a1d20'
const GAUGE_F = '#f5f5f0'
const BRAND   = '#00a651'   // NMC verde

// ── Gauge analógico SVG ───────────────────────────────────────────────────────
function AnalogGauge({
  value, min, max, label, unit, color, size = 90,
}: {
  value: number; min: number; max: number
  label: string; unit: string; color: string; size?: number
}) {
  const pct   = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const angle = -135 + pct * 270   // sweep 270°

  const tickAngles = [-135, -90, -45, 0, 45, 90, 135]
  const r = size / 2

  const ptr = (ang: number, r1: number, r2: number) => {
    const rad = (ang * Math.PI) / 180
    return {
      x1: r + Math.cos(rad) * r1,
      y1: r + Math.sin(rad) * r1,
      x2: r + Math.cos(rad) * r2,
      y2: r + Math.sin(rad) * r2,
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Etiqueta arriba */}
      <div style={{
        background: color, color: '#fff', fontSize: 9, fontWeight: 700,
        padding: '2px 8px', borderRadius: 3, letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>

      {/* Cuerpo del gauge */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${GAUGE_F}, #d0cfc8)`,
        border: `4px solid #222`,
        boxShadow: '0 4px 12px #000a, inset 0 1px 2px #fff4',
        position: 'relative', flexShrink: 0,
      }}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Fondo oscuro interior */}
          <circle cx={r} cy={r} r={r - 5} fill={GAUGE_B} />

          {/* Arco de rango */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
            const a = -135 + i * 27
            const rad = (a * Math.PI) / 180
            const x = r + Math.cos(rad) * (r - 10)
            const y = r + Math.sin(rad) * (r - 10)
            const danger = i >= 9
            return (
              <line key={i}
                x1={r + Math.cos(rad) * (r - 16)} y1={r + Math.sin(rad) * (r - 16)}
                x2={x} y2={y}
                stroke={danger ? '#e03030' : '#555'}
                strokeWidth={i % 5 === 0 ? 2 : 1}
              />
            )
          })}

          {/* Ticks mayores con números */}
          {tickAngles.map((a, i) => {
            const rad = (a * Math.PI) / 180
            const val = min + (i / (tickAngles.length - 1)) * (max - min)
            const tx = r + Math.cos(rad) * (r - 24)
            const ty = r + Math.sin(rad) * (r - 24)
            return (
              <text key={a} x={tx} y={ty + 3}
                textAnchor="middle" fontSize={7} fill="#aaa" fontFamily="monospace">
                {val % 1 === 0 ? val : val.toFixed(1)}
              </text>
            )
          })}

          {/* Aguja */}
          <line
            x1={r + Math.cos(((angle + 90) * Math.PI) / 180) * 4}
            y1={r + Math.sin(((angle + 90) * Math.PI) / 180) * 4}
            x2={r + Math.cos((angle * Math.PI) / 180) * (r - 18)}
            y2={r + Math.sin((angle * Math.PI) / 180) * (r - 18)}
            stroke="#e0e0e0" strokeWidth={2} strokeLinecap="round"
          />

          {/* Pivote */}
          <circle cx={r} cy={r} r={4} fill="#888" stroke="#333" strokeWidth={1} />

          {/* Valor digital */}
          <text x={r} y={r + 20} textAnchor="middle"
            fontSize={10} fontWeight="bold" fill={color} fontFamily="monospace">
            {value.toFixed(1)}
          </text>
          <text x={r} y={r + 29} textAnchor="middle"
            fontSize={7} fill="#888" fontFamily="monospace">
            {unit}
          </text>
        </svg>
      </div>
    </div>
  )
}

// ── Display AlphaFlux (HMI izquierdo) ────────────────────────────────────────
function AlphaFluxDisplay({ value, active }: { value: number; active: boolean }) {
  const s: CSSProperties = {
    background: '#0a1a0a',
    border: '2px solid #333',
    borderRadius: 4,
    padding: '6px 8px',
    width: 110,
    fontFamily: 'monospace',
  }
  return (
    <div style={s}>
      <div style={{ fontSize: 8, color: '#4a9a4a', marginBottom: 4, letterSpacing: '0.1em' }}>
        AlphaFlux d'Bert
      </div>
      <div style={{ fontSize: 18, color: active ? '#00ff44' : '#115511', fontWeight: 'bold', textAlign: 'center' }}>
        {active ? value.toFixed(2) : '- - . - -'}
      </div>
      <div style={{ fontSize: 7, color: '#3a7a3a', textAlign: 'center' }}>L/h</div>
      <div style={{
        display: 'flex', gap: 4, marginTop: 6, justifyContent: 'center',
      }}>
        {['RUN', 'ALM', 'COM'].map((l, i) => (
          <div key={l} style={{
            fontSize: 7, color: i === 0 && active ? '#00ff44' : '#1a3a1a',
            border: '1px solid #1a3a1a', borderRadius: 2, padding: '1px 4px',
          }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ── Display digital central (azul) ────────────────────────────────────────────
function BlueDisplay({ value, unit, label, active }: { value: number; unit: string; label: string; active: boolean }) {
  return (
    <div style={{
      background: '#001030', border: '2px solid #0040a0',
      borderRadius: 4, padding: '4px 10px', textAlign: 'center', minWidth: 90,
    }}>
      <div style={{ fontSize: 7, color: '#4080ff', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: active ? '#4080ff' : '#0a1a50' }}>
        {active ? value.toFixed(1) : '- - -'}
      </div>
      <div style={{ fontSize: 7, color: '#2060c0' }}>{unit}</div>
    </div>
  )
}

// ── Tornillo de panel ─────────────────────────────────────────────────────────
function Screw({ style }: { style?: CSSProperties }) {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, #888, ${SCREW})`,
      border: '1px solid #333',
      boxShadow: '0 1px 2px #0006',
      position: 'absolute',
      ...style,
    }} />
  )
}

// ── LED indicador ─────────────────────────────────────────────────────────────
function StatusLed({ color, on, label }: { color: string; on: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: on ? color : '#111',
        boxShadow: on ? `0 0 8px ${color}` : 'none',
        border: '1px solid #444',
      }} />
      <div style={{ fontSize: 7, color: '#777', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

// ── Botón físico redondo ──────────────────────────────────────────────────────
function RoundBtn({
  color, label, onClick, size = 36,
}: { color: string; label?: string; onClick?: () => void; size?: number }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onClick?.() }}
        onMouseLeave={() => setPressed(false)}
        style={{
          width: size, height: size, borderRadius: '50%',
          background: pressed
            ? `radial-gradient(circle at 60% 60%, ${color}88, ${color}44)`
            : `radial-gradient(circle at 35% 35%, ${color}ff, ${color}88)`,
          border: `3px solid ${color}44`,
          boxShadow: pressed
            ? `0 1px 2px #0008, inset 0 2px 4px #0006`
            : `0 3px 8px #0008, inset 0 1px 2px #fff4`,
          cursor: 'pointer', outline: 'none',
          transform: pressed ? 'translateY(1px)' : 'none',
          transition: 'all 0.08s',
        }}
      />
      {label && <div style={{ fontSize: 8, color: '#aaa', letterSpacing: '0.05em' }}>{label}</div>}
    </div>
  )
}

// ── Diagrama de proceso SVG ───────────────────────────────────────────────────
function ProcessDiagram({ active, flow }: { active: boolean; flow: number }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick(t => (t + 1) % 40), 150)
    return () => clearInterval(id)
  }, [active])

  const flowColor = active ? '#00c853' : '#333'

  return (
    <svg width="100%" viewBox="0 0 340 130" style={{ display: 'block' }}>
      {/* Silo cal viva */}
      <rect x={10} y={10} width={50} height={70} rx={3} fill="#3a3f46" stroke="#555" strokeWidth={1.5} />
      <path d="M10 80 L35 105 L60 80" fill="#2e3338" stroke="#555" strokeWidth={1.5} />
      <text x={35} y={50} textAnchor="middle" fontSize={8} fill="#aaa">CAL</text>
      <text x={35} y={62} textAnchor="middle" fontSize={8} fill="#aaa">VIVA</text>
      <text x={35} y={74} textAnchor="middle" fontSize={7} fill="#666">CaO</text>

      {/* Nivel cal */}
      <rect x={12} y={12} width={46} height={60} rx={2} fill={active ? '#d4a04060' : '#1a1e22'} />
      <text x={35} y={90} textAnchor="middle" fontSize={7} fill="#666">Tolva</text>

      {/* Tornillo dosificador */}
      <rect x={60} y={95} width={80} height={14} rx={4} fill="#3a4050" stroke={flowColor} strokeWidth={1.5} />
      <text x={100} y={105} textAnchor="middle" fontSize={8} fill={active ? '#00c853' : '#555'}>⟶ Tornillo Dosif.</text>

      {/* Espiral animada */}
      {active && [0, 1, 2, 3, 4, 5].map(i => (
        <circle key={i}
          cx={65 + ((i * 13 + tick * 3) % 75)}
          cy={102}
          r={3} fill="none"
          stroke={flowColor} strokeWidth={1.5}
        />
      ))}

      {/* Báscula / Balanza */}
      <rect x={145} y={88} width={60} height={30} rx={3} fill={PANEL_L} stroke="#555" strokeWidth={1.5} />
      <rect x={148} y={91} width={54} height={14} rx={2} fill="#001010" stroke="#0a4a4a" strokeWidth={1} />
      <text x={175} y={101} textAnchor="middle" fontSize={9} fontFamily="monospace"
        fill={active ? '#00e5ff' : '#0a3a3a'}>{active ? flow.toFixed(2) : '0.00'}</text>
      <text x={175} y={113} textAnchor="middle" fontSize={7} fill="#666">Báscula kg/h</text>

      {/* Válvula rotativa */}
      <rect x={210} y={90} width={40} height={24} rx={3} fill="#2a3040" stroke="#446" strokeWidth={1.5} />
      <ellipse cx={230} cy={102} rx={10} ry={10} fill="none" stroke={flowColor} strokeWidth={2} />
      <line x1={230} y1={92} x2={230} y2={112} stroke={flowColor} strokeWidth={2}
        transform={`rotate(${tick * 9} 230 102)`} />
      <text x={230} y={120} textAnchor="middle" fontSize={7} fill="#666">V. Rotativa</text>

      {/* Caída al mezclador */}
      <line x1={230} y1={114} x2={230} y2={130} stroke={flowColor} strokeWidth={3} strokeDasharray={active ? '4 3' : 'none'} />

      {/* Medidor de flujo */}
      <rect x={260} y={70} width={65} height={45} rx={4} fill={PANEL_L} stroke="#555" strokeWidth={1.5} />
      <rect x={263} y={73} width={59} height={24} rx={2} fill="#001020" stroke="#002040" strokeWidth={1} />
      <text x={292} y={83} textAnchor="middle" fontSize={7} fill="#4080ff">CAUDAL</text>
      <text x={292} y={93} textAnchor="middle" fontSize={11} fontFamily="monospace"
        fontWeight="bold" fill={active ? '#4080ff' : '#0a1a40'}>
        {active ? flow.toFixed(1) : '0.0'}
      </text>
      <text x={292} y={103} textAnchor="middle" fontSize={7} fill="#4080ff">L/h</text>
      <text x={292} y={112} textAnchor="middle" fontSize={8} fill="#666">Flujómetro</text>

      {/* Líneas de flujo */}
      <line x1={250} y1={102} x2={260} y2={92} stroke={flowColor} strokeWidth={1.5} strokeDasharray="3 2" />

      {/* Etiqueta sistema */}
      <text x={170} y={20} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#ccc">
        SISTEMA DOSIFICACIÓN CAL VIVA
      </text>
      <text x={170} y={32} textAnchor="middle" fontSize={8} fill="#666">
        CaO → Mezcladora de Paletas
      </text>
    </svg>
  )
}

// ── Panel principal ───────────────────────────────────────────────────────────
export function LimeDosifierPanel({ onClose }: { onClose: () => void }) {
  const { equipment, toggleEquipment, sensors } = useSimulatorStore()
  const eq = equipment['lime_dosifier']
  const active = eq.active

  // Estado local
  const [mode, setMode]         = useState<'MAN' | 'AUTO'>('AUTO')
  const [setpoint, setSetpoint] = useState(45)   // kg/h
  const [vacuumSet, setVacuumSet] = useState(0.4)
  const [flowRate, setFlowRate] = useState(0)
  const [vacuum, setVacuum]     = useState(0)
  const [pressIn, setPressIn]   = useState(0)
  const [flowOut, setFlowOut]   = useState(0)
  const [tab, setTab]           = useState<'PROCESO'|'CALIBRACIÓN'|'ALARMAS'>('PROCESO')
  const [alarms, setAlarms]     = useState<string[]>([])

  // Historial de flujo
  const histRef = useRef<number[]>(Array(40).fill(0))

  useEffect(() => {
    if (!active) {
      setFlowRate(0); setVacuum(0); setPressIn(0); setFlowOut(0)
      return
    }
    const id = setInterval(() => {
      const target = mode === 'AUTO' ? setpoint : setpoint * 0.8
      setFlowRate(prev => {
        const next = prev + (target - prev) * 0.1 + (Math.random() - 0.5) * 0.4
        histRef.current = [...histRef.current.slice(1), next]
        return Math.max(0, next)
      })
      setVacuum(vacuumSet + (Math.random() - 0.5) * 0.05)
      setPressIn(1.2 + (Math.random() - 0.5) * 0.1)
      setFlowOut(prev => prev + (Math.random() - 0.5) * 0.3)

      // Alarmas simples
      setAlarms(prev => {
        const a: string[] = []
        if (vacuumSet > 0.7) a.push('Vacío alto — revisar filtro')
        return a
      })
    }, 600)
    return () => clearInterval(id)
  }, [active, mode, setpoint, vacuumSet])

  const panel: CSSProperties = {
    position: 'fixed', inset: 0,
    background: '#000000aa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
  }

  const box: CSSProperties = {
    background: PANEL,
    border: `2px solid ${BORDER}`,
    borderRadius: 8,
    width: 640, maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px #000c',
    position: 'relative',
    padding: 16,
  }

  const tabBtn = (t: typeof tab): CSSProperties => ({
    padding: '5px 14px', fontSize: 10, fontWeight: 700,
    background: tab === t ? BRAND : PANEL_L,
    color: tab === t ? '#fff' : '#999',
    border: `1px solid ${tab === t ? BRAND : BORDER}`,
    borderRadius: 4, cursor: 'pointer', letterSpacing: '0.06em',
    transition: 'all 0.15s',
  })

  return (
    <div style={panel} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        {/* Tornillos esquinas */}
        <Screw style={{ top: 8, left: 8 }} />
        <Screw style={{ top: 8, right: 8 }} />
        <Screw style={{ bottom: 8, left: 8 }} />
        <Screw style={{ bottom: 8, right: 8 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#e0e0e0', letterSpacing: '0.12em' }}>
              DOSIFICADOR DE CAL VIVA
            </div>
            <div style={{ fontSize: 8, color: '#666', letterSpacing: '0.1em' }}>
              NMC EP SYSTEM CONTROLLER — CaO Phase 3
            </div>
          </div>
          {/* Logo NMC estilo */}
          <div style={{
            background: PANEL_D, border: `2px solid ${BRAND}`,
            borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 900, color: '#fff',
            }}>N</div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: BRAND }}>NMC</div>
              <div style={{ fontSize: 6, color: '#666' }}>EP Controller</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#666',
            fontSize: 18, cursor: 'pointer', padding: '0 4px',
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {(['PROCESO', 'CALIBRACIÓN', 'ALARMAS'] as const).map(t => (
            <button key={t} style={tabBtn(t)} onClick={() => setTab(t)}>{t}</button>
          ))}
          {alarms.length > 0 && tab !== 'ALARMAS' && (
            <div style={{
              marginLeft: 'auto', fontSize: 9, color: '#ff4444',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>⚠ {alarms.length} alarma{alarms.length > 1 ? 's' : ''}</div>
          )}
        </div>

        {/* ── TAB PROCESO ────────────────────────────────────────────────────── */}
        {tab === 'PROCESO' && (
          <>
            {/* Fila superior: gauges */}
            <div style={{
              background: PANEL_D, borderRadius: 6, border: `1px solid ${BORDER}`,
              padding: '12px 16px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
                <AnalogGauge value={vacuumSet}        min={0} max={1}   label="VACUUM SET" unit="bar"  color="#ff9800" size={90} />
                <AnalogGauge value={vacuum}           min={0} max={1}   label="VACUUM"     unit="bar"  color="#2196f3" size={90} />
                <AnalogGauge value={Math.max(0,flowOut)} min={0} max={80}  label="FLOW OUT"   unit="kg/h" color="#4caf50" size={90} />
                <AnalogGauge value={pressIn}          min={0} max={2}   label="PRESS IN"   unit="bar"  color="#ff5722" size={90} />
              </div>
            </div>

            {/* Fila media: HMI + display central + LED */}
            <div style={{
              display: 'flex', gap: 12, alignItems: 'center',
              background: PANEL_D, borderRadius: 6, border: `1px solid ${BORDER}`,
              padding: 12, marginBottom: 12,
            }}>
              <AlphaFluxDisplay value={flowRate} active={active} />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <BlueDisplay value={flowRate} unit="L/h" label="CAUDAL ACTUAL" active={active} />
                <div style={{ display: 'flex', gap: 16 }}>
                  <StatusLed color="#00c853" on={active}     label="RUN"  />
                  <StatusLed color="#ff4444" on={alarms.length > 0} label="ALM"  />
                  <StatusLed color="#2196f3" on={mode === 'AUTO' && active} label="AUTO" />
                  <StatusLed color="#ff9800" on={mode === 'MAN' && active}  label="MAN"  />
                </div>
              </div>

              {/* Diagrama proceso */}
              <div style={{ flex: 2, minWidth: 0 }}>
                <ProcessDiagram active={active} flow={flowRate} />
              </div>
            </div>

            {/* Caja control central — NMC EP Controller */}
            <div style={{
              background: '#1e2228', border: `2px solid ${BORDER}`,
              borderRadius: 8, padding: '12px 16px',
              display: 'flex', gap: 16, alignItems: 'center',
            }}>
              {/* Botón power */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <RoundBtn
                  color={active ? '#ff3030' : '#00c853'}
                  label={active ? 'STOP' : 'START'}
                  onClick={() => toggleEquipment('lime_dosifier')}
                  size={44}
                />
              </div>

              <div style={{ width: 1, background: BORDER, alignSelf: 'stretch' }} />

              {/* Modo */}
              <div>
                <div style={{ fontSize: 9, color: '#666', marginBottom: 6 }}>MODO OPERACIÓN</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['MAN', 'AUTO'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{
                      padding: '4px 12px', fontSize: 9, fontWeight: 700,
                      background: mode === m ? (m === 'AUTO' ? BRAND : '#ff9800') : PANEL_L,
                      color: mode === m ? '#fff' : '#666',
                      border: `1px solid ${mode === m ? (m === 'AUTO' ? BRAND : '#ff9800') : BORDER}`,
                      borderRadius: 3, cursor: 'pointer',
                    }}>{m}</button>
                  ))}
                </div>
              </div>

              <div style={{ width: 1, background: BORDER, alignSelf: 'stretch' }} />

              {/* Setpoint */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: '#888' }}>SETPOINT DOSIS</span>
                  <span style={{ fontSize: 9, fontFamily: 'monospace', color: BRAND, fontWeight: 700 }}>
                    {setpoint} kg/h
                  </span>
                </div>
                <input type="range" min={5} max={100} value={setpoint}
                  onChange={e => setSetpoint(Number(e.target.value))}
                  style={{ width: '100%', accentColor: BRAND }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#555' }}>
                  <span>5 kg/h</span><span>100 kg/h</span>
                </div>
              </div>

              <div style={{ width: 1, background: BORDER, alignSelf: 'stretch' }} />

              {/* Vacío setpoint */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: '#888' }}>VACUUM SP</span>
                  <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#ff9800', fontWeight: 700 }}>
                    {vacuumSet.toFixed(2)} bar
                  </span>
                </div>
                <input type="range" min={0} max={100} value={Math.round(vacuumSet * 100)}
                  onChange={e => setVacuumSet(Number(e.target.value) / 100)}
                  style={{ width: '100%', accentColor: '#ff9800' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#555' }}>
                  <span>0.00 bar</span><span>1.00 bar</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TAB CALIBRACIÓN ─────────────────────────────────────────────────── */}
        {tab === 'CALIBRACIÓN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: PANEL_D, border: `1px solid ${BORDER}`,
              borderRadius: 6, padding: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: BRAND, marginBottom: 12 }}>
                PARÁMETROS DE CALIBRACIÓN
              </div>
              {[
                { label: 'Factor K tornillo',    value: '1.024', unit: 'kg/rev' },
                { label: 'Densidad aparente CaO', value: '850',  unit: 'kg/m³'  },
                { label: 'Factor corrección vacío', value: '0.985', unit: '' },
                { label: 'Offset báscula',        value: '+0.12', unit: 'kg'    },
                { label: 'Velocidad máx. tornillo', value: '120', unit: 'rpm'   },
                { label: 'Tiempo purga',          value: '15',   unit: 's'      },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${BORDER}`, padding: '8px 0',
                }}>
                  <span style={{ fontSize: 10, color: '#aaa' }}>{r.label}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', color: '#e0e0e0', fontSize: 11 }}>{r.value}</span>
                    <span style={{ fontSize: 8, color: '#666' }}>{r.unit}</span>
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 12, padding: 8,
                background: '#ff980020', border: '1px solid #ff980060',
                borderRadius: 4, fontSize: 9, color: '#ff9800',
              }}>
                ⚠ La calibración requiere modo MANUAL y equipo detenido.
              </div>
            </div>

            <div style={{
              background: PANEL_D, border: `1px solid ${BORDER}`,
              borderRadius: 6, padding: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', marginBottom: 10 }}>
                ESPECIFICACIONES TÉCNICAS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Capacidad nominal', '5–100 kg/h'],
                  ['Potencia motor',    '0.75 kW'],
                  ['Voltaje',           '220V / 50Hz'],
                  ['Protección IP',     'IP54'],
                  ['Material tolva',    'Acero inox 304'],
                  ['Exactitud dosis',   '±0.5%'],
                ].map(([l, v]) => (
                  <div key={l} style={{
                    background: PANEL_L, borderRadius: 4, padding: '6px 8px',
                  }}>
                    <div style={{ fontSize: 8, color: '#666' }}>{l}</div>
                    <div style={{ fontSize: 10, color: '#ddd', fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB ALARMAS ─────────────────────────────────────────────────────── */}
        {tab === 'ALARMAS' && (
          <div style={{
            background: PANEL_D, border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: 14,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ff4444', marginBottom: 12 }}>
              REGISTRO DE ALARMAS
            </div>
            {alarms.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '24px 0',
                color: BRAND, fontSize: 12,
              }}>
                ✓ Sin alarmas activas
              </div>
            ) : (
              alarms.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#ff444415', border: '1px solid #ff444440',
                  borderRadius: 4, padding: '8px 10px', marginBottom: 6,
                }}>
                  <span style={{ color: '#ff4444', fontSize: 14 }}>⚠</span>
                  <span style={{ fontSize: 10, color: '#ffaaaa' }}>{a}</span>
                </div>
              ))
            )}
            <div style={{
              marginTop: 16,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              {[
                { code: 'A001', desc: 'Falla comunicación flujómetro', active: false },
                { code: 'A002', desc: 'Presión vacío fuera de rango',  active: alarms.length > 0 },
                { code: 'A003', desc: 'Nivel mínimo tolva cal',        active: false },
                { code: 'A004', desc: 'Temperatura motor alta',        active: false },
                { code: 'A005', desc: 'Sobrecarga tornillo',           active: false },
                { code: 'A006', desc: 'Falla báscula',                 active: false },
              ].map(alarm => (
                <div key={alarm.code} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: alarm.active ? '#ff444415' : PANEL_L,
                  border: `1px solid ${alarm.active ? '#ff444440' : BORDER}`,
                  borderRadius: 4, padding: '6px 8px',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: alarm.active ? '#ff4444' : '#333',
                    boxShadow: alarm.active ? '0 0 6px #ff4444' : 'none',
                  }} />
                  <div>
                    <div style={{ fontSize: 8, color: '#666' }}>{alarm.code}</div>
                    <div style={{ fontSize: 9, color: alarm.active ? '#ffaaaa' : '#888' }}>{alarm.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
