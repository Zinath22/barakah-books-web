// "use client";

// import { useEffect, useState } from "react";
// import Swal from "sweetalert2";

// export default function AllUsers() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🔥 LOAD USERS
//   useEffect(() => {
//     const loadUsers = async () => {
//       try {
//         const res = await fetch("/api/users", {
//           cache: "no-store",
//         });

//         const data = await res.json();

//         // ✅ FIXED
//         if (data.success) {
//           setUsers(data.users || []);
//         } else {
//           setUsers([]);
//         }

//       } catch (error) {
//         console.log("Fetch users error:", error);
//         setUsers([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUsers();
//   }, []);

//   // 🔥 MAKE ADMIN
//   const makeAdmin = async (id) => {
//     try {
//       const res = await fetch("/api/make-admin", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         Swal.fire("Success", "User is now admin", "success");

//         // 🔥 UPDATE UI
//         setUsers((prev) =>
//           prev.map((u) =>
//             u._id === id
//               ? { ...u, role: "admin" }
//               : u
//           )
//         );

//       } else {
//         Swal.fire(
//           "Error",
//           data.message || "Failed",
//           "error"
//         );
//       }

//     } catch (error) {
//       console.log(error);

//       Swal.fire(
//         "Error",
//         "Server error",
//         "error"
//       );
//     }
//   };

//   // 🔥 DELETE USER
//   const deleteUser = async (id) => {
//     try {
//       const res = await fetch("/api/users", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         Swal.fire(
//           "Deleted",
//           "User removed",
//           "success"
//         );

//         // 🔥 REMOVE FROM UI
//         setUsers((prev) =>
//           prev.filter((u) => u._id !== id)
//         );

//       } else {
//         Swal.fire(
//           "Error",
//           data.message || "Failed",
//           "error"
//         );
//       }

//     } catch (error) {
//       console.log(error);

//       Swal.fire(
//         "Error",
//         "Server error",
//         "error"
//       );
//     }
//   };

//   // 🔥 LOADING
//   if (loading) {
//     return (
//       <p className="p-5">
//         Loading users...
//       </p>
//     );
//   }

//   return (
//     <div className="p-5">

//       {/* TITLE */}
//       <h1 className="text-2xl font-bold mb-5">
//         All Users ({users.length})
//       </h1>

//       {/* EMPTY */}
//       {users.length === 0 ? (
//         <p>No users found</p>
//       ) : (
//         <div className="space-y-3">

//           {users.map((user) => (
//             <div
//               key={user._id}
//               className="border p-4 rounded-lg flex justify-between items-center"
//             >

//               {/* USER INFO */}
//               <div>
//                 <p className="font-semibold">
//                   {user.email}
//                 </p>

//                 <p className="text-sm text-gray-500">
//                   Role: {user.role}
//                 </p>
//               </div>

//               {/* BUTTONS */}
//               <div className="flex gap-2">

//                 {/* MAKE ADMIN */}
//                 {user.role !== "admin" && (
//                   <button
//                     onClick={() =>
//                       makeAdmin(user._id)
//                     }
//                     className="btn btn-warning btn-sm"
//                   >
//                     Make Admin
//                   </button>
//                 )}

//                 {/* DELETE */}
//                 <button
//                   onClick={() =>
//                     deleteUser(user._id)
//                   }
//                   className="btn btn-error btn-sm"
//                 >
//                   Delete
//                 </button>

//               </div>
//             </div>
//           ))}

//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AllUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD USERS
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res  = await fetch("/api/users", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setUsers(data.users || []);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.log("Fetch users error:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // 🔥 MAKE ADMIN
  const makeAdmin = async (id) => {
    try {
      const res  = await fetch("/api/make-admin", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire("Success", "User is now admin", "success");
        setUsers((prev) =>
          prev.map((u) => u._id === id ? { ...u, role: "admin" } : u)
        );
      } else {
        Swal.fire("Error", data.message || "Failed", "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Server error", "error");
    }
  };

  // 🔥 DELETE USER
  const deleteUser = async (id) => {
    try {
      const res  = await fetch("/api/users", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        Swal.fire("Deleted", "User removed", "success");
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        Swal.fire("Error", data.message || "Failed", "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Server error", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      <h1 className="text-xl sm:text-2xl font-bold mb-5">
        👤 All Users ({users.length})
      </h1>

      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow border">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden sm:block overflow-x-auto rounded-xl shadow border">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} className="align-middle">

                    <td className="text-gray-400 font-semibold">
                      {index + 1}
                    </td>

                    <td className="text-sm">{user.email}</td>

                    <td className="text-center">
                      <span
                        className={`badge badge-sm ${
                          user.role === "admin"
                            ? "badge-primary"
                            : "badge-ghost"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* <td className="text-center">
                      <div className="flex justify-center gap-2">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => makeAdmin(user._id)}
                            className="btn btn-warning btn-sm"
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="btn btn-error btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td> */}

                    <td className="text-center">
  <div className="flex justify-end gap-2">
    {user.role !== "admin" && (
      <button
        onClick={() => makeAdmin(user._id)}
        className="btn btn-warning btn-sm"
      >
        Make Admin
      </button>
    )}
    <button
      onClick={() => deleteUser(user._id)}
      className="btn btn-error btn-sm"
    >
      Delete
    </button>
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden space-y-3">
            {users.map((user, index) => (
              <div
                key={user._id}
                className="bg-white border rounded-xl shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                  <span className="text-sm font-semibold text-gray-500">
                    User #{index + 1}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      user.role === "admin"
                        ? "badge-primary"
                        : "badge-ghost"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="px-4 py-3">
                  <p className="text-sm font-medium truncate mb-3">
                    {user.email}
                  </p>

                  <div className="flex gap-2">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => makeAdmin(user._id)}
                        className="btn btn-warning btn-sm flex-1"
                      >
                        Make Admin
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="btn btn-error btn-sm flex-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
