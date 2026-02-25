// "use client";

// import {useState, useEffect, useCallback, useRef} from "react";
// import {Mail, Lock, Eye, EyeOff} from "lucide-react";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import {Spinner} from "@/components/ui/spinner";
// import {signIn, useSession} from "next-auth/react";
// import {useRouter, useSearchParams} from "next/navigation";
// import Image from "next/image";
// import {ro} from "date-fns/locale";

// interface AnimatedWordsProps {
//   text: string;
//   startDelay?: number;
//   delayIncrement?: number;
//   splitType?: "word" | "letter";
//   wordStyle?: React.CSSProperties;
//   className?: string;
//   animate?: boolean;
// }

// function AnimatedWords({
//   text,
//   startDelay = 0,
//   delayIncrement = 0.2,
//   splitType = "letter",
//   wordStyle = {},
//   className = "",
//   animate = true,
// }: AnimatedWordsProps) {
//   const items =
//     splitType === "word" ? text.split(/\s+/).filter((w) => w) : text.split("");
//   return (
//     <>
//       {items.map((item, index) => (
//         <span
//           key={index}
//           className={`inline-block ${animate ? "opacity-0 animate-[fadeInBounce_1s_forwards]" : ""} ${className}`}
//           style={{
//             ...wordStyle,
//             ...(animate
//               ? {animationDelay: `${startDelay + index * delayIncrement}s`}
//               : {}),
//           }}>
//           {splitType === "letter" ? (item === " " ? "\u00A0" : item) : item}
//           {splitType === "word" && index < items.length - 1 ? "\u00A0" : ""}
//         </span>
//       ))}
//     </>
//   );
// }

// export default function LoginContent() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loginError, setLoginError] = useState("");
//   const [forgotError, setForgotError] = useState("");
//   const [loginLoading, setLoginLoading] = useState(false);
//   const [forgotLoading, setForgotLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showDialog, setShowDialog] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState("");
//   const [pastEmails, setPastEmails] = useState<string[]>([]);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [forgotSuggestions, setForgotSuggestions] = useState<string[]>([]);
//   const [showForgotSuggestions, setShowForgotSuggestions] = useState(false);
//   const {data: session, status} = useSession();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const resetSuccess = searchParams.get("reset") === "success";
//   const [shouldAnimate, setShouldAnimate] = useState(false);

//   // Add custom keyframe animation
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//       @keyframes fadeInBounce {
//         0% {
//           opacity: 0;
//           transform: translateY(-20px);
//         }
//         60% {
//           opacity: 1;
//           transform: translateY(5px);
//         }
//         100% {
//           opacity: 1;
//           transform: translateY(0);
//         }
//       }
//     `;
//     document.head.appendChild(style);
//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

//   // Detect navigation type for animation control
//   useEffect(() => {
//     const navEntries = performance.getEntriesByType("navigation");
//     if (navEntries.length > 0) {
//       const navType = (navEntries[0] as PerformanceNavigationTiming).type;
//       if (navType === "reload" || navType === "navigate") {
//         setShouldAnimate(true);
//       }
//     } else {
//       // Fallback for browsers without support
//       setShouldAnimate(true);
//     }
//   }, []);

//   // Ref and position state for forgot password suggestions overlay
//   const forgotInputRef = useRef<HTMLInputElement>(null);
//   const [suggestionPosition, setSuggestionPosition] = useState<{
//     top: number;
//     left: number;
//     width: number;
//   }>({top: 0, left: 0, width: 0});

//   const updateSuggestionPosition = useCallback(() => {
//     if (forgotInputRef.current) {
//       const rect = forgotInputRef.current.getBoundingClientRect();
//       setSuggestionPosition({
//         top: rect.bottom + window.scrollY + 8, // 8px gap below input
//         left: rect.left + window.scrollX,
//         width: rect.width,
//       });
//     }
//   }, []);

//   useEffect(() => {
//     if (showForgotSuggestions) {
//       updateSuggestionPosition();
//     }
//   }, [showForgotSuggestions, updateSuggestionPosition]);

