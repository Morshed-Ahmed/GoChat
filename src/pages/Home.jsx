// import React, { useState, useEffect } from "react";
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   query,
//   where,
//   getDocs,
//   onSnapshot,
// } from "firebase/firestore";
// import useAuthState from "../hooks/firebaseHook";
// import { auth, db } from "../firebase/firebaseConfig";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const navigate = useNavigate();

//   const [user, loading, error] = useAuthState(); // Use the custom hook
//   const [friendEmail, setFriendEmail] = useState("");
//   const [incomingRequests, setIncomingRequests] = useState([]);
//   const [confirmedFriends, setConfirmedFriends] = useState([]);

//   // Fetch incoming friend requests
//   useEffect(() => {
//     if (!user) return;

//     const fetchIncomingRequests = async () => {
//       const q = query(
//         collection(db, "friend_requests"),
//         where("receiverId", "==", user.uid),
//         where("status", "==", "pending")
//       );
//       // console.log(q);
//       const unsubscribe = onSnapshot(q, async (querySnapshot) => {
//         const requestsList = [];
//         for (const docSnapshot of querySnapshot.docs) {
//           const requestData = docSnapshot.data();
//           // Fetch the sender's email
//           const senderDoc = await getDocs(
//             query(
//               collection(db, "users"),
//               where("uid", "==", requestData.senderId)
//             )
//           );
//           const senderEmail = senderDoc.docs[0]?.data()?.email || "Unknown";

//           requestsList.push({
//             id: docSnapshot.id,
//             ...requestData,
//             senderEmail,
//           });
//         }
//         console.log("Requests List:", requestsList);

//         setIncomingRequests(requestsList);
//       });

//       return () => unsubscribe();
//     };

//     fetchIncomingRequests();
//   }, [user]);

//   // Fetch confirmed friends
//   useEffect(() => {
//     if (!user) return;

//     const q = query(
//       collection(db, "friend_requests"),
//       where("receiverId", "==", user.uid),
//       where("status", "==", "confirmed")
//     );
//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const confirmedList = [];
//       querySnapshot.forEach((doc) => {
//         confirmedList.push({ id: doc.id, ...doc.data() });
//       });
//       setConfirmedFriends(confirmedList);
//     });

//     return () => unsubscribe();
//   }, [user]);
//   console.log(confirmedFriends);

//   const addFriend = async () => {
//     if (user && friendEmail) {
//       try {
//         // Check if the friend email exists in the users collection
//         const q = query(
//           collection(db, "users"),
//           where("email", "==", friendEmail)
//         );
//         const querySnapshot = await getDocs(q);

//         if (querySnapshot.empty) {
//           alert("User does not exist!");
//           return;
//         }

//         const friendDoc = querySnapshot.docs[0];
//         const friendData = friendDoc.data();

//         const friendRef = await addDoc(collection(db, "friend_requests"), {
//           senderId: user.uid,
//           receiverId: friendData.uid,
//           friendEmail,
//           status: "pending",
//           timestamp: new Date(),
//         });

//         console.log("Friend request sent with ID: ", friendRef.id);
//         setFriendEmail(""); // Clear the input field after adding
//       } catch (e) {
//         console.error("Error adding friend: ", e);
//       }
//     }
//   };

//   const confirmFriend = async (id) => {
//     try {
//       const friendDoc = doc(db, "friend_requests", id);
//       await updateDoc(friendDoc, { status: "confirmed" });
//       console.log("Friend confirmed");

//       // Add the confirmed friend to the current user's friend list
//       const friendRequestData = (await friendDoc.get()).data();
//       await addDoc(collection(db, "friends"), {
//         userId: user.uid,
//         friendId: friendRequestData.senderId,
//         friendEmail: friendRequestData.friendEmail,
//         status: "confirmed",
//       });
//     } catch (e) {
//       console.error("Error confirming friend: ", e);
//     }
//   };

//   const deleteFriend = async (id) => {
//     try {
//       await deleteDoc(doc(db, "friend_requests", id));
//       console.log("Friend request deleted");
//     } catch (e) {
//       console.error("Error deleting friend request: ", e);
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>; // Show a loading state while checking auth
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>; // Show any auth errors
//   }

//   const handleLogout = async () => {
//     try {
//       await auth.signOut();
//       console.log("User logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       console.error("Error logging out:", error.message);
//     }
//   };

//   return (
//     <div>
//       <button onClick={handleLogout}>logout</button>
//       {user.email}
//       {user.uid}
//       <h2>Friend Management</h2>
//       <input
//         type="email"
//         placeholder="Friend's Email"
//         value={friendEmail}
//         onChange={(e) => setFriendEmail(e.target.value)}
//       />
//       <button onClick={addFriend}>Add Friend</button>

//       <h3>Incoming Friend Requests</h3>
//       <ul>
//         {incomingRequests.map((request) => (
//           <li key={request.id}>
//             {request.senderEmail}
//             <button onClick={() => confirmFriend(request.id)}>Confirm</button>
//             <button onClick={() => deleteFriend(request.id)}>Delete</button>
//           </li>
//         ))}
//       </ul>

//       <h3>Your Friends</h3>
//       <ul>
//         {confirmedFriends.map((friend) => (
//           <li key={friend.id}>
//             {friend.senderId}
//             <button onClick={() => deleteFriend(friend.id)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Home;

