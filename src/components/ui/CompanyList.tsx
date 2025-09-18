import React, { useEffect, useState } from "react";
import axios from "axios";

export interface Company {
  id: number;
  name: string;
}

interface CompanyListProps {
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({
  selectedCompany,
  onSelectCompany,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<Company[]>("http://localhost:8080/api/companies")
      .then((response) => {
        setCompanies(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("Failed fetching companies:", error);
        setError("Failed to load companies");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
          <span className="text-slate-600">Loading companies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Available Companies</h2>
        <span className="text-sm text-slate-500">{companies.length} companies</span>
      </div>
      
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">📋</div>
          <p className="text-slate-500">No companies found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {companies.map((company) => {
            const isSelected = selectedCompany?.id === company.id;
            return (
              <div
                key={company.id}
                onClick={() => onSelectCompany(company)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-white/20" : "bg-slate-100"
                    }`}>
                      <span className={`font-semibold ${
                        isSelected ? "text-white" : "text-slate-600"
                      }`}>
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}>
                        {company.name}
                      </h3>
                      <p className={`text-sm ${
                        isSelected ? "text-white/70" : "text-slate-500"
                      }`}>
                        Company ID: {company.id}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyList;
