'use client';
import React from 'react';
import useCategorySubmit from '@/hooks/useCategorySubmit';
import CategoryTables from './category-tables';
import CategoryImgUpload from './global-img-upload';
import CategoryChildren from './category-children';
import CategoryParent from './category-parent';
import CategoryDescription from './category-description';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Image as ImageIcon, FileText, Save } from 'lucide-react';

const AddCategory = ({ showTable = true }: { showTable?: boolean }) => {
  const {
    errors,
    control,
    categoryChildren,
    setCategoryChildren,
    register,
    handleSubmit,
    handleSubmitCategory,
    setCategoryImg,
    categoryImg,
    error,
    isSubmitted,
  } = useCategorySubmit();

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(handleSubmitCategory)}
        noValidate
        aria-labelledby="add-category-form"
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          role="main"
          aria-label="Category creation form"
        >
          {/* Left side - Main content */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6">
            {/* General Information */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
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
                  <CategoryParent register={register} errors={errors} />
                </div>

                {/* Category Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description
                  </label>
                  <CategoryDescription register={register} />
                </div>
              </CardContent>
            </Card>

            {/* Sub-Categories */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
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
                />
              </CardContent>
            </Card>
          </div>

          {/* Right side - Sidebar */}
          <div className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6">
            {/* Category Image */}
            <Card className="shadow-card hover:shadow-card-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Category Image
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload a high-quality category image
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CategoryImgUpload
                  isSubmitted={isSubmitted}
                  setImage={setCategoryImg}
                  image={categoryImg}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">
                  Ready to create your category?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your category will be added to the catalog and become available
                  for use immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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
                  <span>Create Category</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Show table if needed (for old layout compatibility) */}
      {showTable && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryTables />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddCategory;
