import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddAccount, useUpdateAccount, useGetAllStudents, useGetAllBankDetails } from '../hooks/useQueries';
import type { Account } from '../backend';
import { Loader2, AlertCircle } from 'lucide-react';

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  account?: Account | null;
}

export default function AccountForm({ open, onClose, account }: AccountFormProps) {
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const { data: students = [] } = useGetAllStudents();
  const { data: bankDetails = [] } = useGetAllBankDetails();

  const [form, setForm] = useState({
    studentId: '',
    bankName: '',
    accountNumber: '',
    initialAmount: '',
    ifscCode: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setForm({
        studentId: account.studentId.toString(),
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        initialAmount: account.initialAmount.toString(),
        ifscCode: account.ifscCode,
      });
    } else {
      setForm({ studentId: '', bankName: '', accountNumber: '', initialAmount: '', ifscCode: '' });
    }
    setError('');
  }, [account, open]);

  // Auto-fill bank name when IFSC is selected
  useEffect(() => {
    if (form.ifscCode) {
      const bd = bankDetails.find(b => b.ifscCode === form.ifscCode);
      if (bd) setForm(f => ({ ...f, bankName: bd.bankName }));
    }
  }, [form.ifscCode, bankDetails]);

  const isLoading = addAccount.isPending || updateAccount.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.studentId) { setError('Please select a student'); return; }
    if (!form.accountNumber.trim()) { setError('Account number is required'); return; }
    if (!form.ifscCode) { setError('Please select an IFSC code'); return; }
    if (!form.initialAmount.trim()) { setError('Initial amount is required'); return; }

    try {
      const data = {
        studentId: BigInt(form.studentId),
        bankName: form.bankName,
        accountNumber: form.accountNumber.trim(),
        initialAmount: BigInt(form.initialAmount),
        ifscCode: form.ifscCode,
      };

      if (account) {
        await updateAccount.mutateAsync(data);
      } else {
        await addAccount.mutateAsync(data);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save account. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-1">
            <Label>Student</Label>
            <Select value={form.studentId} onValueChange={v => setForm(f => ({ ...f, studentId: v }))} disabled={isLoading || !!account}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.name} — {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>IFSC Code</Label>
            <Select value={form.ifscCode} onValueChange={v => setForm(f => ({ ...f, ifscCode: v }))} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select IFSC" />
              </SelectTrigger>
              <SelectContent>
                {bankDetails.map(b => (
                  <SelectItem key={b.ifscCode} value={b.ifscCode}>
                    {b.ifscCode} — {b.bankName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="Auto-filled from IFSC" disabled={isLoading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="Account number" disabled={isLoading || !!account} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="initialAmount">Initial Amount (₹)</Label>
            <Input id="initialAmount" type="number" value={form.initialAmount} onChange={e => setForm(f => ({ ...f, initialAmount: e.target.value }))} placeholder="0" disabled={isLoading} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {account ? 'Update' : 'Add'} Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
