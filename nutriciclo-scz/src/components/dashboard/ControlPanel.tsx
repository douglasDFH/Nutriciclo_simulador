import { useState } from 'react'
import { MonitoringCharts } from './MonitoringCharts'
import { MachineControls } from './MachineControls'
import { ScenarioControls } from './ScenarioControls'
import { AlertsPanel } from './AlertsPanel'
import { ProductionPanel } from './ProductionPanel'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { Activity, Cpu, Sliders, Bell, Play, Pause, RotateCcw, Factory } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { id: 'monitor',    label: 'Monitoreo',  icon: Activity },
  { id: 'machines',   label: 'Máquinas',   icon: Cpu },
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
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-700">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-700 bg-gray-900/80">
        <div className="flex flex-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors relative',
                activeTab === id
                  ? 'border-green-500 text-green-400 bg-gray-800/50'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'alerts' && errorCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full font-bold">
                  {errorCount}
                </span>
              )}
              {id === 'production' && prodComplete && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-green-500 text-white text-xs rounded-full font-bold">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Run/Pause + Reset buttons */}
        <div className="flex items-center gap-1.5 mx-3">
          <button
            onClick={toggleRunning}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              running
                ? 'bg-yellow-900/50 border-yellow-700 text-yellow-400 hover:bg-yellow-800/50'
                : 'bg-green-900/50 border-green-700 text-green-400 hover:bg-green-800/50'
            )}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold border bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all"
            title="Reiniciar simulación"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'monitor'    && <MonitoringCharts />}
        {activeTab === 'machines'   && <MachineControls />}
        {activeTab === 'production' && <ProductionPanel />}
        {activeTab === 'scenario'   && <ScenarioControls />}
        {activeTab === 'alerts'     && <AlertsPanel />}
      </div>
    </div>
  )
}
