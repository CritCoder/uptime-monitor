import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { api } from '../lib/api'
import { toast } from 'sonner'
import LoadingSpinner from '../components/LoadingSpinner'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      timezone: user?.timezone || 'UTC'
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.put('/auth/profile', data)
      updateUser(data)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input mt-1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input mt-1 bg-gray-50 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
              <select {...register('timezone')} className="select mt-1">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Account</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user?.plan || 'Free'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Verified</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user?.isEmailVerified ? 'Yes' : 'No'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
