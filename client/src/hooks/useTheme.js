import { useState, useEffect } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Check if user prefers dark mode
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // For now, always use light theme as requested
    setTheme('light')
  }, [])

  return { theme, setTheme }
}