// import React, { useEffect, useState } from "react";
// import useAuthState from "../hooks/firebaseHook";
// import {
//   addDoc,
//   collection,
//   doc,
//   getDocs,
//   onSnapshot,
//   query,
//   updateDoc,
//   where,
// } from "firebase/firestore";
// import { auth, db } from "../firebase/firebaseConfig";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const [user, loading, error] = useAuthState();
//   const [friendEmail, setFriendEmail] = useState("");

//   console.log(friendEmail);

//   const addFriend = async () => {
//     try {
//       const q = query(
//         collection(db, "users"),
//         where("email", "==", friendEmail)
//       );
//       const querySnapshot = await getDocs(q);
//       if (querySnapshot.empty) {
//         alert("User does not exist!");
//         return;
//       }
//       const friendDoc = querySnapshot?.docs[0];
//       const friendData = friendDoc?.data();

//       await addDoc(collection(db, "friend_requests"), {
//         senderId: user.uid,
//         senderEmail: user.email,
//         receiverId: friendData.uid,
//         receiverEmail: friendData.email,
//         status: "pending",
//         timestamp: new Date(),
//       });
//       console.log("Friend request added successfully");
//     } catch (error) {
//       console.error("Error adding friend request:", error);
//     }
//   };

//   const confirmFriend = async (id) => {
//     try {
//       const friendDoc = doc(db, "friend_requests", id);
//       await updateDoc(friendDoc, { status: "confirmed" });
//       console.log("Friend confirmed");
//     } catch (error) {
//       console.error("Error confirming friend:", error);
//     }
//   };

//   // Fetch incoming friend requests

//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (user?.uid) {
//           const q = query(
//             collection(db, "friend_requests"),
//             where("receiverId", "==", user.uid),
//             where("status", "==", "pending")
//           );
//           const unsubscribe = onSnapshot(q, (snapshot) => {
//             const updatedData = snapshot.docs.map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             }));
//             setData(updatedData);
//           });

//           return () => unsubscribe(); // Cleanup function
//         } else {
//           console.warn("User is not defined or has no UID");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [user?.uid]);

//   console.log(data);

//   const [friend, setFriend] = useState([]);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (user?.uid) {
//           // Fetch requests where user is the receiver
//           const receiverQuery = query(
//             collection(db, "friend_requests"),
//             where("receiverId", "==", user.uid),
//             where("status", "==", "confirmed")
//           );

//           // Fetch requests where user is the sender
//           const senderQuery = query(
//             collection(db, "friend_requests"),
//             where("senderId", "==", user.uid),
//             where("status", "==", "confirmed")
//           );

//           const unsubscribeReceiver = onSnapshot(receiverQuery, (snapshot) => {
//             const receiverData = snapshot.docs.map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             }));
//             setFriend((prevData) => [...prevData, ...receiverData]);
//           });

//           const unsubscribeSender = onSnapshot(senderQuery, (snapshot) => {
//             const senderData = snapshot.docs.map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             }));
//             setFriend((prevData) => [...prevData, ...senderData]);
//           });

//           // Cleanup function
//           return () => {
//             unsubscribeReceiver();
//             unsubscribeSender();
//           };
//         } else {
//           console.warn("User is not defined or has no UID");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [user?.uid]);

//   console.log(friend);

//   const navigate = useNavigate();
//   const handleLogout = async () => {
//     try {
//       await auth.signOut();
//       console.log("User logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       console.error("Error logging out:", error.message);
//     }
//   };

//   return (
//     <div>
//       <h1>home</h1>
//       <button onClick={handleLogout}>logout</button>
//       <br />
//       {user?.email}
//       <br />
//       {user?.uid}
//       <br />

//       <input
//         type="email"
//         placeholder="Friend's Email"
//         value={friendEmail}
//         onChange={(e) => setFriendEmail(e.target.value)}
//       />
//       <button onClick={addFriend}>Add friend</button>
//       <h1>Friend Request</h1>
//       {data.length > 0 ? (
//         data.map((item) => (
//           <div key={item.id}>
//             <p>Sender Email: {item.senderEmail}</p>
//             <button onClick={() => confirmFriend(item.id)}>Confirm</button>
//           </div>
//         ))
//       ) : (
//         <p>No friend requests found for this user.</p>
//       )}
//       <h1>Friend</h1>
//       {friend.length > 0 ? (
//         friend.map((item) => (
//           <div key={item.id}>
//             {item.senderEmail == user?.email ? (
//               <>
//                 <p> {item.receiverEmail}</p>
//               </>
//             ) : (
//               <>
//                 <p> {item.senderEmail}</p>
//               </>
//             )}
//           </div>
//         ))
//       ) : (
//         <p>No friend requests found for this user.</p>
//       )}
//     </div>
//   );
// };

// export default Home;

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
import { auth, db } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

// Component to display individual friend requests
const FriendRequest = ({ request, onConfirm }) => (
  <div>
    <p>Sender Email: {request.senderEmail}</p>
    <button onClick={() => onConfirm(request.id)}>Confirm</button>
  </div>
);

// Component to display individual friends
const Friend = ({ friend, user }) => (
  <div>
    <p>
      {friend.senderEmail === user.email
        ? friend.receiverEmail
        : friend.senderEmail}
    </p>
  </div>
);

const Home = () => {
  const [user, loading, error] = useAuthState();
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

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("User logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      <button onClick={handleLogout}>Logout</button>
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

      <h2>Friends</h2>
      {loadingFriends ? (
        <p>Loading friends...</p>
      ) : friends.length > 0 ? (
        friends.map((friend) => (
          <Friend key={friend.id} friend={friend} user={user} />
        ))
      ) : (
        <p>No friends found.</p>
      )}
    </div>
  );
};

export default Home;
