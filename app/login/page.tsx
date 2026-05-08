"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createUserIfNotExists } from "@/lib/userService";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);

  console.log("✅ Logged in:", result.user.email);

  // 🔥 FORCE Firestore creation BEFORE redirect
  const role = await createUserIfNotExists(result.user);

  console.log("🔥 Firestore user created with role:", role);

  // 🔥 NOW redirect
  if (role === "student") router.push("/student");
  else if (role === "faculty") router.push("/faculty");
  else router.push("/admin");
};
  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative bg-black text-white p-12 flex-col justify-between overflow-hidden">
        {/* 🔥 Glow background */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500 opacity-30 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500 opacity-20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-6 tracking-tight">
            Faculty Bridge
          </h1>

          <h2 className="text-5xl font-semibold leading-tight mb-6">
            Stop emailing.
            <br />
            Start connecting.
          </h2>

          <p className="text-gray-300 text-lg mb-10 max-w-md">
            Chat with faculty in real-time, book sessions instantly, and manage
            everything in one place.
          </p>

          <div className="space-y-3 text-gray-400">
            <div>— Real-time conversations</div>
            <div>— Smart scheduling</div>
            <div>— Clean student–faculty workflow</div>
          </div>
        </div>

        <p className="text-xs text-gray-500 relative z-10">
          Designed for modern campuses
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 relative">
        {/* Background grain */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,gray_1px,transparent_0)] [background-size:20px_20px]" />

        <Card className="w-[380px] shadow-2xl bg-white/80 backdrop-blur-md border border-gray-200">
          {/* HEADER */}
          <CardHeader className="text-center space-y-4">
            {/* Toggle */}
            <div className="flex justify-center gap-6 text-sm">
              <button className="font-semibold text-black border-b-2 border-black pb-1">
                Sign in
              </button>
              <button className="text-gray-400 hover:text-black transition">
                Create account
              </button>
            </div>

            {/* Title */}
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Welcome to Faculty Bridge
            </CardTitle>

            {/* Description */}
            <CardDescription className="text-sm text-gray-500">
              Sign in or create an account using your college email
            </CardDescription>
          </CardHeader>

          {/* CONTENT */}
          <CardContent className="flex flex-col gap-4">
            {/* Google Button */}
            <Button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
              />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="h-px bg-gray-200 flex-1" />
              OR
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Placeholder (future email/password) */}
            <button className="w-full border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-100 transition">
              Continue with Email (coming soon)
            </button>

            {/* Footer note */}
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              Just Sign In for Now
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
