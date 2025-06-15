// src/app/chat/page.tsx
"use client";

import React, { useMemo } from "react";
import ChatListas from "./ChatListas";
import Navbar from "../home/navbar/Navbar";
import './styles.css'; // We'll create this file for the Chat page styles

const ChatPage = () => {
  // Generar posiciones de partículas una sola vez con useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    }));
  }, []);

  return (
    <div className="chat-page-container">
      <Navbar />
      <div className="chat-content-wrapper">
        {/* Elementos de brillo en el fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
          <div className="glow-3"></div>
        </div>

        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((style, i) => (
            <div 
              key={i}
              className="particle"
              style={style}
            ></div>
          ))}
        </div>

        {/* Contenido principal del chat */}
        <ChatListas />
      </div>
    </div>
  );
};

export default ChatPage;
