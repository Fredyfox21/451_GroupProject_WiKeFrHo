import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

export default function ViewProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [tagsMap, setTagsMap] = useState({});
  const [PFP, setPFP] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { id } = router.query; // Get the id from the URL if it exists
  
        let userId = id;
  
        if (!userId) {
          // If no id provided, fallback to session user
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData.session?.user) {
            console.error("No session found:", sessionError);
            router.push('/login');
            return;
          }
          userId = sessionData.session.user.id;
        }
  
        // Fetch user info
        const { data: info, error: userError } = await supabase
          .from('user')
          .select('*')
          .eq('id', userId)
          .single();
  
        if (userError || !info) {
          console.error("Failed to fetch user information:", userError);
          setUserInfo(null);
          setPFP(null);
          setProducts([]);
          return;
        }
  
        setUserInfo(info);
  
        // Fetch profile picture from userImage table
        const { data: userImageData, error: userImageError } = await supabase
          .from('userImage')
          .select('image')
          .eq('user_id', info.id)
          .single();
  
        if (userImageError || !userImageData) {
          console.warn("No profile picture found:", userImageError?.message);
          setPFP(null);
        } else {
          setPFP(userImageData.image || null);
        }
  
        // Fetch products
        const { data: allProducts, error: productError } = await supabase
          .from('product')
          .select('*')
          .eq('seller_id', info.id);
  
        if (productError) throw productError;
  
        setProducts(allProducts || []);
      } catch (err) {
        console.error("Error loading profile:", err.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (router.isReady) {
      fetchProfile(); // Only run after the router is ready (important)
    }
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    const handleImages = async () => {
      if (!products.length) {
        setImages([]);
        setTagsMap({});
        return;
      }

      const imagePromises = products.map(async (product) => {
        const { data: imagedata } = await supabase
          .from("images")
          .select("image")
          .eq("product_id", product.product_id)
          .limit(1);

        return [product.product_id, imagedata?.[0]?.image || null];
      });

      const imageResults = await Promise.all(imagePromises);
      setImages(Object.fromEntries(imageResults));

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

      const productTags = {};
      products.forEach((p) => {
        productTags[p.product_id] = tagMap[p.product_id] || [];
      });
      setTagsMap(productTags);
    };
    handleImages();
  }, [products]);

  const goToProduct = (id) => {
    router.push(`/product?id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/Images/pexels-boomheadshot-31139015.jpg')" }}>
      {/* Home button */}
      <div href="/" className=" absolute top-0 left-0 m-4">
        <button onClick={() => router.push("/home")} className="rounded-full p-2 bg-white flex items-center justify-center">
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

      <div className="bg-gray-400 bg-opacity-75 rounded-lg shadow-lg max-w-5xl mx-auto text-white">
        <h1 className="text-white text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>
          My Profile
        </h1>

        {/* User Info */}
        {userInfo && (
          <div className="flex flex-col items-center mb-10">
            {/* Profile picture */}
            {PFP ? (
              <Image
                src={PFP}
                alt="Profile Picture"
                width={150}
                height={150}
                className="rounded-full object-cover mb-4"
              />
            ) : (
              <div className="bg-gray-300 rounded-full w-36 h-36 flex items-center justify-center text-gray-600 mb-4">
                No Profile Picture
              </div>
            )}

            <div className="text-center space-y-2">
              <p><strong>Username:</strong> {userInfo.username}</p>
              <p><strong>Name:</strong> {userInfo.FirstName+" "+ userInfo.LastName}</p>
              <p><strong>Bio:</strong> {userInfo.bio || "No bio available"}</p>
              <p><strong>Email:</strong> {userInfo.email || "No email available"}</p>
            </div>
          </div>
        )}

        {/* Listed Products */}
        {products.length > 0 && (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-grey mb-6 text-center">My Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
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
                  <div className="p-4 text-black">
                    <h3 className="text-xl font-semibold truncate">{product.name}</h3>
                    <p className="text-gray-600 text-sm truncate">{product.description}</p>
                    <p className="text-red-600 font-bold mt-2">${product.price?.toFixed(2)}</p>

                    {/* Tags */}
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

                    {/* View Product Button */}
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
        )}
      </div>
    </div>
  );
}
