import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

function equipmentColor(active: boolean, status: string, hotValue?: number): string {
  if (!active) return '#374151'
  if (status === 'error') return '#ef4444'
  if (status === 'warning') return '#facc15'
  if (hotValue !== undefined && hotValue > 400) return '#f97316'
  if (hotValue !== undefined && hotValue > 200) return '#fb923c'
  return '#22c55e'
}

export function Phase1Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const kilnRef = useRef<Mesh>(null)
  const millRef = useRef<Mesh>(null)

  const kilnActive = equipment.rotary_kiln.active
  const millActive = equipment.hammer_mill.active
  const boilerActive = equipment.blood_boiler.active

  // Rotate kiln when active
  useFrame((_, delta) => {
    if (kilnRef.current && kilnActive) {
      kilnRef.current.rotation.z += delta * 0.5
    }
    if (millRef.current && millActive) {
      millRef.current.rotation.y += delta * 2
    }
  })

  const kilnColor = equipmentColor(kilnActive, equipment.rotary_kiln.status, sensors.kilnTemp)
  const millColor = equipmentColor(millActive, equipment.hammer_mill.status)
  const boilerColor = equipmentColor(boilerActive, equipment.blood_boiler.status)

  return (
    <group position={[-8, 0, 0]}>
      {/* Phase 1 Label */}
      <Text position={[1, 3.5, 0]} fontSize={0.4} color="#fca5a5" anchorX="center">
        FASE 1
      </Text>

      {/* Blood Boiler — cylinder */}
      <group position={[-2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
          <meshStandardMaterial color={boilerColor} metalness={0.7} roughness={0.3} emissive={boilerActive ? boilerColor : '#000'} emissiveIntensity={0.2} />
        </mesh>
        {/* steam effect */}
        {boilerActive && (
          <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#ef4444" distance={3} />
        )}
        <Html position={[0, -1.2, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Hervidor de Sangre</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>Meyn BSP-500 Pro</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>500 L · 18 kW · AISI-316L</span>
          </div>
        </Html>
      </group>

      {/* Rotary Kiln — long cylinder horizontal */}
      <group position={[1, 0.3, 0]}>
        <mesh ref={kilnRef} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.8, 0.8, 4, 24]} />
          <meshStandardMaterial color={kilnColor} metalness={0.8} roughness={0.2} emissive={kilnActive ? kilnColor : '#000'} emissiveIntensity={0.3} />
        </mesh>
        {kilnActive && sensors.kilnTemp > 200 && (
          <pointLight position={[0, 0, 0]} intensity={1} color="#f97316" distance={5} />
        )}
        <Html position={[0, -1.2, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Horno Rotatorio</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>FLSmidth KilnMaster HR-4×40</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>4 t/h · 75 kW · Al₂O₃ 70%</span><br/>
            <span style={{ color: '#fb923c', fontWeight: 700 }}>{sensors.kilnTemp.toFixed(0)}°C</span>
          </div>
        </Html>
      </group>

      {/* Hammer Mill — box */}
      <group position={[4, 0, 0]}>
        <mesh ref={millRef} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color={millColor} metalness={0.6} roughness={0.4} emissive={millActive ? millColor : '#000'} emissiveIntensity={0.15} />
        </mesh>
        {/* Funnel on top */}
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.5, 0.7, 8]} />
          <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
        </mesh>
        <Html position={[0, -0.9, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Molino de Martillos</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>Williams CrushMaster HM-3000</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>1.5 t/h · 22 kW · Criba 2 mm</span>
          </div>
        </Html>
      </group>
    </group>
  )
}
