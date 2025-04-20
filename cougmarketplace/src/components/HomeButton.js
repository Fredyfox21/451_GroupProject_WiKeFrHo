import React from 'react';
import { useRouter } from 'next/router';
import Image from "next/image";
import "../app/globals.css";

export default function HomeButton({ className = "" }) {
  const router = useRouter();

  const goToHome = () => {
      router.push("/home");
  };

  return (
    <button
      onClick={goToHome}
      className={`rounded-full p-2 bg-white flex items-center justify-center ${className}`}
    >
      <Image
        src="/Images/washington-state-logo-png-transparent.png"
        alt="HomeButton"
        layout="fixed"
        width={48}
        height={48}
        quality={100}
        className="h-6 w-6"
      />
    </button>
  );  
}
