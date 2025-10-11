import { Link } from 'react-router-dom'
import { ServerIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const certifications = [
  { name: 'SOC 2 Type II', description: 'Annual security audits by independent third parties', status: 'Certified' },
  { name: 'GDPR', description: 'Full compliance with EU data protection regulations', status: 'Compliant' },
  { name: 'CCPA', description: 'California Consumer Privacy Act compliance', status: 'Compliant' },
  { name: 'HIPAA', description: 'Healthcare data protection standards (Enterprise plan)', status: 'Available' },
]

export default function CompliancePage() {
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
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Compliance</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We maintain the highest standards of compliance to protect your data and meet regulatory requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">Certifications & Standards</h2>
        <div className="space-y-6">
          {certifications.map((cert) => (
            <div key={cert.name} className="flex items-start gap-x-4 rounded-lg border border-gray-200 p-6">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {cert.status}
                  </span>
                </div>
                <p className="text-gray-600">{cert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Need Compliance Documentation?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Enterprise customers can request compliance reports and documentation.
            </p>
            <a href="mailto:compliance@uptimemonitor.com" className="btn btn-primary">
              Request Documentation
            </a>
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

