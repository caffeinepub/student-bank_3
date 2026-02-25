import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useGetAllAccounts,
  useGetTransactionsByAccount,
  useAddTransaction,
} from '../hooks/useQueries';

function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TransactionPage() {
  const { data: accounts = [] } = useGetAllAccounts();
  const addTransaction = useAddTransaction();

  const [selectedAccount, setSelectedAccount] = useState('');
  const [form, setForm] = useState({
    date: getTodayDateString(),
    transactionType: 'Deposit',
    amount: '',
    reason: '',
  });

  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactionsByAccount(selectedAccount);

  // Compute previous balance from existing transactions + account initial amount
  const selectedAccountData = accounts.find((a) => a.accountNumber === selectedAccount);
  const previousBalance = (() => {
    if (!selectedAccountData) return 0;
    let bal = Number(selectedAccountData.initialAmount);
    for (const tx of transactions) {
      if (tx.transactionType === 'Deposit') {
        bal += Number(tx.amount);
      } else if (tx.transactionType === 'Withdrawal') {
        bal -= Number(tx.amount);
      }
    }
    return bal;
  })();

  // Compute total amount in real-time
  const amountNum = parseInt(form.amount, 10) || 0;
  const totalAmount =
    form.transactionType === 'Deposit'
      ? previousBalance + amountNum
      : previousBalance - amountNum;

  // Reset previous balance display when account changes
  useEffect(() => {
    // nothing extra needed — derived from transactions query
  }, [selectedAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast.error('कृपया खाते निवडा');
      return;
    }
    if (!form.amount || parseInt(form.amount, 10) <= 0) {
      toast.error('कृपया वैध रक्कम टाका');
      return;
    }
    if (!form.reason.trim()) {
      toast.error('कृपया कारण टाका');
      return;
    }

    try {
      await addTransaction.mutateAsync({
        accountNumber: selectedAccount,
        transactionType: form.transactionType,
        amount: parseInt(form.amount, 10),
        reason: form.reason.trim(),
      });
      toast.success('व्यवहार यशस्वीरित्या जोडला गेला!');
      // Reset form fields but keep selected account and date
      setForm((prev) => ({
        ...prev,
        transactionType: 'Deposit',
        amount: '',
        reason: '',
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'व्यवहार save होऊ शकला नाही';
      toast.error(`Error: ${msg}`);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString('mr-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: bigint | number) =>
    `₹${Number(amount).toLocaleString('mr-IN')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PlusCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">व्यवहार</h1>
      </div>

      {/* Add Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>नवीन व्यवहार जोडा</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Field */}
              <div>
                <Label htmlFor="date">तारीख *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* Account Selector */}
              <div>
                <Label>खाते *</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="खाते निवडा" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.accountNumber} value={a.accountNumber}>
                        {a.accountNumber} — {a.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Type */}
              <div>
                <Label>व्यवहाराचा प्रकार *</Label>
                <Select
                  value={form.transactionType}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, transactionType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deposit">जमा (Deposit)</SelectItem>
                    <SelectItem value="Withdrawal">काढणे (Withdrawal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">रक्कम *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="रक्कम टाका"
                />
              </div>

              {/* Reason */}
              <div>
                <Label htmlFor="reason">कारण *</Label>
                <Input
                  id="reason"
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="व्यवहाराचे कारण"
                />
              </div>

              {/* Previous Balance (read-only) */}
              <div>
                <Label htmlFor="previousBalance">मागील शिल्लक रक्कम</Label>
                <div className="relative">
                  <Input
                    id="previousBalance"
                    type="text"
                    value={selectedAccount ? `₹${previousBalance.toLocaleString('mr-IN')}` : '—'}
                    readOnly
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  खाते निवडल्यावर आपोआप भरले जाते
                </p>
              </div>

              {/* Total Amount (read-only) */}
              <div>
                <Label htmlFor="totalAmount">एकूण रक्कम</Label>
                <div className="relative">
                  <Input
                    id="totalAmount"
                    type="text"
                    value={
                      selectedAccount && form.amount
                        ? `₹${totalAmount.toLocaleString('mr-IN')}`
                        : '—'
                    }
                    readOnly
                    className={`cursor-not-allowed font-semibold ${
                      selectedAccount && form.amount
                        ? form.transactionType === 'Deposit'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {form.transactionType === 'Deposit'
                    ? 'मागील शिल्लक + रक्कम'
                    : 'मागील शिल्लक − रक्कम'}
                </p>
              </div>
            </div>

            <Button type="submit" disabled={addTransaction.isPending}>
              {addTransaction.isPending && (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {addTransaction.isPending ? 'Save होत आहे...' : 'व्यवहार जोडा'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>
              खाते {selectedAccount} चे व्यवहार
            </CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                या खात्यावर अद्याप कोणतेही व्यवहार नाहीत.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>तारीख</TableHead>
                      <TableHead>विद्यार्थी</TableHead>
                      <TableHead>प्रकार</TableHead>
                      <TableHead>रक्कम</TableHead>
                      <TableHead>मागील शिल्लक</TableHead>
                      <TableHead>एकूण रक्कम</TableHead>
                      <TableHead>कारण</TableHead>
                      <TableHead>शिल्लक</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                        <TableCell>{tx.studentName}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.transactionType === 'Deposit'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {tx.transactionType === 'Deposit' ? 'जमा' : 'काढणे'}
                          </span>
                        </TableCell>
                        <TableCell>{formatAmount(tx.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatAmount(tx.previousBalance)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(tx.totalAmount)}
                        </TableCell>
                        <TableCell>{tx.reason}</TableCell>
                        <TableCell className="font-medium text-primary">
                          {formatAmount(tx.runningBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
