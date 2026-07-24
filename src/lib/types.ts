export interface Learner {
  id: number;
  learner_number: string;
  accession_number: string;
  surname: string;
  first_name: string;
  gender: string;
  birth_date: string;
  house: string;
  age_group: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  learner_id: number;
  date: string;
  status: "present" | "absent";
  created_at: string;
  surname: string;
  first_name: string;
  learner_number: string;
  gender: string;
  age_group: string;
  house: string;
}

export interface RaceEntry {
  id: number;
  learner_id: number;
  event: string;
  age_group: string;
  gender: string;
  date: string;
  position: string | null;
  time: string | null;
  created_at: string;
  surname: string;
  first_name: string;
  learner_number: string;
  house: string;
}
