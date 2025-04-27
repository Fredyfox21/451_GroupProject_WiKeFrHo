import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

export default function ViewProfile() {
    // section to show their own data
    // section to input other person's username to see their data
    const [viewUser, setViewUser] = useState('')
    const [userInfo, setUserInfo] = useState(null)
    const [products, setProducts] = useState([])
    const [images, setImages] = useState([])
    const [tagsMap, setTagsMap] = useState({})
    const [PFP, setPFP] = useState(null)
  
    const router = useRouter()
    
    // const getCurrentUser = async () => {
    //     const {data, error} = await supabase.auth.getSession()
    //     if (error) {
    //         // Safely check for error before accessing message
    //         console.error("Error fetching user:", error?.message);
    //         router.push("/login");
    //         return null
    //     } else if (!data?.session?.user) {
    //         console.error("How is there no user in this session at this point"); // how
    //         return null
    //     } else {
    //         console.log("User Info: ", data.session.user)
    //         const {data: userData, error} = await supabase.from('user').select('username').eq('id', data.session.user.id).single() // gets username of current person
    //         console.log("Function User Data: ", userData)
    //         if (error) {
    //             console.error("Failed to get username", error)
    //         }
            
    //         return userData.username   
    //     }
    //   };

    useEffect(() => {
      const handleImages = async () => {
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


      }
      handleImages()
    }, [products]);
    
    useEffect(() => {
      const getProducts = async () => {
        const { data: allProducts, error: productError } = await supabase
          .from("product")
          .select("*")
          .eq('seller_id',userInfo?.id);


        if (productError) {
          console.log("Error fetching products: ", productError)
          return
        }
        console.log("All Products: ",)
        if (productError) {
          console.error("Error fetching products:", productError.message);
          return;
        }

        setProducts(allProducts);
        
      };
      getProducts()
    }, [userInfo])

    useEffect(() => {
      const handleView = async () => {
          
          // display information

          const {data: info, error: error} = await supabase.from('user').select().eq('username', viewUser).single()
          if (error) {
              console.error("No User Info ", error)
          }
          else {
              console.log("Bio???? : ", info.bio)
              console.log("User Information: ", info)
              setUserInfo(info)
          }
          console.log("USER INFOOOO: ",userInfo)
      }
      handleView()
    }, [viewUser])


    const goToProduct = (id) => {
      router.push(`/product?id=${id}`);
    };  

    const goToHome = () => {
      router.push("/home");
    };

    return ( 
        <div>
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
        <div className="bg-gray-400 bg-opacity-75 p-8 rounded-lg shadow-lg w-400 text-white">
            <h1 className="text-red-700 text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>View Profile</h1>
                <input
                    placeholder="Search for profile..."
                    value={viewUser}
                    onChange={(e) => setViewUser(e.target.value)}
                    className="w-full p-2 rounded bg-gray-500 text-white placeholder-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"

                    />


                <br></br>

                <text>
                    Bio: {userInfo?.bio}
                    <br></br>
                    First Name: {userInfo?.FirstName}
                    <br></br>
                    Last Name: {userInfo?.LastName}
                </text>

                
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
        </div>

    )
}