import { useState } from 'react'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { BLOCK_FORMULA } from '../../simulation/types'
import { CheckCircle, AlertTriangle, XCircle, Package, Clock, TrendingUp, FlaskConical } from 'lucide-react'
import { clsx } from 'clsx'

// ─── Sub-proceso de harinas ───────────────────────────────────────────────────
const SUB_PROCESSES = [
  {
    key: 'hueso',
    label: 'Harina de Hueso',
    status: 'ok' as const,
    equipment: 'Horno CITIC HIC → Transportador WAM → Molino RICHI 9FQ',
    desc: 'Calcinación de huesos crudos a 500–600°C por 4 h. Proceso modelado y simulado.',
    color: 'text-green-400',
    border: 'border-green-800',
    bg: 'bg-green-950/20',
  },
  {
    key: 'sangre',
    label: 'Harina de Sangre',
    status: 'ok' as const,
    equipment: 'Marmita Jersa MV-300 → Secador Vulcanotec SD-500 → Molino RICHI 9FQ',
    desc: 'Flujo dedicado modelado (ruta directa Marmita→Secador→Molino, separada de la ruta de huesos). Sensor bloodFlourRate activo ~75 kg/h cuando los 3 equipos están encendidos.',
    color: 'text-green-400',
    border: 'border-green-800',
    bg: 'bg-green-950/20',
  },
  {
    key: 'bsf',
    label: 'Harina BSF (Larvas Mosca Soldado Negra)',
    status: 'ok' as const,
    equipment: 'Biorreactor AgriProtein BioBox BSF-500 → Secador Vulcanotec SD-100 BSF → Molino RICHI BSF-Mill 500',
    desc: 'Sub-proceso completo implementado. 3 equipos dedicados (fase SUB-PROC). Flujos de partículas desde z=-8 (detrás de línea principal) hasta la mezcladora. Sensor bsfFlourRate activo ~40 kg/h. 40–45% proteína cruda.',
    color: 'text-green-400',
    border: 'border-green-800',
    bg: 'bg-green-950/20',
  },
]

