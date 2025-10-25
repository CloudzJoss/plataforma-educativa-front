// src/pages/HomePage.jsx 
// 🚨 ESTE ES EL NUEVO ARCHIVO DE PÁGINA

import React from 'react';
import Header from "../components/Header";
import Hero from "../components/Hero";
import Info from "../components/Info";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Info />
    </>
  );
}