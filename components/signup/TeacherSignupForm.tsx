// // "use client";

// // import {useState} from "react";

// // interface TeacherSignupFormProps {
// //   onComplete: () => void;
// // }

// // interface TeacherSignupData {
// //   firstName: string;
// //   lastName: string;
// //   email: string;
// //   password: string;
// //   confirmPassword: string;
// //   phone: string;
// //   address: string;
// // }

// // export default function TeacherSignupForm({
// //   onComplete,
// // }: TeacherSignupFormProps) {
// //   const [formData, setFormData] = useState<TeacherSignupData>({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     password: "",
// //     confirmPassword: "",
// //     phone: "",
// //     address: "",
// //   });

// //   const [error, setError] = useState<string>("");
// //   const [passwordStrength, setPasswordStrength] = useState<
// //     "weak" | "medium" | "strong"
// //   >("weak");

// //   const requirementsState = {
// //     hasLowercase: false,
// //     hasUppercase: false,
// //     hasNumber: false,
// //     hasSpecial: false,
// //   };
// //   const [requirements, setRequirements] = useState(requirementsState);

// //   const [emailVerified, setEmailVerified] = useState(false);
// //   const [showOtpDialog, setShowOtpDialog] = useState(false);
// //   const [otpInput, setOtpInput] = useState("");

// //   // New states for Send OTP button
// //   const [isSendingOtp, setIsSendingOtp] = useState(false);
// //   const [otpSentMessage, setOtpSentMessage] = useState(false);
// //   const [isVerifying, setIsVerifying] = useState(false);

// //   // Password strength checker
// //   const checkPasswordStrength = (password: string) => {
// //     const hasLowercase = /[a-z]/.test(password);
// //     const hasUppercase = /[A-Z]/.test(password);
// //     const hasNumber = /\d/.test(password);
// //     const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

// //     setRequirements({hasLowercase, hasUppercase, hasNumber, hasSpecial});

// //     const metCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(
// //       Boolean
// //     ).length;
// //     if (metCount >= 4) setPasswordStrength("strong");
// //     else if (metCount >= 3) setPasswordStrength("medium");
// //     else setPasswordStrength("weak");
// //   };

// //   // Handle Send OTP with loading → success → open modal
// //   const requestOtp = async () => {
// //     setError("");
// //     setIsSendingOtp(true);
// //     setOtpSentMessage(false);

// //     try {
// //       const apiData = {
// //         first_name: formData.firstName,
// //         last_name: formData.lastName,
// //         email: formData.email,
// //         password: formData.password,
// //         phone: formData.phone,
// //         primary_org_id: 1, // Hardcoded as per API examples; adjust if needed
// //         account_type: "teacher",
// //       };

// //       const response = await fetch("/api/accounts/create", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(apiData),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         setError(data.detail || "Account creation failed");
// //         return;
// //       }

// //       // On success, OTP is sent by backend
// //       setOtpSentMessage(true);

// //       // Auto show OTP modal after "sent" message
// //       setTimeout(() => {
// //         setShowOtpDialog(true);
// //         setOtpInput("");
// //       }, 800);
// //     } catch (err) {
// //       setError("An error occurred during account creation");
// //     } finally {
// //       setIsSendingOtp(false);
// //     }
// //   };

// //   // Verify OTP
// //   const handleVerifyOtp = async () => {
// //     if (otpInput.trim().length !== 6) {
// //       setError("Please enter a valid 6-digit OTP");
// //       return;
// //     }

// //     setError("");
// //     setIsVerifying(true);

// //     try {
// //       const response = await fetch("/api/accounts/verify", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           email: formData.email,
// //           code: otpInput,
// //         }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         setError(data.detail || "Invalid OTP or verification failed");
// //         return;
// //       }

// //       // On success
// //       setEmailVerified(true);
// //       setShowOtpDialog(false);
// //       setOtpInput("");
// //       setOtpSentMessage(false); // Clear message after verification
// //     } catch (err) {
// //       setError("An error occurred during verification");
// //     } finally {
// //       setIsVerifying(false);
// //     }
// //   };

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setError("");

