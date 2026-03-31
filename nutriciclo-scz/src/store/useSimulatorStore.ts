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
  grindingRPM: 2000,
  molassesFlow: 40,
  limeAmount: 20,
  curingTime: 30,
}

const INITIAL_EQUIPMENT: Record<EquipmentId, Equipment> = {
  // ── FASE 1 ──────────────────────────────────────────────────────────────
  marmita: {
    id: 'marmita', name: 'Marmita Industrial', phase: 'phase1', status: 'inactive', active: false,
    model: 'MV-300', manufacturer: 'Jersa / Vulcano',
    specs: { capacity: '300 L / ciclo', power: '12 kW', material: 'AISI-304', tempRange: '20–150 °C', notes: 'Doble fondo para calentamiento. Sistema de prensado integrado. Hervor + prensado en 20 min. Válvula de seguridad 1.5 bar.' },
  },
  rotary_dryer: {
    id: 'rotary_dryer', name: 'Secador Rotatorio', phase: 'phase1', status: 'inactive', active: false,
    model: 'SD-500', manufacturer: 'Vulcanotec / CITIC HIC',
    specs: { capacity: '0.5–3 t/h', power: '22 kW', material: 'Acero carbono + refractario', tempRange: '80–120 °C', notes: 'Flujo de aire caliente contracorriente. Secado de harina de sangre prensada y subproductos húmedos antes de molienda.' },
  },
  screw_conveyor: {
    id: 'screw_conveyor', name: 'Transportador Sinfín', phase: 'phase1', status: 'inactive', active: false,
    model: 'TSC-250', manufacturer: 'WAM Group / Bega Helicoidales',
    specs: { capacity: '1–15 t/h', power: '5.5 kW', material: 'Acero al carbono', notes: 'Diámetro 250 mm. Longitud hasta 12 m. Transporte de huesos al horno, harinas al molino, etc.' },
  },
  rotary_kiln: {
    id: 'rotary_kiln', name: 'Horno Rotatorio', phase: 'phase1', status: 'inactive', active: false,
    model: 'RK-Series Φ4.0×60m', manufacturer: 'CITIC HIC / FTM Machinery',
    specs: { capacity: '1–5 t/h de hueso', power: '75 kW', material: 'Refractario Al₂O₃', tempRange: '500–600 °C', notes: 'Calcinación de huesos crudos 4 h para producir harina de hueso (fosfato de calcio). Inclinación 2.5–4.5°. Velocidad rot. 1–5 RPM.' },
  },
  hammer_mill: {
    id: 'hammer_mill', name: 'Molino de Martillos', phase: 'phase1', status: 'inactive', active: false,
    model: '9FQ-Series', manufacturer: 'RICHI / ANCO / Prater Mega Mill',
    specs: { capacity: '1–10 t/h', power: '22–55 kW', material: 'Acero inox. AISI-304', notes: 'Criba intercambiable 2 mm para cascarilla. Velocidad 1500–3000 RPM. Molienda de cascarilla, harina de sangre, hueso y BSF.' },
  },

  // ── FASE 2 ──────────────────────────────────────────────────────────────
  molasses_tank: {
    id: 'molasses_tank', name: 'Tanque Almacenamiento Melaza', phase: 'phase2', status: 'inactive', active: false,
    model: 'TCI-2000', manufacturer: 'Inoxpa / Sprinkman Stainless Tanks',
    specs: { capacity: '1000–5000 L', power: '1.5 kW', material: 'AISI-304/316. Fondo cónico', notes: 'Almacenamiento de melaza en frío. Agitador opcional. Descarga total por fondo cónico.' },
  },
  peristaltic_pump: {
    id: 'peristaltic_pump', name: 'Bomba Peristáltica Dosificadora', phase: 'phase2', status: 'inactive', active: false,
    model: 'DULCOFLEX DFYa', manufacturer: 'ProMinent / Watson-Marlow Qdos 60',
    specs: { capacity: '10 ml/h – 660 L/h', power: '0.75 kW', material: 'EPDM / FKM', notes: 'Sin válvulas. Precisión ±1%. Compatible IoT (PROFIBUS/CANopen). Dosificación precisa de melaza al mezclador.' },
  },
  dissolution_tank: {
    id: 'dissolution_tank', name: 'Batea de Disolución', phase: 'phase2', status: 'inactive', active: false,
    model: 'DT-300', manufacturer: 'Inoxpa / Fabricación local',
    specs: { capacity: '200–500 L', power: '3 kW', material: 'AISI-304', notes: 'Agitador de paletas tipo ancla. Control de temperatura. Disolución de urea y sal mineralizada en agua antes de incorporar al mezclador.' },
  },
  transfer_pump: {
    id: 'transfer_pump', name: 'Bomba Centrífuga Sanitaria', phase: 'phase2', status: 'inactive', active: false,
    model: 'LKH-25', manufacturer: 'Alfa Laval / Inoxpa RV-80',
    specs: { capacity: '5–50 m³/h', power: '5.5 kW', material: 'AISI-316L. Sello mecánico', notes: 'Certificación sanitaria. Transferencia de solución urea/sal desde batea al mezclador principal.' },
  },
  ribbon_mixer: {
    id: 'ribbon_mixer', name: 'Mezcladora Horizontal de Cintas', phase: 'phase2', status: 'inactive', active: false,
    model: 'HJJ-3000', manufacturer: 'Huaxin / Bremetz WLDH',
    specs: { capacity: '500–3000 kg/lote', power: '37 kW', material: 'AISI-304 + revestimiento epoxi', notes: 'Doble espiral inversa. Tiempo de mezcla 10–15 min. Mezcla húmeda homogénea de melaza con urea y sal mineralizada.' },
  },

  // ── FASE 3 ──────────────────────────────────────────────────────────────
  paddle_mixer: {
    id: 'paddle_mixer', name: 'Mezcladora Paletas Doble Eje', phase: 'phase3', status: 'inactive', active: false,
    model: 'WLDH-2000', manufacturer: 'Huaxin / ACME WZ Series',
    specs: { capacity: '1–5 t/lote', power: '45 kW', material: 'Acero carbono + recubrimiento', notes: 'Doble eje con paletas ajustables. Tiempo de mezcla 3–8 min. Descarga rápida. Incorporación de sólidos a la mezcla húmeda.' },
  },
  lime_dosifier: {
    id: 'lime_dosifier', name: 'Dosificador de Cal Viva', phase: 'phase3', status: 'inactive', active: false,
    model: 'K-ML-D5-KT20', manufacturer: 'Schenck Process / K-Tron (Coperion)',
    specs: { capacity: '50–500 kg/h', power: '2.2 kW', material: 'Acero carbono + polietileno', notes: 'Tornillo dosificador con variador de frecuencia. Precisión ±0.5%. Sellado hermético anti-polvo. Tolva 500 kg.' },
  },
  vibrating_table: {
    id: 'vibrating_table', name: 'Vibradora de Mesa + Moldes', phase: 'phase3', status: 'inactive', active: false,
    model: 'VT-1000', manufacturer: 'Vibra Technologie / Syntron FMC',
    specs: { capacity: '20–100 unid/ciclo', power: '3 kW', material: 'Acero + moldes Al fundido', notes: 'Mesa 1000×1500 mm. Frecuencia 3000–6000 VPM. Vertido y vibración para eliminar burbujas durante fraguado exotérmico.' },
  },
  belt_conveyor: {
    id: 'belt_conveyor', name: 'Cinta Transportadora', phase: 'phase3', status: 'inactive', active: false,
    model: 'FlatTop Series', manufacturer: 'Interroll / Rexnord',
    specs: { capacity: 'variable', power: '1.5 kW', material: 'Banda PVC/PU alimentaria', notes: 'Ancho 400–800 mm. Velocidad 0.1–1 m/s. Largo hasta 15 m. Transporte de moldes llenos a zona de curado y producto terminado a empaque.' },
  },
  ventilation: {
    id: 'ventilation', name: 'Sistema de Ventilación', phase: 'phase3', status: 'inactive', active: false,
    model: 'CMP-4500', manufacturer: 'Sodeca / Systemair AW',
    specs: { capacity: '2000–8000 m³/h', power: '5.5 kW', material: 'Ductos acero galvanizado', notes: 'Filtros de partículas. Extracción de gases y calor generado por reacción exotérmica de cal viva. Seguridad del operador.' },
  },
}