const STATUS_ICON = {
  ok:      <CheckCircle  className="w-4 h-4 text-green-400 flex-shrink-0" />,
  partial: <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />,
  missing: <XCircle      className="w-4 h-4 text-red-400 flex-shrink-0" />,
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ProductionPanel() {
  const { productionPlan, blocksProduced, sensors, running, setProductionPlan, equipment } = useSimulatorStore()
  const [inputBlocks, setInputBlocks] = useState(String(productionPlan.targetBlocks))

  const { targetBlocks, blockWeightKg } = productionPlan
  const totalKg        = targetBlocks * blockWeightKg
  const progress       = targetBlocks > 0 ? Math.min(blocksProduced / targetBlocks, 1) : 0
  const pct            = (progress * 100).toFixed(1)
  const blocksLeft     = Math.max(0, targetBlocks - blocksProduced)
  const blocksPerHour  = sensors.productionRate / blockWeightKg
  const hoursLeft      = blocksPerHour > 0 ? blocksLeft / blocksPerHour : null
  const completed      = blocksProduced >= targetBlocks && targetBlocks > 0

  function applyTarget() {
    const n = parseInt(inputBlocks, 10)
    if (!isNaN(n) && n > 0) setProductionPlan({ targetBlocks: n })
  }

  return (
    <div className="p-3 space-y-4 overflow-y-auto">

      {/* ── Plan de producción ── */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Package className="w-4 h-4 text-green-400" />
          Plan de producción — Bloques NutriCiclo 25 kg
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Objetivo de bloques</label>
            <input
              type="number"
              min={1}
              value={inputBlocks}
              onChange={(e) => setInputBlocks(e.target.value)}
              onBlur={applyTarget}
              onKeyDown={(e) => e.key === 'Enter' && applyTarget()}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-white text-sm font-mono focus:border-green-500 focus:outline-none"
            />
          </div>
          <div className="text-center px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-400">
            × {blockWeightKg} kg
          </div>
          <div className="text-center px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs">
            <span className="text-green-400 font-mono font-bold">{totalKg.toLocaleString()}</span>
            <span className="text-gray-500"> kg totales</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={clsx('font-semibold', completed ? 'text-green-400' : 'text-gray-300')}>
              {completed ? '✓ Producción completada' : 'Progreso de producción'}
            </span>
            <span className="font-mono text-gray-300">
              {Math.floor(blocksProduced).toLocaleString()} / {targetBlocks.toLocaleString()} bloques
            </span>
          </div>
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                completed ? 'bg-green-500' : progress > 0.8 ? 'bg-yellow-500' : 'bg-blue-500'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{pct}%</span>
            <span>{Math.floor(blocksLeft).toLocaleString()} bloques restantes</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <KPI
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Tasa actual"
            value={running && blocksPerHour > 0 ? `${blocksPerHour.toFixed(1)} bl/h` : '— bl/h'}
            color="text-blue-400"
          />
          <KPI
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Tiempo restante"
            value={running && hoursLeft !== null ? formatHours(hoursLeft) : '—'}
            color="text-purple-400"
          />
          <KPI
            icon={<Package className="w-3.5 h-3.5" />}
            label="kg producidos"
            value={`${(blocksProduced * blockWeightKg).toFixed(0)} kg`}
            color="text-green-400"
          />
        </div>

        {/* Harinas sub-proceso */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-700">
          <div className="bg-red-950/30 border border-red-800 rounded p-2 text-center">
            <div className="text-xs text-red-400 font-semibold">Harina de Sangre</div>
            <div className="font-mono text-sm font-bold text-red-300">
              {sensors.bloodFlourRate > 0
                ? `${sensors.bloodFlourRate.toFixed(1)} kg/h`
                : <span className="text-gray-600">Equipos OFF</span>}
            </div>
            <div className="text-xs text-gray-600">
              {equipment.marmita.active && equipment.rotary_dryer.active && equipment.hammer_mill.active
                ? '● Marmita + Secador + Molino'
                : 'Requiere: Marmita + Secador + Molino'}
            </div>
          </div>
          <div className="bg-lime-950/30 border border-lime-800 rounded p-2 text-center">
            <div className="text-xs text-lime-400 font-semibold">Harina BSF</div>
            <div className="font-mono text-sm font-bold text-lime-300">
              {sensors.bsfFlourRate > 0
                ? `${sensors.bsfFlourRate.toFixed(1)} kg/h`
                : <span className="text-gray-600">Equipos OFF</span>}
            </div>
            <div className="text-xs text-gray-600">
              {equipment.bsf_bioreactor.active && equipment.bsf_dryer.active && equipment.bsf_mill.active
                ? '● Biorreactor + Secador + Molino BSF'
                : 'Requiere: Biorreactor + Sec. + Molino BSF'}
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculadora de insumos ── */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <FlaskConical className="w-4 h-4 text-blue-400" />
          Insumos requeridos para {targetBlocks.toLocaleString()} bloques
        </div>

        <div className="space-y-1.5">
          {BLOCK_FORMULA.map((item) => {
            const kgReq = totalKg * item.pct
            return (
              <div key={item.key} className="flex items-center gap-2 text-xs">
                {/* color swatch */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {/* nombre */}
                <span className="flex-1 text-gray-300">{item.label}</span>
                {/* porcentaje */}
                <span className="text-gray-500 w-8 text-right">{(item.pct * 100).toFixed(0)}%</span>
                {/* barra proporcional */}
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.pct * 100 / 30 * 100}%`, backgroundColor: item.color }}
                  />
                </div>
                {/* kg */}
                <span className="font-mono font-bold text-white w-20 text-right">
                  {kgReq.toLocaleString('es-BO', { maximumFractionDigits: 0 })} kg
                </span>
                {/* indicador subproceso */}
                {item.subProcess && (
                  <span className="ml-1">
                    {item.subProcess === 'hueso'  && <CheckCircle  className="w-3 h-3 text-green-400" title="Subproceso modelado" />}
                    {item.subProcess === 'sangre' && <AlertTriangle className="w-3 h-3 text-yellow-400" title="Subproceso parcial" />}
                    {item.subProcess === 'bsf'    && <XCircle      className="w-3 h-3 text-red-400"    title="Subproceso faltante" />}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Totales */}
        <div className="mt-3 pt-2 border-t border-gray-700 flex justify-between text-xs">
          <span className="text-gray-400">Total materia prima</span>
          <span className="font-mono font-bold text-green-400">{totalKg.toLocaleString()} kg</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-400">Producción terminada</span>
          <span className="font-mono font-bold text-white">{targetBlocks.toLocaleString()} bloques × 25 kg</span>
        </div>
      </section>

      {/* ── Estado de subprocesos de harinas ── */}
      <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
        <div className="text-sm font-semibold text-white mb-3">
          Estado de subprocesos — 3 Harinas
        </div>
        <div className="space-y-2">
          {SUB_PROCESSES.map((sp) => (
            <div key={sp.key} className={clsx('rounded-lg border p-2.5', sp.border, sp.bg)}>
              <div className="flex items-start gap-2">
                {STATUS_ICON[sp.status]}
                <div className="flex-1 min-w-0">
                  <div className={clsx('text-xs font-bold', sp.color)}>{sp.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5 font-mono">{sp.equipment}</div>
                  <div className="text-gray-500 text-xs mt-1 leading-relaxed">{sp.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Modelado</span>
          <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-400" /> Parcial</span>
          <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> Faltante</span>
        </div>
      </section>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function KPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900/60 rounded p-2 text-center">
      <div className="flex justify-center text-gray-500 mb-0.5">{icon}</div>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className={clsx('font-mono text-sm font-bold', color)}>{value}</div>
    </div>
  )
}

function formatHours(h: number): string {
  if (h < 0.017) return '< 1 min'
  if (h < 1) return `${Math.round(h * 60)} min`
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`
}
