import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Pantalla CNC / Sinumerik style ──────────────────────────────────────────
function CncScreen({ running, hz, current, feed, vibration }: {
  running: boolean; hz: number; current: number; feed: number; vibration: number[]
}) {
  const barColors = ['#e53935','#e53935','#ff7043','#ffa726','#66bb6a','#66bb6a','#42a5f5','#ab47bc','#ec407a','#ef5350']

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', flexDirection: 'column',
      fontFamily: "'Courier New', monospace", overflow: 'hidden' }}>

      {/* Barra superior estilo CNC */}
      <div style={{ background: '#0d0d1a', padding: '3px 8px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#90caf9', fontSize: 9, fontWeight: 'bold' }}>MILL MONITOR v2.4</span>
          <span style={{ color: running ? '#00e676' : '#e53935', fontSize: 8,
            background: running ? '#00e67622' : '#e5393522', padding: '1px 6px', borderRadius: 2 }}>
            {running ? '● RUN' : '■ STOP'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['AUTO','MDI','JOG'].map((m,i) => (
            <span key={m} style={{ color: i===0?'#fff':'#555', fontSize: 8, padding: '1px 5px',
              background: i===0?'#1565c0':'transparent', borderRadius: 2 }}>{m}</span>
          ))}
        </div>
        <span style={{ color: '#555', fontSize: 8 }}>{new Date().toTimeString().slice(0,8)}</span>
      </div>

      {/* Cuerpo principal: barras + parámetros */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>

        {/* Zona de barras de vibración/frecuencia */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 8px 4px' }}>
          <div style={{ color: '#607d8b', fontSize: 7, marginBottom: 4, letterSpacing: 0.5 }}>
            ANÁLISIS VIBRACIÓN — ESPECTRO (Hz)
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, paddingBottom: 2 }}>
            {vibration.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <div style={{
                  width: '100%', height: `${running ? v : 4}%`,
                  background: `linear-gradient(180deg, ${barColors[i]}, ${barColors[i]}88)`,
                  borderRadius: '2px 2px 0 0',
                  boxShadow: running ? `0 0 4px ${barColors[i]}` : 'none',
                  transition: 'height 0.5s ease',
                  minHeight: 2,
                }}/>
              </div>
            ))}
          </div>
          {/* Eje X */}
          <div style={{ display: 'flex', gap: 2, paddingTop: 2, borderTop: '1px solid #333' }}>
            {[50,100,150,200,250,300,350,400,450,500].map(f => (
              <div key={f} style={{ flex: 1, color: '#445', fontSize: 5, textAlign: 'center' }}>{f}</div>
            ))}
          </div>
          <div style={{ color: '#445', fontSize: 6, textAlign: 'center', marginTop: 1 }}>Frecuencia (Hz)</div>

          {/* Barra de carga motor */}
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { label: 'CARGA MOTOR', value: running ? Math.min(100, (current/45)*100) : 0, color: '#66bb6a' },
              { label: 'VIBRACIÓN',   value: running ? vibration.reduce((a,b)=>a+b,0)/vibration.length : 0, color: '#ffa726' },
              { label: 'TEMP. RODAM.',value: running ? Math.min(100,(hz/60)*70 + 20) : 15, color: '#42a5f5' },
            ].map(bar => (
              <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#607d8b', fontSize: 6, minWidth: 62 }}>{bar.label}</span>
                <div style={{ flex: 1, height: 5, background: '#111', borderRadius: 2, overflow: 'hidden', border: '1px solid #333' }}>
                  <div style={{
                    height: '100%', width: `${bar.value}%`,
                    background: bar.color,
                    borderRadius: 2,
                    boxShadow: running ? `0 0 4px ${bar.color}` : 'none',
                    transition: 'width 0.5s',
                  }}/>
                </div>
                <span style={{ color: bar.color, fontSize: 6, minWidth: 28, textAlign: 'right', fontFamily: 'monospace' }}>
                  {bar.value.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de valores numéricos (derecha) */}
        <div style={{ width: 110, background: '#0d0d1a', borderLeft: '1px solid #333',
          display: 'flex', flexDirection: 'column', padding: '6px 6px', gap: 3 }}>

          {/* Velocidad principal */}
          <div style={{ background: '#0a1628', border: '1px solid #1565c0', borderRadius: 3, padding: '4px 6px', marginBottom: 2 }}>
            <div style={{ color: '#607d8b', fontSize: 7 }}>VELOCIDAD</div>
            <div style={{ color: running ? '#00e5ff' : '#1a3a4a', fontSize: 20, fontWeight: 'bold',
              textShadow: running ? '0 0 8px #00e5ff' : 'none', textAlign: 'right' }}>
              {running ? hz.toFixed(0) : '--'}
            </div>
            <div style={{ color: '#607d8b', fontSize: 7, textAlign: 'right' }}>Hz</div>
          </div>

          {[
            { label: 'CORRIENTE', value: running ? current.toFixed(1) : '--', unit: 'A',   color: '#ffa726' },
            { label: 'ALIMENTAC.', value: running ? feed.toFixed(0) : '--',   unit: '%',   color: '#66bb6a' },
            { label: 'RPM',        value: running ? (hz*33).toFixed(0):'--',  unit: 'rpm', color: '#ab47bc' },
            { label: 'POTENCIA',   value: running ? (current*0.38*1.73).toFixed(1):'--', unit:'kW', color:'#ef5350' },
            { label: 'CRIBA',      value: '2.0',                              unit: 'mm',  color: '#e0e0e0' },
          ].map(p => (
            <div key={p.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 2, padding: '2px 5px' }}>
              <div style={{ color: '#445', fontSize: 6 }}>{p.label}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: p.color, fontSize: 12, fontWeight: 'bold',
                  textShadow: running ? `0 0 4px ${p.color}44` : 'none' }}>{p.value}</span>
                <span style={{ color: '#445', fontSize: 7 }}>{p.unit}</span>
              </div>
            </div>
          ))}

          {/* Alarmas mini */}
          <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'SOBRECARGA', on: running && current > 40 },
              { label: 'VIBR. ALTA',  on: running && vibration[4] > 80 },
              { label: 'T° RODAMIENTO',on: running && hz > 55 },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%',
                  background: a.on ? '#e53935' : '#333',
                  boxShadow: a.on ? '0 0 4px #e53935' : 'none' }}/>
                <span style={{ color: a.on ? '#e53935' : '#333', fontSize: 6 }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior estado */}
      <div style={{ background: '#0d0d1a', borderTop: '1px solid #333', padding: '2px 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#607d8b', fontSize: 7 }}>9FQ-Series · 22–55 kW · Criba 2mm</span>
        <span style={{ color: running ? '#00e676' : '#e53935', fontSize: 7, fontWeight: 'bold' }}>
          {running ? `▶ MOLIENDO — ${hz} Hz` : '■ EN ESPERA'}
        </span>
      </div>
    </div>
  )
}