// //     if (!emailVerified) {
// //       setError("Please verify your email with OTP");
// //       return;
// //     }

// //     // Since account is already created during OTP request, just complete
// //     onComplete();
// //   };

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const {name, value} = e.target;
// //     setFormData((prev) => ({...prev, [name]: value}));
// //     setError("");

// //     if (name === "password") {
// //       checkPasswordStrength(value);
// //     }
// //   };

// //   const isSendOtpDisabled =
// //     isSendingOtp ||
// //     !formData.firstName ||
// //     !formData.lastName ||
// //     !formData.email.includes("@") ||
// //     !formData.password ||
// //     formData.password !== formData.confirmPassword ||
// //     passwordStrength !== "strong";

// //   return (
// //     <>
// //       <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
// //         {/* First Name */}
// //         <div>
// //           <label
// //             htmlFor="firstName"
// //             className="block text-sm font-medium text-gray-700">
// //             First Name
// //           </label>
// //           <input
// //             id="firstName"
// //             name="firstName"
// //             type="text"
// //             required
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
// //             placeholder="Enter your first name"
// //             value={formData.firstName}
// //             onChange={handleChange}
// //           />
// //         </div>

// //         {/* Last Name */}
// //         <div>
// //           <label
// //             htmlFor="lastName"
// //             className="block text-sm font-medium text-gray-700">
// //             Last Name
// //           </label>
// //           <input
// //             id="lastName"
// //             name="lastName"
// //             type="text"
// //             required
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
// //             placeholder="Enter your last name"
// //             value={formData.lastName}
// //             onChange={handleChange}
// //           />
// //         </div>

// //         <div>
// //           <label
// //             htmlFor="phone"
// //             className="block text-sm font-medium text-gray-700">
// //             Phone
// //           </label>
// //           <input
// //             id="phone"
// //             name="phone"
// //             type="tel"
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
// //             placeholder="e.g. +2348000000000"
// //             value={formData.phone}
// //             onChange={handleChange}
// //           />
// //         </div>

// //         <div>
// //           <label
// //             htmlFor="address"
// //             className="block text-sm font-medium text-gray-700">
// //             Address
// //           </label>
// //           <input
// //             id="address"
// //             name="address"
// //             type="text"
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
// //             placeholder="Enter your address"
// //             value={formData.address}
// //             onChange={handleChange}
// //           />
// //         </div>

// //         {/* Email + OTP Section */}
// //         <div>
// //           <label
// //             htmlFor="email"
// //             className="block text-sm font-medium text-gray-700">
// //             Email address
// //           </label>
// //           <input
// //             id="email"
// //             name="email"
// //             type="email"
// //             required
// //             disabled={emailVerified}
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm disabled:bg-gray-100"
// //             placeholder="Enter your email"
// //             value={formData.email}
// //             onChange={handleChange}
// //           />

// //           <div className="mt-3">
// //             {!emailVerified ? (
// //               <>
// //                 {otpSentMessage ? (
// //                   <p className="text-green-600 text-sm font-medium flex items-center animate-fade-in">
// //                     <span className="mr-2">Sent</span> OTP sent! Check your
// //                     email
// //                   </p>
// //                 ) : (
// //                   <button
// //                     type="button"
// //                     onClick={requestOtp}
// //                     disabled={isSendOtpDisabled}
// //                     className="text-xs bg-[#f79771] text-white py-2 px-5 rounded hover:bg-[#f58667] disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-2">
// //                     {isSendingOtp ? (
// //                       <>
// //                         <svg
// //                           className="animate-spin h-4 w-4"
// //                           viewBox="0 0 24 24">
// //                           <circle
// //                             className="opacity-25"
// //                             cx="12"
// //                             cy="12"
// //                             r="10"
// //                             stroke="currentColor"
// //                             strokeWidth="4"
// //                             fill="none"
// //                           />
// //                           <path
// //                             className="opacity-75"
// //                             fill="currentColor"
// //                             d="M4 12a8 8 0 018-8v8z"
// //                           />
// //                         </svg>
// //                         Sending...
// //                       </>
// //                     ) : (
// //                       "Send OTP"
// //                     )}
// //                   </button>
// //                 )}
// //               </>
// //             ) : (
// //               <p className="text-green-600 text-sm font-medium flex items-center">
// //                 <span className="mr-2">Checkmark</span> Email verified
// //               </p>
// //             )}
// //           </div>
// //         </div>

