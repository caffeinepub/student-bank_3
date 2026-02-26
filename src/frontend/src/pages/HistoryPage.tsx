import React, { useState } from 'react';
import { useGetAllAccounts, useGetAllStudents } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { exportTransactionsCSV } from '../utils/exportCSV';
import type { Account, Student, Transaction } from '../backend';
import { Search, Printer, Download, TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoryPage() {
  const { actor } = useActor();
  const { data: accounts = [] } = useGetAllAccounts();
  const { data: students = [] } = useGetAllStudents();

  const [searchAccNum, setSearchAccNum] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchResult, setSearchResult] = useState<{
    account: Account | null;
    student: Student | null;
    transactions: Transaction[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchAccNum.trim()) {
      setError('Please enter an account number');
      return;
    }
    setError('');
    setIsSearching(true);

    try {
      const account = accounts.find((a) => a.accountNumber === searchAccNum.trim()) || null;
      if (!account) {
        setError('Account not found. Please check the account number.');
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

      setSearchResult({ account, student, transactions: txs });
    } catch {
      setError('Error fetching data. Please try again.');
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
        searchResult.student?.name
      );
    }
  };

  const totalDeposits = searchResult?.transactions
    .filter((t) => t.transactionType === 'Deposit')
    .reduce((s, t) => s + Number(t.amount), 0) ?? 0;

  const totalWithdrawals = searchResult?.transactions
    .filter((t) => t.transactionType === 'Withdrawal')
    .reduce((s, t) => s + Number(t.amount), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground">History</h2>
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
            <label className="block text-sm font-semibold text-foreground mb-1">
              Account Number <span className="text-muted-foreground font-normal">(खाते क्रमांक)</span>
            </label>
            <input
              type="text"
              value={searchAccNum}
              onChange={(e) => setSearchAccNum(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter account number"
              className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                From Date <span className="text-muted-foreground font-normal">(पासून)</span>
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                To Date <span className="text-muted-foreground font-normal">(पर्यंत)</span>
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
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
          {/* Print header - only visible when printing */}
          <div className="print-only mb-6">
            <h1 className="text-2xl font-bold text-center">Student Bank - Transaction History</h1>
            <p className="text-center text-sm mt-1">Account: {searchAccNum}</p>
            {dateFrom && dateTo && (
              <p className="text-center text-sm">Period: {dateFrom} to {dateTo}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-teal text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-green text-white font-semibold text-sm shadow-md hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {searchResult.student && (
              <div className="bg-card rounded-2xl border border-border p-4 card-shadow">
                <h4 className="font-bold font-heading mb-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Student Information / विद्यार्थी माहिती
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Name', value: searchResult.student.name },
                    { label: 'Class', value: searchResult.student.className },
                    { label: 'Attendance No.', value: searchResult.student.attendanceNumber.toString() },
                    { label: 'School', value: searchResult.student.schoolName },
                    { label: 'Taluka', value: searchResult.student.taluka },
                    { label: 'District', value: searchResult.student.district },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">{label}:</span>
                      <span className="font-semibold text-foreground text-right">{value}</span>
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
                    { label: 'Account No.', value: searchResult.account.accountNumber },
                    { label: 'Bank Name', value: searchResult.account.bankName },
                    { label: 'IFSC Code', value: searchResult.account.ifscCode },
                    { label: 'Initial Amount', value: `₹${Number(searchResult.account.initialAmount).toLocaleString('en-IN')}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">{label}:</span>
                      <span className="font-semibold text-foreground text-right font-mono">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Total Deposits:</span>
                    <span className="font-bold text-green-600">₹{totalDeposits.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-500 font-medium">Total Withdrawals:</span>
                    <span className="font-bold text-red-500">₹{totalWithdrawals.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground font-heading">
                Transactions ({searchResult.transactions.length})
              </h3>
            </div>
            {searchResult.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground font-medium">No transactions found</p>
                <p className="text-muted-foreground text-sm">
                  {dateFrom && dateTo ? 'No transactions in the selected date range' : 'No transactions for this account'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Reason</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {searchResult.transactions.map((t, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
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
                </table>
              </div>
            )}
          </div>
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
