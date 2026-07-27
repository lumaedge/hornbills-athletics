"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "@/components/Calendar";
import { RaceEntry } from "@/lib/types";
import { ALL_EVENTS, computeAge, getYearOfBirth } from "@/lib/constants";

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>[]>([]);
  const [entries, setEntries] = useState<RaceEntry[]>([]);
  const [activeReport, setActiveReport] = useState<"attendance" | "races">("attendance");

  const loadData = useCallback(async () => {
    if (!selectedDate) return;
    try {
      const [attRes, raceRes] = await Promise.all([
        fetch(`/api/attendance?date=${selectedDate}`),
        fetch(`/api/races?date=${selectedDate}`),
      ]);
      const attData = await attRes.json();
      const raceData = await raceRes.json();
      if (Array.isArray(attData)) setAttendance(attData);
      if (Array.isArray(raceData)) setEntries(raceData);
    } catch {
      setAttendance([]);
      setEntries([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function printSection() {
    window.print();
  }

  const groupedEntries = entries.reduce(
    (acc, entry) => {
      const key = `${entry.event}|${entry.age_group}|${entry.gender}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    },
    {} as Record<string, RaceEntry[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Print attendance sheets and race entry forms</p>
        </div>
        <button
          onClick={printSection}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800 no-print"
        >
          🖨️ Print
        </button>
      </div>

      <div className="no-print">
        <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
      </div>

      {selectedDate && (
        <div className="no-print flex gap-2 mt-4">
          <button
            onClick={() => setActiveReport("attendance")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeReport === "attendance"
                ? "bg-green-700 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
          >
            Attendance Sheet
          </button>
          <button
            onClick={() => setActiveReport("races")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeReport === "races"
                ? "bg-green-700 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
          >
            Race Entry Forms
          </button>
        </div>
      )}

      {selectedDate && activeReport === "attendance" && (
        <div className="print-area bg-white rounded-xl border shadow-sm p-6" id="print-attendance">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Hornbills Athletics</h2>
            <h3 className="text-lg text-gray-600">Attendance Register</h3>
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-ZA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left w-12">#</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Surname</th>
                <th className="border p-2 text-center">Gender</th>
                <th className="border p-2 text-center">Year</th>
                <th className="border p-2 text-center">Age</th>
                <th className="border p-2 text-center">Age Group</th>
                <th className="border p-2 text-center w-20">Present</th>
                <th className="border p-2 text-center w-20">Absent</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border p-2">{idx + 1}</td>
                  <td className="border p-2">{record.first_name}</td>
                  <td className="border p-2">{record.surname}</td>
                  <td className="border p-2 text-center">{record.gender === "M" ? "Boy" : "Girl"}</td>
                  <td className="border p-2 text-center">{getYearOfBirth(record.birth_date)}</td>
                  <td className="border p-2 text-center">{computeAge(record.birth_date)}</td>
                  <td className="border p-2 text-center">{record.age_group}</td>
                  <td className="border p-2 text-center">{record.status === "present" ? "✓" : ""}</td>
                  <td className="border p-2 text-center">{record.status === "absent" ? "✗" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && (
            <p className="text-center text-gray-500 py-8">No attendance records for this date</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            Total: {attendance.length} | Present: {attendance.filter((r) => r.status === "present").length} | Absent: {attendance.filter((r) => r.status === "absent").length}
          </div>
        </div>
      )}

      {selectedDate && activeReport === "races" && (
        <div className="space-y-6" id="print-races">
          {Object.keys(groupedEntries).length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-500">
              No race entries for this date
            </div>
          ) : (
            Object.entries(groupedEntries).map(([key, items]) => {
              const [event, ageGroup, gender] = key.split("|");
              return (
                <div key={key} className="print-area bg-white rounded-xl border shadow-sm p-6 print:break-inside-avoid">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">Hornbills Athletics</h2>
                    <h3 className="text-lg">{event} — {ageGroup} {gender}</h3>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-ZA", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left w-12">#</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Surname</th>
                        <th className="border p-2 text-center">Gender</th>
                        <th className="border p-2 text-center">Position</th>
                        <th className="border p-2 text-center">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((entry, idx) => (
                        <tr key={entry.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border p-2">{idx + 1}</td>
                          <td className="border p-2">{entry.first_name}</td>
                          <td className="border p-2">{entry.surname}</td>
                          <td className="border p-2 text-center">{entry.gender}</td>
                          <td className="border p-2 text-center">{entry.position || ""}</td>
                          <td className="border p-2 text-center">{entry.time || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 text-sm text-gray-500">
                    Total entries: {items.length}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-500">
          Select a date to view reports
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { break-inside: avoid; page-break-inside: avoid; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
