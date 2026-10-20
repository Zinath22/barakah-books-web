import "@fontsource/hind-siliguri/300.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "./globals.css";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import AuthProvider from "@/provider/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata = {
  title: {
    default: "বারাকাহ বুকস | ইসলামিক বইয়ের অনলাইন দোকান",
    template: "%s | বারাকাহ বুকস",
  },
  description:
    "কুরআন, তাফসীর, হাদিস, সীরাত, ফিকহ ও শিশুদের ইসলামিক বই — সারাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি।",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col antialiased bg-base-200 font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <header className="w-full">
                <Navbar />
              </header>

              <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">{children}</div>
              </main>

              <footer className="w-full mt-auto">
                <Footer />
              </footer>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
