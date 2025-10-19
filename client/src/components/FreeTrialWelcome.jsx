import { useState } from 'react'
import {
  CheckCircleIcon,
  GiftIcon,
  ClockIcon,
  CreditCardIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

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
    popular: false,
  },
]

export default function FreeTrialWelcome({ onAcknowledge }) {
  const [showPlans, setShowPlans] = useState(false)

  const handleAcknowledge = () => {
    onAcknowledge()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 rounded-2xl p-8 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!showPlans ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                    <GiftIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <h2 className="text-3xl font-bold text-primary-900">
                    Welcome to Your Free Trial!
                  </h2>
                  <SparklesIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="text-primary-700 text-lg leading-relaxed max-w-2xl mx-auto">
                  You're now starting your 14-day free trial with full access to all monitoring features.
                  No credit card required to get started!
                </p>
              </div>

              {/* Features Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Unlimited Monitors</p>
                    <p className="text-xs text-primary-600">Monitor as many services as you need</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Real-time Alerts</p>
                    <p className="text-xs text-primary-600">Email, SMS, Slack & Discord notifications</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Status Pages</p>
                    <p className="text-xs text-primary-600">Public status pages for your users</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary-900">Advanced Analytics</p>
                    <p className="text-xs text-primary-600">Detailed uptime reports and insights</p>
                  </div>
                </div>
              </div>

              {/* Trial Info */}
              <div className="mt-6 p-4 bg-white/70 rounded-lg border border-primary-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-primary-900">14-Day Free Trial</p>
                      <p className="text-xs text-primary-600">No credit card required to start</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-900">$0</p>
                    <p className="text-xs text-primary-600">for 14 days</p>
                  </div>
                </div>
              </div>

              {/* Post-trial info */}
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CreditCardIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">After your trial</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Choose from our flexible plans starting at $9/month. You can upgrade, downgrade, or cancel anytime.
                      No hidden fees, no long-term contracts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleAcknowledge}
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg"
                >
                  I Acknowledge & Start My Free Trial
                </button>
                <button
                  onClick={() => setShowPlans(true)}
                  className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-300 font-semibold rounded-lg shadow-lg hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg"
                >
                  Learn More About Plans
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Back button */}
              <button
                onClick={() => setShowPlans(false)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6 group"
              >
                <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to Welcome</span>
              </button>

              {/* Plans Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary-900 mb-2">
                  Choose Your Plan
                </h2>
                <p className="text-primary-700 text-lg">
                  All plans include a 14-day free trial. No credit card required.
                </p>
              </div>

              {/* Pricing cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
                    className={`relative flex flex-col rounded-2xl bg-white p-6 shadow-lg ring-1 ${
                      plan.popular
                        ? 'ring-2 ring-primary-500 shadow-primary-500/20'
                        : 'ring-gray-200/50'
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Card content */}
                    <div className="flex-1">
                      {/* Plan name */}
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 text-sm text-gray-600">
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="mt-4 flex items-baseline gap-x-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          /month
                        </span>
                      </div>

                      {/* Features list */}
                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100">
                                <CheckIcon className="h-3 w-3 text-primary-600" />
                              </div>
                            </div>
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom info */}
              <div className="p-4 bg-white/70 rounded-lg border border-primary-200 mb-6">
                <p className="text-sm text-center text-primary-700">
                  Your 14-day free trial starts now with full access to all features.
                  After the trial, choose the plan that works best for you.
                </p>
              </div>

              {/* Action button */}
              <div className="flex justify-center">
                <button
                  onClick={handleAcknowledge}
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg"
                >
                  Start My Free Trial
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}