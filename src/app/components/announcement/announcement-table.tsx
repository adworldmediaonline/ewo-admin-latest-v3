'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Announcement } from './announcement-list-area';

interface AnnouncementTableProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string, title: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const typeColors = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  promotion: 'bg-purple-100 text-purple-800 border-purple-200',
};

const typeLabels = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  promotion: 'Promotion',
};

export function AnnouncementTable({
  announcements,
  onEdit,
  onDelete,
  onToggleStatus,
}: AnnouncementTableProps) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32">Date Range</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map(announcement => (
              <TableRow key={announcement._id}>
                <TableCell className="font-medium">
                  {announcement.displayOrder}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{announcement.title}</p>
                    {announcement.link && (
                      <a
                        href={announcement.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {announcement.linkText || 'Link'}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {announcement.message}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeColors[announcement.type]}>
                    {typeLabels[announcement.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={announcement.isActive ? 'default' : 'secondary'}
                    className={
                      announcement.isActive
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400'
                    }
                  >
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(announcement.startDate), 'MMM d, yyyy')}
                    </div>
                    {announcement.endDate && (
                      <div className="text-muted-foreground">
                        to {format(new Date(announcement.endDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleStatus(announcement._id, announcement.isActive)}
                      title={announcement.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(announcement)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(announcement._id, announcement.title)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