const INITIAL_SENSORS = {
  kilnTemp: 25,
  dryerTemp: 25,
  tankPressure: 5,
  molassesFlowActual: 0,
  exothermicTemp: 25,
  mixViscosity: 100,
  productionRate: 0,
}

function checkAlerts(sensors: ReturnType<typeof simulationStep>, tick: number): Alert[] {
  const alerts: Alert[] = []
  const ts = new Date()

  if (sensors.kilnTemp > 620) {
    alerts.push({ id: `kiln-hot-${tick}`, timestamp: ts, type: 'error',
      message: `Temperatura horno crítica: ${sensors.kilnTemp.toFixed(1)}°C (límite: 620°C)`, parameter: 'kilnTemp', value: sensors.kilnTemp })
  } else if (sensors.kilnTemp > 600) {
    alerts.push({ id: `kiln-warn-${tick}`, timestamp: ts, type: 'warning',
      message: `Temperatura horno elevada: ${sensors.kilnTemp.toFixed(1)}°C`, parameter: 'kilnTemp', value: sensors.kilnTemp })
  }

  if (sensors.dryerTemp > 130) {
    alerts.push({ id: `dryer-hot-${tick}`, timestamp: ts, type: 'warning',
      message: `Temperatura secador alta: ${sensors.dryerTemp.toFixed(1)}°C (límite: 120°C)`, parameter: 'dryerTemp', value: sensors.dryerTemp })
  }

  if (sensors.tankPressure > 50) {
    alerts.push({ id: `pressure-${tick}`, timestamp: ts, type: 'error',
      message: `Presión mezcladora crítica: ${sensors.tankPressure.toFixed(1)} PSI`, parameter: 'tankPressure', value: sensors.tankPressure })
  } else if (sensors.tankPressure > 40) {
    alerts.push({ id: `pressure-warn-${tick}`, timestamp: ts, type: 'warning',
      message: `Presión mezcladora elevada: ${sensors.tankPressure.toFixed(1)} PSI`, parameter: 'tankPressure', value: sensors.tankPressure })
  }

  if (sensors.exothermicTemp > 180) {
    alerts.push({ id: `exo-${tick}`, timestamp: ts, type: 'warning',
      message: `Reacción exotérmica intensa: ${sensors.exothermicTemp.toFixed(1)}°C`, parameter: 'exothermicTemp', value: sensors.exothermicTemp })
  }

  return alerts
}

