import { Download } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Account } from "../backend";
import AccountForm from "../components/AccountForm";
import {
  useDeleteAccount,
  useGetAllAccounts,
  useGetAllStudents,
} from "../hooks/useQueries";
import { exportAccountsCSV } from "../utils/importExport";

export default function AccountPage() {
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const { data: accounts = [], isLoading } = useGetAllAccounts();
  const { data: students = [] } = useGetAllStudents();
  const deleteAccount = useDeleteAccount();

  const getStudentName = (studentId: bigint) => {
    const s = students.find((s) => s.id === studentId);
    return s ? s.name : "-";
  };

  const filtered = accounts.filter(
    (a) =>
      a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.bankName.toLowerCase().includes(search.toLowerCase()) ||
      getStudentName(a.studentId).toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (account: Account) => {
    setEditAccount(account);
    setShowForm(true);
  };

  const handleDelete = async (accountNumber: string) => {
    if (!confirm("हे खाते हटवायचे आहे का?")) return;
    setDeleteError("");
    try {
      await deleteAccount.mutateAsync(accountNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(`हटवताना त्रुटी: ${msg}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowForm(open);
    if (!open) setEditAccount(null);
  };

  const handleExport = () => {
    try {
      exportAccountsCSV(accounts, students);
      toast.success(`${accounts.length} खाती Export केली!`);
    } catch {
      toast.error("Export करताना त्रुटी आली.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">खाती</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-ocid="accounts.secondary_button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            type="button"
            data-ocid="accounts.primary_button"
            onClick={() => {
              setEditAccount(null);
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + नवीन खाते
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
            placeholder="खाते क्रमांक, बँक किंवा विद्यार्थी शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="accounts.search_input"
            className="w-full max-w-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {isLoading ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="accounts.loading_state"
          >
            लोड होत आहे...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="accounts.empty_state"
          >
            {search ? "कोणतेही खाते सापडले नाही." : "अद्याप कोणतेही खाते जोडलेले नाही."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    खाते क्रमांक
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    विद्यार्थी
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    बँक
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    IFSC
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    वर्ग
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">
                    प्रारंभिक रक्कम
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    क्रिया
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((account, idx) => (
                  <tr
                    key={account.accountNumber}
                    data-ocid={`accounts.item.${idx + 1}`}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 font-medium text-foreground">
                      {account.accountNumber}
                    </td>
                    <td className="p-3 text-foreground">
                      {getStudentName(account.studentId)}
                    </td>
                    <td className="p-3 text-foreground">{account.bankName}</td>
                    <td className="p-3 text-foreground">{account.ifscCode}</td>
                    <td className="p-3 text-foreground">{account.className}</td>
                    <td className="p-3 text-right text-foreground">
                      ₹{Number(account.initialAmount).toLocaleString("mr-IN")}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(account)}
                          data-ocid={`accounts.edit_button.${idx + 1}`}
                          className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          संपादित
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(account.accountNumber)}
                          disabled={deleteAccount.isPending}
                          data-ocid={`accounts.delete_button.${idx + 1}`}
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

      <AccountForm
        open={showForm}
        account={editAccount}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
