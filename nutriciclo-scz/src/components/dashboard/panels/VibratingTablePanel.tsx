import { useState, useEffect, useRef, CSSProperties } from 'react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ── Paleta visual ─────────────────────────────────────────────────────────────
const PANEL_BG  = '#cfc98a'   // beige/arena industrial
const PANEL_DARK = '#b8b270'
const PANEL_EDGE = '#a8a260'
const SCREW_C   = '#8a7a50'

// ── Tornillo de esquina ───────────────────────────────────────────────────────
function Screw({ style }: { style?: CSSProperties }) {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, #ccc, ${SCREW_C})`,
      border: '1px solid #6a5a30',
      boxShadow: '0 1px 3px #0006',
      position: 'absolute',
      ...style,
    }}>
      {/* Hendidura */}
      <div style={{
        position: 'absolute', top: '50%', left: '15%', right: '15%',
        height: 1.5, background: '#5a4a20', transform: 'translateY(-50%)',
      }} />
    </div>
  )
}

// ── Interruptor basculante (rocker) ───────────────────────────────────────────
function RockerSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{
      width: 56, height: 38,
      background: '#333',
      border: '3px solid #222',
      borderRadius: 4,
      boxShadow: '0 3px 8px #0008, inset 0 1px 2px #fff2',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', cursor: 'pointer',
      position: 'relative',
    }} onClick={() => onChange(!on)}>
      {/* Parte OFF (roja, arriba) */}
      <div style={{
        flex: 1,
        background: on ? '#4a2020' : '#cc2020',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid #111',
        boxShadow: on ? 'inset 0 2px 4px #0006' : 'none',
        transition: 'all 0.15s',
      }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: on ? '#5a3030' : '#fff' }}>O</span>
      </div>
      {/* Parte ON (verde, abajo) */}
      <div style={{
        flex: 1,
        background: on ? '#1a7a2a' : '#2a4a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: on ? 'inset 0 2px 4px #0006' : 'none',
        transition: 'all 0.15s',
      }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: on ? '#fff' : '#3a5a3a' }}>I</span>
      </div>
    </div>
  )
}

