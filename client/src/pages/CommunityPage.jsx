import { Link } from 'react-router-dom'
import { ServerIcon, ChatBubbleLeftRightIcon, UserGroupIcon, CodeBracketIcon } from '@heroicons/react/24/outline'

export default function CommunityPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex w-full items-center justify-between py-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <ServerIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Uptime Monitor</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Community</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join thousands of developers in our growing community. Share knowledge, get help, and connect with fellow users.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Discord Community</h3>
            <p className="text-gray-600 mb-6">Join our Discord server to chat with other users and get real-time help from our community.</p>
            <a href="https://discord.gg/uptimemonitor" className="btn btn-primary btn-sm">Join Discord</a>
          </div>
          
          <div className="rounded-2xl border border-gray-200 p-8">
            <UserGroupIcon className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">GitHub Discussions</h3>
            <p className="text-gray-600 mb-6">Participate in discussions, share feedback, and request features on GitHub.</p>
            <a href="https://github.com/uptimemonitor/discussions" className="btn btn-primary btn-sm">View Discussions</a>
          </div>

          <div className="rounded-2xl border border-gray-200 p-8">
            <CodeBracketIcon className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Developer Forum</h3>
            <p className="text-gray-600 mb-6">Share integrations, ask technical questions, and learn from other developers.</p>
            <Link to="/forum" className="btn btn-primary btn-sm">Visit Forum</Link>
          </div>
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

