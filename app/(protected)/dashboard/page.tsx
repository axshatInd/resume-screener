"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext)!;
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl">Welcome to Dashboard</h1>
      <button onClick={logout} className="bg-red-500 text-white p-2 mt-4">
        Logout
      </button>
    </div>
  );
}
