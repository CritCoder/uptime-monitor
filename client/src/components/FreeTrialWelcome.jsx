import { 
  CheckCircleIcon, 
  GiftIcon,
  ClockIcon,
  CreditCardIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function FreeTrialWelcome({ onAcknowledge }) {
  const handleAcknowledge = () => {
    onAcknowledge()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 rounded-2xl p-8 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">

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
            onClick={handleAcknowledge}
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-300 font-semibold rounded-lg shadow-lg hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg"
          >
            Learn More About Plans
          </button>
        </div>
      </div>
    </div>
  )
}