import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';
import { useState, useEffect } from 'react';

export default function index() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
      const checkUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
  
        setUser(user);
      };

      checkUser();

      router.push("/home");

    }, [])
    return (
      <div className="text-blue-100">
      </div>
    );
  }