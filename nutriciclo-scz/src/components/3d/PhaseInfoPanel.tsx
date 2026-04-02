import { X, Zap, Thermometer, Package, Info, Power } from 'lucide-react'
import { clsx } from 'clsx'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import type { PhaseId, EquipmentId } from '../../simulation/types'

// ─── Config de cada fase ──────────────────────────────────────────────────────
interface PhaseConfig {
  id: PhaseId
  label: string
  subtitle: string
  color: string
  border: string
  bg: string
  badgeBg: string
  dot: string
  equipmentIds: EquipmentId[]
  descripcion: string
}

export const PHASE_CONFIG: PhaseConfig[] = [
  {
    id: 'phase1',
    label: 'FASE 1',
    subtitle: 'Preparación Intensiva',
    color: 'text-red-400',
    border: 'border-red-700',
    bg: 'bg-red-950/30',
    badgeBg: 'bg-red-900/40',
    dot: 'bg-red-400',
    equipmentIds: ['marmita', 'rotary_dryer', 'screw_conveyor', 'rotary_kiln', 'hammer_mill'],
    descripcion: 'Cocción de sangre, calcinación de huesos (500–600°C) y molienda. Produce harina de sangre y harina de hueso calcinado.',
  },
  {
    id: 'phase2',
    label: 'FASE 2',
    subtitle: 'Mezcla Húmeda',
    color: 'text-blue-400',
    border: 'border-blue-700',
    bg: 'bg-blue-950/30',
    badgeBg: 'bg-blue-900/40',
    dot: 'bg-blue-400',
    equipmentIds: ['molasses_tank', 'peristaltic_pump', 'dissolution_tank', 'transfer_pump', 'ribbon_mixer'],
    descripcion: 'Dosificación y mezcla de melaza, urea, sal mineralizada y harinas. Forma la masa húmeda homogénea del bloque.',
  },
  {
    id: 'phase3',
    label: 'FASE 3',
    subtitle: 'Fraguado y Empaque',
    color: 'text-green-400',
    border: 'border-green-700',
    bg: 'bg-green-950/30',
    badgeBg: 'bg-green-900/40',
    dot: 'bg-green-400',
    equipmentIds: ['paddle_mixer', 'lime_dosifier', 'vibrating_table', 'belt_conveyor', 'ventilation'],
    descripcion: 'Incorporación de cal viva (reacción exotérmica), moldeado, vibrado para eliminación de burbujas y curado del bloque NutriCiclo.',
  },
  {
    id: 'subproc',
    label: 'SUB-PROC',
    subtitle: 'Biofábrica BSF',
    color: 'text-lime-400',
    border: 'border-lime-700',
    bg: 'bg-lime-950/30',
    badgeBg: 'bg-lime-900/40',
    dot: 'bg-lime-400',
    equipmentIds: ['bsf_bioreactor', 'bsf_dryer', 'bsf_mill'],
    descripcion: 'Cría de larvas Hermetia illucens (Mosca Soldado Negra) sobre residuos orgánicos. Produce harina BSF (38–44% proteína) y frass como subproducto fertilizante.',
  },
]

// ─── Status LED ───────────────────────────────────────────────────────────────
function StatusLed({ status }: { status: string }) {
  const classes: Record<string, string> = {
    inactive: 'bg-gray-600',
    active:   'bg-green-400 shadow-[0_0_6px_#4ade80]',
    warning:  'bg-yellow-400 shadow-[0_0_6px_#facc15]',
    error:    'bg-red-400 shadow-[0_0_6px_#f87171] animate-pulse',
  }
  return (
    <span className={clsx('inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5', classes[status] ?? classes.inactive)} />
  )
}

