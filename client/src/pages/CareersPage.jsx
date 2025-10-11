import { Link } from 'react-router-dom'
import { 
  ServerIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const openPositions = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$140k - $180k',
    description: 'Build and scale our monitoring platform used by thousands of customers worldwide.'
  },
  {
    id: 2,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: 'Manage and optimize our global monitoring infrastructure across 15+ regions.'
  },
  {
    id: 3,
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$110k - $150k',
    description: 'Design intuitive experiences for our monitoring dashboard and status pages.'
  },
  {
    id: 4,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$80k - $110k',
    description: 'Help our enterprise customers get the most out of Uptime Monitor.'
  },
  {
    id: 5,
    title: 'Technical Writer',
    department: 'Product',
    location: 'Remote (Global)',
    type: 'Full-time',
    salary: '$70k - $100k',
    description: 'Create comprehensive documentation and guides for our users.'
  },
  {
    id: 6,
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$130k - $170k',
    description: 'Build scalable backend systems for real-time monitoring and alerting.'
  },
]

const benefits = [
  {
    icon: CurrencyDollarIcon,
    title: 'Competitive Salary',
    description: 'Market-leading compensation with equity options'
  },
  {
    icon: HeartIcon,
    title: 'Health & Wellness',
    description: 'Comprehensive health, dental, and vision insurance'
  },
  {
    icon: GlobeAltIcon,
    title: 'Remote First',
    description: 'Work from anywhere with flexible hours'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Growth Opportunities',
    description: 'Professional development and learning budget'
  },
  {
    icon: AcademicCapIcon,
    title: 'Learning Budget',
    description: '$2,000 annual budget for courses and conferences'
  },
  {
    icon: ClockIcon,
    title: 'Unlimited PTO',
    description: 'Take the time you need to recharge'
  },
]

const departments = ['All', 'Engineering', 'Design', 'Product', 'Customer Success', 'Marketing']

export default function CareersPage() {
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

      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Join Our Team
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Help us build the best monitoring platform in the world. We're looking for talented, passionate people to join our growing team.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="#positions" className="btn btn-primary">
                View open positions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Why Uptime Monitor</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Build the future of monitoring
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We're a remote-first company that values work-life balance, continuous learning, and making an impact.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 mb-4">
                  <benefit.icon className="h-8 w-8 text-primary-600" />
                </div>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {benefit.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {benefit.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Open Positions */}
      <div id="positions" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Open Positions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Find your next role
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're hiring across multiple departments. Browse our open positions below.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dept === 'All'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {openPositions.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-600">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-x-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-x-2">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button className="btn btn-primary whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Culture */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Our Culture</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Life at Uptime Monitor
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We believe in building a diverse, inclusive workplace where everyone can do their best work.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Remote First</h3>
            <p className="text-gray-600">
              Work from anywhere in the world. We have team members across 10+ countries and fully embrace async communication.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Continuous Learning</h3>
            <p className="text-gray-600">
              We invest in your growth with learning budgets, conference tickets, and regular knowledge-sharing sessions.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Work-Life Balance</h3>
            <p className="text-gray-600">
              Unlimited PTO, flexible hours, and no "always on" culture. We value your time and well-being.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Don't see the right role?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              We're always looking for talented people. Send us your resume and let us know what you're interested in.
            </p>
            <div className="mt-10">
              <a href="mailto:careers@uptimemonitor.com" className="btn btn-white">
                Email us your resume
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-center text-sm leading-5 text-gray-400">
            &copy; 2024 Uptime Monitor. All rights reserved. • Equal Opportunity Employer
          </p>
        </div>
      </footer>
    </div>
  )
}

