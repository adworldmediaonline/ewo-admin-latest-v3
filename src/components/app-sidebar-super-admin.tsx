'use client';

import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconShoppingCart,
  IconUsers,
  IconCategory,
  IconStar,
  IconDiscount,
  IconPhoto,
} from '@tabler/icons-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard/super-admin',
      icon: IconDashboard,
    },
    {
      title: 'Hero Banner',
      url: '/dashboard/super-admin/banner',
      icon: IconPhoto,
    },
    {
      title: 'Categories',
      url: '/dashboard/super-admin/category',
      icon: IconCategory,
    },
    {
      title: 'Products',
      url: '/dashboard/super-admin/product',
      icon: IconUsers,
    },
    {
      title: 'Orders',
      url: '/dashboard/super-admin/orders',
      icon: IconShoppingCart,
    },
    {
      title: 'Queries',
      url: '/dashboard/super-admin/queries',
      icon: IconHelp,
    },
    {
      title: 'Users',
      url: '/dashboard/super-admin/users',
      icon: IconUsers,
    },
    {
      title: 'Reviews',
      url: '/dashboard/super-admin/reviews',
      icon: IconStar,
    },
    {
      title: 'Coupons',
      url: '/dashboard/super-admin/coupon',
      icon: IconDiscount,
    },

  ],
  // navClouds: [
  //   {
  //     title: 'Capture',
  //     icon: IconCamera,
  //     isActive: true,
  //     url: '#',
  //     items: [
  //       {
  //         title: 'Active Proposals',
  //         url: '#',
  //       },
  //       {
  //         title: 'Archived',
  //         url: '#',
  //       },
  //     ],
  //   },
  //   {
  //     title: 'Proposal',
  //     icon: IconFileDescription,
  //     url: '#',
  //     items: [
  //       {
  //         title: 'Active Proposals',
  //         url: '#',
  //       },
  //       {
  //         title: 'Archived',
  //         url: '#',
  //       },
  //     ],
  //   },
  //   {
  //     title: 'Prompts',
  //     icon: IconFileAi,
  //     url: '#',
  //     items: [
  //       {
  //         title: 'Active Proposals',
  //         url: '#',
  //       },
  //       {
  //         title: 'Archived',
  //         url: '#',
  //       },
  //     ],
  //   },
  // ],
  // navSecondary: [
  //   {
  //     title: 'Settings',
  //     url: '#',
  //     icon: IconSettings,
  //   },
  //   {
  //     title: 'Get Help',
  //     url: '#',
  //     icon: IconHelp,
  //   },
  //   {
  //     title: 'Search',
  //     url: '#',
  //     icon: IconSearch,
  //   },
  // ],
  // documents: [
  //   {
  //     name: 'Data Library',
  //     url: '#',
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: 'Reports',
  //     url: '#',
  //     icon: IconReport,
  //   },
  //   {
  //     name: 'Word Assistant',
  //     url: '#',
  //     icon: IconFileWord,
  //   },
  // ],
};

export function AppSidebarSuperAdmin({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="https://www.eastwestoffroad.com/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Ewo - Visit Website
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
