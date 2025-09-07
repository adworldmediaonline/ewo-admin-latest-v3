export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type BlogCategoryResponse = {
  success: boolean;
  message: string;
  data: BlogCategory[];
};

export type IAddBlogCategory = {
  name: string;
  slug: string;
};

export type IAddBlogCategoryResponse = {
  success: boolean;
  message: string;
  data: BlogCategory;
};

export type IBlogCategoryDeleteRes = {
  success: boolean;
  message: string;
};
