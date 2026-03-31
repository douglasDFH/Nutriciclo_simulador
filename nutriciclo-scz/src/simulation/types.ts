export type PhaseId = 'phase1' | 'phase2' | 'phase3'

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

export interface SimulatorState {
  params: SimulationParameters
  equipment: Record<EquipmentId, Equipment>
  sensors: SensorReadings
  timeSeries: TimeSeriesPoint[]
  alerts: Alert[]
  darkMode: boolean
  running: boolean
  tick: number
  setParam: <K extends keyof SimulationParameters>(key: K, value: SimulationParameters[K]) => void
  toggleEquipment: (id: EquipmentId) => void
  toggleDarkMode: () => void
  toggleRunning: () => void
  tick_simulation: () => void
  clearAlerts: () => void
  reset: () => void
}
