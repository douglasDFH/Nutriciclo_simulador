import type { SimulationParameters, SensorReadings, TimeSeriesPoint } from './types'

/**
 * Calcination curve: temperature with thermal inertia
 * Models heating/cooling of rotary kiln toward target temp
 */
export function calcKilnTemp(
  current: number,
  target: number,
  active: boolean,
  dt: number = 1
): number {
  const targetTemp = active ? target : 25
  const inertia = 0.05 * dt
  const noise = (Math.random() - 0.5) * 4
  return current + (targetTemp - current) * inertia + noise
}

/**
 * Mix viscosity: higher molasses → higher viscosity (cP)
 * Range: 100–5000 cP
 */
export function calcViscosity(molassesFlow: number): number {
  // molassesFlow: 0–100 L/min mapped to viscosity
  const base = 100 + (molassesFlow / 100) * 4900
  const noise = (Math.random() - 0.5) * 50
  return Math.max(100, base + noise)
}

/**
 * Exothermic reaction of quicklime (CaO + H2O → Ca(OH)2)
 * Peak temperature depends on lime amount
 * Decays over time
 */
export function calcExothermicTemp(
  limeAmount: number,
  mixerActive: boolean,
  limeDosifierActive: boolean,
  tick: number
): number {
  if (!mixerActive || !limeDosifierActive) return 25 + Math.random() * 2

  // Peak at ~30s after activation, decays after
  const cyclePos = (tick % 120) / 120 // 0–1 over 2 minutes
  const peak = 25 + limeAmount * 3.5 * Math.sin(Math.PI * cyclePos)
  const noise = (Math.random() - 0.5) * 3
  return Math.max(25, peak + noise)
}

/**
 * Tank pressure (PSI): driven by mixer activity and flow
 */
export function calcTankPressure(
  molassesFlow: number,
  mixerActive: boolean,
  tick: number
): number {
  if (!mixerActive) return 5 + Math.random()
  const base = 10 + (molassesFlow / 100) * 35
  const wave = Math.sin(tick * 0.1) * 3
  const noise = (Math.random() - 0.5) * 2
  return Math.max(5, base + wave + noise)
}

/**
 * Actual molasses flow (L/min): follows target with lag
 */
export function calcMolassesFlow(
  current: number,
  target: number,
  pumpActive: boolean
): number {
  const targetFlow = pumpActive ? target : 0
  const lag = 0.15
  const noise = pumpActive ? (Math.random() - 0.5) * 2 : 0
  return Math.max(0, current + (targetFlow - current) * lag + noise)
}

/**
 * Production rate (kg/h) based on all active equipment and process parameters.
 * - calcinationTemp: higher temp → better calcination → more yield
 * - molassesFlow: binder volume → proportional contribution
 * - grindingRPM: finer grind → better particle integration → more yield
 * - limeAmount: more CaO → more granule mass
 * - curingTime: longer cure → higher solidity per cycle
 */
export function calcProductionRate(
  params: SimulationParameters,
  activeCount: number
): number {
  if (activeCount === 0) return 0
  const base = 50 + (activeCount / 7) * 150
  const tempBonus = params.calcinationTemp > 500 ? 20 : 0
  const molassesBonus = params.molassesFlow * 0.3
  const rpmBonus = ((params.grindingRPM - 500) / 2500) * 25
  const limeBonus = (params.limeAmount / 50) * 20
  const curingBonus = (params.curingTime / 60) * 15
  const noise = (Math.random() - 0.5) * 10
  return Math.max(0, base + tempBonus + molassesBonus + rpmBonus + limeBonus + curingBonus + noise)
}

/**
 * Main simulation step: compute all sensor readings
 */
export function simulationStep(
  prev: SensorReadings,
  params: SimulationParameters,
  activeEquipment: Set<string>,
  tick: number
): SensorReadings {
  const kilnActive = activeEquipment.has('rotary_kiln')
  const mixerActive = activeEquipment.has('mixer_tank')
  const pumpActive = activeEquipment.has('molasses_pump')
  const limeActive = activeEquipment.has('lime_dosifier')

  const activeCount = activeEquipment.size

  return {
    kilnTemp: calcKilnTemp(prev.kilnTemp, params.calcinationTemp, kilnActive),
    tankPressure: calcTankPressure(params.molassesFlow, mixerActive, tick),
    molassesFlowActual: calcMolassesFlow(prev.molassesFlowActual, params.molassesFlow, pumpActive),
    exothermicTemp: calcExothermicTemp(params.limeAmount, mixerActive, limeActive, tick),
    mixViscosity: calcViscosity(prev.molassesFlowActual),
    productionRate: calcProductionRate(params, activeCount),
  }
}

export function buildTimePoint(tick: number, sensors: SensorReadings): TimeSeriesPoint {
  return {
    time: tick,
    kilnTemp: Math.round(sensors.kilnTemp * 10) / 10,
    tankPressure: Math.round(sensors.tankPressure * 10) / 10,
    molassesFlow: Math.round(sensors.molassesFlowActual * 10) / 10,
    exothermicTemp: Math.round(sensors.exothermicTemp * 10) / 10,
  }
}
