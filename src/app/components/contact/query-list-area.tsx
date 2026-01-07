'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useDeleteContactMutation,
  useGetAllContactsQuery,
  useUpdateContactPriorityMutation,
  useUpdateContactStatusMutation,
} from '@/redux/contact/contactApi';
import { IContact } from '@/types/contact-type';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { notifyError, notifySuccess } from '@/utils/toast';

export default function QueryListArea() {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const {
    data: contactsData,
    isError,
    isLoading,
  } = useGetAllContactsQuery(queryParams);
  const [deleteContact] = useDeleteContactMutation();
  const [updateStatus] = useUpdateContactStatusMutation();
  const [updatePriority] = useUpdateContactPriorityMutation();

  const contacts = contactsData?.data || [];

  const handleDelete = useCallback(async (id: string, name: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete query from "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteContact(id).unwrap();
          Swal.fire('Deleted!', 'Query deleted successfully.', 'success');
        } catch (error: any) {
          notifyError(error?.data?.message || 'Failed to delete query');
        }
      }
    });
  }, [deleteContact]);

  const handleStatusChange = useCallback(async (id: string, status: IContact['status']) => {
    try {
      await updateStatus({ id, status }).unwrap();
      notifySuccess('Status updated successfully');
    } catch (error: any) {
      notifyError(error?.data?.message || 'Failed to update status');
    }
  }, [updateStatus]);

  const handlePriorityChange = useCallback(async (
    id: string,
    priority: IContact['priority']
  ) => {
    try {
      await updatePriority({ id, priority }).unwrap();
      notifySuccess('Priority updated successfully');
    } catch (error: any) {
      notifyError(error?.data?.message || 'Failed to update priority');
    }
  }, [updatePriority]);

  const handleViewDetails = useCallback((contact: IContact) => {
    setSelectedContact(contact);
    setShowDetails(true);
  }, []);


  // Status badge component
  const StatusBadge = ({ status }: { status: IContact['status'] }) => {
    const statusConfig = {
      new: { label: 'New', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      'in-progress': { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
    };

    const config = statusConfig[status] || statusConfig.new;

    return (
      <Badge variant="secondary" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: IContact['priority'] }) => {
    const priorityConfig = {
      high: { label: 'High', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      low: { label: 'Low', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    };

    const config = priorityConfig[priority] || priorityConfig.low;

    return (
      <Badge variant="secondary" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  // Define columns with advanced features
  const columns: ColumnDef<IContact>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Contact
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-foreground">
                  {contact.name}
                </div>
                {!contact.isRead && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {contact.email}
              </div>
              {contact.phone && (
                <div className="text-xs text-muted-foreground">
                  {contact.phone}
                </div>
              )}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'subject',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Subject
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const subject = row.getValue('subject') as string;
          return (
            <div className="text-sm text-foreground max-w-xs truncate" title={subject}>
              {subject}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0">
                  <StatusBadge status={contact.status} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange(contact._id, 'new')}>
                  New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(contact._id, 'in-progress')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(contact._id, 'resolved')}>
                  Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(contact._id, 'closed')}>
                  Closed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0">
                  <PriorityBadge priority={contact.priority} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handlePriorityChange(contact._id, 'low')}>
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange(contact._id, 'medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange(contact._id, 'high')}>
                  High
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableHiding: true,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as string;
          return (
            <div className="text-sm text-muted-foreground">
              {dayjs(date).format('MMM D, YYYY')}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const contact = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleViewDetails(contact)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                >
                  <a
                    href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                    className="cursor-pointer"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Reply via Email
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(contact._id, contact.name)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Query
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDelete, handleStatusChange, handlePriorityChange, handleViewDetails]
  );

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(globalFilter.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Apply filters to queryParams
  const statusFilter = columnFilters.find(f => f.id === 'status')?.value as string;
  const priorityFilter = columnFilters.find(f => f.id === 'priority')?.value as string;

  // Update queryParams when filters change
  useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter && priorityFilter !== 'all' ? priorityFilter : undefined,
      search: debouncedSearch || undefined,
      page: 1, // Reset to first page when filters change
    }));
  }, [statusFilter, priorityFilter, debouncedSearch]);

  // Initialize table (client-side sorting only, filtering is server-side)
  const table = useReactTable({
    data: contacts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true, // Server-side pagination
    manualFiltering: true, // Server-side filtering
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading queries</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Queries
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage customer inquiries and support requests
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={
                (columnFilters.find(f => f.id === 'status')?.value as string) ||
                'all'
              }
              onValueChange={value => {
                if (value === 'all') {
                  setColumnFilters(prev => prev.filter(f => f.id !== 'status'));
                } else {
                  setColumnFilters(prev => [
                    ...prev.filter(f => f.id !== 'status'),
                    { id: 'status', value },
                  ]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={
                (columnFilters.find(f => f.id === 'priority')?.value as string) ||
                'all'
              }
              onValueChange={value => {
                if (value === 'all') {
                  setColumnFilters(prev => prev.filter(f => f.id !== 'priority'));
                } else {
                  setColumnFilters(prev => [
                    ...prev.filter(f => f.id !== 'priority'),
                    { id: 'priority', value },
                  ]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={!row.original.isRead ? 'bg-blue-50/50' : ''}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No queries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {contactsData?.pagination ? (
                <>
                  {(contactsData.pagination.currentPage - 1) * (queryParams.limit || 10) + 1} to{' '}
                  {Math.min(
                    contactsData.pagination.currentPage * (queryParams.limit || 10),
                    contactsData.pagination.totalResults
                  )}{' '}
                  of {contactsData.pagination.totalResults} quer{contactsData.pagination.totalResults === 1 ? 'y' : 'ies'}
                </>
              ) : (
                <>
                  {table.getFilteredRowModel().rows.length} quer{table.getFilteredRowModel().rows.length === 1 ? 'y' : 'ies'}
                </>
              )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${queryParams.limit || 10}`}
                  onValueChange={value => {
                    setQueryParams(prev => ({ ...prev, limit: Number(value), page: 1 }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={queryParams.limit || 10} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {contactsData?.pagination && (
                <>
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {contactsData.pagination.currentPage} of{' '}
                    {contactsData.pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setQueryParams(prev => ({ ...prev, page: 1 }))}
                      disabled={!contactsData.pagination.hasPrev}
                    >
                      <span className="sr-only">Go to first page</span>
                      <span>&laquo;</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={!contactsData.pagination.hasPrev}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <span>&lsaquo;</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!contactsData.pagination.hasNext}
                    >
                      <span className="sr-only">Go to next page</span>
                      <span>&rsaquo;</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setQueryParams(prev => ({ ...prev, page: contactsData.pagination.totalPages }))}
                      disabled={!contactsData.pagination.hasNext}
                    >
                      <span className="sr-only">Go to last page</span>
                      <span>&raquo;</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Query Details
            </DialogTitle>
            <DialogDescription>
              View and manage contact query information
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm text-foreground">{selectedContact.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm text-foreground">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-sm text-foreground">{selectedContact.phone}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Submitted
                  </label>
                  <p className="text-sm text-foreground">
                    {dayjs(selectedContact.createdAt).format(
                      'MMMM DD, YYYY [at] h:mm A'
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div>
                    <StatusBadge status={selectedContact.status} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Priority
                  </label>
                  <div>
                    <PriorityBadge priority={selectedContact.priority} />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Subject
                </label>
                <p className="text-sm text-foreground">{selectedContact.subject}</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Message
                </label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedContact.adminNotes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Admin Notes
                  </label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-foreground">
                      {selectedContact.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  asChild
                  className="flex-1"
                >
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

