import { useState } from 'react'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { LEDIndicator } from '../LEDIndicator'
import type { Equipment, EquipmentId } from '../../simulation/types'
import { Power, ChevronDown, ChevronUp, Zap, Package, Thermometer, Info } from 'lucide-react'
import { clsx } from 'clsx'

const PHASE_COLORS = {
  phase1: { border: 'border-red-800', bg: 'bg-red-950/30', title: 'text-red-400', label: 'FASE 1 — Preparación Intensiva' },
  phase2: { border: 'border-blue-800', bg: 'bg-blue-950/30', title: 'text-blue-400', label: 'FASE 2 — Mezcla Húmeda' },
  phase3: { border: 'border-green-800', bg: 'bg-green-950/30', title: 'text-green-400', label: 'FASE 3 — Fraguado' },
}

function EquipmentCard({ eq }: { eq: Equipment }) {
  const { toggleEquipment } = useSimulatorStore()
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={clsx(
        'rounded-lg border transition-all duration-200',
        eq.active
          ? 'bg-gray-700/60 border-gray-500'
          : 'bg-gray-900/60 border-gray-700'
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 p-2.5">
        <LEDIndicator status={eq.status} size="sm" />
        <div className="flex-1 min-w-0">
          <div className={clsx('text-xs font-semibold leading-tight', eq.active ? 'text-white' : 'text-gray-300')}>
            {eq.name}
          </div>
          <div className="text-gray-500 text-xs leading-tight font-mono mt-0.5">
            {eq.model}
          </div>
          <div className="text-gray-600 text-xs leading-tight">
            {eq.manufacturer}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-gray-600/50 text-gray-500 hover:text-gray-300 transition-colors"
            title="Ver especificaciones"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => toggleEquipment(eq.id as EquipmentId)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold transition-all duration-200',
              eq.active
                ? 'bg-green-900/50 border-green-700 text-green-400 hover:bg-red-900/50 hover:border-red-700 hover:text-red-400'
                : 'bg-gray-800 border-gray-600 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
            )}
          >
            <Power className="w-3 h-3" />
            {eq.active ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Specs panel */}
      {expanded && (
        <div className="border-t border-gray-700/50 px-2.5 pb-2.5 pt-2 space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <SpecBadge icon={<Package className="w-3 h-3" />} label="Capacidad" value={eq.specs.capacity} />
            <SpecBadge icon={<Zap className="w-3 h-3" />} label="Potencia" value={eq.specs.power} />
            <SpecBadge icon={<Info className="w-3 h-3" />} label="Material" value={eq.specs.material} />
            {eq.specs.tempRange && (
              <SpecBadge icon={<Thermometer className="w-3 h-3" />} label="Temp." value={eq.specs.tempRange} />
            )}
          </div>
          <div className="text-gray-500 text-xs leading-relaxed bg-gray-800/40 rounded p-1.5">
            {eq.specs.notes}
          </div>
        </div>
      )}
    </div>
  )
}

function SpecBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5 bg-gray-800/60 rounded p-1.5">
      <span className="text-gray-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-gray-500 text-xs leading-none">{label}</div>
        <div className="text-gray-200 text-xs font-medium leading-tight mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export function MachineControls() {
  const { equipment, sensors } = useSimulatorStore()

  const equipmentList = Object.values(equipment)
  const phases = ['phase1', 'phase2', 'phase3'] as const

  return (
    <div className="p-3 space-y-3">
      {phases.map((phase) => {
        const phaseEq = equipmentList.filter((e) => e.phase === phase)
        const cfg = PHASE_COLORS[phase]
        return (
          <div key={phase} className={clsx('rounded-lg border p-3', cfg.border, cfg.bg)}>
            <div className={clsx('text-xs font-semibold mb-2', cfg.title)}>{cfg.label}</div>
            <div className="space-y-1.5">
              {phaseEq.map((eq) => (
                <EquipmentCard key={eq.id} eq={eq} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Live sensor summary */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: 'Horno', value: `${sensors.kilnTemp.toFixed(0)}°C`, color: 'text-orange-400' },
          { label: 'Tanque', value: `${sensors.tankPressure.toFixed(1)} PSI`, color: 'text-blue-400' },
          { label: 'Melaza', value: `${sensors.molassesFlowActual.toFixed(1)} L/m`, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-800/60 rounded p-2 text-center">
            <div className="text-gray-500 text-xs">{s.label}</div>
            <div className={clsx('font-mono text-sm font-bold', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
