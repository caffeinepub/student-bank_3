import { Download, FileDown, FileUp, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddAccount,
  useAddBankDetail,
  useAddStudent,
  useAddTransaction,
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
  parseAccountsCSV,
  parseBankDetailsCSV,
  parseStudentsCSV,
  parseTransactionsCSV,
} from "../utils/importExport";

export default function ImportExportPage() {
  const [importingStudents, setImportingStudents] = useState(false);
  const [importingBanks, setImportingBanks] = useState(false);
  const [importingAccounts, setImportingAccounts] = useState(false);
  const [importingTransactions, setImportingTransactions] = useState(false);

  const studentFileRef = useRef<HTMLInputElement>(null);
  const bankFileRef = useRef<HTMLInputElement>(null);
  const accountFileRef = useRef<HTMLInputElement>(null);
  const transactionFileRef = useRef<HTMLInputElement>(null);

  const { data: students = [] } = useGetAllStudents();
  const { data: accounts = [] } = useGetAllAccounts();
  const { data: transactions = [] } = useGetAllTransactions();
  const { data: bankDetails = [] } = useGetAllBankDetails();

  const addStudent = useAddStudent();
  const addBankDetail = useAddBankDetail();
  const addAccount = useAddAccount();
  const addTransaction = useAddTransaction();

  // ─── Export Handlers ────────────────────────────────────────────────────────────────────

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
      toast.success(`${accounts.length} خाती Export केली!`);
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

  // ─── Import Handlers ────────────────────────────────────────────────────────────────────

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

  const handleAccountImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingAccounts(true);
    try {
      const text = await file.text();
      const parsed = parseAccountsCSV(text);
      if (parsed.length === 0) {
        toast.error("CSV मध्ये कोणतेही خाते आढळले नाही.");
        return;
      }

      let added = 0;
      let skipped = 0;

      for (const a of parsed) {
        // Skip if account number already exists
        const exists = accounts.some(
          (existing) =>
            existing.accountNumber.trim() === a.accountNumber.trim(),
        );
        if (exists) {
          skipped++;
          continue;
        }
        // Find student by name
        const matchedStudent = students.find(
          (s) =>
            s.name.trim().toLowerCase() === a.studentName.trim().toLowerCase(),
        );
        if (!matchedStudent) {
          skipped++;
          continue;
        }
        try {
          await addAccount.mutateAsync({
            studentId: Number(matchedStudent.id),
            bankName: a.bankName,
            accountNumber: a.accountNumber,
            initialAmount: Number(a.initialAmount) || 0,
            ifscCode: a.ifscCode,
          });
          added++;
        } catch {
          skipped++;
        }
      }

      if (added > 0) {
        toast.success(
          `${added} خाती जोडली, ${skipped} skip केले (आधीच आहेत किंवा विद्यार्थी सापडला नाही)`,
        );
      } else if (skipped > 0) {
        toast.warning(
          `सर्व ${skipped} خाती skip केल्या — आधी विद्यार्थी import करा आणि नंतर خाती import करा.`,
        );
      } else {
        toast.info("खाती जोडली नाही.");
      }
    } catch {
      toast.error("Import करताना त्रुटी आली.");
    } finally {
      setImportingAccounts(false);
      if (accountFileRef.current) accountFileRef.current.value = "";
    }
  };

  const handleTransactionImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingTransactions(true);
    try {
      const text = await file.text();
      const parsed = parseTransactionsCSV(text);
      if (parsed.length === 0) {
        toast.error("CSV मध्ये कोणतेही व्यवहार आढळले नाही.");
        return;
      }

      let added = 0;
      let skipped = 0;

      for (const t of parsed) {
        // Verify account exists
        const accountExists = accounts.some(
          (a) => a.accountNumber.trim() === t.accountNumber.trim(),
        );
        if (!accountExists) {
          skipped++;
          continue;
        }
        try {
          await addTransaction.mutateAsync({
            accountNumber: t.accountNumber,
            transactionType: t.transactionType,
            amount: Number(t.amount) || 0,
            reason: t.reason,
            date: t.date
              ? new Date(t.date).toISOString().split("T")[0]
              : undefined,
          });
          added++;
        } catch {
          skipped++;
        }
      }

      if (added > 0) {
        toast.success(
          `${added} व्यवहार जोडले, ${skipped} skip केले (خाते सापडले नाही)`,
        );
      } else if (skipped > 0) {
        toast.warning(
          `सर्व ${skipped} व्यवहार skip केल्या — आधी خाती import करा आणि नंतर व्यवहार import करा.`,
        );
      } else {
        toast.info("व्यवहार जोडले नाही.");
      }
    } catch {
      toast.error("Import करताना त्रुटी आली.");
    } finally {
      setImportingTransactions(false);
      if (transactionFileRef.current) transactionFileRef.current.value = "";
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
          className="px-6 py-4 flex items-center gap-3"
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
                  विद्यार्थी, خाती, व्यवहार आणि बँक तपशील एकत्र एका file मध्ये
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
                <p className="font-medium text-foreground text-sm">خाती</p>
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
          {/* Import order note */}
          <div className="flex gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-blue-500 text-lg leading-none mt-0.5">ℹ️</span>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">आधी हे वाचा:</p>
              <p>शीर्षक 1: विद्यार्थी import करा</p>
              <p>शीर्षक 2: बँक तपशील import करा</p>
              <p>
                शीर्षक 3: خाती import करा (export केलेल्या accounts_backup.csv
                वापरा)
              </p>
              <p>
                शीर्षक 4: व्यवहार import करा (export केलेल्या transactions_backup.csv
                वापरा)
              </p>
            </div>
          </div>

          {/* Students Import */}
          <ImportCard
            title="विद्यार्थी Import करा (Step 1)"
            description="CSV file upload करा — आधीच असलेले विद्यार्थी skip होतील."
            format="name,dateOfBirth,className,attendanceNumber,schoolName,taluka,district"
            loading={importingStudents}
            fileRef={studentFileRef}
            inputId="student-import-file"
            label="विद्यार्थी CSV Upload करा"
            onChange={handleStudentImport}
            gradient="linear-gradient(135deg, oklch(0.50 0.20 270) 0%, oklch(0.40 0.25 280) 100%)"
          />

          {/* Bank Details Import */}
          <ImportCard
            title="बँक तपशील Import करा (Step 2)"
            description="CSV file upload करा — आधीच असलेले IFSC codes skip होतील."
            format="bankName,taluka,district,ifscCode"
            loading={importingBanks}
            fileRef={bankFileRef}
            inputId="bank-import-file"
            label="बँक तपशील CSV Upload करा"
            onChange={handleBankImport}
            gradient="linear-gradient(135deg, oklch(0.50 0.20 270) 0%, oklch(0.40 0.25 280) 100%)"
          />

          {/* Accounts Import */}
          <ImportCard
            title="خाती Import करा (Step 3)"
            description="आधी विद्यार्थी import करा, मग خाती import करा. accounts_backup.csv वापरा."
            format="accountNumber,studentName,bankName,ifscCode,className,initialAmount"
            loading={importingAccounts}
            fileRef={accountFileRef}
            inputId="account-import-file"
            label="خाती CSV Upload करा"
            onChange={handleAccountImport}
            gradient="linear-gradient(135deg, oklch(0.55 0.22 30) 0%, oklch(0.45 0.25 20) 100%)"
          />

          {/* Transactions Import */}
          <ImportCard
            title="व्यवहार Import करा (Step 4)"
            description="खाती import केल्यानंतर व्यवहार import करा. transactions_backup.csv वापरा."
            format="date,accountNumber,studentName,transactionType,amount,...,reason"
            loading={importingTransactions}
            fileRef={transactionFileRef}
            inputId="transaction-import-file"
            label="व्यवहार CSV Upload करा"
            onChange={handleTransactionImport}
            gradient="linear-gradient(135deg, oklch(0.48 0.22 160) 0%, oklch(0.38 0.25 150) 100%)"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Import Card ──────────────────────────────────────────────────────────────────────────

function ImportCard({
  title,
  description,
  format,
  loading,
  fileRef,
  inputId,
  label,
  onChange,
  gradient,
}: {
  title: string;
  description: string;
  format: string;
  loading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  inputId: string;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gradient: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          आवश्यक CSV Format:
        </p>
        <code className="text-xs text-foreground font-mono break-all">
          {format}
        </code>
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={onChange}
          className="hidden"
          id={inputId}
          data-ocid="importexport.upload_button"
        />
        <label
          htmlFor={inputId}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:opacity-90 ${
            loading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
          }`}
          style={{ background: gradient }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {loading ? "Import होत आहे..." : label}
        </label>
        {loading && (
          <span
            className="text-xs text-muted-foreground"
            data-ocid="importexport.loading_state"
          >
            प्रक्रिया सुरू आहे...
          </span>
        )}
      </div>
    </div>
  );
}
