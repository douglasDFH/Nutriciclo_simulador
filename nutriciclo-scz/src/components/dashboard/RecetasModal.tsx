import { useState } from 'react'
import { X, FlaskConical, Droplets, Bone, Bug, Truck, TestTube } from 'lucide-react'
import { BLOCK_FORMULA } from '../../simulation/types'
import { clsx } from 'clsx'

// ─── Conversiones reales (datos FRIGOR + literatura científica) ───────────────
// Cálculos:
//   Sangre:  rendimiento 18-20% → 1 kg harina / 0.19 = 5.26 kg sangre fresca ≈ 5.0 L (densidad 1.055 g/ml)
//   Hueso:   rendimiento 35-40% → 1 kg harina / 0.375 = 2.67 kg hueso fresco ≈ 2.7 kg
//   BSF:     rendimiento 25-35% → 1 kg harina / 0.30  = 3.33 kg larvas frescas
const CONVERSIONES = [
  {
    key: 'sangre',
    icon: <Droplets className="w-6 h-6" />,
    color: 'text-red-400',
    border: 'border-red-700',
    bg: 'bg-red-950/40',
    badgeBg: 'bg-red-900/60',
    title: 'Harina de Sangre',
    subtitulo: 'Sangre bovina fresca — Proveedor: FRIGOR',
    ratio: '5.3 kg',
    ratioLitros: '≈ 5.0 L',
    unidadEntrada: 'kg de sangre bovina fresca',
    unidadSalida: '1 kg de harina de sangre',
    rendimiento: '18–20%',
    detalles: [
      'Humedad sangre fresca: 80–82% · Sólidos totales: 18–20%',
      'Proteína fresca: 13–15% · Proteína harina seca: 80–85%',
      'Densidad sangre entera: 1.05–1.06 g/ml',
      'Temperatura secado: 60–70°C por 8–12 horas',
      'pH sangre fresca: 7.35–7.45 (controlar para evitar putrefacción)',
    ],
    proceso: 'Marmita Jersa MV-300 (100°C, 2h) → Secador Vulcanotec SD-500 (70°C, 8h) → Molino RICHI 9FQ',
    frigor: '500 reses/día × 11.1 kg/res = 5.550 kg sangre/día disponibles',
    capacidadHarina: '5.550 kg × 19% = ~1.054 kg harina de sangre/día',
  },
  {
    key: 'hueso',
    icon: <Bone className="w-6 h-6" />,
    color: 'text-yellow-300',
    border: 'border-yellow-700',
    bg: 'bg-yellow-950/40',
    badgeBg: 'bg-yellow-900/60',
    title: 'Harina de Hueso Calcinado',
    subtitulo: 'Hueso bovino fresco — Proveedor: FRIGOR',
    ratio: '2.7 kg',
    ratioLitros: null,
    unidadEntrada: 'kg de hueso bovino fresco',
    unidadSalida: '1 kg de harina de hueso calcinado',
    rendimiento: '35–40%',
    detalles: [
      'Hueso fresco: 35–45% humedad · 20–25% proteína · 12–15% Ca · 5–7% P',
      'Harina calcinada: 97% materia seca · 28–32% Ca · 15–18% P · 0% proteína',
      'Cenizas finales: 95–97% (toda la materia orgánica se elimina a 500–600°C)',
      'Temperatura calcinación: 500–600°C por 4 horas en horno rotatorio',
      'Peso esqueleto completo por res: 30–40 kg (aprovechable: ~3–5 kg/res)',
    ],
    proceso: 'Horno Rotatorio CITIC HIC (500–600°C, 4h) → Transportador WAM → Molino RICHI 9FQ',
    frigor: '500 reses/día × 3–5 kg aprovechable/res = 1.500–2.500 kg hueso/día',
    capacidadHarina: '2.000 kg promedio × 37.5% = ~750 kg harina de hueso/día',
  },
  {
    key: 'bsf',
    icon: <Bug className="w-6 h-6" />,
    color: 'text-lime-400',
    border: 'border-lime-700',
    bg: 'bg-lime-950/40',
    badgeBg: 'bg-lime-900/60',
    title: 'Harina BSF (Hermetia illucens)',
    subtitulo: 'Larvas Mosca Soldado Negra — Biorreactor propio',
    ratio: '3.3 kg',
    ratioLitros: null,
    unidadEntrada: 'kg de larvas BSF frescas',
    unidadSalida: '1 kg de harina de larvas',
    rendimiento: '25–35%',
    detalles: [
      'Larvas frescas: 60–70% humedad · 15–18% proteína · 10–14% grasa',
      'Harina seca: 38–44% proteína cruda (promedio 42%) · 27–35% grasa · 7–12% cenizas',
      'Ácido láurico: 30–50% del perfil graso (actividad antimicrobiana)',
      'Ciclo larva: 14–21 días a 28–30°C · Humedad óptima 60–70%',
      'Subproducto: frass = 40–60% del sustrato → fertilizante (N 2–4%, P 1–2%)',
    ],
    proceso: 'Biorreactor BSF AgriProtein BioBox-500 → Secador BSF Vulcanotec SD-100 → Molino RICHI BSF-Mill 500',
    frigor: 'Alimentación biorreactor: vísceras/residuos matadero (15–25% conv. residuo→larva)',
    capacidadHarina: '100 kg residuo → 15–25 kg larvas frescas → 5–8 kg harina BSF',
  },
]

