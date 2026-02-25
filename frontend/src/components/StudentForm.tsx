import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddStudent, useUpdateStudent } from '../hooks/useQueries';
import type { Student } from '../backend';
import { Loader2, AlertCircle } from 'lucide-react';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
}

export default function StudentForm({ open, onClose, student }: StudentFormProps) {
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();

  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    className: '',
    attendanceNumber: '',
    schoolName: '',
    taluka: '',
    district: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name,
        dateOfBirth: student.dateOfBirth,
        className: student.className,
        attendanceNumber: student.attendanceNumber.toString(),
        schoolName: student.schoolName,
        taluka: student.taluka,
        district: student.district,
      });
    } else {
      setForm({ name: '', dateOfBirth: '', className: '', attendanceNumber: '', schoolName: '', taluka: '', district: '' });
    }
    setError('');
  }, [student, open]);

  const isLoading = addStudent.isPending || updateStudent.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.dateOfBirth.trim()) { setError('Date of birth is required'); return; }
    if (!form.className.trim()) { setError('Class is required'); return; }
    if (!form.attendanceNumber.trim()) { setError('Attendance number is required'); return; }
    if (!form.schoolName.trim()) { setError('School name is required'); return; }
    if (!form.taluka.trim()) { setError('Taluka is required'); return; }
    if (!form.district.trim()) { setError('District is required'); return; }

    const attendanceNumber = BigInt(form.attendanceNumber);

    try {
      if (student) {
        await updateStudent.mutateAsync({
          id: student.id,
          name: form.name.trim(),
          dateOfBirth: form.dateOfBirth.trim(),
          className: form.className.trim(),
          attendanceNumber,
          schoolName: form.schoolName.trim(),
          taluka: form.taluka.trim(),
          district: form.district.trim(),
        });
      } else {
        await addStudent.mutateAsync({
          name: form.name.trim(),
          dateOfBirth: form.dateOfBirth.trim(),
          className: form.className.trim(),
          attendanceNumber,
          schoolName: form.schoolName.trim(),
          taluka: form.taluka.trim(),
          district: form.district.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save student. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Student name" disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="class">Class</Label>
              <Input id="class" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} placeholder="e.g. 5th" disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="attendance">Attendance Number</Label>
              <Input id="attendance" type="number" value={form.attendanceNumber} onChange={e => setForm(f => ({ ...f, attendanceNumber: e.target.value }))} placeholder="e.g. 42" disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="school">School Name</Label>
              <Input id="school" value={form.schoolName} onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="School name" disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="taluka">Taluka</Label>
              <Input id="taluka" value={form.taluka} onChange={e => setForm(f => ({ ...f, taluka: e.target.value }))} placeholder="Taluka" disabled={isLoading} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} placeholder="District" disabled={isLoading} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {student ? 'Update' : 'Add'} Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