export const useSimulatorStore = create<SimulatorState>()(
  immer((set) => ({
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
      set((state) => { state.darkMode = !state.darkMode }),

    toggleRunning: () =>
      set((state) => { state.running = !state.running }),

    clearAlerts: () =>
      set((state) => { state.alerts = [] }),

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
          Object.values(state.equipment).filter((e) => e.active).map((e) => e.id)
        )

        const newSensors = simulationStep(state.sensors, state.params, activeSet, tick)
        state.sensors = newSensors

        const point = buildTimePoint(tick, newSensors)
        state.timeSeries = [...state.timeSeries.slice(-59), point]

        // Update equipment status based on sensors
        if (state.equipment.rotary_kiln.active) {
          if (newSensors.kilnTemp > 620) state.equipment.rotary_kiln.status = 'error'
          else if (newSensors.kilnTemp > 600) state.equipment.rotary_kiln.status = 'warning'
          else state.equipment.rotary_kiln.status = 'active'
        }
        if (state.equipment.rotary_dryer.active) {
          if (newSensors.dryerTemp > 130) state.equipment.rotary_dryer.status = 'warning'
          else state.equipment.rotary_dryer.status = 'active'
        }
        if (state.equipment.ribbon_mixer.active) {
          if (newSensors.tankPressure > 50) state.equipment.ribbon_mixer.status = 'error'
          else if (newSensors.tankPressure > 40) state.equipment.ribbon_mixer.status = 'warning'
          else state.equipment.ribbon_mixer.status = 'active'
        }
        if (state.equipment.paddle_mixer.active) {
          if (newSensors.exothermicTemp > 180) state.equipment.paddle_mixer.status = 'warning'
          else state.equipment.paddle_mixer.status = 'active'
        }

        // Alerts every 5th tick
        if (tick % 5 === 0) {
          const newAlerts = checkAlerts(newSensors, tick)
          if (newAlerts.length > 0) {
            state.alerts = [...newAlerts, ...state.alerts].slice(0, 50)
          }
        }
      }),
  }))
)
