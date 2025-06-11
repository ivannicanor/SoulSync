// src/app/chat/page.tsx
"use client";

import React from "react";
import ChatListas from "./ChatListas";
import Navbar from "../home/navbar/Navbar";

const ChatPage = () => {
  return (
    <div>
      <Navbar />
      <ChatListas />
    </div>
  );
};

export default ChatPage;
