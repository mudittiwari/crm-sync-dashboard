import React from "react";

interface ObjectTypeListProps {
  objectTypes: readonly string[];
  selectedObject: string | null;
  onSelectObject: (objectType: string) => void;
}

const ObjectTypeList: React.FC<ObjectTypeListProps> = ({
  objectTypes,
  selectedObject,
  onSelectObject,
}) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Objects</h2>
      <ul className="divide-y divide-gray-200">
        {objectTypes.map((obj) => {
          const isSelected = selectedObject === obj;
          return (
            <li
              key={obj}
              onClick={() => onSelectObject(obj)}
              className={`cursor-pointer px-4 py-3 transition 
                ${
                  isSelected
                    ? "bg-indigo-600 text-white font-bold rounded-lg"
                    : "hover:bg-indigo-50"
                }`}
            >
              {obj.charAt(0).toUpperCase() + obj.slice(1)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ObjectTypeList;
