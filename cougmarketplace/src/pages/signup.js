// pages/signup.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import "../app/globals.css";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setErrorMessage(signUpError.message);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="">
        <h1 className="" style={{ fontFamily: 'Prism' }}>COUG MARKETPLACE</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className=""
            required
          />
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
          <button type="submit" className="">Sign Up</button>
        </form>
        {errorMessage && <p className="">{errorMessage}</p>}
        <p className="">
          Have an account? <button onClick={() => router.push('/login')} className="">Log in</button>
        </p>
      </div>
    </div>
  );
};

export default Signup;