// ── Piloto iluminado redondo ──────────────────────────────────────────────────
function IlluminatedPilot({
  color, on, label,
}: { color: string; on: boolean; label: string }) {
  const glow = on ? `0 0 14px ${color}, 0 0 4px ${color}` : 'none'
  const face = on ? color : `${color}30`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Cuerpo metálico */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, #aaa, #555)`,
        border: '3px solid #333',
        boxShadow: '0 3px 8px #0008',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Lente */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${on ? '#fff8' : '#fff1'}, ${face})`,
          boxShadow: glow,
          border: `1px solid ${on ? color : '#222'}`,
          transition: 'all 0.3s',
        }} />
      </div>
      <div style={{ fontSize: 8, fontWeight: 700, color: '#3a3010', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  )
}

// ── Temporizador digital (Autonics T3S estilo) ────────────────────────────────
function DigitalTimer({
  elapsed, setpoint, running,
}: { elapsed: number; setpoint: number; running: boolean }) {
  // Formato MM:SS
  const display = (s: number) => {
    const m = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  const sevenSeg: CSSProperties = {
    fontFamily: '"Courier New", monospace',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textShadow: running ? '0 0 8px #ff3300' : 'none',
  }

  return (
    <div style={{
      width: 110,
      background: '#1a1a1a',
      border: '3px solid #333',
      borderRadius: 4,
      boxShadow: '0 4px 12px #0009, inset 0 1px 2px #fff1',
      padding: 6,
    }}>
      {/* Etiqueta TIMER */}
      <div style={{
        fontSize: 8, fontWeight: 700, color: '#888',
        textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4,
      }}>TIMER</div>

      {/* Display PV (valor actual) */}
      <div style={{
        background: '#0a0a0a', border: '1px solid #333',
        borderRadius: 2, padding: '3px 6px', textAlign: 'center', marginBottom: 3,
      }}>
        <div style={{ fontSize: 7, color: '#555', textAlign: 'left', marginBottom: 1 }}>PV</div>
        <div style={{ ...sevenSeg, fontSize: 20, color: running ? '#ff4400' : '#3a1100' }}>
          {display(elapsed)}
        </div>
      </div>

      {/* Display SV (setpoint) */}
      <div style={{
        background: '#0a0a0a', border: '1px solid #333',
        borderRadius: 2, padding: '2px 6px', textAlign: 'center', marginBottom: 6,
      }}>
        <div style={{ fontSize: 7, color: '#555', textAlign: 'left', marginBottom: 1 }}>SV</div>
        <div style={{ ...sevenSeg, fontSize: 14, color: '#cc3300' }}>
          {display(setpoint)}
        </div>
      </div>

      {/* Botones SET / RST */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {['SET', 'RST'].map(b => (
          <div key={b} style={{
            flex: 1, background: '#2a2a2a', border: '1px solid #444',
            borderRadius: 2, padding: '2px 0', textAlign: 'center',
            fontSize: 7, color: '#666', cursor: 'default',
          }}>{b}</div>
        ))}
      </div>
    </div>
  )
}

// ── Diagrama de proceso SVG ───────────────────────────────────────────────────
function ProcessDiagram({ active, vibrating, cycle }: { active: boolean; vibrating: boolean; cycle: number }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!vibrating) return
    const id = setInterval(() => setTick(t => (t + 1) % 10), 80)
    return () => clearInterval(id)
  }, [vibrating])

  const shakeY = vibrating ? (tick % 2 === 0 ? 2 : -2) : 0
  const shakeX = vibrating ? (tick % 3 === 0 ? 1 : -1) : 0

  return (
    <svg width="100%" viewBox="0 0 400 160" style={{ display: 'block' }}>
      {/* Fondo */}
      <rect width={400} height={160} fill="none" />

      {/* Tolva mezcla (entrada) */}
      <path d="M30 10 L90 10 L75 50 L45 50 Z" fill="#3a3a4a" stroke="#555" strokeWidth={1.5} />
      <rect x={50} y={50} width={20} height={15} fill="#2a2a3a" stroke="#555" strokeWidth={1} />
      <text x={60} y={30} textAnchor="middle" fontSize={8} fill="#aaa">MEZCLA</text>
      <text x={60} y={42} textAnchor="middle" fontSize={7} fill="#666">Húmeda</text>

      {/* Cinta/flujo hacia mesa */}
      <line x1={60} y1={65} x2={130} y2={100}
        stroke={active ? '#88aaff' : '#333'} strokeWidth={2.5}
        strokeDasharray={active ? '6 4' : 'none'} />

      {/* Mesa vibradora */}
      <g transform={`translate(${shakeX} ${shakeY})`}>
        {/* Estructura mesa */}
        <rect x={115} y={92} width={170} height={45} rx={3}
          fill="#4a4a5a" stroke={vibrating ? '#66aaff' : '#555'} strokeWidth={2} />

        {/* Superficie */}
        <rect x={118} y={88} width={164} height={12} rx={2}
          fill="#5a5a7a" stroke={vibrating ? '#88bbff' : '#555'} strokeWidth={1.5} />

        {/* Moldes */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect
              x={125 + i * 37} y={94} width={30} height={35} rx={2}
              fill={active ? '#2a3a5a' : '#1a1a2a'}
              stroke={active ? '#4466aa' : '#333'} strokeWidth={1}
            />
            {/* Nivel de llenado */}
            <rect
              x={127 + i * 37} y={94 + 35 - Math.max(2, (cycle / 100) * 33)}
              width={26} height={Math.max(2, (cycle / 100) * 33)}
              rx={1}
              fill={active ? '#6688cc80' : '#1a2a4a40'}
            />
            <text x={140 + i * 37} y={118}
              textAnchor="middle" fontSize={7} fill="#6688aa">
              M{i + 1}
            </text>
          </g>
        ))}

        {/* Patas */}
        {[130, 175, 220, 265].map(x => (
          <g key={x}>
            {/* Resorte vibratorio */}
            {[0, 3, 6].map(dy => (
              <line key={dy}
                x1={x} y1={137 + dy} x2={x + (dy % 2 === 0 ? 6 : -6)} y2={140 + dy}
                stroke="#667" strokeWidth={1}
              />
            ))}
            <line x1={x} y1={137} x2={x} y2={155} stroke="#555" strokeWidth={2} />
          </g>
        ))}

        {/* Motor vibrador */}
        <ellipse cx={200} cy={145} rx={14} ry={8}
          fill={vibrating ? '#446688' : '#333'}
          stroke={vibrating ? '#6699bb' : '#555'} strokeWidth={1.5} />
        <text x={200} y={148} textAnchor="middle" fontSize={7}
          fill={vibrating ? '#aaccee' : '#555'}>VIB</text>

        {/* Ondas vibración */}
        {vibrating && [0, 1, 2].map(i => (
          <ellipse key={i}
            cx={200} cy={137} rx={20 + i * 10} ry={5 + i * 3}
            fill="none" stroke="#4466aa" strokeWidth={0.5}
            opacity={(1 - i * 0.3) * 0.6}
          />
        ))}
      </g>

      {/* Etiqueta mesa */}
      <text x={200} y={80} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#aaa">
        MESA VIBRADORA + MOLDES
      </text>

      {/* Cinta salida (desmolde) */}
      <line x1={285} y1={110} x2={360} y2={110}
        stroke={active && cycle >= 99 ? '#44cc44' : '#333'} strokeWidth={2.5}
        strokeDasharray={active && cycle >= 99 ? '6 4' : 'none'} />
      <text x={355} y={107} textAnchor="end" fontSize={7}
        fill={active && cycle >= 99 ? '#44cc44' : '#555'}>Desmolde</text>

      {/* Bloques resultado */}
      {active && cycle >= 80 && [0, 1, 2].map(i => (
        <rect key={i} x={310 + i * 16} y={113} width={12} height={18} rx={2}
          fill="#334455" stroke="#4466aa" strokeWidth={1} />
      ))}

      {/* Indicadores de estado */}
      <text x={200} y={15} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#ccc">
        MESA VIBRADORA — FRAGUADO NPKS
      </text>
      <text x={200} y={27} textAnchor="middle" fontSize={7} fill="#666">
        Compactación húmeda en moldes
      </text>
    </svg>
  )
}

// ── Panel principal ───────────────────────────────────────────────────────────
export function VibratingTablePanel({ onClose }: { onClose: () => void }) {
  const { equipment, toggleEquipment } = useSimulatorStore()
  const eq = equipment['vibrating_table']
  const active = eq.active

  const [mainsOn, setMainsOn]       = useState(false)
  const [controlOn, setControlOn]   = useState(false)
  const [vibrating, setVibrating]   = useState(false)
  const [elapsed, setElapsed]       = useState(0)
  const [setpoint, setSetpoint]     = useState(180)  // 3 minutos por defecto
  const [cycle, setCycle]           = useState(0)    // % llenado moldes
  const [cyclesTotal, setCyclesTotal] = useState(0)
  const [tab, setTab]               = useState<'PANEL'|'CICLOS'|'CONFIG'>('PANEL')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sincronizar mains con equipo activo
  useEffect(() => {
    if (active) { setMainsOn(true); setControlOn(true) }
    else        { setMainsOn(false); setControlOn(false); setVibrating(false) }
  }, [active])

  // Timer principal
  useEffect(() => {
    if (!vibrating) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1
        setCycle(Math.min(100, (next / setpoint) * 100))
        if (next >= setpoint) {
          setVibrating(false)
          setCyclesTotal(c => c + 1)
          setCycle(100)
          return 0
        }
        return next
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [vibrating, setpoint])

  const handleStart = () => {
    if (!controlOn || !mainsOn) return
    if (!active) toggleEquipment('vibrating_table')
    setVibrating(true)
    setElapsed(0)
    setCycle(0)
  }

  const handleStop = () => {
    setVibrating(false)
    if (active) toggleEquipment('vibrating_table')
    setElapsed(0)
    setCycle(0)
  }

  const handleReset = () => {
    setVibrating(false)
    setElapsed(0)
    setCycle(0)
  }

  // ── Estilos ────────────────────────────────────────────────────────────────
  const overlay: CSSProperties = {
    position: 'fixed', inset: 0,
    background: '#000000aa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
  }

  const outerBox: CSSProperties = {
    background: '#888070',   // borde exterior más oscuro (caja metálica)
    border: '4px solid #5a5040',
    borderRadius: 8,
    padding: 8,
    boxShadow: '0 20px 60px #000c, inset 0 2px 0 #aaa8',
    width: 640,
    maxHeight: '92vh',
    overflowY: 'auto',
  }

  const innerPanel: CSSProperties = {
    background: PANEL_BG,
    borderRadius: 4,
    position: 'relative',
    padding: '20px 20px 16px',
    boxShadow: 'inset 0 1px 0 #fffb, inset 0 -1px 0 #0003',
  }

  const tabBtn = (t: typeof tab): CSSProperties => ({
    padding: '4px 14px', fontSize: 9, fontWeight: 700,
    background: tab === t ? '#555' : PANEL_DARK,
    color: tab === t ? '#fff' : '#6a5a20',
    border: `1px solid ${tab === t ? '#333' : PANEL_EDGE}`,
    borderRadius: 3, cursor: 'pointer', letterSpacing: '0.08em',
  })

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={outerBox}>
        <div style={innerPanel}>
          {/* Tornillos esquinas */}
          <Screw style={{ top: 8, left: 8 }} />
          <Screw style={{ top: 8, right: 8 }} />
          <Screw style={{ bottom: 8, left: 8 }} />
          <Screw style={{ bottom: 8, right: 8 }} />

          {/* Título grabado */}
          <div style={{
            textAlign: 'center', marginBottom: 16,
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: 18, fontWeight: 900,
              color: '#3a3010',
              letterSpacing: '0.18em',
              textShadow: '0 1px 0 #fffb, 0 -1px 0 #0003',
              borderBottom: `2px solid ${PANEL_DARK}`,
              paddingBottom: 4,
            }}>
              VIBRATING TABLE
            </div>
          </div>

          {/* ── FILA PRINCIPAL DEL PANEL FÍSICO ─────────────────────────────── */}
          <div style={{
            background: PANEL_DARK,
            border: `2px solid ${PANEL_EDGE}`,
            borderRadius: 4,
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12,
            boxShadow: 'inset 0 2px 4px #0004, 0 1px 0 #fff8',
          }}>
            {/* Interruptor rocker */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <RockerSwitch
                on={mainsOn}
                onChange={(v) => {
                  setMainsOn(v)
                  if (!v) { setControlOn(false); setVibrating(false); if (active) toggleEquipment('vibrating_table') }
                }}
              />
              <div style={{ fontSize: 7, color: '#6a5a20', letterSpacing: '0.06em' }}>MAIN SW</div>
            </div>

            {/* Piloto MAINS */}
            <IlluminatedPilot color="#ee2222" on={mainsOn} label="MAINS IND." />

            {/* Piloto CONTROL */}
            <IlluminatedPilot color="#22cc44" on={controlOn && mainsOn} label="CONTROL IND." />

            {/* Timer digital */}
            <DigitalTimer
              elapsed={elapsed}
              setpoint={setpoint}
              running={vibrating}
            />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['PANEL', 'CICLOS', 'CONFIG'] as const).map(t => (
              <button key={t} style={tabBtn(t)} onClick={() => setTab(t)}>{t}</button>
            ))}
            <button onClick={onClose} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#6a5a20', fontSize: 16, cursor: 'pointer', padding: '0 4px',
            }}>✕</button>
          </div>

          {/* ── TAB PANEL ──────────────────────────────────────────────────── */}
          {tab === 'PANEL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Diagrama */}
              <div style={{
                background: '#1a1e22', border: `1px solid ${PANEL_EDGE}`,
                borderRadius: 4, padding: 10,
              }}>
                <ProcessDiagram active={active || vibrating} vibrating={vibrating} cycle={cycle} />
              </div>

              {/* Controles y estado */}
              <div style={{
                display: 'flex', gap: 10,
                background: PANEL_DARK, border: `1px solid ${PANEL_EDGE}`,
                borderRadius: 4, padding: '12px 16px',
              }}>
                {/* Botones START/STOP/RESET */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button onClick={handleStart} disabled={vibrating || !mainsOn} style={{
                      width: 54, height: 28, background: vibrating || !mainsOn ? '#1a4a1a' : '#2a8a3a',
                      border: '2px solid #1a5a2a', borderRadius: 3,
                      color: vibrating || !mainsOn ? '#3a5a3a' : '#aaffaa',
                      fontSize: 10, fontWeight: 700, cursor: vibrating || !mainsOn ? 'default' : 'pointer',
                      boxShadow: vibrating || !mainsOn ? 'inset 0 2px 4px #0006' : '0 2px 4px #0006',
                    }}>START</button>
                    <button onClick={handleStop} disabled={!vibrating} style={{
                      width: 54, height: 28, background: !vibrating ? '#4a1a1a' : '#aa2a2a',
                      border: '2px solid #5a1a1a', borderRadius: 3,
                      color: !vibrating ? '#5a2a2a' : '#ffaaaa',
                      fontSize: 10, fontWeight: 700, cursor: !vibrating ? 'default' : 'pointer',
                      boxShadow: !vibrating ? 'inset 0 2px 4px #0006' : '0 2px 4px #0006',
                    }}>STOP</button>
                    <button onClick={handleReset} style={{
                      width: 54, height: 28, background: '#4a4a1a',
                      border: '2px solid #5a5a2a', borderRadius: 3,
                      color: '#cccc88', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}>RESET</button>
                  </div>
                </div>

                <div style={{ width: 1, background: PANEL_EDGE, alignSelf: 'stretch' }} />

                {/* Estado actual */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 9, color: '#6a5a20' }}>ESTADO</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: vibrating ? '#22cc44' : !mainsOn ? '#888' : '#cc4444',
                    }}>
                      {vibrating ? '● VIBRANDO' : !mainsOn ? '○ APAGADO' : '○ EN ESPERA'}
                    </span>
                  </div>

                  {/* Barra de progreso ciclo */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 8, color: '#6a5a20' }}>PROGRESO CICLO</span>
                      <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#3a3010', fontWeight: 700 }}>
                        {cycle.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{
                      height: 10, background: '#2a2818', border: '1px solid #3a3010',
                      borderRadius: 5, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${cycle}%`,
                        background: cycle >= 100 ? '#22cc44' : vibrating ? '#4488ff' : '#2244aa',
                        borderRadius: 5, transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 8, color: '#6a5a20' }}>CICLOS COMPLETADOS</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#3a3010', fontWeight: 700 }}>
                      {cyclesTotal}
                    </span>
                  </div>
                </div>

                <div style={{ width: 1, background: PANEL_EDGE, alignSelf: 'stretch' }} />

                {/* Tiempo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100 }}>
                  <div>
                    <div style={{ fontSize: 8, color: '#6a5a20', marginBottom: 2 }}>TIEMPO TRANSCURRIDO</div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: 16, fontWeight: 900,
                      color: vibrating ? '#cc3300' : '#3a2200',
                    }}>
                      {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: '#6a5a20', marginBottom: 2 }}>SETPOINT</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#cc3300' }}>
                      {String(Math.floor(setpoint / 60)).padStart(2, '0')}:{String(setpoint % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CICLOS ─────────────────────────────────────────────────── */}
          {tab === 'CICLOS' && (
            <div style={{
              background: PANEL_DARK, border: `1px solid ${PANEL_EDGE}`,
              borderRadius: 4, padding: 14,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3010', marginBottom: 12 }}>
                REGISTRO DE CICLOS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Ciclos Totales',  value: cyclesTotal },
                  { label: 'Bloques Prod.',   value: cyclesTotal * 4 },
                  { label: 'Ciclo Actual',    value: `${cycle.toFixed(0)}%` },
                ].map(s => (
                  <div key={s.label} style={{
                    background: PANEL_BG, border: `1px solid ${PANEL_EDGE}`,
                    borderRadius: 4, padding: '8px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 8, color: '#6a5a20' }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 900, color: '#3a3010', marginTop: 2 }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: '#6a5a20', marginBottom: 8 }}>HISTORIAL RECIENTE</div>
              {cyclesTotal === 0 ? (
                <div style={{ fontSize: 9, color: '#888', textAlign: 'center', padding: '16px 0' }}>
                  Sin ciclos registrados
                </div>
              ) : (
                Array.from({ length: Math.min(cyclesTotal, 5) }, (_, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: `1px solid ${PANEL_EDGE}`, padding: '6px 0',
                    fontSize: 9, color: '#3a3010',
                  }}>
                    <span>Ciclo #{cyclesTotal - i}</span>
                    <span style={{ color: '#22cc44' }}>✓ Completado</span>
                    <span>{setpoint}s / 4 moldes</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB CONFIG ─────────────────────────────────────────────────── */}
          {tab === 'CONFIG' && (
            <div style={{
              background: PANEL_DARK, border: `1px solid ${PANEL_EDGE}`,
              borderRadius: 4, padding: 14, display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3a3010' }}>
                CONFIGURACIÓN TEMPORIZADOR
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: '#6a5a20' }}>TIEMPO DE VIBRACIÓN (SV)</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#3a3010', fontWeight: 700 }}>
                    {Math.floor(setpoint / 60)}m {setpoint % 60}s
                  </span>
                </div>
                <input type="range" min={30} max={600} step={10} value={setpoint}
                  onChange={e => setSetpoint(Number(e.target.value))}
                  disabled={vibrating}
                  style={{ width: '100%', accentColor: '#555' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#888' }}>
                  <span>30s</span><span>5 min</span><span>10 min</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Modelo mesa',      'VT-1200'],
                  ['Potencia motor',   '0.37 kW'],
                  ['Frecuencia vibr.', '50 Hz'],
                  ['Amplitud',         '1.5 mm'],
                  ['Carga máx.',       '150 kg'],
                  ['N° moldes',        '4 uds'],
                  ['Dim. molde',       '20×10×8 cm'],
                  ['Material mesa',    'Acero inox 304'],
                ].map(([l, v]) => (
                  <div key={l} style={{
                    background: PANEL_BG, border: `1px solid ${PANEL_EDGE}`,
                    borderRadius: 3, padding: '5px 8px',
                  }}>
                    <div style={{ fontSize: 7, color: '#6a5a20' }}>{l}</div>
                    <div style={{ fontSize: 10, color: '#3a3010', fontWeight: 600, marginTop: 1 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
