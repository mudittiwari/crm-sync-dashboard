import React from "react";
import { NavLink, Routes, Route, useParams } from "react-router-dom";
import AccountsPage from "./AccountsPage";
import DealsPage from "./DealsPage";
import TasksPage from "./TasksPage";
import EmailsPage from "./EmailsPage";
import ContactsPage from "./ContactsPage";
import FieldMappingsPage from "./FieldMappingsPage";
import SyncJobsPage from "./SyncJobsPage";
import SyncControlPage from "./SyncControlPage";
import UsersPage from "./UsersPage";

// Simple overview component example
const CompanyOverviewPage: React.FC<{ companyId: string }> = ({ companyId }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Company {companyId} Dashboard</h1>
        <p className="text-slate-600">Welcome to the company workspace. Select a tab to view details.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">A</span>
              </div>
              <h3 className="font-semibold text-slate-900">Accounts</h3>
            </div>
            <p className="text-slate-600 text-sm">View and manage company accounts</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">D</span>
              </div>
              <h3 className="font-semibold text-slate-900">Deals</h3>
            </div>
            <p className="text-slate-600 text-sm">Track and manage sales deals</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">C</span>
              </div>
              <h3 className="font-semibold text-slate-900">Contacts</h3>
            </div>
            <p className="text-slate-600 text-sm">Manage contact information</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-semibold">U</span>
              </div>
              <h3 className="font-semibold text-slate-900">Users</h3>
            </div>
            <p className="text-slate-600 text-sm">View company users and permissions</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">S</span>
              </div>
              <h3 className="font-semibold text-slate-900">Sync Control</h3>
            </div>
            <p className="text-slate-600 text-sm">Manage data synchronization</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">J</span>
              </div>
              <h3 className="font-semibold text-slate-900">Sync Jobs</h3>
            </div>
            <p className="text-slate-600 text-sm">Monitor sync job history and status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const tabs = [
  { name: "Overview", path: "" },        // Note empty for index path
  { name: "Accounts", path: "accounts" },
  { name: "Deals", path: "deals" },
  { name: "Contacts", path: "contacts" },
  { name: "Users", path: "users" },
  { name: "Sync Control", path: "sync-control" },
  { name: "Sync Jobs", path: "sync-jobs" }
];

const CompanyDashboardPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return <p className="text-red-600 p-8">Invalid Company ID.</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Company Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C{companyId}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Company {companyId}</h1>
                <p className="text-slate-600">CRM Data Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                end={tab.path === ""}
                to={tab.path === ""
                  ? `/companies/${companyId}`
                  : `/companies/${companyId}/${tab.path}`
                }
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<CompanyOverviewPage companyId={companyId} />} />
          <Route path="accounts" element={<AccountsPage companyId={companyId} />} />
          <Route path="deals" element={<DealsPage companyId={companyId} />} />
          <Route path="contacts" element={<ContactsPage companyId={companyId} />} />
          <Route path="users" element={<UsersPage companyId={companyId} />} />
          <Route path="sync-control" element={<SyncControlPage companyId={companyId} />} />
          <Route path="sync-jobs" element={<SyncJobsPage companyId={companyId} />} />
          <Route path="tasks" element={<TasksPage companyId={companyId} />} />
          <Route path="emails" element={<EmailsPage companyId={companyId} />} />
          <Route path="emails/account/:accountId" element={<EmailsPage companyId={companyId} />} />
          <Route path="emails/deal/:dealId" element={<EmailsPage companyId={companyId} />} />
          <Route path="tasks/account/:accountId" element={<TasksPage companyId={companyId} />} />
          <Route path="tasks/deal/:dealId" element={<TasksPage companyId={companyId} />} />
          <Route path="field-mappings/:objectType" element={<FieldMappingsPage companyId={companyId} />} />
          <Route path="*" element={<p className="text-red-600">Tab Not Found</p>} />
        </Routes>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
