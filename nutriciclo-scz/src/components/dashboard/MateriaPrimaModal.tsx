import { useState } from 'react'
import { X, Droplets, Bone, Bug, Package, Plus, AlertTriangle, ShoppingCart } from 'lucide-react'
import { clsx } from 'clsx'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import type { ExternalMaterials } from '../../simulation/types'

// Capacidades de referencia para barras de nivel
const BLOOD_CAP  = 2000   // L  — tanque diario de matadero
const BONE_CAP   = 3000   // kg — silo de huesos
const WASTE_CAP  = 1000   // kg — contenedor desperdicio
const LARVAE_CAP = 500    // kg — capacidad biorreactor
const FLOUR_CAP  = 400    // kg — referencia para barras de stock de harina

// Definición de los 7 insumos externos con su kg por bloque (25 kg)
interface ExtDef {
  key: keyof ExternalMaterials
  label: string
  unit: string
  kgPerBlock: number
  cap: number          // referencia para barra (stock máximo razonable)
  color: string
  colorbg: string
  colorborder: string
}
const EXT_DEFS: ExtDef[] = [
  { key: 'melazaKg',          label: 'Melaza de caña',      unit: 'kg', kgPerBlock: 7.50, cap: 2000, color: 'bg-amber-500',  colorbg: 'bg-amber-950/20',  colorborder: 'border-amber-800' },
  { key: 'cascarillaKg',      label: 'Cascarilla de arroz', unit: 'kg', kgPerBlock: 2.50, cap: 800,  color: 'bg-orange-500', colorbg: 'bg-orange-950/20', colorborder: 'border-orange-800' },
  { key: 'afrechoSoyaKg',     label: 'Afrecho de soya',     unit: 'kg', kgPerBlock: 3.75, cap: 1200, color: 'bg-green-600',  colorbg: 'bg-green-950/20',  colorborder: 'border-green-800' },
  { key: 'ureaKg',            label: 'Urea agrícola',       unit: 'kg', kgPerBlock: 2.50, cap: 800,  color: 'bg-sky-500',    colorbg: 'bg-sky-950/20',    colorborder: 'border-sky-800' },
  { key: 'calVivaKg',         label: 'Cal viva (CaO)',       unit: 'kg', kgPerBlock: 2.50, cap: 800,  color: 'bg-gray-400',   colorbg: 'bg-gray-800/50',   colorborder: 'border-gray-600' },
  { key: 'salMineralizadaKg', label: 'Sal mineralizada',    unit: 'kg', kgPerBlock: 1.25, cap: 500,  color: 'bg-slate-400',  colorbg: 'bg-slate-900/40',  colorborder: 'border-slate-600' },
  { key: 'azufreKg',          label: 'Azufre',              unit: 'kg', kgPerBlock: 0.25, cap: 150,  color: 'bg-yellow-400', colorbg: 'bg-yellow-950/20', colorborder: 'border-yellow-700' },
]

function hoursLabel(stock: number, rateH: number): string {
  if (rateH <= 0) return 'Equipo OFF'
  const h = stock / rateH
  if (h < 0.017) return '< 1 min'
  if (h < 1) return `~${Math.round(h * 60)} min`
  return `~${h.toFixed(1)} h`
}

function StockBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  const danger = pct < 15
  const warn   = pct < 35
  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-500',
          danger ? 'bg-red-500' : warn ? 'bg-yellow-500' : color
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

interface InputRowProps {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  onAdd: () => void
}
function InputRow({ label, unit, value, onChange, onAdd }: InputRowProps) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="number"
        min={1}
        placeholder={`Agregar ${unit}…`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white text-sm font-mono focus:border-green-500 focus:outline-none"
        aria-label={label}
      />
      <span className="text-xs text-gray-500 w-6">{unit}</span>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-800 hover:bg-green-700 border border-green-600 rounded text-green-200 text-sm font-semibold transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Agregar
      </button>
    </div>
  )
}

