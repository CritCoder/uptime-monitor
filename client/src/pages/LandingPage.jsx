import { Link } from 'react-router-dom'
import { useState } from 'react'
import { 
  ServerIcon, 
  ChartBarIcon, 
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon,
  BoltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import PricingSection from '../components/PricingSection'

const navigation = [
  { name: 'Features', href: '#features', type: 'scroll' },
  { name: 'How It Works', href: '#how-it-works', type: 'scroll' },
  { name: 'Integrations', href: '#integrations', type: 'scroll' },
  { name: 'Testimonials', href: '#testimonials', type: 'scroll' },
  { name: 'Pricing', href: '#pricing', type: 'scroll' },
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

const integrations = [
  { name: 'Slack', logo: '💬', description: 'Real-time alerts in your channels' },
  { name: 'Discord', logo: '🎮', description: 'Monitor notifications for your team' },
  { name: 'PagerDuty', logo: '📟', description: 'On-call incident management' },
  { name: 'Webhook', logo: '🔗', description: 'Custom integrations' },
  { name: 'Email', logo: '📧', description: 'Email notifications' },
  { name: 'SMS', logo: '📱', description: 'Text message alerts' },
]

const testimonials = [
  {
    content: 'Uptime Monitor has been a game-changer for our team. The real-time alerts and beautiful status pages have saved us countless hours.',
    author: 'Sarah Johnson',
    role: 'CTO at TechCorp',
    avatar: '👩‍💼'
  },
  {
    content: 'The best monitoring solution we have used. Setup was incredibly easy and the dashboard provides all the insights we need.',
    author: 'Michael Chen',
    role: 'DevOps Lead at StartupXYZ',
    avatar: '👨‍💻'
  },
  {
    content: 'Outstanding support and reliability. Our uptime has improved significantly since switching to this platform.',
    author: 'Emily Rodriguez',
    role: 'Engineering Manager at CloudCo',
    avatar: '👩‍🔬'
  },
]

const useCases = [
  {
    icon: RocketLaunchIcon,
    title: 'Startups',
    description: 'Launch with confidence knowing your services are being monitored 24/7.'
  },
  {
    icon: BoltIcon,
    title: 'SaaS Companies',
    description: 'Keep your customers informed with real-time status updates.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprises',
    description: 'Meet SLA requirements with enterprise-grade monitoring and reporting.'
  },
  {
    icon: CogIcon,
    title: 'Agencies',
    description: 'Monitor all your client websites from a single dashboard.'
  },
]

const howItWorks = [
  {
    step: '1',
    title: 'Add Your Monitors',
    description: 'Enter the URLs of your websites, APIs, or services you want to monitor.',
  },
  {
    step: '2',
    title: 'Configure Alerts',
    description: 'Set up notification channels and alert rules that work for your team.',
  },
  {
    step: '3',
    title: 'Stay Informed',
    description: 'Receive instant notifications and view detailed analytics on your dashboard.',
  },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white">
      {/* 1. Header/Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
            <div className="fixed inset-0 z-50 bg-gray-900/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-[60] w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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

      {/* 2. Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-purple-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
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
            
            {/* Trust badges */}
            <div className="mt-10 flex items-center justify-center gap-x-8 text-sm text-gray-600">
              <div className="flex items-center gap-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stats Section */}
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

      {/* 4. Features Section */}
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

      {/* 5. How It Works Section */}
      <div id="how-it-works" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Simple Setup</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get started in minutes with our simple three-step process.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="flex items-center gap-x-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white text-xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-base text-gray-600">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gray-200" style={{ width: 'calc(100% - 3rem)', marginLeft: '1.5rem' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Use Cases Section */}
      <div id="use-cases" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">For every team</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for teams of all sizes
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From startups to enterprises, our monitoring solution scales with your needs.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
              {useCases.map((useCase) => (
                <div key={useCase.title} className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 mb-4">
                    <useCase.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                  <p className="text-sm text-gray-600">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Integrations Section */}
      <div id="integrations" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Integrations</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Connect with your favorite tools
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Seamlessly integrate with the tools you already use every day.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3">
              {integrations.map((integration) => (
                <div key={integration.name} className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{integration.logo}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{integration.name}</h3>
                  <p className="text-sm text-gray-600 text-center">{integration.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Testimonials Section */}
      <div id="testimonials" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by developers worldwide
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              See what our customers have to say about Uptime Monitor.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col justify-between bg-white p-8 shadow-lg rounded-2xl">
                <div>
                  <div className="flex gap-x-1 text-primary-600 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6">{testimonial.content}</p>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. Security Section */}
      <div id="security" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Security & Compliance</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enterprise-grade security
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Your data is protected with industry-leading security standards.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 mb-4">
                  <LockClosedIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SSL/TLS Encryption</h3>
                <p className="text-sm text-gray-600">All data transmitted is encrypted using industry-standard SSL/TLS protocols.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SOC 2 Compliant</h3>
                <p className="text-sm text-gray-600">We follow strict security standards to protect your data and privacy.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 mb-4">
                  <ServerIcon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">99.9% Uptime</h3>
                <p className="text-sm text-gray-600">Our infrastructure is built for reliability with redundancy across multiple data centers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Pricing Section */}
      <PricingSection />

      {/* 11. FAQ Section */}
      <div id="faq" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">FAQs</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Have a different question? Contact our support team.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-3xl">
            <dl className="space-y-8">
              <div>
                <dt className="text-lg font-semibold text-gray-900 mb-2">How often are checks performed?</dt>
                <dd className="text-gray-600">Our monitoring checks run as frequently as every 30 seconds, depending on your plan. You can configure check intervals from 30 seconds to 24 hours.</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900 mb-2">What types of monitoring are supported?</dt>
                <dd className="text-gray-600">We support HTTP/HTTPS, ping, port, SSL certificate, keyword, and API monitoring. Each type can be configured with custom timeout values and alert rules.</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</dt>
                <dd className="text-gray-600">Yes! There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription at any time with no penalties.</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900 mb-2">Do you offer a free trial?</dt>
                <dd className="text-gray-600">Yes, we offer a 14-day free trial on all paid plans. No credit card required to start your trial.</dd>
              </div>
              <div>
                <dt className="text-lg font-semibold text-gray-900 mb-2">Where are your monitoring servers located?</dt>
                <dd className="text-gray-600">We have monitoring nodes in 15+ locations worldwide, including North America, Europe, Asia, and Australia, ensuring global coverage and accuracy.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* 12. CTA Section */}
      <div className="bg-primary-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of developers and businesses monitoring their services with Uptime Monitor.
              Start your free trial today.
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
            <p className="mt-6 text-sm text-primary-200">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* 13. Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#features" className="text-sm leading-6 text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-sm leading-6 text-gray-400 hover:text-white">Pricing</a></li>
                <li><Link to="/status/demo-status" className="text-sm leading-6 text-gray-400 hover:text-white">Status Page</Link></li>
                <li><a href="#security" className="text-sm leading-6 text-gray-400 hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
              <ul className="mt-6 space-y-4">
                <li><Link to="/docs" className="text-sm leading-6 text-gray-400 hover:text-white">Documentation</Link></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
              <ul className="mt-6 space-y-4">
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Security</a></li>
                <li><a href="#" className="text-sm leading-6 text-gray-400 hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-xs leading-5 text-gray-400">
                &copy; 2024 Uptime Monitor. All rights reserved.
              </p>
              <div className="flex gap-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">
              Built with ❤️ for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
