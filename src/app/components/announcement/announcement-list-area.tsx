'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Megaphone,
  AlertCircle,
} from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils/toast';
import { AnnouncementTable } from './announcement-table';
import { AnnouncementDialog } from './announcement-dialog';
import { useGetAllAnnouncementsQuery, useDeleteAnnouncementMutation, useToggleAnnouncementStatusMutation } from '@/redux/announcement/announcementApi';
import Swal from 'sweetalert2';

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  backgroundColor: string;
  textColor: string;
  priority: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  displayOrder: number;
  showCloseButton: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AnnouncementListArea() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcementsData, isLoading, isError } = useGetAllAnnouncementsQuery();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [toggleStatus] = useToggleAnnouncementStatusMutation();

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete announcement "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const res = await deleteAnnouncement(id);
          if ('data' in res && res.data && 'success' in res.data) {
            notifySuccess('Announcement deleted successfully');
          } else {
            notifyError('Failed to delete announcement');
          }
        } catch (error) {
          notifyError('Failed to delete announcement');
        }
      }
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleStatus(id);
      if ('data' in res && res.data && 'success' in res.data) {
        notifySuccess(`Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        notifyError('Failed to toggle announcement status');
      }
    } catch (error) {
      notifyError('Failed to toggle announcement status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !announcementsData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading announcements</p>
      </div>
    );
  }

  const announcements = announcementsData.data || [];
  const activeCount = announcements.filter((a: Announcement) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcement Bars</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage website announcement bars that appear at the top
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{announcements.length}</p>
            </div>
            <Megaphone className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Live
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{announcements.length - activeCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Announcements Table */}
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No announcements yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first announcement bar
            </p>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AnnouncementTable
          announcements={announcements}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Announcement Dialog */}
      <AnnouncementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        announcement={editingAnnouncement}
      />
    </div>
  );
}

