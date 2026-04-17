import React from 'react';

const ActiveDoubtCard = () => (
  <div
    className="m-topic-card m-topic-card__current-topic m-doubt-card__last-card"
  >
    <div className="m-topic-card__section row">
      <div className="m-doubt-card__section p-15">
        <div className="row m-b-5 m-topic-card__header">
          <div className="h5 m-t-5 m-topic-card__current-text">
            Doubt Resolution
          </div>
        </div>
        <div className="h5 m-topic-card__current-text">
          5 to 10 Mins to clear doubts.
        </div>
      </div>
    </div>
  </div>
);

export default ActiveDoubtCard;
