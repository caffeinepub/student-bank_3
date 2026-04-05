import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { useActor } from "./hooks/useActor";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useSyncGlobalActor } from "./hooks/useQueries";
import AccountPage from "./pages/AccountPage";
import BankDetailsPage from "./pages/BankDetailsPage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import ImportExportPage from "./pages/ImportExportPage";
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
  | "bank-details"
  | "import-export";

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
  const [currentPage, setCurrentPage] = useState<PageId>(
    isAdmin ? "home" : "passbook",
  );
  // Keep global actor store in sync so all mutations can access the latest actor
  useSyncGlobalActor();
  const { actor, isFetching: actorFetching } = useActor();

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
        return <HistoryPage />;
      case "passbook":
        return <PassbookPage />;
      case "bank-details":
        return <BankDetailsPage />;
      case "import-export":
        return isAdmin ? <ImportExportPage /> : <PassbookPage />;
      default:
        return <HomePage />;
    }
  };

  const pageTitle = {
    home: "Dashboard",
    students: "Students",
    accounts: "Accounts",
    transactions: "Transactions",
    history: "History",
    passbook: "Passbook",
    "bank-details": "Bank Details",
    "import-export": "Import / Export",
  }[currentPage];

  const pageSubtitle = {
    home: "Overview of all activities",
    students: "Manage student records",
    accounts: "Manage bank accounts",
    transactions: "Manage transactions",
    history: isAdmin ? "View transaction history" : "तुमचा व्यवहार इतिहास",
    passbook: isAdmin ? "View passbook" : "तुमचे पासबुक",
    "bank-details": "Bank Details",
    "import-export": "माहिती backup आणि restore",
  }[currentPage];

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      actorLoading={actorFetching && !actor}
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
