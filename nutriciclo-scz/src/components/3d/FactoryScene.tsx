import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { Suspense, useState, Component } from 'react'
import type { ReactNode } from 'react'

// ── ErrorBoundary para evitar que un error de GLB crashee todo el Canvas ──────
class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
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

function SceneContent({ selectedPhase, darkMode }: { selectedPhase: PhaseId | null; darkMode: boolean }) {
  const show = (phase: PhaseId) => selectedPhase === null || selectedPhase === phase
  const target = selectedPhase ? PHASE_CAMERA_TARGET[selectedPhase] : ([2, 0, 0] as [number, number, number])

  return (
    <>
      <ambientLight intensity={darkMode ? 0.6 : 0.9} />
      <directionalLight position={[10, 10, 5]} intensity={darkMode ? 1.5 : 1.8} castShadow />
      <directionalLight position={[-10, 8, -5]} intensity={darkMode ? 0.4 : 0.6} />
      <pointLight position={[-5, 5, -5]} intensity={darkMode ? 0.5 : 0.3} color="#4ade80" />
      <pointLight position={[0, 4, -10]} intensity={darkMode ? 0.3 : 0.2} color="#a3e635" />

      {/* Piso gris sólido en modo claro */}
      {!darkMode && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#d4d8dd" />
        </mesh>
      )}

      {/* Ground grid */}
      <Grid
        args={[50, 50]}
        position={[0, -0.5, 0]}
        cellColor={darkMode ? '#1f2937' : '#b0b8c4'}
        sectionColor={darkMode ? '#374151' : '#8a95a3'}
        fadeDistance={35}
        infiniteGrid
      />

      {/* Mostrar solo la fase seleccionada (o todas si ninguna está seleccionada) */}
      {show('phase1')  && <SceneErrorBoundary><Suspense fallback={null}><Phase1Equipment /></Suspense></SceneErrorBoundary>}
      {show('phase2')  && <SceneErrorBoundary><Suspense fallback={null}><Phase2Equipment /></Suspense></SceneErrorBoundary>}
      {show('phase3')  && <SceneErrorBoundary><Suspense fallback={null}><Phase3Equipment /></Suspense></SceneErrorBoundary>}
      {show('subproc') && <SceneErrorBoundary><Suspense fallback={null}><BSFSubProcess /></Suspense></SceneErrorBoundary>}

      {/* Flujo de materiales solo en vista completa */}
      {selectedPhase === null && <SceneErrorBoundary><Suspense fallback={null}><MaterialFlow /></Suspense></SceneErrorBoundary>}

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        minDistance={3}
        maxDistance={70}
        target={target}
      />
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
        style={{ background: darkMode ? '#030712' : '#e8ecf0' }}
        gl={{ antialias: true }}
      >
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <SceneContent selectedPhase={selectedPhase} darkMode={darkMode} />
          </Suspense>
        </SceneErrorBoundary>
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
