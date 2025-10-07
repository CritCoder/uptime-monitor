import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CreateMonitorPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

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

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Convert interval to number
      const payload = {
        ...data,
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

  if (isEditMode && isLoadingMonitor) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEditMode ? 'Edit Monitor' : 'Create Monitor'}
      </h1>
      
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
          <label className="block text-sm font-medium text-gray-700">URL/IP</label>
          <input
            {...register('url')}
            className="input mt-1"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check Interval</label>
          <select {...register('interval')} className="select mt-1">
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
            {loading ? <LoadingSpinner size="sm" /> : (isEditMode ? 'Update Monitor' : 'Create Monitor')}
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