// //         {/* Password Fields */}
// //         <div>
// //           <label
// //             htmlFor="password"
// //             className="block text-sm font-medium text-gray-700">
// //             Password
// //           </label>
// //           <input
// //             id="password"
// //             name="password"
// //             type="password"
// //             required
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
// //             placeholder="Create a strong password"
// //             value={formData.password}
// //             onChange={handleChange}
// //           />
// //           <div className="mt-3 space-y-1 text-xs">
// //             {(
// //               [
// //                 "hasLowercase",
// //                 "hasUppercase",
// //                 "hasNumber",
// //                 "hasSpecial",
// //               ] as const
// //             ).map((key) => {
// //               const met = requirements[key];
// //               const labels: Record<string, string> = {
// //                 hasLowercase: "One lowercase letter",
// //                 hasUppercase: "One uppercase letter",
// //                 hasNumber: "One number",
// //                 hasSpecial: "One special character (!@#$ etc.)",
// //               };
// //               return (
// //                 <div
// //                   key={key}
// //                   className={`flex items-center ${
// //                     met ? "text-green-600" : "text-gray-500"
// //                   }`}>
// //                   <span
// //                     className={`w-2 h-2 rounded-full mr-2 ${
// //                       met ? "bg-green-600" : "bg-gray-300"
// //                     }`}
// //                   />
// //                   {labels[key]}
// //                 </div>
// //               );
// //             })}
// //             <div
// //               className={`font-semibold mt-2 ${
// //                 passwordStrength === "strong"
// //                   ? "text-green-600"
// //                   : passwordStrength === "medium"
// //                   ? "text-yellow-600"
// //                   : "text-red-600"
// //               }`}>
// //               Password strength: {passwordStrength}
// //             </div>
// //           </div>
// //         </div>

// //         <div>
// //           <label
// //             htmlFor="confirmPassword"
// //             className="block text-sm font-medium text-gray-700">
// //             Confirm Password
// //           </label>
// //           <input
// //             id="confirmPassword"
// //             name="confirmPassword"
// //             type="password"
// //             required
// //             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
// //             placeholder="Confirm your password"
// //             value={formData.confirmPassword}
// //             onChange={handleChange}
// //           />
// //         </div>

// //         {/* Global Error */}
// //         {error && <p className="text-red-600 text-sm -mt-4">{error}</p>}

// //         {/* Submit */}
// //         <button
// //           type="submit"
// //           disabled={!emailVerified}
// //           className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition">
// //           Sign up as Teacher
// //         </button>
// //       </form>

// //       {/* OTP Modal */}
// //       {showOtpDialog && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //           <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
// //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
// //               Verify Your Email
// //             </h3>
// //             <p className="text-sm text-gray-600 mb-4">
// //               Enter the 6-digit code sent to <strong>{formData.email}</strong>
// //             </p>
// //             <input
// //               type="text"
// //               maxLength={6}
// //               placeholder="000000"
// //               value={otpInput}
// //               onChange={(e) =>
// //                 setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
// //               }
// //               className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f79771] focus:border-[#f79771]"
// //               autoFocus
// //             />
// //             <div className="mt-6 flex justify-end gap-3">
// //               <button
// //                 type="button"
// //                 onClick={() => {
// //                   setShowOtpDialog(false);
// //                   setOtpInput("");
// //                   setError("");
// //                 }}
// //                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
// //                 Cancel
// //               </button>
// //               <button
// //                 type="button"
// //                 onClick={handleVerifyOtp}
// //                 disabled={isVerifying}
// //                 className="px-6 py-2 text-sm font-medium text-white bg-[#f79771] rounded hover:bg-[#f58667] disabled:opacity-70">
// //                 {isVerifying ? "Verifying..." : "Verify"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// "use client";

