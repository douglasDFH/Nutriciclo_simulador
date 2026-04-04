import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  SimulatorState,
  SimulationParameters,
  EquipmentId,
  Equipment,
  Alert,
  ProductionPlan,
  RawMaterials,
  FlourStocks,
  ExternalMaterials,
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

  // ── SUB-PROCESO BSF ─────────────────────────────────────────────────────
  bsf_bioreactor: {
    id: 'bsf_bioreactor', name: 'Biorreactor de Cría BSF', phase: 'subproc', status: 'inactive', active: false,
    model: 'BioBox BSF-500', manufacturer: 'AgriProtein / Enterra Feed',
    specs: { capacity: '500 kg larvas/ciclo', power: '3 kW', material: 'HDPE + malla inox.', tempRange: '27–30 °C', notes: 'Módulo de cría Hermetia illucens. Ciclo 14 días. Sustrato: residuos orgánicos locales. Temperatura óptima 27–30°C. Humedad relativa 70–80%.' },
  },
  bsf_dryer: {
    id: 'bsf_dryer', name: 'Secador de Larvas BSF', phase: 'subproc', status: 'inactive', active: false,
    model: 'SD-100 BSF', manufacturer: 'Vulcanotec / Entomo Farms',
    specs: { capacity: '100 kg/h larvas frescas', power: '8 kW', material: 'AISI-304', tempRange: '70–90 °C', notes: 'Secado de larvas frescas BSF a 70–90°C por 2 h. Reduce humedad de 65% a <10% para molienda. Sistema de bandejas rotativas.' },
  },
  bsf_mill: {
    id: 'bsf_mill', name: 'Molino de Larvas Secas (BSF)', phase: 'subproc', status: 'inactive', active: false,
    model: 'BSF-Mill 500', manufacturer: 'RICHI / Bühler',
    specs: { capacity: '0.5–1 t/h', power: '15 kW', material: 'AISI-304', notes: 'Molienda de larvas secas BSF. Criba 1.5 mm. Produce harina BSF con 40–45% proteína cruda. Exclusivo para larvas (sin mezcla con otros materiales).' },
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
  bloodFlourRate: 0,
  boneFlourRate: 0,
  bsfFlourRate: 0,
}

const INITIAL_RAW_MATERIALS: RawMaterials = {
  bloodStockL:   500,   // 500 L de sangre fresca inicial
  boneStockKg:   600,   // 600 kg de hueso crudo inicial
  wasteStockKg:  300,   // 300 kg de desperdicio de matadero inicial
  larvaeStockKg:  30,   // 30 kg de larvas en biorreactor al inicio
}

const INITIAL_FLOUR_STOCKS: FlourStocks = {
  bloodFlourKg: 50,   // stock inicial pequeño para arrancar
  boneFlourKg:  30,
  bsfFlourKg:   15,
}

// Stocks externos iniciales ≈ suficiente para ~100 bloques de cada uno
const INITIAL_EXTERNAL: ExternalMaterials = {
  melazaKg:          750,   // 100 bloques × 7.50 kg
  cascarillaKg:      250,   // 100 bloques × 2.50 kg
  afrechoSoyaKg:     375,   // 100 bloques × 3.75 kg
  ureaKg:            250,   // 100 bloques × 2.50 kg
  calVivaKg:         250,   // 100 bloques × 2.50 kg
  salMineralizadaKg: 125,   // 100 bloques × 1.25 kg
  azufreKg:           25,   // 100 bloques × 0.25 kg
}

