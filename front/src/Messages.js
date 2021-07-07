import { gql, useSubscription } from "@apollo/client";
import { useState } from "react";

const MESSAGES_SUBSCRIPTION = gql`
  subscription newMessage {
    newMessage {
      text
    }
  }
`;

const Messages = () => {
  useSubscription(MESSAGES_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      console.log(data);
      setMessages([...messages, data.newMessage.text]);
    },
  });
  const [messages, setMessages] = useState([]);
  return (
    <div>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
};

export default Messages;
