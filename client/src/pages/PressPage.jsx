import { Link } from 'react-router-dom'
import { ServerIcon, DocumentTextIcon, PhotoIcon, NewspaperIcon } from '@heroicons/react/24/outline'

const pressReleases = [
  {
    date: 'January 15, 2024',
    title: 'Uptime Monitor Reaches 10,000 Customers Milestone',
    excerpt: 'Company celebrates major growth milestone as businesses worldwide adopt its monitoring platform.'
  },
  {
    date: 'December 1, 2023',
    title: 'Uptime Monitor Launches Enterprise Features',
    excerpt: 'New enterprise-grade features include advanced SLA reporting and dedicated support.'
  },
  {
    date: 'October 20, 2023',
    title: 'Uptime Monitor Raises $10M Series A',
    excerpt: 'Funding will be used to expand global infrastructure and grow the team.'
  },
]

const mediaKit = [
  { name: 'Company Logo (PNG)', size: '256KB', icon: PhotoIcon },
  { name: 'Company Logo (SVG)', size: '12KB', icon: PhotoIcon },
  { name: 'Brand Guidelines', size: '2.1MB', icon: DocumentTextIcon },
  { name: 'Press Kit (ZIP)', size: '5.4MB', icon: DocumentTextIcon },
]

const coverage = [
  { outlet: 'TechCrunch', title: 'Uptime Monitor Simplifies Website Monitoring', date: 'Jan 2024' },
  { outlet: 'VentureBeat', title: 'The Future of Uptime Monitoring', date: 'Dec 2023' },
  { outlet: 'Forbes', title: 'Startup to Watch: Uptime Monitor', date: 'Nov 2023' },
]

export default function PressPage() {
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
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Press & Media</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Latest news, press releases, and media resources about Uptime Monitor.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">Press Releases</h2>
        <div className="space-y-8">
          {pressReleases.map((release, index) => (
            <div key={index} className="border-b border-gray-200 pb-8">
              <div className="flex items-center gap-x-3 mb-2">
                <NewspaperIcon className="h-5 w-5 text-primary-600" />
                <time className="text-sm text-gray-500">{release.date}</time>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{release.title}</h3>
              <p className="text-gray-600 mb-4">{release.excerpt}</p>
              <Link to="#" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
                Read full release →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">Media Coverage</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {coverage.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-primary-600 font-semibold mb-2">{item.outlet}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Media Kit</h2>
        <p className="text-lg text-gray-600 mb-12">Download our brand assets and company information.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mediaKit.map((item, index) => (
            <div key={index} className="flex items-center gap-x-4 rounded-lg border border-gray-200 p-4 hover:border-primary-500 cursor-pointer">
              <item.icon className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Press Inquiries</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              For press inquiries, interviews, or media requests, please contact our PR team.
            </p>
            <div className="mt-10">
              <a href="mailto:press@uptimemonitor.com" className="btn btn-white">
                Contact Press Team
              </a>
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

