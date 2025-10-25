// // components/ParentBiodataForm.tsx
// "use client";

// import {useState} from "react";

// interface ChildData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   isEmailVerified: boolean;
//   tempOtp?: string;
//   otpInput?: string;
// }

// interface ParentBiodataData {
//   children: ChildData[];
// }

// export default function ParentBiodataForm() {
//   const [formData, setFormData] = useState<ParentBiodataData>({
//     children: [],
//   });
//   const [addingChild, setAddingChild] = useState(false);
//   const [currentChild, setCurrentChild] = useState<ChildData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     isEmailVerified: false,
//   });

//   const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCurrentChild({
//       ...currentChild,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const sendOtp = (email: string) => {
//     if (!email) return;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     setCurrentChild({
//       ...currentChild,
//       tempOtp: otp,
//       otpInput: "",
//     });
//     // Simulate sending OTP
//     alert(`OTP sent to ${email}: ${otp}`); // In real app, send via API
//   };

//   const verifyOtp = () => {
//     if (currentChild.otpInput === currentChild.tempOtp) {
//       setCurrentChild({
//         ...currentChild,
//         isEmailVerified: true,
//       });
//       alert("Email verified successfully!");
//     } else {
//       alert("Invalid OTP");
//     }
//   };

//   const addChild = () => {
//     if (
//       !currentChild.isEmailVerified ||
//       !currentChild.firstName ||
//       !currentChild.lastName ||
//       !currentChild.email
//     ) {
//       alert("Please fill all fields and verify email");
//       return;
//     }
//     setFormData({
//       ...formData,
//       children: [
//         ...formData.children,
//         {...currentChild, tempOtp: undefined, otpInput: undefined},
//       ],
//     });
//     setCurrentChild({
//       firstName: "",
//       lastName: "",
//       email: "",
//       isEmailVerified: false,
//     });
//     setAddingChild(false);
//   };

