import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useAuth } from '../contexts/AuthContext'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error', 'required'
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const required = searchParams.get('required') === 'true'

  useEffect(() => {
    // If redirected here because verification is required
    if (required) {
      setStatus('required')
      setMessage('You must verify your email address before accessing your account. Please check your inbox (and spam folder) for the verification link.')
      return
    }

    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link. No token provided.')
        return
      }

      try {
        const response = await api.post('/auth/verify-email', { token })
        setStatus('success')
        setMessage(response.data.message || 'Email verified successfully!')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.error || 'Email verification failed. The link may be invalid or expired.')
      }
    }

    verifyEmail()
  }, [searchParams, navigate, required])

  const handleResendEmail = async () => {
    setResending(true)
    try {
      const email = user?.email
      if (!email) {
        toast.error('Please log in to resend verification email')
        navigate('/login')
        return
      }

      const response = await api.post('/auth/resend-verification', { email })
      if (response.data.success) {
        toast.success('Verification email sent! Please check your inbox and spam folder.')
      } else {
        toast.error(response.data.error || 'Failed to resend email')
      }
    } catch (error) {
      console.error('Resend email error:', error)
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.success('If your account exists, you will receive a verification email. Please check your spam folder if you don\'t see it.')
      }
    } finally {
      setResending(false)
    }
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </>
        ) : status === 'required' ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {resending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage

