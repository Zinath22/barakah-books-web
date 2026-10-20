

// // import NextAuth from "next-auth";
// // import CredentialsProvider from "next-auth/providers/credentials";
// // import { dbConnect } from "@/lib/dbConnect";
// // import bcrypt from "bcryptjs";

// // const handler = NextAuth({
// //   providers: [
// //     CredentialsProvider({
// //       name: "Credentials",

// //       credentials: {
// //         email: { label: "Email", type: "text" },
// //         password: { label: "Password", type: "password" },
// //       },

// //       async authorize(credentials) {
// //         if (!credentials?.email || !credentials?.password) {
// //           throw new Error("Missing credentials");
// //         }

        

// //         const db = await dbConnect();

// //         const user = await db.collection("users").findOne({
// //           email: credentials.email,
// //         });

// //         if (!user) {
// //           throw new Error("User not found");
// //         }

// //         const isValid = await bcrypt.compare(
// //           credentials.password,
// //           user.password
// //         );

// //         if (!isValid) {
// //           throw new Error("Invalid password");
// //         }

// //         if (!user.verified) {
// //           throw new Error("Please verify your email first");
// //         }

// //         return {
// //           id: user._id.toString(),
// //           name: user.name,
// //           email: user.email,
// //           role: user.role,
// //         };
// //       },
// //     }),
// //   ],

// //   session: {
// //     strategy: "jwt",
// //   },

// //   pages: {
// //     signIn: "/login",
// //   },

// //   secret: process.env.NEXTAUTH_SECRET,
// // });

// // export { handler as GET, handler as POST };


import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { dbConnect } from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const db = await dbConnect();

          // 🔍 find user
          const user = await db.collection("users").findOne({
            email: credentials.email,
          });

          if (!user) {
            throw new Error("User not found");
          }

          // 🔐 password check
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          // 🔥 EMAIL VERIFICATION CHECK (IMPORTANT)
          // if (!user.verified) {
          //   throw new Error("Please verify your email first");
          // }

          // ✅ return user
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
          };

        } catch (error) {
          console.log("❌ AUTH ERROR:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  debug: process.env.NODE_ENV === "development",

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };