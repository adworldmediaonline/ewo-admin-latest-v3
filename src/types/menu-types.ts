import React from 'react';

export interface ISidebarMenus {
  id: number;
  icon: () => React.ReactElement;
  link: string;
  title: string;
  subMenus?: {
    title: string;
    link: string;
  }[]
}