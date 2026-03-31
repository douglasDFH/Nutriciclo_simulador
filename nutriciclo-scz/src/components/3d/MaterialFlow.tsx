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
      arr[i * 3]     = from[0] + (to[0] - from[0]) * t
      arr[i * 3 + 1] = from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.4
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
      arr[i * 3]     = from[0] + (to[0] - from[0]) * t
      arr[i * 3 + 1] = from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI) * 0.4
      arr[i * 3 + 2] = from[2] + (to[2] - from[2]) * t
    }
    pos.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"
          args={[positions, 3]} count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color={color} transparent opacity={0.9} />
    </points>
  )
}

// ─── Coordinates (absolute world space) ────────────────────────────────────
// Phase1 group at x=-14: machines at 0,2.5,5,7.5,10 → world: -14,-11.5,-9,-6.5,-4
// Phase2 group at x=-1:  machines at -3,4.5 → world: -4, 3.5
// Phase3 group at x=10:  machines at 0,2.5,5,7.5 → world: 10,12.5,15,17.5
// BSF group at [-2,0,-8]: machines at 0,3.5,7 → world: -2, 1.5, 5

const F = {
  // Main production line (z=0)
  marmita:    [-14,  0,    0] as const,
  dryer:      [-11.5, 0.2, 0] as const,
  sinfin:     [-9,  -0.5,  0] as const,
  kiln:       [-6.5, 0.3,  0] as const,
  mill:       [-4,   0,    0] as const,
  molTank:    [-4,   0,    0] as const,
  pump:       [-2.2,-0.3, 1.5] as const,
  dissolv:    [0,    0,   1.5] as const,
  transfer:   [1.8, -0.3, 1.5] as const,
  ribbonIn:   [3.5,  0,    0] as const,
  ribbonOut:  [3.5,  0,    0] as const,
  paddle:     [10,   0,    0] as const,
  lime:       [12.5, 0,    0] as const,
  vibrating:  [15,  -0.3,  0] as const,
  belt:       [17.5,-0.5,  0] as const,

  // Blood flour dedicated path (z=1.8 offset — Marmita→Dryer→Mill direct, bypassing kiln)
  bloodDryer: [-11.5, 0.5, 1.8] as const,
  bloodMill:  [-4,    0.3, 1.8] as const,

  // BSF sub-process (group at [-2,0,-8]: z = -8)
  bsf_bio:    [-2,   0,   -8] as const,
  bsf_dry:    [1.5,  0.2, -8] as const,
  bsf_mill:   [5,    0,   -8] as const,
}

export function MaterialFlow() {
  const { equipment } = useSimulatorStore()
  const eq = equipment

  return (
    <group>
      {/* Marmita → Secador */}
      <FlowParticles from={F.marmita} to={F.dryer}
        active={eq.marmita.active && eq.rotary_dryer.active} color="#ef4444" count={12} />

      {/* Secador → Sinfín */}
      <FlowParticles from={F.dryer} to={F.sinfin}
        active={eq.rotary_dryer.active && eq.screw_conveyor.active} color="#fb923c" count={12} />

      {/* Sinfín → Horno */}
      <FlowParticles from={F.sinfin} to={F.kiln}
        active={eq.screw_conveyor.active && eq.rotary_kiln.active} color="#f97316" count={12} />

      {/* Horno → Molino */}
      <FlowParticles from={F.kiln} to={F.mill}
        active={eq.rotary_kiln.active && eq.hammer_mill.active} color="#fbbf24" />

      {/* Molino → Mezcladora cintas */}
      <FlowParticles from={F.mill} to={F.ribbonIn}
        active={eq.hammer_mill.active && eq.ribbon_mixer.active} color="#a3e635" />

      {/* Tanque melaza → Bomba peristáltica */}
      <FlowParticles from={F.molTank} to={F.pump}
        active={eq.molasses_tank.active && eq.peristaltic_pump.active} color="#fbbf24" count={12} />

      {/* Bomba peristáltica → Mezcladora cintas */}
      <FlowParticles from={F.pump} to={F.ribbonIn}
        active={eq.peristaltic_pump.active && eq.ribbon_mixer.active} color="#fbbf24" count={12} />

      {/* Batea → Bomba centrífuga */}
      <FlowParticles from={F.dissolv} to={F.transfer}
        active={eq.dissolution_tank.active && eq.transfer_pump.active} color="#38bdf8" count={10} />

      {/* Bomba centrífuga → Mezcladora cintas */}
      <FlowParticles from={F.transfer} to={F.ribbonIn}
        active={eq.transfer_pump.active && eq.ribbon_mixer.active} color="#38bdf8" count={10} />

      {/* Mezcladora cintas → Mezcladora doble eje */}
      <FlowParticles from={F.ribbonOut} to={F.paddle}
        active={eq.ribbon_mixer.active && eq.paddle_mixer.active} color="#86efac" />

      {/* Dosificador cal → Mezcladora doble eje */}
      <FlowParticles from={F.lime} to={F.paddle}
        active={eq.lime_dosifier.active && eq.paddle_mixer.active} color="#22c55e" count={12} />

      {/* Mezcladora doble eje → Vibradora */}
      <FlowParticles from={F.paddle} to={F.vibrating}
        active={eq.paddle_mixer.active && eq.vibrating_table.active} color="#4ade80" />

      {/* Vibradora → Cinta */}
      <FlowParticles from={F.vibrating} to={F.belt}
        active={eq.vibrating_table.active && eq.belt_conveyor.active} color="#22c55e" count={12} />

      {/* ── Harina de Sangre (flujo dedicado, z=1.8 offset, color rojo sangre) ── */}
      {/* Marmita salida → Secador (blood path) */}
      <FlowParticles
        from={[-14, 0.3, 1.8]}
        to={F.bloodDryer}
        active={eq.marmita.active && eq.rotary_dryer.active && eq.hammer_mill.active}
        color="#dc2626" count={14} />
      {/* Secador → Molino directo (bypassing kiln — blood flour path) */}
      <FlowParticles
        from={F.bloodDryer}
        to={F.bloodMill}
        active={eq.marmita.active && eq.rotary_dryer.active && eq.hammer_mill.active}
        color="#b91c1c" count={14} />
      {/* Molino → Mezcladora (blood flour merges into main flow) */}
      <FlowParticles
        from={F.bloodMill}
        to={F.ribbonIn}
        active={eq.marmita.active && eq.rotary_dryer.active && eq.hammer_mill.active && eq.ribbon_mixer.active}
        color="#ef4444" count={12} />

      {/* ── Harina BSF (flujo sub-proceso, color lima) ── */}
      {/* Biorreactor → Secador BSF */}
      <FlowParticles from={F.bsf_bio} to={F.bsf_dry}
        active={eq.bsf_bioreactor.active && eq.bsf_dryer.active} color="#a3e635" count={12} />
      {/* Secador BSF → Molino BSF */}
      <FlowParticles from={F.bsf_dry} to={F.bsf_mill}
        active={eq.bsf_dryer.active && eq.bsf_mill.active} color="#84cc16" count={12} />
      {/* Molino BSF → Mezcladora de Cintas (Fase 2) */}
      <FlowParticles from={F.bsf_mill} to={F.ribbonIn}
        active={eq.bsf_mill.active && eq.ribbon_mixer.active} color="#65a30d" count={10} />
    </group>
  )
}
