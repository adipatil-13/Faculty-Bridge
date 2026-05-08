import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function getRoleFromEmail(email: string) {
  if (email === "adityapatil1308@gmail.com") return "admin";
  if (email === "aditya1patil1308@gmail.com") return "faculty";
  if (email === "adityapatil13official@gmail.com") return "faculty";
  if (email === "aditya00003142462@gmail.com") return "faculty";
  if (email === "aditya2patil13@gmail.com") return "student";
  if (email === "kulkarniyash369@gmail.com") return "student";
  if (email === "aditya2223849@gmail.com") return "student";

  return "student";
}

export async function createUserIfNotExists(user: any) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  const role = getRoleFromEmail(user.email);

  if (!snapshot.exists()) {
    console.log("🔥 Creating user in Firestore");

    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email,
      role,
      photoURL: user.photoURL || "",
      createdAt: new Date(),

      // student
      branch: "",
      year: "",
      rollNumber: "",

      // faculty
      department: "",
      subjects: [],
      bio: "",
      calendlyLink: "",
      status: "Available",
    });
  } else {
    console.log("✅ User already exists");
  }

  return role;
}
