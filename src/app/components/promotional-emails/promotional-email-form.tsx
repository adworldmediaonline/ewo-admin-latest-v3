'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Mail, Send, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tiptap from '@/components/tipTap/Tiptap';
import {
  useGetOrderEmailsQuery,
  useSendPromotionalEmailMutation,
} from '@/redux/order/orderApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PromotionalEmailFormData {
  subject: string;
  recipients: string;
  emailBody: string;
}

const PromotionalEmailForm = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionalEmailFormData>({
    defaultValues: {
      subject: '',
      recipients: '',
      emailBody: '',
    },
  });

  const recipients = watch('recipients');

  // Format date range for API
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  // Query to get email addresses based on date range
  const {
    data: emailsData,
    isLoading: isLoadingEmailsQuery,
    refetch: refetchEmails,
  } = useGetOrderEmailsQuery(
    {
      startDate: selectAll ? '' : startDate,
      endDate: selectAll ? '' : endDate,
      selectAll: selectAll,
    },
    {
      skip: (!dateRange?.from || !dateRange?.to) && !selectAll,
    }
  );

  const [sendPromotionalEmail, { isLoading: isSending, isSuccess, isError }] =
    useSendPromotionalEmailMutation();

  // Auto-populate recipients when emails are fetched
  useEffect(() => {
    if (emailsData?.emails && emailsData.emails.length > 0) {
      const emailList = emailsData.emails.join(', ');
      setValue('recipients', emailList);
    }
  }, [emailsData, setValue]);

  // Handle date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setSelectAll(false);
    if (range?.from && range?.to) {
      setIsLoadingEmails(true);
      // The query will automatically refetch when dateRange changes
    }
  };

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    setSelectAll(true);
    setDateRange(undefined);
    setIsLoadingEmails(true);
  };

  // Load emails when date range or select all changes
  useEffect(() => {
    if ((dateRange?.from && dateRange?.to) || selectAll) {
      // Only refetch if query is not already loading
      if (!isLoadingEmailsQuery) {
        refetchEmails();
      }
    }
  }, [dateRange?.from, dateRange?.to, selectAll]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (emailsData) {
      setIsLoadingEmails(false);
    }
  }, [emailsData]);

  const onSubmit = async (data: PromotionalEmailFormData) => {
    try {
      const recipientEmails = data.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      await sendPromotionalEmail({
        subject: data.subject,
        recipients: recipientEmails,
        emailBody: data.emailBody,
        startDate: selectAll ? '' : startDate,
        endDate: selectAll ? '' : endDate,
        selectAll: selectAll,
      }).unwrap();
    } catch (error) {
      console.error('Error sending promotional email:', error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Range Picker */}
              <div className="flex-1">
                <Label className="mb-2 block">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                      disabled={selectAll}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                            {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Select All Button */}
              <div className="flex items-end">
                <Button
                  type="button"
                  variant={selectAll ? 'default' : 'outline'}
                  onClick={handleSelectAll}
                  disabled={isLoadingEmails || isLoadingEmailsQuery}
                >
                  {isLoadingEmails || isLoadingEmailsQuery ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Select All Orders'
                  )}
                </Button>
              </div>

              {/* Clear Button */}
              {(dateRange || selectAll) && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDateRange(undefined);
                      setSelectAll(false);
                      setValue('recipients', '');
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Email Count Display */}
            {emailsData && (dateRange || selectAll) && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">
                    {emailsData.totalOrders}
                  </strong>{' '}
                  orders found with{' '}
                  <strong className="text-foreground">
                    {emailsData.emails.length}
                  </strong>{' '}
                  unique email addresses
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                {...register('subject', {
                  required: 'Subject is required',
                  minLength: {
                    value: 3,
                    message: 'Subject must be at least 3 characters',
                  },
                })}
                placeholder="Enter email subject"
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <Label htmlFor="recipients">
                Recipients <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="recipients"
                {...register('recipients', {
                  required: 'Recipients are required',
                  validate: value => {
                    const emails = value.split(',').map(email => email.trim());
                    const validEmails = emails.filter(
                      email => email.length > 0 && email.includes('@')
                    );
                    if (validEmails.length === 0) {
                      return 'Please enter at least one valid email address';
                    }
                    return true;
                  },
                })}
                placeholder="Email addresses (comma-separated)"
                rows={4}
                className={errors.recipients ? 'border-destructive' : ''}
              />
              {errors.recipients && (
                <p className="text-sm text-destructive">
                  {errors.recipients.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Email addresses are auto-selected based on your date range
                selection. You can manually edit this list.
              </p>
            </div>

            <Separator />

            {/* Email Body */}
            <div className="space-y-2">
              <Label>
                Email Body <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="emailBody"
                control={control}
                rules={{
                  required: 'Email body is required',
                  validate: value => {
                    if (!value || value.trim() === '') {
                      return 'Email body cannot be empty';
                    }
                    // Remove HTML tags for validation
                    const textContent = value.replace(/<[^>]*>/g, '').trim();
                    if (textContent.length < 10) {
                      return 'Email body must be at least 10 characters long';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <Tiptap
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Write your promotional email content here..."
                    limit={50000}
                    showCharacterCount={true}
                  />
                )}
              />
              {errors.emailBody && (
                <p className="text-sm text-destructive">
                  {errors.emailBody.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success/Error Messages */}
        {isSuccess && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Promotional email sent successfully!
            </AlertDescription>
          </Alert>
        )}

        {isError && (
          <Alert className="border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to send promotional email. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSending || isLoadingEmails || isLoadingEmailsQuery}
            className="min-w-[150px]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromotionalEmailForm;
