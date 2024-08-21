import React from 'react';
import { Button } from '@cloudscape-design/components';

const ExamplePrompt1 = ({ handlePromptClick }) => (
  <Button
    variant="inline-link"
    onClick={() => handlePromptClick('I have a customer that wants to automate some tasks in their company. They want to be able to automatically produce content with just a short description.')}
  >
       <pre>
{`

Describe use case and get help

Example:
I have a customer that wants to automate some tasks in their company. 
They should be able to generate content with just a short description.`}

    </pre>


  </Button>
);

export default ExamplePrompt1;