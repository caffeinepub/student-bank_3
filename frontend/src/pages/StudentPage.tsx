import React, { useState } from 'react';
import { useGetAllStudents, useDeleteStudent } from '../hooks/useQueries';
import StudentForm from '../components/StudentForm';
import type { Student } from '../backend';

export default function StudentPage() {
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { data: students = [], isLoading } = useGetAllStudents();
  const deleteStudent = useDeleteStudent();

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.className.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolName.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('हा विद्यार्थी हटवायचा आहे का?')) return;
    setDeleteError('');
    try {
      await deleteStudent.mutateAsync(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(`हटवताना त्रुटी: ${msg}`);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditStudent(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">विद्यार्थी</h1>
        <button
          onClick={() => { setEditStudent(null); setShowForm(true); }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          + नवीन विद्यार्थी
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
            placeholder="नाव, वर्ग किंवा शाळा शोधा..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">लोड होत आहे...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? 'कोणताही विद्यार्थी सापडला नाही.' : 'अद्याप कोणताही विद्यार्थी जोडलेला नाही.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">क्र.</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">नाव</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">वर्ग</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">हजेरी क्र.</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">शाळा</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">तालुका</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">जिल्हा</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => (
                  <tr key={student.id.toString()} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground">{student.id.toString()}</td>
                    <td className="p-3 font-medium text-foreground">{student.name}</td>
                    <td className="p-3 text-foreground">{student.className}</td>
                    <td className="p-3 text-foreground">{student.attendanceNumber.toString()}</td>
                    <td className="p-3 text-foreground">{student.schoolName}</td>
                    <td className="p-3 text-foreground">{student.taluka}</td>
                    <td className="p-3 text-foreground">{student.district}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          संपादित
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={deleteStudent.isPending}
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
        student={editStudent}
        onClose={handleClose}
      />
    </div>
  );
}
