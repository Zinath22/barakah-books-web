

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import Swal from "sweetalert2";

// import { auth } from "@/lib/firebase";
// import {
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
//   updateProfile,
// } from "firebase/auth";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (form.password.length < 6) {
//       return Swal.fire("Error", "Password must be at least 6 characters", "error");
//     }

//     try {
//       setLoading(true);

//       // 1️⃣ Create user
//       const userCred = await createUserWithEmailAndPassword(
//         auth,
//         form.email,
//         form.password
//       );
//       console.log("USER:", userCred.user);

//       const user = userCred.user;

//       // 2️⃣ Update profile
//       await updateProfile(user, {
//         displayName: form.name,
//       });

//       // 🔥 IMPORTANT FIX: use returned user directly (NOT auth.currentUser)
//       await sendEmailVerification(user);

//       // 3️⃣ Logout user after sending email
//       await auth.signOut();
//       //  router.push("/login");

//       // 4️⃣ Success message
//       await Swal.fire({
//         icon: "success",
//         title: "Registration Successful 🎉",
//         html: "📧 Verification email sent! Check inbox/spam and verify before login.",
//         confirmButtonText: "Go to Login",
//       });

//       // 5️⃣ Reset form
//       setForm({
//         name: "",
//         email: "",
//         password: "",
//       });

//       // 6️⃣ Redirect
//       router.push("/login");

//     } catch (error) {
//       console.log("REGISTER ERROR:", error);

//       let message = "Registration failed";

//       if (error.code === "auth/email-already-in-use") {
//         message = "Email already in use";
//       } else if (error.code === "auth/invalid-email") {
//         message = "Invalid email";
//       } else if (error.code === "auth/weak-password") {
//         message = "Password is too weak";
//       }

//       Swal.fire("Error", message, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-base-200">
//       <div className="card w-full max-w-sm shadow-xl bg-base-100">
//         <div className="card-body">

//           <h2 className="text-2xl font-bold text-center">
//             Create Account
//           </h2>

//           <form autoComplete="off"
//           onSubmit={handleSubmit} className="space-y-3">

//             <input
//               type="text"
//               name="name"
//               placeholder="Full Name"
//               className="input input-bordered w-full"
//               value={form.name}
//               onChange={handleChange}
//               required
//             />

//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               className="input input-bordered w-full"
//               value={form.email}
//               onChange={handleChange}
//               autoComplete="off"
//               required
//             />

//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="input input-bordered w-full"
//               value={form.password}
//               onChange={handleChange}
//               autoComplete="new-password"
//               required
//             />

//             <button
//               type="submit"
//               className="btn btn-primary w-full"
//               disabled={loading}
//             >
//               {loading ? "Creating..." : "Register"}
//             </button>

//           </form>

//           <p className="text-center text-sm mt-4">
//             Already have an account?{" "}
//             <Link href="/login" className="link link-primary">
//               Login
//             </Link>
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      return Swal.fire(
        "Error",
        "Password must be at least 6 characters",
        "error"
      );
    }

    try {
      setLoading(true);

      // 1️⃣ Firebase user create
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCred.user;

      // 2️⃣ Update profile
      await updateProfile(user, {
        displayName: form.name,
      });

      // 3️⃣ Send verification email
      await sendEmailVerification(user);

      // 🔥 4️⃣ SAVE USER IN MONGODB (VERY IMPORTANT)
      await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
        }),
      });

      // 5️⃣ Logout user (before verification)
      await signOut(auth);

      // 6️⃣ Success message
      await Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        html: "📧 Verification email sent! Check inbox/spam and verify before login.",
        confirmButtonText: "Go to Login",
      });

      // 7️⃣ Reset form
      setForm({
        name: "",
        email: "",
        password: "",
      });

      // 8️⃣ Redirect
      router.push("/login");

    } catch (error) {
      console.log("REGISTER ERROR:", error);

      let message = "Registration failed";

      if (error.code === "auth/email-already-in-use") {
        message = "Email already in use";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak";
      }

      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body">

          <h2 className="text-2xl font-bold text-center">
            Create Account
          </h2>

          <form autoComplete="off" onSubmit={handleSubmit} className="space-y-3">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input input-bordered w-full"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input input-bordered w-full"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Register"}
            </button>

          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="link link-primary">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}