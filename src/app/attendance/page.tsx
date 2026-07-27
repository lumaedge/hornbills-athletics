"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "@/components/Calendar";
import { Learner } from "@/lib/types";

const AGE_GROUPS = ["U10", "U11", "U12", "U13", "U14"];

interface AttendanceRow {
  learner_id: number;
  surname: string;
  first_name: string;
  learner_number: string;
  gender: string;
  age_group: string;
  status: "present" | "absent";
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [learners, setLearners] = useState<Learner[]>([]);
  const [attendance, setAttendance] = useState<Map<number, "present" | "absent">>(new Map());
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/learners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLearners(data);
      })
      .catch(() => {});
  }, []);

  const loadAttendance = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = new Map<number, "present" | "absent">();
        data.forEach((r: AttendanceRow) => {
          map.set(r.learner_id, r.status);
        });
        setAttendance(map);
      }
    } catch {
      setAttendance(new Map());
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendance(selectedDate);
    }
  }, [selectedDate, loadAttendance]);

  function toggleStatus(learnerId: number) {
    setAttendance((prev) => {
      const next = new Map(prev);
      const current = next.get(learnerId);
      if (current === "present") {
        next.set(learnerId, "absent");
      } else {
        next.set(learnerId, "present");
      }
      return next;
    });
  }

  function markAll(status: "present" | "absent") {
    const next = new Map(attendance);
    filteredLearners.forEach((l) => next.set(l.id, status));
    setAttendance(next);
  }

  async function saveAttendance() {
    if (!selectedDate) return;
    setSaving(true);
    setMessage("");

    const ageGroupLearners = learners.filter(
      (l) => selectedAgeGroup && l.age_group === selectedAgeGroup
    );
    const records = ageGroupLearners.map((l) => ({
      learner_id: l.id,
      status: attendance.get(l.id) || ("absent" as "present" | "absent"),
    }));

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, records }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Attendance saved!");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  const filteredLearners = learners.filter((l) => {
    if (!selectedAgeGroup) return false;
    if (l.age_group !== selectedAgeGroup) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.surname.toLowerCase().includes(q) && !l.first_name.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterGender && l.gender !== filterGender) return false;
    return true;
  });

  const presentCount = filteredLearners.filter((l) => attendance.get(l.id) === "present").length;
  const absentCount = filteredLearners.length - presentCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Mark attendance by age group for practice days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />

          {selectedDate && (
            <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                <div className="grid grid-cols-5 gap-1">
                  {AGE_GROUPS.map((ag) => (
                    <button
                      key={ag}
                      onClick={() => setSelectedAgeGroup(ag)}
                      className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                        selectedAgeGroup === ag
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {ag}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAgeGroup && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                      <div className="text-xs text-green-600">Present</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                      <div className="text-xs text-red-600">Absent</div>
                    </div>
                  </div>

                  <button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : `Save ${selectedAgeGroup} Attendance`}
                  </button>

                  {message && (
                    <p className={`text-sm text-center ${message.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
                      {message}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedDate && selectedAgeGroup ? (
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg">{selectedAgeGroup} — {filteredLearners.length} learners</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="M">Boys</option>
                    <option value="F">Girls</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markAll("present")} className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                    All Present
                  </button>
                  <button onClick={() => markAll("absent")} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                    All Absent
                  </button>
                </div>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {filteredLearners.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No learners found</div>
                ) : (
                  filteredLearners.map((learner) => {
                    const status = attendance.get(learner.id) || "absent";
                    const isPresent = status === "present";
                    return (
                      <div
                        key={learner.id}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          isPresent ? "bg-green-50" : ""
                        }`}
                        onClick={() => toggleStatus(learner.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            isPresent ? "bg-green-600 text-white" : "bg-red-100 text-red-600"
                          }`}>
                            {isPresent ? "✓" : "✗"}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {learner.surname}, {learner.first_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{learner.learner_number} · {learner.gender === "M" ? "Boy" : "Girl"}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${isPresent ? "text-green-700" : "text-red-600"}`}>
                          {isPresent ? "Present" : "Absent"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-500">
              {!selectedDate
                ? "Select a practice day from the calendar"
                : "Select an age group to begin"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
