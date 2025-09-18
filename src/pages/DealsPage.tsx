import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import ObjectFilterPanel from "../components/ui/ObjectFilterPanel";

interface Deal {
  id: number;
  crmDealId: string;
  dealName: string;
  salesStage: string;
  amount: string;
  closeDate: string;
  ownerName: string | null;
  createdAt: string;
  updatedAt: string;
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

interface DealsPageProps {
  companyId: string;
}

const PAGE_SIZE = 10;

const DealsPage: React.FC<DealsPageProps> = ({ companyId }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelectiveSync, setShowSelectiveSync] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [filteredDealIds, setFilteredDealIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const loadDeals = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<PaginatedResponse<Deal>>(
        `http://localhost:8080/api/deals/by-company/${companyId}/paginated?page=${page}&size=${PAGE_SIZE}`
      );
      setDeals(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err) {
      setError("Failed to load deals.");
      console.error("Error loading deals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals(0);
  }, [companyId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadDeals(page);
  };

  const handleDealSelect = (dealId: string) => {
    setSelectedDealIds(prev => 
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const handleSelectAllDeals = () => {
    const allDealIds = deals.map(deal => deal.crmDealId);
    setSelectedDealIds(allDealIds);
  };

  const handleDeselectAllDeals = () => {
    setSelectedDealIds([]);
  };

  const handleFilterApplied = (objectIds: string[]) => {
    setFilteredDealIds(objectIds);
    // Auto-select all filtered deals
    setSelectedDealIds(objectIds);
  };

  const handleFilterCleared = () => {
    setFilteredDealIds([]);
    setSelectedDealIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals</h1>
          <p className="text-slate-600">Manage sales deals and opportunities</p>
        </div>
          <div className="flex space-x-3">
            <button
              className="btn-secondary"
              onClick={() => navigate(`/companies/${companyId}/field-mappings/deal`)}
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
                <span className="text-slate-600">Loading deals...</span>
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
      {/* Deals Table */}
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
                        checked={deals.length > 0 && selectedDealIds.length === deals.length}
                        onChange={selectedDealIds.length === deals.length ? handleDeselectAllDeals : handleSelectAllDeals}
                        className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                      />
                    </th>
                  )}
                  <th className="table-header-cell">Deal Name</th>
                  <th className="table-header-cell">Sales Stage</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Owner</th>
                  <th className="table-header-cell">Close Date</th>
                  <th className="table-header-cell">Created At</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {showSelectiveSync && (
                      <td className="table-cell w-12">
                        <input
                          type="checkbox"
                          checked={selectedDealIds.includes(deal.crmDealId)}
                          onChange={() => handleDealSelect(deal.crmDealId)}
                          className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                        />
                      </td>
                    )}
                    <td className="table-cell font-medium">{deal.dealName}</td>
                    <td className="table-cell">
                      <span className="status-badge status-info">{deal.salesStage}</span>
                    </td>
                    <td className="table-cell font-medium">
                      {deal.amount
                        ? `$${Number(deal.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "-"}
                    </td>
                    <td className="table-cell text-slate-600">{deal.ownerName || "-"}</td>
                    <td className="table-cell text-slate-600">
                      {deal.closeDate
                        ? new Date(deal.closeDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="table-cell text-slate-600">
                      {deal.createdAt
                        ? new Date(deal.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          className="btn-ghost text-xs py-1 px-2"
                          onClick={() => navigate(`/companies/${companyId}/emails/deal/${deal.crmDealId}`)}
                        >
                          Emails
                        </button>
                        <button
                          className="btn-ghost text-xs py-1 px-2"
                          onClick={() => navigate(`/companies/${companyId}/tasks/deal/${deal.crmDealId}`)}
                        >
                          Tasks
                        </button>
                      </div>
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
                Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} deals
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
        objectType="deal"
        onFilterApplied={handleFilterApplied}
        onFilterCleared={handleFilterCleared}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Selective Sync Panel */}
      {showSelectiveSync && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900">Selective Sync - Deals</h2>
            <p className="text-slate-600 text-sm">
              Sync specific deals with selected properties
            </p>
          </div>
          <div className="card-content">
            <SelectiveSyncPanel
              companyId={companyId}
              objectType="deal"
              userId="1"
              selectedObjectIds={selectedDealIds}
              onSyncComplete={(result) => {
                console.log("Selective sync completed:", result);
                // Optionally refresh the deals list
                loadDeals(currentPage);
              }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && deals.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">🤝</div>
              <p className="text-slate-500">No deals found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsPage;
