"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { FilePlus, LogOut } from "lucide-react";

interface Resume {
  id: number;
  name: string;
  status: "Processing" | "Completed";
}

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext)!;
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    if (!token) router.push("/auth/login");
    else fetchResumes();
  }, [token]);

  const fetchResumes = async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      await fetchResumes(); // Refresh resume list
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>

        <div className="mb-6">
          <label className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
            <FilePlus size={20} className="mr-2" /> Upload Resume
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          {uploading && <p className="mt-2 text-blue-500">Uploading...</p>}
        </div>

        <h2 className="text-lg font-semibold mb-3">Uploaded Resumes</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          {resumes.length === 0 ? (
            <p className="text-gray-500 text-center">
              No resumes uploaded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {resumes.map((resume) => (
                <li
                  key={resume.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow"
                >
                  <span className="font-medium">{resume.name}</span>
                  <span
                    className={`px-2 py-1 text-sm rounded ${
                      resume.status === "Completed"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {resume.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