//   useEffect(() => {
//     const handleResizeOrScroll = () => {
//       if (showForgotSuggestions) {
//         updateSuggestionPosition();
//       }
//     };

//     window.addEventListener("resize", handleResizeOrScroll);
//     window.addEventListener("scroll", handleResizeOrScroll);

//     return () => {
//       window.removeEventListener("resize", handleResizeOrScroll);
//       window.removeEventListener("scroll", handleResizeOrScroll);
//     };
//   }, [showForgotSuggestions, updateSuggestionPosition]);

//   // Load past emails from localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem("pastEmails");
//     if (saved) {
//       setPastEmails(JSON.parse(saved));
//     }
//   }, []);

//   const saveEmail = useCallback(
//     (newEmail: string) => {
//       if (newEmail && !pastEmails.includes(newEmail)) {
//         const updated = [...pastEmails, newEmail].slice(-5); // Keep last 5
//         setPastEmails(updated);
//         localStorage.setItem("pastEmails", JSON.stringify(updated));
//       }
//     },
//     [pastEmails],
//   );

//   // Handle email suggestions for login
//   const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setEmail(value);
//     if (value) {
//       const filtered = pastEmails.filter((em) =>
//         em.toLowerCase().includes(value.toLowerCase()),
//       );
//       setSuggestions(filtered);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions(pastEmails);
//       setShowSuggestions(true);
//     }
//   };

//   const handleEmailFocus = () => {
//     setSuggestions(pastEmails);
//     setShowSuggestions(true);
//   };

//   const handleEmailBlur = () => {
//     setTimeout(() => setShowSuggestions(false), 300); // Increased to 300ms for reliability
//   };

//   const selectSuggestion = (sug: string) => {
//     setEmail(sug);
//     setShowSuggestions(false);
//   };

//   // Handle forgot email suggestions
//   const handleForgotEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setForgotEmail(value);
//     if (value) {
//       const filtered = pastEmails.filter((em) =>
//         em.toLowerCase().includes(value.toLowerCase()),
//       );
//       setForgotSuggestions(filtered);
//       setShowForgotSuggestions(true);
//     } else {
//       setForgotSuggestions(pastEmails);
//       setShowForgotSuggestions(true);
//     }
//   };

//   const handleForgotEmailFocus = () => {
//     setForgotSuggestions(pastEmails);
//     setShowForgotSuggestions(true);
//   };

//   const handleForgotEmailBlur = () => {
//     setTimeout(() => setShowForgotSuggestions(false), 300); // Increased timeout
//   };

//   const selectForgotSuggestion = (sug: string) => {
//     setForgotEmail(sug);
//     setShowForgotSuggestions(false);
//   };

//   // login-content.tsx
//   // Handle role-based redirection after successful login
//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.role) {
//       const role = session.user.role;
//       const callbackUrl = searchParams.get("callbackUrl");

//       console.log(isGenerated, "isGeneratedPassppp");

//       if (isGenerated) {
//         // Redirect to change password if using generated password
//         window.location.href = "/change-password";
//         return;
//       }

//       // 1. If there's a callbackUrl, prioritize it
//       if (callbackUrl && callbackUrl !== "") {
//         // Security check: Don't redirect students to parent/admin paths
//         const isTryingAccessAdmin =
//           callbackUrl.startsWith("/admin") ||
//           callbackUrl.startsWith("/invoice");

//         if (role === "student" && isTryingAccessAdmin) {
//           window.location.href = "/student"; // Override to their correct dashboard
//         } else {
//           window.location.href = callbackUrl;
//         }
//         return;
//       }

//       // 2. Fallback to default role-based dashboards if no callbackUrl
//       const rolePaths: Record<string, string> = {
//         admin: "/admin",
//         student: "/student",
//         teacher: "/teacher",
//         parent: "/parent",
//       };

//       window.location.href = rolePaths[role] || "/login";
//     }
//   }, [status, session, searchParams]);

//   const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setForgotLoading(true);
//     setForgotError("");
//     try {
//       const response = await fetch("/api/forgot-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: forgotEmail,
//           hours_valid: 1,
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || "Failed to send reset email");
//       }

