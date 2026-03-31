import { useSimulatorStore } from '../../store/useSimulatorStore'
import { AlertTriangle, AlertCircle, Info, Trash2, Download } from 'lucide-react'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import type { Alert } from '../../simulation/types'

function AlertItem({ alert }: { alert: Alert }) {
  const Icon = alert.type === 'error' ? AlertCircle : alert.type === 'warning' ? AlertTriangle : Info
  return (
    <div
      className={clsx(
        'flex items-start gap-2 p-2 rounded-lg text-xs border',
        alert.type === 'error' && 'bg-red-950/40 border-red-800 text-red-300',
        alert.type === 'warning' && 'bg-yellow-950/40 border-yellow-800 text-yellow-300',
        alert.type === 'info' && 'bg-blue-950/40 border-blue-800 text-blue-300',
      )}
    >
      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="leading-tight">{alert.message}</p>
        <p className="text-gray-500 mt-0.5">{format(alert.timestamp, 'HH:mm:ss')}</p>
      </div>
    </div>
  )
}

export function AlertsPanel() {
  const { alerts, clearAlerts, sensors, params, equipment, tick, blocksProduced, productionPlan } = useSimulatorStore()

  const exportReport = () => {
    const activeEq = Object.values(equipment).filter(e => e.active).map(e => e.name).join(', ')
    const report = [
      '====================================',
      '   REPORTE DE PRODUCCIÓN — NutriCiclo SCZ',
      '====================================',
      `Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
      `Tick de simulación: ${tick}`,
      '',
      '--- PARÁMETROS ---',
      `Temp. Calcinación: ${params.calcinationTemp} °C`,
      `Velocidad Molienda: ${params.grindingRPM} RPM`,
      `Flujo Melaza: ${params.molassesFlow} L/min`,
      `Cal Viva: ${params.limeAmount} kg`,
      `Tiempo Fraguado: ${params.curingTime} min`,
      '',
      '--- SENSORES ---',
      `Temperatura Horno: ${sensors.kilnTemp.toFixed(1)} °C`,
      `Presión Tanque: ${sensors.tankPressure.toFixed(1)} PSI`,
      `Flujo Melaza Real: ${sensors.molassesFlowActual.toFixed(1)} L/min`,
      `Temp. Exotérmica: ${sensors.exothermicTemp.toFixed(1)} °C`,
      `Viscosidad Mezcla: ${sensors.mixViscosity.toFixed(0)} cP`,
      `Tasa de Producción: ${sensors.productionRate.toFixed(1)} kg/h`,
      '',
      '--- PLAN DE PRODUCCIÓN ---',
      `Objetivo: ${productionPlan.targetBlocks} bloques × ${productionPlan.blockWeightKg} kg`,
      `Total kg objetivo: ${(productionPlan.targetBlocks * productionPlan.blockWeightKg).toLocaleString()} kg`,
      `Bloques producidos: ${Math.floor(blocksProduced)} / ${productionPlan.targetBlocks}`,
      `Progreso: ${((blocksProduced / productionPlan.targetBlocks) * 100).toFixed(1)}%`,
      `Tasa producción actual: ${sensors.productionRate.toFixed(1)} kg/h`,
      '',
      '--- EQUIPOS ACTIVOS ---',
      activeEq || 'Ninguno',
      '',
      '--- ALERTAS ---',
      alerts.length > 0
        ? alerts.map(a => `[${format(a.timestamp, 'HH:mm:ss')}] ${a.type.toUpperCase()}: ${a.message}`).join('\n')
        : 'Sin alertas',
      '====================================',
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutriciclo-reporte-${format(new Date(), 'yyyyMMdd-HHmmss')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
          </span>
          {alerts.filter(a => a.type === 'error').length > 0 && (
            <span className="px-1.5 py-0.5 bg-red-900 text-red-300 text-xs rounded font-bold">
              {alerts.filter(a => a.type === 'error').length} ERROR{alerts.filter(a => a.type === 'error').length > 1 ? 'ES' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="flex items-center gap-1 px-2 py-1 bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 text-xs rounded border border-blue-800 transition-colors"
          >
            <Download className="w-3 h-3" />
            Exportar
          </button>
          <button
            onClick={clearAlerts}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded border border-gray-700 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-48">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">Sin alertas activas</p>
          </div>
        ) : (
          alerts.map((a) => <AlertItem key={a.id} alert={a} />)
        )}
      </div>

      {/* Safety reference table */}
      <div className="mt-3 border-t border-gray-700 pt-3">
        <p className="text-xs text-gray-500 mb-2">Rangos de seguridad</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {[
            { label: 'Horno', safe: '< 650°C', warn: '> 600°C' },
            { label: 'Presión', safe: '< 50 PSI', warn: '> 40 PSI' },
            { label: 'Exotérmica', safe: '< 180°C', warn: '> 150°C' },
            { label: 'Cal viva', safe: '5–40 kg', warn: '> 40 kg' },
          ].map((r) => (
            <div key={r.label} className="bg-gray-800/50 rounded p-1.5">
              <span className="text-gray-400 font-medium">{r.label}</span>
              <span className="text-green-400 block">✓ {r.safe}</span>
              <span className="text-yellow-400 block">⚠ {r.warn}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
