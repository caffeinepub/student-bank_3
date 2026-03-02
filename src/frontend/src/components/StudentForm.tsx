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
import type { Student } from "../backend";
import { useAddStudent, useUpdateStudent } from "../hooks/useQueries";

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export default function StudentForm({
  open,
  onOpenChange,
  student,
}: StudentFormProps) {
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    className: "",
    attendanceNumber: "",
    schoolName: "",
    taluka: "",
    district: "",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form when dialog opens/closes
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
      setForm({
        name: "",
        dateOfBirth: "",
        className: "",
        attendanceNumber: "",
        schoolName: "",
        taluka: "",
        district: "",
      });
    }
  }, [student, open]);

  const isLoading = addStudent.isPending || updateStudent.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.dateOfBirth ||
      !form.className.trim() ||
      !form.attendanceNumber
    ) {
      toast.error("कृपया नाव, जन्मतारीख, वर्ग आणि हजेरी क्रमांक भरा");
      return;
    }

    const payload = {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      className: form.className.trim(),
      attendanceNumber: Number.parseInt(form.attendanceNumber, 10),
      schoolName: form.schoolName.trim(),
      taluka: form.taluka.trim(),
      district: form.district.trim(),
    };

    try {
      if (student) {
        await updateStudent.mutateAsync({ id: Number(student.id), ...payload });
        toast.success("विद्यार्थी माहिती यशस्वीरित्या अपडेट झाली!");
      } else {
        await addStudent.mutateAsync(payload);
        toast.success("विद्यार्थी यशस्वीरित्या जोडला गेला!");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "माहिती save होऊ शकली नाही";
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("admin") ||
        msg.toLowerCase().includes("not authorized")
      ) {
        toast.error("Admin म्हणून login करा आणि पुन्हा प्रयत्न करा");
      } else {
        toast.error(`माहिती save होऊ शकली नाही: ${msg}`);
      }
      // Do NOT close dialog on error — let user retry
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {student ? "विद्यार्थी माहिती बदला" : "नवीन विद्यार्थी जोडा"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">नाव *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="विद्यार्थ्याचे नाव"
                required
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">जन्मतारीख *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="className">वर्ग *</Label>
              <Input
                id="className"
                value={form.className}
                onChange={(e) => handleChange("className", e.target.value)}
                placeholder="उदा. 5वी"
                required
              />
            </div>

            <div>
              <Label htmlFor="attendanceNumber">हजेरी क्रमांक *</Label>
              <Input
                id="attendanceNumber"
                type="number"
                min="1"
                value={form.attendanceNumber}
                onChange={(e) =>
                  handleChange("attendanceNumber", e.target.value)
                }
                placeholder="हजेरी क्रमांक"
                required
              />
            </div>

            <div>
              <Label htmlFor="schoolName">शाळेचे नाव</Label>
              <Input
                id="schoolName"
                value={form.schoolName}
                onChange={(e) => handleChange("schoolName", e.target.value)}
                placeholder="शाळेचे नाव"
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
              {isLoading ? "Save होत आहे..." : student ? "अपडेट करा" : "जोडा"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
