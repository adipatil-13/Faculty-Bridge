"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

export function useRoleGuard(requiredRole: string) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.data()?.role;

      if (!userDoc.exists()) {
        router.push("/login");
        return;
      }

      if (role !== requiredRole) {
        if (role === "student") router.push("/student");
        else if (role === "faculty") router.push("/faculty");
        else router.push("/"); // or redirect based on role
      }
    });

    return () => unsubscribe();
  }, []);
}
