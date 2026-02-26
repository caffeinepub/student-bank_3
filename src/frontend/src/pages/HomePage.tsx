import React from 'react';
import { useGetAllStudents, useGetAllAccounts, useGetAllTransactions } from '../hooks/useQueries';
import { Users, CreditCard, TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({
  title,
  titleMr,
  value,
  icon,
  gradient,
  isLoading,
}: {
  title: string;
  titleMr: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  isLoading: boolean;
}) {
  return (
    <div className={`${gradient} rounded-2xl p-5 text-white card-shadow relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-white/20 mb-1" />
        ) : (
          <p className="text-2xl font-bold font-heading">{value}</p>
        )}
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-white/60 text-xs">{titleMr}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: accounts = [], isLoading: accountsLoading } = useGetAllAccounts();
  const { data: transactions = [], isLoading: txLoading, refetch } = useGetAllTransactions();

  const isLoading = studentsLoading || accountsLoading || txLoading;

  const totalDeposits = transactions
    .filter((t) => t.transactionType === 'Deposit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.transactionType === 'Withdrawal')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInitialAmount = accounts.reduce((sum, a) => sum + Number(a.initialAmount), 0);
  const balance = totalInitialAmount + totalDeposits - totalWithdrawals;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const stats = [
    {
      title: 'Total Students',
      titleMr: 'एकूण विद्यार्थी',
      value: students.length.toString(),
      icon: <Users className="w-6 h-6 text-white" />,
      gradient: 'gradient-teal',
    },
    {
      title: 'Total Accounts',
      titleMr: 'एकूण खाते',
      value: accounts.length.toString(),
      icon: <CreditCard className="w-6 h-6 text-white" />,
      gradient: 'gradient-green',
    },
    {
      title: 'Total Deposits',
      titleMr: 'एकूण जमा रक्कम',
      value: formatCurrency(totalDeposits),
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      gradient: 'gradient-orange',
    },
    {
      title: 'Total Withdrawals',
      titleMr: 'एकूण काढलेली रक्कम',
      value: formatCurrency(totalWithdrawals),
      icon: <TrendingDown className="w-6 h-6 text-white" />,
      gradient: 'gradient-red',
    },
    {
      title: 'Current Balance',
      titleMr: 'शिल्लक रक्कम',
      value: formatCurrency(balance),
      icon: <Wallet className="w-6 h-6 text-white" />,
      gradient: 'gradient-purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm">डॅशबोर्ड सारांश</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-card rounded-2xl p-5 card-shadow border border-border">
          <h3 className="font-bold text-foreground font-heading mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions
              .slice(-5)
              .reverse()
              .map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      t.transactionType === 'Deposit' ? 'gradient-green' : 'gradient-red'
                    }`}
                  >
                    {t.transactionType === 'Deposit' ? (
                      <TrendingUp className="w-4 h-4 text-white" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{t.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.reason || 'No reason'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-bold text-sm ${
                        t.transactionType === 'Deposit' ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {t.transactionType === 'Deposit' ? '+' : '-'}₹
                      {Number(t.amount).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(t.date) / 1_000_000).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
