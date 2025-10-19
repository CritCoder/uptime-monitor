import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-gray-200 dark:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      <span
        className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow transition-transform ${
          isDark ? 'translate-x-8' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        ) : (
          <SunIcon className="h-4 w-4 text-yellow-500" />
        )}
      </span>
    </button>
  )
}
