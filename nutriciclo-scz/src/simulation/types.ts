export type PhaseId = 'phase1' | 'phase2' | 'phase3' | 'subproc'

export type EquipmentId =
  // Fase 1 — Preparación Intensiva
  | 'marmita'
  | 'rotary_dryer'
  | 'screw_conveyor'
  | 'rotary_kiln'
  | 'hammer_mill'
  // Fase 2 — Mezcla Húmeda
  | 'molasses_tank'
  | 'peristaltic_pump'
  | 'dissolution_tank'
  | 'transfer_pump'
  | 'ribbon_mixer'
  // Fase 3 — Fraguado
  | 'paddle_mixer'
  | 'lime_dosifier'
  | 'vibrating_table'
  | 'belt_conveyor'
  | 'ventilation'
  // Sub-proceso — Harina BSF (Hermetia illucens)
  | 'bsf_bioreactor'
  | 'bsf_dryer'
  | 'bsf_mill'

export type EquipmentStatus = 'inactive' | 'active' | 'warning' | 'error'

export interface EquipmentSpec {
  capacity: string
  power: string
  material: string
  tempRange?: string
  notes: string
}

export interface Equipment {
  id: EquipmentId
  name: string
  model: string
  manufacturer: string
  phase: PhaseId
  status: EquipmentStatus
  active: boolean
  specs: EquipmentSpec
}

export interface RawMaterials {
  bloodStockL: number      // litros de sangre fresca disponibles
  boneStockKg: number      // kg de hueso crudo disponibles
  wasteStockKg: number     // kg de desperdicio de matadero (alimenta biorreactor)
  larvaeStockKg: number    // kg de larvas listas en biorreactor (generado internamente)
}

export interface FlourStocks {
  bloodFlourKg: number     // kg de harina de sangre acumulados
  boneFlourKg: number      // kg de harina de hueso acumulados
  bsfFlourKg: number       // kg de harina BSF acumulados
}

// Insumos externos comprados — se consumen por bloque producido
export interface ExternalMaterials {
  melazaKg: number          // Melaza de caña        30% → 7.50 kg/bloque
  cascarillaKg: number      // Cascarilla de arroz   10% → 2.50 kg/bloque
  afrechoSoyaKg: number     // Afrecho de soya       15% → 3.75 kg/bloque
  ureaKg: number            // Urea agrícola         10% → 2.50 kg/bloque
  calVivaKg: number         // Cal viva (CaO)        10% → 2.50 kg/bloque
  salMineralizadaKg: number // Sal mineralizada       5% → 1.25 kg/bloque
  azufreKg: number          // Azufre                 1% → 0.25 kg/bloque
}

export interface SimulationParameters {
  calcinationTemp: number       // 500–600 °C
  grindingRPM: number           // 1500–3000
  molassesFlow: number          // 0–100 L/h
  limeAmount: number            // 0–50 kg
  curingTime: number            // 5–60 min
}

export interface SensorReadings {
  kilnTemp: number              // °C
  dryerTemp: number             // °C
  tankPressure: number          // PSI
  molassesFlowActual: number    // L/h
  exothermicTemp: number        // °C
  mixViscosity: number          // cP
  productionRate: number        // kg/h
  bloodFlourRate: number        // kg/h — harina de sangre producida
  boneFlourRate: number         // kg/h — harina de hueso producida
  bsfFlourRate: number          // kg/h — harina BSF producida
}

export interface Alert {
  id: string
  timestamp: Date
  type: 'warning' | 'error' | 'info'
  message: string
  parameter: string
  value: number
}

export interface TimeSeriesPoint {
  time: number
  kilnTemp: number
  dryerTemp: number
  tankPressure: number
  molassesFlow: number
  exothermicTemp: number
}

export interface ProductionPlan {
  targetBlocks: number     // bloques objetivo
  blockWeightKg: number    // peso por bloque en kg (25 kg)
}

// Formulación NutriCiclo — porcentaje de cada insumo en el bloque terminado
export const BLOCK_FORMULA = [
  { key: 'melaza',          label: 'Melaza de caña',      pct: 0.30, color: '#fbbf24', subProcess: null       },
  { key: 'harinaSangre',    label: 'Harina de sangre',    pct: 0.10, color: '#ef4444', subProcess: 'sangre'   },
  { key: 'cascarilla',      label: 'Cascarilla de arroz', pct: 0.10, color: '#d97706', subProcess: null       },
  { key: 'afrechoSoya',     label: 'Afrecho de soya',     pct: 0.15, color: '#84cc16', subProcess: null       },
  { key: 'urea',            label: 'Urea agrícola',       pct: 0.10, color: '#38bdf8', subProcess: null       },
  { key: 'calViva',         label: 'Cal viva (CaO)',       pct: 0.10, color: '#e5e7eb', subProcess: null       },
  { key: 'harinaHueso',     label: 'Harina de hueso',     pct: 0.05, color: '#fde68a', subProcess: 'hueso'    },
  { key: 'salMineralizada', label: 'Sal mineralizada',    pct: 0.05, color: '#cbd5e1', subProcess: null       },
  { key: 'harinaBSF',       label: 'Harina BSF (larvas)', pct: 0.04, color: '#a3e635', subProcess: 'bsf'      },
  { key: 'azufre',          label: 'Azufre',              pct: 0.01, color: '#facc15', subProcess: null       },
] as const

export interface SimulatorState {
  params: SimulationParameters
  equipment: Record<EquipmentId, Equipment>
  sensors: SensorReadings
  timeSeries: TimeSeriesPoint[]
  alerts: Alert[]
  darkMode: boolean
  running: boolean
  tick: number
  productionPlan: ProductionPlan
  blocksProduced: number
  rawMaterials: RawMaterials
  flourStocks: FlourStocks
  externalMaterials: ExternalMaterials
  setParam: <K extends keyof SimulationParameters>(key: K, value: SimulationParameters[K]) => void
  toggleEquipment: (id: EquipmentId) => void
  toggleDarkMode: () => void
  toggleRunning: () => void
  tick_simulation: () => void
  clearAlerts: () => void
  reset: () => void
  setProductionPlan: (plan: Partial<ProductionPlan>) => void
  addRawMaterial: (key: 'bloodStockL' | 'boneStockKg' | 'wasteStockKg', amount: number) => void
  addExternalMaterial: (key: keyof ExternalMaterials, amount: number) => void
}
