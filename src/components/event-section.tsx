'use client';
import { useState, useEffect } from "react";
import { getDocuments, deleteEvent, updateEvent } from "@/lib/firebase/firestore";
import type { Event, DocuTrackDocument } from "@/lib/types";
import DocumentCard from "./document-card";
import { AddDocumentDialog } from "./add-document-dialog";
import { Button } from "./ui/button";
import { Calendar, ChevronsUpDown, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

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

  const completedDocuments = documents.filter(doc => doc.isCompleted).length;
  const totalDocuments = documents.length;
  const progress = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;

  useEffect(() => {
    if (loading) return;

    const isNowCompleted = totalDocuments > 0 && completedDocuments === totalDocuments;
    if (isNowCompleted !== event.isCompleted) {
      updateEvent(event.id, { isCompleted: isNowCompleted });
    }
  }, [completedDocuments, totalDocuments, event.id, event.isCompleted, loading]);


  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(event.id);
      toast({ title: "Success", description: "Event deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Could not delete event.", variant: "destructive" });
    }
  };

  const daysUntilDue = event.dueDate ? differenceInDays(event.dueDate.toDate(), new Date()) : Infinity;
  const isUrgent = !event.isCompleted && event.dueDate && daysUntilDue >= 0 && daysUntilDue <= 5;


  return (
    <Collapsible className="w-full">
        <Card className={cn(
        "transition-all", 
        event.isCompleted && 'border-dashed',
        isUrgent && 'bg-destructive/10 border-destructive/20'
        )}>
        <div className="flex items-start justify-between p-6">
            <div className="flex-1 pr-4">
                <h2 className={cn("text-2xl font-bold font-headline", event.isCompleted && "text-muted-foreground")}>{event.title}</h2>
                {event.dueDate && (
                  <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Due: {format(event.dueDate.toDate(), "MMM d, yyyy")}
                  </p>
                )}
                <div className="text-sm text-muted-foreground mt-2">
                    {loading ? (
                        <Skeleton className="h-4 w-48" />
                    ) : (
                        <p>{completedDocuments} of {totalDocuments} documents completed.</p>
                    )}
                </div>
                <Progress value={loading ? 0 : Math.round(progress)} className="w-full mt-4" />
            </div>
            <div className="flex items-center gap-2 pl-4">
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
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle Documents</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
        </div>

        <CollapsibleContent>
            <div className="border-t">
                <div className="px-6 py-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          <Skeleton className="h-56 w-full" />
                          <Skeleton className="h-56 w-full" />
                          <Skeleton className="h-56 w-full" />
                        </div>
                    ) : documents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                          <DocumentCard key={doc.id} eventId={event.id} document={doc} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No documents in this event. Add one to get started!</p>
                      </div>
                    )}
                </div>
            </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
