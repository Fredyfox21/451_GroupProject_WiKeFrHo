import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";
import "../app/globals.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        router.push("/home");
      }
    };
    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <Image
        src="/Images/90790602_3171703562862227_2160062344489598976_n.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-[-1] opacity-100"
      />
      <div className="bg-gray-400 bg-opacity-75 p-8 rounded-lg shadow-lg w-96 text-white">
        <h1 className="text-red-700 text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>COUG MARKETPLACE</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-gray-500 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-500 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
          <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white py-2 rounded">Login</button>
        </form>
        {errorMessage && <p className="text-red-800 mt-2 text-center">{errorMessage}</p>}
        <p className="text-gray-900 text-center mt-4">
          Don't have an account? <button onClick={() => router.push('/signup')} className="text-red-700 hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;