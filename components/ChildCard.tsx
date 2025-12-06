// components/ChildCard.tsx
import {CheckCircle2} from "lucide-react";

export default function ChildCard({child}: {child: any}) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200 hover:shadow-3xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
          VERIFIED
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{child.name}</h3>
      <p className="text-gray-600 mt-2">{child.email}</p>
      <p className="text-sm text-gray-500 mt-1">Born: {child.dob}</p>
      <div className="mt-6 bg-gray-100 px-6 py-4 rounded-2xl font-mono text-xl font-bold">
        {child.admissionNo}
      </div>
    </div>
  );
}
