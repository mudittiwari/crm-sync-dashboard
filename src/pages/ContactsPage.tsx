import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import ObjectFilterPanel from "../components/ui/ObjectFilterPanel";

interface Contact {
  id: number;
  crmName: string | null;
  crmId: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  mobilePhone: string | null;
  jobTitle: string | null;
  accountCrmId: string | null;
  ownerId: string | null;
  crmCreatedAt: string;
  crmUpdatedAt: string;
  metaData: string;
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

interface ContactsPageProps {
  companyId: string;
}

const PAGE_SIZE = 10;

const ContactsPage: React.FC<ContactsPageProps> = ({ companyId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelectiveSync, setShowSelectiveSync] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [filteredContactIds, setFilteredContactIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const loadContacts = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<PaginatedResponse<Contact>>(
        `http://localhost:8080/api/contacts/by-company/${companyId}/paginated?page=${page}&size=${PAGE_SIZE}`
      );
      setContacts(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err) {
      setError("Failed to load contacts.");
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(0);
  }, [companyId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadContacts(page);
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    const allContactIds = contacts.map(contact => contact.crmId);
    setSelectedContactIds(allContactIds);
  };

  const handleDeselectAllContacts = () => {
    setSelectedContactIds([]);
  };

  const handleFilterApplied = (objectIds: string[]) => {
    setFilteredContactIds(objectIds);
    setSelectedContactIds(objectIds);
  };

  const handleFilterCleared = () => {
    setFilteredContactIds([]);
    setSelectedContactIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600">Manage contact information and relationships</p>
        </div>
          <div className="flex space-x-3">
            <button
              className="btn-secondary"
              onClick={() => navigate(`/companies/${companyId}/field-mappings/contact`)}
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
                <span className="text-slate-600">Loading contacts...</span>
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
      {/* Contacts Table */}
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
                        checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                        onChange={selectedContactIds.length === contacts.length ? handleDeselectAllContacts : handleSelectAllContacts}
                        className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                      />
                    </th>
                  )}
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Phone</th>
                  <th className="table-header-cell">Job Title</th>
                  <th className="table-header-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {showSelectiveSync && (
                      <td className="table-cell w-12">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(c.crmId)}
                          onChange={() => handleContactSelect(c.crmId)}
                          className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                        />
                      </td>
                    )}
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-slate-900">
                          {c.firstName} {c.lastName}
                        </div>
                        {c.fullName && c.fullName !== `${c.firstName} ${c.lastName}` && (
                          <div className="text-sm text-slate-500">{c.fullName}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-slate-600">{c.email}</td>
                    <td className="table-cell text-slate-600">{c.phone ?? c.mobilePhone ?? "-"}</td>
                    <td className="table-cell text-slate-600">{c.jobTitle ?? "-"}</td>
                    <td className="table-cell text-slate-600">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
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
                Showing {currentPage * PAGE_SIZE + 1} to {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of {totalElements} contacts
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
        objectType="contact"
        onFilterApplied={handleFilterApplied}
        onFilterCleared={handleFilterCleared}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Selective Sync Panel */}
      {showSelectiveSync && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-slate-900">Selective Sync - Contacts</h2>
            <p className="text-slate-600 text-sm">
              Sync specific contacts with selected properties
            </p>
          </div>
          <div className="card-content">
            <SelectiveSyncPanel
              companyId={companyId}
              objectType="contact"
              userId="1"
              selectedObjectIds={selectedContactIds}
              onSyncComplete={(result) => {
                console.log("Selective sync completed:", result);
                loadContacts(currentPage);
              }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && contacts.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">👤</div>
              <p className="text-slate-500">No contacts found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
