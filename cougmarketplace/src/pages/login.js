// pages/login.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
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
      <div className="">
        <h1 className="" style={{ fontFamily: 'Prism' }}>COUG MARKETPLACE</h1>
        <form onSubmit={handleLogin} className="">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className=""
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className=""
            required
          />
          <button type="submit" className="">Login</button>
        </form>
        {errorMessage && <p className="">{errorMessage}</p>}
        <p className="">
          Don't have an account? <button onClick={() => router.push('/signup')} className="">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
