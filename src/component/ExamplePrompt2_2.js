import React from 'react';
import { Button } from '@cloudscape-design/components';

const ExamplePrompt2 = ({ handlePromptClick }) => (
  <Button
    variant="inline-link"
    onClick={() => handlePromptClick('Give me the GenAI developer productivity use case')}
  >
     <pre>
{`

State the Blueprint and what you are looking for

Example: 
Give me the GenAI developer productivity use case`}

    </pre>
  </Button>
);

export default ExamplePrompt2;