// ─── Botón físico 3D ──────────────────────────────────────────────────────────
function Btn3D({ label, color, onClick, active, size = 42 }: {
  label: string; color: 'green' | 'red' | 'yellow' | 'gray' | 'blue'
  onClick: () => void; active?: boolean; size?: number
}) {
  const [pressed, setPressed] = useState(false)
  const palette: Record<string,[string,string,string]> = {
    green:  ['#4ade80','#16a34a','#14532d'],
    red:    ['#f87171','#dc2626','#7f1d1d'],
    yellow: ['#fde047','#ca8a04','#713f12'],
    gray:   ['#9ca3af','#6b7280','#374151'],
    blue:   ['#60a5fa','#2563eb','#1e3a8a'],
  }
  const [top, mid, sh] = palette[color]
  const down = pressed

  const s: CSSProperties = {
    width: size, height: size, borderRadius: 4,
    background: down ? `linear-gradient(180deg,${mid},${sh})` : `linear-gradient(180deg,${top},${mid})`,
    boxShadow: down
      ? `inset 0 3px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1)`
      : `0 5px 0 ${sh}, 0 6px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)`,
    transform: down ? 'translateY(4px)' : 'translateY(0)',
    transition: 'transform 0.06s, box-shadow 0.06s',
    border: `1px solid ${sh}`,
    color: '#fff', fontWeight: 'bold', fontSize: 9, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      {/* LED indicador */}
      {active !== undefined && (
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: active
            ? `radial-gradient(circle at 35% 30%, #fff, ${top} 40%, ${sh})`
            : 'radial-gradient(circle at 35% 30%, #333, #111)',
          boxShadow: active ? `0 0 6px ${top}, 0 0 12px ${top}66` : 'inset 0 1px 2px rgba(0,0,0,0.9)',
          border: '1px solid rgba(0,0,0,0.5)',
        }}/>
      )}
      <button style={s}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onClick() }}
        onMouseLeave={() => setPressed(false)}>
        <span style={{ whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          {label}
        </span>
      </button>
    </div>
  )
}

