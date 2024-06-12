import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import useAuthState from "../../hooks/firebaseHook";
import { auth, db } from "../../firebase/firebaseConfig";

const ChatContainer = styled.div`
  padding: 20px;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  background-color: ${(props) => (props.isSent ? "#dcf8c6" : "#fff")};
  align-self: ${(props) => (props.isSent ? "flex-end" : "flex-start")};
`;

const MessageForm = styled.form`
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ChatRoom = () => {
  const { friendId } = useParams();
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

  useEffect(() => {
    const fetchFriendEmail = async () => {
      const friendDoc = await getDoc(doc(db, "users", friendId));
      if (friendDoc.exists()) {
        setFriendEmail(friendDoc.data().email);
      }
    };

    if (friendId) {
      fetchFriendEmail();
    }
  }, [friendId]);

  useEffect(() => {
    if (user?.uid && friendId) {
      const q = query(
        collection(db, "messages"),
        where("senderId", "in", [user.uid, friendId]),
        where("receiverId", "in", [user.uid, friendId]),
        orderBy("timestamp")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
        // console.log(msgs);
      });

      return () => unsubscribe();
    }
  }, [user?.uid, friendId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      senderId: user.uid,
      receiverId: friendId,
      message: newMessage,
      timestamp: new Date(),
    });

    setNewMessage("");
  };

  return (
    <ChatContainer>
      <h1>Chat</h1>
      <p>Chatting with: {friendEmail}</p>
      <MessageList>
        {messages.map((msg) => (
          <Message key={msg.id} isSent={msg.senderId === user.uid}>
            <p>{msg.message}</p>
          </Message>
        ))}
      </MessageList>
      <MessageForm onSubmit={sendMessage}>
        <MessageInput
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <SendButton type="submit">Send</SendButton>
      </MessageForm>
    </ChatContainer>
  );
};

export default ChatRoom;
