import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  SimulatorState,
  SimulationParameters,
  EquipmentId,
  Equipment,
  Alert,
} from '../simulation/types'
import { simulationStep, buildTimePoint } from '../simulation/engine'

const INITIAL_PARAMS: SimulationParameters = {
  calcinationTemp: 550,
  grindingRPM: 1500,
  molassesFlow: 40,
  limeAmount: 20,
  curingTime: 30,
}

const INITIAL_EQUIPMENT: Record<EquipmentId, Equipment> = {
  blood_boiler: {
    id: 'blood_boiler', name: 'Hervidor de Sangre', phase: 'phase1', status: 'inactive', active: false,
    model: 'BSP-500 Pro', manufacturer: 'Meyn Food Processing',
    specs: { capacity: '500 L / ciclo', power: '18 kW', material: 'AISI-316L', tempRange: '20–100 °C', notes: 'Hervor + prensado en 20 min. Válvula de seguridad 1.5 bar.' },
  },
  rotary_kiln: {
    id: 'rotary_kiln', name: 'Horno Rotatorio', phase: 'phase1', status: 'inactive', active: false,
    model: 'KilnMaster HR-4×40', manufacturer: 'FLSmidth',
    specs: { capacity: '4 t/h de hueso', power: '75 kW', material: 'Refractario Al₂O₃ 70%', tempRange: '400–700 °C', notes: 'Calcinación 4 h. Velocidad rot. 1–5 RPM. Inclinación 3°.' },
  },
  hammer_mill: {
    id: 'hammer_mill', name: 'Molino de Martillos', phase: 'phase1', status: 'inactive', active: false,
    model: 'CrushMaster HM-3000', manufacturer: 'Williams Crusher & Pulverizer',
    specs: { capacity: '1.5 t/h', power: '22 kW', material: 'Acero manganeso Mn13', notes: 'Criba intercambiable 2 mm. Velocidad 500–3000 RPM. 24 martillos.' },
  },
  molasses_pump: {
    id: 'molasses_pump', name: 'Bomba de Melaza', phase: 'phase2', status: 'inactive', active: false,
    model: 'LKH-25 Centrifugal', manufacturer: 'Alfa Laval',
    specs: { capacity: '0–100 L/min', power: '5.5 kW', material: 'INOX 316L / EPDM', notes: 'Bomba sanitaria. Viscosidad máx 5000 cP. Cabezal máx 40 m.' },
  },
  mixer_tank: {
    id: 'mixer_tank', name: 'Tanque Mezclador', phase: 'phase2', status: 'inactive', active: false,
    model: 'MixPro MX-2500', manufacturer: 'SPX Flow Technology',
    specs: { capacity: '2500 L', power: '15 kW', material: 'AISI-304 + revestimiento epoxi', notes: 'Agitador de paletas cruzadas. Presión máx 80 PSI. Sensor de nivel ultrasónico.' },
  },
  lime_dosifier: {
    id: 'lime_dosifier', name: 'Dosificador de Cal', phase: 'phase3', status: 'inactive', active: false,
    model: 'DISOCONT DL-200', manufacturer: 'Schenck Process',
    specs: { capacity: '0–200 kg/h', power: '2.2 kW', material: 'Acero carbono + recub. polietileno', notes: 'Dosificación gravimétrica ±0.5%. Tolva 500 kg. Vibrador antiapelmazante.' },
  },
  mold_station: {
    id: 'mold_station', name: 'Estación de Moldes', phase: 'phase3', status: 'inactive', active: false,
    model: 'FormTech MLD-500', manufacturer: 'Bühler AG',
    specs: { capacity: '500 unid/h', power: '8 kW', material: 'Polipropileno HD + aluminio', notes: 'Moldes de 1 kg. Tiempo de curado 5–60 min. Sistema desmoldante automático.' },
  },
}

const INITIAL_SENSORS = {
  kilnTemp: 25,
  tankPressure: 5,
  molassesFlowActual: 0,
  exothermicTemp: 25,
  mixViscosity: 100,
  productionRate: 0,
}

