import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import ObjectFilterPanel from "../components/ui/ObjectFilterPanel";

interface Account {
  id: number;
  name: string;
  domain: string;
  owner: string;
  createdAt: string;
  crmId: string;
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

interface AccountsPageProps {
  companyId: string;
}

const PAGE_SIZE = 10;


const AccountsPage: React.FC<AccountsPageProps> = ({ companyId }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  // Loading and error states
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [errorAccounts, setErrorAccounts] = useState<string | null>(null);
  const [showSelectiveSync, setShowSelectiveSync] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [filteredAccountIds, setFilteredAccountIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const loadAccounts = async (page: number = 0) => {
    try {
      setLoadingAccounts(true);
      setErrorAccounts(null);
      setSelectedAccount(null);
      const response = await axios.get<PaginatedResponse<Account>>(
        `http://localhost:8080/api/accounts/by-company/${companyId}/paginated?page=${page}&size=${PAGE_SIZE}`
      );
      setAccounts(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err) {
      setErrorAccounts("Failed to load accounts.");
      console.error("Error loading accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts(0);
  }, [companyId]);

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    // no inline tabs anymore
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAccounts(page);
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAllAccounts = () => {
    const allAccountIds = accounts.map(account => account.crmId);
    setSelectedAccountIds(allAccountIds);
  };

  const handleDeselectAllAccounts = () => {
    setSelectedAccountIds([]);
  };

  const handleFilterApplied = (objectIds: string[]) => {
    setFilteredAccountIds(objectIds);
    setSelectedAccountIds(objectIds);
  };

  const handleFilterCleared = () => {
    setFilteredAccountIds([]);
    setSelectedAccountIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-600">Manage company accounts and their data</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/companies/${companyId}/field-mappings/company`)}
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
      {loadingAccounts && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                <span className="text-slate-600">Loading accounts...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {errorAccounts && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-red-600 font-medium">{errorAccounts}</p>
            </div>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      {!loadingAccounts && !errorAccounts && (
        <div className="table-container">
          <table className="min-w-full">
            <thead className="table-header">
              <tr>
                {showSelectiveSync && (
                  <th className="table-header-cell w-12">
                    <input
                      type="checkbox"
                      checked={accounts.length > 0 && selectedAccountIds.length === accounts.length}
                      onChange={selectedAccountIds.length === accounts.length ? handleDeselectAllAccounts : handleSelectAllAccounts}
                      className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                    />
                  </th>
                )}
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Domain</th>
                <th className="table-header-cell">Owner</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                    selectedAccount?.id === acc.id ? "bg-slate-100" : ""
                  }`}
                  onClick={() => handleSelectAccount(acc)}
                >
                  {showSelectiveSync && (
                    <td className="table-cell w-12" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedAccountIds.includes(acc.crmId)}
                        onChange={() => handleAccountSelect(acc.crmId)}
                        className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                      />
                    </td>
                  )}
                  <td className="table-cell font-medium">{acc.name}</td>
                  <td className="table-cell text-slate-600">{acc.domain}</td>
                  <td className="table-cell">{acc.owner}</td>
                  <td className="table-cell text-slate-600">
                    {new Date(acc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        className="btn-ghost text-xs py-1 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/companies/${companyId}/emails/account/${acc.crmId}`);
                        }}
                      >
                        Emails
                      </button>
                      <button
                        className="btn-ghost text-xs py-1 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/companies/${companyId}/tasks/account/${acc.crmId}`);
                        }}
                      >
                        Tasks
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} accounts
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

      {/* Selected Account Details */}
      {selectedAccount && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-slate-900">{selectedAccount.name} Details</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Domain</label>
                <p className="text-slate-900">{selectedAccount.domain}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Owner</label>
                <p className="text-slate-900">{selectedAccount.owner}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Created</label>
                <p className="text-slate-900">{new Date(selectedAccount.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                className="btn-primary"
                onClick={() => navigate(`/companies/${companyId}/emails/account/${selectedAccount.crmId}`)}
              >
                View Emails
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/companies/${companyId}/tasks/account/${selectedAccount.crmId}`)}
              >
                View Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Filter Panel */}
      <ObjectFilterPanel
        companyId={companyId}
        objectType="company"
        onFilterApplied={handleFilterApplied}
        onFilterCleared={handleFilterCleared}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Selective Sync Panel */}
      {showSelectiveSync && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900">Selective Sync - Accounts</h2>
            <p className="text-slate-600 text-sm">
              Sync specific accounts with selected properties
            </p>
          </div>
          <div className="card-content">
            <SelectiveSyncPanel
              companyId={companyId}
              objectType="company"
              userId="1"
              selectedObjectIds={selectedAccountIds}
              onSyncComplete={(result) => {
                console.log("Selective sync completed:", result);
                loadAccounts(currentPage);
              }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingAccounts && !errorAccounts && accounts.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">📋</div>
              <p className="text-slate-500">No accounts found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
