


// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "@/lib/firebase";
// import { onAuthStateChanged, signOut } from "firebase/auth";

// const AuthContext = createContext(null);

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🔥 Auth listener
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return () => unsub();
//   }, []);

//   // 🔥 SAFE LOGOUT (NO CART DEPENDENCY HERE)
//   const logout = async () => {
//     await signOut(auth);
//     setUser(null);

//     // 🧹 clear cart via event (safe approach)
//     window.dispatchEvent(new Event("clear-cart"));
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // 🔥 Custom hook
// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }

//   return context;
// };


// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "@/lib/firebase";
// import { onAuthStateChanged, signOut } from "firebase/auth";

// const AuthContext = createContext(null);

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🔥 Auth listener + role fetch
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         try {
//           // 🔥 MongoDB থেকে role আনো
//           const res = await fetch(
//             `/api/user?email=${currentUser.email}`
//           );
//           const dbUser = await res.json();

//           setUser({
//             ...currentUser,
//             role: dbUser?.role || "user", // 🔥 KEY FIX
//           });

//         } catch (err) {
//           console.log("Role fetch error:", err);

//           // fallback
//           setUser({
//             ...currentUser,
//             role: "user",
//           });
//         }
//       } else {
//         setUser(null);
//       }

//       setLoading(false);
//     });

//     return () => unsub();
//   }, []);

//   // 🔥 LOGOUT
//   const logout = async () => {
//     await signOut(auth);
//     setUser(null);

//     // cart clear trigger
//     window.dispatchEvent(new Event("clear-cart"));
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // 🔥 hook
// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }

//   return context;
// };

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 🔥 FETCH ROLE FROM MONGO
        const res = await fetch(
          `/api/user?email=${currentUser.email}`,
          {
            cache: "no-store",
          }
        );

        let dbUser = null;

        if (res.ok) {
          dbUser = await res.json();
        }

        // 🔥 SAFE USER OBJECT
        const finalUser = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || "",
          role: dbUser?.role || "user", // IMPORTANT
        };

        setUser(finalUser);

        console.log("AUTH USER:", finalUser);

      } catch (error) {
        console.log("Auth error:", error);

        setUser({
          uid: currentUser?.uid,
          email: currentUser?.email,
          name: currentUser?.displayName || "",
          role: "user",
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);

      // clear cart
      window.dispatchEvent(new Event("clear-cart"));
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🔥 SAFE HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};