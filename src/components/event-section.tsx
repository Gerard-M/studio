'use client';
import { useState, useEffect } from "react";
import { getDocuments, deleteEvent } from "@/lib/firebase/firestore";
import type { Event, DocuTrackDocument } from "@/lib/types";
import DocumentCard from "./document-card";
import { AddDocumentDialog } from "./add-document-dialog";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

export default function EventSection({ event }: { event: Event }) {
  const [documents, setDocuments] = useState<DocuTrackDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getDocuments(event.id, (docs) => {
      setDocuments(docs as DocuTrackDocument[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [event.id]);

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(event.id);
      toast({ title: "Success", description: "Event deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Could not delete event.", variant: "destructive" });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-primary/20">
        <h2 className="text-2xl font-bold font-headline">{event.title}</h2>
        <div className="flex items-center gap-2">
            <AddDocumentDialog eventId={event.id} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the event &quot;{event.title}&quot; and all its documents. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
         </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} eventId={event.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No documents in this event. Add one to get started!</p>
        </div>
      )}
    </section>
  );
}
