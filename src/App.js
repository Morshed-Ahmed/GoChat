import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./pages/Authentication/Login/Login";
import Register from "./pages/Authentication/Register/Register";
import Home from "./pages/Home";
import ChatRoom from "./pages/ChatRoom/ChatRoom";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="" element={<Home />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:friendId" element={<PrivateRoute />}>
            <Route path="" element={<ChatRoom />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
