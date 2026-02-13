'use client';
import React, { useEffect, useMemo } from 'react';
import type { Tag } from 'react-tag-input';
import useCategorySubmit from '@/hooks/useCategorySubmit';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import CategoryChildren from './category-children';
import CategoryBannerDisplaySettings from './category-banner-display-settings';
import CategoryBannerContent from './category-banner-content';
import { useGetCategoryQuery } from '@/redux/category/categoryApi';
import CategoryParent from './category-parent';
import CategoryDescription from './category-description';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Image as ImageIcon, FileText, Loader2, Save, Layout } from 'lucide-react';

const EditCategory = ({ id }: { id: string }) => {
  const { data: categoryData, isError, isLoading } = useGetCategoryQuery(id);
  const {
    errors,
    control,
    categoryChildren,
    setCategoryChildren,
    register,
    handleSubmit,
    setCategoryImg,
    categoryImg,
    categoryBanner,
    setCategoryBanner,
    bannerDisplayScope,
    setBannerDisplayScope,
    bannerDisplayChildren,
    setBannerDisplayChildren,
    bannerContentActive,
    setBannerContentActive,
    bannerContentDisplayScope,
    setBannerContentDisplayScope,
    bannerContentDisplayChildren,
    setBannerContentDisplayChildren,
    bannerTitle,
    setBannerTitle,
    bannerDescription,
    setBannerDescription,
    error,
    isSubmitted,
    handleSubmitEditCategory,
  } = useCategorySubmit();

  // Load image when category data is available (supports legacy img string)
  useEffect(() => {
    if (!categoryData) return;
    if (categoryData.image?.url) {
      setCategoryImg(categoryData.image);
    } else if (categoryData.img) {
      setCategoryImg({
        url: categoryData.img,
        fileName: '',
        title: '',
        altText: '',
      });
    } else {
      setCategoryImg(null);
    }
  }, [categoryData?._id, categoryData?.img, categoryData?.image?.url, setCategoryImg]);

  // Load banner and display settings when category data is available
  useEffect(() => {
    if (!categoryData) return;
    if (categoryData.banner?.url) {
      setCategoryBanner(categoryData.banner);
    } else {
      setCategoryBanner(null);
    }
    setBannerDisplayScope(
      categoryData.bannerDisplayScope || 'all'
    );
    setBannerDisplayChildren(
      Array.isArray(categoryData.bannerDisplayChildren)
        ? categoryData.bannerDisplayChildren
        : []
    );
    setBannerContentActive(!!categoryData.bannerContentActive);
    setBannerContentDisplayScope(
      categoryData.bannerContentDisplayScope || 'all'
    );
    setBannerContentDisplayChildren(
      Array.isArray(categoryData.bannerContentDisplayChildren)
        ? categoryData.bannerContentDisplayChildren
        : []
    );
    setBannerTitle(categoryData.bannerTitle || '');
    setBannerDescription(categoryData.bannerDescription || '');
  }, [
    categoryData?._id,
    categoryData?.banner?.url,
    categoryData?.bannerDisplayScope,
    categoryData?.bannerDisplayChildren,
    categoryData?.bannerContentActive,
    categoryData?.bannerContentDisplayScope,
    categoryData?.bannerContentDisplayChildren,
    categoryData?.bannerTitle,
    categoryData?.bannerDescription,
    setCategoryBanner,
    setBannerDisplayScope,
    setBannerDisplayChildren,
    setBannerContentActive,
    setBannerContentDisplayScope,
    setBannerContentDisplayChildren,
    setBannerTitle,
    setBannerDescription,
  ]);

  // Convert children array (string[]) to Tag[] format
  const defaultChildrenTags = useMemo(() => {
    if (!categoryData?.children || !Array.isArray(categoryData.children)) {
      return [];
    }
    return categoryData.children.map((child: string, index: number) => ({
      id: `child-${index}`,
      text: child || '',
      className: '',
    }));
  }, [categoryData?.children]);

  // Set default children when categoryData is loaded
  useEffect(() => {
    if (defaultChildrenTags.length > 0 && categoryChildren.length === 0) {
      setCategoryChildren(defaultChildrenTags);
    }
  }, [defaultChildrenTags, categoryChildren.length, setCategoryChildren]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Loading Category
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we fetch the category details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Folder className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">
              Error Loading Category
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              We couldn't load the category details. Please try again.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <Loader2 className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!categoryData) {
    return null;
  }

  return (
    <div className="space-y-6 min-w-0">
      <form
        onSubmit={handleSubmit(data => handleSubmitEditCategory(data, id))}
        noValidate
        aria-labelledby="edit-category-form"
        className="min-w-0"
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0"
          role="main"
          aria-label="Category edit form"
        >
          {/* Left side - Main content */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
            {/* General Information */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      General Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Basic category details and description
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Parent Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Category Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...register('parent', {
                      required: 'Category name is required',
                    })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    placeholder="Enter category name"
                    defaultValue={categoryData.parent}
                  />
                  {errors?.parent && (
                    <p className="text-sm text-destructive">
                      {errors.parent.message as string}
                    </p>
                  )}
                </div>

                {/* Category Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description
                  </label>
                  <CategoryDescription
                    register={register}
                    default_value={categoryData.description}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sub-Categories */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Folder className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Sub-Categories
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add sub-categories for better organization
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CategoryChildren
                  categoryChildren={categoryChildren}
                  setCategoryChildren={setCategoryChildren}
                  error={error}
                  default_value={defaultChildrenTags}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right side - Sidebar */}
          <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6 min-w-0">
            {/* Category Image */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      Category Image
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      Upload a high-quality category image
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 min-w-0">
                <ImageUploadWithMeta
                  value={categoryImg}
                  onChange={setCategoryImg}
                  folder="ewo-assets/categories"
                />
              </CardContent>
            </Card>

            {/* Category Banner */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Layout className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      Category Banner
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      Banner for shop page (filename, title, alt text)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 min-w-0">
                <ImageUploadWithMeta
                  value={categoryBanner}
                  onChange={setCategoryBanner}
                  folder="ewo-assets/categories/banners"
                />
                {categoryBanner?.url && (
                  <>
                    <CategoryBannerContent
                      bannerContentActive={bannerContentActive}
                      onBannerContentActiveChange={setBannerContentActive}
                      bannerTitle={bannerTitle}
                      onBannerTitleChange={setBannerTitle}
                      bannerDescription={bannerDescription}
                      onBannerDescriptionChange={setBannerDescription}
                      bannerContentDisplayScope={bannerContentDisplayScope}
                      onBannerContentDisplayScopeChange={setBannerContentDisplayScope}
                      bannerContentDisplayChildren={bannerContentDisplayChildren}
                      onBannerContentDisplayChildrenChange={setBannerContentDisplayChildren}
                      categoryChildren={categoryChildren}
                      parentName={categoryData.parent || ''}
                      productCount={categoryData.products?.length ?? 0}
                    />
                    <CategoryBannerDisplaySettings
                      scope={bannerDisplayScope}
                      onScopeChange={setBannerDisplayScope}
                      selectedChildren={bannerDisplayChildren}
                      onSelectedChildrenChange={setBannerDisplayChildren}
                      categoryChildren={categoryChildren}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground">
                  Ready to update your category?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Changes will be saved and applied immediately to your category
                  listing.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 hover:bg-muted/50 transition-all duration-200"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button variant="default" type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>Update Category</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditCategory;
