import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Account } from "../backend";
import {
  useAddAccount,
  useGetAllBankDetails,
  useGetAllStudents,
  useUpdateAccount,
} from "../hooks/useQueries";

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

export default function AccountForm({
  open,
  onOpenChange,
  account,
}: AccountFormProps) {
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const { data: students = [] } = useGetAllStudents();
  const { data: bankDetails = [] } = useGetAllBankDetails();

  const [form, setForm] = useState({
    studentId: "",
    bankName: "",
    accountNumber: "",
    initialAmount: "",
    ifscCode: "",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when dialog opens/closes
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
      setForm({
        studentId: "",
        bankName: "",
        accountNumber: "",
        initialAmount: "",
        ifscCode: "",
      });
    }
  }, [account, open]);

  // Auto-fill bank name when IFSC is selected
  const handleIfscChange = (ifscCode: string) => {
    const bankDetail = bankDetails.find((b) => b.ifscCode === ifscCode);
    setForm((prev) => ({
      ...prev,
      ifscCode,
      bankName: bankDetail ? bankDetail.bankName : prev.bankName,
    }));
  };

  const isLoading = addAccount.isPending || updateAccount.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.studentId || !form.accountNumber.trim() || !form.initialAmount) {
      toast.error("कृपया सर्व आवश्यक माहिती भरा");
      return;
    }

    const payload = {
      studentId: Number.parseInt(form.studentId, 10),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      initialAmount: Number.parseInt(form.initialAmount, 10),
      ifscCode: form.ifscCode.trim(),
    };

    try {
      if (account) {
        await updateAccount.mutateAsync(payload);
        toast.success("खाते माहिती यशस्वीरित्या अपडेट झाली!");
      } else {
        await addAccount.mutateAsync(payload);
        toast.success("खाते यशस्वीरित्या जोडले गेले!");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "माहिती save होऊ शकली नाही";
      toast.error(`Error: ${msg}`);
      // Do NOT close dialog on error — let user retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {account ? "खाते माहिती बदला" : "नवीन खाते जोडा"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>विद्यार्थी *</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, studentId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="विद्यार्थी निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.name} — {s.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>IFSC Code</Label>
              <Select value={form.ifscCode} onValueChange={handleIfscChange}>
                <SelectTrigger>
                  <SelectValue placeholder="IFSC Code निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {bankDetails.map((b) => (
                    <SelectItem key={b.ifscCode} value={b.ifscCode}>
                      {b.ifscCode} — {b.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="bankName">बँकेचे नाव</Label>
              <Input
                id="bankName"
                value={form.bankName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bankName: e.target.value }))
                }
                placeholder="बँकेचे नाव"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="accountNumber">खाते क्रमांक *</Label>
              <Input
                id="accountNumber"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    accountNumber: e.target.value,
                  }))
                }
                placeholder="खाते क्रमांक"
                disabled={!!account}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="initialAmount">प्रारंभिक रक्कम *</Label>
              <Input
                id="initialAmount"
                type="number"
                min="0"
                value={form.initialAmount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    initialAmount: e.target.value,
                  }))
                }
                placeholder="प्रारंभिक रक्कम"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              रद्द करा
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <svg
                  aria-hidden="true"
                  className="animate-spin h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {isLoading ? "Save होत आहे..." : account ? "अपडेट करा" : "जोडा"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
