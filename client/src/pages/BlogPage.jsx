import { Link } from 'react-router-dom'
import { ServerIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'

const blogPosts = [
  {
    id: 1,
    title: 'Best Practices for Website Monitoring in 2024',
    excerpt: 'Learn the essential strategies for monitoring your website effectively and ensuring maximum uptime for your users.',
    author: 'Sarah Chen',
    date: 'Jan 15, 2024',
    readTime: '5 min read',
    category: 'Best Practices',
    image: '📊'
  },
  {
    id: 2,
    title: 'Understanding HTTP Status Codes and What They Mean',
    excerpt: 'A comprehensive guide to HTTP status codes and how to handle them properly in your monitoring setup.',
    author: 'Michael Rodriguez',
    date: 'Jan 10, 2024',
    readTime: '8 min read',
    category: 'Technical',
    image: '🔍'
  },
  {
    id: 3,
    title: 'How to Set Up Effective Alert Notifications',
    excerpt: 'Stop alert fatigue with these proven strategies for configuring smart, actionable notifications.',
    author: 'Emily Park',
    date: 'Jan 5, 2024',
    readTime: '6 min read',
    category: 'Guides',
    image: '🔔'
  },
  {
    id: 4,
    title: 'The Importance of SSL Certificate Monitoring',
    excerpt: 'Don\'t let expired SSL certificates catch you off guard. Here\'s how to monitor them effectively.',
    author: 'Alex Thompson',
    date: 'Dec 28, 2023',
    readTime: '4 min read',
    category: 'Security',
    image: '🔒'
  },
  {
    id: 5,
    title: 'Building Reliable Status Pages for Your Users',
    excerpt: 'Learn how to create transparent, informative status pages that keep your users informed during incidents.',
    author: 'Sarah Chen',
    date: 'Dec 20, 2023',
    readTime: '7 min read',
    category: 'Product',
    image: '📈'
  },
  {
    id: 6,
    title: 'API Monitoring: A Complete Guide',
    excerpt: 'Everything you need to know about monitoring your APIs for performance, reliability, and security.',
    author: 'Michael Rodriguez',
    date: 'Dec 15, 2023',
    readTime: '10 min read',
    category: 'Technical',
    image: '⚙️'
  },
]

const categories = ['All', 'Best Practices', 'Technical', 'Guides', 'Security', 'Product']

export default function BlogPage() {
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
              Blog
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Insights, guides, and best practices for monitoring your services effectively.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === 'All'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article key={post.id} className="flex flex-col">
              <div className="relative">
                <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-6xl">
                  {post.image}
                </div>
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-600 shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="flex-1 mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary-600 cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm leading-6 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">{post.date}</div>
              </div>
              <div className="mt-6">
                <Link
                  to={`/blog/${post.id}`}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-500"
                >
                  Read more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-16 text-center">
          <button className="btn btn-outline">
            Load more articles
          </button>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Subscribe to our newsletter
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Get the latest articles, guides, and product updates delivered to your inbox.
            </p>
            <form className="mt-10 flex gap-x-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
              />
              <button
                type="submit"
                className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100"
              >
                Subscribe
              </button>
            </form>
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

