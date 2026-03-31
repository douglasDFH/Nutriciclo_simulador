import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function Phase2Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const mixerBladeRef1 = useRef<Mesh>(null)
  const mixerBladeRef2 = useRef<Mesh>(null)
  const pumpRef = useRef<Mesh>(null)

  const mixerActive = equipment.mixer_tank.active
  const pumpActive = equipment.molasses_pump.active

  useFrame((_, delta) => {
    if (mixerBladeRef1.current && mixerActive) {
      mixerBladeRef1.current.rotation.y += delta * 3
    }
    if (mixerBladeRef2.current && mixerActive) {
      mixerBladeRef2.current.rotation.y += delta * 3
    }
    if (pumpRef.current && pumpActive) {
      pumpRef.current.rotation.x += delta * 4
    }
  })

  const mixerColor = mixerActive
    ? equipment.mixer_tank.status === 'error' ? '#ef4444'
    : equipment.mixer_tank.status === 'warning' ? '#facc15'
    : '#3b82f6'
    : '#374151'
  const pumpColor = pumpActive ? '#3b82f6' : '#374151'

  return (
    <group position={[0, 0, 0]}>
      {/* Pump */}
      <group position={[-1.5, -0.2, 0]}>
        <mesh ref={pumpRef} castShadow>
          <torusGeometry args={[0.5, 0.2, 8, 16]} />
          <meshStandardMaterial color={pumpColor} metalness={0.8} roughness={0.2} emissive={pumpActive ? pumpColor : '#000'} emissiveIntensity={0.2} />
        </mesh>
        <Html position={[0, -1, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Bomba de Melaza</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>Alfa Laval LKH-25</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>0–100 L/min · 5.5 kW · INOX 316L</span><br/>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{sensors.molassesFlowActual.toFixed(1)} L/min</span>
          </div>
        </Html>
      </group>

      {/* Mixer Tank — large cylinder */}
      <group position={[1, 0, 0]}>
        {/* Tank body */}
        <mesh castShadow>
          <cylinderGeometry args={[1.2, 1.0, 2.5, 24]} />
          <meshStandardMaterial
            color={mixerColor}
            metalness={0.6}
            roughness={0.3}
            transparent
            opacity={0.85}
            emissive={mixerActive ? mixerColor : '#000'}
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Mixer blade inside */}
        <mesh ref={mixerBladeRef1} position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.15]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={mixerBladeRef2} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[2.0, 0.08, 0.15]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
        {mixerActive && (
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#3b82f6" distance={3} />
        )}
        <Html position={[0, -1.6, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Tanque Mezclador</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>SPX Flow MixPro MX-2500</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>2500 L · 15 kW · AISI-304</span><br/>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{sensors.tankPressure.toFixed(1)} PSI</span>
          </div>
        </Html>
      </group>
    </group>
  )
}
