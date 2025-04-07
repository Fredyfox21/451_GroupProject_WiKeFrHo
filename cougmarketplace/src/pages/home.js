import "../app/globals.css";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";


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
  const tagDropdownRef = useRef(null)
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
    router.push(`/profile`)
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
          
          <button 
            onClick={goToUser}
           className="text-base text-center text-white">Edit Profile</button>

          </div>

          <button onClick={() => router.push('/createProduct')} className="text-base text-center text-white">Create Product</button>
          
          <div>

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

       <div className="bg-gray-400 bg-opacity-75 p-8 rounded-lg shadow-lg text-white absolute top-0 left-1/2 transform -translate-x-1/2 m-4 z-10 w-full max-w-3xl">
          <h1 className="text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>
            COUG MARKETPLACE
          </h1>

          {/* search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchTerm(e.target.search.value.trim());
            }}
          >
            <input
              type="text"
              name="search"
              placeholder="Search for products..."
              className="w-full p-2 rounded bg-gray-500 text-white placeholder-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </form>

          {/* Tag Filter Dropdown */}
          <div className="relative mt-4 w-full">
            <button
              type="button"
              onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
              className="w-full text-left bg-white border border-gray-300 rounded p-2 text-gray-700 hover:ring-2 ring-red-400 focus:outline-none"
            >
              {selectedTags.length > 0
                ? `Filter tags (${selectedTags.length})`
                : "Select tags"}
            </button>

            {tagDropdownOpen && (
              <div
                ref={tagDropdownRef}
                className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg"
              >
                {/* Tag Search */}
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search tags..."
                    onChange={(e) => setTagQuery(e.target.value)}
                    className="w-full p-2 rounded bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Tag Options */}
                <div className="max-h-30 overflow-y-auto divide-y divide-gray-100">
                  <div className="grid grid-cols-1 gap-1">
                    {allTags
                      .filter(tag => tag.toLowerCase().includes(tagQuery.toLowerCase()))
                      .map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <div
                            key={tag}
                            onClick={() => {
                              setSelectedTags(
                                isSelected
                                  ? selectedTags.filter(t => t !== tag)
                                  : [...selectedTags, tag]
                              );
                            }}
                            className={`cursor-pointer px-4 py-2 text-sm ${
                              isSelected
                                ? "bg-red-200 text-gray-800 font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {tag}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Selected Tags */}
                <div className="p-2 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() =>
                            setSelectedTags(selectedTags.filter(t => t !== tag))
                          }
                          className="ml-2 text-white hover:text-gray-200"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
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
