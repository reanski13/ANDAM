"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-glass text-on-sky hover:bg-glass-elevated font-title-sm transition duration-200 active:scale-95 disabled:opacity-60"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}