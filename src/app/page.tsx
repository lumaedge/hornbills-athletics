"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HOUSE, HOUSE_FULL } from "@/lib/config";

export default function Dashboard() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [learnerCount, setLearnerCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/learners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLearnerCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setMessage(`Successfully imported ${data.imported} learners!`);
        setLearnerCount(data.imported);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">{HOUSE_FULL} — Practice Day Manager</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="text-sm text-gray-500">Total Learners</div>
          <div className="text-3xl font-bold text-green-700 mt-1">
            {learnerCount !== null ? learnerCount : "—"}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="text-sm text-gray-500">Athletics Days</div>
          <div className="text-3xl font-bold text-green-700 mt-1">Tue & Thu</div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="text-sm text-gray-500">House</div>
          <div className="text-3xl font-bold text-green-700 mt-1">{HOUSE}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Learner Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload an Excel file (.xls or .xlsx) with learner data. The file should have columns:
          Number, Accession Number, Surname, First Name, Gender, Birth Date, House.
        </p>
        <label className="block">
          <span className="sr-only">Choose file</span>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-700 file:text-white hover:file:bg-green-800 disabled:opacity-50 cursor-pointer"
          />
        </label>
        {uploading && <p className="mt-3 text-sm text-gray-500">Uploading...</p>}
        {message && (
          <p className={`mt-3 text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/attendance")}
          className="bg-white rounded-xl border shadow-sm p-6 text-left hover:border-green-500 transition-colors"
        >
          <div className="text-lg font-bold text-gray-900">📋 Attendance</div>
          <div className="text-sm text-gray-500 mt-1">Mark by age group</div>
        </button>
        <button
          onClick={() => router.push("/races")}
          className="bg-white rounded-xl border shadow-sm p-6 text-left hover:border-green-500 transition-colors"
        >
          <div className="text-lg font-bold text-gray-900">🏅 Race Entries</div>
          <div className="text-sm text-gray-500 mt-1">Select learners for races</div>
        </button>
        <button
          onClick={() => router.push("/reports")}
          className="bg-white rounded-xl border shadow-sm p-6 text-left hover:border-green-500 transition-colors"
        >
          <div className="text-lg font-bold text-gray-900">🖨️ Reports</div>
          <div className="text-sm text-gray-500 mt-1">Print & export</div>
        </button>
      </div>
    </div>
  );
}