function checkAlerts(sensors: ReturnType<typeof simulationStep>, tick: number): Alert[] {
  const alerts: Alert[] = []
  const ts = new Date()

  if (sensors.kilnTemp > 650) {
    alerts.push({
      id: `kiln-hot-${tick}`,
      timestamp: ts,
      type: 'error',
      message: `Temperatura del horno crítica: ${sensors.kilnTemp.toFixed(1)}°C (límite: 650°C)`,
      parameter: 'kilnTemp',
      value: sensors.kilnTemp,
    })
  } else if (sensors.kilnTemp > 600) {
    alerts.push({
      id: `kiln-warn-${tick}`,
      timestamp: ts,
      type: 'warning',
      message: `Temperatura del horno elevada: ${sensors.kilnTemp.toFixed(1)}°C`,
      parameter: 'kilnTemp',
      value: sensors.kilnTemp,
    })
  }

  if (sensors.tankPressure > 50) {
    alerts.push({
      id: `pressure-${tick}`,
      timestamp: ts,
      type: 'error',
      message: `Presión del tanque crítica: ${sensors.tankPressure.toFixed(1)} PSI (límite: 50 PSI)`,
      parameter: 'tankPressure',
      value: sensors.tankPressure,
    })
  } else if (sensors.tankPressure > 40) {
    alerts.push({
      id: `pressure-warn-${tick}`,
      timestamp: ts,
      type: 'warning',
      message: `Presión del tanque elevada: ${sensors.tankPressure.toFixed(1)} PSI`,
      parameter: 'tankPressure',
      value: sensors.tankPressure,
    })
  }

  if (sensors.exothermicTemp > 180) {
    alerts.push({
      id: `exo-${tick}`,
      timestamp: ts,
      type: 'warning',
      message: `Reacción exotérmica intensa: ${sensors.exothermicTemp.toFixed(1)}°C`,
      parameter: 'exothermicTemp',
      value: sensors.exothermicTemp,
    })
  }

  return alerts
}

export const useSimulatorStore = create<SimulatorState>()(
  immer((set, _get) => ({
    params: INITIAL_PARAMS,
    equipment: INITIAL_EQUIPMENT,
    sensors: INITIAL_SENSORS,
    timeSeries: [],
    alerts: [],
    darkMode: true,
    running: false,
    tick: 0,

    setParam: (key, value) =>
      set((state) => {
        state.params = { ...state.params, [key]: value }
      }),

    toggleEquipment: (id) =>
      set((state) => {
        const eq = state.equipment[id]
        eq.active = !eq.active
        eq.status = eq.active ? 'active' : 'inactive'
      }),

    toggleDarkMode: () =>
      set((state) => {
        state.darkMode = !state.darkMode
      }),

    toggleRunning: () =>
      set((state) => {
        state.running = !state.running
      }),

    clearAlerts: () =>
      set((state) => {
        state.alerts = []
      }),

    reset: () =>
      set(() => ({
        params: { ...INITIAL_PARAMS },
        equipment: Object.fromEntries(
          Object.entries(INITIAL_EQUIPMENT).map(([k, v]) => [k, { ...v }])
        ) as typeof INITIAL_EQUIPMENT,
        sensors: { ...INITIAL_SENSORS },
        timeSeries: [],
        alerts: [],
        running: false,
        tick: 0,
      })),

    tick_simulation: () =>
      set((state) => {
        if (!state.running) return

        const tick = state.tick + 1
        state.tick = tick

        const activeSet = new Set<string>(
          Object.values(state.equipment)
            .filter((e) => e.active)
            .map((e) => e.id)
        )

        const newSensors = simulationStep(state.sensors, state.params, activeSet, tick)
        state.sensors = newSensors

        const point = buildTimePoint(tick, newSensors)
        state.timeSeries = [...state.timeSeries.slice(-59), point]

        // Update equipment status based on sensor readings
        if (state.equipment.rotary_kiln.active) {
          if (newSensors.kilnTemp > 650) state.equipment.rotary_kiln.status = 'error'
          else if (newSensors.kilnTemp > 600) state.equipment.rotary_kiln.status = 'warning'
          else state.equipment.rotary_kiln.status = 'active'
        }
        if (state.equipment.mixer_tank.active) {
          if (newSensors.tankPressure > 50) state.equipment.mixer_tank.status = 'error'
          else if (newSensors.tankPressure > 40) state.equipment.mixer_tank.status = 'warning'
          else state.equipment.mixer_tank.status = 'active'
        }

        // Alerts (only on every 5th tick to avoid spam)
        if (tick % 5 === 0) {
          const newAlerts = checkAlerts(newSensors, tick)
          if (newAlerts.length > 0) {
            state.alerts = [...newAlerts, ...state.alerts].slice(0, 50)
          }
        }
      }),
  }))
)
