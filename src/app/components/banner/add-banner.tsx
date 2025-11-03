'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import useBannerSubmit from '@/hooks/useBannerSubmit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Monitor,
  Smartphone,
  Type,
  FileText,
  Link as LinkIcon,
  ArrowUpDown,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import BannerImageUpload from './banner-image-upload';
import { Separator } from '@/components/ui/separator';

const AddBanner = () => {
  const router = useRouter();
  const {
    errors,
    handleSubmit,
    register,
    desktopImg,
    setDesktopImg,
    mobileImg,
    setMobileImg,
    status,
    setStatus,
    isSubmitted,
    setIsSubmitted,
    handleSubmitBanner,
    isAdding,
  } = useBannerSubmit();

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit(handleSubmitBanner)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desktop Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Desktop Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BannerImageUpload
                imageType="desktop"
                isSubmitted={isSubmitted}
                setImage={setDesktopImg}
                image={desktopImg}
                setIsSubmitted={setIsSubmitted}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 1920x800px (21:9 aspect ratio)
              </p>
            </CardContent>
          </Card>

          {/* Mobile Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Mobile Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BannerImageUpload
                imageType="mobile"
                isSubmitted={isSubmitted}
                setImage={setMobileImg}
                image={mobileImg}
                setIsSubmitted={setIsSubmitted}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 720x1280px (9:16 aspect ratio)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Banner Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Heading */}
            <div className="space-y-2">
              <Label htmlFor="heading">
                Heading <span className="text-destructive">*</span>
              </Label>
              <Input
                id="heading"
                {...register('heading', {
                  required: 'Heading is required',
                  maxLength: {
                    value: 100,
                    message: 'Heading cannot exceed 100 characters',
                  },
                })}
                placeholder="Enter banner heading"
                className={errors?.heading ? 'border-destructive' : ''}
              />
              {errors?.heading && (
                <p className="text-sm text-destructive">
                  {errors.heading.message as string}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description', {
                  required: 'Description is required',
                  maxLength: {
                    value: 500,
                    message: 'Description cannot exceed 500 characters',
                  },
                })}
                placeholder="Enter banner description"
                rows={4}
                className={errors?.description ? 'border-destructive' : ''}
              />
              {errors?.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* Small Sub Description */}
            <div className="space-y-2">
              <Label htmlFor="smallSubDescription">
                Small Sub-Description (Optional)
              </Label>
              <Input
                id="smallSubDescription"
                {...register('smallSubDescription', {
                  maxLength: {
                    value: 200,
                    message: 'Sub-description cannot exceed 200 characters',
                  },
                })}
                placeholder="Enter small sub-description"
              />
              {errors?.smallSubDescription && (
                <p className="text-sm text-destructive">
                  {errors.smallSubDescription.message as string}
                </p>
              )}
            </div>

            <Separator />

            {/* CTA Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Call to Action</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">
                    Button Text <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ctaText"
                    {...register('ctaText', {
                      required: 'CTA text is required',
                      maxLength: {
                        value: 50,
                        message: 'CTA text cannot exceed 50 characters',
                      },
                    })}
                    placeholder="Shop Now"
                    className={errors?.ctaText ? 'border-destructive' : ''}
                  />
                  {errors?.ctaText && (
                    <p className="text-sm text-destructive">
                      {errors.ctaText.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaLink">
                    Button Link <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ctaLink"
                    {...register('ctaLink', {
                      required: 'CTA link is required',
                    })}
                    placeholder="/shop"
                    className={errors?.ctaLink ? 'border-destructive' : ''}
                  />
                  {errors?.ctaLink && (
                    <p className="text-sm text-destructive">
                      {errors.ctaLink.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as 'active' | 'inactive')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">
                  Display Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  {...register('order')}
                  placeholder="0"
                  defaultValue="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/super-admin/banner')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding}>
                <Save className="mr-2 h-4 w-4" />
                {isAdding ? 'Adding...' : 'Add Banner'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddBanner;

