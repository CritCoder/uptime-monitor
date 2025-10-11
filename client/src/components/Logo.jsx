import { Link } from 'react-router-dom'
import { ServerIcon } from '@heroicons/react/24/outline'

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
        <ServerIcon className="h-6 w-6 text-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900">Uptime Monitor</span>
    </Link>
  )
}

