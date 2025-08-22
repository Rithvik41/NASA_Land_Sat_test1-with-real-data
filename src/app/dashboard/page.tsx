
"use client";

import { Dashboard } from "@/components/dashboard";
import { Header } from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  );
}
