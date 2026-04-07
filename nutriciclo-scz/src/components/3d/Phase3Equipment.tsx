import { useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { Mesh } from 'three'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { use3DStore } from '../../store/use3DStore'
import { DraggableMachine, FlowArrow } from './SceneHelpers'

// ── Preload GLB ───────────────────────────────────────────────────────────────
useGLTF.preload('/paddlemixer0%20.glb')
useGLTF.preload('/paddlemixer1%20.glb')
useGLTF.preload('/limedosifier.glb')
useGLTF.preload('/vibrating_table.glb')
useGLTF.preload('/belt_conveyor.glb')
useGLTF.preload('/ventilation.glb')

// ── Emissive helper ───────────────────────────────────────────────────────────
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
    else                           { mat.emissive.set('#22c55e'); if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.2 }
  })
}

// ── Modelos GLB ───────────────────────────────────────────────────────────────
function PaddleMixer0Model({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/paddlemixer0%20.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function PaddleMixer1Model({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/paddlemixer1%20.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function LimeDosifierModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/limedosifier.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function VibratingTableModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/vibrating_table.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function BeltConveyorModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/belt_conveyor.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function VentilationModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/ventilation.glb')
  const cloned = scene.clone(); applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

// ── Phase3Equipment ───────────────────────────────────────────────────────────
export function Phase3Equipment() {
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

  const TIPS: Record<string, { title: string; model: string; specs: string; extra?: string }> = {
    paddle_mixer:    { title: 'Mezcladora Paletas Doble Eje',   model: 'Huaxin WLDH-2000',               specs: '1–5 t/lote · 45 kW · 3–8 min',          extra: eq.paddle_mixer.active ? `${sensors.exothermicTemp.toFixed(1)} °C` : undefined },
    paddle_mixer_2:  { title: 'Mezcladora Paletas D.Eje #2',    model: 'Huaxin WLDH-2000 #2',            specs: '1–5 t/lote · 45 kW · 3–8 min (paralelo)' },
    lime_dosifier:   { title: 'Dosificador de Cal Viva',         model: 'Schenck K-ML-D5-KT20',           specs: '50–500 kg/h · ±0.5% · 2.2 kW',          extra: eq.lime_dosifier.active ? `${sensors.exothermicTemp.toFixed(1)} °C` : undefined },
    vibrating_table: { title: 'Vibradora de Mesa + Moldes',     model: 'Vibra Technologie VT-1000',      specs: '20–100 ud/ciclo · 3000–6000 VPM · 3 kW' },
    belt_conveyor:   { title: 'Cinta Transportadora',           model: 'Interroll FlatTop Series',       specs: 'variable · 0.1–1 m/s · 1.5 kW' },
    ventilation:     { title: 'Sistema de Ventilación',         model: 'Sodeca CMP-4500',                specs: '2000–8000 m³/h · 5.5 kW' },
  }

  function Tooltip({ id }: { id: string }) {
    if (selected !== id) return null
    const tip = TIPS[id]; if (!tip) return null
    return (
      <Html position={[0, -1.8, 0]} center>
        <div style={{
          fontSize: 10, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.5,
          pointerEvents: 'none', background: 'rgba(8,8,8,0.90)',
          padding: '6px 10px', borderRadius: 6, border: '1px solid #22c55e', color: '#86efac',
        }}>
          <b>{tip.title}</b><br />
          <span style={{ color: '#4ade80', fontSize: 9 }}>{tip.model}</span><br />
          <span style={{ color: '#9ca3af', fontSize: 8 }}>{tip.specs}</span>
          {tip.extra && <><br /><span style={{ color: '#f97316', fontWeight: 700 }}>{tip.extra}</span></>}
          <br />
          <span style={{ color: '#4b5563', fontSize: 7 }}>Drag=girar · Shift+Drag=mover · Scroll=escalar</span>
          <br />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); resetOne(id); setSelected(null) }}
            style={{
              marginTop: 3, fontSize: 7, padding: '1px 6px',
              background: '#14532d', border: '1px solid #22c55e',
              color: '#86efac', borderRadius: 3, cursor: 'pointer', pointerEvents: 'all',
            }}
          >↺ Resetear</button>
        </div>
      </Html>
    )
  }

  const dm = (id: string) => ({ id, onSelect: handleSelect, onHover: handleHover })

  const paddle1Active = eq.paddle_mixer.active
  const paddle2Active = eq.paddle_mixer_2.active
  const limeActive    = eq.lime_dosifier.active
  const vibActive     = eq.vibrating_table.active
  const beltActive    = eq.belt_conveyor.active

  return (
    <group position={[16, 0, 0]}>

      {/* ── Título ─────────────────────────────────────────────────────────── */}
      <Html position={[5, 4.5, 0]} center>
        <div style={{ color: '#86efac', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', pointerEvents: 'none', textShadow: '0 1px 3px #000' }}>
          FASE 3 — Fraguado
        </div>
      </Html>

      {/* ── Etiquetas de línea ─────────────────────────────────────────────── */}
      <Html position={[-1.2, 0.8, 3]} center>
        <div style={{ color: '#4ade80', fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none', textShadow: '0 1px 2px #000' }}>🔧 Mezcladora #1</div>
      </Html>
      <Html position={[-1.2, 0.8, -3]} center>
        <div style={{ color: '#86efac', fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none', textShadow: '0 1px 2px #000' }}>🔧 Mezcladora #2</div>
      </Html>

      {/* ── Flechas de flujo ───────────────────────────────────────────────── */}
      {/* Mezcladora #1 → Cal */}
      <FlowArrow from={[2.5, 0.1, 3]} to={[3.5, 0.1, 1]}
        color={paddle1Active ? '#22c55e' : '#374151'} active={paddle1Active} />
      {/* Mezcladora #2 → Cal */}
      <FlowArrow from={[2.5, 0.1, -3]} to={[3.5, 0.1, -1]}
        color={paddle2Active ? '#22c55e' : '#374151'} active={paddle2Active} />
      {/* Cal → Mesa Vibradora */}
      <FlowArrow from={[5.5, 0.1, 0]} to={[7.5, 0.1, 0]}
        color={limeActive ? '#f97316' : '#374151'} active={limeActive} />
      {/* Mesa Vibradora → Cinta */}
      <FlowArrow from={[10, 0.1, 0]} to={[11.5, 0.1, 0]}
        color={vibActive ? '#22c55e' : '#374151'} active={vibActive} />
      {/* Salida cinta */}
      <FlowArrow from={[14, 0.1, 0]} to={[15.5, 0.1, 0]}
        color={beltActive ? '#4ade80' : '#374151'} active={beltActive} />

      {/* ── Etiqueta salida ────────────────────────────────────────────────── */}
      <Html position={[16, 0.8, 0]} center>
        <div style={{ color: beltActive ? '#4ade80' : '#6b7280', fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none', textShadow: '0 1px 2px #000' }}>
          Producto → Empaque
        </div>
      </Html>

      {/* ── Mezcladora Paletas #1 (z = +3) ────────────────────────────────── */}
      <DraggableMachine {...dm('paddle_mixer')}>
        <PaddleMixer0Model active={eq.paddle_mixer.active} status={eq.paddle_mixer.status} />
        {paddle1Active && <pointLight position={[0, 0.5, 0]} intensity={0.4} color="#22c55e" distance={4} />}
        <Tooltip id="paddle_mixer" />
      </DraggableMachine>

      {/* ── Mezcladora Paletas #2 (z = -3) ────────────────────────────────── */}
      <DraggableMachine {...dm('paddle_mixer_2')}>
        <PaddleMixer1Model active={eq.paddle_mixer_2.active} status={eq.paddle_mixer_2.status} />
        {paddle2Active && <pointLight position={[0, 0.5, 0]} intensity={0.4} color="#22c55e" distance={4} />}
        <Tooltip id="paddle_mixer_2" />
      </DraggableMachine>

      {/* ── Dosificador de Cal Viva (centro) ──────────────────────────────── */}
      <DraggableMachine {...dm('lime_dosifier')}>
        <LimeDosifierModel active={eq.lime_dosifier.active} status={eq.lime_dosifier.status} />
        {limeActive && sensors.exothermicTemp > 50 && (
          <pointLight position={[0, 0, 0]} intensity={0.8} color="#f97316" distance={5} />
        )}
        <Tooltip id="lime_dosifier" />
      </DraggableMachine>

      {/* ── Vibradora de Mesa ─────────────────────────────────────────────── */}
      <DraggableMachine {...dm('vibrating_table')}>
        <VibratingTableModel active={eq.vibrating_table.active} status={eq.vibrating_table.status} />
        <Tooltip id="vibrating_table" />
      </DraggableMachine>

      {/* ── Cinta Transportadora ──────────────────────────────────────────── */}
      <DraggableMachine {...dm('belt_conveyor')}>
        <BeltConveyorModel active={eq.belt_conveyor.active} status={eq.belt_conveyor.status} />
        <Tooltip id="belt_conveyor" />
      </DraggableMachine>

      {/* ── Sistema de Ventilación (elevado) ──────────────────────────────── */}
      <DraggableMachine {...dm('ventilation')}>
        <VentilationModel active={eq.ventilation.active} status={eq.ventilation.status} />
        {eq.ventilation.active && <pointLight position={[0, 0.5, 0]} intensity={0.3} color="#86efac" distance={3} />}
        <Tooltip id="ventilation" />
      </DraggableMachine>

    </group>
  )
}
