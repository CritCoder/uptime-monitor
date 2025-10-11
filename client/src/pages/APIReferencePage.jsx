import { Link } from 'react-router-dom'
import { ServerIcon, CodeBracketIcon, KeyIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const endpoints = [
  { method: 'GET', path: '/api/v1/monitors', description: 'List all monitors' },
  { method: 'POST', path: '/api/v1/monitors', description: 'Create a new monitor' },
  { method: 'GET', path: '/api/v1/monitors/:id', description: 'Get monitor details' },
  { method: 'PUT', path: '/api/v1/monitors/:id', description: 'Update a monitor' },
  { method: 'DELETE', path: '/api/v1/monitors/:id', description: 'Delete a monitor' },
  { method: 'GET', path: '/api/v1/incidents', description: 'List all incidents' },
  { method: 'GET', path: '/api/v1/status-pages', description: 'List status pages' },
]

export default function APIReferencePage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex w-full items-center justify-between py-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">API Reference</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Build powerful integrations with our RESTful API. Manage monitors, incidents, and more programmatically.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <a href="#authentication" className="block px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md">Authentication</a>
              <a href="#monitors" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Monitors</a>
              <a href="#incidents" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Incidents</a>
              <a href="#status-pages" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Status Pages</a>
              <a href="#alerts" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">Alerts</a>
            </nav>
          </div>

          <div className="lg:col-span-3 space-y-12">
            <section id="authentication">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-4">All API requests require authentication using an API key. Include your API key in the Authorization header.</p>
              <div className="bg-gray-900 rounded-lg p-4">
                <code className="text-sm text-green-400">
                  curl -H "Authorization: Bearer YOUR_API_KEY" https://api.uptimemonitor.com/v1/monitors
                </code>
              </div>
            </section>

            <section id="monitors">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Monitors</h2>
              <div className="space-y-4">
                {endpoints.filter(e => e.path.includes('monitors')).map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <p className="text-sm text-gray-600">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Need help with the API?</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Check out our comprehensive documentation or contact our support team.
            </p>
            <div className="mt-10">
              <Link to="/docs" className="btn btn-white">View Full Documentation</Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-center text-sm leading-5 text-gray-400">
            &copy; 2024 Uptime Monitor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

