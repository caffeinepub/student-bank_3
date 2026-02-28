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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BankDetail } from "../backend";
import { useAddBankDetail, useUpdateBankDetail } from "../hooks/useQueries";

interface BankDetailFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankDetail?: BankDetail | null;
}

export default function BankDetailForm({
  open,
  onOpenChange,
  bankDetail,
}: BankDetailFormProps) {
  const addBankDetail = useAddBankDetail();
  const updateBankDetail = useUpdateBankDetail();

  const [form, setForm] = useState({
    bankName: "",
    taluka: "",
    district: "",
    ifscCode: "",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when dialog opens/closes
  useEffect(() => {
    if (bankDetail) {
      setForm({
        bankName: bankDetail.bankName,
        taluka: bankDetail.taluka,
        district: bankDetail.district,
        ifscCode: bankDetail.ifscCode,
      });
    } else {
      setForm({ bankName: "", taluka: "", district: "", ifscCode: "" });
    }
  }, [bankDetail, open]);

  const isLoading = addBankDetail.isPending || updateBankDetail.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.bankName.trim() || !form.ifscCode.trim()) {
      toast.error("बँकेचे नाव आणि IFSC Code आवश्यक आहे");
      return;
    }

    const payload = {
      bankName: form.bankName.trim(),
      taluka: form.taluka.trim(),
      district: form.district.trim(),
      ifscCode: form.ifscCode.trim(),
    };

    try {
      if (bankDetail) {
        await updateBankDetail.mutateAsync(payload);
        toast.success("बँक माहिती यशस्वीरित्या अपडेट झाली!");
      } else {
        await addBankDetail.mutateAsync(payload);
        toast.success("बँक माहिती यशस्वीरित्या जोडली गेली!");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "माहिती save होऊ शकली नाही";
      toast.error(`Error: ${msg}`);
      // Do NOT close dialog on error — let user retry
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {bankDetail ? "बँक माहिती बदला" : "नवीन बँक जोडा"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bankName">बँकेचे नाव *</Label>
            <Input
              id="bankName"
              value={form.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              placeholder="बँकेचे नाव"
              required
            />
          </div>

          <div>
            <Label htmlFor="ifscCode">IFSC Code *</Label>
            <Input
              id="ifscCode"
              value={form.ifscCode}
              onChange={(e) =>
                handleChange("ifscCode", e.target.value.toUpperCase())
              }
              placeholder="IFSC Code"
              disabled={!!bankDetail}
              required
            />
          </div>

          <div>
            <Label htmlFor="taluka">तालुका</Label>
            <Input
              id="taluka"
              value={form.taluka}
              onChange={(e) => handleChange("taluka", e.target.value)}
              placeholder="तालुका"
            />
          </div>

          <div>
            <Label htmlFor="district">जिल्हा</Label>
            <Input
              id="district"
              value={form.district}
              onChange={(e) => handleChange("district", e.target.value)}
              placeholder="जिल्हा"
            />
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
              {isLoading ? "Save होत आहे..." : bankDetail ? "अपडेट करा" : "जोडा"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
