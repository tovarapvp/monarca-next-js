"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return isAdminPage ? null : <Header />;
}
