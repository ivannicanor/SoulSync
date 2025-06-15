"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./LoadingScreen.module.css";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  
  // Generar posiciones de elementos flotantes una sola vez con useMemo
  const floatingElements = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 100 + 50}px`,
      height: `${Math.random() * 100 + 50}px`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 15}s`,
    }));
  }, []); // El array vacío asegura que esto solo se ejecute una vez
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 400);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container}>
      {/* Animated gradient background */}
      <div className={styles.gradientBackground}></div>
      
      {/* Floating elements */}
      <div className={styles.floatingElements}>
        {floatingElements.map((style, i) => (
          <div 
            key={i}
            className={styles.floatingElement}
            style={style}
          ></div>
        ))}
      </div>
      
      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoRing}></div>
          <div className={styles.logo}>SS</div>
        </div>
        
        <h1 className={styles.title}>SoulSync</h1>
        
        {/* Modern progress bar */}
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className={styles.loadingText}>
          {progress < 100 ? 'Preparando tu experiencia...' : 'Listo'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
