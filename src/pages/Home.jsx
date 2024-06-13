import React, { useEffect, useState } from "react";
import useAuthState from "../hooks/firebaseHook";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { IoMdPersonAdd } from "react-icons/io";
import ProfileDropdown from "../components/ProfileDropdown/ProfileDropdown";

const Container = styled.div`
  width: 30%;
  margin: auto;
  border: 1px solid #dddd;
  padding: 10px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HomeNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Component to display individual friend requests
const FriendRequest = ({ request, onConfirm }) => (
  <div>
    <p>Sender Email: {request.senderEmail}</p>
    <button onClick={() => onConfirm(request.id)}>Confirm</button>
  </div>
);

// Component to display individual friends
const Friend = ({ friend, user, onClick }) => (
  <div
    onClick={() =>
      onClick(
        friend.senderEmail === user.email ? friend.receiverId : friend.senderId
      )
    }
  >
    <p style={{ cursor: "pointer", marginTop: "10px" }}>
      {friend.senderEmail === user.email
        ? friend.receiverEmail
        : friend.senderEmail}
    </p>
  </div>
);

const Home = () => {
  const [user] = useAuthState();
  const [friendEmail, setFriendEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const navigate = useNavigate();

  // Function to add a friend request
  const addFriend = async () => {
    if (!friendEmail) {
      alert("Please enter a friend's email");
      return;
    }
    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", friendEmail)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        alert("User does not exist!");
        return;
      }
      const friendDoc = querySnapshot.docs[0];
      const friendData = friendDoc.data();

      await addDoc(collection(db, "friend_requests"), {
        senderId: user.uid,
        senderEmail: user.email,
        receiverId: friendData.uid,
        receiverEmail: friendData.email,
        status: "pending",
        timestamp: new Date(),
      });
      alert("Friend request sent successfully");
    } catch (error) {
      console.error("Error adding friend request:", error);
      alert("Failed to send friend request");
    }
  };

  // Function to confirm a friend request
  const confirmFriend = async (id) => {
    try {
      const friendDoc = doc(db, "friend_requests", id);
      await updateDoc(friendDoc, { status: "confirmed" });
      alert("Friend request confirmed");
    } catch (error) {
      console.error("Error confirming friend:", error);
      alert("Failed to confirm friend request");
    }
  };

  // Fetch pending friend requests
  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, "friend_requests"),
        where("receiverId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedRequests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(updatedRequests);
        setLoadingRequests(false);
      });

      return () => unsubscribe(); // Cleanup function
    }
  }, [user?.uid]);

  // Fetch confirmed friends
  useEffect(() => {
    if (user?.uid) {
      const fetchFriends = async () => {
        const receiverQuery = query(
          collection(db, "friend_requests"),
          where("receiverId", "==", user.uid),
          where("status", "==", "confirmed")
        );
        const senderQuery = query(
          collection(db, "friend_requests"),
          where("senderId", "==", user.uid),
          where("status", "==", "confirmed")
        );

        const unsubscribeReceiver = onSnapshot(receiverQuery, (snapshot) => {
          const receiverData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFriends((prevFriends) => [...prevFriends, ...receiverData]);
          setLoadingFriends(false);
        });

        const unsubscribeSender = onSnapshot(senderQuery, (snapshot) => {
          const senderData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFriends((prevFriends) => [...prevFriends, ...senderData]);
          setLoadingFriends(false);
        });

        return () => {
          unsubscribeReceiver();
          unsubscribeSender();
        };
      };

      fetchFriends();
    }
  }, [user?.uid]);

  const handleFriendClick = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <div style={{ background: "#0A171F", color: "white", height: "100vh" }}>
      <Container>
        <HomeNav>
          <h2>GoChat</h2>
          <div style={{ display: "flex", gap: "19px" }}>
            <IoMdPersonAdd size={25} />
            <ProfileDropdown />
          </div>
        </HomeNav>

        <p>Email: {user?.email}</p>
        <p>UID: {user?.uid}</p>

        <input
          type="email"
          placeholder="Friend's Email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
        />
        <button onClick={addFriend}>Add Friend</button>

        <h2>Friend Requests</h2>
        {loadingRequests ? (
          <p>Loading friend requests...</p>
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <FriendRequest
              key={request.id}
              request={request}
              onConfirm={confirmFriend}
            />
          ))
        ) : (
          <p>No friend requests found.</p>
        )}

        <h2 style={{ justifyContent: "space-between" }}>Friends</h2>
        {loadingFriends ? (
          <p>Loading friends...</p>
        ) : friends.length > 0 ? (
          friends.map((friend) => (
            <Friend
              key={friend.id}
              friend={friend}
              user={user}
              onClick={handleFriendClick}
            />
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </Container>
    </div>
  );
};

export default Home;
