import React, { useState } from "react";
import axios from "axios";

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: string[];
}

interface ObjectFilterPanelProps {
  companyId: string;
  objectType: 'deal' | 'contact' | 'company' | 'task' | 'email' | 'user';
  onFilterApplied: (objectIds: string[]) => void;
  onFilterCleared: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const ObjectFilterPanel: React.FC<ObjectFilterPanelProps> = ({
  companyId,
  objectType,
  onFilterApplied,
  onFilterCleared,
  isVisible,
  onToggleVisibility
}) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Define filter fields for each object type
  const getFilterFields = (): FilterField[] => {
    switch (objectType) {
      case 'deal':
        return [
          { name: 'dealName', label: 'Deal Name', type: 'text' },
          { name: 'amount', label: 'Amount', type: 'number' },
          { name: 'salesStage', label: 'Sales Stage', type: 'text' },
          { name: 'salesStageCategory', label: 'Stage Category', type: 'text' },
          { name: 'closeDate', label: 'Close Date', type: 'date' },
          { name: 'ownerId', label: 'Owner ID', type: 'text' },
          { name: 'ownerName', label: 'Owner Name', type: 'text' },
          { name: 'crmDealId', label: 'CRM Deal ID', type: 'text' }
        ];
      case 'contact':
        return [
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'lastName', label: 'Last Name', type: 'text' },
          { name: 'fullName', label: 'Full Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'mobilePhone', label: 'Mobile Phone', type: 'text' },
          { name: 'jobTitle', label: 'Job Title', type: 'text' },
          { name: 'accountCrmId', label: 'Account CRM ID', type: 'text' },
          { name: 'ownerId', label: 'Owner ID', type: 'text' },
          { name: 'crmId', label: 'CRM ID', type: 'text' }
        ];
      case 'company':
        return [
          { name: 'name', label: 'Account Name', type: 'text' },
          { name: 'domain', label: 'Domain', type: 'text' },
          { name: 'industry', label: 'Industry', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'website', label: 'Website', type: 'text' },
          { name: 'ownerId', label: 'Owner ID', type: 'text' },
          { name: 'accountType', label: 'Account Type', type: 'text' },
          { name: 'crmId', label: 'CRM ID', type: 'text' }
        ];
      case 'task':
        return [
          { name: 'subject', label: 'Subject', type: 'text' },
          { name: 'whoId', label: 'Who ID', type: 'text' },
          { name: 'crmTaskId', label: 'CRM Task ID', type: 'text' },
          { name: 'ownerId', label: 'Owner ID', type: 'text' },
          { name: 'accountId', label: 'Account ID', type: 'text' },
          { name: 'callType', label: 'Call Type', type: 'text' },
          { name: 'callDisposition', label: 'Call Disposition', type: 'text' },
          { name: 'status', label: 'Status', type: 'select', options: ['completed', 'pending', 'in_progress', 'cancelled'] },
          { name: 'isClosed', label: 'Is Closed', type: 'select', options: ['true', 'false'] }
        ];
      case 'email':
        return [
          { name: 'emailMessageId', label: 'Message ID', type: 'text' },
          { name: 'threadId', label: 'Thread ID', type: 'text' },
          { name: 'subject', label: 'Subject', type: 'text' },
          { name: 'fromEmail', label: 'From Email', type: 'text' },
          { name: 'toEmail', label: 'To Email', type: 'text' },
          { name: 'ccEmail', label: 'CC Email', type: 'text' },
          { name: 'bccEmail', label: 'BCC Email', type: 'text' },
          { name: 'direction', label: 'Direction', type: 'select', options: ['inbound', 'outbound'] },
          { name: 'emailDirection', label: 'Email Direction', type: 'select', options: ['inbound', 'outbound'] },
          { name: 'source', label: 'Source', type: 'text' }
        ];
      case 'user':
        return [
          { name: 'email', label: 'Email', type: 'text' },
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'lastName', label: 'Last Name', type: 'text' },
          { name: 'crmUserId', label: 'CRM User ID', type: 'text' },
          { name: 'jobTitle', label: 'Job Title', type: 'text' },
          { name: 'phone', label: 'Phone', type: 'text' }
        ];
      default:
        return [];
    }
  };

  const filterFields = getFilterFields();

  const handleFilterChange = (fieldName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setResult(null);
    setError(null);
    onFilterCleared();
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove empty filters
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      if (Object.keys(activeFilters).length === 0) {
        setError("Please enter at least one filter criteria");
        return;
      }

      const response = await axios.post(
        `http://localhost:8080/api/object-filter-sync/companies/${companyId}/${objectType}`,
        {
          filters: activeFilters,
          limit: 100 // Adjust limit as needed
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setResult(response.data);
      onFilterApplied(response.data.matchingObjectIds || []);
    } catch (err: any) {
      console.error("Filter failed:", err);
      setError(err.response?.data?.message || "Filter failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">All {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={loading}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={loading}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label}`}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            disabled={loading}
          />
        );
    }
  };

  if (!isVisible) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Database Filtering - {objectType.charAt(0).toUpperCase() + objectType.slice(1)}s
              </h3>
              <p className="text-sm text-slate-600">
                Filter {objectType}s from database using advanced criteria
              </p>
            </div>
            <button
              onClick={onToggleVisibility}
              className="btn-ghost text-sm py-1 px-3"
            >
              Show Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Database Filtering - {objectType.charAt(0).toUpperCase() + objectType.slice(1)}s
            </h3>
            <p className="text-sm text-slate-600">
              Filter {objectType}s from database using advanced criteria
            </p>
          </div>
          <button
            onClick={onToggleVisibility}
            className="btn-ghost text-sm py-1 px-3"
          >
            Hide Filters
          </button>
        </div>
      </div>
      <div className="card-content">
        {/* Filter Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filterFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                {field.label}
              </label>
              {renderFilterField(field)}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={applyFilters}
              disabled={loading || Object.values(filters).every(v => !v || v.trim() === '')}
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Filtering...
                </span>
              ) : (
                'Apply Filters'
              )}
            </button>
            <button
              onClick={clearFilters}
              disabled={loading}
              className="btn-ghost"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600">
              <span className="mr-2">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-900">Filter Results</h4>
              <span className="text-xs text-slate-500">
                {result.totalObjectsFound} found, {result.objectsToSync} to sync
              </span>
            </div>
            <div className="text-sm text-slate-600">
              <p>Status: <span className="font-medium">{result.status}</span></p>
              <p>Message: {result.message}</p>
              {result.matchingObjectIds && (
                <p>Matching IDs: {result.matchingObjectIds.length} objects</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectFilterPanel;
