import React, { useState } from 'react';
import { useGetAllAccounts, useGetAllStudents, useGetTransactionsByAccount } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Search, Printer, TrendingUp, TrendingDown, Building2 } from 'lucide-react';

export default function PassbookPage() {
  const { userAccountNumber, isAdmin } = useAuth();
  const { data: accounts = [] } = useGetAllAccounts();
  const { data: students = [] } = useGetAllStudents();

  // For user role, auto-populate with their account number
  const defaultAccNum = isAdmin ? '' : (userAccountNumber || '');
  const [inputAccNum, setInputAccNum] = useState(defaultAccNum);
  const [lookupAccNum, setLookupAccNum] = useState(isAdmin ? '' : defaultAccNum);

  const { data: transactions = [], isLoading: txLoading } = useGetTransactionsByAccount(lookupAccNum);

  const account = accounts.find((a) => a.accountNumber === lookupAccNum) || null;
  const student = account ? students.find((s) => s.id === account.studentId) || null : null;

  const handleLookup = () => {
    if (!inputAccNum.trim()) return;
    // User can only view their own account
    if (!isAdmin && inputAccNum.trim() !== userAccountNumber) {
      alert('You can only view your own account passbook.');
      return;
    }
    setLookupAccNum(inputAccNum.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDeposits = transactions
    .filter((t) => t.transactionType === 'Deposit')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.transactionType === 'Withdrawal')
    .reduce((s, t) => s + Number(t.amount), 0);

  const currentBalance = account
    ? Number(account.initialAmount) + totalDeposits - totalWithdrawals
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground">Passbook Print</h2>
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
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Enter account number"
            readOnly={!isAdmin}
            className={`flex-1 border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              !isAdmin ? 'bg-muted cursor-not-allowed' : ''
            }`}
          />
          <button
            onClick={handleLookup}
            className="px-5 py-2.5 rounded-xl gradient-green text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:opacity-90"
          >
            <Search className="w-4 h-4" />
            View
          </button>
        </div>

        {!isAdmin && (
          <p className="text-muted-foreground text-xs mt-2">
            💡 You can only view your own account passbook
          </p>
        )}
      </div>

      {/* Passbook Content */}
      {lookupAccNum && (
        <div id="passbook-print-area">
          {/* Print Header */}
          <div className="print-only text-center mb-6 border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold">Student Bank</h1>
            <p className="text-lg">विद्यार्थी बँक</p>
            <h2 className="text-xl font-semibold mt-2">PASSBOOK / पासबुक</h2>
          </div>

          {/* Print Button */}
          <div className="flex justify-end mb-4 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-green text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Printer className="w-4 h-4" />
              Print Passbook
            </button>
          </div>

          {account ? (
            <>
              {/* Info Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Student Info */}
                {student && (
                  <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full gradient-green flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground font-heading">{student.name}</h4>
                        <p className="text-muted-foreground text-xs">{student.className} · {student.schoolName}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm border-t border-border pt-3">
                      {[
                        { label: 'Date of Birth', value: student.dateOfBirth },
                        { label: 'Attendance No.', value: student.attendanceNumber.toString() },
                        { label: 'Taluka', value: student.taluka },
                        { label: 'District', value: student.district },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-2">
                          <span className="text-muted-foreground">{label}:</span>
                          <span className="font-semibold text-foreground text-right">{value}</span>
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
                      <h4 className="font-bold text-foreground font-heading">{account.bankName}</h4>
                      <p className="text-muted-foreground text-xs font-mono">{account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm border-t border-border pt-3">
                    {[
                      { label: 'IFSC Code', value: account.ifscCode },
                      { label: 'Initial Amount', value: `₹${Number(account.initialAmount).toLocaleString('en-IN')}` },
                      { label: 'Total Deposits', value: `₹${totalDeposits.toLocaleString('en-IN')}` },
                      { label: 'Total Withdrawals', value: `₹${totalWithdrawals.toLocaleString('en-IN')}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{label}:</span>
                        <span className="font-semibold text-foreground text-right">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Balance */}
                  <div className="mt-3 p-3 rounded-xl gradient-green text-white text-center">
                    <p className="text-xs font-medium opacity-80">Current Balance / शिल्लक</p>
                    <p className="text-2xl font-bold font-heading">₹{currentBalance.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
                <div className="p-4 border-b border-border gradient-green">
                  <h3 className="font-bold text-white font-heading">Transaction History / व्यवहार इतिहास</h3>
                  <p className="text-white/70 text-xs">{transactions.length} transactions</p>
                </div>

                {txLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">#</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                          <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Reason</th>
                          <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {transactions.map((t, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                            <td className="px-4 py-3 text-foreground text-xs">
                              {new Date(Number(t.date) / 1_000_000).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                t.transactionType === 'Deposit'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {t.transactionType === 'Deposit'
                                  ? <TrendingUp className="w-3 h-3" />
                                  : <TrendingDown className="w-3 h-3" />
                                }
                                {t.transactionType}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${
                              t.transactionType === 'Deposit' ? 'text-green-600' : 'text-red-500'
                            }`}>
                              {t.transactionType === 'Deposit' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{t.reason}</td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                              ₹{Number(t.runningBalance).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/50">
                          <td colSpan={3} className="px-4 py-3 font-bold text-foreground text-sm">
                            Current Balance
                          </td>
                          <td colSpan={3} className="px-4 py-3 text-right font-bold text-lg text-green-600">
                            ₹{currentBalance.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Print Footer */}
              <div className="print-only mt-8 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
                <p>This is a computer-generated passbook. No signature required.</p>
                <p>Printed on: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-8 text-center card-shadow">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Account not found</p>
              <p className="text-muted-foreground text-sm">Please check the account number and try again</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-xs py-4 no-print">
        <p>
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'student-bank')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>{' '}
          · © {new Date().getFullYear()} Student Bank
        </p>
      </footer>
    </div>
  );
}