// ─── Tabla bromatológica ──────────────────────────────────────────────────────
const BROMATOLOGICO = [
  { insumo: 'Sangre fresca',        hum: '80–82', prot: '13–15', grasa: '0.2',   cen: '0.8',   ca: '0.01', p: '0.02', fibra: '0'     },
  { insumo: 'Harina de sangre',     hum: '5–10',  prot: '80–85', grasa: '1–3',   cen: '4–6',   ca: '0.3',  p: '0.3',  fibra: '0'     },
  { insumo: 'Hueso fresco',         hum: '35–45', prot: '20–25', grasa: '10–15', cen: '35–40', ca: '12–15',p: '5–7',  fibra: '0'     },
  { insumo: 'Harina hueso calc.',   hum: '2–3',   prot: '0',     grasa: '0',     cen: '95–97', ca: '28–32',p: '15–18',fibra: '0'     },
  { insumo: 'Larvas BSF frescas',   hum: '60–70', prot: '15–18', grasa: '10–14', cen: '3–4',   ca: '0.8',  p: '0.6',  fibra: '0'     },
  { insumo: 'Harina BSF seca',      hum: '5–10',  prot: '38–44', grasa: '27–35', cen: '7–12',  ca: '5–8',  p: '0.9–1.5', fibra: '7–9'},
  { insumo: 'Melaza de caña',       hum: '25–30', prot: '3–5',   grasa: '0',     cen: '8–12',  ca: '0.8',  p: '0.08', fibra: '0'     },
  { insumo: 'Cascarilla de arroz',  hum: '8–12',  prot: '3–4',   grasa: '0.5–1', cen: '15–20', ca: '0.1',  p: '0.1',  fibra: '35–45' },
  { insumo: 'Afrecho de soya',      hum: '10–12', prot: '44–48', grasa: '1–2',   cen: '6–7',   ca: '0.3',  p: '0.7',  fibra: '7–9'   },
  { insumo: 'Urea agrícola',        hum: '0',     prot: '287*',  grasa: '0',     cen: '0',     ca: '0',    p: '0',    fibra: '0'     },
  { insumo: 'Cal viva (CaO)',       hum: '0',     prot: '0',     grasa: '0',     cen: '100',   ca: '71',   p: '0',    fibra: '0'     },
  { insumo: 'Sal mineralizada',     hum: '0',     prot: '0',     grasa: '0',     cen: '95+',   ca: '15–20',p: '5–8',  fibra: '0'     },
  { insumo: 'Azufre elemental',     hum: '0',     prot: '0',     grasa: '0',     cen: '100',   ca: '0',    p: '0',    fibra: '0'     },
]

// ─── Componente Modal ─────────────────────────────────────────────────────────
interface RecetasModalProps {
  onClose: () => void
}

type Tab = 'conversiones' | 'receta' | 'bromatologico' | 'abastecimiento'

