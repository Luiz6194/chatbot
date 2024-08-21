import React from 'react';

const ExamplePrompt2 = ({ handlePromptClick }) => (
  <div className="example-prompt" onClick={() => handlePromptClick('Give me the GenAI developer productivity use case')}>
    <pre>
{`

Describe the Blueprint and what you are looking for`}
    </pre>
  </div>
);

export default ExamplePrompt2;