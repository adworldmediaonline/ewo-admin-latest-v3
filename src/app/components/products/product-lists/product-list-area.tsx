'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ProductTableHead from './prd-table-head';
import ProductTableItem from './prd-table-item';
import Pagination from '../../ui/Pagination';
import { Search } from '@/svg';
import ErrorMsg from '../../common/error-msg';
import { useGetAllProductsQuery } from '@/redux/product/productApi';
import usePagination from '@/hooks/use-pagination';
import { IProduct } from '@/types/product';

export default function ProductListArea() {
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

    if (selectValue) {
      filtered = filtered.filter(p => p.status === selectValue);
    }

    // Sort by newest first (assuming _id contains timestamp)
    return filtered.sort((a, b) => b._id.localeCompare(a._id));
  }, [products?.data, searchValue, selectValue]);

  // Apply pagination to filtered results
  const { currentItems, handlePageClick, pageCount, forcePage } =
    usePagination<IProduct>(filteredProducts, 8);

  // Reset pagination when filters change
  useEffect(() => {
    forcePage(0);
  }, [searchValue, selectValue]);

  // Handle search input
  const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle status filter
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
        <div className="relative mx-8 overflow-x-auto">
          <table className="w-full text-base text-left text-gray-500">
            <ProductTableHead />
            <tbody>
              {currentItems.map(prd => (
                <ProductTableItem key={prd._id} product={prd} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between mx-8">
          <p className="mb-0 text-tiny">
            Showing {currentItems.length} of {filteredProducts.length}
          </p>
          {pageCount > 1 && (
            <div className="flex items-center justify-end py-3 mx-8 pagination">
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
    <>
      <div className="py-4 bg-white shadow-xs rounded-t-md rounded-b-md">
        <div className="flex items-center justify-between px-8 py-8 tp-search-box">
          <div className="relative search-input">
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
          <div className="flex justify-end space-x-6">
            <div className="flex items-center mr-3 space-x-3 search-select">
              <span className="text-tiny inline-block leading-none -translate-y-[2px]">
                Status :{' '}
              </span>
              <select onChange={handleSelectField} value={selectValue}>
                <option value="">Status</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </div>
            <div className="flex product-add-btn">
              <Link href="/add-product" className="tp-btn">
                Add Product
              </Link>
            </div>
          </div>
        </div>
        {content}
      </div>
    </>
  );
}
