import React, { useState, useEffect } from "react";
import axios from "axios";

interface FieldMapping {
  id: number;
  companyId: number;
  crmFieldName: string;
  fieldLabel?: string;
  enabled: boolean;
  crmCustom: boolean;
  crmObjectType: string;
}

interface SelectiveSyncPanelProps {
  companyId: string;
  objectType: 'deal' | 'contact' | 'company' | 'task' | 'email' | 'user';
  userId?: string;
  selectedObjectIds?: string[];
  onSyncComplete?: (result: any) => void;
}

interface SyncRequest {
  objectIds: string[];
  properties: string[];
  userId: string;
  syncType: 'MANUAL';
}

const SelectiveSyncPanel: React.FC<SelectiveSyncPanelProps> = ({
  companyId,
  objectType,
  userId = "1",
  selectedObjectIds = [],
  onSyncComplete
}) => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [availableProperties, setAvailableProperties] = useState<FieldMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [propertySearch, setPropertySearch] = useState("");

  // Fetch available properties from field mappings
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching properties for ${objectType}...`);
        const response = await axios.get(
          `http://localhost:8080/api/companies/${companyId}/field-mappings?objectType=${encodeURIComponent(
      objectType
    )}`
        );
        console.log("Field mappings response:", response.data);
        
        // Filter to only enabled properties
        const enabledProperties = response.data.filter((fm: FieldMapping) => fm.enabled);
        console.log("Enabled properties:", enabledProperties);
        setAvailableProperties(enabledProperties);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError("Failed to load available properties. Please check if field mappings exist for this object type.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId && objectType) {
      fetchProperties();
    }
  }, [companyId, objectType]);


  // Handle property selection
  const handlePropertyToggle = (propertyName: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyName)
        ? prev.filter(p => p !== propertyName)
        : [...prev, propertyName]
    );
  };

  // Select all properties
  const handleSelectAll = () => {
    const allPropertyNames = filteredProperties.map(p => p.crmFieldName);
    setSelectedProperties(allPropertyNames);
  };

  // Deselect all properties
  const handleDeselectAll = () => {
    setSelectedProperties([]);
  };

  // Filter properties based on search
  const filteredProperties = availableProperties.filter(prop =>
    prop.crmFieldName.toLowerCase().includes(propertySearch.toLowerCase()) ||
    (prop.fieldLabel && prop.fieldLabel.toLowerCase().includes(propertySearch.toLowerCase()))
  );

  // Validate form
  const validateForm = (): string | null => {
    if (selectedObjectIds.length === 0) {
      return "Please select at least one object from the table";
    }
    if (selectedProperties.length === 0) {
      return "Please select at least one property";
    }
    return null;
  };

  // Execute selective sync
  const handleSync = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSyncing(true);
      setError(null);
      
      const syncRequest: SyncRequest = {
        objectIds: selectedObjectIds,
        properties: selectedProperties,
        userId,
        syncType: 'MANUAL'
      };

      const response = await axios.post(
        `http://localhost:8080/api/object-sync/companies/${companyId}/${objectType}`,
        syncRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setResult(response.data);
      onSyncComplete?.(response.data);
    } catch (err: any) {
      console.error("Sync failed:", err);
      setError(err.response?.data?.message || "Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const getObjectTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Object Selection Status */}
      {selectedObjectIds.length > 0 && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">
                {selectedObjectIds.length} {objectType} selected: {selectedObjectIds.join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Properties Selection */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-slate-900">Select Properties</h4>
              <p className="text-sm text-slate-600">
                Choose which properties to sync for the selected {objectType}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="btn-ghost text-xs py-1 px-2"
                disabled={syncing || loading || filteredProperties.length === 0}
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="btn-ghost text-xs py-1 px-2"
                disabled={syncing || loading}
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>
        <div className="card-content">
          {/* Property Search */}
          <div className="mb-4">
            <input
              type="text"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="Search properties by name..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              disabled={syncing || loading}
            />
          </div>

          {/* Properties List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                <span className="text-slate-600">Loading properties...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <div className="mb-2">⚠️</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <div className="mb-2">📝</div>
              <div className="text-sm">
                {availableProperties.length === 0 
                  ? "No enabled properties found for this object type. Please configure field mappings first."
                  : "No properties match your search criteria."
                }
              </div>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
              <div className="divide-y divide-slate-200">
                {filteredProperties.map((property) => (
                  <label
                    key={property.id}
                    className="flex items-center p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.crmFieldName)}
                      onChange={() => handlePropertyToggle(property.crmFieldName)}
                      className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                      disabled={syncing}
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {property.fieldLabel || property.crmFieldName}
                          </div>
                          {property.fieldLabel && property.fieldLabel !== property.crmFieldName && (
                            <div className="text-xs text-slate-500 truncate">
                              {property.crmFieldName}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                          property.crmCustom 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {property.crmCustom ? 'Custom' : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 text-xs text-slate-500">
            {selectedProperties.length} of {filteredProperties.length} property(ies) selected
            {availableProperties.length > 0 && (
              <span className="ml-2">
                ({availableProperties.length} total enabled properties)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="flex flex-col items-end space-y-2">
        {/* Validation Messages */}
        {selectedObjectIds.length === 0 && (
          <div className="text-sm text-amber-600 flex items-center">
            <span className="mr-1">⚠️</span>
            Please select at least one {objectType} from the table above
          </div>
        )}
        {selectedObjectIds.length > 0 && selectedProperties.length === 0 && (
          <div className="text-sm text-amber-600 flex items-center">
            <span className="mr-1">⚠️</span>
            Please select at least one property to sync
          </div>
        )}
        
        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing || loading || selectedObjectIds.length === 0 || selectedProperties.length === 0}
          className={`btn-primary ${
            selectedObjectIds.length === 0 || selectedProperties.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {syncing ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Syncing...
            </span>
          ) : selectedObjectIds.length === 0 ? (
            `Select ${objectType}s to sync`
          ) : selectedProperties.length === 0 ? (
            `Select properties to sync ${selectedObjectIds.length} ${objectType}${selectedObjectIds.length > 1 ? 's' : ''}`
          ) : (
            `Sync ${selectedObjectIds.length} ${objectType}${selectedObjectIds.length > 1 ? 's' : ''} with ${selectedProperties.length} properties`
          )}
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div className="card">
          <div className="card-header">
            <h4 className="text-md font-medium text-slate-900">Sync Results</h4>
            <p className="text-sm text-slate-600">Results from the selective sync operation</p>
          </div>
          <div className="card-content">
            <div className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectiveSyncPanel;
