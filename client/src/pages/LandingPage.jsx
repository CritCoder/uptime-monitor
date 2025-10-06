import { Link } from 'react-router-dom'
import { 
  CheckIcon, 
  ServerIcon, 
  ChartBarIcon, 
  BellIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

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
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
            </a>
          </div>
          <div className="flex lg:flex-1 lg:justify-end">
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
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

      {/* Features section */}
      <div className="py-24 sm:py-32">
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
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the right plan for you
            </p>
          </div>
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan, planIdx) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${
                  plan.popular ? 'ring-2 ring-primary-600 border-2 border-primary-600 shadow-lg' : ''
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

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-xs leading-5 text-gray-500">
              &copy; 2024 Uptime Monitor. All rights reserved.
            </p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              Built with ❤️ for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
