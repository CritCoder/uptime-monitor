import { Link } from 'react-router-dom'
import { ServerIcon } from '@heroicons/react/24/outline'

export default function Logo({ className = "", asLink = true, size = "default", compact = false }) {
  const sizeClasses = {
    small: {
      icon: "h-10 w-10",
      iconInner: "h-6 w-6",
      text: "text-lg"
    },
    default: {
      icon: "h-12 w-12",
      iconInner: "h-7 w-7",
      text: "text-2xl"
    }
  }

  const sizes = sizeClasses[size] || sizeClasses.default

  const content = (
    <>
      <div className={`${sizes.icon} rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0`}>
        <ServerIcon className={`${sizes.iconInner} text-white`} />
      </div>
      <span className={`${sizes.text} font-bold text-gray-900 dark:text-gray-100`}>
        {compact ? 'Uptime' : 'Uptime Monitor'}
      </span>
    </>
  )

  if (asLink) {
    return (
      <Link to="/" className={`flex items-center justify-center space-x-2 ${className}`}>
        {content}
      </Link>
    )
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {content}
    </div>
  )
}

