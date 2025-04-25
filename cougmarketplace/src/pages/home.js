import "../app/globals.css";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';
import LoginPrompt from "../components/LoginPrompt";


export default function Home() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [images,setImages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagsMap, setTagsMap] = useState({});
  const [tagQuery, setTagQuery]= useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [unreadMessagesm , setUnreadMessages] = useState(0);
  const tagDropdownRef = useRef(null)
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);


  useEffect(() => {
    const checkUser = async () => {
      const { data, error} = await supabase.auth.getSession()

      if (error) {
        // Safely check for error before accessing message
        console.error("Error fetching user:", error?.message);
      } else if (!data?.session?.user) {
        setUser(null);
      } else {
        setUser(data.session.user); // The user object is in data.session.user
      }
      
    };

    checkUser();  
  }, [])

  // Get unread messages
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user) return; // Wait for user to be set

      const { data: chats, error: chatError } = await supabase
        .from('chat')
        .select('chat_id')
        .or(`user_1.eq.${user.id},user_2.eq.${user.id}`);

      if (chatError) {
        console.error("Error fetching chats:", chatError);
        return;
      }

      const chatIds = chats.map(chat => chat.chat_id);

      if (chatIds.length === 0) {
        console.log("No chats found for user.");
        return;
      }

      // Step 2: Fetch messages not from user and not yet viewed
      const { data: messages, error: messageError } = await supabase
        .from('message')
        .select('*')
        .in('chat_id', chatIds)
        .neq('sender_id', user.id)
        .eq('viewed', false);

      if (messageError) {
        console.error("Error fetching messages:", messageError);
      } else {
        console.log("Unviewed messages from other users:", messages);
      }
      setUnreadMessages(messages.length); // Set the unread messages count
    }
    fetchUnreadMessages();

    }, [user]);

  const handleLogout_Login = async () => {
      if(user){
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      } else {
        router.push("/"); // Redirect after logout
      }
    }
    else{
      router.push("/login");
    }

  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target)
      ) {
        setTagDropdownOpen(false);
      }
    }

    if (tagDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tagDropdownOpen]);
  // Fetch products, tags, and images
  useEffect(() => {
    const fetchProducts = async () => {
      const { data: allProducts, error: productError } = await supabase
        .from("product")
        .select("*");

      if (productError) {
        console.error("Error fetching products:", productError.message);
        return;
      }

      const { data: tagData, error: tagError } = await supabase
        .from("tag")
        .select("product_id, name");

      if (tagError) {
        console.error("Error fetching tags:", tagError.message);
        return;
      }

      const tagMap = {};
      tagData.forEach(({ product_id, name }) => {
        if (!tagMap[product_id]) tagMap[product_id] = [];
        tagMap[product_id].push(name);
      });

      const searchedProducts = searchTerm
        ? allProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : allProducts;

      const filteredProducts = selectedTags.length > 0
        ? searchedProducts.filter(p =>
            tagMap[p.product_id]?.some(tag => selectedTags.includes(tag))
          )
        : searchedProducts;

      setProducts(filteredProducts);

      const productTags = {};
      filteredProducts.forEach((p) => {
        productTags[p.product_id] = tagMap[p.product_id] || [];
      });
      setTagsMap(productTags);

      const imagePromises = filteredProducts.map(async (product) => {
        const { data: imagedata } = await supabase
          .from("images")
          .select("image")
          .eq("product_id", product.product_id)
          .limit(1);

        return [product.product_id, imagedata?.[0]?.image || null];
      });

      const imageResults = await Promise.all(imagePromises);
      setImages(Object.fromEntries(imageResults));

      const uniqueTags = [...new Set(tagData.map(t => t.name))];
      setAllTags(uniqueTags);
    };

    fetchProducts();
  }, [searchTerm, selectedTags]);



  const goToHome = () => {
    router.push("/");
  };

  const goToProduct = (id) => {
    router.push(`/product?id=${id}`);
  };  


  const goToUser = () =>{
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    router.push(`/profile`)
  };

  const goToMyProducts = () => {
      if (!user) {
        setShowLoginPrompt(true);
        return;
      }
    router.push('/myProducts');
  };  

  const createProduct = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    router.push('/createProduct');
  }

  const goToChat = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    router.push('/chats');
  }

  const goToWishList = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    router.push('/myWishlist');
  }




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
        
        <div className="UserInfo flex flex-col w-2/12 sm:w-2/12 md:w-2/12 lg:w-1/12 xl:w-1/12 gap-4 justify-start items-center p-0 sm:p-1 md:p-2 lg:p-3 xl:p-4 m-4 bg-gray-400 rounded ml-auto">
          
          <div className="User flex">

            {user ? (
            <p className="text-xs text-gray-900 font-bold"> Logged in as {user.email}</p>
             ) : (
              <p>No Active User</p>
              )}

          </div>

        <div className="Logout flex flex-col gap-2 justify-center items-center">

          <div className="">
          <button
            onClick={handleLogout_Login}
            className="bg-red-800 hover:bg-red-900 text-white text-xs rounded w-20 h-8 flex items-center justify-center"
          >
            Log in / Log out
          </button>
          </div>


          <div className="">
          
          <button 
            onClick={goToUser}
           className="bg-red-800 hover:bg-red-900 text-white text-xs rounded w-20 h-8 flex items-center justify-center"
           >Edit Profile</button>
          <LoginPrompt
            visible={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
          />
          </div>

          <div className="">
            <button onClick={createProduct} 
            className="bg-red-800 hover:bg-red-900 text-white text-xs rounded w-20 h-8 flex items-center justify-center"
            >Create Product</button>
            <LoginPrompt
              visible={showLoginPrompt}
              onClose={() => setShowLoginPrompt(false)}
            />
          </div>

          <div className="">
          <button onClick={goToMyProducts} className="bg-red-800 hover:bg-red-900 text-white text-xs rounded w-20 h-8 flex items-center justify-center">
            My Products
            </button>
            
            <LoginPrompt
            visible={showLoginPrompt}
            onClose={() => setShowLoginPrompt(false)}
            />
            </div>
          
          {/* <div className="Logout flex justify-center items-center w-1/2 bg-red-800 hover:bg-red-900 rounded">

          <button onClick={() => router.push('/viewProfile')} className="text-base text-center text-white">View Profile</button>


          </div> */}

          <div className="">
            <button onClick={goToChat} 
            className="bg-red-800 hover:bg-red-900 text-white text-xs rounded w-20 h-8 flex items-center justify-center"
            >Messages ({unreadMessagesm} unread) 
            </button>
            <LoginPrompt
              visible={showLoginPrompt}
              onClose={() => setShowLoginPrompt(false)}
          />
          </div>

          <div className="">
          <button onClick={goToWishList} className="bg-red-800 hover:bg-red-900 text-white text-xs rounded w-20 h-8 flex items-center justify-center">Wishlist</button>
          </div>

        </div>
        </div>

        <div href="/" className=" absolute top-0 left-0 m-4">
        <button onClick={goToHome} className="rounded-full p-2 bg-white flex items-center justify-center">
            <Image
            src="/Images/washington-state-logo-png-transparent.png" 
            alt="HomeButton" 
            layout= "fixed"
            width={48}
            height={48}
            quality={100}
            className="h-6 w-6"
            />
        </button>
            
        </div>

       <div className="bg-gray-400 bg-opacity-75 p-8 rounded-lg shadow-lg text-white absolute top-0 left-1/2 transform -translate-x-1/2 m-4 z-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>
            COUG MARKETPLACE
          </h1>
          <SearchBar setSearchTerm={setSearchTerm} />
          <TagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            tagDropdownOpen={tagDropdownOpen}
            setTagDropdownOpen={setTagDropdownOpen}
            tagQuery={tagQuery}
            setTagQuery={setTagQuery}
          />
         
        </div>
      </div>


      {/* The cool Products */}
      <div className="p-8 mt-40">

        <h2 className="text-3xl font-bold text-grey mb-6">Listed Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {images[product.product_id] ? (
                <img
                  src={images[product.product_id]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">No Image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm truncate">{product.description}</p>
                <p className="text-red-600 font-bold mt-2">${product.price?.toFixed(2)}</p>

                {/* tag display */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {tagsMap[product.product_id]?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => goToProduct(product.product_id)}
                  className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div> 

    </div>
  );
}
