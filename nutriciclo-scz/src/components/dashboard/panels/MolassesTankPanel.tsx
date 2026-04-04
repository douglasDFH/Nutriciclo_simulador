import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta verde oliva ───────────────────────────────────────────────────────
const OLIVE      = '#4a5a3a'
const OLIVE_DARK = '#3a4a2a'
const OLIVE_LITE = '#5a6a4a'
const BEZEL      = '#1a1a1a'

// ─── Pantalla HMI del tanque ──────────────────────────────────────────────────
function TankHmi({ isOn, level, temp, pumpOn, agitOn, flowRate }: {
  isOn: boolean; level: number; temp: number
  pumpOn: boolean; agitOn: boolean; flowRate: number
}) {
  const levelColor = level < 15 ? '#ef4444' : level < 30 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1f2e',
      display: 'flex', flexDirection: 'column', fontFamily: "'Courier New',monospace", overflow: 'hidden' }}>

      {/* Barra de título */}
      <div style={{ background: '#0d1117', padding: '2px 8px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2d3748' }}>
        <span style={{ color: '#90caf9', fontSize: 8, fontWeight: 'bold' }}>TANQUE MELAZA TCI-2000</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%',
            background: isOn ? '#22c55e' : '#ef4444',
            boxShadow: isOn ? '0 0 4px #22c55e' : 'none' }}/>
          <span style={{ color: isOn ? '#22c55e' : '#ef4444', fontSize: 7 }}>
            {isOn ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
        <span style={{ color: '#444', fontSize: 7 }}>{new Date().toTimeString().slice(0,8)}</span>
      </div>

      {/* Cuerpo principal */}
      <div style={{ flex: 1, display: 'flex', gap: 0, padding: 6, overflow: 'hidden' }}>

        {/* Diagrama del tanque */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 120 160" style={{ width: 90, height: 130 }}>
            <defs>
              <linearGradient id="tank_wall" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#546e7a"/>
                <stop offset="40%" stopColor="#37474f"/>
                <stop offset="100%" stopColor="#263238"/>
              </linearGradient>
              <linearGradient id="molasses_grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a017" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#7c4f00" stopOpacity="1"/>
              </linearGradient>
              <clipPath id="tank_clip">
                <rect x="18" y="18" width="84" height="106" rx="4"/>
              </clipPath>
            </defs>

            {/* Cuerpo tanque */}
            <rect x="16" y="16" width="88" height="110" rx="6"
              fill="url(#tank_wall)" stroke="#607d8b" strokeWidth="2"/>

            {/* Nivel de melaza */}
            <rect x="18" y={18 + 106 * (1 - level/100)} width="84"
              height={106 * (level/100)} fill="url(#molasses_grad)"
              clipPath="url(#tank_clip)" style={{ transition: 'all 0.8s ease' }}/>

            {/* Líneas de nivel */}
            {[25, 50, 75].map(p => (
              <g key={p}>
                <line x1="18" y1={18 + 106*(1-p/100)} x2="22" y2={18 + 106*(1-p/100)}
                  stroke="#607d8b" strokeWidth="0.8"/>
                <line x1="98" y1={18 + 106*(1-p/100)} x2="102" y2={18 + 106*(1-p/100)}
                  stroke="#607d8b" strokeWidth="0.8"/>
                <text x="4" y={22 + 106*(1-p/100)} fill="#607d8b" fontSize="5">{p}%</text>
              </g>
            ))}

            {/* Agitador (si activo) */}
            {agitOn && isOn && <>
              <line x1="60" y1="18" x2="60" y2="80" stroke="#888" strokeWidth="1.5"/>
              {[-18, 0, 18].map(dy => (
                <line key={dy} x1="42" y1={75+dy} x2="78" y2={75+dy}
                  stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
              ))}
            </>}

            {/* Rebosadero / nivel HIGH */}
            <line x1="16" y1="24" x2="104" y2="24" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,2"/>
            <text x="106" y="27" fill="#ef4444" fontSize="4">MAX</text>

            {/* Nivel LOW */}
            <line x1="16" y1="116" x2="104" y2="116" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3,2"/>
            <text x="106" y="119" fill="#f59e0b" fontSize="4">MIN</text>

            {/* Indicador nivel numérico */}
            <rect x="28" y="58" width="44" height="14" rx="2" fill="#0d0d0d" stroke="#333"/>
            <text x="50" y="68" fill={levelColor} fontSize="10" textAnchor="middle"
              fontWeight="bold" style={{ filter: isOn ? `drop-shadow(0 0 2px ${levelColor})` : 'none' }}>
              {level.toFixed(0)}%
            </text>

            {/* Válvula de descarga */}
            <rect x="48" y="126" width="24" height="8" rx="2" fill="#546e7a" stroke="#607d8b" strokeWidth="1"/>
            <line x1="60" y1="134" x2="60" y2="145" stroke="#607d8b" strokeWidth="2"/>
            <text x="60" y="155" fill="#888" fontSize="5" textAnchor="middle">DESCARGA</text>

            {/* Calentador */}
            <rect x="18" y="100" width="12" height="24" rx="2" fill="#bf360c" stroke="#ff5722" strokeWidth="0.8"
              opacity={isOn ? 1 : 0.4}/>
            <text x="24" y="130" fill="#ff8a65" fontSize="4" textAnchor="middle">HEAT</text>
          </svg>
        </div>

        {/* Panel de datos */}
        <div style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Nivel */}
          <div style={{ background: '#0d1117', border: `1px solid ${levelColor}44`,
            borderRadius: 3, padding: '4px 6px' }}>
            <div style={{ color: '#607d8b', fontSize: 7 }}>NIVEL TANQUE</div>
            <div style={{ color: levelColor, fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace',
              textShadow: `0 0 6px ${levelColor}` }}>
              {level.toFixed(1)}<span style={{ fontSize: 11 }}>%</span>
            </div>
            <div style={{ height: 4, background: '#111', borderRadius: 2, overflow: 'hidden', border: '1px solid #333' }}>
              <div style={{ height: '100%', width: `${level}%`,
                background: levelColor, transition: 'width 0.5s',
                boxShadow: `0 0 4px ${levelColor}` }}/>
            </div>
          </div>

          {/* Temperatura */}
          <div style={{ background: '#0d1117', border: '1px solid #f9730022',
            borderRadius: 3, padding: '4px 6px' }}>
            <div style={{ color: '#607d8b', fontSize: 7 }}>TEMPERATURA</div>
            <div style={{ color: '#f97316', fontSize: 18, fontWeight: 'bold', fontFamily: 'monospace',
              textShadow: '0 0 6px #f97316' }}>
              {isOn ? temp.toFixed(1) : '--.-'}<span style={{ fontSize: 9, opacity: 0.7 }}> °C</span>
            </div>
          </div>

          {/* Caudal */}
          <div style={{ background: '#0d1117', border: '1px solid #3b82f622',
            borderRadius: 3, padding: '4px 6px' }}>
            <div style={{ color: '#607d8b', fontSize: 7 }}>CAUDAL SALIDA</div>
            <div style={{ color: '#60a5fa', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace',
              textShadow: '0 0 5px #60a5fa' }}>
              {isOn && pumpOn ? flowRate.toFixed(1) : '0.0'}<span style={{ fontSize: 9, opacity: 0.7 }}> L/h</span>
            </div>
          </div>

          {/* Estado subsistemas */}
          <div style={{ background: '#0d1117', border: '1px solid #333',
            borderRadius: 3, padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { label: 'BOMBA',     on: pumpOn && isOn, color: '#22c55e' },
              { label: 'AGITADOR', on: agitOn && isOn, color: '#a78bfa' },
              { label: 'CALEFAC.', on: isOn && temp < 45, color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#607d8b', fontSize: 7 }}>{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%',
                    background: s.on ? s.color : '#333',
                    boxShadow: s.on ? `0 0 5px ${s.color}` : 'none' }}/>
                  <span style={{ color: s.on ? s.color : '#555', fontSize: 7, fontWeight: 'bold' }}>
                    {s.on ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alarmas */}
          {(level < 15 || level > 95 || temp > 70) && (
            <div style={{ background: '#2d0000', border: '1px solid #ef4444',
              borderRadius: 3, padding: '3px 6px' }}>
              <div style={{ color: '#ef4444', fontSize: 7, fontWeight: 'bold' }}>⚠ ALARMA</div>
              {level < 15 && <div style={{ color: '#fca5a5', fontSize: 6 }}>Nivel bajo — rellenar</div>}
              {level > 95 && <div style={{ color: '#fca5a5', fontSize: 6 }}>Nivel máximo</div>}
              {temp > 70 && <div style={{ color: '#fca5a5', fontSize: 6 }}>Temperatura alta</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Gran selector rotatorio dorado ──────────────────────────────────────────
function BrassSelector({ options, value, onChange }: {
  options: string[]; value: number; onChange: (v: number) => void
}) {
  const n     = options.length
  const angle = -135 + (value / (n - 1)) * 270

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Placa de etiquetas */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        {/* Anillo exterior cromado */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 25%, #e8d5a3, #c9a227 40%, #8b6914 70%, #5a4008)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }} onClick={() => onChange((value + 1) % n)}>
          {/* Cuerpo interior */}
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #d4aa3c, #a07820 50%, #7c5a10)',
            border: '2px solid #8b6914',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Indicador / flecha */}
            <div style={{
              width: 4, height: 20,
              background: 'linear-gradient(180deg, #fff, #ddd)',
              borderRadius: 2,
              transformOrigin: 'bottom center',
              transform: `rotate(${angle}deg)`,
              transition: 'transform 0.25s',
              marginBottom: 10,
              boxShadow: '0 0 4px rgba(255,255,255,0.6)',
            }}/>
          </div>
          {/* Marcas alrededor */}
          {options.map((_, i) => {
            const a2 = ((-135 + (i/(n-1))*270) * Math.PI) / 180
            const rx = 34, ry = 34
            return (
              <div key={i} style={{
                position: 'absolute',
                left: 40 + rx * Math.sin(a2) - 1.5,
                top:  40 - ry * Math.cos(a2) - 1.5,
                width: 3, height: 3, borderRadius: '50%',
                background: i === value ? '#fff' : '#8b6914',
              }}/>
            )
          })}
        </div>
      </div>
      {/* Etiquetas */}
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map((o, i) => (
          <span key={o} style={{
            color: i === value ? '#ffd54f' : '#6b7280',
            fontSize: 8, fontWeight: i === value ? 'bold' : 'normal',
          }}>{o}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Botón naranja/ámbar estilo foto ─────────────────────────────────────────
function AmberBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  const s: CSSProperties = {
    width: 36, height: 28, borderRadius: 3,
    background: pressed
      ? 'linear-gradient(180deg, #b45309, #7c3a00)'
      : active
        ? 'linear-gradient(180deg, #fbbf24, #d97706)'
        : 'linear-gradient(180deg, #f97316, #c2410c)',
    boxShadow: pressed
      ? 'inset 0 3px 5px rgba(0,0,0,0.6)'
      : active
        ? '0 3px 0 #92400e, 0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
        : '0 3px 0 #7c2d12, 0 4px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    transform: pressed ? 'translateY(2px)' : 'translateY(0)',
    transition: 'transform 0.06s, box-shadow 0.06s',
    border: '1px solid #7c2d12',
    color: '#fff', fontSize: 7, fontWeight: 'bold',
    cursor: 'pointer', userSelect: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%',
        background: active ? 'radial-gradient(circle at 35% 30%, #fff, #fbbf24 40%, #92400e)' : 'radial-gradient(circle at 35% 30%, #333, #111)',
        boxShadow: active ? '0 0 5px #fbbf24' : 'inset 0 1px 2px rgba(0,0,0,0.8)',
        border: '1px solid rgba(0,0,0,0.4)' }}/>
      <button style={s}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => { setPressed(false); onClick() }}
        onMouseLeave={() => setPressed(false)}>
        {label}
      </button>
    </div>
  )
}

// ─── Emergencia ───────────────────────────────────────────────────────────────
function EmergBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 25%, #ffe082, #f9a825 50%, #e65100)',
        padding: 4, boxShadow: '0 4px 10px rgba(0,0,0,0.6), 0 0 0 2px #2a2a00' }}>
        <button style={{
          width: '100%', height: '100%', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: pressed ? 'radial-gradient(circle at 40% 30%, #f87171, #7f1d1d)'
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
      <span style={{ color: active ? '#ef4444' : '#6b7280', fontSize: 8, fontWeight: active ? 'bold' : 'normal' }}>
        {active ? 'ACTIVO' : 'EMERGENCIA'}
      </span>
    </div>
  )
}

// ─── Etiqueta de advertencia ──────────────────────────────────────────────────
function WarningLabel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{
        width: 38, height: 38, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        background: 'linear-gradient(180deg, #fbbf24, #f59e0b)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4,
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      }}>
        <span style={{ color: '#1a1a00', fontSize: 14, fontWeight: 'black', lineHeight: 1 }}>!</span>
      </div>
      <span style={{ color: '#f59e0b', fontSize: 7, textAlign: 'center', letterSpacing: 0.3 }}>
        ALTA<br/>TENSIÓN
      </span>
    </div>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function MolassesTankPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.molasses_tank
  const isOn = eq.active

  const [emergency,  setEmergency]  = useState(false)
  const [selectorIdx,setSelectorIdx]= useState(1)   // 0=MAN, 1=AUTO, 2=DREN.
  const [pumpOn,     setPumpOn]     = useState(false)
  const [agitOn,     setAgitOn]     = useState(false)
  const [heatOn,     setHeatOn]     = useState(false)
  const [valvDesc,   setValvDesc]   = useState(false)
  const [level,      setLevel]      = useState(72.5)
  const [tempMelaza, setTempMelaza] = useState(42)

  // Simular nivel y temperatura
  useEffect(() => {
    if (!isOn) return
    const id = setInterval(() => {
      // Si bomba descarga, nivel baja
      setLevel(prev => {
        const delta = pumpOn ? -0.15 : valvDesc ? 0.05 : 0
        return Math.max(0, Math.min(100, prev + delta))
      })
      // Temperatura fluctúa
      setTempMelaza(prev => {
        const target = heatOn ? 55 : 38
        return prev + (target - prev) * 0.05 + (Math.random() - 0.5) * 0.3
      })
    }, 800)
    return () => clearInterval(id)
  }, [isOn, pumpOn, valvDesc, heatOn])

  const flowRate = sensors.molassesFlowActual

  const handlePower = () => {
    if (emergency) return
    toggleEquipment('molasses_tank')
    if (isOn) { setPumpOn(false); setAgitOn(false); setHeatOn(false); setValvDesc(false) }
  }

  const handleEmergency = () => {
    setEmergency(p => {
      if (!p && isOn) toggleEquipment('molasses_tank')
      return !p
    })
    setPumpOn(false); setAgitOn(false)
  }

  const canOp = isOn && !emergency

  const statusColor = eq.status === 'active' ? '#22c55e'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#ef4444' : '#6b7280'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <div style={{
        background: OLIVE,
        border: '5px solid #3a4a2a',
        borderRadius: 8,
        width: '100%', maxWidth: 500,
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
      }}>

        {/* ── Encabezado (tornillos de panel) ───────────────────── */}
        <div style={{ background: OLIVE_DARK, padding: '8px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `2px solid #2a3a1a` }}>
          {/* Tornillo izquierdo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #bbb, #666 50%, #333)',
              border: '1px solid #222', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}/>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor,
                  boxShadow: `0 0 6px ${statusColor}` }}/>
                <span style={{ color: '#d4d8cc', fontWeight: 'bold', fontSize: 13 }}>
                  TANQUE ALMACENAMIENTO MELAZA
                </span>
              </div>
              <div style={{ color: '#8a9a7a', fontSize: 10, marginTop: 1 }}>
                {eq.manufacturer} · {eq.model} · 1000–5000 L
              </div>
            </div>
          </div>
          {/* Tornillo derecho + cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #bbb, #666 50%, #333)',
              border: '1px solid #222' }}/>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#8a9a7a"/>
            </button>
          </div>
        </div>

        {/* ── Pantalla HMI ───────────────────────────────────────── */}
        <div style={{ margin: '10px 14px 0',
          border: '5px solid ' + BEZEL, borderRadius: 5, overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 0 0 1px #555',
          height: 180 }}>
          <TankHmi isOn={isOn} level={level} temp={tempMelaza}
            pumpOn={pumpOn} agitOn={agitOn} flowRate={flowRate}/>
        </div>

        {/* ── Zona de controles físicos ──────────────────────────── */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Fila principal: emergencia + selector + advertencia */}
          <div style={{ background: OLIVE_DARK, borderRadius: 8, padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}>

            <EmergBtn active={emergency} onClick={handleEmergency}/>

            <BrassSelector
              options={['MAN', 'AUTO', 'DREN.']}
              value={selectorIdx}
              onChange={setSelectorIdx}
            />

            <WarningLabel/>
          </div>

          {/* Fila de botones naranjas + principales */}
          <div style={{ background: OLIVE_DARK, borderRadius: 8, padding: '10px 14px',
            display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)' }}>

            {/* Encender / Apagar */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: isOn?'APAGAR':'ENCEND.', action: handlePower,
                  bg: isOn ? '#dc2626' : '#16a34a', sh: isOn ? '#7f1d1d' : '#14532d' },
              ].map(b => {
                const [pressed, setPr] = [false, () => {}]
                return (
                  <button key={b.label}
                    style={{ background: b.bg, color: '#fff', border: `1px solid ${b.sh}`,
                      borderRadius: 4, padding: '6px 12px', fontWeight: 'bold', fontSize: 10,
                      cursor: 'pointer', boxShadow: `0 3px 0 ${b.sh}, 0 4px 6px rgba(0,0,0,0.4)` }}
                    onClick={b.action}>{b.label}</button>
                )
              })}
            </div>

            <div style={{ width: 1, height: 40, background: '#3a4a2a' }}/>

            {/* Botones ámbar subsistemas */}
            <AmberBtn label={'BOMBA\nON'}    active={pumpOn}
              onClick={() => { if (canOp) setPumpOn(p => !p) }} />
            <AmberBtn label={'AGIT.\nON'}    active={agitOn}
              onClick={() => { if (canOp) setAgitOn(p => !p) }} />
            <AmberBtn label={'CALEF.\nON'}   active={heatOn}
              onClick={() => { if (canOp) setHeatOn(p => !p) }} />
            <AmberBtn label={'VÁLV.\nDESC.'} active={valvDesc}
              onClick={() => { if (canOp) setValvDesc(p => !p) }} />
            <AmberBtn label={'RESET\nAL.'}   active={false}
              onClick={() => {}} />
          </div>
        </div>

        {/* ── Barra inferior ─────────────────────────────────────── */}
        <div style={{ background: OLIVE_DARK, padding: '6px 14px', borderTop: `1px solid #2a3a1a`,
          display: 'flex', gap: 12, justifyContent: 'space-around' }}>
          {[
            { label: 'Nivel',      value: `${level.toFixed(1)} %`,                                color: level < 20 ? '#ef4444' : '#22c55e' },
            { label: 'Temp.',      value: `${isOn ? tempMelaza.toFixed(1) : '--'} °C`,           color: '#f97316' },
            { label: 'Caudal',     value: `${isOn && pumpOn ? flowRate.toFixed(1) : '0.0'} L/h`, color: '#60a5fa' },
            { label: 'Selector',   value: ['MAN','AUTO','DREN.'][selectorIdx],                    color: '#ffd54f' },
            { label: 'Bomba',      value: pumpOn && isOn ? 'ON' : 'OFF',                          color: pumpOn && isOn ? '#22c55e' : '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#6a7a5a', fontSize: 8 }}>{s.label}</div>
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
