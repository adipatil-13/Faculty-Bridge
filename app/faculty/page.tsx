"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useRoleGuard } from "@/lib/useRoleGuard";
import DashboardLayout from "@/components/DashboardLayout";

export default function FacultyPage() {
  useRoleGuard("faculty");
  const [chats, setChats] = useState<any[]>([]);
  const [link, setLink] = useState("");
  const router = useRouter();
  const [status, setStatus] = useState("Available");
  const [announcement, setAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  const saveCalendlyLink = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await updateDoc(doc(db, "users", userId), {
      calendlyLink: link,
      status: status,
    });

    alert("Calendly link saved!");
  };

  const postAnnouncement = async () => {
    const user = auth.currentUser;

    if (!user || !announcement.trim()) return;

    await addDoc(collection(db, "announcements"), {
      facultyId: user.uid,
      facultyName: userData?.name || user.displayName,

      text: announcement,

      createdAt: serverTimestamp(),
    });

    setAnnouncement("");

    alert("Announcement posted!");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      setUserData(snap.data());

      const announcementQuery = query(
        collection(db, "announcements"),
        where("facultyId", "==", user.uid),
      );

      const announcementSnapshot = await getDocs(announcementQuery);

      const announcementList = announcementSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAnnouncements(announcementList);
      setLink(snap.data()?.calendlyLink || "");
      setStatus(snap.data()?.status || "Available");
    };

    fetchUser();
  }, []);
  useEffect(() => {
    const fetchChats = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId),
      );

      const snapshot = await getDocs(q);

      const chatList = await Promise.all(
        snapshot.docs.map(async (chatDoc) => {
          const data = chatDoc.data();
          const userId = auth.currentUser?.uid;

          const otherUserId = data.participants.find(
            (id: string) => id !== userId,
          );

          const userSnap = await getDoc(doc(db, "users", otherUserId));

          return {
            id: chatDoc.id,
            name: userSnap.data()?.name,
            email: userSnap.data()?.email,
            photoURL: userSnap.data()?.photoURL,
            branch: userSnap.data()?.branch,
            year: userSnap.data()?.year,
            rollNumber: userSnap.data()?.rollNumber,
          };
        }),
      );

      setChats(chatList);
    };

    fetchChats();
  }, []);

  return (
    <DashboardLayout role="faculty">
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* 🔥 HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Faculty Dashboard
          </h1>

          <button
            onClick={() => router.push("/chat")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Open Chats
          </button>
        </div>

        {/* 🔥 CALENDLY CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Scheduling Link
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT CARD */}
            <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Faculty Settings
              </h2>

              {/* Calendly */}
              <div>
                <label className="text-sm text-gray-600">Calendly Link</label>

                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste your Calendly link"
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-600">
                  Availability Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 border rounded-lg px-3 py-2"
                >
                  <option>Available</option>
                  <option>Busy</option>
                  <option>Offline</option>
                </select>
              </div>

              <button
                onClick={saveCalendlyLink}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Save Settings
              </button>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Post Announcement
              </h2>

              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Write announcement..."
                className="w-full border rounded-lg px-3 py-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={postAnnouncement}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Post Announcement
              </button>
              
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Your Announcements
                </h2>

                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="border rounded-lg p-4">
                      <p className="text-gray-700">{a.text}</p>

                      <button
                        onClick={async () => {
                          await deleteDoc(doc(db, "announcements", a.id));

                          setAnnouncements((prev) =>
                            prev.filter((x) => x.id !== a.id),
                          );
                        }}
                        className="mt-3 text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

        {/* 🔥 CHAT LIST */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Conversations
          </h2>

          {chats.length === 0 && (
            <p className="text-gray-500">No student interactions yet</p>
          )}

          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition border cursor-pointer flex items-center gap-4"
              >
                {/* 🔥 AVATAR */}
                <img
                  src={chat.photoURL || "/default-avatar.png"}
                  className="w-12 h-12 rounded-full object-cover border"
                />

                {/* 🔥 INFO */}
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-800">{chat.name}</h3>

                  <p className="text-xs text-gray-400">{chat.email}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      router.push(`/notes/${chat.id}`);
                    }}
                    className="mt-3 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg w-fit"
                  >
                    Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