// ─── Tarjeta compacta para insumos externos ──────────────────────────────────
interface ExtCardProps {
  def: ExtDef
  stockKg: number
  blocksProducedRate: number   // bloques/h que consume este insumo
  onAdd: (amount: number) => void
}
function ExtCard({ def, stockKg, blocksProducedRate, onAdd }: ExtCardProps) {
  const [val, setVal] = useState('')
  const consumeH   = blocksProducedRate * def.kgPerBlock
  const blocksLeft = def.kgPerBlock > 0 ? stockKg / def.kgPerBlock : Infinity
  const pct        = Math.min(100, (stockKg / def.cap) * 100)
  const low        = blocksLeft < 15
  const critical   = blocksLeft < 1

  function submit() {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) { onAdd(n); setVal('') }
  }

  return (
    <div className={clsx('rounded-lg border p-2.5', def.colorborder, def.colorbg, critical && 'ring-1 ring-red-500')}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-200 truncate pr-1">{def.label}</span>
        <span className="text-xs text-gray-500 flex-shrink-0">{def.kgPerBlock} kg/bl</span>
      </div>

      {/* Stock + barra */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className={clsx('font-mono font-bold text-sm flex-shrink-0', critical ? 'text-red-400' : low ? 'text-yellow-400' : 'text-white')}>
          {stockKg.toFixed(1)} kg
        </span>
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', critical ? 'bg-red-500' : low ? 'bg-yellow-500' : def.color)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Info consumo */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{consumeH > 0 ? `${consumeH.toFixed(2)} kg/h` : 'Sin producción'}</span>
        <span className={clsx(critical ? 'text-red-400' : low ? 'text-yellow-400' : '')}>
          {isFinite(blocksLeft) ? `~${Math.floor(blocksLeft)} bloques` : '∞'}
        </span>
      </div>

      {/* Input agregar */}
      <div className="flex gap-1">
        <input
          type="number"
          min={1}
          placeholder="kg…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-xs font-mono focus:border-green-500 focus:outline-none"
        />
        <button
          onClick={submit}
          className="flex items-center gap-0.5 px-2 py-1 bg-green-800 hover:bg-green-700 border border-green-600 rounded text-green-200 text-xs font-semibold transition-colors flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {critical && (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Agotado — producción pausada
        </div>
      )}
    </div>
  )
}

