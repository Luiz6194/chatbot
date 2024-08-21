import ChatContainer from './component/ChatContainer3';
import {Amplify} from 'aws-amplify';
import awsExports from './aws-exports';
import {withAuthenticator} from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';
import React from 'react';
import '@cloudscape-design/global-styles/index.css'

Amplify.configure(awsExports);


function App({signOut, user}) {
  return (
    <>

<ChatContainer signOut={signOut}/>

    </>
  );
}

export default withAuthenticator(App);

