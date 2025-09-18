import React from "react";
import SyncControlPanel from "../components/ui/SyncControlPanel";

interface SyncControlPageProps {
  companyId: string;
}

const SyncControlPage: React.FC<SyncControlPageProps> = ({ companyId }) => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <SyncControlPanel companyId={companyId} />
    </div>
  );
};

export default SyncControlPage;
