// components/OTPDialog.tsx
"use client";

import {useState} from "react";

interface Props {
  email?: string;
  triggerText?: string;
  triggerDisabled?: boolean;
  onVerify: (code: string) => Promise<void>;
  onTriggerClick?: () => void;
}

export default function OTPDialog({
  email,
  triggerText = "Verify OTP",
  triggerDisabled,
  onVerify,
  onTriggerClick,
}: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      await onVerify(code);
      setOpen(false);
      setCode("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          onTriggerClick?.();
          setOpen(true);
        }}
        disabled={triggerDisabled}
        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50">
        {triggerText}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Enter OTP</h3>
            {email && (
              <p className="text-sm text-gray-600 mb-4">Sent to {email}</p>
            )}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full text-center text-3xl font-mono tracking-widest border-2 rounded-xl py-4 mb-4"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 border rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl disabled:opacity-50">
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
