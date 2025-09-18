import React, { useState } from "react";
import axios from "axios";
import SelectiveSyncPanel from "./SelectiveSyncPanel";

interface SyncControlPanelProps {
  companyId: string;
  userId?: string;
}

interface SyncOperation {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  category: "properties" | "data" | "tasks" | "emails";
  icon: string;
  color: string;
}

const SyncControlPanel: React.FC<SyncControlPanelProps> = ({ companyId, userId = "1" }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(null);

  const syncOperations: SyncOperation[] = [
    // Properties Sync
    {
      id: "company-properties",
      name: "Company Properties",
      description: "Sync company property definitions",
      endpoint: `/api/sync/companies/${companyId}/properties?userId=${userId}`,
      category: "properties",
      icon: "🏢",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    {
      id: "contact-properties",
      name: "Contact Properties",
      description: "Sync contact property definitions",
      endpoint: `/api/sync/companies/${companyId}/contacts/properties?userId=${userId}`,
      category: "properties",
      icon: "👤",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    {
      id: "deal-properties",
      name: "Deal Properties",
      description: "Sync deal property definitions",
      endpoint: `/api/sync/companies/${companyId}/deals/properties?userId=${userId}`,
      category: "properties",
      icon: "🤝",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    {
      id: "task-properties",
      name: "Task Properties",
      description: "Sync task property definitions",
      endpoint: `/api/sync/companies/${companyId}/tasks/properties?userId=${userId}`,
      category: "properties",
      icon: "✅",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    {
      id: "email-properties",
      name: "Email Properties",
      description: "Sync email property definitions",
      endpoint: `/api/sync/companies/${companyId}/emails/properties?userId=${userId}`,
      category: "properties",
      icon: "📧",
      color: "bg-slate-900 hover:bg-slate-800"
    },
    // Data Sync
    {
      id: "company-data",
      name: "Company Data",
      description: "Sync company records",
      endpoint: `/api/sync/companies/${companyId}/companies?userId=${userId}`,
      category: "data",
      icon: "🏢",
      color: "bg-slate-700 hover:bg-slate-600"
    },
    {
      id: "contact-data",
      name: "Contact Data",
      description: "Sync contact records",
      endpoint: `/api/sync/companies/${companyId}/contacts?userId=${userId}`,
      category: "data",
      icon: "👤",
      color: "bg-slate-700 hover:bg-slate-600"
    },
    {
      id: "deal-data",
      name: "Deal Data",
      description: "Sync deal records",
      endpoint: `/api/sync/companies/${companyId}/deals?userId=${userId}`,
      category: "data",
      icon: "🤝",
      color: "bg-slate-700 hover:bg-slate-600"
    },
    {
      id: "user-data",
      name: "User Data",
      description: "Sync user records",
      endpoint: `/api/sync/companies/${companyId}/users?userId=${userId}`,
      category: "data",
      icon: "👥",
      color: "bg-slate-700 hover:bg-slate-600"
    },
    // Tasks Sync
    {
      id: "company-tasks",
      name: "Company Tasks",
      description: "Sync all company tasks",
      endpoint: `/api/sync/companies/${companyId}/tasks?userId=${userId}`,
      category: "tasks",
      icon: "✅",
      color: "bg-slate-600 hover:bg-slate-500"
    },
    // Emails Sync
    {
      id: "company-emails",
      name: "Company Emails",
      description: "Sync all company emails",
      endpoint: `/api/sync/companies/${companyId}/emails?userId=${userId}`,
      category: "emails",
      icon: "📧",
      color: "bg-slate-600 hover:bg-slate-500"
    }
  ];

  const handleSync = async (operation: SyncOperation) => {
    try {
      setLoading(operation.id);
      setError(null);
      
      const response = await axios.post(`http://localhost:8080${operation.endpoint}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setResults(prev => ({
        ...prev,
        [operation.id]: {
          success: true,
          message: response.data.message || 'Sync initiated successfully',
          timestamp: new Date().toLocaleString()
        }
      }));
    } catch (err: any) {
      setError(`Failed to start ${operation.name} sync: ${err.response?.data?.message || err.message}`);
      setResults(prev => ({
        ...prev,
        [operation.id]: {
          success: false,
          message: err.response?.data?.message || err.message,
          timestamp: new Date().toLocaleString()
        }
      }));
    } finally {
      setLoading(null);
    }
  };


  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "properties": return "Property Definitions";
      case "data": return "Data Records";
      case "tasks": return "Tasks";
      case "emails": return "Emails";
      default: return "Other";
    }
  };

  const groupedOperations = syncOperations.reduce((acc, operation) => {
    if (!acc[operation.category]) {
      acc[operation.category] = [];
    }
    acc[operation.category].push(operation);
    return acc;
  }, {} as Record<string, SyncOperation[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Sync Control Panel</h1>
        <p className="text-slate-600">Trigger data synchronization operations for Company {companyId}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-500">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Operations by Category */}
      {Object.entries(groupedOperations).map(([category, operations]) => (
        <div key={category} className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <span className="mr-3">
                {category === "properties" && "🔧"}
                {category === "data" && "📊"}
                {category === "tasks" && "✅"}
                {category === "emails" && "📧"}
              </span>
              {getCategoryTitle(category)}
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operations.map((operation) => (
                <div key={operation.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{operation.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900">{operation.name}</h4>
                        <p className="text-sm text-slate-600">{operation.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSync(operation)}
                    disabled={loading === operation.id}
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-colors ${operation.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === operation.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Starting...
                      </span>
                    ) : (
                      "Start Sync"
                    )}
                  </button>
                  
                  {/* Result Display */}
                  {results[operation.id] && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      results[operation.id].success 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        <span className="mr-2">
                          {results[operation.id].success ? '✅' : '❌'}
                        </span>
                        <span className="font-medium">
                          {results[operation.id].success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-xs mt-1">{results[operation.id].message}</p>
                      <p className="text-xs opacity-75">{results[operation.id].timestamp}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Bulk Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-slate-900">Bulk Actions</h3>
        </div>
        <div className="card-content">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                // Trigger all property syncs
                syncOperations
                  .filter(op => op.category === "properties")
                  .forEach(op => handleSync(op));
              }}
              className="btn-primary"
            >
              🔧 Sync All Properties
            </button>
            <button
              onClick={() => {
                // Trigger all data syncs
                syncOperations
                  .filter(op => op.category === "data")
                  .forEach(op => handleSync(op));
              }}
              className="btn-secondary"
            >
              📊 Sync All Data
            </button>
            <button
              onClick={() => {
                // Trigger all syncs
                syncOperations.forEach(op => handleSync(op));
              }}
              className="btn-ghost"
            >
              🚀 Sync Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncControlPanel;
