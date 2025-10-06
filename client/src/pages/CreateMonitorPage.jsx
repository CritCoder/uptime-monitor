import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CreateMonitorPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Convert interval to number
      const payload = {
        ...data,
        interval: parseInt(data.interval),
        ...(data.port && { port: parseInt(data.port) })
      }
      await api.post('/monitors', payload)
      toast.success('Monitor created successfully!')
      navigate('/monitors')
    } catch (error) {
      console.error('Create monitor error:', error);
      toast.error(error.response?.data?.error || 'Failed to create monitor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Monitor</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
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
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select {...register('type')} className="input mt-1">
            <option value="http">HTTP/HTTPS</option>
            <option value="ping">Ping</option>
            <option value="port">Port</option>
            <option value="ssl">SSL Certificate</option>
            <option value="domain">Domain Expiry</option>
            <option value="heartbeat">Heartbeat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">URL/IP</label>
          <input
            {...register('url')}
            className="input mt-1"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check Interval</label>
          <select {...register('interval')} className="input mt-1">
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={1800}>30 minutes</option>
            <option value={3600}>1 hour</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Create Monitor'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/monitors')}
            className="btn btn-secondary btn-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
