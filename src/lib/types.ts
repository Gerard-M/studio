import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
}

export type EventData = {
  title: string;
  createdAt: Timestamp;
  userId: string;
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
