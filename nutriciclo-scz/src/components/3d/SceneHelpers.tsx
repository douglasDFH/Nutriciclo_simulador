import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { use3DStore } from '../../store/use3DStore'

// ── DraggableMachine ──────────────────────────────────────────────────────────
// Lee/escribe transforms en use3DStore (persiste entre fases y recargas)
// • Drag              → gira la máquina
// • Shift + Drag      → mueve la máquina en el plano
// • Scroll encima     → escala la máquina
// • Click sin mover   → llama onSelect
export function DraggableMachine({
  id, onSelect, onHover, children,
}: {
  id: string
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  children: React.ReactNode
}) {
  const { camera, gl, controls } = useThree()
  const { transforms, setPosition, setRotation } = use3DStore()
  const t = transforms[id] ?? {
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: 1,
  }

  type Mode = null | 'rotate' | 'move'
  const mode       = useRef<Mode>(null)
  const hasMoved   = useRef(false)
  const lastPtr    = useRef({ x: 0, y: 0 })
  const startInter = useRef(new THREE.Vector3())
  const startPos   = useRef<[number, number, number]>([0, 0, 0])
  const dragPlane  = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const ray        = useRef(new THREE.Raycaster())

  const planePoint = (cx: number, cy: number) => {
    const rect = gl.domElement.getBoundingClientRect()
    ray.current.setFromCamera(
      new THREE.Vector2(
        ((cx - rect.left) / rect.width)  * 2 - 1,
        -((cy - rect.top)  / rect.height) * 2 + 1,
      ),
      camera,
    )
    const p = new THREE.Vector3()
    return ray.current.ray.intersectPlane(dragPlane.current, p) ? p : null
  }

  const ctrl = (enabled: boolean) =>
    controls && ((controls as unknown as { enabled: boolean }).enabled = enabled)

  // Garantía de seguridad: si el pointerUp no llega al objeto 3D
  // (mouse soltado fuera del canvas), re-habilitar controles siempre
  useEffect(() => {
    const safeRelease = () => {
      if (mode.current !== null) {
        mode.current = null
        hasMoved.current = false
        ctrl(true)
        gl.domElement.style.cursor = 'default'
      }
    }
    window.addEventListener('pointerup', safeRelease)
    window.addEventListener('pointercancel', safeRelease)
    return () => {
      window.removeEventListener('pointerup', safeRelease)
      window.removeEventListener('pointercancel', safeRelease)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, gl])

  const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hasMoved.current = false
    lastPtr.current  = { x: e.clientX, y: e.clientY }
    gl.domElement.setPointerCapture(e.pointerId)
    ctrl(false)
    if (e.shiftKey) {
      mode.current = 'move'
      const p = planePoint(e.clientX, e.clientY)
      if (p) startInter.current.copy(p)
      startPos.current = [...t.position]
      gl.domElement.style.cursor = 'grabbing'
    } else {
      mode.current = 'rotate'
      gl.domElement.style.cursor = 'crosshair'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.position, t.rotation])

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!mode.current) return
    const dx = e.clientX - lastPtr.current.x
    const dy = e.clientY - lastPtr.current.y
    lastPtr.current = { x: e.clientX, y: e.clientY }
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) hasMoved.current = true
    if (mode.current === 'rotate') {
      setRotation(id, [
        t.rotation[0] + dy * 0.012,
        t.rotation[1] + dx * 0.012,
        t.rotation[2],
      ])
    } else {
      const p = planePoint(e.clientX, e.clientY)
      if (p) setPosition(id, [
        startPos.current[0] + (p.x - startInter.current.x),
        startPos.current[1],
        startPos.current[2] + (p.z - startInter.current.z),
      ])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, t.rotation])

  const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
    const moved = hasMoved.current
    mode.current = null
    gl.domElement.releasePointerCapture(e.pointerId)
    ctrl(true)
    gl.domElement.style.cursor = 'grab'
    if (!moved) onSelect(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onSelect])

  const onPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(id)
    if (!mode.current) gl.domElement.style.cursor = 'grab'
  }, [id, onHover, gl])

  const onPointerOut = useCallback(() => {
    onHover(null)
    if (!mode.current) gl.domElement.style.cursor = 'default'
  }, [onHover, gl])

  return (
    <group
      position={t.position}
      rotation={t.rotation}
      scale={[t.scale, t.scale, t.scale]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {children}
    </group>
  )
}

// ── FlowArrow: tubo animado con bolitas entre dos puntos ─────────────────────
export function FlowArrow({
  from, to, color, active,
}: {
  from: [number, number, number]
  to:   [number, number, number]
  color: string
  active: boolean
}) {
  const [tick, setTick] = useState(0)
  useFrame((_, delta) => { if (active) setTick(t => t + delta) })

  const mid    = from.map((v, i) => (v + to[i]) / 2) as [number, number, number]
  const dx     = to[0] - from[0]
  const dz     = to[2] - from[2]
  const length = Math.sqrt(dx * dx + dz * dz)
  if (length < 0.01) return null
  const angle  = Math.atan2(dx, dz)

  return (
    <group>
      {/* Tubo base */}
      <mesh position={mid} rotation={[0, angle, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, length, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.4 : 0} />
      </mesh>
      {/* Punta */}
      <mesh
        position={[to[0] - dx / length * 0.3, to[1], to[2] - dz / length * 0.3]}
        rotation={[0, angle, Math.PI / 2]}
      >
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.6 : 0} />
      </mesh>
      {/* Bolitas animadas */}
      {active && [0, 1, 2].map(i => {
        const t = ((tick * 0.6 + i / 3) % 1)
        return (
          <mesh key={i} position={[from[0] + dx * t, from[1] + 0.08, from[2] + dz * t]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </mesh>
        )
      })}
    </group>
  )
}
