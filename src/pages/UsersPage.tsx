import React, { useEffect, useState } from "react";
import axios from "axios";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import ObjectFilterPanel from "../components/ui/ObjectFilterPanel";

interface User {
  id: number;
  companyId: number;
  crmName: string;
  crmUserId: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  active: boolean;
  crmCreatedAt: string | null;
  crmUpdatedAt: string | null;
  metaData: string | null;
  jobTitle?: string | null;
  phone?: string | null;
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

interface UsersPageProps {
  companyId: string;
}

const PAGE_SIZE = 10;

const UsersPage: React.FC<UsersPageProps> = ({ companyId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelectiveSync, setShowSelectiveSync] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filteredUserIds, setFilteredUserIds] = useState<string[]>([]);

  const loadUsers = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<PaginatedResponse<User>>(
        `http://localhost:8080/api/users/by-company/${companyId}/paginated?page=${page}&size=${PAGE_SIZE}`
      );
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err) {
      setError("Failed to load users.");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(0);
  }, [companyId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(page);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    const allUserIds = users.map(user => user.crmUserId);
    setSelectedUserIds(allUserIds);
  };

  const handleDeselectAllUsers = () => {
    setSelectedUserIds([]);
  };

  const handleFilterApplied = (objectIds: string[]) => {
    setFilteredUserIds(objectIds);
    setSelectedUserIds(objectIds);
  };

  const handleFilterCleared = () => {
    setFilteredUserIds([]);
    setSelectedUserIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600">Manage company users and their information</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={() => window.location.href = `/companies/${companyId}/field-mappings/user`}
          >
            Field Mappings
          </button>
          <button
            className="btn-ghost"
            onClick={() => window.location.href = `/companies/${companyId}/sync-jobs`}
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
            className="btn-primary"
            onClick={() => window.location.href = `/companies/${companyId}/sync-control`}
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
                <span className="text-slate-600">Loading users...</span>
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

        {/* Users Table */}
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
                          checked={users.length > 0 && selectedUserIds.length === users.length}
                          onChange={selectedUserIds.length === users.length ? handleDeselectAllUsers : handleSelectAllUsers}
                          className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                        />
                      </th>
                    )}
                    <th className="table-header-cell">Full Name</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">CRM</th>
                    <th className="table-header-cell">CRM User ID</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">CRM Created</th>
                    <th className="table-header-cell">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {showSelectiveSync && (
                        <td className="table-cell w-12">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.crmUserId)}
                            onChange={() => handleUserSelect(u.crmUserId)}
                            className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                          />
                        </td>
                      )}
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-slate-900">
                            {u.name ?? (([u.firstName, u.lastName].filter(Boolean).join(" ")) || "-")}
                          </div>
                          {(u.firstName || u.lastName) && (
                            <div className="text-sm text-slate-500">
                              {u.firstName} {u.lastName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-slate-600">{u.email}</td>
                      <td className="table-cell">
                        <span className="status-badge status-neutral">
                          {u.crmName?.toUpperCase() ?? "-"}
                        </span>
                      </td>
                      <td className="table-cell text-slate-600">{u.crmUserId ?? "-"}</td>
                      <td className="table-cell">
                        <span className={`status-badge ${u.active ? "status-success" : "status-error"}`}>
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="table-cell text-slate-600">
                        {u.crmCreatedAt ? new Date(u.crmCreatedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="table-cell text-slate-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} users
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
        objectType="user"
        onFilterApplied={handleFilterApplied}
        onFilterCleared={handleFilterCleared}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Selective Sync Panel */}
      {showSelectiveSync && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900">Selective Sync - Users</h2>
            <p className="text-slate-600 text-sm">
              Sync specific users with selected properties
            </p>
          </div>
          <div className="card-content">
            <SelectiveSyncPanel
              companyId={companyId}
              objectType="user"
              userId="1"
              selectedObjectIds={selectedUserIds}
              onSyncComplete={(result) => {
                console.log("Selective sync completed:", result);
                loadUsers(currentPage);
              }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">👥</div>
              <p className="text-slate-500">No users found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;


