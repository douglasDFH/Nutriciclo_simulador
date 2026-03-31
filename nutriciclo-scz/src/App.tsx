import { useEffect, useRef } from 'react'
import { FactoryScene } from './components/3d/FactoryScene'
import { ControlPanel } from './components/dashboard/ControlPanel'
import { ThemeToggle } from './components/ThemeToggle'
import { useSimulatorStore } from './store/useSimulatorStore'
import { Leaf } from 'lucide-react'

export default function App() {
  const { darkMode, tick_simulation, running } = useSimulatorStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Simulation loop: 1 tick per second
  useEffect(() => {
    if (running) {
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
  }, [running, tick_simulation])

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

      {/* Main layout: 3D top, panel bottom */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* 3D Scene — 55% height */}
        <div className="flex-none" style={{ height: '55%' }}>
          <FactoryScene />
        </div>

        {/* Control Panel — 45% height */}
        <div className="flex-none" style={{ height: '45%' }}>
          <ControlPanel />
        </div>
      </div>
    </div>
  )
}

function RunningBadge() {
  const { running, tick } = useSimulatorStore()
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${running ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
      <span className={running ? 'text-green-400' : 'text-gray-500'}>
        {running ? `T:${tick}` : 'Detenido'}
      </span>
    </div>
  )
}
