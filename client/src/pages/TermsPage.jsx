import { Link } from 'react-router-dom'
import { ServerIcon } from '@heroicons/react/24/outline'

export default function TermsPage() {
  return (
    <div className="bg-white">
      <header className="bg-white border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex w-full items-center justify-between py-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-12">Last updated: January 1, 2024</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-7">
              By accessing and using Uptime Monitor, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-7">
              Uptime Monitor provides website and service monitoring, alerting, and status page services. We monitor your specified URLs and endpoints at configured intervals and alert you when issues are detected.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-600 leading-7 mb-4">
              To use our service, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Not share your account with others</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 leading-7 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the service for any illegal purposes</li>
              <li>Monitor websites without proper authorization</li>
              <li>Attempt to circumvent any limitations or restrictions</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use the service to send spam or malicious content</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Billing and Payment</h2>
            <p className="text-gray-600 leading-7">
              Paid subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees. Refunds are provided at our discretion and typically only for service outages or billing errors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Service Level Agreement</h2>
            <p className="text-gray-600 leading-7">
              We strive to maintain 99.9% uptime for our monitoring infrastructure. Service credits may be available for extended outages as detailed in our SLA documentation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-7">
              Uptime Monitor is provided "as is" without warranty of any kind. We are not liable for any damages arising from the use or inability to use our service, including but not limited to website downtime, data loss, or business interruption.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600 leading-7">
              We may terminate or suspend your account at any time for violations of these terms. You may cancel your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 leading-7">
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-600 leading-7">
              For questions about these Terms of Service, contact us at:
              <br />
              Email: legal@uptimemonitor.com
              <br />
              Address: 123 Tech Street, San Francisco, CA 94105
            </p>
          </section>
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

