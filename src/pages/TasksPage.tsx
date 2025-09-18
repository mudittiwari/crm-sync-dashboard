import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import ObjectFilterPanel from "../components/ui/ObjectFilterPanel";

interface Task {
  id: number;
  whoId: string | null;
  subject: string;
  crmTaskId: string;
  callRecordingUrl: string | null;
  ownerId: string;
  accountId: string;
  callType: string | null;
  callDisposition: string | null;
  createdDate: string | null;
  lastModifiedDate: string | null;
  status: string;
  isClosed: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

interface TasksPageProps {
  companyId: string;
}

const TasksPage: React.FC<TasksPageProps> = ({ companyId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelectiveSync, setShowSelectiveSync] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [filteredTaskIds, setFilteredTaskIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const { accountId, dealId } = useParams<{ accountId?: string; dealId?: string }>();
  const PAGE_SIZE = 10;

  const loadTasks = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      let url;
      if (accountId) {
        url = `http://localhost:8080/api/tasks/by-account/${accountId}/paginated?page=${page}&size=${PAGE_SIZE}`;
      } else if (dealId) {
        url = `http://localhost:8080/api/tasks/by-deal/${dealId}/paginated?page=${page}&size=${PAGE_SIZE}`;
      } else {
        url = `http://localhost:8080/api/tasks/by-company/${companyId}/paginated?page=${page}&size=${PAGE_SIZE}`;
      }
      
      const response = await axios.get<PaginatedResponse<Task>>(url);
      setTasks(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err) {
      setError("Failed to load tasks.");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(0);
  }, [companyId, accountId, dealId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadTasks(page);
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    const allTaskIds = tasks.map(task => task.crmTaskId);
    setSelectedTaskIds(allTaskIds);
  };

  const handleDeselectAllTasks = () => {
    setSelectedTaskIds([]);
  };

  const handleFilterApplied = (objectIds: string[]) => {
    setFilteredTaskIds(objectIds);
    setSelectedTaskIds(objectIds);
  };

  const handleFilterCleared = () => {
    setFilteredTaskIds([]);
    setSelectedTaskIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600">Manage tasks and activities</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/companies/${companyId}/field-mappings/task`)}
          >
            Field Mappings
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigate(`/companies/${companyId}/sync-jobs`)}
          >
            Sync Jobs
          </button>
          <button
            className="btn-ghost"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"} Filters
          </button>
          <button
            className="btn-ghost"
            onClick={() => setShowSelectiveSync(!showSelectiveSync)}
          >
            {showSelectiveSync ? "Hide" : "Show"} Selective Sync
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate(`/companies/${companyId}/sync-control`)}
          >
            Sync Control
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                <span className="text-slate-600">Loading tasks...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {!loading && !error && (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  {showSelectiveSync && (
                    <th className="table-header-cell w-12">
                      <input
                        type="checkbox"
                        checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                        onChange={selectedTaskIds.length === tasks.length ? handleDeselectAllTasks : handleSelectAllTasks}
                        className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                      />
                    </th>
                  )}
                  <th className="table-header-cell">Subject</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Owner ID</th>
                  <th className="table-header-cell">Account ID</th>
                  <th className="table-header-cell">CRM Task ID</th>
                  <th className="table-header-cell">Created Date</th>
                  <th className="table-header-cell">Last Modified</th>
                  <th className="table-header-cell">Created At</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    {showSelectiveSync && (
                      <td className="table-cell w-12">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.crmTaskId)}
                          onChange={() => handleTaskSelect(task.crmTaskId)}
                          className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                        />
                      </td>
                    )}
                    <td className="table-cell font-medium">{task.subject}</td>
                    <td className="table-cell">
                      <span className="status-badge status-info">{task.status}</span>
                    </td>
                    <td className="table-cell text-slate-600">{task.ownerId || "-"}</td>
                    <td className="table-cell text-slate-600">{task.accountId || "-"}</td>
                    <td className="table-cell text-slate-600">{task.crmTaskId}</td>
                    <td className="table-cell text-slate-600">{task.createdDate ? new Date(task.createdDate).toLocaleString() : "-"}</td>
                    <td className="table-cell text-slate-600">{task.lastModifiedDate ? new Date(task.lastModifiedDate).toLocaleString() : "-"}</td>
                    <td className="table-cell text-slate-600">{task.createdAt ? new Date(task.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} tasks
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className="btn-ghost text-sm py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="btn-ghost text-sm py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 px-2">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-ghost text-sm py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-ghost text-sm py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Database Filter Panel */}
      <ObjectFilterPanel
        companyId={companyId}
        objectType="task"
        onFilterApplied={handleFilterApplied}
        onFilterCleared={handleFilterCleared}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Selective Sync Panel */}
      {showSelectiveSync && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900">Selective Sync - Tasks</h2>
            <p className="text-slate-600 text-sm">
              Sync specific tasks with selected properties
            </p>
          </div>
          <div className="card-content">
            <SelectiveSyncPanel
              companyId={companyId}
              objectType="task"
              userId="1"
              selectedObjectIds={selectedTaskIds}
              onSyncComplete={(result) => {
                console.log("Selective sync completed:", result);
                loadTasks(currentPage);
              }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">✅</div>
              <p className="text-slate-500">No tasks found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
