import { useState } from 'react'
import { X, Power, Zap, Package, Thermometer, Info, Cpu } from 'lucide-react'
import { clsx } from 'clsx'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { LEDIndicator } from '../LEDIndicator'
import type { Equipment, EquipmentId } from '../../simulation/types'
import { MarmitaPanel } from './panels/MarmitaPanel'
import { SecadorPanel } from './panels/SecadorPanel'

// ── Config de fases ───────────────────────────────────────────────────────────
const PHASES = [
  { id: 'phase1',  label: 'Fase 1 — Preparación Intensiva',        titleColor: 'text-red-400',   border: 'border-red-800',   bg: 'bg-red-950/20'   },
  { id: 'phase2',  label: 'Fase 2 — Mezcla Húmeda',                titleColor: 'text-blue-400',  border: 'border-blue-800',  bg: 'bg-blue-950/20'  },
  { id: 'phase3',  label: 'Fase 3 — Fraguado',                     titleColor: 'text-green-400', border: 'border-green-800', bg: 'bg-green-950/20' },
  { id: 'subproc', label: 'Sub-proceso — Harina BSF (H. illucens)', titleColor: 'text-lime-400',  border: 'border-lime-800',  bg: 'bg-lime-950/20'  },
] as const

// ── Sensor relevante por equipo ───────────────────────────────────────────────
const EQUIPMENT_SENSOR: Partial<Record<EquipmentId, {
  label: string
  getValue: (s: ReturnType<typeof useSimulatorStore.getState>['sensors']) => string
}>> = {
  rotary_kiln:      { label: 'Temp. Horno',      getValue: (s) => `${s.kilnTemp.toFixed(1)} °C`           },
  rotary_dryer:     { label: 'Temp. Secador',    getValue: (s) => `${s.dryerTemp.toFixed(1)} °C`           },
  marmita:          { label: 'Harina Sangre',    getValue: (s) => `${s.bloodFlourRate.toFixed(1)} kg/h`    },
  screw_conveyor:   { label: 'Harina Hueso',     getValue: (s) => `${s.boneFlourRate.toFixed(1)} kg/h`     },
  ribbon_mixer:     { label: 'Presión',          getValue: (s) => `${s.tankPressure.toFixed(1)} PSI`        },
  peristaltic_pump: { label: 'Flujo Melaza',     getValue: (s) => `${s.molassesFlowActual.toFixed(1)} L/h` },
  paddle_mixer:     { label: 'Temp. Exotérmica', getValue: (s) => `${s.exothermicTemp.toFixed(1)} °C`      },
  bsf_bioreactor:   { label: 'Harina BSF',       getValue: (s) => `${s.bsfFlourRate.toFixed(1)} kg/h`      },
}

