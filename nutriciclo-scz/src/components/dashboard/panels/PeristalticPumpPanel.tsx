import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Display LCD 7-segmentos ──────────────────────────────────────────────────
function LcdDisplay({ value, unit, active }: { value: string; unit: string; active: boolean }) {
  return (
    <div style={{
      background: active ? '#c8d8b0' : '#9aab88',
      border: '2px solid #5a6a48',
      borderRadius: 4,
      padding: '6px 10px',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      minWidth: 100,
    }}>
      {/* Valor principal */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 4,
        color: active ? '#1a2800' : '#4a5a38',
        textShadow: active ? '0 1px 0 rgba(255,255,255,0.2)' : 'none',
        lineHeight: 1,
      }}>{active ? value : '--'}</div>
      {/* Unidad */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 10,
        color: active ? '#3a4a28' : '#6a7a58',
        letterSpacing: 1,
        marginTop: 2,
      }}>{unit}</div>
      {/* Barra de progreso estilo LCD */}
      <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{
            width: 7, height: 4,
            background: active && i < Math.floor(parseFloat(value) / 10)
              ? '#2d4010'
              : '#8a9a78',
            borderRadius: 1,
          }}/>
        ))}
      </div>
    </div>
  )
}

// ─── Botón cuadrado estilo panel ProMinent ────────────────────────────────────
function PanelBtn({ label, color, active, onClick, size = 34 }: {
  label: string; color: 'orange' | 'blue' | 'gray' | 'green' | 'red'
  active?: boolean; onClick: () => void; size?: number
}) {
  const [pressed, setPressed] = useState(false)

  const palette: Record<string, { top: string; mid: string; sh: string }> = {
    orange: { top: '#fb923c', mid: '#ea580c', sh: '#7c2d12' },
    blue:   { top: '#60a5fa', mid: '#2563eb', sh: '#1e3a8a' },
    gray:   { top: '#d1d5db', mid: '#9ca3af', sh: '#4b5563' },
    green:  { top: '#4ade80', mid: '#16a34a', sh: '#14532d' },
    red:    { top: '#f87171', mid: '#dc2626', sh: '#7f1d1d' },
  }
  const { top, mid, sh } = palette[color]

  const s: CSSProperties = {
    width: size, height: size,
    background: pressed
      ? `linear-gradient(180deg,${mid},${sh})`
      : `linear-gradient(160deg,${top},${mid})`,
    boxShadow: pressed
      ? `inset 0 3px 5px rgba(0,0,0,0.6)`
      : `0 3px 0 ${sh}, 0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
    transform: pressed ? 'translateY(2px)' : 'translateY(0)',
    transition: 'transform 0.06s, box-shadow 0.06s',
    border: `1px solid ${sh}`,
    borderRadius: 4,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 8,
    cursor: 'pointer',
    userSelect: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: active ? `2px solid rgba(255,255,255,0.6)` : 'none',
  }

  return (
    <button style={s}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick() }}
      onMouseLeave={() => setPressed(false)}>
      <span style={{ whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.8)', pointerEvents: 'none' }}>
        {label}
      </span>
    </button>
  )
}

// ─── LED indicador con etiqueta ───────────────────────────────────────────────
function StatusLed({ label, on, color = 'green' }: {
  label: string; on: boolean; color?: 'green' | 'amber' | 'red' | 'blue'
}) {
  const c = {
    green: { on: 'radial-gradient(circle at 35% 30%,#bbf7d0,#22c55e 40%,#15803d)', glow: '#22c55e' },
    amber: { on: 'radial-gradient(circle at 35% 30%,#fef08a,#f59e0b 40%,#b45309)', glow: '#f59e0b' },
    red:   { on: 'radial-gradient(circle at 35% 30%,#fca5a5,#ef4444 40%,#7f1d1d)', glow: '#ef4444' },
    blue:  { on: 'radial-gradient(circle at 35% 30%,#bfdbfe,#3b82f6 40%,#1e3a8a)', glow: '#3b82f6' },
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: on ? c[color].on : 'radial-gradient(circle at 35% 30%,#444,#111)',
        boxShadow: on ? `0 0 6px ${c[color].glow}, 0 0 12px ${c[color].glow}44` : 'inset 0 1px 2px rgba(0,0,0,0.8)',
        border: '1px solid rgba(0,0,0,0.5)',
        flexShrink: 0,
      }}/>
      <span style={{ color: on ? '#e0e0e0' : '#666', fontSize: 9, fontWeight: on ? 'bold' : 'normal', letterSpacing: 0.5 }}>
        {label}
      </span>
    </div>
  )
}

// ─── Perilla/potenciómetro grande ─────────────────────────────────────────────
function SpeedKnob({ value, onChange, disabled }: {
  value: number; onChange: (v: number) => void; disabled: boolean
}) {
  const angle = -135 + (value / 100) * 270

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <span style={{ color: '#888', fontSize: 8, letterSpacing: 0.5 }}>VELOCIDAD</span>

      {/* Plato exterior */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 28%, #e0e0e0, #bbb 40%, #888 70%, #555)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
        border: '2px solid #444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}>
        {/* Marcas de graduación */}
        {Array.from({ length: 11 }, (_, i) => {
          const pct = i / 10
          const a = ((-135 + pct * 270) * Math.PI) / 180
          const r = 27
          return (
            <div key={i} style={{
              position: 'absolute',
              left: 32 + r * Math.sin(a) - 1,
              top:  32 - r * Math.cos(a) - 1,
              width: i % 5 === 0 ? 3 : 2,
              height: i % 5 === 0 ? 3 : 2,
              borderRadius: '50%',
              background: i % 5 === 0 ? '#333' : '#666',
            }}/>
          )
        })}

        {/* Cuerpo interior de la perilla */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #ccc, #888 50%, #555)',
          border: '1px solid #333',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => { if (!disabled) onChange(Math.min(100, value + 5)) }}>
          {/* Indicador */}
          <div style={{
            width: 3, height: 16,
            background: 'linear-gradient(180deg, #fff, #ccc)',
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.15s',
            marginBottom: 8,
            boxShadow: '0 0 4px rgba(255,255,255,0.5)',
          }}/>
        </div>
      </div>

      {/* Valor numérico */}
      <div style={{
        background: '#0a0a0a', border: '1px solid #333', borderRadius: 3,
        padding: '2px 8px', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
        color: disabled ? '#333' : '#00e5ff',
        textShadow: disabled ? 'none' : '0 0 5px #00e5ff',
      }}>{value}%</div>

      {/* Slider fino */}
      <input type="range" min={0} max={100} value={value}
        onChange={e => { if (!disabled) onChange(parseInt(e.target.value)) }}
        disabled={disabled}
        style={{ width: 60, accentColor: '#00e5ff', opacity: disabled ? 0.3 : 1 }}/>
    </div>
  )
}

// ─── Logo ProMinent ───────────────────────────────────────────────────────────
function BrandLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #f87171, #dc2626 50%, #7f1d1d)',
        border: '1px solid #450a0a',
        boxShadow: '0 0 6px #dc262644',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#fff', fontSize: 6, fontWeight: 'black' }}>P</span>
      </div>
      <div>
        <div style={{ color: '#555', fontSize: 8, fontWeight: 'bold', letterSpacing: 1 }}>ProMinent</div>
        <div style={{ color: '#777', fontSize: 6 }}>DULCOFLEX DFYa</div>
      </div>
    </div>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function PeristalticPumpPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.peristaltic_pump
  const isOn = eq.active

  const [speed,      setSpeed]      = useState(60)
  const [isManual,   setIsManual]   = useState(false)
  const [setpointPct,setSetpointPct]= useState(60)
  const [alarm,      setAlarm]      = useState(false)
  const [balanced,   setBalanced]   = useState(false)
  const [activeGreen,setActiveGreen]= useState(false)
  const [strokeLen,  setStrokeLen]  = useState(80)  // % stroke length
  const [direction,  setDirection]  = useState<'FWD'|'REV'>('FWD')

  const flowL = sensors.molassesFlowActual
  const displayVal = isOn ? flowL.toFixed(0) : '0'

  // LED activo pulsante
  useEffect(() => {
    if (!isOn) { setActiveGreen(false); return }
    const id = setInterval(() => setActiveGreen(p => !p), 700)
    return () => clearInterval(id)
  }, [isOn])

  // Alarma si flujo 0 con bomba activa
  useEffect(() => {
    if (isOn && flowL < 0.5) setAlarm(true)
    else setAlarm(false)
  }, [isOn, flowL])

  const handlePower = () => {
    toggleEquipment('peristaltic_pump')
    if (isOn) setBalanced(false)
  }

  const canOp = isOn

  const statusColor = eq.status === 'active' ? '#22c55e'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#ef4444' : '#6b7280'

  // Tamaño carcasa
  const W = 480

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>

      {/* Carcasa exterior IP65 */}
      <div style={{
        background: '#d4d8dc',
        border: '4px solid #b0b8c0',
        borderRadius: 10,
        width: '100%', maxWidth: W,
        boxShadow: `
          0 30px 80px rgba(0,0,0,0.9),
          inset 0 1px 0 rgba(255,255,255,0.6),
          inset 0 -1px 0 rgba(0,0,0,0.2)
        `,
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Tornillos de esquina */}
        {[{t:6,l:6},{t:6,r:6},{b:6,l:6},{b:6,r:6}].map((pos,i) => (
          <div key={i} style={{
            position: 'absolute',
            top: (pos as any).t, bottom: (pos as any).b,
            left: (pos as any).l, right: (pos as any).r,
            width: 14, height: 14, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #888, #444 50%, #222)',
            border: '1px solid #111',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
            zIndex: 10,
          }}>
            {/* Ranura */}
            <div style={{ position: 'absolute', top: 6, left: 2, right: 2, height: 1.5, background: '#222', borderRadius: 1 }}/>
          </div>
        ))}

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div style={{ background: '#b8bec4', padding: '7px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '2px solid #9aa0a6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}/>
            <span style={{ color: '#333', fontWeight: 'bold', fontSize: 13 }}>
              BOMBA PERISTÁLTICA — {eq.model}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#666', fontSize: 10 }}>{eq.manufacturer}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#666"/>
            </button>
          </div>
        </div>

        {/* ── Cuerpo: dos secciones ───────────────────────────────── */}
        <div style={{ display: 'flex', padding: '14px 16px', gap: 14 }}>

          {/* ── SECCIÓN IZQUIERDA: controlador + botones ────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sub-panel del controlador (con tapa transparente simulada) */}
            <div style={{
              background: '#c8cdd1',
              border: '3px solid #999',
              borderRadius: 6,
              padding: 10,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.7)',
            }}>
              {/* Logo + LED activo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <BrandLogo/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: activeGreen
                      ? 'radial-gradient(circle at 35% 30%,#bbf7d0,#22c55e 40%,#15803d)'
                      : 'radial-gradient(circle at 35% 30%,#333,#111)',
                    boxShadow: activeGreen ? '0 0 8px #22c55e, 0 0 16px #22c55e66' : 'inset 0 1px 2px rgba(0,0,0,0.8)',
                    border: '1px solid rgba(0,0,0,0.4)',
                    transition: 'all 0.3s',
                  }}/>
                  <span style={{ color: activeGreen ? '#22c55e' : '#555', fontSize: 8, fontWeight: 'bold' }}>
                    {isOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Display LCD */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <LcdDisplay value={displayVal} unit="L / h" active={isOn}/>
              </div>

              {/* Grid de botones naranja/azul */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
                {/* Fila 1 */}
                <PanelBtn label="▲" color="orange" onClick={() => { if(canOp) setSetpointPct(p=>Math.min(100,p+5)) }}/>
                <PanelBtn label="▼" color="orange" onClick={() => { if(canOp) setSetpointPct(p=>Math.max(0,p-5)) }}/>
                <PanelBtn label="FWD" color="blue" active={direction==='FWD'} onClick={() => { if(canOp) setDirection('FWD') }}/>
                <PanelBtn label="REV" color="blue" active={direction==='REV'} onClick={() => { if(canOp) setDirection('REV') }}/>
                {/* Fila 2 */}
                <PanelBtn label="MAN" color="orange" active={isManual} onClick={() => setIsManual(p=>!p)}/>
                <PanelBtn label="AUTO" color="blue" active={!isManual} onClick={() => setIsManual(false)}/>
                <PanelBtn label="SET" color="gray" onClick={() => {}}/>
                <PanelBtn label="CLR" color="gray" onClick={() => setAlarm(false)}/>
                {/* Fila 3 */}
                <PanelBtn label={isOn?'STOP':'START'} color={isOn?'red':'green'} active={isOn}
                  onClick={handlePower} size={34}/>
                <PanelBtn label="PRIME" color="orange" onClick={() => { if(canOp) {} }}/>
                <PanelBtn label="CAL" color="blue" onClick={() => { if(canOp) setBalanced(true) }}/>
                <PanelBtn label="INFO" color="gray" onClick={() => {}}/>
              </div>

              {/* Stroke length */}
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 8 }}>
                  <span>LONGITUD CARRERA</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#333' }}>{strokeLen}%</span>
                </div>
                <input type="range" min={10} max={100} value={strokeLen}
                  onChange={e => { if(canOp) setStrokeLen(parseInt(e.target.value)) }}
                  disabled={!canOp}
                  style={{ accentColor: '#ea580c', opacity: canOp ? 1 : 0.4 }}/>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN DERECHA: perilla + LEDs ─────────────────── */}
          <div style={{ width: 110, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 14 }}>

            {/* Perilla de velocidad */}
            <SpeedKnob value={speed} onChange={setSpeed} disabled={!canOp}/>

            <div style={{ width: '100%', height: 1, background: '#bbb' }}/>

            {/* LEDs de estado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <StatusLed label="ALARMA"  on={alarm}           color="red"/>
              <StatusLed label="MANUAL"  on={isManual}        color="amber"/>
              <StatusLed label="ACTIVO"  on={isOn}            color="green"/>
              <StatusLed label="BALANCE" on={balanced && isOn} color="blue"/>
            </div>

            {/* Setpoint display */}
            <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 4,
              padding: '4px 8px', width: '100%', textAlign: 'center' }}>
              <div style={{ color: '#666', fontSize: 7 }}>SETPOINT</div>
              <div style={{ color: '#f97316', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
                textShadow: '0 0 5px #f97316' }}>{setpointPct}%</div>
            </div>
          </div>
        </div>

        {/* ── Barra de estado ─────────────────────────────────────── */}
        <div style={{ background: '#b0b6bc', padding: '6px 16px', borderTop: '2px solid #9aa0a6',
          display: 'flex', gap: 12, justifyContent: 'space-around' }}>
          {[
            { label: 'Caudal',    value: `${isOn ? flowL.toFixed(1) : '0.0'} L/h`,  color: '#1565c0' },
            { label: 'Velocidad', value: `${isOn ? speed : 0}%`,                     color: '#f97316' },
            { label: 'Setpoint',  value: `${setpointPct}%`,                           color: '#7c3aed' },
            { label: 'Dirección', value: direction,                                   color: isOn ? '#22c55e' : '#6b7280' },
            { label: 'Carrera',   value: `${strokeLen}%`,                             color: '#0891b2' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#777', fontSize: 8 }}>{s.label}</div>
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
