// Register.js
import React, { useState } from "react";
import styled from "styled-components";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f4f7f9;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

export const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #357abd;
  }
`;

export const Error = styled.p`
  color: red;
  margin-bottom: 20px;
`;

export const Link = styled.a`
  margin-top: 10px;
  color: #4a90e2;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: #357abd;
  }
`;

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // await createUserWithEmailAndPassword(auth, email, password);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
      });
      setLoading(false);
      console.log("User registered successfully");
      navigate("/home");
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleRegister}>
        <Title>Register</Title>
        {error && <Error>{error}</Error>}
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {loading ? (
          <>
            <Button>Loading.....</Button>
          </>
        ) : (
          <>
            <Button type="submit">Register</Button>
          </>
        )}
        <Link onClick={() => navigate("/login")}>
          Already have an account? Login
        </Link>
      </Form>
    </Container>
  );
};

export default Register;
