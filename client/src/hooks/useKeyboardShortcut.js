import { useEffect } from 'react'

export function useKeyboardShortcut(key, callback, options = {}) {
  const { ctrl = false, meta = false, shift = false, alt = false } = options

  useEffect(() => {
    const handleKeyDown = (event) => {
      const ctrlOrMeta = ctrl || meta
      const matchesModifiers =
        (!ctrlOrMeta || (event.ctrlKey || event.metaKey)) &&
        (!shift || event.shiftKey) &&
        (!alt || event.altKey)

      if (matchesModifiers && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ctrl, meta, shift, alt])
}
