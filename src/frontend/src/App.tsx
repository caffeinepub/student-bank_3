import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AccountPage from "./pages/AccountPage";
import BankDetailsPage from "./pages/BankDetailsPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PassbookPage from "./pages/PassbookPage";
import StudentPage from "./pages/StudentPage";
import TransactionPage from "./pages/TransactionPage";

export type PageId =
  | "home"
  | "students"
  | "accounts"
  | "transactions"
  | "history"
  | "passbook"
  | "bank-details";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppInner() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>("home");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "students":
        return isAdmin ? <StudentPage /> : <PassbookPage />;
      case "accounts":
        return isAdmin ? <AccountPage /> : <PassbookPage />;
      case "transactions":
        return isAdmin ? <TransactionPage /> : <PassbookPage />;
      case "history":
        return isAdmin ? <HistoryPage /> : <PassbookPage />;
      case "passbook":
        return <PassbookPage />;
      case "bank-details":
        return isAdmin ? <BankDetailsPage /> : <PassbookPage />;
      default:
        return <HomePage />;
    }
  };

  const pageTitle = {
    home: "Dashboard",
    students: isAdmin ? "Students" : "Passbook",
    accounts: isAdmin ? "Accounts" : "Passbook",
    transactions: isAdmin ? "Transactions" : "Passbook",
    history: "History",
    passbook: "Passbook",
    "bank-details": "Bank Details",
  }[currentPage];

  const pageSubtitle = {
    home: "Overview of all activities",
    students: isAdmin ? "Manage student records" : "Your passbook",
    accounts: isAdmin ? "Manage bank accounts" : "Your passbook",
    transactions: isAdmin ? "Manage transactions" : "Your passbook",
    history: "View transaction history",
    passbook: "View your passbook",
    "bank-details": "Manage bank details",
  }[currentPage];

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
    >
      {renderPage()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
