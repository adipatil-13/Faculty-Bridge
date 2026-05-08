"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        console.error("User doc missing");
        return;
      }

      const role = snap.data().role;

      // 🔥 Correct routing
      if (role === "student") router.replace("/student");
      else if (role === "faculty") router.replace("/faculty");
      else router.replace("/admin");
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-gray-600">
      Loading...
    </div>
  );
}