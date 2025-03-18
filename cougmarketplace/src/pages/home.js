import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";


export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error} = await supabase.auth.getSession()

      if (error) {
        // Safely check for error before accessing message
        console.error("Error fetching user:", error?.message);
        router.push("/login");
      } else if (!data?.session?.user) {
        router.push("/login"); // If no user in session, redirect to login
      } else {
        setUser(data.session.user); // The user object is in data.session.user
      }

    };

    checkUser();  
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      router.push("/login"); // Redirect after logout
    }
  };

  const goToHome = () => {
      router.push("/");
  };

  const handleSearch = async () => {
    // const { error } = await ...
    //search for product and access products that have words contained in search, cannot implement this yet
    //for now, will have it refresh
    router.push("/");

  };

  return (
    <div className="MainPage">
      <div className="Title and User Info flex justify-between w-full">
      <Image
              src="/Images/pexels-boomheadshot-31139015.jpg"
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="z-[-1] opacity-100"
            />
        
        <div className="User Info flex flex-col w-1/9 sm:w-1/8 md:w-1/7 lg:w-1/6 xl:w-1/5 gap-4 justify-start items-center p-0 sm:p-1 md:p-2 lg:p-3 xl:p-4 m-4 bg-gray-400 rounded ml-auto">
          
          <div className="User flex">

            {user ? (
            <p className="text-xs text-gray-900 font-bold"> Logged in as {user.email}</p>
             ) : (
              <p>Loading...</p>
              )}

          </div>

        <div className="Logout flex flex-col gap-2 w-full  justify-center items-center">

          <div className="Logout flex justify-center items-center w-1/2 bg-red-800 hover:bg-red-900 rounded ">
          
          <button onClick={handleLogout} className=" text-base text-center text-white ">Log out</button>

          </div>

          <div className="Logout flex justify-center items-center w-1/2 bg-red-800 hover:bg-red-900 rounded">
          
          <button className="text-base text-center text-white">Edit Profile</button>

          </div>

        </div>
        </div>

        <div href="/" className="inline-block p-2 bg-gray-200 rounded-full hover:bg-gray-300 absolute top-0 left-0 m-4">
        <button onClick={goToHome} className="">
            <Image
            src="/Images/washington-state-logo-png-transparent.png" 
            alt="HomeButton" 
            layout= "fixed"
            width={500}
            height={500}
            quality={100}
            className="h-6 w-6"
            />
        </button>
            
        </div>

        <div className="bg-gray-400 bg-opacity-75 p-8 rounded-lg shadow-lg w-150 text-white absolute top-0 left-1/2 transform -translate-x-1/2 m-4">
        <h1 className="text-white text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>COUG MARKETPLACE</h1>
        <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              placeholder="Search for..."
            
           // onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-500 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            required
            />
          </form>

        </div>

      </div>
      
    </div>
  );
}
