import {
  ArrowLeftRight,
  BookOpen,
  Building2,
  ChevronRight,
  CreditCard,
  Download,
  GraduationCap,
  History,
  Home,
  LogOut,
  X,
} from "lucide-react";
import type React from "react";
import { useAuth } from "../hooks/useAuth";

export type PageId =
  | "home"
  | "students"
  | "accounts"
  | "transactions"
  | "history"
  | "passbook"
  | "bank-details"
  | "import-export";

interface NavItem {
  id: PageId;
  label: string;
  labelMr: string;
  icon: React.ReactNode;
  adminOnly: boolean;
  gradient: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    labelMr: "मुख्यपृष्ठ",
    icon: <Home className="w-5 h-5" />,
    adminOnly: true,
    gradient: "gradient-teal",
  },
  {
    id: "students",
    label: "Students",
    labelMr: "विद्यार्थी",
    icon: <GraduationCap className="w-5 h-5" />,
    adminOnly: true,
    gradient: "gradient-green",
  },
  {
    id: "accounts",
    label: "Accounts",
    labelMr: "खाते",
    icon: <CreditCard className="w-5 h-5" />,
    adminOnly: true,
    gradient: "gradient-orange",
  },
  {
    id: "transactions",
    label: "Transactions",
    labelMr: "व्यवहार",
    icon: <ArrowLeftRight className="w-5 h-5" />,
    adminOnly: true,
    gradient: "gradient-purple",
  },
  {
    id: "history",
    label: "History",
    labelMr: "इतिहास",
    icon: <History className="w-5 h-5" />,
    adminOnly: false,
    gradient: "gradient-red",
  },
  {
    id: "passbook",
    label: "Passbook Print",
    labelMr: "पासबुक प्रिंट",
    icon: <BookOpen className="w-5 h-5" />,
    adminOnly: false,
    gradient: "gradient-green",
  },
  {
    id: "bank-details",
    label: "Bank Details",
    labelMr: "बँक माहिती",
    icon: <Building2 className="w-5 h-5" />,
    adminOnly: false,
    gradient: "gradient-teal",
  },
  {
    id: "import-export",
    label: "Import / Export",
    labelMr: "माहिती backup",
    icon: <Download className="w-5 h-5" />,
    adminOnly: true,
    gradient: "gradient-purple",
  },
];

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const { userAccountNumber, logout, isAdmin } = useAuth();

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleNavigate = (page: PageId) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-default"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 gradient-sidebar flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center shrink-0">
              <img
                src="/assets/generated/bank-logo.dim_256x256.png"
                alt="Logo"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-base font-heading leading-tight">
                Student Bank
              </h2>
              <p className="text-white/50 text-xs">विद्यार्थी बँक</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                isAdmin ? "gradient-green" : "gradient-orange"
              }`}
            >
              {isAdmin
                ? "A"
                : userAccountNumber?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {isAdmin ? "Administrator" : `Account: ${userAccountNumber}`}
              </p>
              <p
                className={`text-xs font-medium ${isAdmin ? "text-green-400" : "text-orange-400"}`}
              >
                {isAdmin ? "● Admin" : "● User"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    data-ocid={`nav.${item.id}.link`}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                      isActive
                        ? "bg-white/15 text-white shadow-md"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? item.gradient
                          : "bg-white/10 group-hover:bg-white/15"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-sm leading-tight">
                        {item.label}
                      </p>
                      <p className="text-xs opacity-60 leading-tight">
                        {item.labelMr}
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={logout}
            data-ocid="nav.logout.button"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Logout / बाहेर पडा</span>
          </button>
        </div>
      </aside>
    </>
  );
}
