"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useRoleGuard } from "@/lib/useRoleGuard";
import DashboardLayout from "@/components/DashboardLayout";

export default function StudentPage() {
  useRoleGuard("student");

  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // 🔥 Handle Chat Creation
  const handleChat = async (facultyId: string) => {
    const studentId = auth.currentUser?.uid;
    if (!studentId) return;

    const chatId =
      studentId < facultyId
        ? `${studentId}_${facultyId}`
        : `${facultyId}_${studentId}`;

    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [studentId, facultyId],
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    router.push(`/chat/${chatId}`);
  };

  // 🔥 Auth + Role + Fetch Faculty (ALL IN ONE PLACE)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.data()?.role;

      if (role !== "student") {
        router.push("/");
        return;
      }

      // ✅ Fetch faculty AFTER auth confirmed
      const facultyQuery = query(
        collection(db, "users"),
        where("role", "==", "faculty"),
      );

      const facultySnapshot = await getDocs(facultyQuery);

      const facultyList = facultySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Fetch announcements
      const announcementQuery = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc"),
      );

      const announcementSnapshot = await getDocs(announcementQuery);

      const announcementList = announcementSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Update state
      setFaculty(facultyList);

      setAnnouncements(announcementList);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Faculty</h1>

          <button
            onClick={() => router.push("/chat")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Open Chats
          </button>
        </div>

        {loading && <p>Loading faculty...</p>}
        {!loading && faculty.length === 0 && <p>No faculty available</p>}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {a.facultyName}
                    </p>

                    <p className="text-gray-600 mt-1">{a.text}</p>

                    <p className="text-xs text-gray-400 mt-2">
                      {a.createdAt?.toDate
                        ? a.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      await deleteDoc(doc(db, "announcements", a.id));

                      setAnnouncements((prev) =>
                        prev.filter((x) => x.id !== a.id),
                      );
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faculty.map((f) => (
            <div
              key={f.id}
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition border flex flex-col justify-between"
            >
              {/* 🔥 TOP: PROFILE */}
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={f.photoURL || "/default-avatar.png"}
                  className="w-12 h-12 rounded-full object-cover border"
                />

                <div>
                  {/* NAME */}
                  <h2 className="text-lg font-semibold text-gray-800">
                    {f.name}
                  </h2>

                  {/* DEPARTMENT */}
                  <p className="text-sm text-gray-500">
                    {f.department || "Department not set"}
                  </p>

                  <div className="mt-2">
                    {(f.status || "Available") === "Available" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        🟢 Available
                      </span>
                    )}

                    {f.status === "Busy" && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        🟡 Busy
                      </span>
                    )}

                    {f.status === "Offline" && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        🔴 Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 🔥 SUBJECTS */}
              {f.subjects && f.subjects.length > 0 && (
                <p className="text-xs text-gray-400 mb-3">
                  {f.subjects.join(" • ")}
                </p>
              )}

              {/* 🔥 ACTIONS */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleChat(f.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
                >
                  Chat
                </button>

                {f.calendlyLink ? (
                  <a href={f.calendlyLink} target="_blank" className="flex-1">
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition">
                      Book
                    </button>
                  </a>
                ) : (
                  <button className="flex-1 bg-gray-300 text-gray-600 px-3 py-1.5 rounded-lg cursor-not-allowed">
                    Not Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
