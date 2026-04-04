import { useState } from 'react'
import { MonitoringCharts } from './MonitoringCharts'
import { MachineControls } from './MachineControls'
import { ScenarioControls } from './ScenarioControls'
import { AlertsPanel } from './AlertsPanel'
import { ProductionPanel } from './ProductionPanel'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { Activity, Sliders, Bell, Play, Pause, RotateCcw, Factory } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { id: 'monitor',    label: 'Monitoreo',  icon: Activity },
  { id: 'production', label: 'Producción', icon: Factory },
  { id: 'scenario',   label: 'Escenarios', icon: Sliders },
  { id: 'alerts',     label: 'Alertas',    icon: Bell },
] as const

type TabId = typeof TABS[number]['id']

export function ControlPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('monitor')
  const { running, toggleRunning, reset, alerts, blocksProduced, productionPlan } = useSimulatorStore()
  const errorCount = alerts.filter((a) => a.type === 'error').length
  const prodComplete = blocksProduced >= productionPlan.targetBlocks && productionPlan.targetBlocks > 0

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">

      {/* Fila 1: botones Iniciar / Pausar / Reiniciar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-900/80 flex-shrink-0">
        <button
          onClick={toggleRunning}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all',
            running
              ? 'bg-yellow-900/50 border-yellow-700 text-yellow-400 hover:bg-yellow-800/50'
              : 'bg-green-900/50 border-green-700 text-green-400 hover:bg-green-800/50'
          )}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? 'Pausar simulación' : 'Iniciar simulación'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all"
          title="Reiniciar simulación"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Fila 2: pestañas */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium border-b-2 transition-colors relative',
              activeTab === id
                ? 'border-green-500 text-green-400 bg-gray-800/50'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs leading-none">{label}</span>
            {id === 'alerts' && errorCount > 0 && (
              <span className="absolute top-0.5 right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full font-bold">
                {errorCount}
              </span>
            )}
            {id === 'production' && prodComplete && (
              <span className="absolute top-0.5 right-1 w-4 h-4 flex items-center justify-center bg-green-500 text-white text-xs rounded-full font-bold">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'monitor'    && <><MachineControls /><MonitoringCharts /></>}
        {activeTab === 'production' && <ProductionPanel />}
        {activeTab === 'scenario'   && <ScenarioControls />}
        {activeTab === 'alerts'     && <AlertsPanel />}
      </div>
    </div>
  )
}
