import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function Phase2Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const ribbonRef1  = useRef<Mesh>(null)
  const ribbonRef2  = useRef<Mesh>(null)
  const pumpRotor   = useRef<Mesh>(null)
  const transferRef = useRef<Mesh>(null)

  const tankActive     = equipment.molasses_tank.active
  const pumpActive     = equipment.peristaltic_pump.active
  const dissolvActive  = equipment.dissolution_tank.active
  const transferActive = equipment.transfer_pump.active
  const mixerActive    = equipment.ribbon_mixer.active

  useFrame((_, delta) => {
    if (ribbonRef1.current && mixerActive)  ribbonRef1.current.rotation.x  += delta * 2
    if (ribbonRef2.current && mixerActive)  ribbonRef2.current.rotation.x  -= delta * 2
    if (pumpRotor.current && pumpActive)    pumpRotor.current.rotation.y   += delta * 4
    if (transferRef.current && transferActive) transferRef.current.rotation.x += delta * 5
  })

  const tankColor     = tankActive     ? '#3b82f6' : '#374151'
  const pumpColor     = pumpActive     ? '#3b82f6' : '#374151'
  const dissolvColor  = dissolvActive  ? '#38bdf8' : '#374151'
  const transferColor = transferActive ? '#3b82f6' : '#374151'
  const mixerColor    = mixerActive
    ? equipment.ribbon_mixer.status === 'error'   ? '#ef4444'
    : equipment.ribbon_mixer.status === 'warning' ? '#facc15'
    : '#3b82f6'
    : '#374151'

  return (
    <group position={[-1, 0, 0]}>
      <Text position={[2, 3.8, 0]} fontSize={0.4} color="#93c5fd" anchorX="center">
        FASE 2 — Mezcla Húmeda
      </Text>

      {/* Tanque Almacenamiento Melaza */}
      <group position={[-3, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.9, 0.6, 2.2, 20]} />
          <meshStandardMaterial color={tankColor} metalness={0.6} roughness={0.3}
            transparent opacity={0.85}
            emissive={tankActive ? tankColor : '#000'} emissiveIntensity={0.1} />
        </mesh>
        <Html position={[0, -1.5, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Tanque Melaza</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>Inoxpa TCI-2000</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>1000–5000 L · AISI-304</span>
          </div>
        </Html>
      </group>

      {/* Bomba Peristáltica */}
      <group position={[-1.2, -0.3, 1.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.7, 12]} />
          <meshStandardMaterial color={pumpColor} metalness={0.7} roughness={0.3}
            emissive={pumpActive ? pumpColor : '#000'} emissiveIntensity={0.2} />
        </mesh>
        <mesh ref={pumpRotor} position={[0, 0, 0]}>
          <torusGeometry args={[0.2, 0.06, 6, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
        <Html position={[0, -0.8, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Bomba Peristáltica</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>ProMinent DULCOFLEX DFYa</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>±1% · PROFIBUS/CANopen</span><br/>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{sensors.molassesFlowActual.toFixed(1)} L/h</span>
          </div>
        </Html>
      </group>

      {/* Batea de Disolución */}
      <group position={[1, 0, 1.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.8, 0.9]} />
          <meshStandardMaterial color={dissolvColor} metalness={0.4} roughness={0.5}
            transparent opacity={0.9}
            emissive={dissolvActive ? dissolvColor : '#000'} emissiveIntensity={0.1} />
        </mesh>
        <Html position={[0, -0.7, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Batea Disolución</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>Inoxpa DT-300</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>300 L · Urea + Sal</span>
          </div>
        </Html>
      </group>

      {/* Bomba Centrífuga Sanitaria */}
      <group position={[2.8, -0.3, 1.5]}>
        <mesh ref={transferRef} castShadow>
          <torusGeometry args={[0.3, 0.12, 8, 16]} />
          <meshStandardMaterial color={transferColor} metalness={0.8} roughness={0.2}
            emissive={transferActive ? transferColor : '#000'} emissiveIntensity={0.2} />
        </mesh>
        <Html position={[0, -0.7, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Bomba Centrífuga</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>Alfa Laval LKH-25</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>5–50 m³/h · AISI-316L</span>
          </div>
        </Html>
      </group>

      {/* Mezcladora Horizontal de Cintas */}
      <group position={[4.5, 0, 0]}>
        {/* housing */}
        <mesh castShadow>
          <boxGeometry args={[3.0, 1.0, 1.2]} />
          <meshStandardMaterial color={mixerColor} metalness={0.6} roughness={0.3}
            transparent opacity={0.85}
            emissive={mixerActive ? mixerColor : '#000'} emissiveIntensity={0.1} />
        </mesh>
        {/* ribbon spiral 1 */}
        <mesh ref={ribbonRef1} position={[0, 0, 0.2]}>
          <torusGeometry args={[0.35, 0.04, 6, 20]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* ribbon spiral 2 (counter-rotating) */}
        <mesh ref={ribbonRef2} position={[0, 0, -0.2]}>
          <torusGeometry args={[0.25, 0.04, 6, 20]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
        </mesh>
        {mixerActive && <pointLight position={[0, 0, 0]} intensity={0.5} color="#3b82f6" distance={4} />}
        <Html position={[0, -0.8, 0]} center>
          <div style={{ color: '#93c5fd', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Mezcladora Cintas</span><br/>
            <span style={{ color: '#60a5fa', fontSize: '9px' }}>Huaxin HJJ-3000</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>500–3000 kg/lote · 37 kW · Doble espiral</span><br/>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{sensors.tankPressure.toFixed(1)} PSI</span>
          </div>
        </Html>
      </group>
    </group>
  )
}
