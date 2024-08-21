import React, {useState, useEffect} from 'react'
import './ChatContainer.css';
import { fetchAuthSession, } from '@aws-amplify/auth';
import Popup from './Popup';
import ExamplePrompt1 from './ExamplePrompt1';
import ExamplePrompt2 from './ExamplePrompt2';
import axios from 'axios';

const apiGatewayEndpoint = '';

const ChatContainer = ({signOut}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [showExamplePrompt, setShowExamplePrompt] = useState(true);


  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  
  const getAccessToken = async () => {
    try {
      const session = await fetchAuthSession();

      //console.log("access token", session.tokens.idToken)
      return session.tokens.idToken;
    } catch (error) {
      console.log('Error getting access token:', error);
      return null;
    }
  };




  async function fetchChatbotResponse(message, accessToken, sessionId) {
    
    const url = `${apiGatewayEndpoint}?prompt=${encodeURIComponent(message)}&sessionId=${encodeURIComponent(sessionId || '')}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();
  const responseBody = JSON.parse(data.body);
  const desiredResponse = responseBody.generated_text.text;
  const usedDocuments = responseBody.object_uris || [];
  const newSessionId = responseBody.sessionId;

  setSessionId(newSessionId); // Update the sessionId state
  return { response: desiredResponse, documents: usedDocuments};
}



  const handlePopupYes = () => {
    setShowPopup(false);
    const link = ''; // Replace with the desired link
    window.open(link, '_blank');

  };

  const handlePopupNo = () => {
    setShowPopup(false);
  };

  const handlePromptClick = (promptText) => {
    setUserInput(promptText);
    setShowExamplePrompt(false);
  };
  
  const ExamplePrompt = () => (
    <div className="example-prompts">
        <ExamplePrompt1 handlePromptClick={handlePromptClick} />
        <ExamplePrompt2 handlePromptClick={handlePromptClick} />
    </div>
  );
  


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
          const { response, documents, sessionId: newSessionId} = await fetchChatbotResponse(message, accessToken, sessionId);
          setSessionId(newSessionId);
          if (response === "Sorry, I am unable to assist you with this request.") {
            setShowPopup(true);
          }
          console.log(response)
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', text: response, documents: documents },
          ]);
        } else {
          console.log('Access token not available');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    };




  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };



  return (
    <>
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={signOut}>Sign Out</button>
      </div>
      <div className="chat-messages-wrapper">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message-container ${message.sender}`}>
              <div className="message-logo"></div>
              <div className="message-content">
                {message.text}
                {message.sender === 'bot' && message.documents.length > 0 && (
                  <div className="document-sources">
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
                  </div>
                )}
              </div>
              </div>
          ))}
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
      {showExamplePrompt && <ExamplePrompt/>}
      <div className="chat-input">
        <input 
          type="text" 
          placeholder="Type your message..." 
          id="message-input" 
          value={userInput} 
          onChange={handleUserInput} 
          onKeyDown={handleKeyPress}
        />
        <button id="send-button" onClick={sendMessage}>Send</button>
      </div>
      {showPopup && <Popup onYes={handlePopupYes} onNo={handlePopupNo} />}
    </div>
    </>
  )
};

export default ChatContainer;
