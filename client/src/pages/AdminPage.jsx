import { useState, useEffect } from 'react'
import { adminApi } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Users,
  Monitor,
  Building2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Globe,
  Bell,
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function AdminPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Check if user is superadmin
  const SUPERADMIN_EMAIL = 'suumit@mydukaan.io'
  const isAdmin = user?.email === SUPERADMIN_EMAIL
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    try {
      setRefreshing(true)
      const [analyticsRes, usersRes, workspacesRes] = await Promise.all([
        adminApi.getAnalytics(timeRange),
        adminApi.getUsers({ limit: 100 }),
        adminApi.getWorkspaces({ limit: 100 })
      ])

      setAnalytics(analyticsRes.data)
      setUsers(usersRes.data.users)
      setWorkspaces(workspacesRes.data.workspaces)
      setAccessDenied(false)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      if (error.response?.status === 403) {
        setAccessDenied(true)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-sm text-gray-500 mb-6">
            You don't have permission to access the admin panel. Only the superadmin ({SUPERADMIN_EMAIL}) can access this area.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Current user: <span className="font-semibold">{user?.email}</span>
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              <span>{Math.abs(change)}% from last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.users.total || 0}
          change={analytics?.users.new > 0 ? ((analytics?.users.new / analytics?.users.total) * 100).toFixed(1) : 0}
          icon={Users}
          color="blue"
          subtitle={`${analytics?.users.new || 0} new`}
        />
        <StatCard
          title="Total Monitors"
          value={analytics?.monitors.total || 0}
          icon={Monitor}
          color="green"
          subtitle={`${analytics?.monitors.active || 0} active`}
        />
        <StatCard
          title="Workspaces"
          value={analytics?.workspaces.total || 0}
          icon={Building2}
          color="purple"
          subtitle={`${analytics?.workspaces.new || 0} new`}
        />
        <StatCard
          title="Open Incidents"
          value={analytics?.incidents.open || 0}
          icon={AlertTriangle}
          color="red"
          subtitle={`${analytics?.incidents.recent || 0} recent`}
        />
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Average Uptime</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics?.platformHealth.averageUptime?.toFixed(2) || 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">MTTR (Minutes)</p>
            <p className="text-2xl font-bold text-blue-600">
              {analytics?.incidents.avgResolutionTimeMinutes || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status Pages</p>
            <p className="text-2xl font-bold text-purple-600">
              {analytics?.statusPages.total || 0}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({analytics?.statusPages.public || 0} public)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.users.growth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Incident Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.incidents.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Bar dataKey="count" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monitor Types & Alert Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monitor Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monitor Types</h3>
          <div className="space-y-3">
            {analytics?.monitors.byType?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item._count / analytics?.monitors.total * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Channels */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Channels</h3>
          <div className="space-y-3">
            {analytics?.alerts.byChannel?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{item.channel}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(item._count / analytics?.alerts.total * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Monitors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Monitors</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workspace</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics?.monitors.top?.slice(0, 5).map((monitor) => (
                <tr key={monitor.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{monitor.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{monitor.url}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{monitor.workspace?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">{monitor.uptimePercentage?.toFixed(2) || 0}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      monitor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {monitor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const UsersTab = () => {
    const filteredUsers = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Top Active Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Most Active Users (by monitor count)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workspaces</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monitors</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics?.topUsers?.slice(0, 10).map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.workspaceCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">{user.monitorCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">All Users ({filteredUsers.length})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workspaces</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="space-y-1">
                        {user.workspaces?.map((ws, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{ws.name}</span>
                            <span className="text-gray-400 ml-1">({ws.role})</span>
                            <span className="text-gray-400 ml-1">- {ws.monitorCount} monitors</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const WorkspacesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Workspaces ({workspaces.length})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monitors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Pages</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incidents</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workspaces.map((workspace) => (
                <tr key={workspace.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{workspace.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="space-y-1">
                      {workspace.members?.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="text-xs">
                          {member.user.email} <span className="text-gray-400">({member.role})</span>
                        </div>
                      ))}
                      {workspace.members?.length > 3 && (
                        <div className="text-xs text-gray-400">+{workspace.members.length - 3} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    {workspace._count?.monitors || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {workspace._count?.statusPages || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {workspace._count?.incidents || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Platform analytics and management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline-block mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('workspaces')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workspaces'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4 inline-block mr-2" />
              Workspaces
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'workspaces' && <WorkspacesTab />}
      </div>
    </div>
  )
}

export default AdminPage

