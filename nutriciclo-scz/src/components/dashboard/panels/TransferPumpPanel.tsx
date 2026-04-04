import { useState, useEffect, CSSProperties } from 'react'
import { X } from 'lucide-react'
import { useSimulatorStore } from '../../../store/useSimulatorStore'

// ─── Paleta SCADA Windows XP / InTouch ───────────────────────────────────────
const WIN_BG    = '#d4d0c8'
const WIN_PANEL = '#ece9e0'
const WIN_DARK  = '#808080'
const WIN_BLUE  = '#1f3a6e'
const WIN_TITLE = '#0a246a'

// ─── Utilidades de estilo Windows 3D ─────────────────────────────────────────
const win3D: CSSProperties = {
  boxShadow: 'inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf',
}
const winSunken: CSSProperties = {
  boxShadow: 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf',
}

// ─── Display 7 segmentos tipo contador ───────────────────────────────────────
function SevenSeg({ value, digits = 7, color = '#ff2200' }: {
  value: number; digits?: number; color?: string
}) {
  const str = String(Math.floor(value)).padStart(digits, '0')
  return (
    <div style={{
      background: '#0a0a0a',
      border: '2px inset #555',
      borderRadius: 3,
      padding: '4px 8px',
      display: 'flex', gap: 1,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
    }}>
      {str.split('').map((d, i) => (
        <span key={i} style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 20,
          fontWeight: 'bold',
          color: color,
          textShadow: `0 0 6px ${color}, 0 0 12px ${color}66`,
          letterSpacing: 0,
          lineHeight: 1,
          minWidth: 13,
          textAlign: 'center',
        }}>{d}</span>
      ))}
    </div>
  )
}

