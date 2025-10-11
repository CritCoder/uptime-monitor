import { Link } from 'react-router-dom'
import { ServerIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon, BookOpenIcon, VideoCameraIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

const categories = [
  { name: 'Getting Started', icon: BookOpenIcon, articleCount: 12, description: 'Learn the basics of uptime monitoring' },
  { name: 'Monitors', icon: ServerIcon, articleCount: 18, description: 'Create and manage your monitors' },
  { name: 'Alerts & Notifications', icon: ChatBubbleLeftRightIcon, articleCount: 15, description: 'Configure alert channels' },
  { name: 'Status Pages', icon: QuestionMarkCircleIcon, articleCount: 10, description: 'Build public status pages' },
  { name: 'API & Integrations', icon: VideoCameraIcon, articleCount: 14, description: 'Connect with other tools' },
  { name: 'Billing & Plans', icon: QuestionMarkCircleIcon, articleCount: 8, description: 'Manage your subscription' },
]

const popularArticles = [
  'How to create your first monitor',
  'Setting up Slack notifications',
  'Understanding HTTP status codes',
  'Creating a custom status page',
  'Monitor SSL certificates',
  'API authentication guide'
]

export default function HelpCenterPage() {
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
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Help Center</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Find answers, guides, and tutorials to help you get the most out of Uptime Monitor.
            </p>
            <div className="mt-10 relative">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full rounded-lg border-gray-300 px-4 py-3 pr-12 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <MagnifyingGlassIcon className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/help/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative rounded-lg border border-gray-200 p-6 hover:border-primary-500 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-x-3 mb-3">
                  <category.icon className="h-6 w-6 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                    {category.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <p className="text-xs text-gray-500">{category.articleCount} articles</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Articles</h2>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                to="#"
                className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 hover:text-primary-600">{article}</span>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Still need help?</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Our support team is here to help. Contact us and we'll get back to you within 24 hours.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="mailto:support@uptimemonitor.com" className="btn btn-white">
                Contact Support
              </a>
              <Link to="/docs" className="text-sm font-semibold text-white">
                View Documentation <span aria-hidden="true">→</span>
              </Link>
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

