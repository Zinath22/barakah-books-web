

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword,  GoogleAuthProvider,
  signInWithPopup, } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const callback = params.get("callbackUrl") || "/dashboard";

  const provider = new GoogleAuthProvider();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = res.user;

      // ❗ Email verification check
      if (!user.emailVerified) {
        await Swal.fire(
          "Verify Required",
          "📧 Please verify your email before login",
          "warning"
        );

        await auth.signOut(); // 🔥 IMPORTANT FIX (force logout)

        return;
      }

      await Swal.fire("Success", "Login Successful", "success");

      setForm({ email: "", password: "" });

      router.push(callback);

    } catch (error) {
      console.log("LOGIN ERROR:", error.code);

      let message = "Something went wrong";

     

          

if (error.code === "auth/user-not-found") {
  message = "User not found";
} 
else if (
  error.code === "auth/wrong-password" ||
  error.code === "auth/invalid-credential"
) {
  message = "Invalid email or password";
} 
else if (error.code === "auth/invalid-email") {
  message = "Invalid email";
}

      // if (
      //   error.code === "auth/user-not-found" ||
      //   error.code === "auth/invalid-credential"
      // ) {
      //   message = "Invalid email or password";
      // } else if (error.code === "auth/invalid-email") {
      //   message = "Invalid email";
      // }

      // if (error.code === "auth/user-not-found") 
      //   { message = "User not found"; } 
      // else if (error.code === "auth/wrong-password") 
      //   { message = "Wrong password"; } else if (error.code === "auth/invalid-email") 
      //     { message = "Invalid email"; }

      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
  try {
    setLoading(true);

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    // Save user to database
    await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.displayName,
        email: user.email,
        image: user.photoURL,
        role: "user",
      }),
    });

    Swal.fire(
      "Success",
      "Google Login Successful",
      "success"
    );

    router.push(callback);

  } catch (error) {
    console.log(error);

    Swal.fire(
      "Error",
      error.message,
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">

      <form
      autoComplete="off"
        onSubmit={handleSubmit}
        className="card p-6 w-96 shadow-xl bg-base-100"
      >

        <h2 className="text-xl font-bold mb-4 text-center">
          Login
        </h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input input-bordered mb-3 w-full"
          value={form.email}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input input-bordered mb-3 w-full"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          
          required
        />

        <button
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="divider">OR</div>

<button
  type="button"
  onClick={handleGoogleLogin}
  className="btn btn-primary w-full"
>
  Continue with Google
</button>

        <div className="text-center mt-4">
          <p className="text-sm">Don’t have account?</p>

          <Link href={`/register?callbackUrl=${callback}`}>
            <button type="button" className="btn btn-primary btn-sm mt-2">
              Register Now
            </button>
          </Link>
        </div>

      </form>

    </div>
  );
}


// "use client";

// import { useState, useRef } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import Swal from "sweetalert2";

// import { auth } from "@/lib/firebase";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";

// export default function LoginPage() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const callback = params.get("callbackUrl") || "/dashboard";
//   const provider = new GoogleAuthProvider();

//   // ── Step: "login" | "otp" ─────────────────────────────────────────────────
//   const [step, setStep]       = useState("login");
//   const [loading, setLoading] = useState(false);

//   // ── Login form state ──────────────────────────────────────────────────────
//   const [form, setForm] = useState({ email: "", password: "" });

//   // ── OTP state ─────────────────────────────────────────────────────────────
//   const [otp, setOtp]         = useState(["", "", "", ""]);
//   const [otpEmail, setOtpEmail] = useState("");
//   const [timer, setTimer]     = useState(300); // 5 mins in seconds
//   const timerRef              = useRef(null);
//   const inputRefs             = useRef([]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // ── Start 5-min countdown ─────────────────────────────────────────────────
//   const startTimer = () => {
//     setTimer(300);
//     clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const formatTimer = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   // ── Send OTP ──────────────────────────────────────────────────────────────
//   const sendOtp = async (email) => {
//     const res  = await fetch("/api/otp/send", {
//       method:  "POST",
//       headers: { "Content-Type": "application/json" },
//       body:    JSON.stringify({ email }),
//     });
//     return await res.json();
//   };

//   // ── STEP 1: Email + Password login ────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       const res  = await signInWithEmailAndPassword(auth, form.email, form.password);
//       const user = res.user;

//       // Email verification check
//       if (!user.emailVerified) {
//         await Swal.fire(
//           "Verify Required",
//           "📧 Please verify your email before login",
//           "warning"
//         );
//         await auth.signOut();
//         return;
//       }

//       // Credentials OK — send OTP
//       const otpRes = await sendOtp(form.email);

//       if (!otpRes.success) {
//         Swal.fire("Error", otpRes.message || "Failed to send OTP", "error");
//         return;
//       }

//       // Move to OTP step
//       setOtpEmail(form.email);
//       setOtp(["", "", "", ""]);
//       setStep("otp");
//       startTimer();

//       // Sign out Firebase session — will restore after OTP verified
//       await auth.signOut();

//     } catch (error) {
//       console.log("LOGIN ERROR:", error.code);

//       let message = "Something went wrong";

//       if (error.code === "auth/user-not-found") {
//         message = "User not found";
//       } else if (
//         error.code === "auth/wrong-password" ||
//         error.code === "auth/invalid-credential"
//       ) {
//         message = "Invalid email or password";
//       } else if (error.code === "auth/invalid-email") {
//         message = "Invalid email";
//       }

//       Swal.fire("Error", message, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── STEP 2: OTP input handlers ────────────────────────────────────────────
//   const handleOtpChange = (index, value) => {
//     if (!/^\d*$/.test(value)) return; // numbers only

