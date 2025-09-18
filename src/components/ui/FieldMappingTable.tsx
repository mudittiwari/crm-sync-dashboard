import axios from "axios";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";

interface FilterState {
  crmFieldName: string;
  fieldLabel: string;
  enabled: string;
  crmCustom: string;
  localFieldName: string;
  referencedObjectType: string;
}

export interface FieldMapping {
  id: number;
  companyId: number;
  createdAt: string;
  crmCustom: boolean;
  crmFieldName: string;
  crmName: string;
  crmObjectType: string;
  enabled: boolean;
  fieldLabel?: string;
  localFieldName?: string | null;
  referencedObjectType?: string | null;
  updatedAt: string;
}

interface FieldMappingTableProps {
  companyId: number;
  objectType: string;
}

const PAGE_SIZE = 20;

const FieldMappingTable: React.FC<FieldMappingTableProps> = ({
  companyId,
  objectType,
}) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    crmFieldName: "",
    fieldLabel: "",
    enabled: "all",
    crmCustom: "all",
    localFieldName: "",
    referencedObjectType: "",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const loadMappings = async () => {
    if (!companyId || !objectType) return;
    const url = `http://localhost:8080/api/companies/${companyId}/field-mappings?objectType=${encodeURIComponent(
      objectType
    )}`;
    try {
      const response = await axios.get(url);
      console.log(response.data)
      setFieldMappings(response.data);
      setVisibleCount(PAGE_SIZE);
    } catch (error) {
      console.error("Failed to fetch field mappings:", error);
    }
  };

  useEffect(() => {
    loadMappings();
  }, [companyId, objectType]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 50
    ) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filtered.length)
      );
    }
  };

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof FilterState
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setVisibleCount(PAGE_SIZE);
  };

  const safeStr = (s: any) => (s ? String(s).toLowerCase() : "");

  const boolFilter = (fieldVal: boolean, filterVal: string) =>
    filterVal === "all" || (filterVal === "true" && fieldVal) || (filterVal === "false" && !fieldVal);

  const filtered = fieldMappings.filter((fm) => {
    return (
      (filters.crmFieldName === "" || safeStr(fm.crmFieldName).includes(safeStr(filters.crmFieldName))) &&
      (filters.fieldLabel === "" || safeStr(fm.fieldLabel).includes(safeStr(filters.fieldLabel))) &&
      boolFilter(fm.enabled, filters.enabled) &&
      boolFilter(fm.crmCustom, filters.crmCustom) &&
      (filters.localFieldName === "" || safeStr(fm.localFieldName).includes(safeStr(filters.localFieldName))) &&
      (filters.referencedObjectType === "" || safeStr(fm.referencedObjectType).includes(safeStr(filters.referencedObjectType)))
    );
  });

  const handleToggleEnabled = async (fm: FieldMapping) => {
    try {
      setTogglingId(fm.id);
      const url = `http://localhost:8080/api/companies/${companyId}/field-mappings/${encodeURIComponent(
        fm.crmObjectType
      )}/${encodeURIComponent(fm.crmFieldName)}/enabled?enabled=${!fm.enabled}`;
      await axios.patch<FieldMapping>(url);
      // Refresh after a successful change to catch any concurrent updates
      await loadMappings();
    } catch (e) {
      console.error("Failed to toggle enabled", e);
    } finally {
      setTogglingId(null);
    }
  };


  if (fieldMappings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-2">📋</div>
        <p className="text-slate-500">No field mappings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Field Mappings</h3>
          <p className="text-sm text-slate-600">
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} mappings
          </p>
        </div>
      </div>
      
      <div className="table-container">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-y-auto max-h-[600px] overflow-x-auto"
        >
          <table className="min-w-full" style={{ minWidth: '1200px' }}>
          <thead className="table-header">
            <tr>
              <th className="table-header-cell" style={{ minWidth: '150px' }}>Field Label</th>
              <th className="table-header-cell" style={{ minWidth: '200px' }}>CRM Field Name</th>
              <th className="table-header-cell" style={{ minWidth: '100px' }}>Enabled</th>
              <th className="table-header-cell" style={{ minWidth: '100px' }}>Custom</th>
              <th className="table-header-cell" style={{ minWidth: '180px' }}>Local Field Name</th>
              <th className="table-header-cell" style={{ minWidth: '150px' }}>Referenced Object</th>
              <th className="table-header-cell" style={{ minWidth: '120px' }}>CRM Name</th>
              <th className="table-header-cell" style={{ minWidth: '120px' }}>Updated At</th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-1" style={{ minWidth: '150px' }}>
                <input
                  type="text"
                  value={filters.fieldLabel}
                  onChange={(e) => handleFilterChange(e, "fieldLabel")}
                  className="w-full text-xs px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Filter"
                />
              </th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '200px' }}>
                <input
                  type="text"
                  value={filters.crmFieldName}
                  onChange={(e) => handleFilterChange(e, "crmFieldName")}
                  className="w-full text-xs px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Filter"
                />
              </th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '100px' }}>
                <select
                  value={filters.enabled}
                  onChange={(e) => handleFilterChange(e, "enabled")}
                  className="w-full text-xs px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '100px' }}>
                <select
                  value={filters.crmCustom}
                  onChange={(e) => handleFilterChange(e, "crmCustom")}
                  className="w-full text-xs px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All</option>
                  <option value="true">Custom</option>
                  <option value="false">Standard</option>
                </select>
              </th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '180px' }}>
                <input
                  type="text"
                  value={filters.localFieldName}
                  onChange={(e) => handleFilterChange(e, "localFieldName")}
                  className="w-full text-xs px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Filter"
                />
              </th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '150px' }}>
                <input
                  type="text"
                  value={filters.referencedObjectType}
                  onChange={(e) => handleFilterChange(e, "referencedObjectType")}
                  className="w-full text-xs px-2 py-1 border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Filter"
                />
              </th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '120px' }}></th>
              <th className="border border-gray-300 p-1" style={{ minWidth: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visibleCount).map((fm) => (
              <tr
                key={fm.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="table-cell">
                  <span className="font-medium">{fm.fieldLabel || "-"}</span>
                </td>
                <td className="table-cell text-slate-600">{fm.crmFieldName}</td>
                <td className="table-cell text-center">
                  {togglingId === fm.id ? (
                    <span className="text-xs text-slate-500">Updating...</span>
                  ) : (
                    <button
                      className={`status-badge ${fm.enabled ? "status-success" : "status-error"}`}
                      onClick={() => handleToggleEnabled(fm)}
                    >
                      {fm.enabled ? "Enabled" : "Disabled"}
                    </button>
                  )}
                </td>
                <td className="table-cell text-center">
                  <span className={`status-badge ${fm.crmCustom ? "status-info" : "status-neutral"}`}>
                    {fm.crmCustom ? "Custom" : "Standard"}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-slate-600">{fm.localFieldName || "-"}</span>
                </td>
                <td className="table-cell">
                  <span className="text-slate-600">{fm.referencedObjectType || "-"}</span>
                </td>
                <td className="table-cell text-slate-600">{fm.crmName}</td>
                <td className="table-cell text-slate-600">
                  {new Date(fm.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {visibleCount < filtered.length && (
        <p className="text-center mt-4 text-slate-600 text-sm">Scroll to load more...</p>
      )}
    </div>
  );
};

export default FieldMappingTable;
