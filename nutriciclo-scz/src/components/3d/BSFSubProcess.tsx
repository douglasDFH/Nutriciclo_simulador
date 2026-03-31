import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

export function BSFSubProcess() {
  const { equipment, sensors } = useSimulatorStore()
  const larvaeRef   = useRef<Mesh>(null)
  const bsfDryRef   = useRef<Mesh>(null)
  const bsfMillRef  = useRef<Mesh>(null)

  const bioActive  = equipment.bsf_bioreactor.active
  const dryActive  = equipment.bsf_dryer.active
  const millActive = equipment.bsf_mill.active

  useFrame((_, delta) => {
    // Bioreactor: slight pulse/oscillation to simulate larvae movement
    if (larvaeRef.current && bioActive) {
      larvaeRef.current.rotation.y += delta * 0.2
    }
    if (bsfDryRef.current && dryActive) {
      bsfDryRef.current.rotation.z += delta * 0.4
    }
    if (bsfMillRef.current && millActive) {
      bsfMillRef.current.rotation.y += delta * 3
    }
  })

  const bioColor  = bioActive  ? '#a3e635' : '#374151'
  const dryColor  = dryActive  ? '#84cc16' : '#374151'
  const millColor = millActive ? '#65a30d' : '#374151'

  return (
    // Positioned behind the main production line (z = -8)
    <group position={[-2, 0, -8]}>
      <Text position={[3.5, 3.2, 0]} fontSize={0.35} color="#a3e635" anchorX="center">
        SUB-PROCESO — Harina BSF (Hermetia illucens)
      </Text>

      {/* Connecting line indicator (dashed look via thin boxes) */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[3.5, -0.8, i * 1.1 + 0.5]}>
          <boxGeometry args={[0.04, 0.04, 0.6]} />
          <meshStandardMaterial color="#a3e635" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* ── Biorreactor BSF ── */}
      <group position={[0, 0, 0]}>
        {/* Main housing — rectangular module */}
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.8, 1.2]} />
          <meshStandardMaterial
            color={bioColor} metalness={0.2} roughness={0.8}
            transparent opacity={0.85}
            emissive={bioActive ? bioColor : '#000'} emissiveIntensity={0.15}
          />
        </mesh>
        {/* Grid/mesh panels on sides */}
        <mesh position={[0.71, 0, 0]}>
          <boxGeometry args={[0.04, 1.7, 1.1]} />
          <meshStandardMaterial color="#4b7c0a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[-0.71, 0, 0]}>
          <boxGeometry args={[0.04, 1.7, 1.1]} />
          <meshStandardMaterial color="#4b7c0a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Rotating larvae tray indicator */}
        <mesh ref={larvaeRef} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
          <meshStandardMaterial color={bioActive ? '#84cc16' : '#374151'} metalness={0.1} roughness={0.9} />
        </mesh>
        {bioActive && (
          <pointLight position={[0, 1, 0]} intensity={0.4} color="#a3e635" distance={3} />
        )}
        <Html position={[0, -1.3, 0]} center>
          <div style={{ color: '#a3e635', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Biorreactor BSF</span><br/>
            <span style={{ color: '#84cc16', fontSize: '9px' }}>AgriProtein BioBox BSF-500</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>500 kg/ciclo · 14 días · 27–30°C</span><br/>
            {bioActive && (
              <span style={{ color: '#a3e635', fontWeight: 700, fontSize: '8px' }}>● CRÍA ACTIVA</span>
            )}
          </div>
        </Html>
      </group>

      {/* ── Secador de Larvas BSF ── */}
      <group position={[3.5, 0.2, 0]}>
        <mesh ref={bsfDryRef} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 2.2, 16]} />
          <meshStandardMaterial
            color={dryColor} metalness={0.6} roughness={0.4}
            emissive={dryActive ? dryColor : '#000'} emissiveIntensity={0.2}
          />
        </mesh>
        {dryActive && (
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#fb923c" distance={3} />
        )}
        <Html position={[0, -1.0, 0]} center>
          <div style={{ color: '#a3e635', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Secador Larvas BSF</span><br/>
            <span style={{ color: '#84cc16', fontSize: '9px' }}>Vulcanotec SD-100 BSF</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>100 kg/h · 8 kW · 70–90°C</span>
          </div>
        </Html>
      </group>

      {/* ── Molino BSF ── */}
      <group position={[7, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 1.0, 1.0]} />
          <meshStandardMaterial
            color={millColor} metalness={0.6} roughness={0.4}
            emissive={millActive ? millColor : '#000'} emissiveIntensity={0.15}
          />
        </mesh>
        {/* funnel on top */}
        <mesh position={[0, 0.85, 0]}>
          <coneGeometry args={[0.4, 0.6, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh ref={bsfMillRef} position={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.06, 6, 12]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.1} />
        </mesh>
        <Html position={[0, -0.8, 0]} center>
          <div style={{ color: '#a3e635', fontSize: '10px', whiteSpace: 'nowrap', textAlign: 'center', pointerEvents: 'none', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700 }}>Molino BSF</span><br/>
            <span style={{ color: '#84cc16', fontSize: '9px' }}>RICHI BSF-Mill 500</span><br/>
            <span style={{ color: '#9ca3af', fontSize: '8px' }}>0.5–1 t/h · 15 kW · Criba 1.5 mm</span><br/>
            <span style={{ color: '#a3e635', fontWeight: 700 }}>
              {sensors.bsfFlourRate.toFixed(1)} kg/h
            </span>
          </div>
        </Html>
      </group>

      {/* BSF flour rate badge */}
      {millActive && sensors.bsfFlourRate > 0 && (
        <Html position={[3.5, 2.5, 0]} center>
          <div style={{
            background: 'rgba(16,42,0,0.85)', border: '1px solid #a3e635',
            borderRadius: 6, padding: '4px 10px', color: '#a3e635',
            fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            Harina BSF: {sensors.bsfFlourRate.toFixed(1)} kg/h · 40–45% proteína
          </div>
        </Html>
      )}
    </group>
  )
}
