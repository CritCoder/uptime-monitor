export function Empty({ children, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {children}
    </div>
  )
}

export function EmptyHeader({ children }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 mb-6">
      {children}
    </div>
  )
}

export function EmptyMedia({ children, variant = 'icon' }) {
  return (
    <div className={`${variant === 'icon' ? 'w-12 h-12 text-gray-400' : ''} mb-4`}>
      {children}
    </div>
  )
}

export function EmptyTitle({ children }) {
  return (
    <h3 className="text-xl font-semibold text-gray-900">
      {children}
    </h3>
  )
}

export function EmptyDescription({ children }) {
  return (
    <p className="px-6 pt-2 pb-4 text-center text-gray-500">
      {children}
    </p>
  )
}

export function EmptyContent({ children }) {
  return (
    <div className="mt-2">
      {children}
    </div>
  )
}


