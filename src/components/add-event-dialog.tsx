'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { addEvent } from '@/lib/firebase/firestore';
import { reminderPreferences, type UserProfile } from '@/lib/types';
import { generateEmailReceipt } from '@/ai/flows/generate-email-receipt-flow';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  dueDate: z.date({ required_error: 'A due date is required.' }),
  reminderPreference: z.enum(['none', 'daily', 'every_2_days', 'three_days_before', 'one_week_before']),
});

export function AddEventDialog({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      reminderPreference: 'none',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addEvent(user.uid, values.title, values.dueDate, values.reminderPreference);

      if (user.email) {
        try {
          const emailReceipt = await generateEmailReceipt({
            userName: user.name ?? 'User',
            userEmail: user.email,
            eventTitle: values.title,
            dueDate: format(values.dueDate, 'PPP'),
          });
          console.log('--- Email Receipt Generated ---');
          console.log('To:', user.email);
          console.log('Subject:', emailReceipt.subject);
          console.log('Body:', emailReceipt.body);
          console.log('-----------------------------');
        } catch (aiError) {
          console.error("Failed to generate email receipt:", aiError);
        }
      }

      toast({ title: 'Success!', description: 'Event created. A confirmation receipt has been sent to your email.' });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event.',
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="font-semibold">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details for your new event. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q3 Marketing Campaign" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reminderPreference"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Email Reminders</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reminder frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reminderPreferences.map(pref => (
                            <SelectItem key={pref.value} value={pref.value}>{pref.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Event'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
