import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'

interface FlowParticlesProps {
  from: readonly [number, number, number]
  to: readonly [number, number, number]
  active: boolean
  color: string
  count?: number
}

function FlowParticles({ from, to, active, color, count = 20 }: FlowParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const offsets = useMemo(() => new Float32Array(count).map(() => Math.random()), [count])

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = offsets[i]
      arr[i * 3] = from[0] + (to[0] - from[0]) * t
      arr[i * 3 + 1] = from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.5
      arr[i * 3 + 2] = from[2] + (to[2] - from[2]) * t
    }
    return arr
  }, [from, to, count, offsets])

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < count; i++) {
      offsets[i] = (offsets[i] + delta * 0.3) % 1
      const t = offsets[i]
      arr[i * 3] = from[0] + (to[0] - from[0]) * t
      arr[i * 3 + 1] = from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.5
      arr[i * 3 + 2] = from[2] + (to[2] - from[2]) * t
    }
    pos.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.12} color={color} transparent opacity={0.9} />
    </points>
  )
}

// Segment coordinates defined as constants to avoid recreating arrays each render
const SEG_KILN_TO_MILL   = { from: [-7, 0.3, 0],  to: [-4, 0, 0]  } as const
const SEG_MILL_TO_MIXER  = { from: [-4, 0, 0],    to: [1, 0, 0]   } as const
const SEG_PUMP_TO_MIXER  = { from: [-1.5, -0.2, 0], to: [1, 0, 0] } as const
const SEG_MIXER_TO_LIME  = { from: [1, 0, 0],     to: [7, 0, 0]   } as const
const SEG_LIME_TO_MOLDS  = { from: [7, 0, 0],     to: [10, -0.3, 0] } as const

export function MaterialFlow() {
  const { equipment } = useSimulatorStore()

  return (
    <group>
      {/* Kiln → Mill */}
      <FlowParticles
        from={SEG_KILN_TO_MILL.from}
        to={SEG_KILN_TO_MILL.to}
        active={equipment.rotary_kiln.active && equipment.hammer_mill.active}
        color="#f97316"
      />
      {/* Mill → Mixer */}
      <FlowParticles
        from={SEG_MILL_TO_MIXER.from}
        to={SEG_MILL_TO_MIXER.to}
        active={equipment.hammer_mill.active && equipment.mixer_tank.active}
        color="#a3e635"
      />
      {/* Pump → Mixer */}
      <FlowParticles
        from={SEG_PUMP_TO_MIXER.from}
        to={SEG_PUMP_TO_MIXER.to}
        active={equipment.molasses_pump.active && equipment.mixer_tank.active}
        color="#fbbf24"
        count={15}
      />
      {/* Mixer → Lime dosifier */}
      <FlowParticles
        from={SEG_MIXER_TO_LIME.from}
        to={SEG_MIXER_TO_LIME.to}
        active={equipment.mixer_tank.active && equipment.lime_dosifier.active}
        color="#86efac"
      />
      {/* Lime dosifier → Molds */}
      <FlowParticles
        from={SEG_LIME_TO_MOLDS.from}
        to={SEG_LIME_TO_MOLDS.to}
        active={equipment.lime_dosifier.active && equipment.mold_station.active}
        color="#22c55e"
        count={15}
      />
    </group>
  )
}
