import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useSimulatorStore } from '../../store/useSimulatorStore'

interface ChartCardProps {
  title: string
  unit: string
  dataKey: string
  color: string
  warningLevel?: number
  errorLevel?: number
  domain?: [number, number]
}

function ChartCard({ title, unit, dataKey, color, warningLevel, errorLevel, domain }: ChartCardProps) {
  const { timeSeries } = useSimulatorStore()

  const data = timeSeries

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-300">{title}</span>
        <span className="text-xs font-mono text-gray-400">
          {data.length > 0
            ? `${(data[data.length - 1] as unknown as Record<string, number>)[dataKey]?.toFixed(1)} ${unit}`
            : `— ${unit}`}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <LineChart data={data} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" hide />
          <YAxis domain={domain} tick={{ fontSize: 9, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '6px', fontSize: '11px' }}
            labelFormatter={() => ''}
            formatter={(v) => [`${(v as number).toFixed(1)} ${unit}`, title]}
          />
          {warningLevel && (
            <ReferenceLine y={warningLevel} stroke="#facc15" strokeDasharray="4 2" strokeWidth={1} />
          )}
          {errorLevel && (
            <ReferenceLine y={errorLevel} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonitoringCharts() {
  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      <ChartCard
        title="Temperatura Horno"
        unit="°C"
        dataKey="kilnTemp"
        color="#f97316"
        warningLevel={600}
        errorLevel={650}
        domain={[0, 750]}
      />
      <ChartCard
        title="Presión Tanque"
        unit="PSI"
        dataKey="tankPressure"
        color="#3b82f6"
        warningLevel={40}
        errorLevel={50}
        domain={[0, 60]}
      />
      <ChartCard
        title="Flujo Melaza"
        unit="L/min"
        dataKey="molassesFlow"
        color="#fbbf24"
        domain={[0, 110]}
      />
      <ChartCard
        title="Temp. Exotérmica"
        unit="°C"
        dataKey="exothermicTemp"
        color="#a78bfa"
        warningLevel={150}
        domain={[0, 250]}
      />
    </div>
  )
}
