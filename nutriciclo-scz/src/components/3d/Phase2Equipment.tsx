import { useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html, useGLTF } from '@react-three/drei'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { use3DStore } from '../../store/use3DStore'
import { DraggableMachine, FlowArrow } from './SceneHelpers'

// ── Preload GLB ───────────────────────────────────────────────────────────────
useGLTF.preload('/molasses_tank.glb')
useGLTF.preload('/peristaltic%20pump%20.glb')
useGLTF.preload('/dissolution_tank.glb')
useGLTF.preload('/transfer_pump.glb')
useGLTF.preload('/ribbon%20mixer.glb')

// ── Emissive helper ───────────────────────────────────────────────────────────
import * as THREE from 'three'
import type { Mesh } from 'three'

function applyEmissive(scene: THREE.Object3D, active: boolean, status: string) {
  scene.traverse((child) => {
    if (!(child as Mesh).isMesh) return
    const mat = (child as Mesh).material as {
      emissive?: { set: (c: string) => void }; emissiveIntensity?: number
    }
    if (!mat?.emissive) return
    if (!active)                   { mat.emissive.set('#000'); if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0 }
    else if (status === 'error')   { mat.emissive.set('#ef4444'); if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.4 }
    else if (status === 'warning') { mat.emissive.set('#facc15'); if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.3 }
    else                           { mat.emissive.set('#3b82f6'); if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.2 }
  })
}

// ── Modelos GLB ───────────────────────────────────────────────────────────────
function MolassesTankModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/molasses_tank.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function PeristalticPumpModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/peristaltic%20pump%20.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function TransferPumpModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/transfer_pump.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function DissolutionTankModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/dissolution_tank.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function RibbonMixerModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/ribbon%20mixer.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

