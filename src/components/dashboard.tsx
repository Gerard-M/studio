'use client'
import { useState, useEffect } from "react";
import { getEvents } from "@/lib/firebase/firestore";
import type { Event, UserProfile } from "@/lib/types";
import EventSection from "./event-section";
import { Skeleton } from "./ui/skeleton";
import { AddEventDialog } from "./add-event-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { Archive, ChevronsUpDown } from "lucide-react";

export default function Dashboard({ user }: { user: UserProfile }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = getEvents(user.uid, (eventsData) => {
      setEvents(eventsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const activeEvents = events
    .filter(event => !event.isCompleted)
    .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.toMillis() - b.dueDate.toMillis();
    });

  const completedEvents = events
    .filter(event => event.isCompleted)
    .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return b.dueDate.toMillis() - a.dueDate.toMillis();
        }
        return 0;
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Your Events</h1>
        <AddEventDialog user={user} />
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Events */}
          <div className="space-y-6">
             {activeEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeEvents.map((event) => (
                    <EventSection key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Active Events</h2>
                    <p className="text-muted-foreground mt-2">Create a new event to get started!</p>
                </div>
            )}
          </div>
          
          {/* Completed Events */}
          {completedEvents.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-center text-center p-4 rounded-lg bg-card border hover:bg-muted cursor-pointer transition-colors">
                  <Archive className="h-5 w-5 mr-3 text-muted-foreground"/>
                  <h2 className="text-lg font-semibold">View Completed Events ({completedEvents.length})</h2>
                  <ChevronsUpDown className="h-4 w-4 ml-2 text-muted-foreground"/>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedEvents.map((event) => (
                    <EventSection key={event.id} event={event} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}
