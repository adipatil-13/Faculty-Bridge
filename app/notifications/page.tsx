"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(data);

      // mark read
      snapshot.docs.forEach(async (d) => {
        await updateDoc(doc(db, "notifications", d.id), {
          read: true,
        });
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => router.push(`/chat/${n.chatId}`)}
              className="bg-white border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div>
                <p className="text-gray-800">{n.text}</p>

                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt?.toDate
                    ? n.createdAt.toDate().toLocaleString()
                    : "Just now"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
