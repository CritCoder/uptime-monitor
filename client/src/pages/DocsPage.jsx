import { Link } from 'react-router-dom'
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const sections = [
  {
    title: 'Getting Started',
    icon: RocketLaunchIcon,
    items: [
      { name: 'Quick Start Guide', href: '#quick-start' },
      { name: 'Creating Your First Monitor', href: '#first-monitor' },
      { name: 'Understanding Monitor Types', href: '#monitor-types' },
      { name: 'Setting Up Alerts', href: '#setup-alerts' },
    ]
  },
  {
    title: 'Monitor Types',
    icon: CodeBracketIcon,
    items: [
      { name: 'HTTP/HTTPS Monitoring', href: '#http-monitoring' },
      { name: 'Ping Monitoring', href: '#ping-monitoring' },
      { name: 'Port Monitoring', href: '#port-monitoring' },
      { name: 'SSL Certificate Monitoring', href: '#ssl-monitoring' },
      { name: 'Keyword Monitoring', href: '#keyword-monitoring' },
      { name: 'Heartbeat Monitoring', href: '#heartbeat-monitoring' },
    ]
  },
  {
    title: 'Alerts & Notifications',
    icon: BellIcon,
    items: [
      { name: 'Email Alerts', href: '#email-alerts' },
      { name: 'SMS Notifications', href: '#sms-notifications' },
      { name: 'Slack Integration', href: '#slack-integration' },
      { name: 'Discord Integration', href: '#discord-integration' },
      { name: 'Webhook Integration', href: '#webhook-integration' },
    ]
  },
  {
    title: 'Status Pages',
    icon: ChartBarIcon,
    items: [
      { name: 'Creating a Status Page', href: '#create-status-page' },
      { name: 'Customizing Your Status Page', href: '#customize-status-page' },
      { name: 'Custom Domains', href: '#custom-domains' },
      { name: 'Subscriber Management', href: '#subscriber-management' },
    ]
  },
  {
    title: 'API Reference',
    icon: CodeBracketIcon,
    items: [
      { name: 'Authentication', href: '#api-auth' },
      { name: 'Monitors API', href: '#monitors-api' },
      { name: 'Incidents API', href: '#incidents-api' },
      { name: 'Status Pages API', href: '#status-pages-api' },
    ]
  },
  {
    title: 'Security & Privacy',
    icon: ShieldCheckIcon,
    items: [
      { name: 'Data Security', href: '#data-security' },
      { name: 'Privacy Policy', href: '#privacy-policy' },
      { name: 'GDPR Compliance', href: '#gdpr-compliance' },
      { name: 'SOC 2 Compliance', href: '#soc2-compliance' },
    ]
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Documentation</span>
            </Link>
            <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Uptime Monitor Documentation
          </h1>
          <p className="mt-4 text-xl text-primary-100">
            Everything you need to know to monitor your services effectively
          </p>
          <div className="mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="block w-full max-w-lg rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <section.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Section */}
      <div id="quick-start" className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
          
          <div className="prose prose-primary max-w-none">
            <h3>1. Create Your Account</h3>
            <p>
              Sign up for a free account to get started. No credit card required for the free plan.
            </p>

            <h3>2. Add Your First Monitor</h3>
            <p>
              Navigate to the Monitors page and click "Add Monitor". Choose your monitor type:
            </p>
            <ul>
              <li><strong>HTTP/HTTPS:</strong> Monitor website availability and response time</li>
              <li><strong>Ping:</strong> Check if a server is reachable</li>
              <li><strong>Port:</strong> Monitor specific ports on your servers</li>
              <li><strong>SSL:</strong> Track SSL certificate expiration</li>
            </ul>

            <h3>3. Configure Alert Contacts</h3>
            <p>
              Go to Alerts → Add Contact to set up email, SMS, or webhook notifications.
            </p>

            <h3>4. Create a Status Page</h3>
            <p>
              Build a public status page to keep your users informed about your service health.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-gray-400 mb-4">
              Can't find what you're looking for? Contact our support team.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

