import Wrapper from '@/layout/wrapper';
import { Folder, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import EditCategory from '@/app/components/category/edit-category';

const EditCategoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Edit Category
              </CardTitle>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/super-admin/category">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <EditCategory id={id} />
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default EditCategoryPage;
