import { useState, useCallback, useEffect } from 'react';

type PaginationResult<T> = {
  currentItems: T[];
  pageCount: number;
  currentPage: number;
  handlePageClick: (event: { selected: number }) => void;
  forcePage: (page: number) => void;
};

function usePagination<T>(
  items: T[],
  itemsPerPage: number,
  resetKey?: string | number
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Reset to page 0 when resetKey changes
  useEffect(() => {
    setCurrentPage(0);
  }, [resetKey]);

  // Calculate the valid current page
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, Math.max(0, totalPages - 1));

  // Calculate start and end indices
  const startIndex = validCurrentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);

  // Get current page items
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageClick = useCallback((event: { selected: number }) => {
    const newPage = Math.min(event.selected, Math.max(0, totalPages - 1));
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const forcePage = useCallback((page: number) => {
    const newPage = Math.min(page, Math.max(0, totalPages - 1));
    setCurrentPage(newPage);
  }, [totalPages]);

  return {
    currentItems,
    pageCount: totalPages,
    currentPage: validCurrentPage,
    handlePageClick,
    forcePage,
  };
}

export default usePagination;
