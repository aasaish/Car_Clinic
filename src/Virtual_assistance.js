import React, { useState } from 'react';
import './VirtualAssistance.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = process.env.REACT_APP_OPENAI_KEY;
const systemMessage = { "role": "system", "content": "You are an expert automotive repair assistant. A client will bring their car with an issue and explain the problem. Ask relevant questions like the car's make, model, how long the issue has been occurring, and when the last maintenance was done. Then, explain the possible reasons for the problem and suggest troubleshooting steps. You should only play the of automotive repair assistant. Dont talk about other useless stuff" };

const VirtualAssistance = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your Automotive Car repair Assistant! How can i help you today?",
      sentTime: "just now",
      sender: "ChatGPT",
      direction: "incoming" // ChatGPT messages should be incoming
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing', // User messages should be outgoing
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "ChatGPT" ? "assistant" : "user",
      content: msg.message
    }));

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [systemMessage, ...apiMessages]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((res) => res.json())
      .then((data) => {
        console.log(data);
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming" // Ensure ChatGPT's response is on the left
        }]);
        setIsTyping(false);
      });
  }

  return (
    <div className="virtual-assistance-container">
      <h1>Virtual Assistance</h1>
      <div style={{ position: "relative", height: "500px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Assistant is typing..." /> : null}>
              {messages.map((msg, i) => (
                <Message key={i} model={{ message: msg.message, direction: msg.direction, sender: msg.sender }} />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here..." onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
};

export default VirtualAssistance;
