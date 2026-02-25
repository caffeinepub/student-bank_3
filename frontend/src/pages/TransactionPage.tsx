import { useState } from 'react';
import { useGetAllAccounts, useAddTransaction, useGetTransactionsByAccount } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TransactionPage() {
  const { data: accounts = [] } = useGetAllAccounts();
  const addTransaction = useAddTransaction();

  const [form, setForm] = useState({
    accountNumber: '',
    transactionType: 'Deposit',
    amount: '',
    reason: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: transactions = [], isLoading: txLoading } = useGetTransactionsByAccount(form.accountNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!form.accountNumber) { setErrorMsg('Please select an account'); return; }
    if (!form.amount.trim() || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    if (!form.reason.trim()) { setErrorMsg('Reason is required'); return; }

    try {
      await addTransaction.mutateAsync({
        accountNumber: form.accountNumber,
        transactionType: form.transactionType,
        amount: BigInt(Math.floor(Number(form.amount))),
        reason: form.reason.trim(),
      });
      setSuccessMsg('Transaction added successfully!');
      setForm(f => ({ ...f, amount: '', reason: '' }));
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to add transaction. Please try again.');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) / 1_000_000;
    return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatAmount = (amount: bigint) => `₹${Number(amount).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Account</Label>
                <Select
                  value={form.accountNumber}
                  onValueChange={v => { setForm(f => ({ ...f, accountNumber: v })); setSuccessMsg(''); setErrorMsg(''); }}
                  disabled={addTransaction.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.accountNumber} value={a.accountNumber}>
                        {a.accountNumber} — {a.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Transaction Type</Label>
                <Select
                  value={form.transactionType}
                  onValueChange={v => setForm(f => ({ ...f, transactionType: v }))}
                  disabled={addTransaction.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="Enter amount"
                  disabled={addTransaction.isPending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Reason for transaction"
                  disabled={addTransaction.isPending}
                />
              </div>
            </div>
            <Button type="submit" disabled={addTransaction.isPending}>
              {addTransaction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      {form.accountNumber && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History — {form.accountNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found for this account.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...transactions]
                      .sort((a, b) => Number(b.date - a.date))
                      .map((tx, i) => (
                        <TableRow key={i}>
                          <TableCell>{formatDate(tx.date)}</TableCell>
                          <TableCell>
                            <Badge variant={tx.transactionType === 'Deposit' ? 'default' : 'destructive'}>
                              {tx.transactionType}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatAmount(tx.amount)}</TableCell>
                          <TableCell>{tx.reason}</TableCell>
                          <TableCell>{formatAmount(tx.runningBalance)}</TableCell>
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
