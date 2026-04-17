import classNames from 'classnames';
import React, { useState, useCallback } from 'react';

import Icon from './Icon';
import Tappable from './Tappable';

function Pagination({
  items = [],
  perPage,
  pageLimit,
  className,
  onNextClick,
  onPrevClick,
  onPageClick,
  totalPages,
  onPageChange,
  initialPage = 1,
  showBoundaryPages = false,
  ...remainingProps
}) {
  /* States and Variables start */
  const [currentPage, setCurrentPage] = useState(initialPage);
  /* States and Variables end */

  /* Utils start */

  const handlePageChange = useCallback((
    activePage, targetPage, followUpFunc,
  ) => {
    if (onPageChange) {
      onPageChange(activePage, targetPage);
    }
    if (followUpFunc) {
      followUpFunc(activePage, targetPage);
    }
    setCurrentPage(targetPage);
  }, [onPageChange]);


  const goToNextPage = useCallback(() => {
    handlePageChange(currentPage, currentPage + 1, onNextClick);
  }, [currentPage, handlePageChange, onNextClick]);

  const goToPreviousPage = useCallback(() => {
    handlePageChange(currentPage, currentPage - 1, onPrevClick);
  }, [currentPage, handlePageChange, onPrevClick]);

  const changePage = useCallback((event) => {
    const nextPage = Number(event.target.textContent);
    handlePageChange(currentPage, nextPage, onPageClick);
  }, [currentPage, handlePageChange, onPageClick]);

  const handleFirstPageClick = useCallback(
    () => handlePageChange(currentPage, 1),
    [currentPage, handlePageChange],
  );

  const handleLastPageClick = useCallback(
    () => handlePageChange(currentPage, totalPages),
    [currentPage, handlePageChange, totalPages],
  );

  const getPaginatedItems = () => {
    const startIndex = currentPage * perPage - perPage;
    const endIndex = startIndex + perPage;
    return items.slice(startIndex, endIndex);
  };
  const getPaginationGroup = () => {
    const start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
    return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
  };
  /* Utils end */

  /* UI start */
  const paginationUi = () => (
    <div className="pagination">
      {showBoundaryPages && (
        <Tappable
          onClick={handleFirstPageClick}
          className={classNames(
            'pagination__btn pagination__btn--first-page',
            { 'pagination__btn--disabled': currentPage === 1 },
          )}
        >
          <span>First Page</span>
        </Tappable>
      )}
      {/* previous button */}
      <Tappable
        onClick={goToPreviousPage}
        className={classNames(
          'pagination__btn pagination__btn--prev',
          { 'pagination__btn--disabled': currentPage === 1 },
        )}
        aria-hidden
      >
        <Icon name="chevron-left" />
      </Tappable>
      {/* show page numbers */}
      {getPaginationGroup().map((item, index) => {
        if (item <= totalPages) {
          return (
            <Tappable
              key={index}
              onClick={changePage}
              className={classNames(
                'pagination__btn',
                { 'pagination__btn--active': currentPage === item },
              )}
            >
              <span>{item}</span>
            </Tappable>
          );
        }
        return null;
      })}

      {/* next button */}
      <Tappable
        onClick={goToNextPage}
        className={classNames(
          'pagination__btn pagination__btn--next',
          { 'pagination__btn--disabled': currentPage === totalPages },
        )}
      >
        <Icon name="chevron-right" />
      </Tappable>
      {showBoundaryPages && (
        <Tappable
          onClick={handleLastPageClick}
          className={classNames(
            'pagination__btn pagination__btn--last-page',
            { 'pagination__btn--disabled': currentPage === totalPages },
          )}
        >
          <span>Last Page</span>
        </Tappable>
      )}
    </div>
  );
  /* UI end */
  return (
    <div
      className={classNames(
        'pagination__container',
        { [className]: className },
      )}
      {...remainingProps}
    >
      {getPaginatedItems().map(item => item)}
      {(totalPages > 1) && paginationUi()}
    </div>
  );
}

export default Pagination;
