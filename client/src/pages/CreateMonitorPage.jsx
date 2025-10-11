import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from 'sonner'
import LoadingSpinner from '../components/LoadingSpinner'
import URLAutocomplete from '../components/URLAutocomplete'
import { useAuth } from '../contexts/AuthContext'
import { ExclamationTriangleIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export default function CreateMonitorPage() {
  const [loading, setLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, logout } = useAuth()
  const isEditMode = !!id
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm()

  // Fetch monitor data if editing
  const { data: monitorData, isLoading: isLoadingMonitor } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => api.get(`/monitors/${id}`).then(res => res.data),
    enabled: isEditMode,
    retry: 1
  })

  // Populate form with existing data
  useEffect(() => {
    if (monitorData?.monitor) {
      reset({
        name: monitorData.monitor.name,
        type: monitorData.monitor.type,
        url: monitorData.monitor.url || '',
        interval: monitorData.monitor.interval,
        port: monitorData.monitor.port || '',
      })
    }
  }, [monitorData, reset])

  // Normalize URL - add protocol if missing
  const normalizeUrl = (url) => {
    if (!url) return url
    
    // Trim whitespace
    url = url.trim()
    
    // If it's already a valid URL with protocol, return as is
    if (/^https?:\/\//i.test(url)) {
      return url
    }
    
    // If it starts with www., add https://
    if (url.startsWith('www.')) {
      return `https://${url}`
    }
    
    // For everything else (like bot9.ai), add https://
    return `https://${url}`
  }

  const onSubmit = async (data) => {
    // Check email verification for new monitors only
    if (!isEditMode && user && !user.isEmailVerified) {
      setShowVerificationModal(true)
      return
    }

    setLoading(true)
    try {
      // Normalize the URL
      const normalizedUrl = normalizeUrl(data.url)
      
      // Convert interval to number
      const payload = {
        ...data,
        url: normalizedUrl,
        interval: parseInt(data.interval),
        ...(data.port && { port: parseInt(data.port) })
      }
      
      if (isEditMode) {
        await api.put(`/monitors/${id}`, payload)
        toast.success('Monitor updated successfully!')
      } else {
        await api.post('/monitors', payload)
        toast.success('Monitor created successfully!')
      }
      navigate('/monitors')
    } catch (error) {
      console.error('Save monitor error:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} monitor`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    try {
      await api.post('/auth/resend-verification')
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleLogoutAndRegister = async () => {
    await logout()
    navigate('/register')
  }

  if (isEditMode && isLoadingMonitor) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Monitor' : 'Create Monitor'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update your monitor configuration' : 'Set up a new monitor to track your service'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="input mt-1"
            placeholder="My Website"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Type</label>
          <select {...register('type')} className="select mt-1">
            <option value="http">HTTP/HTTPS</option>
            <option value="ping">Ping</option>
            <option value="port">Port</option>
            <option value="ssl">SSL Certificate</option>
            <option value="domain">Domain Expiry</option>
            <option value="heartbeat">Heartbeat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">URL/IP</label>
          <Controller
            name="url"
            control={control}
            rules={{
              required: 'URL is required',
              validate: (value) => {
                if (!value) return 'URL is required'
                // Very lenient validation - just check if it's not empty
                const trimmed = value.trim()
                if (trimmed.length < 3) return 'Please enter a valid URL or domain'
                return true
              }
            }}
            render={({ field }) => (
              <URLAutocomplete
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.url?.message}
                placeholder="example.com or https://example.com"
              />
            )}
          />
          <p className="mt-1 text-xs text-gray-500">
            You can enter a domain like "example.com" or full URL like "https://example.com"
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Check Interval</label>
          <select {...register('interval')} className="select mt-1">
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={1800}>30 minutes</option>
            <option value={3600}>1 hour</option>
          </select>
        </div>

        <div className="flex space-x-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg px-8"
          >
            {loading ? <LoadingSpinner size="sm" /> : (isEditMode ? 'Update Monitor' : 'Create Monitor')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/monitors')}
            className="btn btn-secondary btn-lg px-8"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
