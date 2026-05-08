"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
doc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

import { useParams } from "next/navigation";

export default function NotesPage() {
  const params = useParams();

  const chatId = params.chatId as string;

  const [notes, setNotes] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "meetingNotes"),
      where("chatId", "==", chatId),
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setNotes(data);
  };

  const addNote = async () => {
    const user = auth.currentUser;

    if (!user || !text.trim()) return;

    await addDoc(collection(db, "meetingNotes"), {
      chatId,

      facultyId: user.uid,

      notes: text,

      createdAt: serverTimestamp(),
    });

    setText("");

    fetchNotes();
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Meeting Notes
      </h1>

      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write notes..."
          className="w-full border rounded-lg p-3 min-h-[120px]"
        />

        <button
          onClick={addNote}
          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Save Note
        </button>
      </div>

      <div className="space-y-4">
        {notes.map((n) => (
          <div
  key={n.id}
  className="bg-white border rounded-xl p-4"
>
  <p className="text-gray-700">
    {n.notes}
  </p>

  <button
    onClick={async () => {
      await deleteDoc(
        doc(db, "meetingNotes", n.id),
      );

      fetchNotes();
    }}
    className="mt-3 text-sm text-red-500 hover:text-red-700"
  >
    Delete
  </button>
</div>
        ))}
      </div>
    </div>
  );
}