// ─── Emergencia estilo foto (anillo amarillo) ─────────────────────────────────
function EmergBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 25%, #ffe082, #f9a825 50%, #e65100)',
        padding: 4, boxShadow: '0 4px 10px rgba(0,0,0,0.6), 0 0 0 2px #333',
      }}>
        <button style={{
          width: '100%', height: '100%', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: pressed
            ? 'radial-gradient(circle at 40% 30%, #f87171, #7f1d1d)'
            : 'radial-gradient(circle at 40% 30%, #fca5a5, #dc2626 50%, #7f1d1d)',
          boxShadow: pressed || active
            ? 'inset 0 4px 8px rgba(0,0,0,0.7)'
            : '0 6px 0 #450a0a, 0 7px 12px rgba(0,0,0,0.5)',
          transform: pressed || active ? 'translateY(4px)' : 'translateY(0)',
          transition: 'transform 0.08s, box-shadow 0.08s',
        }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => { setPressed(false); onClick() }}
          onMouseLeave={() => setPressed(false)}>
          <span style={{ color: '#fff', fontSize: 8, fontWeight: 'bold', pointerEvents: 'none' }}>
            {active ? '🔒' : '⚠'}
          </span>
        </button>
      </div>
      <span style={{ color: active ? '#ef4444' : '#555', fontSize: 8, fontWeight: 'bold' }}>
        {active ? 'ACTIVO' : 'EMERGENCIA'}
      </span>
    </div>
  )
}

