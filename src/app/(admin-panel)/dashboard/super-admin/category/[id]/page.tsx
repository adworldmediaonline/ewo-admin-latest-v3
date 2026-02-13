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
      <div className="min-h-0 w-full max-w-7xl mx-auto overflow-hidden flex flex-col">
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 truncate">
                  <Folder className="h-5 w-5 shrink-0" />
                  Edit Category
                </CardTitle>
              </div>
              <Button variant="outline" asChild className="shrink-0">
                <Link href="/dashboard/super-admin/category">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Categories
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 overflow-y-auto pb-6">
            <EditCategory id={id} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
};

export default EditCategoryPage;
