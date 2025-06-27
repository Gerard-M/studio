'use client'
import { useState, useEffect, type FormEvent } from "react";
import { addEvent, getEvents } from "@/lib/firebase/firestore";
import type { Event, UserProfile } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import EventSection from "./event-section";

export default function Dashboard({ user }: { user: UserProfile }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = getEvents(user.uid, (eventsData) => {
      setEvents(eventsData as Event[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (newEventTitle.trim() === '') {
      toast({ title: "Error", description: "Event title cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      await addEvent(user.uid, newEventTitle.trim());
      toast({ title: "Success", description: "Event created successfully." });
      setNewEventTitle('');
    } catch (error) {
      toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Your Events</h1>
        <form onSubmit={handleAddEvent} className="flex w-full sm:w-auto items-center space-x-2">
          <Input
            type="text"
            placeholder="New event name..."
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button type="submit" className="font-semibold">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </form>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length > 0 ? (
        <div className="space-y-10">
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