// import {useState} from "react";

// interface TeacherSignupFormProps {
//   onComplete: () => void;
// }

// interface TeacherSignupData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phone: string;
//   address: string;
// }

// export default function TeacherSignupForm({
//   onComplete,
// }: TeacherSignupFormProps) {
//   const [formData, setFormData] = useState<TeacherSignupData>({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     phone: "",
//     address: "",
//   });

//   const [error, setError] = useState<string>("");
//   const [passwordStrength, setPasswordStrength] = useState<
//     "weak" | "medium" | "strong"
//   >("weak");

//   const requirementsState = {
//     hasLowercase: false,
//     hasUppercase: false,
//     hasNumber: false,
//     hasSpecial: false,
//   };
//   const [requirements, setRequirements] = useState(requirementsState);

//   const [emailVerified, setEmailVerified] = useState(false);
//   const [showOtpDialog, setShowOtpDialog] = useState(false);
//   const [otpInput, setOtpInput] = useState("");

//   // New states for Send OTP button
//   const [isSendingOtp, setIsSendingOtp] = useState(false);
//   const [otpSentMessage, setOtpSentMessage] = useState(false);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [userId, setUserId] = useState<number | null>(null);

//   // Password strength checker
//   const checkPasswordStrength = (password: string) => {
//     const hasLowercase = /[a-z]/.test(password);
//     const hasUppercase = /[A-Z]/.test(password);
//     const hasNumber = /\d/.test(password);
//     const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

//     setRequirements({hasLowercase, hasUppercase, hasNumber, hasSpecial});

//     const metCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(
//       Boolean
//     ).length;
//     if (metCount >= 4) setPasswordStrength("strong");
//     else if (metCount >= 3) setPasswordStrength("medium");
//     else setPasswordStrength("weak");
//   };

//   // Handle Send OTP with loading → success → open modal
//   const requestOtp = async () => {
//     setError("");
//     setIsSendingOtp(true);
//     setOtpSentMessage(false);

//     try {
//       // Format data according to API specification
//       const apiData = {
//         first_name: formData.firstName.trim(),
//         last_name: formData.lastName.trim(),
//         email: formData.email.trim().toLowerCase(),
//         password: formData.password,
//         phone: formData.phone.trim(),
//         primary_org_id: 1, // Hardcoded as per your example
//         account_type: "teacher",
//         // Address is not included for teacher accounts according to API spec
//       };

//       const response = await fetch("/api/accounts/create", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(apiData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         // Handle API errors
//         if (data.detail) {
//           if (typeof data.detail === "object") {
//             // If detail is an object with field-specific errors
//             const errorMessages = Object.entries(data.detail)
//               .map(
//                 ([field, errors]) =>
//                   `${field}: ${
//                     Array.isArray(errors) ? errors.join(", ") : errors
//                   }`
//               )
//               .join("; ");
//             setError(errorMessages);
//           } else {
//             // If detail is a string
//             setError(data.detail);
//           }
//         } else {
//           setError("Account creation failed");
//         }
//         return;
//       }

//       // On success, store user ID and show OTP modal
//       if (data.userId) {
//         setUserId(data.userId);
//         setOtpSentMessage(true);

//         // Auto show OTP modal after "sent" message
//         setTimeout(() => {
//           setShowOtpDialog(true);
//           setOtpInput("");
//         }, 800);
//       } else {
//         setError("Account created but no user ID returned");
//       }
//     } catch (err) {
//       console.error("Account creation error:", err);
//       setError("An error occurred during account creation");
//     } finally {
//       setIsSendingOtp(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (otpInput.trim().length !== 6) {
//       setError("Please enter a valid 6-digit OTP");
//       return;
//     }

