import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { PlusIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function AlertsPage() {
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts', page],
    queryFn: () => api.get(`/alerts/contacts?page=${page}`).then(res => res.data),
    refetchInterval: 60000,
    retry: 1,
    onError: (error) => {
      console.error('Alerts API error:', error);
    }
  })

  const createContactMutation = useMutation({
    mutationFn: (contactData) => api.post('/alerts/contacts', contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert contact created successfully!')
      setShowModal(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create alert contact')
    }
  })

  const onSubmit = (data) => {
    createContactMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading alerts</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alert Contacts</h1>
            <p className="text-gray-600">Manage notification channels</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-md"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Contacts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.contacts?.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No alert contacts yet. Click "Add Contact" to create one.
              </div>
            ) : (
              data?.contacts?.map((contact) => (
                <div key={contact.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BellIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-500">{contact.type} • {contact.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm ${contact.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Add Alert Contact</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="input mt-1"
                  placeholder="My Email Alert"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select {...register('type')} className="input mt-1">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="webhook">Webhook</option>
                  <option value="telegram">Telegram</option>
                  <option value="pagerduty">PagerDuty</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  {...register('value', { required: 'Value is required' })}
                  className="input mt-1"
                  placeholder="email@example.com"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createContactMutation.isPending}
                  className="btn btn-primary btn-md"
                >
                  {createContactMutation.isPending ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
