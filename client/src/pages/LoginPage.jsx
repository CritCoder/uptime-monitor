import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import LoadingSpinner from '../components/LoadingSpinner'
import Logo from '../components/Logo'
import GoogleSignInButton from '../components/GoogleSignInButton'
import TwitterSignInButton from '../components/TwitterSignInButton'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [attemptedEmail, setAttemptedEmail] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()

  // Pre-fill email if passed from register page
  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email)
    }
  }, [location.state, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    setShowCreateAccount(false)
    try {
      // Sanitize inputs
      const sanitizedData = {
        email: data.email?.trim().toLowerCase() || '',
        password: data.password || ''
      }

      setAttemptedEmail(sanitizedData.email)

      const result = await login(sanitizedData.email, sanitizedData.password)
      if (result.success) {
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        // Check if account doesn't exist
        if (result.error && (
          result.error.includes('No account found') ||
          result.error.includes('not found') ||
          result.error.includes('does not exist')
        )) {
          setShowCreateAccount(true)
        } else {
          toast.error(result.error || 'Login failed. Please check your credentials.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    navigate('/register', { state: { email: attemptedEmail } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Logo className="mb-6" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  validate: {
                    notEmpty: value => value.trim().length > 0 || 'Email cannot be empty or contain only spaces'
                  },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <GoogleSignInButton text="Sign in with Google" />
              <TwitterSignInButton text="Sign in with Twitter" />
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo credentials</span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Email: demo@uptime-monitor.com</p>
              <p>Password: demo1234</p>
            </div>
          </div>
        </form>

        {/* Account doesn't exist prompt */}
        {showCreateAccount && (
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-primary-900 mb-3">
                No account found with email: <span className="font-semibold">{attemptedEmail}</span>
              </p>
              <p className="text-sm text-primary-700 mb-4">
                Would you like to create a new account?
              </p>
              <button
                onClick={handleCreateAccount}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Create Account with {attemptedEmail}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
