import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDashboardPage from "./pages/CompaniesDashboardPage";

const App: React.FC = () => (
  <Router>
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-6">
        <Routes>
          <Route path="/" element={<Navigate to="/companies" replace />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:companyId/*" element={<CompanyDashboardPage />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-slate-300 mb-4">404</div>
                  <h1 className="text-2xl font-semibold text-slate-900 mb-2">Page Not Found</h1>
                  <p className="text-slate-600">The page you're looking for doesn't exist.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  </Router>
);

export default App;