// ── Modal de detalle de máquina ───────────────────────────────────────────────
function MachineModal({ eq, onClose }: { eq: Equipment; onClose: () => void }) {
  const { toggleEquipment, sensors } = useSimulatorStore()
  const sensorInfo = EQUIPMENT_SENSOR[eq.id]

  const statusLabel: Record<string, string> = {
    inactive: 'Inactivo', active: 'Activo', warning: 'Advertencia', error: 'Error',
  }
  const statusColor: Record<string, string> = {
    inactive: 'text-gray-500', active: 'text-green-400', warning: 'text-yellow-400', error: 'text-red-400',
  }
  const phaseName: Record<string, string> = {
    phase1: 'Fase 1 — Preparación', phase2: 'Fase 2 — Mezcla',
    phase3: 'Fase 3 — Fraguado',    subproc: 'Sub-proceso BSF',
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">

        {/* Encabezado */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <LEDIndicator status={eq.status} size="sm" />
              <h2 className="text-white font-bold text-sm">{eq.name}</h2>
            </div>
            <div className="text-gray-400 text-xs font-mono mt-0.5">{eq.model}</div>
            <div className="text-gray-500 text-xs">{eq.manufacturer}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Estado + Fase + ON/OFF */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={clsx('text-sm font-bold', statusColor[eq.status])}>
                ● {statusLabel[eq.status]}
              </span>
              <span className="text-xs text-gray-500 border border-gray-700 rounded px-2 py-0.5">
                {phaseName[eq.phase]}
              </span>
            </div>
            <button
              onClick={() => toggleEquipment(eq.id as EquipmentId)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-bold transition-all',
                eq.active
                  ? 'bg-green-900/50 border-green-600 text-green-400 hover:bg-red-900/50 hover:border-red-600 hover:text-red-400'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white'
              )}
            >
              <Power className="w-4 h-4" />
              {eq.active ? 'Apagar' : 'Encender'}
            </button>
          </div>

          {/* Sensor en tiempo real */}
          {sensorInfo && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Cpu className="w-4 h-4" />
                {sensorInfo.label}
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {eq.active ? sensorInfo.getValue(sensors) : '—'}
              </span>
            </div>
          )}

          {/* Especificaciones */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Especificaciones técnicas
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SpecRow icon={<Package className="w-3.5 h-3.5" />}    label="Capacidad" value={eq.specs.capacity} />
              <SpecRow icon={<Zap className="w-3.5 h-3.5" />}        label="Potencia"  value={eq.specs.power} />
              <SpecRow icon={<Info className="w-3.5 h-3.5" />}       label="Material"  value={eq.specs.material} />
              {eq.specs.tempRange && (
                <SpecRow icon={<Thermometer className="w-3.5 h-3.5" />} label="Temp." value={eq.specs.tempRange} />
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-gray-800/40 rounded-lg p-3 text-xs text-gray-400 leading-relaxed border border-gray-700/50">
            {eq.specs.notes}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 bg-gray-800/50 rounded-lg p-2">
      <span className="text-gray-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <div className="text-gray-500 text-xs">{label}</div>
        <div className="text-gray-200 text-xs font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}

// ── Tarjeta compacta de máquina ───────────────────────────────────────────────
function MachineCard({ eq, onClick }: { eq: Equipment; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left rounded-lg border border-gray-700 p-2',
        'hover:bg-gray-600/50 hover:border-gray-500 transition-all duration-150',
        eq.active ? 'bg-gray-700/60' : 'bg-gray-800/60'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <LEDIndicator status={eq.status} size="sm" />
        <span className={clsx('text-xs', {
          'text-gray-500':   eq.status === 'inactive',
          'text-green-400':  eq.status === 'active',
          'text-yellow-400': eq.status === 'warning',
          'text-red-400':    eq.status === 'error',
        })}>
          {eq.status === 'inactive' ? 'OFF' :
           eq.status === 'active'   ? 'ON'  :
           eq.status === 'warning'  ? '⚠'   : '✕'}
        </span>
      </div>
      <div className={clsx('text-xs font-semibold leading-tight', eq.active ? 'text-white' : 'text-gray-300')}>
        {eq.name}
      </div>
    </button>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function MachineControls() {
  const { equipment, sensors } = useSimulatorStore()
  const [selected, setSelected] = useState<Equipment | null>(null)

  const equipmentList = Object.values(equipment)

  return (
    <div className="p-3 space-y-3">

      {/* Tarjeta grande por fase */}
      {PHASES.map((phase) => {
        const phaseEq = equipmentList.filter((e) => e.phase === phase.id)
        const activeCount = phaseEq.filter((e) => e.active).length
        return (
          <div key={phase.id} className={clsx('rounded-xl border p-3', phase.border, phase.bg)}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={clsx('text-xs font-bold uppercase tracking-wide', phase.titleColor)}>
                {phase.label}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {activeCount}/{phaseEq.length} activas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {phaseEq.map((eq) => (
                <MachineCard key={eq.id} eq={eq} onClick={() => setSelected(eq)} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Resumen de sensores */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-700">
        {[
          { label: 'Horno',    value: `${sensors.kilnTemp.toFixed(0)}°C`,             color: 'text-orange-400' },
          { label: 'Secador',  value: `${sensors.dryerTemp.toFixed(0)}°C`,             color: 'text-amber-400'  },
          { label: 'Presión',  value: `${sensors.tankPressure.toFixed(1)} PSI`,        color: 'text-blue-400'   },
          { label: 'Melaza',   value: `${sensors.molassesFlowActual.toFixed(1)} L/h`,  color: 'text-yellow-400' },
          { label: 'Exotérm.', value: `${sensors.exothermicTemp.toFixed(0)}°C`,        color: 'text-purple-400' },
          { label: 'H.Sangre', value: `${sensors.bloodFlourRate.toFixed(0)} kg/h`,     color: 'text-red-400'    },
          { label: 'H.Hueso',  value: `${sensors.boneFlourRate.toFixed(0)} kg/h`,      color: 'text-yellow-300' },
          { label: 'H.BSF',    value: `${sensors.bsfFlourRate.toFixed(0)} kg/h`,       color: 'text-lime-400'   },
          { label: 'Produc.',  value: `${sensors.productionRate.toFixed(0)} kg/h`,     color: 'text-green-400'  },
        ].map((s) => (
          <div key={s.label} className="bg-gray-800/60 rounded-lg p-2 text-center border border-gray-700">
            <div className="text-gray-500 text-xs">{s.label}</div>
            <div className={clsx('font-mono text-sm font-bold', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Panel específico: Marmita */}
      {selected?.id === 'marmita' && (
        <MarmitaPanel onClose={() => setSelected(null)} />
      )}

      {/* Panel específico: Secador Rotatorio */}
      {selected?.id === 'rotary_dryer' && (
        <SecadorPanel onClose={() => setSelected(null)} />
      )}

      {/* Modal genérico para el resto de máquinas */}
      {selected && selected.id !== 'marmita' && selected.id !== 'rotary_dryer' && (
        <MachineModal
          eq={equipment[selected.id as EquipmentId]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
