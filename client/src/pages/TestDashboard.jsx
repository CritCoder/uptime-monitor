export default function TestDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Test Dashboard</h1>
      <p className="text-gray-600">This is a simple test dashboard to verify rendering works.</p>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Test Content</h2>
        <p>If you can see this, the dashboard is rendering correctly.</p>
      </div>
    </div>
  )
}
