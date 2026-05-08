"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export default function ChatListPage() {
  const [chats, setChats] = useState<any[]>([]);
  const router = useRouter();

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

          const otherUserId = data.participants.find(
            (id: string) => id !== userId,
          );

          const userSnap = await getDoc(doc(db, "users", otherUserId));

          const messagesQuery = query(
  collection(db, "chats", chatDoc.id, "messages"),
);

const messagesSnap = await getDocs(messagesQuery);

const lastMessage =
  messagesSnap.docs[messagesSnap.docs.length - 1]?.data();

return {
  id: chatDoc.id,
  name: userSnap.data()?.name || "Unknown User",
  email: userSnap.data()?.email || "",

  lastMessage: lastMessage?.text || "No messages yet",
};
        }),
      );

      setChats(chatList);
    };

    fetchChats();
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Chats
        </h1>

        {chats.length === 0 && (
          <p className="text-gray-500">
            No chats yet
          </p>
        )}

        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <h2 className="font-semibold text-gray-800">
                {chat.name}
              </h2>

              <p className="text-sm text-gray-500 truncate">
  {chat.lastMessage}
</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}