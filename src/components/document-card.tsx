'use client'
import { useState } from "react";
import { format } from "date-fns";
import type { DocuTrackDocument, DocumentStatus } from "@/lib/types";
import { documentStatuses } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentStatus, toggleDocumentCompletion, deleteDocument } from "@/lib/firebase/firestore";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Calendar, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const statusColors: Record<DocumentStatus, string> = {
  'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'For Printing': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Submitted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Pending': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Completed': 'bg-green-500/20 text-green-300 border-green-500/30',
};

export default function DocumentCard({ eventId, document }: { eventId: string, document: DocuTrackDocument }) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: DocumentStatus) => {
    setIsUpdating(true);
    try {
      await updateDocumentStatus(eventId, document.id, status);
    } catch (error) {
      toast({ title: "Error updating status", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompletionToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await toggleDocumentCompletion(eventId, document.id, checked);
    } catch (error) {
      toast({ title: "Error updating completion", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
        await deleteDocument(eventId, document.id);
        toast({ title: "Document deleted" });
    } catch (error) {
        toast({ title: "Error deleting document", variant: "destructive" });
    }
  };

  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300 ease-in-out",
      document.isCompleted && "bg-card/50 border-dashed",
      isUpdating && "animate-pulse"
    )}>
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <Checkbox
          className="mt-1"
          checked={document.isCompleted}
          onCheckedChange={handleCompletionToggle}
          aria-label="Mark as complete"
        />
        <div className="flex-1">
          <CardTitle className={cn("text-lg", document.isCompleted && "line-through text-muted-foreground")}>
            {document.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 pt-1 text-xs">
            <Calendar className="h-3 w-3" />
            Due: {format(document.dueDate.toDate(), "MMM d, yyyy")}
          </CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete Document?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{document.title}".</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>

      </CardHeader>
      <CardContent className="flex-1">
        <Select value={document.status} onValueChange={handleStatusChange} disabled={isUpdating}>
          <SelectTrigger className={cn("capitalize rounded-full font-semibold", statusColors[document.status])}>
            <SelectValue placeholder="Set status" />
          </SelectTrigger>
          <SelectContent>
            {documentStatuses.map(status => (
              <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
            <a href={document.googleDocsLink} target="_blank" rel="noopener noreferrer">
                Open Google Doc <ExternalLink className="ml-2 h-3 w-3" />
            </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
