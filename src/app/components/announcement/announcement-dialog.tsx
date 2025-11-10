'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useAddAnnouncementMutation, useEditAnnouncementMutation } from '@/redux/announcement/announcementApi';
import type { Announcement } from './announcement-list-area';

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message cannot exceed 500 characters'),
  link: z.string().optional().or(z.literal('')),
  linkText: z.string().max(50, 'Link text cannot exceed 50 characters').optional(),
  type: z.enum(['info', 'warning', 'success', 'promotion']),
  backgroundColor: z.string().min(4, 'Invalid color'),
  textColor: z.string().min(4, 'Invalid color'),
  priority: z.number().min(0, 'Priority cannot be negative').max(100, 'Priority cannot exceed 100'),
  displayOrder: z.number().min(0, 'Display order cannot be negative'),
  isActive: z.boolean(),
  showCloseButton: z.boolean(),
  startDate: z.string(),
  endDate: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

const typeOptions = [
  { value: 'info', label: 'Info', bgColor: '#1e40af', textColor: '#ffffff' },
  { value: 'warning', label: 'Warning', bgColor: '#f59e0b', textColor: '#000000' },
  { value: 'success', label: 'Success', bgColor: '#10b981', textColor: '#ffffff' },
  { value: 'promotion', label: 'Promotion', bgColor: '#8b5cf6', textColor: '#ffffff' },
];

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementDialogProps) {
  const [addAnnouncement, { isLoading: isAdding }] = useAddAnnouncementMutation();
  const [editAnnouncement, { isLoading: isEditing }] = useEditAnnouncementMutation();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      message: '',
      link: '',
      linkText: 'Learn More',
      type: 'info',
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      priority: 0,
      displayOrder: 0,
      isActive: true,
      showCloseButton: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    },
  });

  // Reset form when announcement changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (announcement) {
        // Editing existing announcement
        form.reset({
          title: announcement.title,
          message: announcement.message,
          link: announcement.link || '',
          linkText: announcement.linkText || 'Learn More',
          type: announcement.type,
          backgroundColor: announcement.backgroundColor,
          textColor: announcement.textColor,
          priority: announcement.priority,
          displayOrder: announcement.displayOrder,
          isActive: announcement.isActive,
          showCloseButton: announcement.showCloseButton,
          startDate: new Date(announcement.startDate).toISOString().split('T')[0],
          endDate: announcement.endDate
            ? new Date(announcement.endDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        // Adding new announcement
        form.reset({
          title: '',
          message: '',
          link: '',
          linkText: 'Learn More',
          type: 'info',
          backgroundColor: '#1e40af',
          textColor: '#ffffff',
          priority: 0,
          displayOrder: 0,
          isActive: true,
          showCloseButton: true,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
        });
      }
    }
  }, [open, announcement, form]);

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      const payload = {
        ...data,
        endDate: data.endDate || undefined,
        link: data.link || undefined,
      };

      if (announcement) {
        // Edit
        const res = await editAnnouncement({ id: announcement._id, data: payload });
        if ('data' in res && res.data && 'success' in res.data) {
          notifySuccess('Announcement updated successfully');
          onOpenChange(false);
        } else {
          notifyError('Failed to update announcement');
        }
      } else {
        // Add
        const res = await addAnnouncement(payload);
        if ('data' in res && res.data && 'success' in res.data) {
          notifySuccess('Announcement created successfully');
          onOpenChange(false);
        } else {
          notifyError('Failed to create announcement');
        }
      }
    } catch (error) {
      notifyError('An error occurred');
    }
  };

  const handleTypeChange = (value: string) => {
    const selectedType = typeOptions.find(opt => opt.value === value);
    if (selectedType) {
      form.setValue('backgroundColor', selectedType.bgColor);
      form.setValue('textColor', selectedType.textColor);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Add Announcement'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Flash Sale Today!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Get 50% off on all products. Limited time offer!"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTypeChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Higher priority shows first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Background Color */}
              <FormField
                control={form.control}
                name="backgroundColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" className="w-16 h-10" {...field} />
                        <Input type="text" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Text Color */}
              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" className="w-16 h-10" {...field} />
                        <Input type="text" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="/shop or https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>Can be relative (/shop) or absolute URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link Text */}
              <FormField
                control={form.control}
                name="linkText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Learn More" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Leave empty for no end date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display Order */}
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Lower number shows first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Show this announcement on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Show Close Button */}
              <FormField
                control={form.control}
                name="showCloseButton"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Close Button</FormLabel>
                      <FormDescription>
                        Allow users to dismiss this announcement
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div
                className="p-4 rounded-md"
                style={{
                  backgroundColor: form.watch('backgroundColor'),
                  color: form.watch('textColor'),
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{form.watch('title') || 'Title'}</p>
                    <p className="text-sm">{form.watch('message') || 'Message'}</p>
                    {form.watch('link') && (
                      <span className="text-xs underline cursor-pointer">
                        {form.watch('linkText') || 'Learn More'}
                      </span>
                    )}
                  </div>
                  {form.watch('showCloseButton') && (
                    <button className="text-xl">&times;</button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding || isEditing}>
                {isAdding || isEditing ? 'Saving...' : announcement ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

