export type PhaseId = 'phase1' | 'phase2' | 'phase3'

export type EquipmentId =
  | 'blood_boiler'
  | 'rotary_kiln'
  | 'hammer_mill'
  | 'molasses_pump'
  | 'mixer_tank'
  | 'lime_dosifier'
  | 'mold_station'

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
  calcinationTemp: number       // 400–700 °C
  grindingRPM: number           // 500–3000
  molassesFlow: number          // 0–100 L/min
  limeAmount: number            // 0–50 kg
  curingTime: number            // 5–60 min
}

export interface SensorReadings {
  kilnTemp: number              // °C
  tankPressure: number          // PSI
  molassesFlowActual: number    // L/min
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
  tankPressure: number
  molassesFlow: number
  exothermicTemp: number
}

export interface SimulatorState {
  // Parameters
  params: SimulationParameters
  // Equipment
  equipment: Record<EquipmentId, Equipment>
  // Sensors
  sensors: SensorReadings
  // Time series data (last 60 points)
  timeSeries: TimeSeriesPoint[]
  // Alerts
  alerts: Alert[]
  // Dark mode
  darkMode: boolean
  // Running
  running: boolean
  // Tick counter
  tick: number
  // Actions
  setParam: <K extends keyof SimulationParameters>(key: K, value: SimulationParameters[K]) => void
  toggleEquipment: (id: EquipmentId) => void
  toggleDarkMode: () => void
  toggleRunning: () => void
  tick_simulation: () => void
  clearAlerts: () => void
  reset: () => void
}
