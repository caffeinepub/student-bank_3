import {
  BookOpen,
  Building2,
  Download,
  Printer,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useGetAllAccounts,
  useGetAllStudents,
  useGetTransactionsByAccount,
} from "../hooks/useQueries";

export default function PassbookPage() {
  const { userAccountNumber, isAdmin } = useAuth();
  const { data: accounts = [] } = useGetAllAccounts();
  const { data: students = [] } = useGetAllStudents();

  const defaultAccNum = isAdmin ? "" : userAccountNumber || "";
  const [inputAccNum, setInputAccNum] = useState(defaultAccNum);
  const [lookupAccNum, setLookupAccNum] = useState(
    isAdmin ? "" : defaultAccNum,
  );

  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactionsByAccount(lookupAccNum);

  const account =
    accounts.find((a) => a.accountNumber === lookupAccNum) || null;
  const student = account
    ? students.find((s) => s.id === account.studentId) || null
    : null;

  const handleLookup = () => {
    if (!inputAccNum.trim()) return;
    if (!isAdmin && inputAccNum.trim() !== userAccountNumber) {
      alert("You can only view your own account passbook.");
      return;
    }
    setLookupAccNum(inputAccNum.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const totalDeposits = transactions
    .filter((t) => t.transactionType === "Deposit")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.transactionType === "Withdrawal")
    .reduce((s, t) => s + Number(t.amount), 0);

  const currentBalance = account
    ? Number(account.initialAmount) + totalDeposits - totalWithdrawals
    : 0;

  const sortedTransactions = [...transactions].sort(
    (a, b) => Number(a.date) - Number(b.date),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground">
          Passbook Print
        </h2>
        <p className="text-muted-foreground text-sm">पासबुक प्रिंट करा</p>
      </div>

      {/* Lookup Panel */}
      <div className="bg-card rounded-2xl border border-border card-shadow p-5 no-print">
        <h3 className="font-bold text-foreground font-heading mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          Account Lookup
        </h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={inputAccNum}
            onChange={(e) => setInputAccNum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="Enter account number"
            readOnly={!isAdmin}
            className={`flex-1 border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              !isAdmin ? "bg-muted cursor-not-allowed" : ""
            }`}
          />
          <button
            type="button"
            onClick={handleLookup}
            className="px-5 py-2.5 rounded-xl gradient-green text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:opacity-90"
          >
            <Search className="w-4 h-4" />
            View
          </button>
        </div>

        {!isAdmin && (
          <p className="text-muted-foreground text-xs mt-2">
            You can only view your own account passbook
          </p>
        )}
      </div>

      {/* Passbook Content */}
      {lookupAccNum && (
        <div id="passbook-print-area">
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
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "0 0 4px 0",
                }}
              >
                {account?.bankName || "Student Bank"}
              </h1>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "0 0 4px 0",
                }}
              >
                STUDENT BANK PASSBOOK / विद्यार्थी बँक पासबुक
              </h2>
              {student && (
                <p style={{ fontSize: "13px", margin: "0" }}>
                  {student.schoolName} | {student.taluka}, {student.district}
                </p>
              )}
            </div>

            {/* Student + Account info in print */}
            <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
              {student && (
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
                      fontSize: "13px",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "4px",
                      marginBottom: "8px",
                      margin: "0 0 8px 0",
                    }}
                  >
                    विद्यार्थी माहिती / Student Information
                  </h3>
                  <table
                    style={{
                      width: "100%",
                      fontSize: "12px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          नाव / Name:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          जन्म दिनांक / D.O.B:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.dateOfBirth}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          इयत्ता / Class:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.className}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          हजेरी क्र. / Att. No.:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.attendanceNumber.toString()}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          शाळा / School:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.schoolName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          तालुका / Taluka:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.taluka}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          जिल्हा / District:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {student.district}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {account && (
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
                      fontSize: "13px",
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
                      fontSize: "12px",
                      borderCollapse: "collapse",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          खाते क्र. / Account No.:
                        </td>
                        <td
                          style={{
                            padding: "3px 6px",
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          }}
                        >
                          {account.accountNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          बँक नाव / Bank Name:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          {account.bankName}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          IFSC Code:
                        </td>
                        <td
                          style={{
                            padding: "3px 6px",
                            fontWeight: "bold",
                            fontFamily: "monospace",
                          }}
                        >
                          {account.ifscCode}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          प्रारंभिक रक्कम / Initial Amount:
                        </td>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          ₹
                          {Number(account.initialAmount).toLocaleString(
                            "en-IN",
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          एकूण जमा / Total Deposits:
                        </td>
                        <td
                          style={{
                            padding: "3px 6px",
                            fontWeight: "bold",
                            color: "green",
                          }}
                        >
                          ₹{totalDeposits.toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 6px", color: "#555" }}>
                          एकूण काढणे / Total Withdrawals:
                        </td>
                        <td
                          style={{
                            padding: "3px 6px",
                            fontWeight: "bold",
                            color: "red",
                          }}
                        >
                          ₹{totalWithdrawals.toLocaleString("en-IN")}
                        </td>
                      </tr>
                      <tr style={{ background: "#f0f0f0" }}>
                        <td style={{ padding: "3px 6px", fontWeight: "bold" }}>
                          शिल्लक / Balance:
                        </td>
                        <td
                          style={{
                            padding: "3px 6px",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          ₹{currentBalance.toLocaleString("en-IN")}
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
                fontSize: "14px",
                margin: "0 0 8px 0",
                borderBottom: "1px solid #000",
                paddingBottom: "4px",
              }}
            >
              व्यवहार तपशील / Transaction Details ({sortedTransactions.length}{" "}
              transactions)
            </h3>
          </div>

          {/* Print / Download Buttons */}
          <div className="flex gap-3 mb-4 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-green text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Printer className="w-4 h-4" />
              Print Passbook
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-teal text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {account ? (
            <>
              {/* Info Section — screen only */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 no-print">
                {/* Student Info */}
                {student && (
                  <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full gradient-green flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground font-heading">
                          {student.name}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {student.className} · {student.schoolName}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm border-t border-border pt-3">
                      {[
                        { label: "जन्म दिनांक", value: student.dateOfBirth },
                        {
                          label: "हजेरी क्र.",
                          value: student.attendanceNumber.toString(),
                        },
                        { label: "तालुका", value: student.taluka },
                        { label: "जिल्हा", value: student.district },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-2">
                          <span className="text-muted-foreground">
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

                {/* Account & Bank Info */}
                <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full gradient-orange flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground font-heading">
                        {account.bankName}
                      </h4>
                      <p className="text-muted-foreground text-xs font-mono">
                        {account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t border-border pt-3">
                    {[
                      { label: "IFSC Code", value: account.ifscCode },
                      {
                        label: "Initial Amount",
                        value: `₹${Number(account.initialAmount).toLocaleString("en-IN")}`,
                      },
                      {
                        label: "Total Deposits",
                        value: `₹${totalDeposits.toLocaleString("en-IN")}`,
                      },
                      {
                        label: "Total Withdrawals",
                        value: `₹${totalWithdrawals.toLocaleString("en-IN")}`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{label}:</span>
                        <span className="font-semibold text-foreground text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 rounded-xl gradient-green text-white text-center">
                    <p className="text-xs font-medium opacity-80">
                      Current Balance / शिल्लक
                    </p>
                    <p className="text-2xl font-bold font-heading">
                      ₹{currentBalance.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
                <div className="p-4 border-b border-border gradient-green no-print">
                  <h3 className="font-bold text-white font-heading">
                    Transaction History / व्यवहार इतिहास
                  </h3>
                  <p className="text-white/70 text-xs">
                    {sortedTransactions.length} transactions
                  </p>
                </div>

                {txLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading transactions...
                  </div>
                ) : sortedTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm passbook-table">
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
                        {sortedTransactions.map((t, i) => (
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
                              ₹
                              {Number(t.runningBalance).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
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
                      This is a computer-generated passbook. No signature
                      required.
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0", fontWeight: "bold" }}>
                      vaibhavgavali
                    </p>
                    <p style={{ margin: "0" }}>
                      © {new Date().getFullYear()} Student Bank
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-8 text-center card-shadow">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                Account not found
              </p>
              <p className="text-muted-foreground text-sm">
                Please check the account number and try again
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-xs py-4 no-print">
        <p>vaibhavgavali · © {new Date().getFullYear()} Student Bank</p>
      </footer>
    </div>
  );
}