// ─── Llave selectora ──────────────────────────────────────────────────────────
function KeySwitch({ mode, onChange }: { mode: number; onChange: (v: number) => void }) {
  const modes = ['MAN', 'OFF', 'AUTO']
  const angle = -60 + mode * 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ color: '#555', fontSize: 8 }}>MODO</span>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #aaa, #666 50%, #333)',
        border: '2px solid #222', boxShadow: '0 3px 8px rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }} onClick={() => onChange((mode + 1) % 3)}>
        {/* Llave */}
        <div style={{
          width: 4, height: 16, background: '#f5f5f5', borderRadius: 2,
          transformOrigin: 'bottom center',
          transform: `rotate(${angle}deg)`,
          transition: 'transform 0.2s',
          boxShadow: '0 0 4px rgba(255,255,255,0.4)',
          marginBottom: 6,
        }}/>
      </div>
      <span style={{ color: '#22c55e', fontSize: 10, fontWeight: 'bold' }}>{modes[mode]}</span>
    </div>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function HammerMillPanel({ onClose }: { onClose: () => void }) {
  const { equipment, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.hammer_mill
  const isOn = eq.active

  const [emergency, setEmergency] = useState(false)
  const [modeKey,   setModeKey]   = useState(2)        // 0=MAN,1=OFF,2=AUTO
  const [hz,        setHz]        = useState(45)
  const [feed,      setFeed]      = useState(70)
  const [criba,     setCriba]     = useState(2)         // mm
  const [lubric,    setLubric]    = useState(false)
  const [vibration, setVibration] = useState<number[]>(Array(10).fill(10))

  const current = isOn ? (hz / 60) * 35 + 5 + (Math.random() * 4 - 2) : 0

  // Simular vibración
  useEffect(() => {
    if (!isOn) { setVibration(Array(10).fill(4)); return }
    const id = setInterval(() => {
      setVibration(prev => prev.map((_, i) => {
        const base = [45, 70, 90, 60, 85, 55, 40, 65, 75, 50][i]
        return Math.min(100, Math.max(5, base + (Math.random() - 0.5) * 25))
      }))
    }, 600)
    return () => clearInterval(id)
  }, [isOn])

  const handlePower = () => {
    if (emergency || modeKey === 1) return
    toggleEquipment('hammer_mill')
    if (isOn) setLubric(false)
  }

  const handleEmergency = () => {
    setEmergency(p => {
      if (!p && isOn) toggleEquipment('hammer_mill')
      return !p
    })
  }

  const statusColor = eq.status === 'active' ? '#22c55e'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#ef4444' : '#6b7280'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{
        background: '#2a2a2a',
        border: '4px solid #444',
        borderRadius: 10,
        width: '100%', maxWidth: 520,
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}>

        {/* ── Encabezado ─────────────────────────────────────── */}
        <div style={{ background: '#1a1a1a', padding: '8px 14px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '2px solid #333' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%',
                background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}/>
              <span style={{ color: '#e0e0e0', fontWeight: 'bold', fontSize: 14 }}>
                MOLINO DE MARTILLOS — {eq.model}
              </span>
            </div>
            <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
              {eq.manufacturer} · 22–55 kW · Criba 2 mm
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#666"/>
          </button>
        </div>

        {/* ── Pantalla CNC táctil ─────────────────────────────── */}
        <div style={{ margin: '10px 12px 0',
          border: '6px solid #1a1a1a', borderRadius: 6, overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 0 0 1px #555',
          height: 220,
        }}>
          <CncScreen running={isOn} hz={hz} current={current} feed={feed} vibration={vibration}/>
        </div>

        {/* ── Panel de controles físicos ──────────────────────── */}
        <div style={{ background: '#2a2a2a', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Fila 1: emergencia + llave + arranque/paro */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16,
            background: '#222', borderRadius: 8, padding: '10px 14px',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)' }}>

            <EmergBtn active={emergency} onClick={handleEmergency}/>

            <div style={{ width: 1, height: 52, background: '#444' }}/>

            <KeySwitch mode={modeKey} onChange={setModeKey}/>

            <div style={{ width: 1, height: 52, background: '#444' }}/>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <Btn3D label={'ARRANQUE'} color="green" active={isOn}
                onClick={handlePower} size={48}/>
              <Btn3D label={'PARO'} color="red" active={!isOn}
                onClick={() => { if (isOn && !emergency) toggleEquipment('hammer_mill') }} size={48}/>
              <Btn3D label={'RESET'} color="yellow"
                onClick={() => {}} size={36}/>
            </div>

            <div style={{ width: 1, height: 52, background: '#444' }}/>

            <Btn3D label={'LUBRIC.'} color="blue" active={lubric}
              onClick={() => { if (isOn) setLubric(p => !p) }} size={38}/>
          </div>

          {/* Fila 2: sliders de parámetros */}
          <div style={{ background: '#222', borderRadius: 8, padding: '10px 14px',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)', display: 'flex', gap: 16 }}>

            {/* Frecuencia */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#607d8b', fontSize: 9 }}>FRECUENCIA</span>
                <div style={{ background: '#0d0d1a', border: '1px solid #1565c0', borderRadius: 2,
                  padding: '1px 6px', fontFamily: 'monospace', color: '#00e5ff',
                  fontSize: 13, fontWeight: 'bold', minWidth: 44, textAlign: 'right',
                  textShadow: '0 0 6px #00e5ff' }}>
                  {hz} Hz
                </div>
              </div>
              <input type="range" min={20} max={60} value={hz}
                onChange={e => setHz(parseInt(e.target.value))}
                disabled={!isOn || emergency}
                style={{ accentColor: '#00e5ff', opacity: isOn && !emergency ? 1 : 0.3 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 7 }}>
                <span>20 Hz</span><span>60 Hz</span>
              </div>
            </div>

            <div style={{ width: 1, background: '#333' }}/>

            {/* Alimentación */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#607d8b', fontSize: 9 }}>ALIMENTACIÓN</span>
                <div style={{ background: '#0d0d1a', border: '1px solid #2e7d32', borderRadius: 2,
                  padding: '1px 6px', fontFamily: 'monospace', color: '#66bb6a',
                  fontSize: 13, fontWeight: 'bold', minWidth: 44, textAlign: 'right',
                  textShadow: '0 0 6px #66bb6a' }}>
                  {feed}%
                </div>
              </div>
              <input type="range" min={10} max={100} value={feed}
                onChange={e => setFeed(parseInt(e.target.value))}
                disabled={!isOn || emergency}
                style={{ accentColor: '#66bb6a', opacity: isOn && !emergency ? 1 : 0.3 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: 7 }}>
                <span>10%</span><span>100%</span>
              </div>
            </div>

            <div style={{ width: 1, background: '#333' }}/>

            {/* Criba */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <span style={{ color: '#607d8b', fontSize: 9 }}>CRIBA (mm)</span>
              <div style={{ background: '#0d0d1a', border: '1px solid #6a1b9a', borderRadius: 2,
                padding: '2px 10px', fontFamily: 'monospace', color: '#ab47bc',
                fontSize: 18, fontWeight: 'bold', textShadow: '0 0 8px #ab47bc' }}>
                {criba.toFixed(1)}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 1.5, 2, 3, 4].map(v => (
                  <button key={v} onClick={() => { if (!isOn) setCriba(v) }}
                    style={{ background: criba === v ? '#6a1b9a' : '#333',
                      border: '1px solid #444', borderRadius: 2,
                      color: criba === v ? '#e1bee7' : '#666', fontSize: 8,
                      padding: '2px 4px', cursor: isOn ? 'not-allowed' : 'pointer',
                      opacity: isOn ? 0.5 : 1 }}>
                    {v}
                  </button>
                ))}
              </div>
              <span style={{ color: '#444', fontSize: 7 }}>*cambiar solo parado</span>
            </div>
          </div>
        </div>

        {/* ── Barra de estado ─────────────────────────────────── */}
        <div style={{ background: '#111', borderTop: '1px solid #333', padding: '6px 14px',
          display: 'flex', gap: 14, justifyContent: 'space-around' }}>
          {[
            { label: 'Frecuencia', value: isOn ? `${hz} Hz`                     : '--',   color: '#00e5ff' },
            { label: 'Corriente',  value: isOn ? `${current.toFixed(1)} A`       : '--',   color: '#ffa726' },
            { label: 'Alimentac.', value: isOn ? `${feed}%`                      : '--',   color: '#66bb6a' },
            { label: 'Criba',      value: `${criba} mm`,                                   color: '#ab47bc' },
            { label: 'Modo',       value: ['MAN','OFF','AUTO'][modeKey],                   color: '#90caf9' },
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
