import React, { useState } from "react";

interface SyncControlProps {
  companyId: number;
  objectType: string;
  onSyncComplete: (log: any) => void;
}

const SyncControl: React.FC<SyncControlProps> = ({
  companyId,
  objectType,
  onSyncComplete,
}) => {
  const [syncing, setSyncing] = useState(false);

  const startSync = () => {
    setSyncing(true);
    fetch(`/api/companies/${companyId}/sync/${objectType}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((log) => onSyncComplete(log))
      .catch(console.error)
      .finally(() => setSyncing(false));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Sync {objectType}</h3>
          <p className="text-sm text-slate-600">
            Trigger synchronization for {objectType} data
          </p>
        </div>
        <button
          onClick={startSync}
          disabled={syncing}
          className="btn-primary"
        >
          {syncing ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Syncing...
            </span>
          ) : (
            "Start Sync"
          )}
        </button>
      </div>
    </div>
  );
};

export default SyncControl;
