'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';
import ErrorMsg from '../../common/error-msg';

interface SEOFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  defaultValues?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
}

export default function SEOFields({
  register,
  errors,
  defaultValues,
}: SEOFieldsProps) {
  return (
    <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              SEO Optimization
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Improve your product&apos;s search engine visibility
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            {...register('metaTitle')}
            id="metaTitle"
            placeholder="Premium Wireless Headphones - Best Audio Quality"
            defaultValue={defaultValues?.metaTitle}
            className="h-10"
          />
          <ErrorMsg msg={(errors?.metaTitle?.message as string) || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            {...register('metaDescription')}
            id="metaDescription"
            rows={3}
            placeholder="Experience crystal-clear sound with our premium wireless headphones. Perfect for music lovers and professionals seeking superior audio quality."
            defaultValue={defaultValues?.metaDescription}
            className="resize-none"
          />
          <ErrorMsg msg={(errors?.metaDescription?.message as string) || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaKeywords">Meta Keywords</Label>
          <Input
            {...register('metaKeywords')}
            id="metaKeywords"
            placeholder="wireless headphones, audio, music, bluetooth, premium quality"
            defaultValue={defaultValues?.metaKeywords || ''}
            className="h-10"
          />
          <ErrorMsg msg={(errors?.metaKeywords?.message as string) || ''} />
        </div>
      </CardContent>
    </Card>
  );
}