//     setError("");
//     setIsVerifying(true);

//     try {
//       const response = await fetch("/api/accounts/verify", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email.trim().toLowerCase(),
//           code: otpInput.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         if (data.detail) {
//           setError(data.detail);
//         } else {
//           setError("Invalid OTP or verification failed");
//         }
//         return;
//       }

//       // On success
//       if (data.emailVerified === true) {
//         setEmailVerified(true);
//         setShowOtpDialog(false);
//         setOtpInput("");
//         setOtpSentMessage(false);
//       } else {
//         setError("Verification failed - email not verified");
//       }
//     } catch (err) {
//       console.error("Verification error:", err);
//       setError("An error occurred during verification");
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!emailVerified) {
//       setError("Please verify your email with OTP");
//       return;
//     }

//     // Since account is already created during OTP request, just complete
//     onComplete();
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const {name, value} = e.target;
//     setFormData((prev) => ({...prev, [name]: value}));
//     setError("");

//     if (name === "password") {
//       checkPasswordStrength(value);
//     }
//   };

//   const isSendOtpDisabled =
//     isSendingOtp ||
//     !formData.firstName.trim() ||
//     !formData.lastName.trim() ||
//     !formData.email.includes("@") ||
//     !formData.email.includes(".") ||
//     !formData.password ||
//     formData.password !== formData.confirmPassword ||
//     passwordStrength !== "strong" ||
//     formData.password.length < 8;

//   return (
//     <>
//       <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//         {/* First Name */}
//         <div>
//           <label
//             htmlFor="firstName"
//             className="block text-sm font-medium text-gray-700">
//             First Name
//           </label>
//           <input
//             id="firstName"
//             name="firstName"
//             type="text"
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
//             placeholder="Enter your first name"
//             value={formData.firstName}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Last Name */}
//         <div>
//           <label
//             htmlFor="lastName"
//             className="block text-sm font-medium text-gray-700">
//             Last Name
//           </label>
//           <input
//             id="lastName"
//             name="lastName"
//             type="text"
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
//             placeholder="Enter your last name"
//             value={formData.lastName}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Phone - API expects E.164 format */}
//         <div>
//           <label
//             htmlFor="phone"
//             className="block text-sm font-medium text-gray-700">
//             Phone (E.164 format recommended)
//           </label>
//           <input
//             id="phone"
//             name="phone"
//             type="tel"
//             required
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
//             placeholder="e.g. +2348000000000"
//             value={formData.phone}
//             onChange={handleChange}
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             Use E.164 format with country code
//           </p>
//         </div>

//         {/* Address - Optional for teacher according to API */}
//         <div>
//           <label
//             htmlFor="address"
//             className="block text-sm font-medium text-gray-700">
//             Address (Optional)
//           </label>
//           <input
//             id="address"
//             name="address"
//             type="text"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
//             placeholder="Enter your address"
//             value={formData.address}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Email + OTP Section */}
//         <div>
//           <label
//             htmlFor="email"
//             className="block text-sm font-medium text-gray-700">
//             Email address
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             required
//             disabled={emailVerified}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm disabled:bg-gray-100"
//             placeholder="Enter your email"
//             value={formData.email}
//             onChange={handleChange}
//           />

//           <div className="mt-3">
//             {!emailVerified ? (
//               <>
//                 {otpSentMessage ? (
//                   <p className="text-green-600 text-sm font-medium flex items-center animate-fade-in">
//                     <span className="mr-2">✓</span> OTP sent! Check your email
//                   </p>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={requestOtp}
//                     disabled={isSendOtpDisabled}
//                     className="text-xs bg-[#f79771] text-white py-2 px-5 rounded hover:bg-[#f58667] disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-2">
//                     {isSendingOtp ? (
//                       <>
//                         <svg
//                           className="animate-spin h-4 w-4"
//                           viewBox="0 0 24 24">
//                           <circle
//                             className="opacity-25"
//                             cx="12"
//                             cy="12"
//                             r="10"
//                             stroke="currentColor"
//                             strokeWidth="4"
//                             fill="none"
//                           />
//                           <path
//                             className="opacity-75"
//                             fill="currentColor"
//                             d="M4 12a8 8 0 018-8v8z"
//                           />
//                         </svg>
//                         Sending...
//                       </>
//                     ) : (
//                       "Send OTP"
//                     )}
//                   </button>
//                 )}
//               </>
//             ) : (
//               <p className="text-green-600 text-sm font-medium flex items-center">
//                 <span className="mr-2">✓</span> Email verified
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Password Fields */}
//         <div>
//           <label
//             htmlFor="password"
//             className="block text-sm font-medium text-gray-700">
//             Password (min 8 characters)
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             required
//             minLength={8}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
//             placeholder="Create a strong password"
//             value={formData.password}
//             onChange={handleChange}
//           />
//           <div className="mt-3 space-y-1 text-xs">
//             {(
//               [
//                 "hasLowercase",
//                 "hasUppercase",
//                 "hasNumber",
//                 "hasSpecial",
//               ] as const
//             ).map((key) => {
//               const met = requirements[key];
//               const labels: Record<string, string> = {
//                 hasLowercase: "One lowercase letter",
//                 hasUppercase: "One uppercase letter",
//                 hasNumber: "One number",
//                 hasSpecial: "One special character (!@#$ etc.)",
//               };
//               return (
//                 <div
//                   key={key}
//                   className={`flex items-center ${
//                     met ? "text-green-600" : "text-gray-500"
//                   }`}>
//                   <span
//                     className={`w-2 h-2 rounded-full mr-2 ${
//                       met ? "bg-green-600" : "bg-gray-300"
//                     }`}
//                   />
//                   {labels[key]}
//                 </div>
//               );
//             })}
//             <div
//               className={`font-semibold mt-2 ${
//                 passwordStrength === "strong"
//                   ? "text-green-600"
//                   : passwordStrength === "medium"
//                   ? "text-yellow-600"
//                   : "text-red-600"
//               }`}>
//               Password strength: {passwordStrength}
//             </div>
//           </div>
//         </div>