export function MateriaPrimaModal({ onClose }: { onClose: () => void }) {
  const { rawMaterials, flourStocks, externalMaterials, addRawMaterial, addExternalMaterial, sensors, equipment } = useSimulatorStore()

  const [bloodInput, setBloodInput] = useState('')
  const [boneInput,  setBoneInput]  = useState('')
  const [wasteInput, setWasteInput] = useState('')

  function add(key: 'bloodStockL' | 'boneStockKg' | 'wasteStockKg', raw: string, clear: () => void) {
    const n = parseFloat(raw)
    if (!isNaN(n) && n > 0) { addRawMaterial(key, n); clear() }
  }

  // Tasa de producción de bloques por hora (para calcular consumo de externos)
  const blocksPerHour = sensors.productionRate / 25   // productionRate en kg/h ÷ 25 kg/bloque

  // Tasas de consumo por hora
  const bloodConsumeH  = sensors.bloodFlourRate > 0  ? sensors.bloodFlourRate  / 0.19 / 1.05 : 0
  const boneConsumeH   = sensors.boneFlourRate  > 0  ? sensors.boneFlourRate   / 0.60        : 0
  const wasteConsumeH  = equipment.bsf_bioreactor.active ? 72 : 0
  const larvaeProduceH = equipment.bsf_bioreactor.active && rawMaterials.wasteStockKg > 0 ? 14.4 : 0
  const larvaeConsumeH = sensors.bsfFlourRate   > 0  ? sensors.bsfFlourRate    / 0.30        : 0

  // Alertas locales de stock crítico
  const bloodCritical  = rawMaterials.bloodStockL   < 50
  const boneCritical   = rawMaterials.boneStockKg   < 60
  const wasteCritical  = rawMaterials.wasteStockKg  < 30

  // Por bloque 25 kg producido: cuánta harina se consume
  const BLOOD_PER_BLOCK = 2.5   // kg (10%)
  const BONE_PER_BLOCK  = 1.25  // kg (5%)
  const BSF_PER_BLOCK   = 1.0   // kg (4%)

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ── Encabezado ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div>
            <h2 className="text-white font-bold text-base">Materia Prima & Stocks de Harinas</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Ingresa materia prima para alimentar los subprocesos de producción
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* ══ SECCIÓN: MATERIA PRIMA ══════════════════════════════════════ */}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Materia Prima — Entrada al proceso
          </div>

          <div className="grid grid-cols-1 gap-3">

            {/* ─── Sangre Fresca ─── */}
            <div className={clsx(
              'rounded-lg border p-3',
              bloodCritical ? 'border-red-700 bg-red-950/20' : 'border-red-900 bg-gray-800/50'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-300 font-semibold text-sm">Sangre Fresca</span>
                <span className="text-gray-500 text-xs ml-auto">→ Harina de Sangre (rendimiento 19%)</span>
              </div>
              <div className="flex items-end justify-between mb-1">
                <span className={clsx('font-mono font-bold text-lg', bloodCritical ? 'text-red-400' : 'text-white')}>
                  {rawMaterials.bloodStockL.toFixed(0)} L
                </span>
                <div className="text-right text-xs">
                  <div className="text-gray-400">Consumo: <span className="text-red-300 font-mono">{bloodConsumeH > 0 ? `${bloodConsumeH.toFixed(0)} L/h` : '— (equipos OFF)'}</span></div>
                  <div className="text-gray-400">Restante: <span className={clsx('font-mono', bloodCritical ? 'text-red-400' : 'text-gray-200')}>{hoursLabel(rawMaterials.bloodStockL, bloodConsumeH)}</span></div>
                </div>
              </div>
              <StockBar value={rawMaterials.bloodStockL} max={BLOOD_CAP} color="bg-red-500" />
              {bloodCritical && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
                  <AlertTriangle className="w-3 h-3" /> Stock crítico — la Marmita producirá 0 kg/h
                </div>
              )}
              <InputRow
                label="Agregar sangre"
                unit="L"
                value={bloodInput}
                onChange={setBloodInput}
                onAdd={() => add('bloodStockL', bloodInput, () => setBloodInput(''))}
              />
            </div>

            {/* ─── Hueso Crudo ─── */}
            <div className={clsx(
              'rounded-lg border p-3',
              boneCritical ? 'border-yellow-700 bg-yellow-950/20' : 'border-yellow-900 bg-gray-800/50'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Bone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-300 font-semibold text-sm">Hueso Crudo</span>
                <span className="text-gray-500 text-xs ml-auto">→ Harina de Hueso (rendimiento 60%)</span>
              </div>
              <div className="flex items-end justify-between mb-1">
                <span className={clsx('font-mono font-bold text-lg', boneCritical ? 'text-yellow-400' : 'text-white')}>
                  {rawMaterials.boneStockKg.toFixed(0)} kg
                </span>
                <div className="text-right text-xs">
                  <div className="text-gray-400">Consumo: <span className="text-yellow-300 font-mono">{boneConsumeH > 0 ? `${boneConsumeH.toFixed(0)} kg/h` : '— (equipos OFF)'}</span></div>
                  <div className="text-gray-400">Restante: <span className={clsx('font-mono', boneCritical ? 'text-yellow-400' : 'text-gray-200')}>{hoursLabel(rawMaterials.boneStockKg, boneConsumeH)}</span></div>
                </div>
              </div>
              <StockBar value={rawMaterials.boneStockKg} max={BONE_CAP} color="bg-yellow-500" />
              {boneCritical && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-yellow-400">
                  <AlertTriangle className="w-3 h-3" /> Stock crítico — el Horno producirá 0 kg/h
                </div>
              )}
              <InputRow
                label="Agregar hueso"
                unit="kg"
                value={boneInput}
                onChange={setBoneInput}
                onAdd={() => add('boneStockKg', boneInput, () => setBoneInput(''))}
              />
            </div>

            {/* ─── Desperdicio Matadero (BSF) ─── */}
            <div className={clsx(
              'rounded-lg border p-3',
              wasteCritical ? 'border-orange-700 bg-orange-950/20' : 'border-lime-900 bg-gray-800/50'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <span className="text-lime-300 font-semibold text-sm">Desperdicio de Matadero</span>
                <span className="text-gray-500 text-xs ml-auto">→ Cría de Larvas BSF (conversión 20%)</span>
              </div>
              <div className="flex items-end justify-between mb-1">
                <div>
                  <span className={clsx('font-mono font-bold text-lg', wasteCritical ? 'text-orange-400' : 'text-white')}>
                    {rawMaterials.wasteStockKg.toFixed(0)} kg
                  </span>
                  <span className="text-gray-500 text-xs ml-2">disponible</span>
                </div>
                <div className="text-right text-xs">
                  <div className="text-gray-400">Consumo: <span className="text-lime-300 font-mono">{wasteConsumeH > 0 ? `${wasteConsumeH} kg/h` : '— (biorreactor OFF)'}</span></div>
                  <div className="text-gray-400">Restante: <span className="font-mono text-gray-200">{hoursLabel(rawMaterials.wasteStockKg, wasteConsumeH)}</span></div>
                </div>
              </div>
              <StockBar value={rawMaterials.wasteStockKg} max={WASTE_CAP} color="bg-lime-600" />

              {/* Larvas en biorreactor */}
              <div className="mt-3 pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-lime-400 font-semibold">Larvas en Biorreactor</span>
                  <div className="text-xs text-gray-400 space-x-3">
                    {larvaeProduceH > 0 && <span className="text-lime-400">+{larvaeProduceH.toFixed(1)} kg/h</span>}
                    {larvaeConsumeH > 0 && <span className="text-orange-400">−{larvaeConsumeH.toFixed(1)} kg/h</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-base w-20">
                    {rawMaterials.larvaeStockKg.toFixed(1)} kg
                  </span>
                  <div className="flex-1">
                    <StockBar value={rawMaterials.larvaeStockKg} max={LARVAE_CAP} color="bg-lime-500" />
                  </div>
                  <span className="text-xs text-gray-500">/ {LARVAE_CAP} kg</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Las larvas se generan automáticamente en el biorreactor. Se consumen al activar Secador + Molino BSF.
                </div>
              </div>

              {wasteCritical && (
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                  <AlertTriangle className="w-3 h-3" /> Stock bajo — el biorreactor dejará de producir larvas
                </div>
              )}
              <InputRow
                label="Agregar desperdicio"
                unit="kg"
                value={wasteInput}
                onChange={setWasteInput}
                onAdd={() => add('wasteStockKg', wasteInput, () => setWasteInput(''))}
              />
            </div>
          </div>

          {/* ══ SECCIÓN: INSUMOS EXTERNOS ═══════════════════════════════════ */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">
            <ShoppingCart className="w-3.5 h-3.5" />
            Insumos Externos — Se consumen al producir bloques
          </div>

          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-3">
              Tasa de producción actual:{' '}
              <span className="text-white font-mono font-bold">{blocksPerHour.toFixed(1)} bloques/h</span>
              {' '}— cada bloque consume los kg indicados en cada insumo
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXT_DEFS.map((def) => (
                <ExtCard
                  key={def.key}
                  def={def}
                  stockKg={externalMaterials[def.key]}
                  blocksProducedRate={blocksPerHour}
                  onAdd={(amount) => addExternalMaterial(def.key, amount)}
                />
              ))}
            </div>
          </div>

          {/* ══ SECCIÓN: STOCKS DE HARINAS ══════════════════════════════════ */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">
            <Package className="w-3.5 h-3.5" />
            Stocks de Harinas — Producidas internamente
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-3">
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              Cada bloque NutriCiclo (25 kg) consume:{' '}
              <span className="text-red-300 font-mono">{BLOOD_PER_BLOCK} kg sangre</span> +{' '}
              <span className="text-yellow-300 font-mono">{BONE_PER_BLOCK} kg hueso</span> +{' '}
              <span className="text-lime-300 font-mono">{BSF_PER_BLOCK} kg BSF</span>
            </div>

            {[
              { label: 'Harina de Sangre',  value: flourStocks.bloodFlourKg, color: 'bg-red-500',    textColor: 'text-red-300',    perBlock: BLOOD_PER_BLOCK },
              { label: 'Harina de Hueso',   value: flourStocks.boneFlourKg,  color: 'bg-yellow-500', textColor: 'text-yellow-300', perBlock: BONE_PER_BLOCK  },
              { label: 'Harina BSF',        value: flourStocks.bsfFlourKg,   color: 'bg-lime-500',   textColor: 'text-lime-300',   perBlock: BSF_PER_BLOCK   },
            ].map((item) => {
              const blocksLeft = item.value > 0 ? Math.floor(item.value / item.perBlock) : 0
              const low = item.value < item.perBlock * 5
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-end mb-1">
                    <span className={clsx('text-xs font-semibold', item.textColor)}>{item.label}</span>
                    <div className="text-right">
                      <span className={clsx('font-mono font-bold text-sm', low ? 'text-red-400' : 'text-white')}>
                        {item.value.toFixed(1)} kg
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        ≈ {blocksLeft} bloques
                      </span>
                    </div>
                  </div>
                  <StockBar value={item.value} max={FLOUR_CAP} color={item.color} />
                  {low && item.value < item.perBlock && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      Insuficiente para 1 bloque — producción pausada
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-3 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
