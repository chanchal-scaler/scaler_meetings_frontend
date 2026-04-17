import React from 'react';
import { Skeleton } from '@common/ui/general';

function skeletonUi() {
  return (
    <div className="mcq-skeleton m-v-10">
      <div className="mcq-skeleton__header p-h-20">
        <Skeleton
          variant="text"
          width="20%"
        />
        <span className="skeleton-divider m-h-5">|</span>
        <Skeleton
          className="m-r-10"
          variant="circle"
          width={24}
        />
      </div>
      <div className="mcq-skeleton__body column">
        <div className="row m-v-10">
          <Skeleton
            className="m-r-10 mcq-skeleton__detail"
            variant="text"
            width="15%"
          />
          <Skeleton
            className="m-r-10 mcq-skeleton__detail"
            variant="text"
            width="15%"
          />
          <Skeleton
            className="m-r-10 mcq-skeleton__detail"
            variant="text"
            width="15%"
          />
          <Skeleton
            className="m-r-10 mcq-skeleton__detail"
            variant="text"
            width="15%"
          />
        </div>
        <div className="row m-v-10">
          <Skeleton
            className="m-r-10"
            variant="text"
            width="40%"
          />
        </div>
        <div className="row m-v-10">
          <Skeleton
            className="m-r-10"
            variant="text"
            width="60%"
          />
        </div>
      </div>
      <div className="mcq-skeleton__control p-h-20">
        <Skeleton
          className="mcq-skeleton__control launch m-r-10"
          variant="text"
          width="60%"
          height={35}
        />

        <Skeleton
          className="m-r-10"
          variant="text"
          width="15%"
          height={35}
        />
        <Skeleton
          className="m-r-10"
          variant="text"
          width="15%"
          height={35}
          style={{ marginLeft: 'auto' }}
        />
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <>
    {skeletonUi()}
    {skeletonUi()}
  </>
);

export default LoadingSkeleton;
