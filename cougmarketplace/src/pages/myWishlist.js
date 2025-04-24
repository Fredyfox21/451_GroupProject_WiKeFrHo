import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";
import WishlistButton from "@/components/WishlistButton";

export default function WishlistedProducts() {
  const [user, setUser] = useState(null);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [images, setImages] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        console.error("Error fetching user:", error?.message);
        router.push("/login");
      } else {
        setUser(data.session.user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {

    const fetchWishlistProducts = async () => {

        if (!user) return;

        //Get wishlist entries
        const { data: wishlistEntries, error: wishlistError } = await supabase
            .from("wishList")
            .select("product_id")
            .eq("user_id", user.id);
        if (wishlistError) {
            console.error("Error fetching wishlist:", wishlistError.message);
            return;
        }

        const productIds = wishlistEntries.map((entry) => entry.product_id); 

        if (productIds.length === 0) {
            setWishlistProducts([]);
            return;
        }

        // Get product info
        const { data: products, error: productError } = await supabase
            .from("product")
            .select("*")
            .in("product_id", productIds);

        if (productError) {
            console.error("Error fetching wishlisted products:", productError.message);
            console.log("Fetched productIds:", productIds);
            return;
        }

        setWishlistProducts(products);

        // images
        const imagePromises = products.map(async (product) => {
            const { data: imageData } = await supabase
            .from("images")
            .select("image")
            .eq("product_id", product.product_id)
            .limit(1);
            return [product.product_id, imageData?.[0]?.image || null];
        });

        const imageResults = await Promise.all(imagePromises);
        setImages(Object.fromEntries(imageResults));
    };

    fetchWishlistProducts();
  }, [user]);

  const goToHome = () => {
    router.push("/home");
  };

  return (
    <div className="MainPage">
      <Image
        src="/Images/pexels-boomheadshot-31139015.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-[-1] opacity-100"
      />

      <div className="bg-gray-400 bg-opacity-75 p-4 rounded-lg shadow-lg text-white mx-auto mt-2 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center" style={{ fontFamily: 'Orbitron' }}>
          WISHLISTED PRODUCTS
        </h1>
      </div>

      <div className="inline-block p-2 bg-gray-200 rounded-full hover:bg-gray-300 absolute top-0 left-0 m-4">
        <button onClick={goToHome}>
          <Image
            src="/Images/washington-state-logo-png-transparent.png"
            alt="HomeButton"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>
      </div>

      <div className="p-6 mt-20">
        <h2 className="text-2xl font-bold text-black mb-4 ml-2">Your Wishlist ({wishlistProducts.length})</h2>

        {wishlistProducts.length === 0 ? (
          <p className="text-gray ml-2">You haven't wishlisted any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistProducts.map(product => (
              <div key={product.product_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {images[product.product_id] ? (
                  <img
                    src={images[product.product_id]}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-gray-600 text-xs truncate">{product.description}</p>
                  <p className="text-red-600 font-bold mt-1">${product.price?.toFixed(2)}</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick = {() => router.push(`/product?id=${product.product_id}`)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                    >
                      View Product
                    </button>

                    <WishlistButton user={user} product={product}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        )}
      </div>
    </div>
  );
}
