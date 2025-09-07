import {
  Categories,
  Contact,
  Coupons,
  Dashboard,
  Leaf,
  Orders,
  Pages,
  Products,
  Profile,
  Reviews,
  Setting,
  StuffUser,
} from '@/svg';
import { ISidebarMenus } from './../types/menu-types';

const sidebar_menu: Array<ISidebarMenus> = [
  {
    id: 1,
    icon: Dashboard,
    link: '/dashboard',
    title: 'Dashboard',
  },
  {
    id: 2,
    icon: Products,
    link: '/product-list',
    title: 'Products',
    subMenus: [
      { title: 'Product List', link: '/product-list' },
      { title: 'Product Grid', link: '/product-grid' },
      { title: 'Add Product', link: '/add-product' },
    ],
  },
  {
    id: 3,
    icon: Categories,
    link: '/category',
    title: 'Category',
  },
  {
    id: 4,
    icon: Orders,
    link: '/orders',
    title: 'Orders',
  },
  // {
  //   id: 5,
  //   icon: Cart,
  //   link: '/cart-tracking',
  //   title: 'Cart Tracking',
  // },
  {
    id: 6,
    icon: Leaf,
    link: '/brands',
    title: 'Brand',
  },
  {
    id: 7,
    icon: Reviews,
    link: '/reviews',
    title: 'Reviews',
  },
  {
    id: 8,
    icon: Coupons,
    link: '/coupon',
    title: 'Coupons',
  },
  {
    id: 8.5,
    icon: Contact,
    link: '/contact-queries',
    title: 'Contact Queries',
  },
  {
    id: 9,
    icon: Profile,
    link: '/profile',
    title: 'Profile',
  },
  {
    id: 9.5,
    icon: Profile,
    link: '/users',
    title: 'Users',
  },
  {
    id: 10,
    icon: Setting,
    link: 'https://www.eastwestoffroad.com/',
    title: 'Online store',
  },
  {
    id: 11,
    icon: StuffUser,
    link: '/our-staff',
    title: 'Our Staff',
  },
  {
    id: 12,
    icon: Pages,
    link: '/dashboard',
    title: 'Pages',
    subMenus: [
      { title: 'Register', link: '/register' },
      { title: 'Login', link: '/login' },
      { title: 'Forgot Password', link: '/forgot-password' },
    ],
  },
  {
    id: 13,
    icon: Categories,
    link: '/blog-category',
    title: 'Blog Category',
  },
];

export default sidebar_menu;
