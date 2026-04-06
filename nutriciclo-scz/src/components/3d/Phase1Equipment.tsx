import { useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html, useGLTF } from '@react-three/drei'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { use3DStore } from '../../store/use3DStore'
import { DraggableMachine, FlowArrow } from './SceneHelpers'

// ── Preload GLB ───────────────────────────────────────────────────────────────
useGLTF.preload('/marmita.glb')
useGLTF.preload('/rotary_dryer.glb')
useGLTF.preload('/screw_conveyor.glb')
useGLTF.preload('/rotary_kiln.glb')
useGLTF.preload('/hammer%20mill.glb')

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

function MarmitaModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/marmita.glb')
  const cloned = scene.clone()
  applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function RotaryDryerModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/rotary_dryer.glb')
  const cloned = scene.clone()
  applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function ScrewConveyorModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/screw_conveyor.glb')
  const cloned = scene.clone()
  applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function RotaryKilnModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/rotary_kiln.glb')
  const cloned = scene.clone()
  applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function HammerMillModel({ active, status }: { active: boolean; status: string }) {
  const { scene } = useGLTF('/hammer%20mill.glb')
  const cloned = scene.clone()
  applyEmissive(cloned, active, status)
  return <primitive object={cloned} />
}

function geoColor(active: boolean, status: string, hot?: number): string {
  if (!active) return '#374151'
  if (status === 'error')   return '#ef4444'
  if (status === 'warning') return '#facc15'
  if (hot !== undefined && hot > 400) return '#f97316'
  if (hot !== undefined && hot > 200) return '#fb923c'
  return '#22c55e'
}

