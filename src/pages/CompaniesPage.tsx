import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyList, { Company } from "../components/ui/CompanyList";

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    navigate(`/companies/${company.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Companies</h1>
          <p className="text-slate-600">Select a company to view its CRM data and sync operations</p>
        </div>

        {/* Company List Card */}
        <div className="card">
          <div className="card-content">
            <CompanyList
              selectedCompany={selectedCompany}
              onSelectCompany={handleSelectCompany}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
