export const TRACK_EVENTS = [
  { name: "80m", ageGroups: ["U10A", "U10B", "U11A", "U11B"] },
  { name: "100m", ageGroups: ["U10A", "U10B", "U11A", "U11B", "U13A", "U13B", "U14A", "U14B"] },
  { name: "150m", ageGroups: ["U12"] },
  { name: "200m", ageGroups: ["U13", "U14"] },
  { name: "800m", ageGroups: ["U13", "U14"] },
  { name: "1200m", ageGroups: ["U10", "U11", "U12"] },
  { name: "1500m", ageGroups: ["U13", "U14"] },
  { name: "Relay", ageGroups: ["U10A", "U10B", "U11A", "U11B", "U13A", "U13B", "U14A", "U14B"] },
];

export const FIELD_EVENTS = [
  { name: "High Jump", ageGroups: ["U10", "U11", "U12", "U13", "U14"] },
  { name: "Long Jump", ageGroups: ["U10", "U11", "U12", "U13", "U14"] },
  { name: "Shot Put", ageGroups: ["U10", "U11", "U12", "U13", "U14"] },
];

export const ALL_EVENTS = [...TRACK_EVENTS, ...FIELD_EVENTS];

export const GENDERS = ["Boys", "Girls"];

export function computeAgeGroup(dob: string, referenceDate?: Date): string {
  const birthDate = new Date(dob);
  const ref = referenceDate || new Date();
  let age = ref.getFullYear() - birthDate.getFullYear();
  const m = ref.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age <= 9) return "U9";
  if (age >= 14) return "U14";
  return `U${age}`;
}

export const ACTIVE_AGE_GROUPS = ["U10", "U11", "U12", "U13", "U14"];

export function isAthleticsDay(date: Date): boolean {
  const day = date.getDay();
  return day === 2 || day === 4;
}