//       saveEmail(forgotEmail);
//       setShowDialog(false);
//       setForgotEmail("");
//       router.push("/reset-password");
//     } catch (err) {
//       console.error("[LoginPage] Forgot password error:", err);
//       setForgotError(
//         err instanceof Error ? err.message : "Failed to send reset email",
//       );
//     } finally {
//       setForgotLoading(false);
//     }
//   };

//   const handleCloseDialog = () => {
//     setShowDialog(false);
//     setForgotEmail("");
//     setForgotError("");
//     setShowForgotSuggestions(false);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoginError("");
//     setLoginLoading(true);

//     // We set redirect: false because we are handling the
//     // redirection logic manually in the useEffect above
//     const result = await signIn("credentials", {
//       redirect: false,
//       email,
//       password,
//     });

//     const ERROR_MAP: Record<string, string> = {
//       past_due:
//         "Your subscription is past due. Please renew or contact the school admin.",
//       subscription_missing:
//         "No active subscription was found for your account. Contact support.",
//       subscription_expired:
//         "Your subscription has expired. Please renew or contact support.",
//       subscription_cancelled:
//         "Your subscription is cancelled. Contact support.",
//       invalid_credentials: "Invalid email or password.",
//       not_active: "You are not yet activated.",
//       login_failed: "Unable to sign in. Please try again.",
//     };

//     if (!result?.error) {
//       saveEmail(email);
//       // Success: The useEffect hook above will now detect 'status === authenticated'
//       // and perform the redirect to callbackUrl or default role path.
//     } else {
//       setLoginError(ERROR_MAP[result.error] ?? "Unable to sign in.");
//       setLoginLoading(false); // Only stop loading if there is an error
//     }
//   };
//   return (
//     <div className="min-h-screen flex flex-col md:flex-row">
//       <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
//         <div className="max-w-sm mx-auto w-full">
//           <div className="flex items-center mb-10">
//             <Image
//               src="/logo.png"
//               alt="TechXagon Logo"
//               width={64}
//               height={64}
//               className="rounded-lg mr-4"
//             />
//             <div className="flex flex-col">
//               <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap">
//                 TECHXAGON ACADEMY
//               </h6>
//               <hr className="w-full my-2 border-gray-900" />
//               <p className="text-gray-600 italic text-lg">
//                 Readying the Future
//               </p>
//             </div>
//           </div>

//           <h2 className="text-2xl sm:text-3xl font-bold mb-6">
//             Log in to your account
//           </h2>

