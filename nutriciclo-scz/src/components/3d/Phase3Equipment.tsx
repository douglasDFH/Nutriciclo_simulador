import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function Phase3Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const dosRef = useRef<Mesh>(null)

  const limeActive = equipment.lime_dosifier.active
  const moldActive = equipment.mold_station.active

  useFrame((_, delta) => {
    if (dosRef.current && limeActive) {
      dosRef.current.rotation.y += delta * 1.5
    }
  })

  const limeColor = limeActive
    ? sensors.exothermicTemp > 150 ? '#ef4444'
    : sensors.exothermicTemp > 80 ? '#f97316'
    : '#22c55e'
    : '#374151'

  const moldColor = moldActive ? '#22c55e' : '#374151'

  return (
    <group position={[8, 0, 0]}>
      {/* Lime dosifier — cone + cylinder */}
      <group position={[-1, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.7, 0.7, 1.8, 16]} />
          <meshStandardMaterial color={limeColor} metalness={0.5} roughness={0.4} emissive={limeActive ? limeColor : '#000'} emissiveIntensity={0.25} />
        </mesh>
        <mesh ref={dosRef} position={[0, 1.3, 0]}>
          <coneGeometry args={[0.7, 1.0, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.6} />
        </mesh>
        {limeActive && sensors.exothermicTemp > 50 && (
          <pointLight position={[0, 0, 0]} intensity={0.8} color="#f97316" distance={4} />
        )}
        <Html position={[0, -1.3, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Dosificador de Cal</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Schenck DISOCONT DL-200</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>0–200 kg/h · 2.2 kW · ±0.5%</span><br/>
            <span style={{ color: '#f97316', fontWeight: 700 }}>{sensors.exothermicTemp.toFixed(1)}°C</span>
          </div>
        </Html>
      </group>

      {/* Mold station — array of boxes */}
      <group position={[2, -0.3, 0]}>
        {[[-0.8, 0], [0, 0], [0.8, 0], [-0.4, 0.8], [0.4, 0.8]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial
              color={moldColor}
              metalness={0.3}
              roughness={0.7}
              emissive={moldActive ? '#22c55e' : '#000'}
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
        <Html position={[0, -0.8, 0]} center>
          <div style={{ color: '#86efac', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Estación de Moldes</span><br/>
            <span style={{ color: '#4ade80', fontSize: '9px' }}>Bühler FormTech MLD-500</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>500 ud/h · 8 kW · PP-HD</span>
          </div>
        </Html>
      </group>
    </group>
  )
}
