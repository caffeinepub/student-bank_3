import { Download, Loader2, Upload } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Student } from "../backend";
import StudentForm from "../components/StudentForm";
import {
  useAddStudent,
  useDeleteStudent,
  useGetAllStudents,
} from "../hooks/useQueries";
import { exportStudentsCSV, parseStudentsCSV } from "../utils/importExport";

export default function StudentPage() {
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [importing, setImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const { data: students = [], isLoading } = useGetAllStudents();
  const deleteStudent = useDeleteStudent();
  const addStudent = useAddStudent();

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      s.schoolName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("हा विद्यार्थी हटवायचा आहे का?")) return;
    setDeleteError("");
    try {
      await deleteStudent.mutateAsync(Number(id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(`हटवताना त्रुटी: ${msg}`);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowForm(open);
    if (!open) setEditStudent(null);
  };

  const handleExport = () => {
    try {
      exportStudentsCSV(students);
      toast.success(`${students.length} विद्यार्थी Export केले!`);
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
      const parsed = parseStudentsCSV(text);
      if (parsed.length === 0) {
        toast.error("CSV मध्ये कोणताही विद्यार्थी आढळला नाही.");
        return;
      }
      let added = 0;
      let skipped = 0;
      for (const s of parsed) {
        const exists = students.some(
          (ex) =>
            ex.name.trim().toLowerCase() === s.name.trim().toLowerCase() &&
            ex.className.trim().toLowerCase() ===
              s.className.trim().toLowerCase() &&
            ex.attendanceNumber.toString() === s.attendanceNumber.toString(),
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
        toast.success(`${added} विद्यार्थी जोडले, ${skipped} skip केले`);
      } else {
        toast.info(`सर्व ${skipped} विद्यार्थी आधीच आहेत.`);
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
        <h1 className="text-2xl font-bold text-foreground">विद्यार्थी</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-ocid="students.secondary_button"
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
            id="student-page-import"
            data-ocid="students.upload_button"
          />
          <label
            htmlFor="student-page-import"
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
            data-ocid="students.primary_button"
            onClick={() => {
              setEditStudent(null);
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + नवीन विद्यार्थी
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
            placeholder="नाव, वर्ग किंवा शाळा शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="students.search_input"
            className="w-full max-w-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {isLoading ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="students.loading_state"
          >
            लोड होत आहे...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="students.empty_state"
          >
            {search
              ? "कोणताही विद्यार्थी सापडला नाही."
              : "अद्याप कोणताही विद्यार्थी जोडलेला नाही."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    क्र.
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    नाव
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    वर्ग
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    हजेरी क्र.
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    शाळा
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
                {filtered.map((student, idx) => (
                  <tr
                    key={student.id.toString()}
                    data-ocid={`students.item.${idx + 1}`}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 text-muted-foreground">
                      {student.id.toString()}
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {student.name}
                    </td>
                    <td className="p-3 text-foreground">{student.className}</td>
                    <td className="p-3 text-foreground">
                      {student.attendanceNumber.toString()}
                    </td>
                    <td className="p-3 text-foreground">
                      {student.schoolName}
                    </td>
                    <td className="p-3 text-foreground">{student.taluka}</td>
                    <td className="p-3 text-foreground">{student.district}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(student)}
                          data-ocid={`students.edit_button.${idx + 1}`}
                          className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          संपादित
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student.id)}
                          disabled={deleteStudent.isPending}
                          data-ocid={`students.delete_button.${idx + 1}`}
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

      <StudentForm
        open={showForm}
        onOpenChange={handleOpenChange}
        student={editStudent}
      />
    </div>
  );
}
