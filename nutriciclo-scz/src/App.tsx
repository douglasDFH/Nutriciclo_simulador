import { useEffect, useRef } from 'react'
import { FactoryScene } from './components/3d/FactoryScene'
import { ControlPanel } from './components/dashboard/ControlPanel'
import { ThemeToggle } from './components/ThemeToggle'
import { useSimulatorStore } from './store/useSimulatorStore'
import { Leaf } from 'lucide-react'

export default function App() {
  const { darkMode, tick_simulation, running, equipment } = useSimulatorStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // El loop corre cuando hay equipos activos O cuando el plan de producción está corriendo.
  // Los equipos solos consumen materia prima y producen harinas (sin necesidad de "Iniciar").
  // "Iniciar Simulación" activa adicionalmente la producción de bloques.
  const hasActiveEquipment = Object.values(equipment).some((e) => e.active)

  useEffect(() => {
    const shouldRun = running || hasActiveEquipment
    if (shouldRun) {
      intervalRef.current = setInterval(() => {
        tick_simulation()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, hasActiveEquipment, tick_simulation])

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">NutriCiclo SCZ</h1>
            <p className="text-xs text-gray-500 leading-none">Simulador Biofábrica de Fertilizantes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RunningBadge />
          <ThemeToggle />
        </div>
      </header>

      {/* Main layout: 3D izquierda, panel derecha */}
      <div className="flex flex-row flex-1 min-h-0">
        {/* 3D Scene — ocupa el espacio restante */}
        <div className="flex-1 min-w-0">
          <FactoryScene />
        </div>

        {/* Control Panel — lateral derecho, ancho fijo */}
        <div className="flex-none w-80 border-l border-gray-800">
          <ControlPanel />
        </div>
      </div>
    </div>
  )
}

function RunningBadge() {
  const { running, tick, equipment } = useSimulatorStore()
  const hasActive = Object.values(equipment).some((e) => e.active)
  const color  = running ? 'bg-green-400' : hasActive ? 'bg-yellow-400' : 'bg-gray-600'
  const label  = running ? `Plan corriendo · T:${tick}` : hasActive ? `Equipos activos · T:${tick}` : 'Detenido'
  const tcolor = running ? 'text-green-400' : hasActive ? 'text-yellow-400' : 'text-gray-500'
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${color} ${(running || hasActive) ? 'animate-pulse' : ''}`} />
      <span className={tcolor}>{label}</span>
    </div>
  )
}
