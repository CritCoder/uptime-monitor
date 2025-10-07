import { Link } from 'react-router-dom'
import { useState } from 'react'
import { 
  CheckIcon, 
  ServerIcon, 
  ChartBarIcon, 
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Features', href: '#features', type: 'scroll' },
  { name: 'Pricing', href: '#pricing', type: 'scroll' },
  { name: 'Documentation', href: '/docs', type: 'link' },
  { name: 'Status', href: '/status/demo-status', type: 'link' },
]

const features = [
  {
    name: 'Multi-Type Monitoring',
    description: 'Monitor HTTP, HTTPS, Ping, Port, SSL certificates, and more with comprehensive checks.',
    icon: ServerIcon,
  },
  {
    name: 'Real-time Alerts',
    description: 'Get instant notifications via email, SMS, Slack, Discord, and webhooks when issues occur.',
    icon: BellIcon,
  },
  {
    name: 'Status Pages',
    description: 'Create beautiful public status pages to keep your users informed about service health.',
    icon: ChartBarIcon,
  },
  {
    name: 'Advanced Analytics',
    description: 'Detailed uptime reports, response time trends, and incident analysis to optimize performance.',
    icon: ChartBarIcon,
  },
  {
    name: 'Team Collaboration',
    description: 'Invite team members, assign roles, and collaborate on monitoring across workspaces.',
    icon: ShieldCheckIcon,
  },
  {
    name: '99.9% Uptime SLA',
    description: 'Enterprise-grade infrastructure with 99.9% uptime guarantee for reliable monitoring.',
    icon: ClockIcon,
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for personal projects',
    features: [
      '5 monitors',
      '5-minute intervals',
      'Email alerts',
      'Basic status page',
      '30-day history'
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$9',
    description: 'Great for small teams',
    features: [
      '20 monitors',
      '1-minute intervals',
      'All alert types',
      'Custom status pages',
      '90-day history',
      'Team collaboration'
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing businesses',
    features: [
      '100 monitors',
      '30-second intervals',
      'Advanced analytics',
      'Unlimited status pages',
      '1-year history',
      'Priority support'
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              item.type === 'scroll' ? (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors cursor-pointer"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
            <Link 
              to="/login" 
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-primary btn-sm"
            >
              Sign up
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <ServerIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      item.type === 'scroll' ? (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault()
                            setMobileMenuOpen(false)
                            setTimeout(() => {
                              document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                            }, 100)
                          }}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                  <div className="py-6 space-y-2">
                    <Link
                      to="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary btn-md w-full"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Professional Uptime Monitoring
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Monitor your websites, APIs, and services with enterprise-grade reliability. 
              Get instant alerts and keep your users informed with beautiful status pages.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Get started for free
              </Link>
              <Link to="/status/demo-status" className="text-sm font-semibold leading-6 text-gray-900">
                View demo status page <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <ArrowTrendingUpIcon className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600 mt-1">Uptime Guarantee</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <GlobeAltIcon className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">15+</p>
              <p className="text-sm text-gray-600 mt-1">Global Locations</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">10k+</p>
              <p className="text-sm text-gray-600 mt-1">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive monitoring solution
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Monitor all your services with powerful features designed for modern applications.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing section */}
      <div id="pricing" className="bg-gray-50 py-24 sm:py-32 pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the right plan for you
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Start with our free plan and scale as you grow. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 pb-4">
            {plans.map((plan, planIdx) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                  plan.popular ? 'ring-2 ring-primary-600 shadow-lg' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                    {plan.popular && (
                      <p className="rounded-full bg-primary-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary-600">
                        Most popular
                      </p>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                  </p>
                  <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 flex-none text-primary-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/register"
                  className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.popular
                      ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-600'
                      : 'ring-1 ring-inset ring-gray-200 text-primary-600 hover:ring-primary-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of developers and businesses monitoring their services with Uptime Monitor.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start monitoring for free
              </Link>
              <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                Login <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#features" className="text-sm leading-6 text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-sm leading-6 text-gray-400 hover:text-white">Pricing</a></li>
                <li><Link to="/status/demo-status" className="text-sm leading-6 text-gray-400 hover:text-white">Status Page</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#docs" className="text-sm leading-6 text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-xs leading-5 text-gray-400">
              &copy; 2024 Uptime Monitor. All rights reserved.
            </p>
            <p className="text-xs leading-5 text-gray-400 mt-4 sm:mt-0">
              Built with ❤️ for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
