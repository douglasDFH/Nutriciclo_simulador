import { Moon, Sun } from 'lucide-react'
import { useSimulatorStore } from '../store/useSimulatorStore'

export function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useSimulatorStore()

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
      title={darkMode ? 'Modo claro' : 'Modo oscuro'}
    >
      {darkMode ? (
        <Sun className="w-4 h-4 text-yellow-400" />
      ) : (
        <Moon className="w-4 h-4 text-blue-400" />
      )}
    </button>
  )
}
