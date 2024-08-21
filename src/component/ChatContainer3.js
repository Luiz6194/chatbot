import React, { useState } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';
import axios from 'axios';
import {
  AppLayout,
  Button,
  Container,
  Header,
  SpaceBetween,
  Textarea,
  Grid,
  Box,
  Spinner,
  Icon,
} from '@cloudscape-design/components';
import Popup from './Popup2';
import ExamplePrompt1 from './ExamplePrompt1_2';
import ExamplePrompt2 from './ExamplePrompt2_2';
import './ChatContainer.css';

const apiGatewayEndpoint = '';

const ChatContainer = ({ signOut }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [showExamplePrompt, setShowExamplePrompt] = useState(true);

  const getAccessToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens.idToken;
    } catch (error) {
      console.log('Error getting access token:', error);
      return null;
    }
  };

  async function fetchChatbotResponse(message, accessToken, currentSessionId) {
    const url = apiGatewayEndpoint;
    const body = {
      prompt: message,
      sessionId: currentSessionId || ''
    };

    try {
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const responseBody = response.data;
      const desiredResponse = responseBody.generated_text.text;
      const usedDocuments = responseBody.object_uris || [];
      const newSessionId = responseBody.sessionId;
      console.log(newSessionId);

      // Only update sessionId if it's not already set
      if (!currentSessionId) {
        setSessionId(newSessionId);
      }

      return { response: desiredResponse, documents: usedDocuments, sessionId: newSessionId };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  const handlePopupYes = () => {
    setShowPopup(false);
    const link = '';
    window.open(link, '_blank');
  };

  const handlePopupNo = () => {
    setShowPopup(false);
  };

  const handlePromptClick = (promptText) => {
    setUserInput(promptText);
    setShowExamplePrompt(false);
  };

  const sendMessage = async () => {
    const message = userInput.trim();
    if (message) {
      setShowExamplePrompt(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: message }
      ]);

      setUserInput('');
      setIsLoading(true);
      setLastUserMessage(message);
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          const { response, documents, sessionId: newSessionId } = await fetchChatbotResponse(message, accessToken, sessionId);
          
          // Only update sessionId if it's not already set
          if (!sessionId) {
            setSessionId(newSessionId);
          }

          if (response.includes("Sorry, I am unable to assist you with this request.")) {
            setShowPopup(true);
          }
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: response, documents: documents },
          ]);
        } else {
          console.log('Access token not available');
        }
      } catch (error) {
        console.error('Error:', error);
        setShowPopup(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const ExamplePrompt = () => (
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <Box 
        padding="s" 
        backgroundColor="blue-600"
        color="white"
        borderRadius="s"
      >
        <ExamplePrompt1 handlePromptClick={handlePromptClick} />
      </Box>
      <Box 
        padding="s" 
        backgroundColor="blue-600"
        color="white"
        borderRadius="s"
      >
        <ExamplePrompt2 handlePromptClick={handlePromptClick} />
      </Box>
    </Grid>
  );

  const renderMessages = () => {
    return messages.map((message, index) => (
      <Container
        key={index}
        header={
          <Header
            variant={message.sender === 'user' ? 'h3' : 'h4'}
            description={
              <SpaceBetween direction="horizontal" size="xs">
                <Icon
                  name={message.sender === 'user' ? 'user-profile' : 'gen-ai'}
                  size="medium"
                />
                {message.sender === 'user' ? 'You' : 'Bot'}
              </SpaceBetween>
            }
          />
        }
      >
        <Box padding={{ vertical: 'xs' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
            {message.text}
          </pre>
        </Box>
        {message.sender === 'bot' && message.documents.length > 0 && (
          <Box padding={{ top: 's' }}>
            <h4>Document Sources:</h4>
            <ul>
              {message.documents.map((document, docIndex) => (
                <li key={docIndex}>
                  <a href={document} target="_blank" rel="noopener noreferrer">
                    {document}
                  </a>
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Container>
    ));
  };

  return (
    <>
      <AppLayout
        navigation={<></>}
        content={
          <SpaceBetween size="l">
            <Container
              header={
                <Header
                  variant="h1"
                  actions={
                    <Button variant="primary" onClick={signOut}>
                      Sign Out
                    </Button>
                  }
                >
                  CSC ChatBot
                </Header>
              }
            >
              <SpaceBetween size="l">
                {renderMessages()}
                {isLoading && (
                  <Box textAlign="center">
                    <Spinner size="normal" />
                    <Box variant="p" padding={{ top: 'xs' }}>
                      Loading
                    </Box>
                  </Box>
                )}
              </SpaceBetween>
            </Container>
            <Box margin={{ top: '70vh' }}>
              {showExamplePrompt && (
                <Box padding="s" borderRadius="s">
                  <ExamplePrompt />
                </Box>
              )}
              <Container>
                <SpaceBetween size="s">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.detail.value)}
                    placeholder="Type your message..."
                    rows={3}
                  />
                  <Button variant="primary" onClick={sendMessage}>
                    Send
                  </Button>
                </SpaceBetween>
              </Container>
            </Box>
          </SpaceBetween>
        }
        tools={<></>}
        headerSelector="#header"
        footer={<></>}
      />
      {showPopup && <Popup onYes={handlePopupYes} onNo={handlePopupNo} />}
    </>
  );
};

export default ChatContainer;
