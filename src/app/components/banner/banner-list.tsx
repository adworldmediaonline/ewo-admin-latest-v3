'use client';
import React, { useState } from 'react';
import { useGetAllBannersQuery, useDeleteBannerMutation } from '@/redux/banner/bannerApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { notifyError, notifySuccess } from '@/utils/toast';
import Image from 'next/image';

const BannerList = () => {
  const { data: bannersData, isLoading, isError } = useGetAllBannersQuery();
  const [deleteBanner] = useDeleteBannerMutation();

  const handleDelete = async (id: string, heading: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete banner "${heading}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          const res = await deleteBanner(id);
          if ('data' in res && res.data && 'success' in res.data) {
            Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
          } else {
            notifyError('Failed to delete banner');
          }
        } catch (error) {
          notifyError('Failed to delete banner');
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !bannersData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading banners</p>
      </div>
    );
  }

  const banners = bannersData.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hero Banners</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your homepage hero banners
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/super-admin/banner/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Link>
        </Button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No banners yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first hero banner
            </p>
            <Button asChild>
              <Link href="/dashboard/super-admin/banner/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner, index) => (
            <Card key={banner._id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        #{banner.order || index + 1}
                      </span>
                    </div>
                    <Badge
                      variant={
                        banner.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {banner.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/super-admin/banner/${banner._id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(banner._id, banner.heading)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Banner Preview */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold">Desktop View</h4>
                      </div>
                      <div className="relative aspect-[21/9] bg-muted rounded-lg overflow-hidden border border-border">
                        <Image
                          src={banner.desktopImg}
                          alt={banner.heading}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold">Mobile View</h4>
                      </div>
                      <div className="relative aspect-[9/16] max-h-64 bg-muted rounded-lg overflow-hidden border border-border">
                        <Image
                          src={banner.mobileImg}
                          alt={banner.heading}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {banner.heading}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {banner.description}
                      </p>
                      {banner.smallSubDescription && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {banner.smallSubDescription}
                        </p>
                      )}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <LinkIcon className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground mb-1">
                            Call to Action
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                              {banner.cta.text}
                            </p>
                            <p className="text-xs text-muted-foreground break-all">
                              {banner.cta.link}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Created: {new Date(banner.createdAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(banner.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerList;

