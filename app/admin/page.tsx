"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/DashboardLayout";

import { useRoleGuard } from "@/lib/useRoleGuard";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  Users,
  GraduationCap,
  MessageCircle,
  Megaphone,
  Trash2,
} from "lucide-react";

export default function AdminPage() {
  useRoleGuard("admin");

  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [chatCount, setChatCount] = useState(0);

  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // USERS
    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
    );

    const userSnapshot = await getDocs(usersQuery);

    const users = userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setStudents(users.filter((u: any) => u.role === "student"));

    setFaculty(users.filter((u: any) => u.role === "faculty"));

    setRecentUsers(users.slice(0, 5));

    // CHATS
    const chatSnapshot = await getDocs(collection(db, "chats"));

    setChatCount(chatSnapshot.size);

    // ANNOUNCEMENTS
    const announcementSnapshot = await getDocs(collection(db, "announcements"));

    const announcementData = announcementSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setAnnouncements(announcementData);
  };

  // DELETE USER
  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));

    fetchData();
  };

  // DELETE ANNOUNCEMENT
  const deleteAnnouncement = async (id: string) => {
    await deleteDoc(doc(db, "announcements", id));

    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-3xl rounded-full" />

        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-3xl rounded-full" />
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

          <p className="text-gray-500 mt-1">Faculty Bridge management panel</p>
        </div>

        {/* OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <OverviewCard
            title="Students"
            value={students.length}
            icon={<Users size={22} />}
          />

          <OverviewCard
            title="Faculty"
            value={faculty.length}
            icon={<GraduationCap size={22} />}
          />

          <OverviewCard
            title="Chats"
            value={chatCount}
            icon={<MessageCircle size={22} />}
          />

          <OverviewCard
            title="Announcements"
            value={announcements.length}
            icon={<Megaphone size={22} />}
          />
        </div>

        {/* FACULTY */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">Faculty Management</h2>

          <div className="space-y-3">
            {faculty.map((f: any) => (
              <div
                key={f.id}
                className="flex items-center justify-between border rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">{f.name}</p>

                  <p className="text-sm text-gray-500">{f.email}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {f.department || "No department"}
                  </p>
                </div>

                <button
                  onClick={() => deleteUser(f.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* STUDENTS */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">Student Management</h2>

          <div className="space-y-3">
            {students.map((s: any) => (
              <div
                key={s.id}
                className="flex items-center justify-between border rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">{s.name}</p>

                  <p className="text-sm text-gray-500">{s.email}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {s.branch || "No branch"} • {s.year || "No year"}
                  </p>
                </div>

                <button
                  onClick={() => deleteUser(s.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ANNOUNCEMENTS */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">
            Announcement Moderation
          </h2>

          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div
                key={a.id}
                className="border rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">{a.facultyName}</p>

                  <p className="text-gray-600 mt-1">{a.text}</p>
                </div>

                <button
                  onClick={() => deleteAnnouncement(a.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT USERS */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">Recently Joined Users</h2>

          <div className="space-y-3">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{u.name}</p>

                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>

                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function OverviewCard({ title, value, icon }: any) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">{value}</h2>
        </div>

        <div className="bg-gray-100 p-3 rounded-xl text-gray-700">{icon}</div>
      </div>
    </div>
  );
}
