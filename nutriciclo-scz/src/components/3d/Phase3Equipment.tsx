import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function Phase3Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const paddleRef1 = useRef<Mesh>(null)
  const paddleRef2 = useRef<Mesh>(null)
  const dosRef     = useRef<Mesh>(null)
  const vibRef     = useRef<Mesh>(null)
  const beltRef    = useRef<Mesh>(null)
  const fanRef     = useRef<Mesh>(null)

  const paddleActive  = equipment.paddle_mixer.active
  const limeActive    = equipment.lime_dosifier.active
  const vibActive     = equipment.vibrating_table.active
  const beltActive    = equipment.belt_conveyor.active
  const ventActive    = equipment.ventilation.active

  useFrame((_, delta) => {
    if (paddleRef1.current && paddleActive) paddleRef1.current.rotation.x += delta * 3
    if (paddleRef2.current && paddleActive) paddleRef2.current.rotation.x -= delta * 3
    if (dosRef.current && limeActive)       dosRef.current.rotation.y     += delta * 1.5
    if (vibRef.current && vibActive) {
      vibRef.current.position.y = -0.3 + Math.sin(Date.now() * 0.05) * 0.015
    }
    if (beltRef.current && beltActive)      beltRef.current.rotation.x   += delta * 1.5
    if (fanRef.current && ventActive)       fanRef.current.rotation.z     += delta * 5
  })

  const paddleColor = paddleActive
    ? equipment.paddle_mixer.status === 'warning' ? '#facc15' : '#22c55e'
    : '#374151'
  const limeColor = limeActive
    ? sensors.exothermicTemp > 150 ? '#ef4444'
    : sensors.exothermicTemp > 80  ? '#f97316'
    : '#22c55e'
    : '#374151'
  const vibColor  = vibActive  ? '#22c55e' : '#374151'
  const beltColor = beltActive ? '#4ade80'  : '#374151'
  const ventColor = ventActive ? '#86efac'  : '#374151'

  return (
    <group position={[10, 0, 0]}>
      <Text position={[3.5, 3.8, 0]} fontSize={0.4} color="#86efac" anchorX="center">
        FASE 3 — Fraguado
      </Text>

      {/* Mezcladora Paletas Doble Eje */}
      <group position={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.9, 1.1]} />
          <meshStandardMaterial color={paddleColor} metalness={0.6} roughness={0.3}
            emissive={paddleActive ? paddleColor : '#000'} emissiveIntensity={0.1} />
        </mesh>
        {/* shaft 1 */}
        <mesh ref={paddleRef1} position={[0, 0, 0.25]}>
          <torusGeometry args={[0.3, 0.05, 6, 18]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* shaft 2 */}
        <mesh ref={paddleRef2} position={[0, 0, -0.25]}>
          <torusGeometry args={[0.3, 0.05, 6, 18]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
        </mesh>
        <Html position={[0, -0.8, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Mezcladora Doble Eje</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Huaxin WLDH-2000</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>1–5 t/lote · 45 kW · 3–8 min</span>
          </div>
        </Html>
      </group>

      {/* Dosificador de Cal Viva */}
      <group position={[2.5, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.65, 0.65, 1.8, 16]} />
          <meshStandardMaterial color={limeColor} metalness={0.5} roughness={0.4}
            emissive={limeActive ? limeColor : '#000'} emissiveIntensity={0.25} />
        </mesh>
        <mesh ref={dosRef} position={[0, 1.3, 0]}>
          <coneGeometry args={[0.65, 1.0, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.6} />
        </mesh>
        {limeActive && sensors.exothermicTemp > 50 && (
          <pointLight position={[0, 0, 0]} intensity={0.8} color="#f97316" distance={5} />
        )}
        <Html position={[0, -1.3, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Dosificador Cal Viva</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Schenck/K-Tron K-ML-D5-KT20</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>50–500 kg/h · ±0.5%</span><br/>
            <span style={{ color: '#f97316', fontWeight: 700 }}>{sensors.exothermicTemp.toFixed(1)}°C</span>
          </div>
        </Html>
      </group>

      {/* Vibradora de Mesa + Moldes */}
      <group position={[5, -0.3, 0]}>
        <mesh ref={vibRef} castShadow>
          <boxGeometry args={[2.0, 0.25, 1.4]} />
          <meshStandardMaterial color={vibColor} metalness={0.4} roughness={0.5}
            emissive={vibActive ? vibColor : '#000'} emissiveIntensity={0.1} />
        </mesh>
        {/* mold blocks on table */}
        {[[-0.6, 0], [0, 0], [0.6, 0]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.25, z]} castShadow>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color={vibActive ? '#4ade80' : '#4b5563'}
              metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
        <Html position={[0, -0.7, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Vibradora de Mesa</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Vibra Technologie VT-1000</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>20–100 ud/ciclo · 3000–6000 VPM</span>
          </div>
        </Html>
      </group>

      {/* Cinta Transportadora */}
      <group position={[7.5, -0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.15, 0.8]} />
          <meshStandardMaterial color={beltColor} metalness={0.3} roughness={0.6}
            emissive={beltActive ? beltColor : '#000'} emissiveIntensity={0.08} />
        </mesh>
        <mesh ref={beltRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.75, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
        </mesh>
        <Html position={[0, -0.5, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Cinta Transportadora</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Interroll FlatTop Series</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>0.1–1 m/s · PVC/PU alimentaria</span>
          </div>
        </Html>
      </group>

      {/* Sistema de Ventilación */}
      <group position={[2.5, 2.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 12]} />
          <meshStandardMaterial color={ventColor} metalness={0.5} roughness={0.4}
            emissive={ventActive ? ventColor : '#000'} emissiveIntensity={0.2} />
        </mesh>
        {/* fan blades */}
        <mesh ref={fanRef} position={[0, 0.35, 0]}>
          <torusGeometry args={[0.3, 0.04, 4, 8]} />
          <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* duct going down */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1.0, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.4} />
        </mesh>
        {ventActive && <pointLight position={[0, 0.5, 0]} intensity={0.3} color="#86efac" distance={3} />}
        <Html position={[0, -1.5, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Ventilación / Extracción</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Sodeca CMP-4500</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>2000–8000 m³/h · 5.5 kW</span>
          </div>
        </Html>
      </group>
    </group>
  )
}
