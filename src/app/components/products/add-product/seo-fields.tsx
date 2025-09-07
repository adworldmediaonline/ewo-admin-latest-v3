'use client';
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
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

export default function SEOFields({ register, errors, defaultValues }: SEOFieldsProps) {

  return (
    <div className="px-8 py-8 mb-6 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-gray-800 mb-1">SEO Optimization</h4>
          <p className="text-sm text-gray-500">Improve your product's search engine visibility</p>
        </div>
      </div>
      
      {/* Meta Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <input
          {...register('metaTitle')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          type="text"
          placeholder="Premium Wireless Headphones - Best Audio Quality"
          defaultValue={defaultValues?.metaTitle}
        />
        <ErrorMsg msg={(errors?.metaTitle?.message as string) || ''} />
      </div>

      {/* Meta Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          {...register('metaDescription')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          rows={3}
          placeholder="Experience crystal-clear sound with our premium wireless headphones. Perfect for music lovers and professionals seeking superior audio quality."
          defaultValue={defaultValues?.metaDescription}
        />
        <ErrorMsg msg={(errors?.metaDescription?.message as string) || ''} />
      </div>

      {/* Meta Keywords */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Keywords
        </label>
        <input
          {...register('metaKeywords')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          type="text"
          placeholder="wireless headphones, audio, music, bluetooth, premium quality"
          defaultValue={defaultValues?.metaKeywords || ''}
        />
        <ErrorMsg msg={(errors?.metaKeywords?.message as string) || ''} />
      </div>

      {/* SEO Tips */}
     
    </div>
  );
} 