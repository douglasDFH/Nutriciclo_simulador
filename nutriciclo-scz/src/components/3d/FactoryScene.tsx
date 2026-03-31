import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import { Suspense } from 'react'
import { Phase1Equipment } from './Phase1Equipment'
import { Phase2Equipment } from './Phase2Equipment'
import { Phase3Equipment } from './Phase3Equipment'
import { BSFSubProcess } from './BSFSubProcess'
import { MaterialFlow } from './MaterialFlow'
import { useSimulatorStore } from '../../store/useSimulatorStore'

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4ade80" />
      <pointLight position={[0, 4, -10]} intensity={0.3} color="#a3e635" />

      {/* Ground grid */}
      <Grid
        args={[50, 50]}
        position={[0, -0.5, 0]}
        cellColor="#1f2937"
        sectionColor="#374151"
        fadeDistance={35}
        infiniteGrid
      />

      {/* Main production line */}
      <Phase1Equipment />
      <Phase2Equipment />
      <Phase3Equipment />

      {/* BSF sub-process (behind main line, z = -8) */}
      <BSFSubProcess />

      <MaterialFlow />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={5}
        maxDistance={70}
        target={[4, 0, 0]}
      />
      <Environment preset="night" />
    </>
  )
}

export function FactoryScene() {
  const { darkMode } = useSimulatorStore()

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [4, 16, 30], fov: 55 }}
        style={{ background: darkMode ? '#030712' : '#0f172a' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>

      {/* Phase labels overlay */}
      <div className="absolute top-3 left-3 flex gap-2 text-xs pointer-events-none flex-wrap">
        <span className="px-2 py-1 bg-red-900/70 text-red-300 rounded border border-red-700">
          FASE 1 — Preparación
        </span>
        <span className="px-2 py-1 bg-blue-900/70 text-blue-300 rounded border border-blue-700">
          FASE 2 — Mezcla
        </span>
        <span className="px-2 py-1 bg-green-900/70 text-green-300 rounded border border-green-700">
          FASE 3 — Fraguado
        </span>
        <span className="px-2 py-1 bg-lime-900/70 text-lime-300 rounded border border-lime-700">
          SUB-PROC — BSF
        </span>
      </div>

      {/* Production overlay */}
      <ProductionOverlay />
    </div>
  )
}

function ProductionOverlay() {
  const { sensors, running } = useSimulatorStore()
  return (
    <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur border border-gray-700 rounded-lg p-2 text-xs space-y-1">
      <div className="text-gray-400">Producción actual</div>
      <div className="text-green-400 font-mono text-lg font-bold leading-none">
        {sensors.productionRate.toFixed(1)} kg/h
      </div>
      {sensors.bloodFlourRate > 0 && (
        <div className="text-red-400 font-mono text-xs">
          🩸 Sangre: {sensors.bloodFlourRate.toFixed(1)} kg/h
        </div>
      )}
      {sensors.bsfFlourRate > 0 && (
        <div className="text-lime-400 font-mono text-xs">
          🪲 BSF: {sensors.bsfFlourRate.toFixed(1)} kg/h
        </div>
      )}
      <div className={`text-xs ${running ? 'text-green-400' : 'text-gray-500'}`}>
        {running ? '● SIMULANDO' : '○ PAUSADO'}
      </div>
    </div>
  )
}
