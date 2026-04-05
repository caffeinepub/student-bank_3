import { Download, FileDown, FileUp, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddBankDetail,
  useAddStudent,
  useGetAllAccounts,
  useGetAllBankDetails,
  useGetAllStudents,
  useGetAllTransactions,
} from "../hooks/useQueries";
import {
  exportAccountsCSV,
  exportAllDataCSV,
  exportBankDetailsCSV,
  exportStudentsCSV,
  exportTransactionsCSVAll,
  parseBankDetailsCSV,
  parseStudentsCSV,
} from "../utils/importExport";

export default function ImportExportPage() {
  const [importingStudents, setImportingStudents] = useState(false);
  const [importingBanks, setImportingBanks] = useState(false);
  const studentFileRef = useRef<HTMLInputElement>(null);
  const bankFileRef = useRef<HTMLInputElement>(null);

  const { data: students = [] } = useGetAllStudents();
  const { data: accounts = [] } = useGetAllAccounts();
  const { data: transactions = [] } = useGetAllTransactions();
  const { data: bankDetails = [] } = useGetAllBankDetails();

  const addStudent = useAddStudent();
  const addBankDetail = useAddBankDetail();

  // ─── Export Handlers ────────────────────────────────────────────────────────

  const handleExportAll = () => {
    try {
      exportAllDataCSV(students, accounts, transactions, bankDetails);
      toast.success("सर्व माहिती Export केली!");
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  const handleExportStudents = () => {
    try {
      exportStudentsCSV(students);
      toast.success(`${students.length} विद्यार्थी Export केले!`);
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  const handleExportAccounts = () => {
    try {
      exportAccountsCSV(accounts, students);
      toast.success(`${accounts.length} खाती Export केली!`);
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  const handleExportTransactions = () => {
    try {
      exportTransactionsCSVAll(transactions);
      toast.success(`${transactions.length} व्यवहार Export केले!`);
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  const handleExportBankDetails = () => {
    try {
      exportBankDetailsCSV(bankDetails);
      toast.success(`${bankDetails.length} बँक तपशील Export केले!`);
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  // ─── Import Handlers ────────────────────────────────────────────────────────

  const handleStudentImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingStudents(true);
    try {
      const text = await file.text();
      const parsed = parseStudentsCSV(text);
      if (parsed.length === 0) {
        toast.error("CSV मध्ये कोणताही विद्यार्थी आढळला नाही.");
        return;
      }

      let added = 0;
      let skipped = 0;

      for (const s of parsed) {
        // Skip detection: check if same name+className+attendanceNumber exists
        const exists = students.some(
          (existing) =>
            existing.name.trim().toLowerCase() ===
              s.name.trim().toLowerCase() &&
            existing.className.trim().toLowerCase() ===
              s.className.trim().toLowerCase() &&
            existing.attendanceNumber.toString() ===
              s.attendanceNumber.toString(),
        );
        if (exists) {
          skipped++;
          continue;
        }
        try {
          await addStudent.mutateAsync({
            name: s.name,
            dateOfBirth: s.dateOfBirth,
            className: s.className,
            attendanceNumber: Number(s.attendanceNumber) || 0,
            schoolName: s.schoolName,
            taluka: s.taluka,
            district: s.district,
          });
          added++;
        } catch {
          skipped++;
        }
      }

      if (added > 0) {
        toast.success(`${added} विद्यार्थी जोडले, ${skipped} आधीच होते (skipped)`);
      } else {
        toast.info(`सर्व ${skipped} विद्यार्थी आधीच आहेत.`);
      }
    } catch {
      toast.error("Import करताना त्रुटी आली.");
    } finally {
      setImportingStudents(false);
      if (studentFileRef.current) studentFileRef.current.value = "";
    }
  };

  const handleBankImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingBanks(true);
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
        // Skip detection: check if ifscCode already exists
        const exists = bankDetails.some(
          (existing) =>
            existing.ifscCode.trim().toLowerCase() ===
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
        toast.success(`${added} बँक तपशील जोडले, ${skipped} आधीच होते (skipped)`);
      } else {
        toast.info(`सर्व ${skipped} बँक तपशील आधीच आहेत.`);
      }
    } catch {
      toast.error("Import करताना त्रुटी आली.");
    } finally {
      setImportingBanks(false);
      if (bankFileRef.current) bankFileRef.current.value = "";
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          माहिती Backup / Restore
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          सर्व माहिती CSV मध्ये export करा किंवा CSV file import करून माहिती पुन्हा
          जोडा.
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div
          className="px-6 py-4 gradient-green flex items-center gap-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 150) 0%, oklch(0.45 0.22 160) 100%)",
          }}
        >
          <FileDown className="w-5 h-5 text-white" />
          <h2 className="text-lg font-bold text-white">
            Export — माहिती Download करा
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Full Export */}
          <div className="p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">
                  सर्व माहिती Export करा
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  विद्यार्थी, खाती, व्यवहार आणि बँक तपशील एकत्र एका file मध्ये
                </p>
              </div>
              <button
                type="button"
                data-ocid="importexport.primary_button"
                onClick={handleExportAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 150) 0%, oklch(0.45 0.22 160) 100%)",
                }}
              >
                <Download className="w-4 h-4" />
                Full Backup Download
              </button>
            </div>
          </div>

          {/* Individual Exports */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
              <div>
                <p className="font-medium text-foreground text-sm">विद्यार्थी</p>
                <p className="text-xs text-muted-foreground">
                  {students.length} records
                </p>
              </div>
              <button
                type="button"
                data-ocid="importexport.secondary_button"
                onClick={handleExportStudents}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
              <div>
                <p className="font-medium text-foreground text-sm">खाती</p>
                <p className="text-xs text-muted-foreground">
                  {accounts.length} records
                </p>
              </div>
              <button
                type="button"
                data-ocid="importexport.secondary_button"
                onClick={handleExportAccounts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
              <div>
                <p className="font-medium text-foreground text-sm">व्यवहार</p>
                <p className="text-xs text-muted-foreground">
                  {transactions.length} records
                </p>
              </div>
              <button
                type="button"
                data-ocid="importexport.secondary_button"
                onClick={handleExportTransactions}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
              <div>
                <p className="font-medium text-foreground text-sm">बँक तपशील</p>
                <p className="text-xs text-muted-foreground">
                  {bankDetails.length} records
                </p>
              </div>
              <button
                type="button"
                data-ocid="importexport.secondary_button"
                onClick={handleExportBankDetails}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.50 0.20 270) 0%, oklch(0.40 0.25 280) 100%)",
          }}
        >
          <FileUp className="w-5 h-5 text-white" />
          <h2 className="text-lg font-bold text-white">
            Import — माहिती Restore करा
          </h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Students Import */}
          <div className="p-5 rounded-xl border border-border space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">
                विद्यार्थी Import करा
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                CSV file upload करा — आधी असलेले विद्यार्थी skip होतील.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                आवश्यक CSV Format:
              </p>
              <code className="text-xs text-foreground font-mono break-all">
                name,dateOfBirth,className,attendanceNumber,schoolName,taluka,district
              </code>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={studentFileRef}
                type="file"
                accept=".csv"
                onChange={handleStudentImport}
                className="hidden"
                id="student-import-file"
                data-ocid="importexport.upload_button"
              />
              <label
                htmlFor="student-import-file"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 ${
                  importingStudents
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.50 0.20 270) 0%, oklch(0.40 0.25 280) 100%)",
                }}
              >
                {importingStudents ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {importingStudents
                  ? "Import होत आहे..."
                  : "विद्यार्थी CSV Upload करा"}
              </label>
              {importingStudents && (
                <span
                  className="text-xs text-muted-foreground"
                  data-ocid="importexport.loading_state"
                >
                  प्रक्रिया सुरू आहे...
                </span>
              )}
            </div>
          </div>

          {/* Bank Details Import */}
          <div className="p-5 rounded-xl border border-border space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">
                बँक तपशील Import करा
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                CSV file upload करा — आधीच असलेले IFSC codes skip होतील.
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                आवश्यक CSV Format:
              </p>
              <code className="text-xs text-foreground font-mono break-all">
                bankName,taluka,district,ifscCode
              </code>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={bankFileRef}
                type="file"
                accept=".csv"
                onChange={handleBankImport}
                className="hidden"
                id="bank-import-file"
                data-ocid="importexport.upload_button"
              />
              <label
                htmlFor="bank-import-file"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 ${
                  importingBanks
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.50 0.20 270) 0%, oklch(0.40 0.25 280) 100%)",
                }}
              >
                {importingBanks ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {importingBanks
                  ? "Import होत आहे..."
                  : "बँक तपशील CSV Upload करा"}
              </label>
              {importingBanks && (
                <span
                  className="text-xs text-muted-foreground"
                  data-ocid="importexport.loading_state"
                >
                  प्रक्रिया सुरू आहे...
                </span>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-500 text-lg leading-none mt-0.5">
              ℹ️
            </span>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">महत्त्वाची टीप:</p>
              <p>• खाती (Accounts) import साठी आधी विद्यार्थी import करावेत.</p>
              <p>• Transactions import उपलब्ध नाही — ते manually जोडावे लागतील.</p>
              <p>
                • Full Backup CSV मध्ये सर्व sections आहेत, पण import साठी वेगळ्या
                files वापरा.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