// ─── Barra de nivel azul ──────────────────────────────────────────────────────
function LevelBar({ value, max = 100, h = 80, label }: {
  value: number; max?: number; h?: number; label?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  const c   = pct > 90 ? '#ef4444' : pct < 20 ? '#f59e0b' : '#1565c0'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 28, height: h, background: '#888', ...winSunken, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${pct}%`, background: c,
          transition: 'height 0.6s ease',
          boxShadow: `0 0 8px ${c}88` }}/>
        {/* Marcas */}
        {[25,50,75].map(p => (
          <div key={p} style={{ position: 'absolute', bottom: `${p}%`, left: 0, right: 0,
            height: 1, background: 'rgba(255,255,255,0.3)' }}/>
        ))}
      </div>
      <span style={{ color: c, fontFamily: 'monospace', fontSize: 9, fontWeight: 'bold' }}>
        {pct.toFixed(0)}%
      </span>
      {label && <span style={{ color: WIN_DARK, fontSize: 7, textAlign: 'center', maxWidth: 36 }}>{label}</span>}
    </div>
  )
}

// ─── Indicador motor (cuadro verde/rojo estilo SCADA) ─────────────────────────
function MotorIndicator({ id, label, on, onClick }: {
  id: string; label: string; on: boolean; onClick: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      cursor: 'pointer' }} onClick={onClick}>
      <div style={{
        width: 36, height: 24,
        background: on ? '#00c853' : '#d32f2f',
        border: '2px solid #111',
        boxShadow: on ? '0 0 6px #00c85388' : '0 0 6px #d32f2f88',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        <span style={{ color: '#fff', fontSize: 9, fontWeight: 'black', letterSpacing: 0.5 }}>{id}</span>
      </div>
      <span style={{ color: '#333', fontSize: 6, textAlign: 'center', maxWidth: 40, lineHeight: 1.1 }}>{label}</span>
      <span style={{ color: on ? '#00c853' : '#d32f2f', fontSize: 7, fontWeight: 'bold' }}>
        {on ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

// ─── Botón estilo Windows ─────────────────────────────────────────────────────
function WinBtn({ label, onClick, color = 'default', width = 80 }: {
  label: string; onClick: () => void; color?: 'default'|'green'|'red'|'blue'; width?: number
}) {
  const [pressed, setPressed] = useState(false)
  const bg: Record<string,string> = {
    default: WIN_BG, green: '#c8f0c8', red: '#f0c8c8', blue: '#c8d8f0',
  }
  const s: CSSProperties = {
    width, padding: '3px 0', background: bg[color], border: '2px solid',
    fontSize: 9, fontWeight: 'bold', cursor: 'pointer',
    color: color === 'green' ? '#00695c' : color === 'red' ? '#c62828' : color === 'blue' ? '#1565c0' : '#111',
    boxShadow: pressed
      ? 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf'
      : 'inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf',
    borderColor: pressed ? '#000' : '#dfdfdf',
    transform: pressed ? 'translateY(1px)' : 'none',
    transition: 'transform 0.05s',
    userSelect: 'none',
  }
  return (
    <button style={s}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick() }}
      onMouseLeave={() => setPressed(false)}>{label}</button>
  )
}

// ─── Título de sección (barra azul Windows) ───────────────────────────────────
function WinSectionTitle({ label }: { label: string }) {
  return (
    <div style={{ background: WIN_TITLE, padding: '2px 6px', color: '#fff',
      fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 }}>
      {label}
    </div>
  )
}

// ─── Panel grupo ──────────────────────────────────────────────────────────────
function WinGroup({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: WIN_PANEL,
      ...win3D,
      padding: 6,
      ...style,
    }}>{children}</div>
  )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────
export function TransferPumpPanel({ onClose }: { onClose: () => void }) {
  const { equipment, sensors, toggleEquipment } = useSimulatorStore()
  const eq   = equipment.transfer_pump
  const isOn = eq.active

  const [activeTab,  setActiveTab]  = useState<'total'|'grafico'|'ajustes'>('total')
  const [pump1,      setPump1]      = useState(false)
  const [pump2,      setPump2]      = useState(false)
  const [pump3,      setPump3]      = useState(false)
  const [valvEnt,    setValvEnt]    = useState(false)
  const [valvSal,    setValvSal]    = useState(false)
  const [autoMode,   setAutoMode]   = useState(true)
  const [totalM3,    setTotalM3]    = useState(1598)
  const [flowRate,   setFlowRate]   = useState(0)
  const [pressure,   setPressure]   = useState(0)
  const [rpm,        setRpm]        = useState(0)
  const [tankLevel,  setTankLevel]  = useState(62)
  const [alarm,      setAlarm]      = useState(false)

  const anyPump = pump1 || pump2 || pump3

  // Simular contadores y caudal
  useEffect(() => {
    if (!isOn || !anyPump) {
      setFlowRate(0); setPressure(0); setRpm(0); return
    }
    const activePumps = [pump1,pump2,pump3].filter(Boolean).length
    const targetFlow = activePumps * 18.5 + (Math.random()-0.5)*2
    setFlowRate(targetFlow)
    setPressure(2.8 + activePumps*0.4 + (Math.random()-0.5)*0.1)
    setRpm(2950 + (Math.random()-0.5)*30)

    const id = setInterval(() => {
      setTotalM3(p => p + Math.random() * 0.05)
      setTankLevel(p => Math.max(10, Math.min(100, p - 0.05 + (Math.random()-0.5)*0.1)))
      setFlowRate(activePumps * 18.5 + (Math.random()-0.5)*2)
      setPressure(2.8 + activePumps*0.4 + (Math.random()-0.5)*0.1)
      setRpm(2950 + (Math.random()-0.5)*30)
    }, 800)
    return () => clearInterval(id)
  }, [isOn, pump1, pump2, pump3])

  useEffect(() => {
    if (pressure > 4.5) setAlarm(true)
    else setAlarm(false)
  }, [pressure])

  const handlePower = () => {
    toggleEquipment('transfer_pump')
    if (isOn) { setPump1(false); setPump2(false); setPump3(false); setValvEnt(false); setValvSal(false) }
  }

  const canOp = isOn

  const tabs = [
    { id: 'total',   label: '1-3 Total' },
    { id: 'grafico', label: 'Gráfico' },
    { id: 'ajustes', label: 'Ajustes' },
  ]

  const statusColor = eq.status === 'active' ? '#00c853'
    : eq.status === 'warning' ? '#f59e0b'
    : eq.status === 'error'   ? '#d32f2f' : '#808080'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      <div style={{
        background: WIN_BG,
        ...win3D,
        width: '100%', maxWidth: 680,
        fontFamily: 'Tahoma, Arial, sans-serif',
        boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
      }}>

        {/* ── Barra de título Windows ─────────────────────────── */}
        <div style={{ background: `linear-gradient(90deg, ${WIN_TITLE}, #3a6ea5)`,
          padding: '3px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}/>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
              BOMBA CENTRÍFUGA SANITARIA — {eq.model}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <button onClick={onClose} style={{
              background: '#c0392b', border: '1px solid #7f1d1d',
              color: '#fff', width: 16, height: 14, fontSize: 9,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><X size={10}/></button>
          </div>
        </div>

        {/* ── Pestañas Windows ───────────────────────────────── */}
        <div style={{ display: 'flex', background: WIN_BG, paddingTop: 4, paddingLeft: 4, gap: 1 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: '3px 12px', fontSize: 9, cursor: 'pointer', border: '1px solid #808080',
                borderBottom: activeTab === t.id ? 'none' : '1px solid #808080',
                background: activeTab === t.id ? WIN_PANEL : WIN_BG,
                color: '#000', fontWeight: activeTab === t.id ? 'bold' : 'normal',
                marginBottom: activeTab === t.id ? -1 : 0,
                zIndex: activeTab === t.id ? 1 : 0,
                position: 'relative',
              }}>{t.label}</button>
          ))}
          {alarm && (
            <button style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 9,
              background: '#d32f2f', color: '#fff', border: '1px solid #7f1d1d',
              cursor: 'pointer', fontWeight: 'bold' }}>⚠ ALARMA</button>
          )}
        </div>

        {/* ── Contenido de pestañas ──────────────────────────── */}
        <div style={{ background: WIN_PANEL, border: '1px solid #808080',
          borderTop: 'none', padding: 8, margin: '0 4px' }}>

          {/* ── TAB: TOTAL ─────────────────────────────────── */}
          {activeTab === 'total' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

              {/* Sección izquierda: motores */}
              <WinGroup style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <WinSectionTitle label="1-3 ESTADO MOTORES"/>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: '6px 0' }}>
                  <MotorIndicator id="M1" label="Bomba Principal" on={pump1&&isOn}
                    onClick={() => { if(canOp) setPump1(p=>!p) }}/>
                  <MotorIndicator id="M2" label="Bomba Respaldo" on={pump2&&isOn}
                    onClick={() => { if(canOp) setPump2(p=>!p) }}/>
                  <MotorIndicator id="M3" label="Bomba Aux." on={pump3&&isOn}
                    onClick={() => { if(canOp) setPump3(p=>!p) }}/>
                </div>

                {/* Contador total */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <WinSectionTitle label="1-3 CONTADOR (M³)"/>
                  <div style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SevenSeg value={totalM3} digits={7} color="#ff2200"/>
                  </div>
                </div>

                {/* Caudal actual */}
                <div>
                  <WinSectionTitle label="CAUDAL ACTUAL (m³/h)"/>
                  <div style={{ padding: '4px 6px', display: 'flex', justifyContent: 'center' }}>
                    <SevenSeg value={flowRate * 10} digits={5} color="#ff8800"/>
                  </div>
                  <div style={{ textAlign: 'center', color: WIN_DARK, fontSize: 8, marginTop: 2 }}>
                    {isOn && anyPump ? `${flowRate.toFixed(1)} m³/h` : '0.0 m³/h'}
                  </div>
                </div>
              </WinGroup>

              {/* Sección centro: nivel + presión */}
              <WinGroup style={{ width: 130, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <WinSectionTitle label="NIVELES"/>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '4px 0' }}>
                  <LevelBar value={tankLevel} h={90} label="Depósito"/>
                  <LevelBar value={isOn&&anyPump ? Math.min(100,flowRate*2.5) : 0} h={90} label="Caudal"/>
                </div>

                <WinSectionTitle label="PRESIÓN (bar)"/>
                <div style={{ padding: '3px 4px', display: 'flex', justifyContent: 'center' }}>
                  <SevenSeg value={pressure * 100} digits={4} color="#00cc44"/>
                </div>
                <div style={{ textAlign: 'center', color: WIN_DARK, fontSize: 8 }}>
                  {isOn&&anyPump ? `${pressure.toFixed(2)} bar` : '0.00 bar'}
                </div>
              </WinGroup>

              {/* Sección derecha: controles */}
              <WinGroup style={{ width: 140, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <WinSectionTitle label="CONTROL PRINCIPAL"/>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0' }}>
                  <WinBtn label={isOn ? '■ Parar' : '▶ Iniciar'}
                    color={isOn ? 'red' : 'green'} onClick={handlePower} width={120}/>
                  <WinBtn label={autoMode ? '⚙ AUTO' : '⚙ MANUAL'}
                    color="blue" onClick={() => setAutoMode(p=>!p)} width={120}/>
                  <WinBtn label="⚠ Reset Alarma"
                    color="default" onClick={() => setAlarm(false)} width={120}/>
                </div>

                <WinSectionTitle label="VÁLVULAS"/>
                <div style={{ display: 'flex', gap: 4, padding: '4px 0', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%',
                      background: valvEnt&&isOn ? '#00c853' : '#808080',
                      boxShadow: valvEnt&&isOn ? '0 0 5px #00c853' : 'none',
                      border: '1px solid #333' }}/>
                    <WinBtn label="V.ENT." onClick={() => { if(canOp) setValvEnt(p=>!p) }} width={56}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%',
                      background: valvSal&&isOn ? '#00c853' : '#808080',
                      boxShadow: valvSal&&isOn ? '0 0 5px #00c853' : 'none',
                      border: '1px solid #333' }}/>
                    <WinBtn label="V.SAL." onClick={() => { if(canOp) setValvSal(p=>!p) }} width={56}/>
                  </div>
                </div>

                <WinSectionTitle label="RPM MOTOR"/>
                <div style={{ padding: '3px 4px', display: 'flex', justifyContent: 'center' }}>
                  <SevenSeg value={isOn&&anyPump?rpm:0} digits={4} color="#00aaff"/>
                </div>

                {/* Sistema abierto/cerrado */}
                <div style={{ background: isOn ? '#c8f0c8' : '#f0c8c8',
                  border: '2px inset #808080', padding: '3px 6px', textAlign: 'center' }}>
                  <div style={{ color: isOn ? '#00695c' : '#c62828', fontSize: 9, fontWeight: 'bold' }}>
                    {isOn ? '● Sistema ACTIVO' : '○ Sistema PARADO'}
                  </div>
                  <div style={{ color: '#555', fontSize: 7, marginTop: 1 }}>
                    {autoMode ? 'Modo: AUTO' : 'Modo: MANUAL'}
                  </div>
                </div>
              </WinGroup>
            </div>
          )}

          {/* ── TAB: GRÁFICO ───────────────────────────────── */}
          {activeTab === 'grafico' && (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <WinSectionTitle label="TENDENCIA — CAUDAL Y PRESIÓN"/>
              <div style={{ flex: 1, background: '#000814', border: '2px inset #555',
                padding: 8, position: 'relative', overflow: 'hidden' }}>
                {/* Grid */}
                {[25,50,75].map(p=>(
                  <div key={p} style={{ position:'absolute', top:`${p}%`, left:0, right:0,
                    height:1, background:'#1a3a1a' }}/>
                ))}
                {/* Barras de tendencia simuladas */}
                <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:'100%' }}>
                  {Array.from({length:30},(_,i)=>{
                    const v = isOn&&anyPump ? Math.min(100, flowRate*2 + Math.sin(i*0.5)*10) : 0
                    const p = isOn&&anyPump ? Math.min(100, pressure*20 + Math.cos(i*0.3)*5) : 0
                    return (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column',
                        alignItems:'center', gap:1, height:'100%', justifyContent:'flex-end' }}>
                        <div style={{ width:'40%', height:`${v}%`, background:'#00c853',
                          boxShadow:'0 0 3px #00c85388' }}/>
                        <div style={{ width:'40%', height:`${p}%`, background:'#ff8800',
                          boxShadow:'0 0 3px #ff880088' }}/>
                      </div>
                    )
                  })}
                </div>
                {/* Leyenda */}
                <div style={{ position:'absolute', bottom:4, right:8, display:'flex', gap:8 }}>
                  <span style={{ color:'#00c853', fontSize:7 }}>■ Caudal (m³/h)</span>
                  <span style={{ color:'#ff8800', fontSize:7 }}>■ Presión (bar)</span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: AJUSTES ───────────────────────────────── */}
          {activeTab === 'ajustes' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <WinSectionTitle label="PARÁMETROS DE CONFIGURACIÓN"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { label:'Caudal Nominal (m³/h)', value:'50' },
                  { label:'Presión Máx. (bar)',     value:'5.0' },
                  { label:'Velocidad (RPM)',         value:'2950' },
                  { label:'Potencia Motor (kW)',     value:'5.5' },
                  { label:'Temp. Máx. Fluido (°C)', value:'140' },
                  { label:'Certificación',          value:'AISI-316L' },
                ].map(p=>(
                  <div key={p.label} style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', background:WIN_BG, ...win3D, padding:'3px 8px' }}>
                    <span style={{ color:'#333', fontSize:9 }}>{p.label}</span>
                    <span style={{ color:WIN_TITLE, fontFamily:'monospace', fontSize:10, fontWeight:'bold' }}>
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Barra de estado Windows ─────────────────────────── */}
        <div style={{ background: WIN_BG, ...win3D, margin: '2px 4px 4px',
          padding: '3px 8px', display: 'flex', gap: 10, justifyContent: 'space-around',
          borderTop: '1px solid #808080' }}>
          {[
            { label: 'Caudal',    value: isOn&&anyPump?`${flowRate.toFixed(1)} m³/h`:'0.0 m³/h', color: '#00695c' },
            { label: 'Presión',   value: isOn&&anyPump?`${pressure.toFixed(2)} bar`:'0.00 bar',   color: '#e65100' },
            { label: 'RPM',       value: isOn&&anyPump?`${Math.round(rpm)} rpm`:'0 rpm',          color: WIN_TITLE },
            { label: 'Total Vol.', value: `${totalM3.toFixed(0)} M³`,                              color: '#333' },
            { label: 'Modo',      value: autoMode?'AUTO':'MANUAL',                                 color: '#1565c0' },
          ].map(s=>(
            <div key={s.label} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <span style={{ color:WIN_DARK, fontSize:7 }}>{s.label}</span>
              <span style={{ fontFamily:'monospace', fontWeight:'bold', fontSize:10, color:s.color }}>{s.value}</span>
            </div>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:7, color:WIN_DARK }}>Usuario: Admin</span>
          </div>
        </div>

      </div>
    </div>
  )
}
