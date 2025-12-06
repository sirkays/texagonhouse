// app/register/parent/page.tsx
"use client";

import {useState} from "react";
import OTPDialog from "../../../components/OTPDialog";
import ChildForm from "../parent/child-form";
import ChildCard from "../../../components/ChildCard";
import {createAccount, verifyOTP} from "@/lib/api";

interface Child {
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
}

export default function ParentRegister() {
  const [parentEmail, setParentEmail] = useState("");
  const [parentVerified, setParentVerified] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [showChildForm, setShowChildForm] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your-api-key-here";

  const handleParentOTPVerify = async (code: string) => {
    await verifyOTP(parentEmail, code, API_KEY);
    await createAccount(
      {
        email: parentEmail,
        password: Math.random().toString(36), // temp
        account_type: "parent",
      },
      API_KEY
    );
    setParentVerified(true);
  };

  const handleChildVerified = (child: Child) => {
    setChildren((prev) => [...prev, {...child, verified: true}]);
    setShowChildForm(false);
  };

  if (!parentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            Parent Registration
          </h1>
          <input
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="Your email (parent)"
            className="w-full px-5 py-4 border border-gray-300 rounded-xl text-lg focus:ring-4 focus:ring-indigo-300 outline-none mb-6"
          />
          <OTPDialog
            email={parentEmail}
            triggerText="Verify Parent Email First"
            onVerify={handleParentOTPVerify}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-8 text-center">
          <div className="text-6xl mb-4">Success</div>
          <h1 className="text-3xl font-bold">Parent Account Verified!</h1>
          <p className="text-gray-600 mt-4">Now add your children</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child, i) => (
            <ChildCard key={i} child={child} />
          ))}
        </div>

        {showChildForm ? (
          <ChildForm
            onVerified={handleChildVerified}
            onCancel={() => setShowChildForm(false)}
            apiKey={API_KEY}
          />
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowChildForm(true)}
              className="bg-indigo-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:bg-indigo-700 shadow-lg">
              + Add Child
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