//         <div>
//           <label
//             htmlFor="confirmPassword"
//             className="block text-sm font-medium text-gray-700">
//             Confirm Password
//           </label>
//           <input
//             id="confirmPassword"
//             name="confirmPassword"
//             type="password"
//             required
//             minLength={8}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
//             placeholder="Confirm your password"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Global Error */}
//         {error && (
//           <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//             <p className="text-red-600 text-sm">{error}</p>
//           </div>
//         )}

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={!emailVerified}
//           className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition">
//           Sign up as Teacher
//         </button>
//       </form>

//       {/* OTP Modal */}
//       {showOtpDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               Verify Your Email
//             </h3>
//             <p className="text-sm text-gray-600 mb-4">
//               Enter the 6-digit code sent to <strong>{formData.email}</strong>
//             </p>
//             <input
//               type="text"
//               maxLength={6}
//               placeholder="000000"
//               value={otpInput}
//               onChange={(e) =>
//                 setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
//               }
//               className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f79771] focus:border-[#f79771]"
//               autoFocus
//             />

//             {/* OTP Instructions */}
//             <p className="text-xs text-gray-500 mt-3">
//               Check your spam folder if you don't see the email
//             </p>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowOtpDialog(false);
//                   setOtpInput("");
//                   setError("");
//                 }}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleVerifyOtp}
//                 disabled={isVerifying || otpInput.length !== 6}
//                 className="px-6 py-2 text-sm font-medium text-white bg-[#f79771] rounded hover:bg-[#f58667] disabled:opacity-70">
//                 {isVerifying ? "Verifying..." : "Verify"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import {useState} from "react";