// ── Phase2Equipment ───────────────────────────────────────────────────────────
// Flujo Fase 2:
//   Línea Melaza  (z=+3): Tanque Melaza → Bomba Peristáltica ──────────────┐
//   Línea Disoluc.(z=-3): Batea Disolución → Bomba Centrífuga ─────────────┤→ Mezcladora Cintas
export function Phase2Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const { transforms, setScale, resetOne } = use3DStore()

  const [selected, setSelected] = useState<string | null>(null)
  const [hovered,  setHovered]  = useState<string | null>(null)

  const handleSelect = useCallback((id: string) =>
    setSelected(prev => prev === id ? null : id), [])
  const handleHover = useCallback((id: string | null) => setHovered(id), [])

  // Scroll = escalar
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      if (!hovered) return
      e.preventDefault()
      const cur = transforms[hovered]
      if (cur) setScale(hovered, Math.max(0.1, Math.min(8, cur.scale - e.deltaY * 0.002)))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [hovered, transforms, setScale])

  useFrame(() => {})

  const eq = equipment
  const melazaFlow  = eq.molasses_tank.active || eq.peristaltic_pump.active
  const disolFlow   = eq.dissolution_tank.active || eq.transfer_pump.active
  const mixerActive = eq.ribbon_mixer.active

  const TIPS: Record<string, { title: string; model: string; specs: string; extra?: string }> = {
    molasses_tank:    { title: 'Tanque Melaza',         model: 'Inoxpa TCI-2000',         specs: '1000–5000 L · AISI-304 · 1.5 kW' },
    peristaltic_pump: { title: 'Bomba Peristáltica',    model: 'ProMinent DULCOFLEX DFYa', specs: '10 ml/h–660 L/h · ±1%',          extra: `${sensors.molassesFlowActual.toFixed(1)} L/h` },
    dissolution_tank: { title: 'Batea Disolución',      model: 'Inoxpa DT-300',            specs: '200–500 L · 3 kW · AISI-304' },
    transfer_pump:    { title: 'Bomba Centrífuga',      model: 'Alfa Laval LKH-25',        specs: '5–50 m³/h · 5.5 kW · AISI-316L' },
    ribbon_mixer:     { title: 'Mezcladora de Cintas',  model: 'Huaxin HJJ-3000',          specs: '500–3000 kg/lote · 37 kW',        extra: `${sensors.tankPressure.toFixed(1)} PSI` },
  }

  function Tooltip({ id }: { id: string }) {
    if (selected !== id) return null
    const tip = TIPS[id]; if (!tip) return null
    return (
      <Html position={[0, -1.8, 0]} center>
        <div style={{
          fontSize: 10, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.5,
          pointerEvents: 'none', background: 'rgba(8,8,8,0.90)',
          padding: '6px 10px', borderRadius: 6, border: '1px solid #3b82f6', color: '#93c5fd',
        }}>
          <b>{tip.title}</b><br />
          <span style={{ color: '#60a5fa', fontSize: 9 }}>{tip.model}</span><br />
          <span style={{ color: '#9ca3af', fontSize: 8 }}>{tip.specs}</span>
          {tip.extra && <><br /><span style={{ color: '#38bdf8', fontWeight: 700 }}>{tip.extra}</span></>}
          <br />
          <span style={{ color: '#4b5563', fontSize: 7 }}>Drag=girar · Shift+Drag=mover · Scroll=escalar</span>
          <br />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); resetOne(id); setSelected(null) }}
            style={{
              marginTop: 3, fontSize: 7, padding: '1px 6px',
              background: '#1e3a5f', border: '1px solid #3b82f6',
              color: '#93c5fd', borderRadius: 3, cursor: 'pointer', pointerEvents: 'all',
            }}
          >↺ Resetear</button>
        </div>
      </Html>
    )
  }

  const dm = (id: string) => ({ id, onSelect: handleSelect, onHover: handleHover })

  return (
    <group position={[-4, 0, 0]}>

      {/* ── Título ─────────────────────────────────────────────────────────── */}
      <Text position={[5, 4.2, 0]} fontSize={0.38} color="#93c5fd" anchorX="center">
        FASE 2 — Mezcla Húmeda
      </Text>

      {/* ── Etiquetas de línea ─────────────────────────────────────────────── */}
      <Text position={[-1.2, 0.8,  3]} fontSize={0.22} color="#fbbf24" anchorX="center">
        🍯 Línea Melaza
      </Text>
      <Text position={[-1.2, 0.8, -3]} fontSize={0.22} color="#38bdf8" anchorX="center">
        💧 Línea Disolución
      </Text>

      {/* ── Flechas de flujo ───────────────────────────────────────────────── */}
      {/* Melaza: Tanque → Bomba Peristáltica */}
      <FlowArrow from={[2, 0.1, 3]} to={[4, 0.1, 3]}
        color={melazaFlow ? '#fbbf24' : '#374151'} active={melazaFlow} />
      {/* Bomba Peristáltica → Mezcladora */}
      <FlowArrow from={[6.5, 0.1, 3]} to={[9.2, 0.1, 0.6]}
        color={eq.peristaltic_pump.active ? '#f59e0b' : '#374151'} active={eq.peristaltic_pump.active} />

      {/* Disolución: Batea → Bomba Centrífuga */}
      <FlowArrow from={[2, 0.1, -3]} to={[4, 0.1, -3]}
        color={disolFlow ? '#38bdf8' : '#374151'} active={disolFlow} />
      {/* Bomba Centrífuga → Mezcladora */}
      <FlowArrow from={[6.5, 0.1, -3]} to={[9.2, 0.1, -0.6]}
        color={eq.transfer_pump.active ? '#0ea5e9' : '#374151'} active={eq.transfer_pump.active} />

      {/* ── Salida ─────────────────────────────────────────────────────────── */}
      <Text position={[12.5, 0.8, 0]} fontSize={0.2} color={mixerActive ? '#4ade80' : '#374151'} anchorX="center">
        Mezcla →
      </Text>
      <Text position={[12.5, 0.4, 0]} fontSize={0.16} color="#6b7280" anchorX="center">
        Fase 3
      </Text>

      {/* ── Línea Melaza (z = +3) ──────────────────────────────────────────── */}
      <DraggableMachine {...dm('molasses_tank')}>
        <MolassesTankModel active={eq.molasses_tank.active} status={eq.molasses_tank.status} />
        <Tooltip id="molasses_tank" />
      </DraggableMachine>

      <DraggableMachine {...dm('peristaltic_pump')}>
        <PeristalticPumpModel active={eq.peristaltic_pump.active} status={eq.peristaltic_pump.status} />
        {eq.peristaltic_pump.active && (
          <pointLight position={[0, 0.5, 0]} intensity={0.3} color="#fbbf24" distance={3} />
        )}
        <Tooltip id="peristaltic_pump" />
      </DraggableMachine>

      {/* ── Línea Disolución (z = -3) ──────────────────────────────────────── */}
      <DraggableMachine {...dm('dissolution_tank')}>
        <DissolutionTankModel active={eq.dissolution_tank.active} status={eq.dissolution_tank.status} />
        <Tooltip id="dissolution_tank" />
      </DraggableMachine>

      <DraggableMachine {...dm('transfer_pump')}>
        <TransferPumpModel active={eq.transfer_pump.active} status={eq.transfer_pump.status} />
        <Tooltip id="transfer_pump" />
      </DraggableMachine>

      {/* ── Convergencia — Mezcladora Cintas (centro) ──────────────────────── */}
      <DraggableMachine {...dm('ribbon_mixer')}>
        <RibbonMixerModel active={eq.ribbon_mixer.active} status={eq.ribbon_mixer.status} />
        {mixerActive && <pointLight position={[0, 0, 0]} intensity={0.5} color="#3b82f6" distance={4} />}
        <Tooltip id="ribbon_mixer" />
      </DraggableMachine>

    </group>
  )
}
