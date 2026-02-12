import Wrapper from '@/layout/wrapper';
import Breadcrumb from '../../../../components/breadcrumb/breadcrumb';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowRight } from 'lucide-react';

const WebsiteContentPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <Breadcrumb title="Website Content" subtitle="Website Content" />
        <div className="mt-6 space-y-6">
          <p className="text-muted-foreground">
            Manage your website content, SEO metadata, and page sections from one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <FileText className="h-10 w-10 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">
                      Page Metadata (SEO)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Edit meta title, description, keywords for each page
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/super-admin/website-content/metadata">
                      Manage
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default WebsiteContentPage;
