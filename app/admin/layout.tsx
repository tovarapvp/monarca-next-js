"use client";

import { usePathname } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
