// app/register/parent/child-form.tsx
"use client";

import {useState} from "react";
import OTPDialog from "../../../components/OTPDialog";

interface Props {
  onVerified: (child: any) => void;
  onCancel: () => void;
  apiKey: string;
}

export default function ChildForm({onVerified, onCancel, apiKey}: Props) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  const handleCreateAndSendOTP = async () => {
    if (password !== confirm) return alert("Passwords don't match");
    if (password.length < 8) return alert("Password too weak");

    await fetch(
      `${process.env.BASE_URL}/accounts/api/account/create/`,
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          account_type: "student",
          parent_profile_id: 1, // You can get this from parent login later
          admission_no: `STU-${Date.now().toString().slice(-6)}`,
          dob: "2015-01-01",
          classroom_id: 1,
          relationship: "Guardian",
        }),
      }
    );
    setShowOTP(true);
  };

  const handleVerify = async (code: string) => {
    const res = await fetch(
      "process.env.BASE_URL/accounts/api/auth/verify-email/",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, code}),
      }
    );

    if (res.ok) {
      onVerified({email, firstName, lastName, verified: true});
    } else {
      throw new Error("Invalid OTP");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Add Child (Student)</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input"
        />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="input"
        />
        <input
          type="email"
          placeholder="Child Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input md:col-span-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-xl">
          Cancel
        </button>
        <OTPDialog
          email={email}
          triggerText="Create & Send OTP"
          triggerDisabled={!email || !firstName || password !== confirm}
          onVerify={handleVerify}
          onTriggerClick={handleCreateAndSendOTP}
        />
      </div>
    </div>
  );
}
