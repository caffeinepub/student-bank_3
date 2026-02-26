import React, { useState } from 'react';
import Sidebar, { type PageId } from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DashboardLayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
}

export default function DashboardLayout({
  currentPage,
  onNavigate,
  children,
  pageTitle,
  pageSubtitle,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="shrink-0 bg-card border-b border-border px-4 py-3 flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground text-lg font-heading leading-tight truncate">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-muted-foreground text-xs truncate">{pageSubtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                isAdmin ? 'gradient-green' : 'gradient-orange'
              }`}
            >
              {isAdmin ? 'Admin' : 'User'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
