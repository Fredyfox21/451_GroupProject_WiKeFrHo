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

  return (
    <div className="MainPage">
      <div className="Title and User Info flex justify-between w-full">


        <div className="User Info flex flex-col w-1/9 sm:w-1/8 md:w-1/7 lg:w-1/6 xl:w-1/5 gap-4 justify-start items-center p-0 sm:p-1 md:p-2 lg:p-3 xl:p-4 m-4 bg-gray-400 rounded">
          
          <div className="User flex">

            {user ? (
            <p className="text-xs text-gray-900 font-bold"> Logged in as {user.email}</p>
             ) : (
              <p>Loading...</p>
              )}

          </div>

        <div className="Logout flex gap-2 w-full justify-center">

          <div className="Logout flex justify-center items-center w-1/2 bg-red-800 hover:bg-red-900 rounded">
          
          <button onClick={handleLogout} className="text-base text-center text-white">Log out</button>

          </div>

          <div className="Logout flex justify-center items-center w-1/2 bg-red-800 hover:bg-red-900 rounded">
          
          <button className="text-base text-center text-white">Edit Profile</button>

          </div>

        </div>
        </div>

      </div>
      
    </div>
  );
}