//           {resetSuccess && (
//             <div className="text-sm text-green-600 text-center bg-green-500/10 px-3 py-2 rounded-md mb-4">
//               Password reset successful! You can now sign in.
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-10">
//             <div className="space-y-1 relative">
//               <div className="relative">
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={handleEmailChange}
//                   onFocus={handleEmailFocus}
//                   onBlur={handleEmailBlur}
//                   placeholder="Email Address*"
//                   className="pl-12 pr-4 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
//                   autoComplete="off"
//                   required
//                   disabled={loginLoading}
//                 />
//                 <Mail
//                   className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   size={20}
//                 />
//               </div>
//               {showSuggestions && suggestions.length > 0 && (
//                 <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
//                   {suggestions.map((sug) => (
//                     <li
//                       key={sug}
//                       onMouseDown={() => selectSuggestion(sug)} // Changed to onMouseDown for reliable click before blur
//                       className="px-4 py-3 cursor-pointer hover:bg-orange-50 hover:text-orange-700 text-sm text-gray-900 truncate transition-colors duration-150">
//                       {sug}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             <div className="space-y-1">
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Password*"
//                   className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
//                   autoComplete="off"
//                   required
//                   disabled={loginLoading}
//                 />
//                 <Lock
//                   className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   size={20}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                   disabled={loginLoading}>
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             {loginError && (
//               <p className="text-sm text-red-400 text-center bg-red-500/10 px-3 py-2 rounded-md">
//                 {loginError}
//               </p>
//             )}

//             <Button
//               type="submit"
//               variant="gradient"
//               className="w-full py-6 text-lg font-bold"
//               disabled={loginLoading}>
//               {loginLoading ? (
//                 <Spinner size="md" className="text-white" />
//               ) : (
//                 "Sign In"
//               )}
//             </Button>
//           </form>
//           <div
//             className="flex items-center justify-center"
//             style={{marginTop: "19px"}}>
//             <button
//               onClick={() => setShowDialog(true)}
//               className="text-sm text-blue-600 hover:underline focus:outline-none">
//               Forgotten password?
//             </button>
//           </div>
//         </div>
//       </div>

//       <div
//         className="w-full md:w-[60%] flex flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
//         style={{backgroundImage: "url('/texagon_sva.svg')"}}>
//         <div className="text-center z-10 px-4">
//           <h2 className="text-5xl font-bold text-white mb-4">
//             <AnimatedWords
//               text="Africa's Foremost"
//               startDelay={0}
//               splitType="letter"
//               wordStyle={{fontSize: "5rem", fontWeight: "bold"}}
//               animate={shouldAnimate}
//             />
//           </h2>
//           <h2 className="text-5xl font-bold bg-gradient-to-r from-[#ff9572] via-[#ff936f] to-[#f4b29c] text-transparent bg-clip-text hover:opacity-90 mb-4 [text-shadow:1px_1px_0_#c2410c,2px_2px_0_#c2410c,3px_3px_0_#c2410c,4px_4px_0_#c2410c,5px_5px_0_#c2410c,6px_6px_1px_rgba(0,0,0,0.2)]">
//             <AnimatedWords
//               text="4IR"
//               startDelay={3.4}
//               splitType="letter"
//               wordStyle={{fontSize: "8rem", fontWeight: "thin"}}
//               animate={shouldAnimate}
//             />
//           </h2>
//           <h2 className="text-5xl font-bold text-white">
//             <AnimatedWords
//               text=" Curriculum"
//               startDelay={4}
//               splitType="letter"
//               wordStyle={{fontSize: "5rem", fontWeight: "bold"}}
//               animate={shouldAnimate}
//             />
//           </h2>
//         </div>
//       </div>

//       {showDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white p-6 rounded-xl max-w-md w-full max-h-screen overflow-y-auto relative z-[60] shadow-2xl">
//             <h2 className="text-2xl font-bold mb-6 text-gray-900">
//               Forgot Password
//             </h2>
//             <form onSubmit={handleForgotPasswordSubmit}>
//               <div className="mb-6 relative">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email
//                 </label>
//                 <Input
//                   ref={forgotInputRef}
//                   type="email"
//                   value={forgotEmail}
//                   onChange={handleForgotEmailChange}
//                   onFocus={() => {
//                     handleForgotEmailFocus();
//                     updateSuggestionPosition();
//                   }}
//                   onBlur={handleForgotEmailBlur}
//                   required
//                   placeholder="Enter your email"
//                   className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 placeholder:text-gray-400 transition-all"
//                 />
//                 {showForgotSuggestions && forgotSuggestions.length > 0 && (
//                   <ul
//                     className="
//                       fixed bg-white border border-gray-200 rounded-lg
//                       shadow-2xl z-[9999] max-h-64 overflow-y-auto
//                       divide-y divide-gray-100 pointer-events-auto
//                       scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50
//                     "
//                     role="listbox"
//                     style={{
//                       top: `${suggestionPosition.top}px`,
//                       left: `${suggestionPosition.left}px`,
//                       width: `${suggestionPosition.width}px`,
//                     }}>
//                     {forgotSuggestions.map((sug) => (
//                       <li
//                         key={sug}
//                         onMouseDown={() => selectForgotSuggestion(sug)} // Changed to onMouseDown to fire before blur
//                         className="
//                           px-4 py-3 cursor-pointer
//                           text-sm text-gray-900 hover:bg-orange-50 hover:text-orange-700
//                           transition-colors duration-150
//                           truncate
//                         "
//                         role="option">
//                         {sug}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {forgotError && (
//                 <p className="text-sm text-red-600 text-center bg-red-50 px-4 py-3 rounded-lg mb-6">
//                   {forgotError}
//                 </p>
//               )}

//               <div className="flex justify-end space-x-4">
//                 <Button
//                   type="button"
//                   onClick={handleCloseDialog}
//                   variant="outline"
//                   className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100">
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="gradient"
//                   className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md"
//                   disabled={forgotLoading}>
//                   {forgotLoading ? (
//                     <Spinner size="sm" className="text-white" />
//                   ) : (
//                     "Send Reset Link"
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import {useState, useEffect, useCallback, useRef} from "react";
import {Mail, Lock, Eye, EyeOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import {signIn, useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import {ro} from "date-fns/locale";

interface AnimatedWordsProps {
  text: string;
  startDelay?: number;
  delayIncrement?: number;
  splitType?: "word" | "letter";
  wordStyle?: React.CSSProperties;
  className?: string;
  animate?: boolean;
}

function AnimatedWords({
  text,
  startDelay = 0,
  delayIncrement = 0.2,
  splitType = "letter",
  wordStyle = {},
  className = "",
  animate = true,
}: AnimatedWordsProps) {
  const items =
    splitType === "word" ? text.split(/\s+/).filter((w) => w) : text.split("");
  return (
    <>
      {items.map((item, index) => (
        <span
          key={index}
          className={`inline-block ${animate ? "opacity-0 animate-[fadeInBounce_1s_forwards]" : ""} ${className}`}
          style={{
            ...wordStyle,
            ...(animate
              ? {animationDelay: `${startDelay + index * delayIncrement}s`}
              : {}),
          }}>
          {splitType === "letter" ? (item === " " ? "\u00A0" : item) : item}
          {splitType === "word" && index < items.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [pastEmails, setPastEmails] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [forgotSuggestions, setForgotSuggestions] = useState<string[]>([]);
  const [showForgotSuggestions, setShowForgotSuggestions] = useState(false);
  const {data: session, status} = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Add custom keyframe animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeInBounce {
        0% {
          opacity: 0;
          transform: translateY(-20px);
        }
        60% {
          opacity: 1;
          transform: translateY(5px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Detect navigation type for animation control
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const navType = (navEntries[0] as PerformanceNavigationTiming).type;
      if (navType === "reload" || navType === "navigate") {
        setShouldAnimate(true);
      }
    } else {
      // Fallback for browsers without support
      setShouldAnimate(true);
    }
  }, []);

  // Ref and position state for forgot password suggestions overlay
  const forgotInputRef = useRef<HTMLInputElement>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{
    top: number;
    left: number;
    width: number;
  }>({top: 0, left: 0, width: 0});

  const updateSuggestionPosition = useCallback(() => {
    if (forgotInputRef.current) {
      const rect = forgotInputRef.current.getBoundingClientRect();
      setSuggestionPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap below input
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (showForgotSuggestions) {
      updateSuggestionPosition();
    }
  }, [showForgotSuggestions, updateSuggestionPosition]);

  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (showForgotSuggestions) {
        updateSuggestionPosition();
      }
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll);
    };
  }, [showForgotSuggestions, updateSuggestionPosition]);

  // Load past emails from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pastEmails");
    if (saved) {
      setPastEmails(JSON.parse(saved));
    }
  }, []);

  const saveEmail = useCallback(
    (newEmail: string) => {
      if (newEmail && !pastEmails.includes(newEmail)) {
        const updated = [...pastEmails, newEmail].slice(-5); // Keep last 5
        setPastEmails(updated);
        localStorage.setItem("pastEmails", JSON.stringify(updated));
      }
    },
    [pastEmails],
  );

  // Handle email suggestions for login
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      const filtered = pastEmails.filter((em) =>
        em.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(pastEmails);
      setShowSuggestions(true);
    }
  };

  const handleEmailFocus = () => {
    setSuggestions(pastEmails);
    setShowSuggestions(true);
  };

  const handleEmailBlur = () => {
    setTimeout(() => setShowSuggestions(false), 300); // Increased to 300ms for reliability
  };

  const selectSuggestion = (sug: string) => {
    setEmail(sug);
    setShowSuggestions(false);
  };

  // Handle forgot email suggestions
  const handleForgotEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForgotEmail(value);
    if (value) {
      const filtered = pastEmails.filter((em) =>
        em.toLowerCase().includes(value.toLowerCase()),
      );
      setForgotSuggestions(filtered);
      setShowForgotSuggestions(true);
    } else {
      setForgotSuggestions(pastEmails);
      setShowForgotSuggestions(true);
    }
  };

  const handleForgotEmailFocus = () => {
    setForgotSuggestions(pastEmails);
    setShowForgotSuggestions(true);
  };

  const handleForgotEmailBlur = () => {
    setTimeout(() => setShowForgotSuggestions(false), 300); // Increased timeout
  };

  const selectForgotSuggestion = (sug: string) => {
    setForgotEmail(sug);
    setShowForgotSuggestions(false);
  };

  // login-content.tsx
  // Handle role-based redirection after successful login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      const callbackUrl = searchParams.get("callbackUrl");
      const isGenerated = (session.user as any).isGenerated;

      console.log(isGenerated, "isGeneratedPassppp");

      if (isGenerated) {
        // Redirect to change password if using generated password
        window.location.href = "/change-password";
        return;
      }

      // 1. If there's a callbackUrl, prioritize it
      if (callbackUrl && callbackUrl !== "") {
        // Security check: Don't redirect students to parent/admin paths
        const isTryingAccessAdmin =
          callbackUrl.startsWith("/admin") ||
          callbackUrl.startsWith("/invoice");

        if (role === "student" && isTryingAccessAdmin) {
          window.location.href = "/student"; // Override to their correct dashboard
        } else {
          window.location.href = callbackUrl;
        }
        return;
      }

      // 2. Fallback to default role-based dashboards if no callbackUrl
      const rolePaths: Record<string, string> = {
        admin: "/admin",
        student: "/student",
        teacher: "/teacher",
        parent: "/parent",
      };

      window.location.href = rolePaths[role] || "/login";
    }
  }, [status, session, searchParams]);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          hours_valid: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      saveEmail(forgotEmail);
      setShowDialog(false);
      setForgotEmail("");
      router.push("/reset-password");
    } catch (err) {
      console.error("[LoginPage] Forgot password error:", err);
      setForgotError(
        err instanceof Error ? err.message : "Failed to send reset email",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setForgotEmail("");
    setForgotError("");
    setShowForgotSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    // We set redirect: false because we are handling the
    // redirection logic manually in the useEffect above
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    const ERROR_MAP: Record<string, string> = {
      past_due:
        "Your subscription is past due. Please renew or contact the school admin.",
      subscription_missing:
        "No active subscription was found for your account. Contact support.",
      subscription_expired:
        "Your subscription has expired. Please renew or contact support.",
      subscription_cancelled:
        "Your subscription is cancelled. Contact support.",
      invalid_credentials: "Invalid email or password.",
      not_active: "You are not yet activated.",
      login_failed: "Unable to sign in. Please try again.",
    };

    if (!result?.error) {
      saveEmail(email);
      // Success: The useEffect hook above will now detect 'status === authenticated'
      // and perform the redirect to callbackUrl or default role path.
    } else {
      setLoginError(ERROR_MAP[result.error] ?? "Unable to sign in.");
      setLoginLoading(false); // Only stop loading if there is an error
    }
  };
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center mb-10">
            <Image
              src="/logo.png"
              alt="TechXagon Logo"
              width={64}
              height={64}
              className="rounded-lg mr-4"
            />
            <div className="flex flex-col">
              <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap">
                TECHXAGON ACADEMY
              </h6>
              <hr className="w-full my-2 border-gray-900" />
              <p className="text-gray-600 italic text-lg">
                Readying the Future
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Log in to your account
          </h2>

          {resetSuccess && (
            <div className="text-sm text-green-600 text-center bg-green-500/10 px-3 py-2 rounded-md mb-4">
              Password reset successful! You can now sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-1 relative">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  placeholder="Email Address*"
                  className="pl-12 pr-4 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="off"
                  required
                  disabled={loginLoading}
                />
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {suggestions.map((sug) => (
                    <li
                      key={sug}
                      onMouseDown={() => selectSuggestion(sug)} // Changed to onMouseDown for reliable click before blur
                      className="px-4 py-3 cursor-pointer hover:bg-orange-50 hover:text-orange-700 text-sm text-gray-900 truncate transition-colors duration-150">
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="off"
                  required
                  disabled={loginLoading}
                />
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loginLoading}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-sm text-red-400 text-center bg-red-500/10 px-3 py-2 rounded-md">
                {loginError}
              </p>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full py-6 text-lg font-bold"
              disabled={loginLoading}>
              {loginLoading ? (
                <Spinner size="md" className="text-white" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div
            className="flex items-center justify-center"
            style={{marginTop: "19px"}}>
            <button
              onClick={() => setShowDialog(true)}
              className="text-sm text-blue-600 hover:underline focus:outline-none">
              Forgotten password?
            </button>
          </div>
        </div>
      </div>

      <div
        className="w-full md:w-[60%] flex flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
        style={{backgroundImage: "url('/texagon_sva.svg')"}}>
        <div className="text-center z-10 px-4">
          <h2 className="text-5xl font-bold text-white mb-4">
            <AnimatedWords
              text="Africa's Foremost"
              startDelay={0}
              splitType="letter"
              wordStyle={{fontSize: "5rem", fontWeight: "bold"}}
              animate={shouldAnimate}
            />
          </h2>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-[#ff9572] via-[#ff936f] to-[#f4b29c] text-transparent bg-clip-text hover:opacity-90 mb-4 [text-shadow:1px_1px_0_#c2410c,2px_2px_0_#c2410c,3px_3px_0_#c2410c,4px_4px_0_#c2410c,5px_5px_0_#c2410c,6px_6px_1px_rgba(0,0,0,0.2)]">
            <AnimatedWords
              text="4IR"
              startDelay={3.4}
              splitType="letter"
              wordStyle={{fontSize: "8rem", fontWeight: "thin"}}
              animate={shouldAnimate}
            />
          </h2>
          <h2 className="text-5xl font-bold text-white">
            <AnimatedWords
              text=" Curriculum"
              startDelay={4}
              splitType="letter"
              wordStyle={{fontSize: "5rem", fontWeight: "bold"}}
              animate={shouldAnimate}
            />
          </h2>
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full max-h-screen overflow-y-auto relative z-[60] shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Forgot Password
            </h2>
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  ref={forgotInputRef}
                  type="email"
                  value={forgotEmail}
                  onChange={handleForgotEmailChange}
                  onFocus={() => {
                    handleForgotEmailFocus();
                    updateSuggestionPosition();
                  }}
                  onBlur={handleForgotEmailBlur}
                  required
                  placeholder="Enter your email"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-900 placeholder:text-gray-400 transition-all"
                />
                {showForgotSuggestions && forgotSuggestions.length > 0 && (
                  <ul
                    className="
                      fixed bg-white border border-gray-200 rounded-lg
                      shadow-2xl z-[9999] max-h-64 overflow-y-auto
                      divide-y divide-gray-100 pointer-events-auto
                      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50
                    "
                    role="listbox"
                    style={{
                      top: `${suggestionPosition.top}px`,
                      left: `${suggestionPosition.left}px`,
                      width: `${suggestionPosition.width}px`,
                    }}>
                    {forgotSuggestions.map((sug) => (
                      <li
                        key={sug}
                        onMouseDown={() => selectForgotSuggestion(sug)} // Changed to onMouseDown to fire before blur
                        className="
                          px-4 py-3 cursor-pointer
                          text-sm text-gray-900 hover:bg-orange-50 hover:text-orange-700
                          transition-colors duration-150
                          truncate
                        "
                        role="option">
                        {sug}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {forgotError && (
                <p className="text-sm text-red-600 text-center bg-red-50 px-4 py-3 rounded-lg mb-6">
                  {forgotError}
                </p>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={handleCloseDialog}
                  variant="outline"
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md"
                  disabled={forgotLoading}>
                  {forgotLoading ? (
                    <Spinner size="sm" className="text-white" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
