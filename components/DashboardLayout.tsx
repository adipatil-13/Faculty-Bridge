"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { auth, db } from "@/lib/firebase";

import { signOut, onAuthStateChanged } from "firebase/auth";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Lancelot } from "next/font/google";

const lancelot = Lancelot({
  weight: "400",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
  role,
}: {
  children: ReactNode;
  role: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [userData, setUserData] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // FETCH USER + NOTIFICATIONS
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // USER DATA
      const snap = await getDoc(doc(db, "users", user.uid));

      setUserData(snap.data());

      // REALTIME NOTIFICATION COUNT
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("read", "==", false),
      );

      const notifUnsub = onSnapshot(q, (snapshot) => {
        setNotificationCount(snapshot.docs.length);
      });

      return () => notifUnsub();
    });

    return () => unsub();
  }, []);

  // LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div
      className={`flex h-screen ${
        role === "admin"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gray-100"
      }`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-64 p-6 flex flex-col justify-between border-r shadow-lg ${
          role === "admin"
            ? "bg-black/30 backdrop-blur-xl text-white border-white/10"
            : "bg-gray-900 text-white border-gray-800"
        }`}
      >
        {/* TOP */}
        <div>
          <div className="mb-10 flex items-center gap-3">
            {/* LOGO */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-950 blur-2xl opacity-60 rounded-2xl" />

              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center shadow-xl shadow-black/40">
                <span
                  className={`${lancelot.className} text-white text-2xl tracking-wide`}
                >
                  FB
                </span>
              </div>
            </div>

            {/* TEXT */}
            <h2 className="text-xl font-bold tracking-tight text-white">
              Faculty Bridge
            </h2>
          </div>

          {/* USER */}
          <div className="mb-6 flex items-center gap-3">
            {/* INITIAL AVATAR */}
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
              {userData?.name?.charAt(0) || "U"}
            </div>

            <div>
              <p className="text-sm text-gray-400">Logged in as</p>

              <p className="font-semibold text-white text-sm">
                {userData?.name || "User"}
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-2 mt-6">
            {/* CHATS */}
            <button
              onClick={() => router.push("/chat")}
              className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                pathname === "/chat"
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Chats
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={() => router.push("/notifications")}
              className="w-full flex justify-between items-center text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              <span>Notifications</span>

              {notificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* PROFILE */}
            <button
              onClick={() => router.push("/profile")}
              className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                pathname === "/profile"
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Profile
            </button>

            {/* STUDENT */}
            {role === "student" && (
              <button
                onClick={() => router.push("/student")}
                className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                  pathname === "/student"
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Faculty
              </button>
            )}

            {/* FACULTY */}
            {role === "faculty" && (
              <button
                onClick={() => router.push("/faculty")}
                className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                  pathname === "/faculty"
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Dashboard
              </button>
            )}

            {/* ADMIN */}
            {role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                  pathname === "/admin"
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Admin
              </button>
            )}
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="text-red-400 text-sm hover:text-red-300 transition"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-transparent p-6 overflow-y-auto flex justify-center">
        <div className="w-full max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