// ─── Tarjeta de equipo ────────────────────────────────────────────────────────
function EquipmentCard({ id, phaseColor, phaseBorder, phaseBg }: {
  id: EquipmentId
  phaseColor: string
  phaseBorder: string
  phaseBg: string
}) {
  const { equipment, toggleEquipment } = useSimulatorStore()
  const eq = equipment[id]

  return (
    <div className={clsx('rounded-xl border p-3 space-y-2', phaseBorder, phaseBg)}>

      {/* Header */}
      <div className="flex items-start gap-2 justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <StatusLed status={eq.status} />
          <div className="min-w-0">
            <div className="text-white text-xs font-bold leading-tight truncate">{eq.name}</div>
            <div className={clsx('text-xs font-mono', phaseColor)}>{eq.model}</div>
            <div className="text-gray-500 text-xs">{eq.manufacturer}</div>
          </div>
        </div>
        {/* Toggle ON/OFF */}
        <button
          onClick={() => toggleEquipment(id)}
          className={clsx(
            'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all',
            eq.active
              ? 'bg-green-700 hover:bg-green-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          )}
        >
          <Power className="w-3 h-3" />
          {eq.active ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Package className="w-3 h-3 flex-shrink-0 text-gray-500" />
          <span className="truncate">{eq.specs.capacity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Zap className="w-3 h-3 flex-shrink-0 text-yellow-500" />
          <span>{eq.specs.power}</span>
        </div>
        {eq.specs.tempRange && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 col-span-2">
            <Thermometer className="w-3 h-3 flex-shrink-0 text-orange-400" />
            <span>{eq.specs.tempRange}</span>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="flex gap-1.5 text-xs text-gray-500 border-t border-gray-700/50 pt-2">
        <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-600" />
        <span className="leading-relaxed">{eq.specs.notes}</span>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────
interface PhaseInfoPanelProps {
  phaseId: PhaseId
  onClose: () => void
}

export function PhaseInfoPanel({ phaseId, onClose }: PhaseInfoPanelProps) {
  const cfg = PHASE_CONFIG.find((p) => p.id === phaseId)!
  const { equipment, toggleEquipment } = useSimulatorStore()

  const allActive = cfg.equipmentIds.every((id) => equipment[id].active)

  function toggleAll() {
    if (allActive) {
      cfg.equipmentIds.forEach((id) => { if (equipment[id].active) toggleEquipment(id) })
    } else {
      cfg.equipmentIds.forEach((id) => { if (!equipment[id].active) toggleEquipment(id) })
    }
  }

  return (
    <div className="absolute top-0 left-0 bottom-0 z-50 flex">
      {/* Panel */}
      <div
        className={clsx(
          'h-full w-72 flex flex-col border-r shadow-2xl overflow-hidden',
          'bg-gray-950',
          cfg.border
        )}
      >
        {/* Header */}
        <div className={clsx('flex items-start justify-between p-4 border-b', cfg.border, cfg.bg)}>
          <div>
            <div className="flex items-center gap-2">
              <span className={clsx('w-2.5 h-2.5 rounded-full', cfg.dot)} />
              <span className={clsx('text-sm font-black', cfg.color)}>{cfg.label}</span>
            </div>
            <div className="text-white font-bold text-base mt-0.5">{cfg.subtitle}</div>
            <div className="text-gray-400 text-xs mt-1 leading-relaxed">{cfg.descripcion}</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className={clsx('px-4 py-2 border-b flex items-center justify-between', cfg.border)}>
          <span className="text-xs text-gray-400">
            {cfg.equipmentIds.length} máquinas ·{' '}
            <span className="text-green-400">
              {cfg.equipmentIds.filter((id) => equipment[id].active).length} activas
            </span>
          </span>
          <button
            onClick={toggleAll}
            className={clsx(
              'text-xs px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1',
              allActive
                ? 'bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700'
                : 'bg-green-900/60 hover:bg-green-800 text-green-300 border border-green-700'
            )}
          >
            <Power className="w-3 h-3" />
            {allActive ? 'Apagar todo' : 'Encender todo'}
          </button>
        </div>

        {/* Lista de máquinas */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {cfg.equipmentIds.map((id) => (
            <EquipmentCard
              key={id}
              id={id}
              phaseColor={cfg.color}
              phaseBorder={cfg.border}
              phaseBg={cfg.bg}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