//     const newOtp = [...otp];
//     newOtp[index] = value.slice(-1); // one digit only
//     setOtp(newOtp);

//     // Auto-focus next input
//     if (value && index < 3) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleOtpKeyDown = (index, e) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   // ── STEP 2: Verify OTP ────────────────────────────────────────────────────
//   const handleVerifyOtp = async () => {
//     const otpValue = otp.join("");

//     if (otpValue.length !== 4) {
//       Swal.fire("Error", "Please enter all 4 digits", "error");
//       return;
//     }

//     if (timer === 0) {
//       Swal.fire("Expired", "OTP has expired. Please request a new one.", "warning");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res  = await fetch("/api/otp/verify", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ email: otpEmail, otp: otpValue }),
//       });
//       const data = await res.json();

//       if (!data.success) {
//         Swal.fire("Error", data.message, "error");
//         return;
//       }

//       // OTP verified — sign back in to Firebase
//       await signInWithEmailAndPassword(auth, form.email, form.password);

//       clearInterval(timerRef.current);

//       await Swal.fire("Success", "Login Successful! 🎉", "success");

//       setForm({ email: "", password: "" });
//       router.push(callback);

//     } catch (error) {
//       console.log("OTP VERIFY ERROR:", error);
//       Swal.fire("Error", "Something went wrong", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Resend OTP ────────────────────────────────────────────────────────────
//   const handleResend = async () => {
//     if (timer > 0) return;

//     try {
//       setLoading(true);
//       const res = await sendOtp(otpEmail);

//       if (res.success) {
//         setOtp(["", "", "", ""]);
//         startTimer();
//         Swal.fire("Sent!", "A new OTP has been sent to your email.", "success");
//       } else {
//         Swal.fire("Error", res.message, "error");
//       }
//     } catch {
//       Swal.fire("Error", "Something went wrong", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Google Login ──────────────────────────────────────────────────────────
//   const handleGoogleLogin = async () => {
//     try {
//       setLoading(true);

//       const result = await signInWithPopup(auth, provider);
//       const user   = result.user;

//       await fetch("/api/user", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({
//           name:  user.displayName,
//           email: user.email,
//           image: user.photoURL,
//           role:  "user",
//         }),
//       });

//       Swal.fire("Success", "Google Login Successful", "success");
//       router.push(callback);
//     } catch (error) {
//       console.log(error);
//       Swal.fire("Error", error.message, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── RENDER: OTP Step ──────────────────────────────────────────────────────
//   if (step === "otp") {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-base-200">
//         <div className="card p-6 w-96 shadow-xl bg-base-100 text-center">

//           <div className="text-5xl mb-3">🔐</div>

//           <h2 className="text-xl font-bold mb-1">Verify OTP</h2>

//           <p className="text-sm text-gray-500 mb-6">
//             We sent a 4-digit code to <br />
//             <span className="font-semibold text-primary">{otpEmail}</span>
//           </p>

//           {/* OTP INPUT BOXES */}
//           <div className="flex justify-center gap-3 mb-4">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 ref={(el) => (inputRefs.current[index] = el)}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={1}
//                 value={digit}
//                 onChange={(e) => handleOtpChange(index, e.target.value)}
//                 onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                 className="w-14 h-14 text-center text-2xl font-bold input input-bordered focus:input-primary"
//               />
//             ))}
//           </div>

//           {/* TIMER */}
//           <p className={`text-sm mb-4 font-medium ${timer === 0 ? "text-red-500" : "text-gray-500"}`}>
//             {timer > 0 ? `⏱️ Expires in ${formatTimer(timer)}` : "⚠️ OTP expired"}
//           </p>

//           {/* VERIFY BUTTON */}
//           <button
//             onClick={handleVerifyOtp}
//             className="btn btn-primary w-full mb-3"
//             disabled={loading || otp.join("").length !== 4}
//           >
//             {loading ? <span className="loading loading-spinner loading-sm" /> : "Verify OTP"}
//           </button>

//           {/* RESEND */}
//           <button
//             onClick={handleResend}
//             disabled={timer > 0 || loading}
//             className={`btn btn-outline btn-sm w-full mb-3 ${timer > 0 ? "opacity-40 cursor-not-allowed" : ""}`}
//           >
//             Resend OTP
//           </button>

//           {/* BACK */}
//           <button
//             onClick={() => { setStep("login"); clearInterval(timerRef.current); }}
//             className="text-sm text-gray-400 hover:text-primary transition"
//           >
//             ← Back to Login
//           </button>

//         </div>
//       </div>
//     );
//   }

//   // ── RENDER: Login Step ────────────────────────────────────────────────────
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-base-200">
//       <form
//         autoComplete="email"
//         onSubmit={handleSubmit}
//         className="card p-6 w-96 shadow-xl bg-base-100"
//       >
//         <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           className="input input-bordered mb-3 w-full"
//           value={form.email}
//           onChange={handleChange}
//           autoComplete="email"
//           required
//         />

//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           className="input input-bordered mb-3 w-full"
//           value={form.password}
//           onChange={handleChange}
//           autoComplete="new-password"
//           required
//         />

//         <button className="btn btn-primary w-full" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         <div className="divider">OR</div>

//         <button
//           type="button"
//           onClick={handleGoogleLogin}
//           className="btn btn-outline w-full"
//         >
//           Continue with Google
//         </button>

//         <div className="text-center mt-4">
//           <p className="text-sm">Don&apos;t have account?</p>
//           <Link href={`/register?callbackUrl=${callback}`}>
//             <button type="button" className="btn btn-primary btn-sm mt-2">
//               Register Now
//             </button>
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// }
