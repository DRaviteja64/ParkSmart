import React, { useState } from "react";
import {
  Bot,
  Send,
  UserRound,
  Sparkles,
} from "lucide-react";

// Suggested questions displayed when the chatbot opens
const suggestions = [
  "How do I book a slot?",
  "How are parking fees calculated?",
  "How do I add a vehicle?",
];

// Built-in demo responses
const replies = {
  book:
    "Open Find Parking, choose an available slot, review the estimated rate, and select Confirm Booking. This dashboard currently uses demo data.",

  fee:
    "Parking fees are calculated using the hourly rate multiplied by the parking duration. Actual rates depend on your backend configuration.",

  vehicle:
    "Open My Vehicles, select Add Vehicle, enter your vehicle registration number and vehicle type, and save the details.",
};

// Main AI Chatbot component
export default function AIChatbot() {
  // Store conversation messages
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm ParkSmart Assistant. I can help you understand the dashboard. What would you like to know?",
    },
  ]);

  // Store the current input
  const [text, setText] = useState("");

  // Generate a demo response
  const getReply = (message) => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("book") ||
      lowerMessage.includes("slot")
    ) {
      return replies.book;
    }

    if (
      lowerMessage.includes("fee") ||
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost")
    ) {
      return replies.fee;
    }

    if (
      lowerMessage.includes("vehicle") ||
      lowerMessage.includes("car")
    ) {
      return replies.vehicle;
    }

    return "I can help with parking slots, bookings, parking fees, and vehicle management. Please try one of the suggested questions.";
  };

  // Send a message
  const sendMessage = (value = text) => {
    const message = value.trim();

    if (!message) {
      return;
    }

    const answer = getReply(message);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        text: message,
      },
      {
        role: "assistant",
        text: answer,
      },
    ]);

    setText("");
  };

  // Render the chatbot interface
  return (
    <div className="page-stack chatbot-page">
      {/* Page heading */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">PARKSMART ASSISTANT</p>

          <h2>How can I help?</h2>

          <p>
            Get guidance for common dashboard tasks.
          </p>
        </div>

        <span className="assistant-online">
          <i />
          Demo assistant online
        </span>
      </div>

      {/* Chatbot container */}
      <section className="content-card chatbot-card">

        {/* Chatbot header */}
        <div className="chatbot-header">
          <div className="chatbot-avatar">
            <Bot size={24} />
          </div>

          <div>
            <h3>ParkSmart Assistant</h3>

            <p>
              <span className="online-dot" />
              Replies use built-in demo guidance
            </p>
          </div>

          <Sparkles
            size={20}
            className="chat-sparkle"
          />
        </div>

        {/* Conversation messages */}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.role === "user"
                  ? "chat-message-user"
                  : ""
              }`}
            >
              <div className="chat-message-avatar">
                {message.role === "user" ? (
                  <UserRound size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>

              <p>{message.text}</p>
            </div>
          ))}
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div className="chat-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Message input */}
        <form
          className="chat-input-row"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Ask about parking..."
            aria-label="Ask the assistant"
          />

          <button
            className="button button-primary"
            type="submit"
            aria-label="Send message"
            disabled={!text.trim()}
          >
            <Send size={17} />
          </button>
        </form>
      </section>

      {/* Demo notice */}
      <p className="demo-note">
        This is a frontend demo assistant. It is not connected
        to an AI API or live customer support service.
      </p>
    </div>
  );
}