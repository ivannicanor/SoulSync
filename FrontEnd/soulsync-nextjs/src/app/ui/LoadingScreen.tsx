"use client";

import React from "react";
import styles from "./LoadingScreen.module.css"; // Puedes usar CSS Modules o Tailwind

const LoadingScreen = () => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Cargando...</p>
    </div>
  );
};

export default LoadingScreen;
