import "../app/globals.css";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";
import HomeButton from "../components/HomeButton";

export default function Chats() {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [chatIds, setChatIds] = useState([]); // State to hold chat IDs
    const [chatInfo, setChatInfo] = useState([]); // State to hold chat information
    const [chatInfoMessageData, setChatInfoMessageData] = useState([]); // State to hold chat information with message data
    const [fullChatInfo, setFullChatInfo] = useState([]); // State to hold full chat information

    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error("Error fetching user:", error?.message);
                router.push("/login");
            } else if (!data?.session?.user) {
                router.push("/login");
            } else {
                setUser(data.session.user)
            }
        };
        checkUser();
    }
    , [])

    // Fetch chat IDs for the logged-in user
    useEffect(() => {
        if (!user) return; // Wait for user to be set
        const fetchChatIds = async () => {
            try {
                const { data, error } = await supabase
                    .from('chat')
                    .select('chat_id')
                    .or(`user_1.eq.${user.id},user_2.eq.${user.id}`);

                if (error) {
                    console.error('Error fetching chat IDs:', error.message);
                } else {
                    setChatIds(data.map(chat => chat.chat_id)); // Set the chat IDs to state
                }
            } catch (error) {
                console.error('Error fetching chat IDs:', error.message);
            }
        };

        fetchChatIds();
    }, [user]);

    // Fetch chat information for each chat ID
    useEffect(() => {
        if (chatIds.length === 0) return; // Wait for chat IDs to be set

        const fetchChatInfo = async () => {
            try {
                const chatInfoPromises = chatIds.map(async (chatId) => {
                    const { data, error } = await supabase
                        .from('chat')
                        .select('*')
                        .eq('chat_id', chatId)
                        .single();

                    if (error) {
                        console.error(`Error fetching chat info for ${chatId}:`, error.message);
                        return null;
                    } else {
                        return data; // Return the chat information
                    }
                });

                let chatInfoArray = await Promise.all(chatInfoPromises);
                chatInfoArray = chatInfoArray.filter(info => info !== null); // Filter out nulls

                const newChatInfo = chatInfoArray.map((info) => ({
                    chatId: info.chat_id,
                    user1: info.user_1,
                    user2: info.user_2,
                    user1Username: null,
                    user2Username: null,
                    lastMessage: null,
                    unreadMessages: null,
                  }));
                  
                  // removes duplicate chat IDs
                  const uniqueChatInfo = [];
                  const seen = new Set();
                  
                  for (const chat of newChatInfo) {
                    if (!seen.has(chat.chatId)) {
                      seen.add(chat.chatId);
                      uniqueChatInfo.push(chat);
                    }
                  }

                setChatInfo(uniqueChatInfo); // Set the chat information to state

                console.log('Chat information:', chatInfo); // Log the chat information
            } catch (error) {
                console.error('Error fetching chat information:', error.message);
            }
        };

        if (chatIds.length > 0) {
            fetchChatInfo();
        }
    }, [chatIds]);

    // fetch last message and unread message count for each chat
    useEffect(() => {
        if (chatIds?.length === 0 || chatInfo?.length === 0) return; // Wait for chat IDs to be set

        const fetchLastMessageAndUnreadCount = async () => {
            try {
                const lastMessagePromises = chatIds.map(async (chatId) => {
                    const { data, error } = await supabase
                        .from('message')
                        .select('*')
                        .eq('chat_id', chatId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    if (error) {
                        console.error(`Error fetching last message for ${chatId}:`, error.message);
                        return null;
                    } else {
                        return { chatId, message: data }; // Return the last message
                    }
                });

                const lastMessagesResults = await Promise.all(lastMessagePromises);
                const lastMessageMap = new Map();
                lastMessagesResults.forEach((res) => {
                if (res && res.chatId && res.message) {
                    lastMessageMap.set(res.chatId, res.message.message);
                }
                });

                const unreadCountPromises = chatIds.map(async (chatId) => {
                    const { data, error } = await supabase
                        .from('message')
                        .select('*')
                        .eq('chat_id', chatId)
                        .neq('sender_id', user.id) // Exclude messages sent by the logged-in user
                        .eq('viewed', false);

                    if (error) {
                        console.error(`Error fetching unread count for ${chatId}:`, error.message);
                        return null;
                    } else {
                        return { chatId, count: data.length }; // Return the unread message count
                    }
                });

                const unreadCountsResults = await Promise.all(unreadCountPromises);
                const unreadCountMap = new Map();
                unreadCountsResults.forEach((res) => {
                if (res && res.chatId) {
                    unreadCountMap.set(res.chatId, res.count);
                }
                });

                const updatedChatInfo = chatInfo.map((info) => ({
                    ...info,
                    lastMessage: lastMessageMap.get(info.chatId) || null,
                    unreadMessages: unreadCountMap.get(info.chatId) || 0,
                  }));

                setChatInfoMessageData(updatedChatInfo); // Set the updated chat information to state
                console.log('Updated chat information:', updatedChatInfo); // Log the updated chat information

            } catch (error) {
                console.error('Error fetching last message and unread count:', error.message);
            }
        };

        if (chatIds.length > 0) {
            fetchLastMessageAndUnreadCount();
        }
    }, [chatIds, chatInfo]);

    // get usernames for each user in the chat
    useEffect(() => {
        if (!chatInfoMessageData?.length) return; // Wait for chatInfoMessageData to be set

        const fetchUsernames = async () => {
            try {
                const userPromises = chatInfoMessageData.map(async (chat) => {
                    const { data: user1Data, error: user1Error } = await supabase
                        .from('user')
                        .select('username')
                        .eq('id', chat.user1)
                        .single();

                    const { data: user2Data, error: user2Error } = await supabase
                        .from('user')
                        .select('username')
                        .eq('id', chat.user2)
                        .single();

                    if (user1Error || user2Error) {
                        console.error(`Error fetching usernames for chat ${chat.chatId}:`, user1Error?.message || user2Error?.message);
                        return null;
                    } else {
                        return {
                            ...chat,
                            user1Username: user1Data.username,
                            user2Username: user2Data.username,
                        };
                    }
                });

                const usernamesResults = await Promise.all(userPromises);
                const filteredUsernames = usernamesResults.filter((res) => res !== null); // Filter out nulls

                setFullChatInfo(filteredUsernames); // Set the full chat information to state
                console.log('Full chat information with usernames:', filteredUsernames); // Log the full chat information

            } catch (error) {
                console.error('Error fetching usernames:', error.message);
            }
        }
        fetchUsernames();
    }, [chatInfoMessageData]); // This effect runs when chatInfoMessageData changes

    // navigate to chat page
    const navigateToChat = (user1, user2) => {
        if (!user1 || !user2) return; // Check if user1 and user2 are valid
        if (user1 === user.id) {
            router.push(`/message?messangerId=${user2}`);
        }
        else if (user2 === user.id) {
            router.push(`/message?messangerId=${user1}`);
        } else {
            console.error('Invalid user IDs:', user1, user2);
            return;
        }
    };

    return (
        <div className="min-h-screen bg-[url('/Images/dacoogasbg.png')]">
            <div className="flex gap-16 justify-between items-center p-4 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold">Chats</h1>
                <HomeButton />
            </div>

            <div className="w-full max-w-4xl mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fullChatInfo.map((chat, index) => (
                    <div
                    key={index}
                    className="bg-white border rounded-xl shadow-md p-4 space-y-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigateToChat(chat.user1, chat.user2)}
                    data-chat-id={chat.chatId}
                    >
                    <div className="flex justify-between text-med font-bold">
                        <span className="text-gray-700">{chat.user1Username || '—'}</span>
                        <span className="text-gray-700">{chat.user2Username || '—'}</span>
                    </div>

                    <p className="text-sm">
                        <span className="font-medium text-gray-700">
                        {chat.lastMessage || (
                            <span className="text-gray-400 italic">No message yet</span>
                        )}
                        </span>
                    </p>

                    <p className="text-sm">
                        Unread Messages:{' '}
                        <span className="font-medium text-red-500">
                        {chat.unreadMessages !== null ? chat.unreadMessages : '—'}
                        </span>
                    </p>
                    </div>
                ))}
                </div>
            </div>
        </div>

    )
}