import Wrapper from '@/layout/wrapper';
import { Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PromotionalEmailForm from '@/app/components/promotional-emails/promotional-email-form';

const PromotionalEmailsPage = () => {
  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Promotional Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PromotionalEmailForm />
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default PromotionalEmailsPage;
