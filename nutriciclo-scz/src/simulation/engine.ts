import type { SimulationParameters, SensorReadings, TimeSeriesPoint } from './types'

export function calcKilnTemp(current: number, target: number, active: boolean, dt = 1): number {
  const targetTemp = active ? target : 25
  const inertia = 0.05 * dt
  const noise = (Math.random() - 0.5) * 4
  return current + (targetTemp - current) * inertia + noise
}

export function calcDryerTemp(current: number, active: boolean, dt = 1): number {
  const targetTemp = active ? 100 : 25   // 80–120°C, nominal 100°C
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

export function calcProductionRate(params: SimulationParameters, activeCount: number): number {
  if (activeCount === 0) return 0
  const base = 50 + (activeCount / 15) * 250
  const tempBonus = params.calcinationTemp > 500 ? 20 : 0
  const molassesBonus = params.molassesFlow * 0.3
  const rpmBonus = ((params.grindingRPM - 1500) / 1500) * 25
  const limeBonus = (params.limeAmount / 50) * 20
  const curingBonus = (params.curingTime / 60) * 15
  const noise = (Math.random() - 0.5) * 10
  return Math.max(0, base + tempBonus + molassesBonus + rpmBonus + limeBonus + curingBonus + noise)
}

export function simulationStep(
  prev: SensorReadings,
  params: SimulationParameters,
  activeEquipment: Set<string>,
  tick: number
): SensorReadings {
  const kilnActive         = activeEquipment.has('rotary_kiln')
  const dryerActive        = activeEquipment.has('rotary_dryer')
  const ribbonMixerActive  = activeEquipment.has('ribbon_mixer')
  const pumpActive         = activeEquipment.has('peristaltic_pump')
  const limeActive         = activeEquipment.has('lime_dosifier')
  const paddleMixerActive  = activeEquipment.has('paddle_mixer')
  const activeCount        = activeEquipment.size

  return {
    kilnTemp:           calcKilnTemp(prev.kilnTemp, params.calcinationTemp, kilnActive),
    dryerTemp:          calcDryerTemp(prev.dryerTemp, dryerActive),
    tankPressure:       calcTankPressure(params.molassesFlow, ribbonMixerActive, tick),
    molassesFlowActual: calcMolassesFlow(prev.molassesFlowActual, params.molassesFlow, pumpActive),
    exothermicTemp:     calcExothermicTemp(params.limeAmount, paddleMixerActive, limeActive, tick),
    mixViscosity:       calcViscosity(prev.molassesFlowActual),
    productionRate:     calcProductionRate(params, activeCount),
  }
}

export function buildTimePoint(tick: number, sensors: SensorReadings): TimeSeriesPoint {
  return {
    time:          tick,
    kilnTemp:      Math.round(sensors.kilnTemp * 10) / 10,
    dryerTemp:     Math.round(sensors.dryerTemp * 10) / 10,
    tankPressure:  Math.round(sensors.tankPressure * 10) / 10,
    molassesFlow:  Math.round(sensors.molassesFlowActual * 10) / 10,
    exothermicTemp: Math.round(sensors.exothermicTemp * 10) / 10,
  }
}
