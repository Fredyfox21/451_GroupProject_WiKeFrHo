import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

export default function MyProducts() {
  const [user, setUser] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
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
    const fetchMyProducts = async () => {
      if (!user) return;

      const { data: products, error } = await supabase
        .from("product")
        .select("*")
        .eq("seller_id", user.id);

      if (error) {
        console.error("Error fetching user's products:", error.message);
        return;
      }

      setMyProducts(products);

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

    fetchMyProducts();
  }, [user]);

  const goToEditProduct = (id) => {
    router.push(`/editProduct?id=${id}`);
  };

  const goToHome = () => {
    router.push("/home");
  };

  return (
    <div className="MainPage">
      {/* Background Image */}
      <Image
        src="/Images/pexels-boomheadshot-31139015.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-[-1] opacity-100"
      />

      {/* Header Section - Made smaller and moved up */}
      <div className="bg-gray-400 bg-opacity-75 p-4 rounded-lg shadow-lg text-white mx-auto mt-2 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center" style={{ fontFamily: 'Orbitron' }}>
          MY PRODUCTS
        </h1>
      </div>

      {/* Home Button */}
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

      {/* Main Content - Moved closer to top */}
      <div className="p-6 mt-20"> {/* Reduced mt from 32 to 20 */}
        <h2 className="text-2xl font-bold text-black mb-4 ml-2">My Listed Products</h2>

        {myProducts.length === 0 ? (
          <p className="text-gray ml-2">You haven't listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Reduced gap from 6 to 4 */}
            {myProducts.map(product => (
              <div key={product.product_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {images[product.product_id] ? (
                  <img
                    src={images[product.product_id]}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-300 flex items-center justify-center"> {/* Reduced h from 48 to 40 */}
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
                <div className="p-3"> {/* Reduced from p-4 to p-3 */}
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3> {/* Reduced from xl to lg */}
                  <p className="text-gray-600 text-xs truncate">{product.description}</p> {/* Reduced from sm to xs */}
                  <p className="text-red-600 font-bold mt-1">${product.price?.toFixed(2)}</p> {/* Reduced mt from 2 to 1 */}
                  <button
                    onClick={() => goToEditProduct(product.product_id)}
                    className="mt-2 w-full bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}