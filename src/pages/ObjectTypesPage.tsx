import React from "react";
import ObjectTypeList from "../components/ui/ObjectTypeList";
import { useNavigate, useParams } from "react-router-dom";

const OBJECT_TYPES = ["contact", "deal", "email", "task"] as const;

const ObjectTypesPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  if (!companyId)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl font-semibold">Invalid Company ID</p>
      </div>
    );

  const handleSelectObject = (objectType: string) => {
    navigate(`/companies/${companyId}/objects/${objectType}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Object Types for Company ID: {companyId}
        </h1>
        <ObjectTypeList
          objectTypes={OBJECT_TYPES}
          selectedObject={null}
          onSelectObject={handleSelectObject}
        />
      </div>
    </div>
  );
};

export default ObjectTypesPage;
