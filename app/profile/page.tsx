"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [role, setRole] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    branch: "",
    year: "",
    rollNumber: "",
    department: "",
    subjects: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔥 LOAD USER DATA
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        console.log("User doc missing");
        return;
      }

      const data = snap.data();

      setRole(data.role);

      setForm({
        name: data.name || "",
        branch: data.branch || "",
        year: data.year || "",
        rollNumber: data.rollNumber || "",
        department: data.department || "",
        subjects: (data.subjects || []).join(", "),
        bio: data.bio || "",
      });
    });

    return () => unsubscribe();
  }, []);

  // 🔥 SAVE PROFILE
  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);

    try {
      const updateData: any = {
        name: form.name,
      };

      if (role === "student") {
        updateData.branch = form.branch;
        updateData.year = form.year;
        updateData.rollNumber = form.rollNumber;
      }

      if (role === "faculty") {
        updateData.department = form.department;
        updateData.subjects = form.subjects
          .split(",")
          .map((s: string) => s.trim());
        updateData.bio = form.bio;
      }

      console.log("UPDATING:", updateData);

      await updateDoc(doc(db, "users", uid), updateData);

      console.log("UPDATED SUCCESS");

      router.push(role === "faculty" ? "/faculty" : "/student");
    } catch (err) {
      console.error("SAVE ERROR:", err);
    }

    setLoading(false);
  };

  if (!role) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4 bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold text-center">
        Complete your profile
      </h1>

      {/* NAME */}
      <Input
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      {/* STUDENT */}
      {role === "student" && (
        <>
          <Input
            placeholder="Branch"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
          />
          <Input
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
          <Input
            placeholder="Roll Number"
            value={form.rollNumber}
            onChange={(e) =>
              setForm({ ...form, rollNumber: e.target.value })
            }
          />
        </>
      )}

      {/* FACULTY */}
      {role === "faculty" && (
        <>
          <Input
            placeholder="Department"
            value={form.department}
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
          />
          <Input
            placeholder="Subjects (comma separated)"
            value={form.subjects}
            onChange={(e) =>
              setForm({ ...form, subjects: e.target.value })
            }
          />
          <Input
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </>
      )}

      <Button onClick={handleSave} className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}