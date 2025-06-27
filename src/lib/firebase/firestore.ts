import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { DocumentData, DocumentStatus, EventData, ReminderPreference } from "../types";

// Events

export const addEvent = (userId: string, title: string, dueDate: Date, reminderPreference: ReminderPreference) => {
  const eventData: Omit<EventData, "createdAt" | "id"> = {
    title,
    userId,
    dueDate: Timestamp.fromDate(dueDate),
    isCompleted: false,
    reminderPreference,
  };
  return addDoc(collection(db, "events"), {
    ...eventData,
    createdAt: serverTimestamp(),
  });
};

export const getEvents = (userId:string, callback: (events: any[]) => void) => {
  const q = query(collection(db, "events"), where("userId", "==", userId));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    events.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
    });
    callback(events);
  });
  return unsubscribe;
};

export const updateEvent = (eventId: string, data: Partial<Omit<EventData, 'id' | 'createdAt'>>) => {
    const eventRef = doc(db, "events", eventId);
    return updateDoc(eventRef, data);
};

export const deleteEvent = async (eventId: string) => {
  const batch = writeBatch(db);
  
  // Delete all documents in the event
  const documentsQuery = query(collection(db, "events", eventId, "documents"));
  const documentsSnapshot = await getDocs(documentsQuery);
  documentsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Delete the event itself
  const eventRef = doc(db, "events", eventId);
  batch.delete(eventRef);

  return batch.commit();
};

// Documents

export const getDocuments = (eventId: string, callback: (docs: any[]) => void) => {
  const q = query(collection(db, "events", eventId, "documents"));
  return onSnapshot(q, (snapshot) => {
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    documents.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
          return a.createdAt.toMillis() - b.createdAt.toMillis();
      }
      return 0;
    });
    callback(documents);
  });
};

export const addDocument = (eventId: string, data: Omit<DocumentData, "createdAt" | "isCompleted" | "status">) => {
    const docData: Omit<DocumentData, "createdAt"> = {
        ...data,
        isCompleted: false,
        status: 'In Progress',
    }
    return addDoc(collection(db, 'events', eventId, 'documents'), {
        ...docData,
        createdAt: serverTimestamp(),
    });
};

export const updateDocument = (eventId: string, docId: string, data: Partial<DocumentData>) => {
    const docRef = doc(db, 'events', eventId, 'documents', docId);
    return updateDoc(docRef, data);
};


export const updateDocumentStatus = (eventId: string, docId: string, status: DocumentStatus) => {
  const docRef = doc(db, "events", eventId, "documents", docId);
  const isCompleted = status === 'Completed';
  return updateDoc(docRef, { status, isCompleted });
};

export const toggleDocumentCompletion = (eventId: string, docId: string, isCompleted: boolean) => {
  const docRef = doc(db, "events", eventId, "documents", docId);
  const status = isCompleted ? 'Completed' : 'In Progress';
  return updateDoc(docRef, { isCompleted, status });
};


export const deleteDocument = (eventId: string, docId: string) => {
    const docRef = doc(db, 'events', eventId, 'documents', docId);
    return deleteDoc(docRef);
}
