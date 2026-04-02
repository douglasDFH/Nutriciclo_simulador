import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html, useGLTF } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

// Preload para evitar parpadeo al montar
useGLTF.preload('/marmita.glb')

function MarmitaModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/marmita.glb')
  const cloned = scene.clone()

  // Aplica emissive según estado
  cloned.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh
      const mat = (mesh.material as { emissive?: { set: (c: string) => void }; emissiveIntensity?: number })
      if (mat?.emissive) {
        if (!active) {
          mat.emissive.set('#000000')
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0
        } else if (status === 'error') {
          mat.emissive.set('#ef4444')
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.4
        } else if (status === 'warning') {
          mat.emissive.set('#facc15')
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.3
        } else {
          mat.emissive.set('#22c55e')
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.2
        }
      }
    }
  })

  return <primitive object={cloned} scale={[1, 1, 1]} />
}

function color(active: boolean, status: string, hot?: number): string {
  if (!active) return '#374151'
  if (status === 'error') return '#ef4444'
  if (status === 'warning') return '#facc15'
  if (hot !== undefined && hot > 400) return '#f97316'
  if (hot !== undefined && hot > 200) return '#fb923c'
  return '#22c55e'
}

export function Phase1Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const kilnRef    = useRef<Mesh>(null)
  const dryerRef   = useRef<Mesh>(null)
  const scinfinRef = useRef<Mesh>(null)

  const marmitaActive  = equipment.marmita.active
  const dryerActive    = equipment.rotary_dryer.active
  const scinfinActive  = equipment.screw_conveyor.active
  const kilnActive     = equipment.rotary_kiln.active
  const millActive     = equipment.hammer_mill.active

  useFrame((_, delta) => {
    if (kilnRef.current && kilnActive)    kilnRef.current.rotation.z    += delta * 0.5
    if (dryerRef.current && dryerActive)  dryerRef.current.rotation.z   += delta * 0.3
    if (scinfinRef.current && scinfinActive) scinfinRef.current.rotation.x += delta * 2
  })

  const dryerColor   = color(dryerActive,   equipment.rotary_dryer.status, sensors.dryerTemp)
  const scinfinColor = color(scinfinActive, equipment.screw_conveyor.status)
  const kilnColor    = color(kilnActive,    equipment.rotary_kiln.status, sensors.kilnTemp)
  const millColor    = color(millActive,    equipment.hammer_mill.status)

  return (
    <group position={[-14, 0, 0]}>
      <Text position={[5, 3.8, 0]} fontSize={0.4} color="#fca5a5" anchorX="center">
        FASE 1 — Preparación Intensiva
      </Text>

      {/* Marmita — modelo GLB real */}
      <group position={[0, 0, 0]}>
        <MarmitaModel active={marmitaActive} status={equipment.marmita.status} />
        {marmitaActive && <pointLight position={[0, 1.5, 0]} intensity={0.4} color="#ef4444" distance={3} />}
        <Html position={[0, -1.3, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Marmita Industrial</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>Jersa/Vulcano MV-300</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>300 L · 12 kW · AISI-304 · 150°C</span>
          </div>
        </Html>
      </group>

      {/* Secador Rotatorio — horizontal cylinder */}
      <group position={[2.5, 0.2, 0]}>
        <mesh ref={dryerRef} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.55, 2.8, 20]} />
          <meshStandardMaterial color={dryerColor} metalness={0.7} roughness={0.3}
            emissive={dryerActive ? dryerColor : '#000'} emissiveIntensity={0.2} />
        </mesh>
        {dryerActive && sensors.dryerTemp > 60 && (
          <pointLight position={[0, 0, 0]} intensity={0.6} color="#fb923c" distance={4} />
        )}
        <Html position={[0, -1.1, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Secador Rotatorio</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>Vulcanotec SD-500</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>0.5–3 t/h · 22 kW · 80–120°C</span><br/>
            <span style={{ color: '#fb923c', fontWeight: 700 }}>{sensors.dryerTemp.toFixed(0)}°C</span>
          </div>
        </Html>
      </group>

      {/* Transportador Sinfín — long thin box */}
      <group position={[5, -0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.5, 0.35, 0.35]} />
          <meshStandardMaterial color={scinfinColor} metalness={0.5} roughness={0.5}
            emissive={scinfinActive ? scinfinColor : '#000'} emissiveIntensity={0.1} />
        </mesh>
        {/* screw inside (visible as a thin cylinder) */}
        <mesh ref={scinfinRef}>
          <cylinderGeometry args={[0.1, 0.1, 3.4, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
        </mesh>
        <Html position={[0, -0.5, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Transportador Sinfín</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>WAM Group TSC-250</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>1–15 t/h · 5.5 kW · Ø250 mm</span>
          </div>
        </Html>
      </group>

      {/* Horno Rotatorio — long horizontal cylinder */}
      <group position={[7.5, 0.3, 0]}>
        <mesh ref={kilnRef} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.8, 0.8, 4, 24]} />
          <meshStandardMaterial color={kilnColor} metalness={0.8} roughness={0.2}
            emissive={kilnActive ? kilnColor : '#000'} emissiveIntensity={0.3} />
        </mesh>
        {kilnActive && sensors.kilnTemp > 200 && (
          <pointLight position={[0, 0, 0]} intensity={1.2} color="#f97316" distance={6} />
        )}
        <Html position={[0, -1.2, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Horno Rotatorio</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>CITIC HIC RK-Series</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>1–5 t/h · 75 kW · 500–600°C</span><br/>
            <span style={{ color: '#fb923c', fontWeight: 700 }}>{sensors.kilnTemp.toFixed(0)}°C</span>
          </div>
        </Html>
      </group>

      {/* Molino de Martillos — box */}
      <group position={[10, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color={millColor} metalness={0.6} roughness={0.4}
            emissive={millActive ? millColor : '#000'} emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.5, 0.7, 8]} />
          <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
        </mesh>
        <Html position={[0, -0.9, 0]} center>
          <div style={{ color: '#fca5a5', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Molino de Martillos</span><br/>
            <span style={{ color: '#f87171', fontSize: '9px' }}>RICHI 9FQ-Series</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>1–10 t/h · 22–55 kW · Criba 2 mm</span>
          </div>
        </Html>
      </group>
    </group>
  )
}
