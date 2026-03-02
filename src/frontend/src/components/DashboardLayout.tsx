import { Loader2, Menu } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Sidebar, { type PageId } from "./Sidebar";

interface DashboardLayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  actorLoading?: boolean;
}

export default function DashboardLayout({
  currentPage,
  onNavigate,
  children,
  pageTitle,
  pageSubtitle,
  actorLoading = false,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.97 0.008 200)" }}
    >
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar - colorful gradient header */}
        <header
          className="shrink-0 px-4 py-3 flex items-center gap-3 no-print shadow-md"
          style={{
            background: isAdmin
              ? "linear-gradient(135deg, oklch(0.28 0.10 240), oklch(0.20 0.08 210))"
              : "linear-gradient(135deg, oklch(0.65 0.20 35), oklch(0.50 0.18 20))",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl transition-colors text-white/80 hover:text-white hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-lg font-heading leading-tight truncate drop-shadow">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-white/60 text-xs truncate">{pageSubtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {isAdmin ? "🔑 Admin" : "👤 User"}
            </div>
          </div>
        </header>

        {/* Actor loading banner */}
        {actorLoading && (
          <div
            className="shrink-0 px-4 py-2 flex items-center gap-2 text-xs font-medium no-print"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.75 0.18 200), oklch(0.65 0.20 220))",
              color: "white",
            }}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Server शी जोडत आहे… कृपया थांबा</span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