interface TeacherSignupFormProps {
  onComplete: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export default function TeacherSignupForm({
  onComplete,
}: TeacherSignupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [error, setError] = useState<string>("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const length = pwd.length >= 8;

    const score = [hasLower, hasUpper, hasNumber, hasSpecial, length].filter(
      Boolean
    ).length;
    if (score === 5) return "strong";
    if (score >= 3) return "medium";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // === Send OTP + Create Account ===
  const sendOtp = async () => {
    setError("");
    setIsSendingOtp(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        primary_org_id: 1, // Change if dynamic
        account_type: "teacher" as const,
        // DO NOT send `address` — not allowed for teacher accounts
      };

      const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          typeof data.detail === "string"
            ? data.detail
            : data.detail
            ? Object.values(data.detail).flat().join(", ")
            : "Failed to create account";
        setError(errMsg);
        return;
      }

      // Success → OTP sent by backend
      setOtpSent(true);
      setTimeout(() => setShowOtpModal(true), 600);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // === Verify OTP ===
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/accounts/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid or expired code");
        return;
      }

      if (data.emailVerified === true) {
        setEmailVerified(true);
        setShowOtpModal(false);
        setOtp("");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // === Final Submit (after verification) ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified) {
      setError("Please verify your email first");
      return;
    }
    onComplete(); // Account is already active → proceed to dashboard/login
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    setError("");
  };

  // Disable "Send OTP" until form is valid
  const canSendOtp =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.includes("@") &&
    formData.email.includes(".") &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    passwordStrength === "strong";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#f79771] focus:ring-[#f79771]"
            placeholder="John"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#f79771] focus:ring-[#f79771]"
            placeholder="Doe"
          />
        </div>

        {/* Phone (Optional but recommended) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#f79771] focus:ring-[#f79771]"
            placeholder="+2348012345678"
          />
          <p className="text-xs text-gray-500 mt-1">Use international format</p>
        </div>

        {/* Email + OTP Trigger */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            disabled={emailVerified}
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 focus:border-[#f79771] focus:ring-[#f79771]"
            placeholder="teacher@school.com"
          />

          <div className="mt-3">
            {emailVerified ? (
              <p className="text-sm text-green-600 font-medium">
                Email verified successfully
              </p>
            ) : otpSent ? (
              <p className="text-sm text-green-600 font-medium">
                OTP sent! Check your inbox
              </p>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={!canSendOtp || isSendingOtp}
                className="inline-flex items-center gap-2 rounded bg-[#f79771] px-4 py-2 text-sm font-medium text-white hover:bg-[#f58667] disabled:opacity-60">
                {isSendingOtp ? <>Sending OTP...</> : "Send Verification Code"}
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#f79771] focus:ring-[#f79771]"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#f79771] focus:ring-[#f79771]"
          />
          {formData.password &&
            formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                Passwords do not match
              </p>
            )}
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="text-xs">
            <span
              className={`font-medium ${
                passwordStrength === "strong"
                  ? "text-green-600"
                  : passwordStrength === "medium"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
              Strength: {passwordStrength}
            </span>
            <span className="text-gray-500 ml-2">
              Must have uppercase, lowercase, number, special char & ≥8 length
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Final Submit */}
        <button
          type="submit"
          disabled={!emailVerified}
          className="w-full rounded-md bg-[#f79771] py-3 text-white font-medium hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition">
          Complete Registration
        </button>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Enter Verification Code
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </p>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="mt-5 block w-full rounded-md border border-gray-300 px-4 py-4 text-center text-2xl font-mono tracking-widest focus:border-[#f79771] focus:ring-[#f79771]"
              placeholder="000000"
              autoFocus
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setError("");
                }}
                className="rounded px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={isVerifying || otp.length !== 6}
                className="rounded bg-[#f79771] px-6 py-2 text-sm font-medium text-white hover:bg-[#f58667] disabled:opacity-60">
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
