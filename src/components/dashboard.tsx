'use client'
import { useState, useEffect } from "react";
import { getEvents } from "@/lib/firebase/firestore";
import type { Event, UserProfile } from "@/lib/types";
import EventSection from "./event-section";
import { Skeleton } from "./ui/skeleton";
import { AddEventDialog } from "./add-event-dialog";

export default function Dashboard({ user }: { user: UserProfile }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = getEvents(user.uid, (eventsData) => {
      setEvents(eventsData as Event[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Your Events</h1>
        <AddEventDialog userId={user.uid} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventSection key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Events Found</h2>
          <p className="text-muted-foreground mt-2">Create your first event to get started.</p>
        </div>
      )}
    </div>
  );
}
