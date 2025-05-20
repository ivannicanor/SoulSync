// src/app/chat/page.tsx
"use client";

import React from "react";
import ChatListas from "./ChatListas";

const ChatPage = () => {
  return (
    <div>
      <h1>Chats Activos</h1>
      <ChatListas />
    </div>
  );
};

export default ChatPage;
