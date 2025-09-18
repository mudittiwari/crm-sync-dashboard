import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

interface SyncJob {
  id: number;
  companyId: number;
  userId: number;
  crmObjectType: string;
  syncGroupId: string;
  requestedProperties: string | null;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
  errorMessage: string | null;
  startTime: string;
  endTime: string | null;
  durationMs: number;
  syncType: "MANUAL" | "AUTOMATIC" | "SCHEDULED";
  createdAt: string;
  updatedAt: string;
}

interface SyncStats {
  totalJobs: number;
  successJobs: number;
  failedJobs: number;
  pendingJobs: number;
  runningJobs: number;
  averageJobDuration: number;
  lastSyncTime: string | null;
}

interface SyncJobsPageProps {
  companyId: string;
}

const PAGE_SIZE = 20;

const SyncJobsPage: React.FC<SyncJobsPageProps> = ({ companyId }) => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [allSyncJobs, setAllSyncJobs] = useState<SyncJob[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "failed" | "stats">("all");
  const [filters, setFilters] = useState({
    status: "all",
    objectType: "all",
    days: 7
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const loadSyncJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:8080/api/sync-jobs/companies/${companyId}`;
      
      if (activeTab === "recent") {
        url = `http://localhost:8080/api/sync-jobs/companies/${companyId}/recent?days=${filters.days}`;
      } else if (activeTab === "failed") {
        url = `http://localhost:8080/api/sync-jobs/companies/${companyId}/failed`;
      }

      const response = await axios.get(url);
      console.log("Raw API response:", response.data);
      
      // Store all jobs for filtering
      setAllSyncJobs(response.data);
      
      // Apply client-side filtering
      let filteredData = response.data;
      
      if (filters.status !== "all") {
        filteredData = filteredData.filter((job: SyncJob) => job.status === filters.status);
      }
      
      if (filters.objectType !== "all") {
        filteredData = filteredData.filter((job: SyncJob) => 
          job.crmObjectType.toLowerCase() === filters.objectType.toLowerCase()
        );
      }
      
      console.log("Filtered data:", filteredData);
      setSyncJobs(filteredData);
      setVisibleCount(PAGE_SIZE);
    } catch (err) {
      setError("Failed to load sync jobs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/sync-jobs/companies/${companyId}/statistics`);
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    loadSyncJobs();
    if (activeTab === "stats") {
      loadStats();
    }
  }, [companyId, activeTab, filters]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, syncJobs.length));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "status-success";
      case "FAILED": return "status-error";
      case "RUNNING": return "status-info";
      case "PENDING": return "status-warning";
      case "CANCELLED": return "status-neutral";
      default: return "status-neutral";
    }
  };

  const formatDuration = (durationMs: number) => {
    const diffMins = Math.floor(durationMs / 60000);
    const diffSecs = Math.floor((durationMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get unique object types from all sync jobs
  const getUniqueObjectTypes = () => {
    const types = [...new Set(allSyncJobs.map(job => job.crmObjectType))];
    return types.sort();
  };

  if (loading && syncJobs.length === 0) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
              <span className="text-slate-600">Loading sync jobs...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={loadSyncJobs}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Jobs Monitor</h1>
          <p className="text-slate-600">Monitor synchronization jobs and their status</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadSyncJobs}
            className="btn-primary"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-content">
          <nav className="flex space-x-1">
            {[
              { id: "all", label: "All Jobs", icon: "📋" },
              { id: "recent", label: "Recent", icon: "🕒" },
              { id: "failed", label: "Failed", icon: "❌" },
              { id: "stats", label: "Statistics", icon: "📊" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      {activeTab !== "stats" && (
        <div className="card">
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="RUNNING">Running</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Object Type</label>
                <select
                  value={filters.objectType}
                  onChange={(e) => setFilters(prev => ({ ...prev, objectType: e.target.value }))}
                  className="input-field"
                >
                  <option value="all">All Types</option>
                  {getUniqueObjectTypes().map(type => (
                    <option key={type} value={type.toLowerCase()}>
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>
              {activeTab === "recent" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Days</label>
                  <select
                    value={filters.days}
                    onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                    className="input-field"
                  >
                    <option value={1}>Last 24 hours</option>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      {activeTab === "stats" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalJobs > 0 ? Math.round((stats.successJobs / stats.totalJobs) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sync Type</p>
                <p className="text-2xl font-bold text-gray-900">Manual</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageJobDuration)}s</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      {activeTab !== "stats" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="max-h-[600px] overflow-y-auto"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Object Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync Group ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncJobs.slice(0, visibleCount).map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {job.crmObjectType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.syncType === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                        job.syncType === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {job.syncType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(job.durationMs)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs" title={job.syncGroupId}>
                      {job.syncGroupId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.endTime ? formatDate(job.endTime) : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={job.errorMessage || ""}>
                      {job.errorMessage || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleCount < syncJobs.length && (
              <div className="text-center py-4 text-gray-600 text-sm">
                Scroll to load more...
              </div>
            )}
          </div>
        </div>
      )}

      {syncJobs.length === 0 && activeTab !== "stats" && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sync jobs found</h3>
          <p className="text-gray-500">No sync jobs match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default SyncJobsPage;