export function RecetasModal({ onClose }: RecetasModalProps) {
  const [tab, setTab] = useState<Tab>('conversiones')

  const tabs: { id: Tab; label: string; color: string; activeColor: string; activeBg: string }[] = [
    { id: 'conversiones',    label: 'Conversiones',     color: 'text-gray-400', activeColor: 'text-red-400',    activeBg: 'bg-red-950/20',    },
    { id: 'receta',          label: 'Receta 1 kg',       color: 'text-gray-400', activeColor: 'text-blue-400',   activeBg: 'bg-blue-950/20',   },
    { id: 'bromatologico',   label: 'Bromatología',      color: 'text-gray-400', activeColor: 'text-purple-400', activeBg: 'bg-purple-950/20', },
    { id: 'abastecimiento',  label: 'Abastecimiento',    color: 'text-gray-400', activeColor: 'text-green-400',  activeBg: 'bg-green-950/20',  },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.80)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-green-400" />
            <div>
              <h2 className="text-white font-bold text-sm leading-tight">Guía Técnica de Producción NutriCiclo</h2>
              <p className="text-gray-500 text-xs">Datos reales — Proveedor FRIGOR + literatura científica verificada</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 flex-shrink-0 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex-1 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap px-2',
                tab === t.id
                  ? `${t.activeColor} border-b-2 ${t.activeBg}`
                  : `${t.color} hover:text-gray-200`
              )}
              style={tab === t.id ? { borderBottomColor: 'currentColor' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 p-5">

          {/* ── TAB: Conversiones ── */}
          {tab === 'conversiones' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
                <strong className="text-white">Fuentes:</strong> Datos de análisis bromatológico FRIGOR (matadero municipal) +
                literatura científica verificada (Scielo, FAO, IIAP). Rendimientos calculados sobre base seca.
              </div>

              {CONVERSIONES.map((c) => (
                <div key={c.key} className={clsx('rounded-xl border p-4', c.border, c.bg)}>
                  <div className={clsx('flex items-center gap-2 font-bold text-sm mb-3', c.color)}>
                    {c.icon}
                    <span>{c.title}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">{c.subtitulo}</div>

                  {/* Ratio principal */}
                  <div className={clsx('rounded-lg p-3 mb-3 flex items-center gap-3', c.badgeBg)}>
                    <div className="text-center flex-1">
                      <div className={clsx('text-2xl font-black font-mono', c.color)}>{c.ratio}</div>
                      {c.ratioLitros && (
                        <div className={clsx('text-xs font-mono', c.color)}>{c.ratioLitros}</div>
                      )}
                      <div className="text-xs text-gray-300 mt-0.5">{c.unidadEntrada}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-lg font-bold">→</div>
                      <div className={clsx('text-xs font-semibold', c.color)}>rend. {c.rendimiento}</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-black font-mono text-white">1 kg</div>
                      <div className="text-xs text-gray-300 mt-0.5">{c.unidadSalida}</div>
                    </div>
                  </div>

                  {/* Detalles técnicos */}
                  <ul className="space-y-1 mb-3">
                    {c.detalles.map((d, i) => (
                      <li key={i} className="text-xs text-gray-400 flex gap-2">
                        <span className={clsx('mt-0.5 flex-shrink-0', c.color)}>•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Ruta de proceso */}
                  <div className="text-xs text-gray-500 font-mono border-t border-gray-700 pt-2">
                    <span className="text-gray-400">Ruta: </span>{c.proceso}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: Receta 1 kg bloque ── */}
          {tab === 'receta' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Formulación estándar del bloque NutriCiclo de <strong className="text-white">25 kg</strong>.
              </p>

              <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="text-left py-2.5 px-4 text-gray-400 text-xs font-semibold">Insumo</th>
                      <th className="text-right py-2.5 px-4 text-gray-400 text-xs font-semibold">%</th>
                      <th className="text-right py-2.5 px-4 text-gray-400 text-xs font-semibold">Por 1 kg</th>
                      <th className="text-right py-2.5 px-4 text-gray-400 text-xs font-semibold">Por bloque 25 kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BLOCK_FORMULA.map((item, idx) => {
                      const gPorKg = item.pct * 1000
                      const gPorBloque = item.pct * 25000
                      return (
                        <tr key={item.key} className={clsx('border-b border-gray-700/50', idx % 2 === 0 ? 'bg-gray-800/20' : '')}>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="text-gray-200 text-xs">{item.label}</span>
                              {item.subProcess && <span className="text-gray-600 text-xs">(subproc.)</span>}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-xs text-gray-400">{(item.pct * 100).toFixed(0)}%</td>
                          <td className="py-2 px-4 text-right font-mono text-xs font-bold text-white">
                            {gPorKg >= 1000 ? `${(gPorKg/1000).toFixed(3)} kg` : `${gPorKg.toFixed(0)} g`}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-xs font-bold">
                            <span style={{ color: item.color }}>
                              {gPorBloque >= 1000 ? `${(gPorBloque/1000).toFixed(2)} kg` : `${gPorBloque.toFixed(0)} g`}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-950/30 border-t-2 border-green-700">
                      <td className="py-2.5 px-4 text-xs font-bold text-green-400">TOTAL</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs font-bold text-green-400">100%</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs font-bold text-green-400">1.000 kg</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs font-bold text-green-400">25.000 kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Barra visual */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="text-xs text-gray-400 font-semibold mb-3">Composición visual — 1 kg de bloque</div>
                <div className="flex h-8 rounded-lg overflow-hidden w-full gap-px">
                  {BLOCK_FORMULA.map((item) => (
                    <div key={item.key} style={{ width: `${item.pct * 100}%`, backgroundColor: item.color }} title={`${item.label}: ${(item.pct * 100).toFixed(0)}%`} />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                  {BLOCK_FORMULA.map((item) => (
                    <div key={item.key} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-400">{item.label} <span className="font-mono text-gray-500">({(item.pct * 100).toFixed(0)}%)</span></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                <strong className="text-gray-300">Nota técnica:</strong> Pesar cada componente en balanza de precisión antes del mezclado.
                El peso final puede variar ±2–3% según la humedad de los insumos y el tiempo de curado.
              </div>
            </div>
          )}

          {/* ── TAB: Bromatología ── */}
          {tab === 'bromatologico' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
                <strong className="text-white">Análisis bromatológico completo</strong> — datos en porcentaje (%) sobre materia fresca salvo indicación. Fuente: FRIGOR + Scielo + ABC Color + IIAP.
                <br/><span className="text-yellow-400 mt-1 block">* Urea agrícola: el valor 287% equivalente proteico es calculado (N×6.25), no proteína real.</span>
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="text-left py-2 px-3 text-gray-400 font-semibold whitespace-nowrap">Insumo</th>
                      <th className="text-right py-2 px-2 text-blue-300 font-semibold">Hum%</th>
                      <th className="text-right py-2 px-2 text-green-300 font-semibold">Prot%</th>
                      <th className="text-right py-2 px-2 text-yellow-300 font-semibold">Grasa%</th>
                      <th className="text-right py-2 px-2 text-gray-300 font-semibold">Cen%</th>
                      <th className="text-right py-2 px-2 text-orange-300 font-semibold">Ca%</th>
                      <th className="text-right py-2 px-2 text-purple-300 font-semibold">P%</th>
                      <th className="text-right py-2 px-2 text-lime-300 font-semibold">Fib%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BROMATOLOGICO.map((row, idx) => (
                      <tr key={row.insumo} className={clsx('border-b border-gray-700/40', idx % 2 === 0 ? 'bg-gray-800/20' : '')}>
                        <td className="py-1.5 px-3 text-gray-200 font-medium whitespace-nowrap">{row.insumo}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-blue-300">{row.hum}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-green-300">{row.prot}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-yellow-300">{row.grasa}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-gray-300">{row.cen}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-orange-300">{row.ca}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-purple-300">{row.p}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-lime-300">{row.fibra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: Abastecimiento ── */}
          {tab === 'abastecimiento' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
                <strong className="text-white">Capacidad de abastecimiento diario</strong> — basado en FRIGOR (matadero municipal, 500 reses/día).
                Estos datos permiten estimar la escala máxima de producción de la fábrica.
              </div>

              {/* Sangre */}
              <div className="bg-red-950/30 border border-red-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <Droplets className="w-4 h-4" /> Sangre Bovina — FRIGOR
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Reses/día FRIGOR', value: '500 cabezas', color: 'text-white' },
                    { label: 'Sangre por res', value: '11.1 kg (~10.5 L)', color: 'text-red-300' },
                    { label: 'Sangre total/día', value: '5.550 kg disponibles', color: 'text-white' },
                    { label: 'Harina producible/día', value: '~1.054 kg', color: 'text-red-300' },
                    { label: 'Rendimiento', value: '18–20% (prom. 19%)', color: 'text-gray-300' },
                    { label: 'Para 1 kg harina', value: '5.3 kg (≈ 5.0 L) sangre fresca', color: 'text-red-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-red-950/40 rounded-lg p-2">
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className={clsx('text-xs font-bold font-mono mt-0.5', item.color)}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hueso */}
              <div className="bg-yellow-950/30 border border-yellow-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm">
                  <Bone className="w-4 h-4" /> Hueso Bovino — FRIGOR
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Hueso por res', value: '30–40 kg esqueleto total', color: 'text-white' },
                    { label: 'Aprovechable/res', value: '3–5 kg (restos del faenado)', color: 'text-yellow-300' },
                    { label: 'Hueso total/día', value: '1.500–2.500 kg', color: 'text-white' },
                    { label: 'Harina producible/día', value: '~562–937 kg', color: 'text-yellow-300' },
                    { label: 'Rendimiento calcinación', value: '35–40% (prom. 37.5%)', color: 'text-gray-300' },
                    { label: 'Para 1 kg harina', value: '2.7 kg hueso fresco', color: 'text-yellow-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-yellow-950/40 rounded-lg p-2">
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className={clsx('text-xs font-bold font-mono mt-0.5', item.color)}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BSF */}
              <div className="bg-lime-950/30 border border-lime-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-lime-400 font-bold text-sm">
                  <Bug className="w-4 h-4" /> Biorreactor BSF — Producción propia
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Residuo entrada', value: 'Vísceras/sangre/residuos FRIGOR', color: 'text-white' },
                    { label: 'Conv. residuo → larva', value: '15–25% (prom. 20%)', color: 'text-lime-300' },
                    { label: 'Conv. larva → harina', value: '25–35% (prom. 30%)', color: 'text-lime-300' },
                    { label: 'Rendimiento total', value: '5–8% (residuo → harina)', color: 'text-white' },
                    { label: 'Ciclo de producción', value: '14–21 días a 28–30°C', color: 'text-gray-300' },
                    { label: 'Para 1 kg harina', value: '3.3 kg larvas frescas', color: 'text-lime-400' },
                  ].map((item) => (
                    <div key={item.label} className="bg-lime-950/40 rounded-lg p-2">
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className={clsx('text-xs font-bold font-mono mt-0.5', item.color)}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 border-t border-lime-900 pt-2">
                  Subproducto valioso: <span className="text-lime-300 font-semibold">Frass</span> = 40–60% del sustrato inicial
                  · Contiene 42% proteína + N 2–4% + P 1–2% (fertilizante orgánico)
                </div>
              </div>

              {/* Resumen de capacidad fábrica */}
              <div className="bg-gray-800/60 border border-green-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-3">
                  <Truck className="w-4 h-4" /> Capacidad máxima estimada — fábrica NutriCiclo SCZ
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Harina de sangre disponible/día', value: '~1.054 kg', note: 'si se procesa toda la sangre FRIGOR', color: 'text-red-400' },
                    { label: 'Harina de hueso disponible/día',  value: '~750 kg',   note: 'promedio aprovechable FRIGOR', color: 'text-yellow-300' },
                    { label: 'Harina BSF (módulos 50–100 kg/ciclo)', value: 'Variable', note: 'depende del número de módulos activos', color: 'text-lime-400' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-2 bg-gray-900/50 rounded-lg p-2">
                      <span className={clsx('font-bold font-mono min-w-[80px]', row.color)}>{row.value}</span>
                      <div>
                        <div className="text-gray-200">{row.label}</div>
                        <div className="text-gray-500">{row.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota IoT */}
              <div className="text-xs text-gray-500 bg-gray-800/30 border border-gray-600 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-300 font-semibold mb-1">
                  <TestTube className="w-3.5 h-3.5" /> Sensores IoT recomendados
                </div>
                ESP32 + DHT22 (~$15–25/unidad) para monitorear temperatura y humedad en:
                módulos BSF (28–30°C / 60–70% HR), secadores de sangre (60–70°C), horno de calcinación (500–600°C con termopar tipo K).
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 px-5 py-3 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
