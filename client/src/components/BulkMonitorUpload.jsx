import { useState, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function BulkMonitorUpload({ onSuccess, onCancel }) {
  const [mode, setMode] = useState(null); // 'csv', 'textarea'
  const [urls, setUrls] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [parsedMonitors, setParsedMonitors] = useState([]);
  const [defaultInterval, setDefaultInterval] = useState(3600);
  const [defaultType, setDefaultType] = useState('http');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, created: 0, failed: 0 });
  const [results, setResults] = useState([]);
  const fileInputRef = useRef(null);

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const monitors = [];

    lines.forEach((line, index) => {
      if (index === 0 && (line.toLowerCase().includes('url') || line.toLowerCase().includes('name'))) {
        return; // Skip header
      }

      const parts = line.split(',').map(p => p.trim());
      if (parts[0] && parts[0].length > 0) {
        monitors.push({
          url: parts[0],
          name: parts[1] || parts[0].replace(/^https?:\/\//, '').split('/')[0],
          interval: parts[2] ? parseInt(parts[2]) : defaultInterval,
          type: parts[3] || defaultType,
          id: `temp-${Date.now()}-${index}`
        });
      }
    });

    return monitors;
  };

  // Parse textarea URLs
  const parseTextarea = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const url = line.trim();
      return {
        url,
        name: url.replace(/^https?:\/\//, '').split('/')[0],
        interval: defaultInterval,
        type: defaultType,
        id: `temp-${Date.now()}-${index}`
      };
    });
  };

  // Handle CSV file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const monitors = parseCSV(text);
      setParsedMonitors(monitors);
      toast.success(`Parsed ${monitors.length} monitors from CSV`);
    };
    reader.readAsText(file);
  };

  // Handle textarea parse
  const handleTextareaParse = () => {
    if (!urls.trim()) {
      toast.error('Please enter at least one URL');
      return;
    }

    const monitors = parseTextarea(urls);
    setParsedMonitors(monitors);
    toast.success(`Parsed ${monitors.length} monitors`);
  };

  // Remove monitor from list
  const removeMonitor = (id) => {
    setParsedMonitors(parsedMonitors.filter(m => m.id !== id));
  };

  // Update monitor in list
  const updateMonitor = (id, field, value) => {
    setParsedMonitors(parsedMonitors.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  // Bulk apply settings
  const bulkApplySettings = () => {
    setParsedMonitors(parsedMonitors.map(m => ({
      ...m,
      interval: defaultInterval,
      type: defaultType
    })));
    toast.success('Settings applied to all monitors');
  };

  // Create monitors
  const createMonitors = async () => {
    if (parsedMonitors.length === 0) {
      toast.error('No monitors to create');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: parsedMonitors.length, created: 0, failed: 0 });
    const newResults = [];

    for (let i = 0; i < parsedMonitors.length; i++) {
      const monitor = parsedMonitors[i];
      setProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        await api.post('/monitors', {
          name: monitor.name,
          url: monitor.url,
          type: monitor.type,
          interval: monitor.interval,
          workspaceId: 'placeholder' // Will be replaced by backend
        });

        newResults.push({ ...monitor, status: 'success' });
        setProgress(prev => ({ ...prev, created: prev.created + 1 }));
      } catch (error) {
        console.error('Failed to create monitor:', error);
        newResults.push({ 
          ...monitor, 
          status: 'failed', 
          error: error.response?.data?.message || error.response?.data?.error || 'Failed to create'
        });
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(newResults);
    setIsProcessing(false);

    const successCount = newResults.filter(r => r.status === 'success').length;
    if (successCount === newResults.length) {
      toast.success(`Successfully created all ${successCount} monitors!`);
      setTimeout(() => onSuccess?.(), 2000);
    } else {
      toast.error(`Created ${successCount} monitors, ${newResults.length - successCount} failed`);
    }
  };

  // Download sample CSV
  const downloadSampleCSV = () => {
    const sample = `url,name,interval,type
https://example.com,Example Site,3600,http
https://api.example.com,Example API,300,http
example.com,Example (no protocol),3600,http`;
    
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-monitors-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const reset = () => {
    setMode(null);
    setUrls('');
    setCsvFile(null);
    setParsedMonitors([]);
    setResults([]);
    setProgress({ current: 0, total: 0, created: 0, failed: 0 });
  };

  if (results.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Creation Complete!</h3>
          <p className="text-gray-600">
            Created {progress.created} of {progress.total} monitors
            {progress.failed > 0 && ` (${progress.failed} failed)`}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {result.status === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">{result.name}</div>
                  <div className="text-sm text-gray-500 truncate">{result.url}</div>
                  {result.error && (
                    <div className="text-sm text-red-600 mt-1">{result.error}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onSuccess?.()}
            className="flex-1 btn btn-primary"
          >
            Done
          </button>
          <button
            onClick={reset}
            className="flex-1 btn btn-secondary"
          >
            Create More
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 mb-4">
            <ArrowPathIcon className="h-10 w-10 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Monitors...</h3>
          <p className="text-gray-600">
            {progress.current} of {progress.total} processed
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600">✓ {progress.created} created</span>
            {progress.failed > 0 && (
              <span className="text-red-600">✗ {progress.failed} failed</span>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <SparklesIcon className="h-4 w-4 inline mr-1" />
            Please wait while we create your monitors. This may take a few moments.
          </p>
        </div>
      </div>
    );
  }

  if (parsedMonitors.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Monitors ({parsedMonitors.length})
          </h3>
          <button
            onClick={() => setParsedMonitors([])}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Upload
          </button>
        </div>

        {/* Bulk Settings */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
            <h4 className="font-semibold text-gray-900">Bulk Settings</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check Interval
              </label>
              <select
                value={defaultInterval}
                onChange={(e) => setDefaultInterval(parseInt(e.target.value))}
                className="select w-full"
              >
                <option value={3600}>1 hour</option>
                <option value={1800}>30 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={300}>5 minutes</option>
                <option value={60}>1 minute</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitor Type
              </label>
              <select
                value={defaultType}
                onChange={(e) => setDefaultType(e.target.value)}
                className="select w-full"
              >
                <option value="http">HTTP/HTTPS</option>
                <option value="ping">Ping</option>
                <option value="port">Port</option>
              </select>
            </div>
          </div>
          <button
            onClick={bulkApplySettings}
            className="mt-3 w-full btn btn-sm bg-white hover:bg-gray-50"
          >
            Apply to All Monitors
          </button>
        </div>

        {/* Monitor List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {parsedMonitors.map((monitor, index) => (
            <div
              key={monitor.id}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
                <div>
                  <input
                    type="text"
                    value={monitor.name}
                    onChange={(e) => updateMonitor(monitor.id, 'name', e.target.value)}
                    className="input input-sm w-full"
                    placeholder="Monitor name"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={monitor.url}
                    onChange={(e) => updateMonitor(monitor.id, 'url', e.target.value)}
                    className="input input-sm w-full"
                    placeholder="URL"
                  />
                </div>
              </div>

              <button
                onClick={() => removeMonitor(monitor.id)}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={createMonitors}
            className="flex-1 btn btn-primary"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Create {parsedMonitors.length} Monitors
          </button>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Monitor Creation</h3>
          <p className="text-gray-600">Add multiple monitors at once using CSV or paste URLs</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('csv')}
            className="group relative p-6 bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all"
          >
            <CloudArrowUpIcon className="h-12 w-12 text-primary-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-gray-900 mb-1">Upload CSV</h4>
            <p className="text-sm text-gray-600">Import from CSV file</p>
          </button>

          <button
            onClick={() => setMode('textarea')}
            className="group relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-gray-900 mb-1">Paste URLs</h4>
            <p className="text-sm text-gray-600">One URL per line</p>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (mode === 'csv') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Upload CSV File</h3>
          <button
            onClick={() => setMode(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4 group-hover:text-primary-600 group-hover:scale-110 transition-all" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {csvFile ? csvFile.name : 'Click to upload CSV file'}
          </h4>
          <p className="text-sm text-gray-600">
            or drag and drop your CSV file here
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h5 className="font-semibold text-blue-900">CSV Format:</h5>
          <code className="block text-sm text-blue-800 bg-white p-2 rounded">
            url,name,interval,type<br />
            https://example.com,Example,3600,http
          </code>
          <button
            onClick={downloadSampleCSV}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Download sample CSV
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'textarea') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Paste URLs</h3>
          <button
            onClick={() => setMode(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter URLs (one per line)
          </label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://example.com
https://api.example.com
example.com
bot9.ai
google.com"
            rows={10}
            className="input w-full font-mono text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            {urls.split('\n').filter(l => l.trim()).length} URLs entered
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <SparklesIcon className="h-4 w-4 inline mr-1" />
            You can enter URLs with or without http:// - we'll handle it automatically!
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTextareaParse}
            disabled={!urls.trim()}
            className="flex-1 btn btn-primary"
          >
            Parse URLs
          </button>
          <button
            onClick={() => setMode(null)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

