import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import ObjectFilterPanel from "../components/ui/ObjectFilterPanel";

interface Email {
  id: number;
  userId: number | null;
  emailMessageId: string;
  threadId: string;
  subject: string;
  snippet: string | null;
  fromEmail: string;
  toEmail: string;
  ccEmail: string | null;
  bccEmail: string | null;
  mimeType: string | null;
  receivedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  primaryCrmDealId: string | null;
  source: string | null;
  direction: string | null;
  emailSource: string | null;
  emailDirection: string | null;
  crmAccountIds: string;
  messageFilePath: string | null;
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

interface EmailsPageProps {
  companyId: string;
}

const EmailsPage: React.FC<EmailsPageProps> = ({ companyId }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelectiveSync, setShowSelectiveSync] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [filteredEmailIds, setFilteredEmailIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const { accountId, dealId } = useParams<{ accountId?: string; dealId?: string }>();
  const PAGE_SIZE = 10;

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    // Try native parse first
    let d = new Date(value);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    // If missing timezone, try appending Z
    d = new Date(`${value}Z`);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    // If milliseconds are too long, trim to 3 digits
    const msTrimmed = value.replace(/\.(\d{3})\d+/, ".$1");
    d = new Date(msTrimmed);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    return "-";
  };

  const truncateMiddle = (value: string | null | undefined, maxLength = 24) => {
    if (!value) return "-";
    if (value.length <= maxLength) return value;
    const half = Math.floor((maxLength - 3) / 2);
    return `${value.slice(0, half)}...${value.slice(-half)}`;
  };

  const loadEmails = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      let url;
      if (accountId) {
        url = `http://localhost:8080/api/emails/by-account/${accountId}/paginated?page=${page}&size=${PAGE_SIZE}`;
      } else if (dealId) {
        url = `http://localhost:8080/api/emails/by-deal/${dealId}/paginated?page=${page}&size=${PAGE_SIZE}`;
      } else {
        url = `http://localhost:8080/api/emails/by-company/${companyId}/paginated?page=${page}&size=${PAGE_SIZE}`;
      }
      
      const response = await axios.get<PaginatedResponse<Email>>(url);
      setEmails(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err) {
      setError("Failed to load emails.");
      console.error("Error loading emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails(0);
  }, [companyId, accountId, dealId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadEmails(page);
  };

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailIds(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAllEmails = () => {
    const allEmailIds = emails.map(email => email.emailMessageId);
    setSelectedEmailIds(allEmailIds);
  };

  const handleDeselectAllEmails = () => {
    setSelectedEmailIds([]);
  };

  const handleFilterApplied = (objectIds: string[]) => {
    setFilteredEmailIds(objectIds);
    setSelectedEmailIds(objectIds);
  };

  const handleFilterCleared = () => {
    setFilteredEmailIds([]);
    setSelectedEmailIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Emails</h1>
          <p className="text-slate-600">View and manage email communications</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="btn-secondary"
            onClick={() => navigate(`/companies/${companyId}/field-mappings/email`)}
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
                <span className="text-slate-600">Loading emails...</span>
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
      {/* Emails Table */}
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
                        checked={emails.length > 0 && selectedEmailIds.length === emails.length}
                        onChange={selectedEmailIds.length === emails.length ? handleDeselectAllEmails : handleSelectAllEmails}
                        className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                      />
                    </th>
                  )}
                  <th className="table-header-cell">Subject</th>
                  <th className="table-header-cell">From</th>
                  <th className="table-header-cell">To</th>
                  <th className="table-header-cell">Direction</th>
                  <th className="table-header-cell">Thread ID</th>
                  <th className="table-header-cell">Message ID</th>
                  <th className="table-header-cell">Received At</th>
                  <th className="table-header-cell">Created At</th>
                </tr>
              </thead>
              <tbody>
                {emails.map(email => (
                  <tr key={email.id} className="hover:bg-slate-50 transition-colors">
                    {showSelectiveSync && (
                      <td className="table-cell w-12">
                        <input
                          type="checkbox"
                          checked={selectedEmailIds.includes(email.emailMessageId)}
                          onChange={() => handleEmailSelect(email.emailMessageId)}
                          className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                        />
                      </td>
                    )}
                    <td className="table-cell font-medium">{email.subject}</td>
                    <td className="table-cell text-slate-600">{email.fromEmail}</td>
                    <td className="table-cell text-slate-600">{email.toEmail}</td>
                    <td className="table-cell">
                      <span className="status-badge status-info">
                        {email.emailDirection ?? email.direction ?? "-"}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600" title={email.threadId}>
                      {truncateMiddle(email.threadId)}
                    </td>
                    <td className="table-cell text-slate-600" title={email.emailMessageId}>
                      {truncateMiddle(email.emailMessageId)}
                    </td>
                    <td className="table-cell text-slate-600">{formatDate(email.receivedAt)}</td>
                    <td className="table-cell text-slate-600">{formatDate(email.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} emails
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
        objectType="email"
        onFilterApplied={handleFilterApplied}
        onFilterCleared={handleFilterCleared}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Selective Sync Panel */}
      {showSelectiveSync && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900">Selective Sync - Emails</h2>
            <p className="text-slate-600 text-sm">
              Sync specific emails with selected properties
            </p>
          </div>
          <div className="card-content">
            <SelectiveSyncPanel
              companyId={companyId}
              objectType="email"
              userId="1"
              selectedObjectIds={selectedEmailIds}
              onSyncComplete={(result) => {
                console.log("Selective sync completed:", result);
                loadEmails(currentPage);
              }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && emails.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">📧</div>
              <p className="text-slate-500">No emails found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailsPage;