//   const removeChild = (index: number) => {
//     const updatedChildren = formData.children.filter((_, i) => i !== index);
//     setFormData({
//       ...formData,
//       children: updatedChildren,
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (formData.children.length === 0) {
//       alert("Please add at least one child");
//       return;
//     }
//     // Simulate API call
//     console.log("Children data:", formData.children);
//     alert("Children registered successfully!");
//   };

//   return (
//     <div className="mt-8 space-y-6">
//       <h3 className="text-lg font-medium text-gray-900">
//         Register Your Children
//       </h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="border-t pt-4">
//           <h4 className="text-md font-medium text-gray-900 mb-4">
//             Children Registration
//           </h4>
//           {formData.children.length > 0 && (
//             <div className="space-y-4 mb-4">
//               {formData.children.map((child, index) => (
//                 <div key={index} className="border p-4 rounded-md bg-gray-50">
//                   <div className="flex justify-between items-center">
//                     <span>
//                       {child.firstName} {child.lastName} - {child.email}{" "}
//                       {child.isEmailVerified ? "(Verified)" : "(Pending)"}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => removeChild(index)}
//                       className="text-red-600 hover:text-red-800">
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           <button
//             type="button"
//             onClick={() => setAddingChild(!addingChild)}
//             className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//             {addingChild ? "Cancel" : "Add Child"}
//           </button>
//         </div>

//         {addingChild && (
//           <div className="border p-4 rounded-md bg-blue-50 space-y-4">
//             <h5 className="text-sm font-medium text-gray-900">
//               Student Registration
//             </h5>
//             <div>
//               <label
//                 htmlFor="firstName"
//                 className="block text-sm font-medium text-gray-700">
//                 First Name
//               </label>
//               <input
//                 id="firstName"
//                 name="firstName"
//                 type="text"
//                 required
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//                 value={currentChild.firstName}
//                 onChange={handleChildChange}
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="lastName"
//                 className="block text-sm font-medium text-gray-700">
//                 Last Name
//               </label>
//               <input
//                 id="lastName"
//                 name="lastName"
//                 type="text"
//                 required
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//                 value={currentChild.lastName}
//                 onChange={handleChildChange}
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//                 value={currentChild.email}
//                 onChange={handleChildChange}
//               />
//               {!currentChild.isEmailVerified && (
//                 <div className="mt-2 space-y-2">
//                   <button
//                     type="button"
//                     onClick={() => sendOtp(currentChild.email)}
//                     className="text-xs bg-indigo-600 text-white py-1 px-3 rounded">
//                     Send OTP
//                   </button>
//                   {currentChild.tempOtp && (
//                     <div className="flex space-x-2">
//                       <input
//                         type="text"
//                         placeholder="Enter OTP"
//                         className="w-20 px-2 py-1 border rounded"
//                         value={currentChild.otpInput || ""}
//                         onChange={(e) =>
//                           setCurrentChild({
//                             ...currentChild,
//                             otpInput: e.target.value,
//                           })
//                         }
//                       />
//                       <button
//                         type="button"
//                         onClick={verifyOtp}
//                         className="text-xs bg-green-600 text-white py-1 px-3 rounded">
//                         Verify
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//               {currentChild.isEmailVerified && (
//                 <p className="text-green-600 text-xs mt-1">Email verified</p>
//               )}
//             </div>
//             <button
//               type="button"
//               onClick={addChild}
//               disabled={!currentChild.isEmailVerified}
//               className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
//               Add This Child
//             </button>
//           </div>
//         )}

//         <button
//           type="submit"
//           className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
//           Submit Children Registration
//         </button>
//       </form>
//     </div>
//   );
// }

// components/ParentBiodataForm.tsx
"use client";

import {useState} from "react";

interface ChildData {
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  tempOtp?: string;
  otpInput?: string;
}

interface ParentBiodataData {
  children: ChildData[];
}

export default function ParentBiodataForm() {
  const [formData, setFormData] = useState<ParentBiodataData>({
    children: [],
  });
  const [addingChild, setAddingChild] = useState(false);
  const [currentChild, setCurrentChild] = useState<ChildData>({
    firstName: "",
    lastName: "",
    email: "",
    isEmailVerified: false,
  });

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentChild({
      ...currentChild,
      [e.target.name]: e.target.value,
    });
  };

  const sendOtp = (email: string) => {
    if (!email) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentChild({
      ...currentChild,
      tempOtp: otp,
      otpInput: "",
    });
    // Simulate sending OTP
    alert(`OTP sent to ${email}: ${otp}`); // In real app, send via API
  };

  const verifyOtp = () => {
    if (currentChild.otpInput === currentChild.tempOtp) {
      setCurrentChild({
        ...currentChild,
        isEmailVerified: true,
      });
      alert("Email verified successfully!");
    } else {
      alert("Invalid OTP");
    }
  };

  const addChild = () => {
    if (
      !currentChild.isEmailVerified ||
      !currentChild.firstName ||
      !currentChild.lastName ||
      !currentChild.email
    ) {
      alert("Please fill all fields and verify email");
      return;
    }
    setFormData({
      ...formData,
      children: [
        ...formData.children,
        {...currentChild, tempOtp: undefined, otpInput: undefined},
      ],
    });
    setCurrentChild({
      firstName: "",
      lastName: "",
      email: "",
      isEmailVerified: false,
    });
    setAddingChild(false);
  };

  const removeChild = (index: number) => {
    const updatedChildren = formData.children.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      children: updatedChildren,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.children.length === 0) {
      alert("Please add at least one child");
      return;
    }
    // Simulate API call
    console.log("Children data:", formData.children);
    alert("Children registered successfully!");
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Register Your Children
      </h3>
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700 mb-2">
          To add a child, click "Add Child", fill in their details, verify via
          email OTP, and click "Add This Child". You can add or remove children
          anytime.
        </p>
        <p className="text-sm text-gray-700">
          <strong>Benefits:</strong> Registering your children provides access
          to personalized learning plans, progress tracking, teacher
          communication, and a secure educational platform tailored to their
          needs.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Children Registration
          </h4>
          {formData.children.length > 0 && (
            <div className="space-y-4 mb-4">
              {formData.children.map((child, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span>
                      {child.firstName} {child.lastName} - {child.email}{" "}
                      {child.isEmailVerified ? "(Verified)" : "(Pending)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setAddingChild(!addingChild)}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            {addingChild ? "Cancel" : "Add Child"}
          </button>
        </div>

        {addingChild && (
          <div className="border p-4 rounded-md bg-blue-50 space-y-4">
            <h5 className="text-sm font-medium text-gray-900">
              Student Registration
            </h5>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentChild.firstName}
                onChange={handleChildChange}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentChild.lastName}
                onChange={handleChildChange}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={currentChild.email}
                onChange={handleChildChange}
              />
              {!currentChild.isEmailVerified && (
                <div className="mt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => sendOtp(currentChild.email)}
                    className="text-xs bg-indigo-600 text-white py-1 px-3 rounded">
                    Send OTP
                  </button>
                  {currentChild.tempOtp && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        className="w-20 px-2 py-1 border rounded"
                        value={currentChild.otpInput || ""}
                        onChange={(e) =>
                          setCurrentChild({
                            ...currentChild,
                            otpInput: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        className="text-xs bg-green-600 text-white py-1 px-3 rounded">
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              )}
              {currentChild.isEmailVerified && (
                <p className="text-green-600 text-xs mt-1">Email verified</p>
              )}
            </div>
            <button
              type="button"
              onClick={addChild}
              disabled={!currentChild.isEmailVerified}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              Add This Child
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Submit Children Registration
        </button>
      </form>
    </div>
  );
}
