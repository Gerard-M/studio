import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
}

export type ReminderPreference = 'none' | 'daily' | 'every_2_days' | 'three_days_before' | 'one_week_before';

export const reminderPreferences: { value: ReminderPreference, label: string }[] = [
    { value: 'none', label: 'No reminders' },
    { value: 'daily', label: 'Daily' },
    { value: 'every_2_days', label: 'Every 2 days' },
    { value: 'three_days_before', label: '3 days before due date' },
    { value: 'one_week_before', label: '1 week before due date' },
];


export type EventData = {
  title: string;
  createdAt: Timestamp;
  dueDate: Timestamp;
  userId: string;
  isCompleted: boolean;
  reminderPreference: ReminderPreference;
};

export type Event = EventData & {
  id: string;
};

export type DocumentStatus = 'In Progress' | 'For Printing' | 'Submitted' | 'Pending' | 'Completed';

export const documentStatuses: DocumentStatus[] = ['In Progress', 'For Printing', 'Submitted', 'Pending', 'Completed'];

export type DocumentData = {
  title: string;
  googleDocsLink: string;
  dueDate: Timestamp;
  status: DocumentStatus;
  isCompleted: boolean;
  createdAt: Timestamp;
};

export type DocuTrackDocument = DocumentData & {
  id: string;
};
