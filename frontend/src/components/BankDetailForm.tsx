import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddBankDetail, useUpdateBankDetail } from '../hooks/useQueries';
import type { BankDetail } from '../backend';
import { Loader2, AlertCircle } from 'lucide-react';

interface BankDetailFormProps {
  open: boolean;
  onClose: () => void;
  bankDetail?: BankDetail | null;
}

export default function BankDetailForm({ open, onClose, bankDetail }: BankDetailFormProps) {
  const addBankDetail = useAddBankDetail();
  const updateBankDetail = useUpdateBankDetail();

  const [form, setForm] = useState({
    bankName: '',
    taluka: '',
    district: '',
    ifscCode: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (bankDetail) {
      setForm({
        bankName: bankDetail.bankName,
        taluka: bankDetail.taluka,
        district: bankDetail.district,
        ifscCode: bankDetail.ifscCode,
      });
    } else {
      setForm({ bankName: '', taluka: '', district: '', ifscCode: '' });
    }
    setError('');
  }, [bankDetail, open]);

  const isLoading = addBankDetail.isPending || updateBankDetail.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.bankName.trim()) { setError('Bank name is required'); return; }
    if (!form.taluka.trim()) { setError('Taluka is required'); return; }
    if (!form.district.trim()) { setError('District is required'); return; }
    if (!form.ifscCode.trim()) { setError('IFSC code is required'); return; }

    try {
      const data = {
        bankName: form.bankName.trim(),
        taluka: form.taluka.trim(),
        district: form.district.trim(),
        ifscCode: form.ifscCode.trim(),
      };

      if (bankDetail) {
        await updateBankDetail.mutateAsync(data);
      } else {
        await addBankDetail.mutateAsync(data);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save bank detail. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bankDetail ? 'Edit Bank Detail' : 'Add Bank Detail'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="Bank name" disabled={isLoading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input id="ifscCode" value={form.ifscCode} onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} placeholder="e.g. SBIN0001234" disabled={isLoading || !!bankDetail} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="taluka">Taluka</Label>
            <Input id="taluka" value={form.taluka} onChange={e => setForm(f => ({ ...f, taluka: e.target.value }))} placeholder="Taluka" disabled={isLoading} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="district">District</Label>
            <Input id="district" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="District" disabled={isLoading} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bankDetail ? 'Update' : 'Add'} Bank Detail
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
