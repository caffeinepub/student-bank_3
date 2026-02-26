import React, { useState } from 'react';
import { useGetAllBankDetails, useDeleteBankDetail } from '../hooks/useQueries';
import BankDetailForm from '../components/BankDetailForm';
import type { BankDetail } from '../backend';

export default function BankDetailsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editBankDetail, setEditBankDetail] = useState<BankDetail | null>(null);
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { data: bankDetails = [], isLoading } = useGetAllBankDetails();
  const deleteBankDetail = useDeleteBankDetail();

  const filtered = bankDetails.filter(b =>
    b.bankName.toLowerCase().includes(search.toLowerCase()) ||
    b.ifscCode.toLowerCase().includes(search.toLowerCase()) ||
    b.taluka.toLowerCase().includes(search.toLowerCase()) ||
    b.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (bd: BankDetail) => {
    setEditBankDetail(bd);
    setShowForm(true);
  };

  const handleDelete = async (ifscCode: string) => {
    if (!confirm('हा बँक तपशील हटवायचा आहे का?')) return;
    setDeleteError('');
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">बँक तपशील</h1>
        <button
          onClick={() => { setEditBankDetail(null); setShowForm(true); }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + नवीन बँक तपशील
        </button>
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
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">लोड होत आहे...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? 'कोणताही बँक तपशील सापडला नाही.' : 'अद्याप कोणताही बँक तपशील जोडलेला नाही.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">बँकेचे नाव</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">IFSC Code</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">तालुका</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">जिल्हा</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bd => (
                  <tr key={bd.ifscCode} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{bd.bankName}</td>
                    <td className="p-3 font-mono text-foreground">{bd.ifscCode}</td>
                    <td className="p-3 text-foreground">{bd.taluka}</td>
                    <td className="p-3 text-foreground">{bd.district}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bd)}
                          className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          संपादित
                        </button>
                        <button
                          onClick={() => handleDelete(bd.ifscCode)}
                          disabled={deleteBankDetail.isPending}
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
