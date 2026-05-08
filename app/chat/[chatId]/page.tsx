"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { doc, getDoc } from "firebase/firestore";

export default function ChatPage() {
  const { chatId } = useParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔥 REALTIME LISTENER
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId as string, "messages"),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(msgs);

      // 🔥 AUTO SCROLL
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);
  useEffect(() => {
    const fetchOtherUser = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const chatParts = (chatId as string).split("_");

      const otherUserId = chatParts.find((id) => id !== currentUser.uid);

      if (!otherUserId) return;

      const snap = await getDoc(doc(db, "users", otherUserId));

      setOtherUser(snap.data());
    };

    fetchOtherUser();
  }, [chatId]);

  // 🔥 SEND MESSAGE
  // 🔥 SEND MESSAGE
const sendMessage = async () => {
  if (!newMessage.trim()) return;

  const user = auth.currentUser;

  if (!user) return;

  // ✅ FETCH UPDATED PROFILE DATA FROM FIRESTORE
  const userSnap = await getDoc(
    doc(db, "users", user.uid),
  );

  const userData = userSnap.data();

  // ✅ SAVE MESSAGE
  await addDoc(
    collection(db, "chats", chatId as string, "messages"),
    {
      text: newMessage,

      senderId: user.uid,

      // ✅ USE FIRESTORE NAME
      senderName: userData?.name || "User",

      timestamp: serverTimestamp(),
    },
  );

  // ✅ FIND OTHER USER
  const chatParts = (chatId as string).split("_");

  const otherUserId = chatParts.find(
    (id) => id !== user.uid,
  );

  // ✅ CREATE NOTIFICATION
  if (otherUserId) {
    await addDoc(collection(db, "notifications"), {
      userId: otherUserId,

      text: `${userData?.name} sent you a message`,

      chatId: chatId,

      read: false,

      createdAt: serverTimestamp(),
    });
  }

  setNewMessage("");
};

  return (
    <DashboardLayout role="student">
      <div className="h-[85vh] flex flex-col bg-white rounded-2xl shadow-lg border overflow-hidden">
        {/* HEADER */}
        <div className="border-b px-6 py-4 bg-white sticky top-0 z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
            {otherUser?.name?.charAt(0) || "U"}
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {otherUser?.name || "User"}
            </h1>

            {/* <p className="text-xs text-gray-500">
      Active recently
    </p> */}
          </div>
        </div>

        {/* 🔥 MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">{msg.text}</p>

                    <p
                      className={`text-[10px] self-end ${
                        isMe ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {msg.timestamp?.toDate
                        ? msg.timestamp.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef}></div>
        </div>

        {/* 🔥 INPUT */}
        <div className="border-t bg-white p-4 flex gap-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl transition"
          >
            Send
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
