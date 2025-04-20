import "../app/globals.css";
import { useState, useEffect, use } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import ChatWindow from "../components/ChatWindow";
import HomeButton from "@/components/HomeButton";

export default function Message()
{
    const [user, setUser] = useState(null);
    const [sessionUser, setSessionUser] = useState(null);
    const router = useRouter();
    
    const { messangerId } = router.query; // Get the messangerId from the URL query parameters
    const [messanger, setMessanger] = useState(null); // State to hold messanger data
    const [isMounted, setIsMounted] = useState(false); // State to check if component is mounted
    const [chat, setChat] = useState(null); // State to hold chat data
    const [userImage, setUserImage] = useState(null); // State to hold user image
    const [messangerImage, setMessangerImage] = useState(null); // State to hold messanger image

    // Hydration check to ensure component only renders client-side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get the user session on component mount
    useEffect(() =>{
        const checkUser = async () => {
            const { data, error} = await supabase.auth.getSession()

            if(error){
                console.error("Error fetching user:", error?.message);
                router.push("/login");
            } else if(!data?.session?.user){
                router.push("/login");
            } else{
                setSessionUser(data.session.user)
                //console.log(data.session.user)
            }

        };
        checkUser();
    },[])

    useEffect(() => {
        if (!sessionUser) return; // Wait for user to be set

        const fetchUserData = async () => {
            try {
                const { data, error } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', sessionUser.id)
                    .single();

                if (error) {
                    console.error('Error fetching user data:', error.message);
                } else {
                    setUser(data); // Set the user data to state
                    //console.log('User data:', data); // Log the user data
                }
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            }
        };

        fetchUserData();
    }, [sessionUser]); // Fetch user data when user changes

    useEffect(() => {
        const fetchUserImage = async () => {
            if (!user) return; // Wait for user to be set

            try {
                const { data, error } = await supabase
                    .from('userImage')
                    .select('image')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user image:', error.message);
                } else {
                    setUserImage(data.image); // Set the user image to state
                    console.log('User image:', data.image); // Log the user image
                }
            }
            catch (error) {
                console.error('Error fetching user image:', error.message);
            }
        }
        fetchUserImage();

    }, [user]); // This effect runs when the user changes

    useEffect(() => {
        const fetchMessangerData = async () => {
            if (!messangerId) return; // Wait for messangerId to be set
            try {
                const { data, error } = await supabase
                    .from('user')
                    .select('*')
                    .eq('id', messangerId)
                    .single();

                if (error) {
                    console.error('Error fetching messanger data:', error.message);
                } else {
                    setMessanger(data); // Set the messanger data to state
                    //console.log('Messanger data:', data); // Log the messanger data
                }
            } catch (error) {
                console.error('Error fetching messanger data:', error.message);
            }
        };

        fetchMessangerData();
    },[messangerId]); // Fetch messanger data when messangerId changes

    useEffect(() => {
        const fetchMessangerImage = async () => {
            if (!messanger) return; // Wait for messanger to be set

            try {
                const { data, error } = await supabase
                    .from('userImage')
                    .select('image')
                    .eq('user_id', messanger.id)
                    .single();

                if (error) {
                    console.error('Error fetching messanger image:', error.message);
                } else {
                    setMessangerImage(data.image); // Set the messanger image to state
                    console.log('Messanger image:', data.image); // Log the messanger image
                }
            } catch (error) {
                console.error('Error fetching messanger image:', error.message);
            }
        }
        fetchMessangerImage();
    }, [messanger]); // This effect runs when the messanger changes

    // Create or fetch the chat when the component mounts
    useEffect(() => {
        let hasRun = false; // Flag to prevent multiple runs of the effect
        const createOrFetchChat = async () => {
            if (!user || !messanger || hasRun) return; // Wait for user and messanger to be set

            hasRun = true;
            const [user1, user2] = [user.id, messanger.id].sort();

            // Try to find existing conversation
            const { data: existing, error: findError } = await supabase
                .from('chat')
                .select('*')
                .eq('user_1', user1)
                .eq('user_2', user2)
                .single();
            
            if (existing) 
            {
                setChat(existing); // Set the chat data to state
                //console.log('Existing chat:', existing); // Log the existing chat
                return;
            }

            // Otherwise, create it
            const { data: created, error: createError } = await supabase
                .from('chat')
                .insert([{ user_1: user1, user_2: user2 }])
                .select()
                .single();

            if (createError) {
                console.error('Error creating chat:', createError.message);
                return;
            }
            setChat(created); // Set the chat data to state
            console.log('Created chat:', created); // Log the created chat
            }
            createOrFetchChat();
    }, [user, messanger]); // Create or fetch chat when user or messanger changes

    
    // Don't render anything until the component is mounted to avoid SSR issues
    if (!isMounted) return null;

    return (
        <div className="bg-[url('/Images/background.jpg')]">
            <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-100 border-b border-gray-200 rounded-2xl shadow-md w-full max-w-[700px] mx-auto">
                {/* Left profile image */}
                <img
                    src={userImage || "/Images/default_user_img.jpg"}
                    alt={user?.username}
                    className="w-12 h-12 rounded-full object-cover"
                />

                {/* Center text */}
                <div className="flex flex-col text-center flex-1 min-w-[150px]">
                    <p className="text-xl font-semibold">{user?.username}</p>
                    <p className="text-sm text-gray-500">{messanger?.username}</p>
                </div>

                {/* Right profile image */}
                <img
                    src={messangerImage || "/Images/default_user_img.jpg"}
                    alt={messanger?.username}
                    className="w-12 h-12 rounded-full object-cover"
                />

                {/* Home button */}
                <div>
                    <HomeButton className="w-12 h-12"/>
                </div>
            </div>

            {chat && sessionUser ? (
                <ChatWindow chat={chat} sessionUser={sessionUser} />
            ) : (
                <div>Loading chat...</div>
            )}
        </div>
    );
}

