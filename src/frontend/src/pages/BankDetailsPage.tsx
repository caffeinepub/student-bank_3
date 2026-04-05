import { Download, Loader2, Upload } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { BankDetail } from "../backend";
import BankDetailForm from "../components/BankDetailForm";
import {
  useAddBankDetail,
  useDeleteBankDetail,
  useGetAllBankDetails,
} from "../hooks/useQueries";
import {
  exportBankDetailsCSV,
  parseBankDetailsCSV,
} from "../utils/importExport";

export default function BankDetailsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBankDetail, setEditBankDetail] = useState<BankDetail | null>(null);
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [importing, setImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const { data: bankDetails = [], isLoading } = useGetAllBankDetails();
  const deleteBankDetail = useDeleteBankDetail();
  const addBankDetail = useAddBankDetail();

  const filtered = bankDetails.filter(
    (b) =>
      b.bankName.toLowerCase().includes(search.toLowerCase()) ||
      b.ifscCode.toLowerCase().includes(search.toLowerCase()) ||
      b.taluka.toLowerCase().includes(search.toLowerCase()) ||
      b.district.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (bd: BankDetail) => {
    setEditBankDetail(bd);
    setShowForm(true);
  };

  const handleDelete = async (ifscCode: string) => {
    if (!confirm("हा बँक तपशील हटवायचा आहे का?")) return;
    setDeleteError("");
    try {
      await deleteBankDetail.mutateAsync(ifscCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(`हटवताना त्रुटी: ${msg}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowForm(open);
    if (!open) setEditBankDetail(null);
  };

  const handleExport = () => {
    try {
      exportBankDetailsCSV(bankDetails);
      toast.success(`${bankDetails.length} बँक तपशील Export केले!`);
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseBankDetailsCSV(text);
      if (parsed.length === 0) {
        toast.error("CSV मध्ये कोणताही बँक तपशील आढळला नाही.");
        return;
      }
      let added = 0;
      let skipped = 0;
      for (const b of parsed) {
        const exists = bankDetails.some(
          (ex) =>
            ex.ifscCode.trim().toLowerCase() ===
            b.ifscCode.trim().toLowerCase(),
        );
        if (exists) {
          skipped++;
          continue;
        }
        try {
          await addBankDetail.mutateAsync({
            bankName: b.bankName,
            taluka: b.taluka,
            district: b.district,
            ifscCode: b.ifscCode,
          });
          added++;
        } catch {
          skipped++;
        }
      }
      if (added > 0) {
        toast.success(`${added} बँक तपशील जोडले, ${skipped} skip केले`);
      } else {
        toast.info(`सर्व ${skipped} बँक तपशील आधीच आहेत.`);
      }
    } catch {
      toast.error("Import करताना त्रुटी आली.");
    } finally {
      setImporting(false);
      if (importFileRef.current) importFileRef.current.value = "";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">बँक तपशील</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-ocid="bankdetails.secondary_button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".csv"
            onChange={handleImportFile}
            className="hidden"
            id="bank-page-import"
            data-ocid="bankdetails.upload_button"
          />
          <label
            htmlFor="bank-page-import"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium cursor-pointer ${
              importing ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import CSV
          </label>
          <button
            type="button"
            data-ocid="bankdetails.primary_button"
            onClick={() => {
              setEditBankDetail(null);
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + नवीन बँक तपशील
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
          {deleteError}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="बँक, IFSC, तालुका किंवा जिल्हा शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="bankdetails.search_input"
            className="w-full max-w-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {isLoading ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="bankdetails.loading_state"
          >
            लोड होत आहे...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="bankdetails.empty_state"
          >
            {search
              ? "कोणताही बँक तपशील सापडला नाही."
              : "अद्याप कोणताही बँक तपशील जोडलेला नाही."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    बँकेचे नाव
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    IFSC Code
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    तालुका
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    जिल्हा
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    क्रिया
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bd, idx) => (
                  <tr
                    key={bd.ifscCode}
                    data-ocid={`bankdetails.item.${idx + 1}`}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 font-medium text-foreground">
                      {bd.bankName}
                    </td>
                    <td className="p-3 font-mono text-foreground">
                      {bd.ifscCode}
                    </td>
                    <td className="p-3 text-foreground">{bd.taluka}</td>
                    <td className="p-3 text-foreground">{bd.district}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(bd)}
                          data-ocid={`bankdetails.edit_button.${idx + 1}`}
                          className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          संपादित
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(bd.ifscCode)}
                          disabled={deleteBankDetail.isPending}
                          data-ocid={`bankdetails.delete_button.${idx + 1}`}
                          className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          हटवा
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BankDetailForm
        open={showForm}
        bankDetail={editBankDetail}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
