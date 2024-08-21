import React from 'react';

const ExamplePrompt1 = ({ handlePromptClick }) => (
  <div className="example-prompt" onClick={() => handlePromptClick('I have a customer that wants to automate some tasks in their company. They want to be able to automatically produce content with just a short description. Help me with this')}>


    <pre>
{`

Describe use case and get help`}

    </pre>
  </div>
);

export default ExamplePrompt1;