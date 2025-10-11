import { Link } from 'react-router-dom'
import { ServerIcon, ShieldCheckIcon, LockClosedIcon, KeyIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const securityFeatures = [
  {
    icon: LockClosedIcon,
    title: 'End-to-End Encryption',
    description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'SOC 2 Type II Certified',
    description: 'We undergo regular third-party security audits and maintain SOC 2 Type II compliance.'
  },
  {
    icon: KeyIcon,
    title: 'Secure Authentication',
    description: 'Multi-factor authentication, password hashing with bcrypt, and secure session management.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Infrastructure Security',
    description: 'Hosted on AWS with automated security patches, DDoS protection, and 24/7 monitoring.'
  },
]

export default function SecurityPage() {
  return (
    <div className="bg-white">
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
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Security</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Your data security is our top priority. Learn about our comprehensive security measures and compliance standards.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Enterprise-Grade Security</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We employ industry-leading security practices to protect your data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {securityFeatures.map((feature) => (
            <div key={feature.title} className="flex gap-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">Security Practices</h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Protection</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• AES-256 encryption at rest</li>
                <li>• TLS 1.3 encryption in transit</li>
                <li>• Regular security audits</li>
                <li>• Automated backup systems</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Control</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Multi-factor authentication</li>
                <li>• Role-based access control</li>
                <li>• Audit logging</li>
                <li>• Session management</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Infrastructure</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• AWS hosting with redundancy</li>
                <li>• DDoS protection</li>
                <li>• Automated patching</li>
                <li>• 24/7 monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="rounded-2xl bg-gray-900 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Responsible Disclosure</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            If you discover a security vulnerability, please report it to us at security@uptimemonitor.com. We take all reports seriously and will respond within 24 hours.
          </p>
          <a href="mailto:security@uptimemonitor.com" className="btn btn-white">
            Report Security Issue
          </a>
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

