import type { SimulationParameters, SensorReadings, TimeSeriesPoint } from './types'

export function calcKilnTemp(current: number, target: number, active: boolean, dt = 1): number {
  const targetTemp = active ? target : 25
  const inertia = 0.05 * dt
  const noise = (Math.random() - 0.5) * 4
  return current + (targetTemp - current) * inertia + noise
}

export function calcDryerTemp(current: number, active: boolean, dt = 1): number {
  // Secado de harina de sangre: 60–70°C por 8–12 horas (datos FRIGOR reales)
  const targetTemp = active ? 65 : 25
  const inertia = 0.08 * dt
  const noise = (Math.random() - 0.5) * 3
  return Math.max(25, current + (targetTemp - current) * inertia + noise)
}

export function calcViscosity(molassesFlow: number): number {
  const base = 100 + (molassesFlow / 100) * 4900
  const noise = (Math.random() - 0.5) * 50
  return Math.max(100, base + noise)
}

export function calcExothermicTemp(
  limeAmount: number,
  paddleMixerActive: boolean,
  limeDosifierActive: boolean,
  tick: number
): number {
  if (!paddleMixerActive || !limeDosifierActive) return 25 + Math.random() * 2
  const cyclePos = (tick % 120) / 120
  const peak = 25 + limeAmount * 3.5 * Math.sin(Math.PI * cyclePos)
  const noise = (Math.random() - 0.5) * 3
  return Math.max(25, peak + noise)
}

export function calcTankPressure(molassesFlow: number, ribbonMixerActive: boolean, tick: number): number {
  if (!ribbonMixerActive) return 5 + Math.random()
  const base = 10 + (molassesFlow / 100) * 35
  const wave = Math.sin(tick * 0.1) * 3
  const noise = (Math.random() - 0.5) * 2
  return Math.max(5, base + wave + noise)
}

export function calcMolassesFlow(current: number, target: number, pumpActive: boolean): number {
  const targetFlow = pumpActive ? target : 0
  const lag = 0.15
  const noise = pumpActive ? (Math.random() - 0.5) * 2 : 0
  return Math.max(0, current + (targetFlow - current) * lag + noise)
}

/**
 * Harina de Sangre: producida cuando Marmita + Secador + Molino están activos.
 * Datos reales FRIGOR:
 *   - Rendimiento: 18–20% (de sangre fresca → harina seca)
 *   - Marmita MV-300L: cocción 100°C · Secador SD-500: 60–70°C por 8–12h
 *   - Proteína harina: 80–85% · Densidad sangre: 1.05–1.06 g/ml
 *   - Base simulación: ~75 kg/h representa throughput del sistema (marmita + secador en serie)
 */
export function calcBloodFlourRate(
  marmitaActive: boolean,
  dryerActive: boolean,
  millActive: boolean
): number {
  if (!marmitaActive || !dryerActive || !millActive) return 0
  // ~75 kg/h = throughput del sistema con rendimiento 19% sobre flujo de sangre de entrada
  const base = 75 + (Math.random() - 0.5) * 8
  return Math.max(0, base)
}

/**
 * Harina BSF (Hermetia illucens): cuando Biorreactor + Secador BSF + Molino BSF activos.
 * Datos reales literatura científica (Scielo, IIAP):
 *   - Rendimiento larva fresca → harina: 25–35% (prom. 30%)
 *   - Rendimiento residuo orgánico → larva: 15–25%
 *   - Proteína harina: 38–44% · Grasa: 27–35% · Ácido láurico: 30–50% del perfil graso
 *   - Ciclo: 14–21 días a 28–30°C · Humedad óptima 60–70%
 *   - Módulos BSF (bandejas 60×40cm): 50–100 kg larvas/ciclo
 */
export function calcBSFFlourRate(
  bioreactorActive: boolean,
  bsfDryerActive: boolean,
  bsfMillActive: boolean
): number {
  if (!bioreactorActive || !bsfDryerActive || !bsfMillActive) return 0
  const base = 38 + (Math.random() - 0.5) * 6
  return Math.max(0, base)
}

export function calcProductionRate(params: SimulationParameters, activeCount: number): number {
  if (activeCount === 0) return 0
  const base = 50 + (activeCount / 18) * 250
  const tempBonus    = params.calcinationTemp > 500 ? 20 : 0
  const molassesBonus = params.molassesFlow * 0.3
  const rpmBonus     = ((params.grindingRPM - 1500) / 1500) * 25
  const limeBonus    = (params.limeAmount / 50) * 20
  const curingBonus  = (params.curingTime / 60) * 15
  const noise        = (Math.random() - 0.5) * 10
  return Math.max(0, base + tempBonus + molassesBonus + rpmBonus + limeBonus + curingBonus + noise)
}

export function simulationStep(
  prev: SensorReadings,
  params: SimulationParameters,
  activeEquipment: Set<string>,
  tick: number
): SensorReadings {
  const kilnActive        = activeEquipment.has('rotary_kiln')
  const dryerActive       = activeEquipment.has('rotary_dryer')
  const ribbonMixerActive = activeEquipment.has('ribbon_mixer')
  const pumpActive        = activeEquipment.has('peristaltic_pump')
  const limeActive        = activeEquipment.has('lime_dosifier')
  const paddleMixerActive = activeEquipment.has('paddle_mixer')
  const marmitaActive     = activeEquipment.has('marmita')
  const millActive        = activeEquipment.has('hammer_mill')
  const bioreactorActive  = activeEquipment.has('bsf_bioreactor')
  const bsfDryerActive    = activeEquipment.has('bsf_dryer')
  const bsfMillActive     = activeEquipment.has('bsf_mill')
  const activeCount       = activeEquipment.size

  return {
    kilnTemp:           calcKilnTemp(prev.kilnTemp, params.calcinationTemp, kilnActive),
    dryerTemp:          calcDryerTemp(prev.dryerTemp, dryerActive),
    tankPressure:       calcTankPressure(params.molassesFlow, ribbonMixerActive, tick),
    molassesFlowActual: calcMolassesFlow(prev.molassesFlowActual, params.molassesFlow, pumpActive),
    exothermicTemp:     calcExothermicTemp(params.limeAmount, paddleMixerActive, limeActive, tick),
    mixViscosity:       calcViscosity(prev.molassesFlowActual),
    productionRate:     calcProductionRate(params, activeCount),
    bloodFlourRate:     calcBloodFlourRate(marmitaActive, dryerActive, millActive),
    bsfFlourRate:       calcBSFFlourRate(bioreactorActive, bsfDryerActive, bsfMillActive),
  }
}

export function buildTimePoint(tick: number, sensors: SensorReadings): TimeSeriesPoint {
  return {
    time:           tick,
    kilnTemp:       Math.round(sensors.kilnTemp * 10) / 10,
    dryerTemp:      Math.round(sensors.dryerTemp * 10) / 10,
    tankPressure:   Math.round(sensors.tankPressure * 10) / 10,
    molassesFlow:   Math.round(sensors.molassesFlowActual * 10) / 10,
    exothermicTemp: Math.round(sensors.exothermicTemp * 10) / 10,
  }
}
