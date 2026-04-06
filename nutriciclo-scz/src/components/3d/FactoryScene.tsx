import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Phase1Equipment } from './Phase1Equipment'
import { Phase2Equipment } from './Phase2Equipment'
import { Phase3Equipment } from './Phase3Equipment'
import { BSFSubProcess } from './BSFSubProcess'
import { MaterialFlow } from './MaterialFlow'
import { PhaseInfoPanel, PHASE_CONFIG } from './PhaseInfoPanel'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import type { PhaseId } from '../../simulation/types'
import { clsx } from 'clsx'

// Posición central de cada fase para enfocar la cámara
const PHASE_CAMERA_TARGET: Record<string, [number, number, number]> = {
  phase1:  [-18, 0,   0],   // grupo en -24, máquinas hasta -12 → centro -18
  phase2:  [2,   0,   0],   // grupo en -4,  máquinas hasta +8  → centro  2
  phase3:  [22,  0,   0],   // grupo en +16, máquinas hasta +28 → centro 22
  subproc: [1,   0, -14],   // grupo en -4,  máquinas hasta +6, z=-18 → centro
}

function SceneContent({ selectedPhase }: { selectedPhase: PhaseId | null }) {
  const show = (phase: PhaseId) => selectedPhase === null || selectedPhase === phase
  const target = selectedPhase ? PHASE_CAMERA_TARGET[selectedPhase] : ([2, 0, 0] as [number, number, number])

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

      {/* Mostrar solo la fase seleccionada (o todas si ninguna está seleccionada) */}
      {show('phase1')  && <Phase1Equipment />}
      {show('phase2')  && <Phase2Equipment />}
      {show('phase3')  && <Phase3Equipment />}
      {show('subproc') && <BSFSubProcess />}

      {/* Flujo de materiales solo en vista completa */}
      {selectedPhase === null && <MaterialFlow />}

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={3}
        maxDistance={70}
        target={target}
      />
      <Environment preset="night" />
    </>
  )
}

export function FactoryScene() {
  const { darkMode, equipment } = useSimulatorStore()
  const [selectedPhase, setSelectedPhase] = useState<PhaseId | null>(null)

  function handlePhaseClick(phaseId: PhaseId) {
    setSelectedPhase((prev) => (prev === phaseId ? null : phaseId))
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [2, 28, 55], fov: 60 }}
        style={{ background: darkMode ? '#030712' : '#0f172a' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <SceneContent selectedPhase={selectedPhase} />
        </Suspense>
      </Canvas>

      {/* Panel lateral de fase seleccionada */}
      {selectedPhase && (
        <PhaseInfoPanel
          phaseId={selectedPhase}
          onClose={() => setSelectedPhase(null)}
        />
      )}

      {/* Botones de fase — top left */}
      <div className={clsx(
        'absolute top-3 flex gap-2 text-xs flex-wrap transition-all duration-300',
        selectedPhase ? 'left-[19rem]' : 'left-3'
      )}>
        {PHASE_CONFIG.map((phase) => {
          const activeCount = phase.equipmentIds.filter((id) => equipment[id].active).length
          const isSelected = selectedPhase === phase.id
          return (
            <button
              key={phase.id}
              onClick={() => handlePhaseClick(phase.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all',
                'hover:scale-105 active:scale-95',
                isSelected
                  ? `${phase.color} ${phase.border} ${phase.bg} shadow-lg ring-1 ring-current`
                  : `${phase.color} ${phase.border} bg-gray-950/80 hover:${phase.bg}`
              )}
            >
              {/* dot de estado */}
              <span className={clsx(
                'w-2 h-2 rounded-full flex-shrink-0',
                activeCount > 0 ? phase.dot : 'bg-gray-600'
              )} />
              <span>{phase.label}</span>
              <span className="opacity-60 font-normal">— {phase.subtitle}</span>
              {activeCount > 0 && (
                <span className={clsx('ml-1 text-xs font-mono', phase.color)}>
                  {activeCount}/{phase.equipmentIds.length}
                </span>
              )}
            </button>
          )
        })}
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
