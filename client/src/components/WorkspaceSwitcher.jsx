import { useState, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Dialog, Transition } from '@headlessui/react'
import { 
  PlusIcon, 
  CheckIcon,
  ChevronUpDownIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { toast } from '@/lib/toast'

export default function WorkspaceSwitcher({ currentWorkspaceId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const queryClient = useQueryClient()

  const { data: workspacesData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then(res => res.data),
  })

  const createWorkspaceMutation = useMutation({
    mutationFn: (data) => api.post('/workspaces', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['user-workspace'] })
      toast.success('Workspace created successfully!')
      setShowCreateModal(false)
      setNewWorkspaceName('')
      window.location.reload() // Reload to switch to new workspace
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create workspace')
    }
  })

  const currentWorkspace = workspacesData?.workspaces?.find(w => w.id === currentWorkspaceId) || 
                          workspacesData?.workspaces?.[0]

  // Helper function to format workspace name (remove email domain)
  const formatWorkspaceName = (name) => {
    if (!name) return 'Select Workspace'
    // If it looks like an email (contains @), show only the part before @
    if (name.includes('@')) {
      return name.split('@')[0]
    }
    return name
  }

  const handleSwitchWorkspace = (workspace) => {
    // Store the selected workspace in localStorage and reload
    localStorage.setItem('currentWorkspaceId', workspace.id)
    window.location.reload()
    setIsOpen(false)
  }

  const handleCreateWorkspace = (e) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    createWorkspaceMutation.mutate({ name: newWorkspaceName })
  }

  return (
    <div className="relative">
      {/* Merged Logo + Workspace Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-3 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-all shadow-sm hover:shadow"
      >
        <div className="flex items-center space-x-3 min-w-0">
          {/* Logo */}
          <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {/* Text */}
          <div className="flex flex-col items-start min-w-0">
            <span className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm">
              Uptime Monitor
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {formatWorkspaceName(currentWorkspace?.name)} • <span className="capitalize">{currentWorkspace?.role || 'Member'}</span>
            </span>
          </div>
        </div>
        <ChevronUpDownIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
      </button>

      {/* Modern Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Switch Workspace
              </h3>
            </div>

            {/* Workspace List */}
            <div className="max-h-80 overflow-y-auto py-2">
              {workspacesData?.workspaces?.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleSwitchWorkspace(workspace)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all group ${
                    currentWorkspace?.id === workspace.id
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      currentWorkspace?.id === workspace.id
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/50'
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      <BuildingOfficeIcon className={`h-5 w-5 ${
                        currentWorkspace?.id === workspace.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className={`font-semibold truncate ${
                        currentWorkspace?.id === workspace.id
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {formatWorkspaceName(workspace.name)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                        {workspace.role} • {workspace.monitorCount} monitors
                      </div>
                    </div>
                  </div>
                  {currentWorkspace?.id === workspace.id && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="h-6 w-6 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Create Workspace Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setShowCreateModal(true)
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                  <PlusIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span>Create New Workspace</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Workspace Modal */}
      <Transition appear show={showCreateModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowCreateModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-25 dark:bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Create Workspace
                    </Dialog.Title>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateWorkspace} className="space-y-4">
                    <div>
                      <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        id="workspaceName"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        className="input mt-1"
                        placeholder="My Workspace"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="btn btn-secondary btn-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createWorkspaceMutation.isPending}
                        className="btn btn-primary btn-md"
                      >
                        {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

