// app/players/search/page.tsx
'use client';

import React from 'react';
import Navbar from '../../../component/Navbar';
import PlayerSearch from '../../../component/PlayerSearch';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlayerSearchPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <PlayerSearch />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </>
  );
};

export default PlayerSearchPage;