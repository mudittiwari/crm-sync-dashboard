import React, { useState } from "react";
import FieldMappingTable from "../components/ui/FieldMappingTable";
import SyncControl from "../components/ui/SyncControl";
import SelectiveSyncPanel from "../components/ui/SelectiveSyncPanel";
import { useParams } from "react-router-dom";

const FieldMappingsPage: React.FC = () => {
  const { companyId, objectType } = useParams<{ companyId: string; objectType: string }>();
  const [syncLog, setSyncLog] = useState<any>(null);

  if (!companyId || !objectType)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Invalid URL Parameters</h1>
          <p className="text-slate-600">Company ID or Object Type is missing from the URL.</p>
        </div>
      </div>
    );

  const getObjectTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Field Mappings - {getObjectTypeDisplayName(objectType)}
        </h1>
        <p className="text-slate-600">
          Manage field mappings and synchronization for Company {companyId}
        </p>
      </div>

      {/* Field Mapping Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-900">Field Mappings</h2>
          <p className="text-slate-600 text-sm">
            Configure how {getObjectTypeDisplayName(objectType)} fields are mapped between systems
          </p>
        </div>
        <div className="card-content">
          <FieldMappingTable companyId={parseInt(companyId)} objectType={objectType} />
        </div>
      </div>

      {/* Sync Control */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-900">Sync Control</h2>
          <p className="text-slate-600 text-sm">
            Trigger synchronization operations for {getObjectTypeDisplayName(objectType)} data
          </p>
        </div>
        <div className="card-content">
          <SyncControl
            companyId={parseInt(companyId)}
            objectType={objectType}
            onSyncComplete={(log) => setSyncLog(log)}
          />
        </div>
      </div>

      {/* Sync Log */}
      {syncLog && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-slate-900">Last Sync Log</h3>
            <p className="text-slate-600 text-sm">Details from the most recent synchronization</p>
          </div>
          <div className="card-content">
            <div className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(syncLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMappingsPage;
