import { useState } from 'react'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import { BLOCK_FORMULA } from '../../simulation/types'
import { CheckCircle, AlertTriangle, XCircle, Package, Clock, TrendingUp, FlaskConical, BookOpen, Droplets } from 'lucide-react'
import { clsx } from 'clsx'
import { RecetasModal } from './RecetasModal'
import { MateriaPrimaModal } from './MateriaPrimaModal'

// ─── Sub-proceso de harinas ───────────────────────────────────────────────────
const SUB_PROCESSES = [
  {
    key: 'hueso',
    label: 'Harina de Hueso',
    status: 'ok' as const,
    equipment: 'Transportador WAM TSC-250 → Horno CITIC HIC RK-Series → Molino RICHI 9FQ',
    desc: 'Flujo completo implementado. Sensor boneFlourRate activo: hasta ~120 kg/h cuando los 3 equipos están encendidos y horno ≥ 400°C. Rendimiento crece con temperatura (óptimo 500–600°C). Calcinación 4 h → fosfato de calcio.',
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
  const { productionPlan, blocksProduced, sensors, running, setProductionPlan, equipment, params, flourStocks } = useSimulatorStore()
  const [inputBlocks, setInputBlocks] = useState(String(productionPlan.targetBlocks))
  const [showRecetas, setShowRecetas] = useState(false)
  const [showMateriaPrima, setShowMateriaPrima] = useState(false)

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

      {/* Modales */}
      {showRecetas      && <RecetasModal      onClose={() => setShowRecetas(false)} />}
      {showMateriaPrima && <MateriaPrimaModal onClose={() => setShowMateriaPrima(false)} />}

      {/* ── Botones superiores ── */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowMateriaPrima(true)}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 hover:border-blue-500 rounded-lg text-blue-400 hover:text-blue-300 text-sm font-semibold transition-all"
        >
          <Droplets className="w-4 h-4" />
          Materia Prima
        </button>
        <button
          onClick={() => setShowRecetas(true)}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-green-900/40 hover:bg-green-800/60 border border-green-700 hover:border-green-500 rounded-lg text-green-400 hover:text-green-300 text-sm font-semibold transition-all"
        >
          <BookOpen className="w-4 h-4" />
          Guía de Producción
        </button>
      </div>

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
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-700">
          <HarinaCard
            label="Harina de Sangre"
            stockKg={flourStocks.bloodFlourKg}
            active={equipment.marmita.active && equipment.rotary_dryer.active && equipment.hammer_mill.active}
            warming={false}
            equipLabel="Marmita + Sec. + Molino"
            warmingLabel=""
            accentStock="text-red-400"
            border="border-red-800"
            bg="bg-red-950/30"
            barColor="bg-red-500"
          />
          <HarinaCard
            label="Harina de Hueso"
            stockKg={flourStocks.boneFlourKg}
            active={equipment.screw_conveyor.active && equipment.rotary_kiln.active && equipment.hammer_mill.active}
            warming={equipment.screw_conveyor.active && equipment.rotary_kiln.active && equipment.hammer_mill.active && sensors.boneFlourRate === 0}
            equipLabel={`Sinfín + Horno + Molino (${params.calcinationTemp}°C)`}
            warmingLabel="Calentando…"
            accentStock="text-yellow-400"
            border="border-yellow-800"
            bg="bg-yellow-950/30"
            barColor="bg-yellow-500"
          />
          <HarinaCard
            label="Harina BSF"
            stockKg={flourStocks.bsfFlourKg}
            active={equipment.bsf_bioreactor.active && equipment.bsf_dryer.active && equipment.bsf_mill.active}
            warming={false}
            equipLabel="Biorreactor + Sec. + Molino"
            warmingLabel=""
            accentStock="text-lime-400"
            border="border-lime-800"
            bg="bg-lime-950/30"
            barColor="bg-lime-500"
          />
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
                    {item.subProcess === 'hueso'  && <span title="Subproceso modelado"><CheckCircle   className="w-3 h-3 text-green-400" /></span>}
                    {item.subProcess === 'sangre' && <span title="Subproceso completo"><CheckCircle   className="w-3 h-3 text-green-400" /></span>}
                    {item.subProcess === 'bsf'    && <span title="Subproceso BSF completo"><CheckCircle className="w-3 h-3 text-green-400" /></span>}
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

interface HarinaCardProps {
  label: string
  stockKg: number
  active: boolean
  warming: boolean
  equipLabel: string
  warmingLabel: string
  accentStock: string
  border: string
  bg: string
  barColor: string
}
function HarinaCard({ label, stockKg, active, warming, equipLabel, warmingLabel, accentStock, border, bg, barColor }: HarinaCardProps) {
  const STOCK_CAP = 400
  const pct = Math.min(100, (stockKg / STOCK_CAP) * 100)
  const low = stockKg < 5
  return (
    <div className={clsx('rounded p-2 text-center', border, bg, 'border')}>
      <div className={clsx('text-xs font-semibold', accentStock)}>{label}</div>
      <div className="text-xs text-gray-600 leading-tight mt-0.5">
        {warming
          ? <span className="text-yellow-600">{warmingLabel}</span>
          : active ? `● ${equipLabel}` : equipLabel}
      </div>
      {/* Stock */}
      <div className="mt-1.5 pt-1.5 border-t border-gray-700/50">
        <div className={clsx('font-mono text-sm font-bold', low ? 'text-red-400' : accentStock)}>
          {stockKg.toFixed(0)} kg
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-0.5">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', low ? 'bg-red-500' : barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
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
