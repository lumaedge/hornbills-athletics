"use client";

import { useState, useEffect, useCallback } from "react";
import Calendar from "@/components/Calendar";
import { Learner, RaceEntry } from "@/lib/types";
import { ALL_EVENTS, GENDERS } from "@/lib/constants";

export default function RacesPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [entries, setEntries] = useState<RaceEntry[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"select" | "entries">("select");

  useEffect(() => {
    fetch("/api/learners")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLearners(data);
      })
      .catch(() => {});
  }, []);

  const loadEntries = useCallback(async () => {
    if (!selectedDate) return;
    try {
      const params = new URLSearchParams({ date: selectedDate });
      if (selectedEvent) params.set("event", selectedEvent);
      if (selectedAgeGroup) params.set("ageGroup", selectedAgeGroup);
      if (selectedGender) params.set("gender", selectedGender);
      const res = await fetch(`/api/races?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch {
      setEntries([]);
    }
  }, [selectedDate, selectedEvent, selectedAgeGroup, selectedGender]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const currentEvent = ALL_EVENTS.find((e) => e.name === selectedEvent);
  const availableAgeGroups = currentEvent?.ageGroups || [];

  const eligibleLearners = learners.filter((l) => {
    if (!selectedEvent || !selectedAgeGroup || !selectedGender) return false;

    const baseAgeGroup = selectedAgeGroup.replace(/[AB]$/, "");
    if (l.age_group !== baseAgeGroup) return false;

    const learnerGenderCode = l.gender === "M" ? "Boys" : "Girls";
    if (learnerGenderCode !== selectedGender) return false;

    if (search) {
      const q = search.toLowerCase();
      if (!l.surname.toLowerCase().includes(q) && !l.first_name.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  const enteredIds = new Set(entries.map((e) => e.learner_id));

  async function addLearner(learnerId: number) {
    if (!selectedDate || !selectedEvent || !selectedAgeGroup || !selectedGender) return;

    try {
      const res = await fetch("/api/races", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learner_id: learnerId,
          event: selectedEvent,
          age_group: selectedAgeGroup,
          gender: selectedGender,
          date: selectedDate,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("");
        loadEntries();
      }
    } catch {
      setMessage("Failed to add learner");
    }
  }

  async function removeEntry(entryId: number) {
    try {
      await fetch(`/api/races?id=${entryId}`, { method: "DELETE" });
      loadEntries();
    } catch {
      setMessage("Failed to remove entry");
    }
  }

  const groupedEntries = entries.reduce(
    (acc, entry) => {
      const key = `${entry.event} - ${entry.age_group} ${entry.gender}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(entry);
      return acc;
    },
    {} as Record<string, RaceEntry[]>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Race Team Selection</h1>
        <p className="text-gray-600 mt-1">Assign learners to events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />

          {selectedDate && (
            <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    setSelectedAgeGroup("");
                    setMessage("");
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select event</option>
                  <optgroup label="Track">
                    {ALL_EVENTS.filter((e) => !["High Jump", "Long Jump", "Shot Put"].includes(e.name)).map((e) => (
                      <option key={e.name} value={e.name}>{e.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Field">
                    {ALL_EVENTS.filter((e) => ["High Jump", "Long Jump", "Shot Put"].includes(e.name)).map((e) => (
                      <option key={e.name} value={e.name}>{e.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selectedEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <select
                    value={selectedAgeGroup}
                    onChange={(e) => setSelectedAgeGroup(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select age group</option>
                    {availableAgeGroups.map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedAgeGroup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedDate && selectedEvent && selectedAgeGroup && selectedGender ? (
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <h2 className="font-bold text-lg">
                    {selectedEvent} — {selectedAgeGroup} {selectedGender}
                  </h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab("select")}
                      className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "select" ? "bg-white shadow text-gray-900" : "text-gray-600"
                      }`}
                    >
                      Add ({eligibleLearners.filter((l) => !enteredIds.has(l.id)).length})
                    </button>
                    <button
                      onClick={() => setActiveTab("entries")}
                      className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "entries" ? "bg-white shadow text-gray-900" : "text-gray-600"
                      }`}
                    >
                      Entered ({entries.length})
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {message && (
                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm border-b">{message}</div>
              )}

              {activeTab === "select" ? (
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {eligibleLearners.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No eligible learners found</div>
                  ) : (
                    eligibleLearners.map((learner) => {
                      const isEntered = enteredIds.has(learner.id);
                      return (
                        <div key={learner.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                          <div>
                            <div className="font-medium text-gray-900">{learner.surname}, {learner.first_name}</div>
                            <div className="text-xs text-gray-500">#{learner.learner_number}</div>
                          </div>
                          <button
                            onClick={() => addLearner(learner.id)}
                            disabled={isEntered}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              isEntered
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {isEntered ? "Added" : "+ Add"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {entries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No entries yet</div>
                  ) : (
                    entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <div className="font-medium text-gray-900">
                          {entry.surname}, {entry.first_name}
                        </div>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-500">
              {selectedDate
                ? "Select an event, age group, and gender to begin"
                : "Select a date from the calendar to begin"}
            </div>
          )}

          {selectedDate && Object.keys(groupedEntries).length > 0 && (
            <div className="mt-4 bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3">All Entries for This Date</h3>
              <div className="space-y-3">
                {Object.entries(groupedEntries).map(([key, items]) => (
                  <div key={key}>
                    <div className="text-sm font-medium text-gray-900">{key} ({items.length})</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {items.map((i) => `${i.surname}, ${i.first_name}`).join(" | ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
