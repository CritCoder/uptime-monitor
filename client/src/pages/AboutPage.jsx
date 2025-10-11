import { Link } from 'react-router-dom'
import { 
  ServerIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  HeartIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

const team = [
  {
    name: 'Alex Thompson',
    role: 'CEO & Co-Founder',
    bio: 'Former SRE at Google, passionate about making monitoring accessible to everyone.',
    avatar: '👨‍💼'
  },
  {
    name: 'Sarah Chen',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Amazon engineer with 10+ years building scalable infrastructure.',
    avatar: '👩‍💻'
  },
  {
    name: 'Michael Rodriguez',
    role: 'VP of Engineering',
    bio: 'Led engineering teams at Datadog and New Relic.',
    avatar: '👨‍🔬'
  },
  {
    name: 'Emily Park',
    role: 'Head of Product',
    bio: 'Product leader who built monitoring solutions at Microsoft Azure.',
    avatar: '👩‍💼'
  },
]

const values = [
  {
    icon: HeartIcon,
    title: 'Customer First',
    description: 'Every decision we make starts with our customers. We build features they need and provide support they deserve.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Innovation',
    description: 'We constantly push the boundaries of what monitoring can do, bringing new features and improvements.'
  },
  {
    icon: LightBulbIcon,
    title: 'Simplicity',
    description: 'Monitoring should be simple. We design intuitive solutions that anyone can use effectively.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Reach',
    description: 'With monitoring nodes across 15+ countries, we provide truly global monitoring coverage.'
  },
]

const milestones = [
  { year: '2020', title: 'Company Founded', description: 'Started with a vision to democratize uptime monitoring' },
  { year: '2021', title: 'First 1,000 Users', description: 'Reached our first major milestone of 1K happy customers' },
  { year: '2022', title: 'Series A Funding', description: 'Raised $10M to expand our global infrastructure' },
  { year: '2023', title: '10,000+ Customers', description: 'Grew to serve over 10,000 businesses worldwide' },
  { year: '2024', title: 'Enterprise Launch', description: 'Launched enterprise features with SLA guarantees' },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between py-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <ServerIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              About Uptime Monitor
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're on a mission to help businesses of all sizes monitor their services with enterprise-grade reliability and simplicity.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Story</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Founded in 2020, Uptime Monitor was born from a simple frustration: monitoring tools were either too complex or too expensive for small and medium businesses. Our founders, having worked at companies like Google, Amazon, and Microsoft, knew there was a better way.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Today, we serve over 10,000 customers worldwide, from indie developers to Fortune 500 companies. Our platform monitors millions of checks every day, helping businesses stay online and their customers happy.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by developers worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Numbers that showcase our growth and commitment to excellence.
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-white p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Customers Worldwide</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">10,000+</dd>
              </div>
              <div className="flex flex-col bg-white p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Checks Per Day</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">50M+</dd>
              </div>
              <div className="flex flex-col bg-white p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Global Locations</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">15+</dd>
              </div>
              <div className="flex flex-col bg-white p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Uptime Guarantee</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">99.9%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Our Values</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What we stand for
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            These core values guide everything we do, from product development to customer support.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <value.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                  {value.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{value.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Our Journey</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Key Milestones
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="relative pl-8 border-l-2 border-primary-200">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary-600" />
                  <div className="text-sm font-semibold text-primary-600 mb-1">{milestone.year}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Our Team</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Meet the people behind Uptime Monitor
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We're a team of experienced engineers, designers, and support specialists dedicated to building the best monitoring platform.
          </p>
        </div>
        <ul className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {team.map((person) => (
            <li key={person.name}>
              <div className="text-6xl mb-4">{person.avatar}</div>
              <h3 className="text-lg font-semibold leading-7 tracking-tight text-gray-900">{person.name}</h3>
              <p className="text-sm leading-6 text-primary-600">{person.role}</p>
              <p className="mt-4 text-sm leading-6 text-gray-600">{person.bio}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Join us on our mission
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Start monitoring your services today and join thousands of satisfied customers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register" className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100">
                Get started
              </Link>
              <Link to="/careers" className="text-sm font-semibold leading-6 text-white">
                View careers <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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

