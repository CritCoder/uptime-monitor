import { CheckIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

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

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[800px] w-[800px] rounded-full bg-gradient-to-br from-primary-100/40 via-purple-100/30 to-blue-100/20 blur-3xl" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for you
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Start with our free plan and scale as you grow. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular
                  ? 'ring-2 ring-primary-500 shadow-primary-500/20'
                  : 'ring-gray-200/50 hover:ring-gray-300'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card content */}
              <div className="flex-1">
                {/* Plan name */}
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                
                {/* Description */}
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-600">
                    /month
                  </span>
                </div>

                {/* Features list */}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                          <CheckIcon className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <span className="text-sm leading-6 text-gray-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA button */}
              <div className="mt-8">
                <Link
                  to="/register"
                  className={`block w-full rounded-xl px-4 py-3.5 text-center text-sm font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 focus-visible:outline-primary-600'
                      : 'bg-white text-primary-600 ring-1 ring-inset ring-primary-200 hover:bg-primary-50 hover:ring-primary-300'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}

