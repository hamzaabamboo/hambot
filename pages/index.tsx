import React from 'react';
import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl block mb-2">
        Hello, World! This is <span className="text-red-500">HamBot</span>
      </h1>
      <h2 className="text-3xl">Nothing to see here, go away.</h2>
    </div>
  );
};

export default Home;
