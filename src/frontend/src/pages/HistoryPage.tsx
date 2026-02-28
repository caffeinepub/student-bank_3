import {
  Download,
  Printer,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import type { Account, Student, Transaction } from "../backend";
import { useActor } from "../hooks/useActor";
import { useGetAllAccounts, useGetAllStudents } from "../hooks/useQueries";
import { exportTransactionsCSV } from "../utils/exportCSV";

export default function HistoryPage() {
  const { actor } = useActor();
  const { data: accounts = [] } = useGetAllAccounts();
  const { data: students = [] } = useGetAllStudents();

  const [searchAccNum, setSearchAccNum] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchResult, setSearchResult] = useState<{
    account: Account | null;
    student: Student | null;
    transactions: Transaction[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchAccNum.trim()) {
      setError("Please enter an account number");
      return;
    }
    setError("");
    setIsSearching(true);

    try {
      const account =
        accounts.find((a) => a.accountNumber === searchAccNum.trim()) || null;
      if (!account) {
        setError("Account not found. Please check the account number.");
        setSearchResult(null);
        setIsSearching(false);
        return;
      }

      const student = students.find((s) => s.id === account.studentId) || null;

      let txs: Transaction[] = [];
      if (actor) {
        if (dateFrom && dateTo) {
          const startMs = new Date(dateFrom).getTime();
          const endMs = new Date(dateTo).getTime() + 86400000;
          const startNs = BigInt(startMs) * BigInt(1_000_000);
          const endNs = BigInt(endMs) * BigInt(1_000_000);
          const allTxs = await actor.getTransactionsByDateRange(startNs, endNs);
          txs = allTxs.filter((t) => t.accountNumber === searchAccNum.trim());
        } else {
          txs = await actor.getTransactionsByAccount(searchAccNum.trim());
        }
      }

      // Sort by date ascending
      txs = [...txs].sort((a, b) => Number(a.date) - Number(b.date));

      setSearchResult({ account, student, transactions: txs });
    } catch {
      setError("Error fetching data. Please try again.");
    }
    setIsSearching(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (searchResult) {
      exportTransactionsCSV(
        searchResult.transactions,
        searchAccNum,
        searchResult.student?.name,
      );
    }
  };

  const totalDeposits =
    searchResult?.transactions
      .filter((t) => t.transactionType === "Deposit")
      .reduce((s, t) => s + Number(t.amount), 0) ?? 0;

  const totalWithdrawals =
    searchResult?.transactions
      .filter((t) => t.transactionType === "Withdrawal")
      .reduce((s, t) => s + Number(t.amount), 0) ?? 0;

  const currentBalance = searchResult?.account
    ? Number(searchResult.account.initialAmount) +
      totalDeposits -
      totalWithdrawals
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground">
          History
        </h2>
        <p className="text-muted-foreground text-sm">व्यवहार इतिहास शोधा</p>
      </div>

      {/* Search Panel */}
      <div className="bg-card rounded-2xl border border-border card-shadow p-5 no-print">
        <h3 className="font-bold text-foreground font-heading mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-red flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          Search Transactions
        </h3>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="history-acc-num"
              className="block text-sm font-semibold text-foreground mb-1"
            >
              Account Number{" "}
              <span className="text-muted-foreground font-normal">
                (खाते क्रमांक)
              </span>
            </label>
            <input
              id="history-acc-num"
              type="text"
              value={searchAccNum}
              onChange={(e) => setSearchAccNum(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter account number"
              className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="history-date-from"
                className="block text-sm font-semibold text-foreground mb-1"
              >
                From Date{" "}
                <span className="text-muted-foreground font-normal">
                  (पासून)
                </span>
              </label>
              <input
                id="history-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label
                htmlFor="history-date-to"
                className="block text-sm font-semibold text-foreground mb-1"
              >
                To Date{" "}
                <span className="text-muted-foreground font-normal">
                  (पर्यंत)
                </span>
              </label>
              <input
                id="history-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full py-3 rounded-xl gradient-red text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search Transactions
          </button>
        </div>
      </div>

      {/* Results */}
      {searchResult && (
        <div id="history-print-area">
          {/* ===== PRINT HEADER (only visible on print) ===== */}
          <div className="print-only">
            <div
              style={{
                textAlign: "center",
                borderBottom: "3px double #000",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  margin: "0 0 4px 0",
                }}
              >
                {searchResult.account?.bankName || "Student Bank"}
              </h1>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  margin: "0 0 4px 0",
                }}
              >
                TRANSACTION HISTORY / व्यवहार इतिहास
              </h2>
              <p style={{ fontSize: "12px", margin: "0" }}>
                Account: {searchAccNum}
                {dateFrom && dateTo
                  ? ` | Period: ${dateFrom} to ${dateTo}`
                  : " | All Transactions"}
              </p>
            </div>

            {/* Student + Account info in print */}
            <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
              {searchResult.student && (
                <div
                  style={{
                    flex: 1,
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    विद्यार्थी माहिती / Student Information
                  </h3>
                  <table
                    style={{
                      width: "100%",
                      fontSize: "11px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          नाव / Name:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          जन्म दिनांक / D.O.B:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.dateOfBirth}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          इयत्ता / Class:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.className}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          हजेरी क्र. / Att. No.:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.attendanceNumber.toString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          शाळा / School:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.schoolName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          तालुका:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.taluka}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          जिल्हा / District:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.student.district}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {searchResult.account && (
                <div
                  style={{
                    flex: 1,
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    खाते / बँक माहिती · Account / Bank Info
                  </h3>
                  <table
                    style={{
                      width: "100%",
                      fontSize: "11px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          खाते क्र. / Account No.:
                        </td>
                        <td
                          style={{
                            padding: "2px 6px",
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          }}
                        >
                          {searchResult.account.accountNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          बँक नाव / Bank:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          {searchResult.account.bankName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          IFSC Code:
                        </td>
                        <td
                          style={{
                            padding: "2px 6px",
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          }}
                        >
                          {searchResult.account.ifscCode}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "2px 6px", color: "#555" }}>
                          Initial Amount:
                        </td>
                        <td style={{ padding: "2px 6px", fontWeight: "bold" }}>
                          ₹
                          {Number(
                            searchResult.account.initialAmount,
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <h3
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                margin: "0 0 8px 0",
                borderBottom: "1px solid #000",
                paddingBottom: "4px",
              }}
            >
              व्यवहार तपशील / Transactions ({searchResult.transactions.length})
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-teal text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-green text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>

          {/* Info Cards — screen only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 no-print">
            {searchResult.student && (
              <div className="bg-card rounded-2xl border border-border p-4 card-shadow">
                <h4 className="font-bold font-heading mb-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Student Information / विद्यार्थी माहिती
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Name", value: searchResult.student.name },
                    { label: "Class", value: searchResult.student.className },
                    {
                      label: "Attendance No.",
                      value: searchResult.student.attendanceNumber.toString(),
                    },
                    { label: "School", value: searchResult.student.schoolName },
                    { label: "Taluka", value: searchResult.student.taluka },
                    { label: "District", value: searchResult.student.district },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {label}:
                      </span>
                      <span className="font-semibold text-foreground text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResult.account && (
              <div className="bg-card rounded-2xl border border-border p-4 card-shadow">
                <h4 className="font-bold font-heading mb-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Account Information / खाते माहिती
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    {
                      label: "Account No.",
                      value: searchResult.account.accountNumber,
                    },
                    {
                      label: "Bank Name",
                      value: searchResult.account.bankName,
                    },
                    {
                      label: "IFSC Code",
                      value: searchResult.account.ifscCode,
                    },
                    {
                      label: "Initial Amount",
                      value: `₹${Number(searchResult.account.initialAmount).toLocaleString("en-IN")}`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">
                        {label}:
                      </span>
                      <span className="font-semibold text-foreground text-right font-mono">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">
                      Total Deposits:
                    </span>
                    <span className="font-bold text-green-600">
                      ₹{totalDeposits.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500 font-medium">
                      Total Withdrawals:
                    </span>
                    <span className="font-bold text-red-500">
                      ₹{totalWithdrawals.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
            <div className="p-4 border-b border-border no-print">
              <h3 className="font-bold text-foreground font-heading">
                Transactions ({searchResult.transactions.length})
              </h3>
            </div>
            {searchResult.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground font-medium">
                  No transactions found
                </p>
                <p className="text-muted-foreground text-sm">
                  {dateFrom && dateTo
                    ? "No transactions in the selected date range"
                    : "No transactions for this account"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm history-table">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Date / तारीख
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Type / प्रकार
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Amount / रक्कम
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Reason / कारण
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Balance / शिल्लक
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(() => {
                      let runningBal = searchResult.account
                        ? Number(searchResult.account.initialAmount)
                        : 0;
                      return searchResult.transactions.map((t, i) => {
                        if (t.transactionType === "Deposit") {
                          runningBal += Number(t.amount);
                        } else {
                          runningBal -= Number(t.amount);
                        }
                        const balAfter = runningBal;
                        return (
                          <tr
                            key={t.id.toString()}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 text-foreground text-xs">
                              {new Date(
                                Number(t.date) / 1_000_000,
                              ).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  t.transactionType === "Deposit"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {t.transactionType === "Deposit" ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {t.transactionType === "Deposit"
                                  ? "जमा"
                                  : "काढणे"}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${
                                t.transactionType === "Deposit"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {t.transactionType === "Deposit" ? "+" : "-"}₹
                              {Number(t.amount).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {t.reason}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                              ₹{balAfter.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/50">
                      <td
                        colSpan={3}
                        className="px-4 py-3 font-bold text-foreground text-sm"
                      >
                        शिल्लक / Current Balance
                      </td>
                      <td
                        colSpan={3}
                        className="px-4 py-3 text-right font-bold text-lg text-green-600"
                      >
                        ₹{currentBalance.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Print-only Current Balance Summary */}
          <div className="print-only" style={{ marginTop: "12px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                borderTop: "2px solid #000",
              }}
            >
              <tbody>
                <tr style={{ background: "#e8f5e9" }}>
                  <td
                    style={{
                      padding: "8px 12px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    एकूण जमा / Total Deposits:
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "green",
                      textAlign: "right",
                    }}
                  >
                    ₹{totalDeposits.toLocaleString("en-IN")}
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    एकूण काढणे / Total Withdrawals:
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "red",
                      textAlign: "right",
                    }}
                  >
                    ₹{totalWithdrawals.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr
                  style={{ background: "#f0f0f0", borderTop: "2px solid #000" }}
                >
                  <td
                    colSpan={2}
                    style={{
                      padding: "10px 12px",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    शिल्लक / Current Balance:
                  </td>
                  <td
                    colSpan={2}
                    style={{
                      padding: "10px 12px",
                      fontWeight: "bold",
                      fontSize: "18px",
                      textAlign: "right",
                      color: "#1a7a1a",
                    }}
                  >
                    ₹{currentBalance.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Print Footer */}
          <div className="print-only mt-8 pt-4 border-t border-gray-400">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#555",
              }}
            >
              <div>
                <p style={{ margin: "0" }}>
                  Printed on: {new Date().toLocaleDateString("en-IN")}
                </p>
                <p style={{ margin: "0" }}>
                  This is a computer-generated statement. No signature required.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0", fontWeight: "bold" }}>vaibhavgavali</p>
                <p style={{ margin: "0" }}>
                  © {new Date().getFullYear()} Student Bank
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-xs py-4 no-print">
        <p>vaibhavgavali · © {new Date().getFullYear()} Student Bank</p>
      </footer>
    </div>
  );
}