// ── Phase1Equipment ───────────────────────────────────────────────────────────
export function Phase1Equipment() {
  const { equipment, sensors } = useSimulatorStore()
  const { transforms, setScale, resetOne } = use3DStore()

  const [selected, setSelected] = useState<string | null>(null)
  const [hovered,  setHovered]  = useState<string | null>(null)

  const handleSelect = useCallback((id: string) =>
    setSelected(prev => prev === id ? null : id), [])
  const handleHover = useCallback((id: string | null) => setHovered(id), [])

  // Scroll = escala la máquina bajo el cursor
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

  // Sin geometrías animadas — todos los modelos son GLB
  useFrame(() => {})

  const TIPS: Record<string, { title: string; model: string; specs: string; extra?: string }> = {
    marmita:       { title: 'Marmita Industrial',   model: 'Jersa/Vulcano MV-300', specs: '300 L · 12 kW · AISI-304 · 150°C' },
    rotary_dryer:  { title: 'Secador Rotatorio',    model: 'Vulcanotec SD-500',    specs: '0.5–3 t/h · 22 kW · 60–70°C',    extra: `${sensors.dryerTemp.toFixed(0)}°C` },
    screw_conveyor:{ title: 'Transportador Sinfín', model: 'WAM Group TSC-250',    specs: '1–15 t/h · 5.5 kW · Ø250 mm' },
    rotary_kiln:   { title: 'Horno Rotatorio',      model: 'CITIC HIC RK-Series',  specs: '1–5 t/h · 75 kW · 500–600°C',   extra: `${sensors.kilnTemp.toFixed(0)}°C` },
    hammer_mill:   { title: 'Molino de Martillos',  model: 'RICHI 9FQ-Series',     specs: '1–10 t/h · 22–55 kW · Criba 2mm' },
  }

  function Tooltip({ id }: { id: string }) {
    if (selected !== id) return null
    const tip = TIPS[id]
    if (!tip) return null
    return (
      <Html position={[0, -1.6, 0]} center>
        <div style={{
          fontSize: 10, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.5,
          pointerEvents: 'none', background: 'rgba(8,8,8,0.90)',
          padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', color: '#fca5a5',
        }}>
          <b>{tip.title}</b><br />
          <span style={{ color: '#f87171', fontSize: 9 }}>{tip.model}</span><br />
          <span style={{ color: '#9ca3af', fontSize: 8 }}>{tip.specs}</span>
          {tip.extra && <><br /><span style={{ color: '#fb923c', fontWeight: 700 }}>{tip.extra}</span></>}
          <br />
          <span style={{ color: '#4b5563', fontSize: 7 }}>
            Drag=girar · Shift+Drag=mover · Scroll=escalar
          </span>
          <br />
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); resetOne(id); setSelected(null) }}
            style={{
              marginTop: 3, fontSize: 7, padding: '1px 6px',
              background: '#374151', border: '1px solid #4b5563',
              color: '#9ca3af', borderRadius: 3, cursor: 'pointer', pointerEvents: 'all',
            }}
          >↺ Resetear</button>
        </div>
      </Html>
    )
  }

  const dm = (id: string) => ({ id, onSelect: handleSelect, onHover: handleHover })

  // Colores de flujo según equipos activos
  const bloodFlow = equipment.marmita.active || equipment.rotary_dryer.active
  const boneFlow  = equipment.screw_conveyor.active || equipment.rotary_kiln.active
  const flourFlow = equipment.hammer_mill.active

  return (
    <group position={[-24, 0, 0]}>

      {/* ── Título ─────────────────────────────────────────────────────────── */}
      <Text position={[5, 4.2, 0]} fontSize={0.38} color="#fca5a5" anchorX="center">
        FASE 1 — Preparación Intensiva
      </Text>

      {/* ── Etiquetas de línea ─────────────────────────────────────────────── */}
      <Text position={[-1.2, 0.8, 3]} fontSize={0.22} color="#f87171" anchorX="center" rotation={[0, 0, 0]}>
        🩸 Línea Sangre
      </Text>
      <Text position={[-1.2, 0.8, -3]} fontSize={0.22} color="#fbbf24" anchorX="center">
        🦴 Línea Huesos
      </Text>

      {/* ── Flechas de flujo — Línea Sangre (z=+3) ─────────────────────────── */}
      {/* Marmita → Secador */}
      <FlowArrow from={[1.8, 0.1, 3]} to={[4, 0.1, 3]} color={bloodFlow ? '#f87171' : '#374151'} active={bloodFlow} />
      {/* Secador → Molino (diagonal) */}
      <FlowArrow from={[6.8, 0.1, 3]} to={[9.2, 0.1, 0.6]} color={equipment.rotary_dryer.active ? '#fb923c' : '#374151'} active={equipment.rotary_dryer.active} />

      {/* ── Flechas de flujo — Línea Huesos (z=-3) ─────────────────────────── */}
      {/* Transportador → Horno */}
      <FlowArrow from={[1.8, 0.1, -3]} to={[4, 0.1, -3]} color={boneFlow ? '#fbbf24' : '#374151'} active={boneFlow} />
      {/* Horno → Molino (diagonal) */}
      <FlowArrow from={[6.8, 0.1, -3]} to={[9.2, 0.1, -0.6]} color={equipment.rotary_kiln.active ? '#f97316' : '#374151'} active={equipment.rotary_kiln.active} />

      {/* ── Etiqueta salida ────────────────────────────────────────────────── */}
      <Text position={[11.5, 0.8, 0]} fontSize={0.2} color={flourFlow ? '#4ade80' : '#374151'} anchorX="center">
        Harinas →
      </Text>
      <Text position={[11.5, 0.4, 0]} fontSize={0.16} color="#6b7280" anchorX="center">
        Fase 2
      </Text>

      {/* ── Máquinas ───────────────────────────────────────────────────────── */}

      {/* Línea Sangre */}
      <DraggableMachine {...dm('marmita')}>
        <MarmitaModel active={equipment.marmita.active} status={equipment.marmita.status} />
        {equipment.marmita.active && <pointLight position={[0,1.5,0]} intensity={0.4} color="#ef4444" distance={3} />}
        <Tooltip id="marmita" />
      </DraggableMachine>

      <DraggableMachine {...dm('rotary_dryer')}>
        <RotaryDryerModel active={equipment.rotary_dryer.active} status={equipment.rotary_dryer.status} />
        {equipment.rotary_dryer.active && sensors.dryerTemp > 60 && (
          <pointLight position={[0,0,0]} intensity={0.6} color="#fb923c" distance={4} />
        )}
        <Tooltip id="rotary_dryer" />
      </DraggableMachine>

      {/* Línea Huesos */}
      <DraggableMachine {...dm('screw_conveyor')}>
        <ScrewConveyorModel active={equipment.screw_conveyor.active} status={equipment.screw_conveyor.status} />
        <Tooltip id="screw_conveyor" />
      </DraggableMachine>

      <DraggableMachine {...dm('rotary_kiln')}>
        <RotaryKilnModel active={equipment.rotary_kiln.active} status={equipment.rotary_kiln.status} />
        {equipment.rotary_kiln.active && sensors.kilnTemp > 200 && (
          <pointLight position={[0,0,0]} intensity={1.2} color="#f97316" distance={6} />
        )}
        <Tooltip id="rotary_kiln" />
      </DraggableMachine>

      {/* Convergencia */}
      <DraggableMachine {...dm('hammer_mill')}>
        <HammerMillModel active={equipment.hammer_mill.active} status={equipment.hammer_mill.status} />
        <Tooltip id="hammer_mill" />
      </DraggableMachine>
    </group>
  )
}

