import React, { useCallback, useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { NavLink, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { auth } from "../../firebase/firebaseConfig";
import useAuthState from "../../hooks/firebaseHook";

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: perspective(1000px) rotateY(-10deg);
  }
  to {
    opacity: 1;
    transform: perspective(1000px) rotateY(0deg);
  }
`;

const ProfileDropdownMenu = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background-color: #fff;
  color: #333;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1000;
  width: 180px;
  padding: 10px;
  animation: ${fadeIn} 0.3s ease-in-out;

  @media (min-width: 600px) {
    width: 220px;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  flex-direction: column;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 10px;
`;

const ProfileDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const ProfileName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const ProfileEmail = styled.div`
  font-size: 12px;
  color: #666;
`;

const DropdownItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
    color: #00cc99;
  }

  @media (min-width: 600px) {
    padding: 12px 16px;
  }
`;

const ProfileDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [user] = useAuthState();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOutsideClick = useCallback(
    (event) => {
      if (
        isDropdownOpen &&
        !event.target.closest("#profile-dropdown") &&
        !event.target.closest(".burger-menu")
      ) {
        setIsDropdownOpen(false);
      }
    },
    [isDropdownOpen]
  );

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [handleOutsideClick]);

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
    <ProfileContainer>
      <CgProfile
        style={{ cursor: "pointer" }}
        size={25}
        className="burger-menu"
        onClick={toggleDropdown}
      />

      {isDropdownOpen && (
        <ProfileDropdownMenu id="profile-dropdown">
          <ProfileInfo>
            <ProfileImage src="profileImage" alt="Profile" />
            <ProfileDetails>
              <ProfileName>userName</ProfileName>
              <ProfileEmail>{user?.email}</ProfileEmail>
            </ProfileDetails>
          </ProfileInfo>
          <DropdownItem to="/">Profile</DropdownItem>
          <DropdownItem to="/">History</DropdownItem>
          <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
        </ProfileDropdownMenu>
      )}
    </ProfileContainer>
  );
};

export default ProfileDropdown;
