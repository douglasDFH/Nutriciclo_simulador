import type { EquipmentStatus } from '../simulation/types'
import { clsx } from 'clsx'

interface LEDIndicatorProps {
  status: EquipmentStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<EquipmentStatus, { color: string; label: string }> = {
  inactive: { color: 'bg-gray-500', label: 'Inactivo' },
  active: { color: 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]', label: 'Activo' },
  warning: { color: 'bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.6)]', label: 'Alerta' },
  error: { color: 'bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)] animate-pulse', label: 'Error' },
}

export function LEDIndicator({ status, size = 'md' }: LEDIndicatorProps) {
  const cfg = statusConfig[status]
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <span
      className={clsx('inline-block rounded-full transition-all duration-300', sizeClass, cfg.color)}
      title={cfg.label}
    />
  )
}
