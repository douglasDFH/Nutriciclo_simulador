import { useSimulatorStore } from '../../store/useSimulatorStore'
import type { SimulationParameters } from '../../simulation/types'
import { clsx } from 'clsx'

interface SliderRowProps {
  label: string
  paramKey: keyof SimulationParameters
  min: number
  max: number
  step: number
  unit: string
  textClass: string
  hex: string
  safeRange?: [number, number]
}

function SliderRow({ label, paramKey, min, max, step, unit, textClass, hex, safeRange }: SliderRowProps) {
  const { params, setParam } = useSimulatorStore()
  const value = params[paramKey]
  const pct = ((value - min) / (max - min)) * 100

  const inSafeRange = !safeRange || (value >= safeRange[0] && value <= safeRange[1])
  const trackColor = inSafeRange ? hex : '#ef4444'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300">{label}</span>
        <span className={clsx('font-mono font-bold', inSafeRange ? textClass : 'text-red-400')}>
          {value} {unit}
          {!inSafeRange && ' ⚠'}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${pct}%`, backgroundColor: trackColor }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setParam(paramKey, Number(e.target.value) as never)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-4"
        />
        <div
          className="absolute w-3 h-3 rounded-full border-2 border-white bg-gray-900 -translate-x-1/2 pointer-events-none"
          style={{ left: `${pct}%`, borderColor: trackColor }}
        />
      </div>
      <div className="flex justify-between text-gray-600 text-xs">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export function ScenarioControls() {
  return (
    <div className="p-3 space-y-4">
      <p className="text-xs text-gray-500">
        Modifica los parámetros del proceso. Los cambios afectan la simulación y la vista 3D en tiempo real.
      </p>

      <SliderRow
        label="Temperatura de Calcinación"
        paramKey="calcinationTemp"
        min={400}
        max={700}
        step={10}
        unit="°C"
        textClass="text-orange-400"
        hex="#fb923c"
        safeRange={[450, 650]}
      />
      <SliderRow
        label="Velocidad de Molienda"
        paramKey="grindingRPM"
        min={500}
        max={3000}
        step={50}
        unit="RPM"
        textClass="text-yellow-400"
        hex="#facc15"
        safeRange={[800, 2500]}
      />
      <SliderRow
        label="Flujo de Melaza"
        paramKey="molassesFlow"
        min={0}
        max={100}
        step={1}
        unit="L/min"
        textClass="text-amber-400"
        hex="#fbbf24"
        safeRange={[10, 80]}
      />
      <SliderRow
        label="Cantidad de Cal Viva"
        paramKey="limeAmount"
        min={0}
        max={50}
        step={1}
        unit="kg"
        textClass="text-green-400"
        hex="#4ade80"
        safeRange={[5, 40]}
      />
      <SliderRow
        label="Tiempo de Fraguado"
        paramKey="curingTime"
        min={5}
        max={60}
        step={5}
        unit="min"
        textClass="text-purple-400"
        hex="#c084fc"
      />
    </div>
  )
}
