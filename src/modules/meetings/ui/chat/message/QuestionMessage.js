import React from 'react';

import Question from '~meetings/ui/questions/Question';

function QuestionMessage({ message }) {
  return (
    <div className="message-question">
      <Question
        key={message.question.id}
        question={message.question}
        message
        timestamp={message.timestamp}
      />
    </div>
  );
}

export default QuestionMessage;