const INITIAL_PLAN: ProductionPlan = {
  targetBlocks: 500,
  blockWeightKg: 25,
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
    productionPlan: INITIAL_PLAN,
    blocksProduced: 0,
    rawMaterials: { ...INITIAL_RAW_MATERIALS },
    flourStocks: { ...INITIAL_FLOUR_STOCKS },
    externalMaterials: { ...INITIAL_EXTERNAL },

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

    setProductionPlan: (plan) =>
      set((state) => {
        state.productionPlan = { ...state.productionPlan, ...plan }
      }),

    addRawMaterial: (key, amount) =>
      set((state) => {
        state.rawMaterials[key] = state.rawMaterials[key] + Math.max(0, amount)
      }),

    addExternalMaterial: (key, amount) =>
      set((state) => {
        state.externalMaterials[key] = state.externalMaterials[key] + Math.max(0, amount)
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
        blocksProduced: 0,
        rawMaterials: { ...INITIAL_RAW_MATERIALS },
        flourStocks: { ...INITIAL_FLOUR_STOCKS },
        externalMaterials: { ...INITIAL_EXTERNAL },
      })),

    tick_simulation: () =>
      set((state) => {
        const activeSet = new Set<string>(
          Object.values(state.equipment).filter((e) => e.active).map((e) => e.id)
        )
        const hasActive = activeSet.size > 0

        // Salir solo si no hay equipos activos Y la producción está detenida
        if (!hasActive && !state.running) return

        const tick = state.tick + 1
        state.tick = tick

        // ── 1. Sensores base — siempre que haya equipos encendidos ─────────
        const newSensors = simulationStep(state.sensors, state.params, activeSet, tick)

        // ── 2. Limitar tasas de harina por disponibilidad de materia prima ─
        const bloodAvailable  = state.rawMaterials.bloodStockL   > 0
        const boneAvailable   = state.rawMaterials.boneStockKg   > 0
        const larvaeAvailable = state.rawMaterials.larvaeStockKg > 0

        if (!bloodAvailable)  newSensors.bloodFlourRate = 0
        if (!boneAvailable)   newSensors.boneFlourRate  = 0
        if (!larvaeAvailable) newSensors.bsfFlourRate   = 0

        state.sensors = newSensors

        // ── 3. Consumir materia prima por tick (1 tick = 1 s) ─────────────
        // Sangre: rendimiento 19%, densidad sangre 1.05 kg/L
        // → L/h = (kg harina/h) / 0.19 / 1.05
        if (bloodAvailable && newSensors.bloodFlourRate > 0) {
          const consume = newSensors.bloodFlourRate / 0.19 / 1.05 / 3600
          state.rawMaterials.bloodStockL = Math.max(0, state.rawMaterials.bloodStockL - consume)
        }
        // Hueso crudo: rendimiento 60% (calcina y pierde agua + materia orgánica)
        if (boneAvailable && newSensors.boneFlourRate > 0) {
          const consume = newSensors.boneFlourRate / 0.60 / 3600
          state.rawMaterials.boneStockKg = Math.max(0, state.rawMaterials.boneStockKg - consume)
        }
        // Desperdicio de matadero → biorreactor genera larvas (conversión 20%)
        // Biorreactor procesa ~72 kg/h de desperdicio cuando está activo
        if (activeSet.has('bsf_bioreactor')) {
          const wasteConsume = Math.min(72 / 3600, state.rawMaterials.wasteStockKg)
          state.rawMaterials.wasteStockKg   = Math.max(0, state.rawMaterials.wasteStockKg - wasteConsume)
          const larvaeProduced = wasteConsume * 0.20
          state.rawMaterials.larvaeStockKg  = Math.min(500, state.rawMaterials.larvaeStockKg + larvaeProduced)
        }
        // Larvas → harina BSF: rendimiento 30%
        // → kg larvas/h = (kg harina/h) / 0.30
        if (larvaeAvailable && newSensors.bsfFlourRate > 0) {
          const consume = newSensors.bsfFlourRate / 0.30 / 3600
          state.rawMaterials.larvaeStockKg = Math.max(0, state.rawMaterials.larvaeStockKg - consume)
        }

        // ── 4. Acumular stocks de harinas ─────────────────────────────────
        state.flourStocks.bloodFlourKg += newSensors.bloodFlourRate / 3600
        state.flourStocks.boneFlourKg  += newSensors.boneFlourRate  / 3600
        state.flourStocks.bsfFlourKg   += newSensors.bsfFlourRate   / 3600

        // ── 5. Producción de bloques — SOLO cuando el plan está iniciado ──
        // (running = true). Los equipos de fase 1 y subprocesos funcionan
        // independientemente; la fase 2+3 requiere que el operador pulse Iniciar.
        if (state.running) {
          const kgPerTick     = newSensors.productionRate / 3600
          const blocksPerTick = kgPerTick / state.productionPlan.blockWeightKg

          // Necesidades por tick — harinas internas
          const bloodNeed  = blocksPerTick * 25 * 0.10
          const boneNeed   = blocksPerTick * 25 * 0.05
          const bsfNeed    = blocksPerTick * 25 * 0.04
          // Necesidades por tick — insumos externos
          const melazaNeed  = blocksPerTick * 25 * 0.30
          const cascNeed    = blocksPerTick * 25 * 0.10
          const afrechoNeed = blocksPerTick * 25 * 0.15
          const ureaNeed    = blocksPerTick * 25 * 0.10
          const calNeed     = blocksPerTick * 25 * 0.10
          const salNeed     = blocksPerTick * 25 * 0.05
          const azufreNeed  = blocksPerTick * 25 * 0.01

          const canProduceBlocks =
            state.flourStocks.bloodFlourKg            >= bloodNeed   &&
            state.flourStocks.boneFlourKg             >= boneNeed    &&
            state.flourStocks.bsfFlourKg              >= bsfNeed     &&
            state.externalMaterials.melazaKg          >= melazaNeed  &&
            state.externalMaterials.cascarillaKg      >= cascNeed    &&
            state.externalMaterials.afrechoSoyaKg     >= afrechoNeed &&
            state.externalMaterials.ureaKg            >= ureaNeed    &&
            state.externalMaterials.calVivaKg         >= calNeed     &&
            state.externalMaterials.salMineralizadaKg >= salNeed     &&
            state.externalMaterials.azufreKg          >= azufreNeed

          if (canProduceBlocks) {
            state.flourStocks.bloodFlourKg            = Math.max(0, state.flourStocks.bloodFlourKg            - bloodNeed)
            state.flourStocks.boneFlourKg             = Math.max(0, state.flourStocks.boneFlourKg             - boneNeed)
            state.flourStocks.bsfFlourKg              = Math.max(0, state.flourStocks.bsfFlourKg              - bsfNeed)
            state.externalMaterials.melazaKg          = Math.max(0, state.externalMaterials.melazaKg          - melazaNeed)
            state.externalMaterials.cascarillaKg      = Math.max(0, state.externalMaterials.cascarillaKg      - cascNeed)
            state.externalMaterials.afrechoSoyaKg     = Math.max(0, state.externalMaterials.afrechoSoyaKg     - afrechoNeed)
            state.externalMaterials.ureaKg            = Math.max(0, state.externalMaterials.ureaKg            - ureaNeed)
            state.externalMaterials.calVivaKg         = Math.max(0, state.externalMaterials.calVivaKg         - calNeed)
            state.externalMaterials.salMineralizadaKg = Math.max(0, state.externalMaterials.salMineralizadaKg - salNeed)
            state.externalMaterials.azufreKg          = Math.max(0, state.externalMaterials.azufreKg          - azufreNeed)

            state.blocksProduced = Math.min(
              state.blocksProduced + blocksPerTick,
              state.productionPlan.targetBlocks
            )
          }

          // Alerta de insumos para el plan de producción
          if (tick % 5 === 0 && !canProduceBlocks && newSensors.productionRate > 0) {
            state.alerts = [{
              id: `insumo-short-${tick}`, timestamp: new Date(), type: 'warning',
              message: 'Producción de bloques pausada: algún insumo agotado — revisa Materia Prima',
              parameter: 'flourStocks', value: 0,
            }, ...state.alerts].slice(0, 50)
          }
        }

        // ── 6. Time series ─────────────────────────────────────────────────
        const point = buildTimePoint(tick, newSensors)
        state.timeSeries = [...state.timeSeries.slice(-59), point]

        // ── 7. Estado de equipos ───────────────────────────────────────────
        if (state.equipment.rotary_kiln.active) {
          if (newSensors.kilnTemp > 620)      state.equipment.rotary_kiln.status = 'error'
          else if (newSensors.kilnTemp > 600) state.equipment.rotary_kiln.status = 'warning'
          else                                state.equipment.rotary_kiln.status = 'active'
        }
        if (state.equipment.screw_conveyor.active) {
          if (state.equipment.rotary_kiln.active && newSensors.kilnTemp < 400)
            state.equipment.screw_conveyor.status = 'warning'
          else
            state.equipment.screw_conveyor.status = 'active'
        }
        if (state.equipment.marmita.active) {
          state.equipment.marmita.status = bloodAvailable ? 'active' : 'warning'
        }
        if (state.equipment.bsf_bioreactor.active) {
          state.equipment.bsf_bioreactor.status =
            state.rawMaterials.wasteStockKg > 0 ? 'active' : 'warning'
        }
        if (state.equipment.rotary_dryer.active) {
          if (newSensors.dryerTemp > 130) state.equipment.rotary_dryer.status = 'warning'
          else                            state.equipment.rotary_dryer.status = 'active'
        }
        if (state.equipment.ribbon_mixer.active) {
          if (newSensors.tankPressure > 50)      state.equipment.ribbon_mixer.status = 'error'
          else if (newSensors.tankPressure > 40) state.equipment.ribbon_mixer.status = 'warning'
          else                                   state.equipment.ribbon_mixer.status = 'active'
        }
        if (state.equipment.paddle_mixer.active) {
          if (newSensors.exothermicTemp > 180) state.equipment.paddle_mixer.status = 'warning'
          else                                 state.equipment.paddle_mixer.status = 'active'
        }

        // ── 8. Alertas (cada 5 ticks) ──────────────────────────────────────
        if (tick % 5 === 0) {
          const ts = new Date()
          const newAlerts: Alert[] = [...checkAlerts(newSensors, tick)]

          // Alertas de materia prima
          const bloodConsumeH = newSensors.bloodFlourRate / 0.19 / 1.05
          const boneConsumeH  = newSensors.boneFlourRate  / 0.60
          const wasteConsumeH = activeSet.has('bsf_bioreactor') ? 72 : 0

          if (bloodConsumeH > 0) {
            const h = state.rawMaterials.bloodStockL / bloodConsumeH
            if (h < 0.25)
              newAlerts.push({ id: `blood-crit-${tick}`, timestamp: ts, type: 'error',
                message: `Sin sangre en ${(h * 60).toFixed(0)} min — recarga en modal Materia Prima`,
                parameter: 'bloodStock', value: state.rawMaterials.bloodStockL })
            else if (h < 1)
              newAlerts.push({ id: `blood-low-${tick}`, timestamp: ts, type: 'warning',
                message: `Stock sangre bajo: ${state.rawMaterials.bloodStockL.toFixed(0)} L (~${h.toFixed(1)} h)`,
                parameter: 'bloodStock', value: state.rawMaterials.bloodStockL })
          }
          if (boneConsumeH > 0) {
            const h = state.rawMaterials.boneStockKg / boneConsumeH
            if (h < 0.25)
              newAlerts.push({ id: `bone-crit-${tick}`, timestamp: ts, type: 'error',
                message: `Sin hueso en ${(h * 60).toFixed(0)} min — recarga en modal Materia Prima`,
                parameter: 'boneStock', value: state.rawMaterials.boneStockKg })
            else if (h < 1)
              newAlerts.push({ id: `bone-low-${tick}`, timestamp: ts, type: 'warning',
                message: `Stock hueso bajo: ${state.rawMaterials.boneStockKg.toFixed(0)} kg (~${h.toFixed(1)} h)`,
                parameter: 'boneStock', value: state.rawMaterials.boneStockKg })
          }
          if (wasteConsumeH > 0) {
            const h = state.rawMaterials.wasteStockKg / wasteConsumeH
            if (h < 0.5)
              newAlerts.push({ id: `waste-low-${tick}`, timestamp: ts, type: 'warning',
                message: `Desperdicio matadero bajo: ${state.rawMaterials.wasteStockKg.toFixed(0)} kg — biorreactor BSF se detendrá`,
                parameter: 'wasteStock', value: state.rawMaterials.wasteStockKg })
          }
          // Alertas insumos externos bajos (< 20 bloques restantes)
          const extAlerts: Array<[string, number, string]> = [
            ['melaza',       state.externalMaterials.melazaKg          / 7.50, 'Melaza de caña'],
            ['cascarilla',   state.externalMaterials.cascarillaKg      / 2.50, 'Cascarilla de arroz'],
            ['afrecho',      state.externalMaterials.afrechoSoyaKg     / 3.75, 'Afrecho de soya'],
            ['urea',         state.externalMaterials.ureaKg            / 2.50, 'Urea agrícola'],
            ['cal',          state.externalMaterials.calVivaKg         / 2.50, 'Cal viva'],
            ['sal',          state.externalMaterials.salMineralizadaKg / 1.25, 'Sal mineralizada'],
            ['azufre',       state.externalMaterials.azufreKg          / 0.25, 'Azufre'],
          ]
          for (const [key, blocksLeft, name] of extAlerts) {
            if (blocksLeft < 1)
              newAlerts.push({ id: `ext-crit-${key}-${tick}`, timestamp: ts, type: 'error',
                message: `Sin ${name} — producción de bloques pausada`,
                parameter: key, value: blocksLeft })
            else if (blocksLeft < 15)
              newAlerts.push({ id: `ext-low-${key}-${tick}`, timestamp: ts, type: 'warning',
                message: `${name} bajo: ~${Math.floor(blocksLeft)} bloques restantes`,
                parameter: key, value: blocksLeft })
          }

          if (newAlerts.length > 0)
            state.alerts = [...newAlerts, ...state.alerts].slice(0, 50)
        }
      }),
  }))
)
