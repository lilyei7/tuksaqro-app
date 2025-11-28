"use client"

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";
import PrefetchProvider from "@/components/providers/PrefetchProvider";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const isAdminPanel = pathname?.startsWith("/sistema-control") || pathname?.startsWith("/admin/login")

  return (
    <AuthProvider>
      <PrefetchProvider />
      {!isAdminPanel && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      {!isAdminPanel && <Footer />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}