'use client';
import React, { useState, useEffect } from 'react';
import { useGetAllProductsQuery } from '@/redux/product/productApi';
import { IProduct } from '@/types/product';
import ErrorMsg from '../../common/error-msg';
import ProductGridItem from './product-grid-item';
import Pagination from '../../ui/Pagination';
import { Search } from '@/svg';
import Link from 'next/link';
import usePagination from '@/hooks/use-pagination';

export default function ProductGridArea() {
  const { data: products, isError, isLoading } = useGetAllProductsQuery();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectValue, setSelectValue] = useState<string>('');

  // Filter and sort products
  const filteredProducts = React.useMemo(() => {
    if (!products?.data) return [];

    let filtered = [...products.data];

    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(searchTerm) ||
          p.sku.toLowerCase().includes(searchTerm)
      );
    }
    //
    if (selectValue) {
      filtered = filtered.filter(p => p.category.name === selectValue);
    }

    // Sort by newest first (assuming _id contains timestamp)
    return filtered.sort((a, b) => b._id.localeCompare(a._id));
  }, [products?.data, searchValue, selectValue]);

  // Apply pagination to filtered results
  const { currentItems, handlePageClick, pageCount, forcePage } =
    usePagination<IProduct>(filteredProducts, 10);

  // Reset pagination when filters change
  useEffect(() => {
    forcePage(0);
  }, [searchValue, selectValue]);

  // Handle search input
  const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle category filter
  const handleSelectField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  // Render content based on state
  let content = null;

  if (isLoading) {
    content = <h2>Loading....</h2>;
  } else if (isError) {
    content = <ErrorMsg msg="There was an error" />;
  } else if (!products?.data?.length) {
    content = <ErrorMsg msg="No Products Found" />;
  } else if (filteredProducts.length === 0) {
    content = <ErrorMsg msg="No products match your search" />;
  } else {
    content = (
      <>
        <div className="relative mx-8 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {currentItems.map(prd => (
              <ProductGridItem key={prd._id} product={prd} />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap mx-8">
          <p className="mb-0 text-tiny">
            Showing {currentItems.length} of {filteredProducts.length}
          </p>
          {pageCount > 1 && (
            <div className="pagination py-3 flex justify-end items-center mx-8">
              <Pagination
                handlePageClick={handlePageClick}
                pageCount={pageCount}
              />
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="bg-white rounded-t-md rounded-b-md shadow-xs py-4">
      <div className="tp-search-box flex items-center justify-between px-8 py-8 flex-wrap">
        <div className="search-input relative">
          <input
            onChange={handleSearchProduct}
            className="input h-[44px] w-full pl-14"
            type="text"
            placeholder="Search by product name"
            value={searchValue}
          />
          <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
            <Search />
          </button>
        </div>
        <div className="flex sm:justify-end sm:space-x-6 flex-wrap">
          <div className="search-select mr-3 flex items-center space-x-3">
            <span className="text-tiny inline-block leading-none -translate-y-[2px]">
              Categories :{' '}
            </span>
            <select onChange={handleSelectField} value={selectValue}>
              <option value="">Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="beauty">Beauty</option>
              <option value="jewelry">Jewelry</option>
            </select>
          </div>
          <div className="product-add-btn flex">
            <Link href="/add-product" className="tp-btn">
              Add Product
            </Link>
          </div>
        </div>
      </div>
      {content}
    </div>
  );
}
