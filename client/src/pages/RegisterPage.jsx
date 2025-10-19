import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import LoadingSpinner from '../components/LoadingSpinner'
import Logo from '../components/Logo'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [attemptedEmail, setAttemptedEmail] = useState('')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()

  const password = watch('password')

  // Pre-fill email if passed from login page
  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email)
    }
  }, [location.state, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    setShowLoginPrompt(false)
    try {
      // Automatically detect user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

      // Sanitize inputs
      const sanitizedData = {
        name: data.name?.trim() || '',
        email: data.email?.trim().toLowerCase() || '',
        password: data.password || '', // Don't trim passwords - spaces might be intentional
        timezone
      }

      // Validate that fields are not empty after trimming
      if (!sanitizedData.name) {
        toast.error('Name cannot be empty or contain only spaces')
        setLoading(false)
        return
      }
      if (!sanitizedData.email) {
        toast.error('Email cannot be empty or contain only spaces')
        setLoading(false)
        return
      }

      setAttemptedEmail(sanitizedData.email)

      const result = await registerUser(sanitizedData)
      console.log('Registration result:', result)
      if (result.success) {
        toast.success(result.message || 'Registration successful! Welcome to your free trial!')
        console.log('Navigating to dashboard...')
        navigate('/dashboard')
      } else {
        // Check if account already exists
        if (result.error && (
          result.error.includes('already exists') ||
          result.error.includes('User already exists')
        )) {
          setShowLoginPrompt(true)
        } else {
          // Show detailed error message
          const errorMsg = result.error || 'Registration failed. Please try again.'
          if (typeof result.error === 'object' && result.error.details) {
            toast.error(result.error.details.map(d => d.message).join(', '))
          } else {
            toast.error(errorMsg)
          }
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login', { state: { email: attemptedEmail } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Logo className="mb-6" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <GoogleSignInButton text="Sign up with Google" />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                {...register('name', {
                  required: 'Name is required',
                  validate: {
                    notEmpty: value => value.trim().length > 0 || 'Name cannot be empty or contain only spaces',
                    noMultipleSpaces: value => !/\s{2,}/.test(value.trim()) || 'Name cannot contain multiple consecutive spaces'
                  }
                })}
                type="text"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
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
                'Create account'
              )}
            </button>
          </div>
        </form>

        {/* Account already exists prompt */}
        {showLoginPrompt && (
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-primary-900 mb-3">
                An account already exists with email: <span className="font-semibold">{attemptedEmail}</span>
              </p>
              <p className="text-sm text-primary-700 mb-4">
                Would you like to log in instead?
              </p>
              <button
                onClick={handleGoToLogin}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Log In with {attemptedEmail}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
