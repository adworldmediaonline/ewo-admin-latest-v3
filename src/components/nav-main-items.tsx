import { cn } from '@/lib/utils';
import { Icon } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

export default function NavMainItems({
  item,
}: {
  item: { title: string; url: string; icon: Icon };
}) {
  const pathname = usePathname();
  const isActive = pathname === item.url;
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        className={cn(isActive && 'bg-primary text-primary-foreground')}
      >
        <Link
          href={item.url}
          className={cn(isActive && 'bg-primary text-primary-foreground')}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
