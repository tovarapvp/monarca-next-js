"use client";

import { usePathname } from "@/i18n/navigation";
import Header from "@/components/header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  // usePathname from i18n/navigation returns path without locale prefix
  const isAdminPage = pathname.startsWith("/admin");

  return isAdminPage ? null : <Header />;
}
