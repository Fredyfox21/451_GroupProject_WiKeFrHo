import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from 'next/image';
import WishlistButton from "@/components/WishlistButton";
import LoginPrompt from "../components/LoginPrompt";

export default function Product() {
    const [images, setImages] = useState([]);
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [tags, setTags] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false); // For handling hydration
    const [user, setUser] = useState(null); // For handling user session
    const [similarProducts, setSimilarProducts] = useState([]); // for similar products
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Hydration check to ensure component only renders client-side
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get the user session on component mount
    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
                console.error("Error fetching user:", error?.message);
            } else if (!data?.session?.user) {
                console.error("Error fetching user:", error?.message);
            } else {
                setUser(data.session.user)
            }
        };
        checkUser();
    }, []);

    // Fetch images and data for the product
    useEffect(() => {
        if (!id) return;  // If `id` is not yet available, don't fetch data

        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('images')
                    .select('image')
                    .eq('product_id', id);

                if (error) {
                    console.error('Error fetching images:', error.message);
                } else {
                    setImages(data.map((image) => image.image)); 

                    // Fetch product data
                    const { data: productData, error: productError } = await supabase
                        .from('product')
                        .select('*')
                        .eq('product_id', id);
                    if (productError) {
                        console.error('Error fetching product:', productError.message);
                    } else {
                        setProduct(productData[0]);  
                        console.log(productData[0]);
                    }
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        };

        fetchData();
    }, [id]);

    // Fetch seller data and tags
    useEffect(() => {
        if (!product) return;  // If `product` is not yet available, don't fetch data

        const fetchSeller = async () => {
            try {
                const { data, error } = await supabase
                    .from('user')
                    .select('username')
                    .eq('id', product.seller_id);

                if (error) {
                    console.error('Error fetching seller:', error.message);
                } else {
                    setSeller(data[0]);

                    // Fetch tags
                    const { data: tagData, error: tagError } = await supabase
                        .from('tag')
                        .select('name')
                        .eq('product_id', product.product_id);
                    if (tagError) {
                        console.error('Error fetching tags:', tagError.message);
                    } else {
                        setTags(tagData.map((tag) => tag.name));
                    }
                }
            } catch (error) {
                console.error('Error:', error.message);
            }
        };

        fetchSeller();
    }, [product]);

    // Go to the next slide
    const nextSlide = () => {
        if (images.length === 0) return;

        setCurrentIndex((prevIndex) =>
            (prevIndex + 1) % images.length
        );
    };

    // Go to the previous slide
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex === 0) {
                return images.length - 1;
            } else {
                return (prevIndex - 1) % images.length;
            }
        });
    };

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [images]);

    const navigateToSeller = (e) => {
        e.preventDefault();
        // Navigate to the seller's profile once it's implemented
    };

    const makeAnOffer = () => {
        //if the current user is not logged in
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        // Add the product to the cart
        if (product.seller_id == null) return;

        if (user && product.seller_id == user.id) return;

        router.push('/message?messangerId=' + product.seller_id);
    };

    useEffect(() => {
        if (tags.length === 0 || !product) return;
    
        const fetchSimilarProducts = async () => {
            try {
                const { data: similarTagEntries, error } = await supabase
                    .from('tag')
                    .select('product_id')
                    .in('name', tags);
    
                if (error) {
                    console.error('Error fetching similar product tags:', error.message);
                    return;
                }
    
                const relatedProductIds = [...new Set(
                    similarTagEntries
                        .map(entry => entry.product_id)
                        .filter(pid => pid !== product.product_id)
                )];
    
                if (relatedProductIds.length === 0) {
                    setSimilarProducts([]);
                    return;
                }   
    
                const { data: similarProductsData, error: similarProductsError } = await supabase
                    .from('product')
                    .select('*')
                    .in('product_id', relatedProductIds);
    
                if (similarProductsError) {
                    console.error('Error fetching similar products:', similarProductsError.message);
                } else {
                    setSimilarProducts(similarProductsData);
                }
            } catch (error) {
                console.error('Unexpected error fetching similar products:', error.message);
            }
        };
    
        fetchSimilarProducts();
    }, [tags, product]);


    // Don't render anything until the component is mounted to avoid SSR issues
    if (!isMounted) return null;

    return (
        
        <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/Images/pexels-boomheadshot-31139015.jpg')" }}>

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

            <div className="container mx-auto px-4 py-8 bg-gray">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side - Product Info and Gallery */}
                <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    {/* Carousel Wrapper */}
                    <div className="relative w-full mt-8">
                        <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
                            <img
                                src={images[currentIndex]}
                                alt={`Slide ${currentIndex + 1}`}
                                className="absolute block w-full h-full object-contain object-center transition-opacity duration-700 ease-in-out"
                            />
                        </div>

                        {/* Previous Button */}
                        <button
                            onClick={prevSlide}
                            className="absolute top-1/2 left-4 z-30 -translate-y-1/2 px-4 py-2 bg-white/50 rounded-full shadow-md hover:bg-white/70 transition-all"
                        >
                            <svg
                                className="w-6 h-6 text-gray-800"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 6 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 1 1 5l4 4"
                                />
                            </svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="absolute top-1/2 right-4 z-30 -translate-y-1/2 px-4 py-2 bg-white/50 rounded-full shadow-md hover:bg-white/70 transition-all"
                        >
                            <svg
                                className="w-6 h-6 text-gray-800"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 6 10"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 9 4-4-4-4"
                                />
                            </svg>
                        </button>

                        {/* Dots Navigation */}
                        <div className="flex justify-center mt-4 space-x-2">
                            {images.length != 0 && images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full ${currentIndex === index ? "bg-gray-200" : "bg-gray-400"}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Editable Div */}
                <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-evenly">
                    {/* Product Name */}
                    <h1 className="text-4xl font-bold text-gray-800">{product && product.name}</h1>

                    {/* Product Description */}
                    <p
                        className="text-lg text-gray-600 mt-4 mb-8 w-full h-24 overflow-hidden text-ellipsis"
                    >
                        {product && product.description?.length > 300
                            ? product.description.slice(0, 300) + "..."
                            : product?.description}
                    </p>

                    {/* Price and Add to Cart Button */}
                    <div className="flex justify-start space-x-4 mt-4 w-full flex-col">
                        <span className="text-3xl font-bold text-gray-800">
                            ${product && product.price?.toFixed(2)}
                        </span>

                        <div className="flex gap-4 mt-4">

                            {user && product && user.id === product.seller_id ? (

                                <button
                                    onClick={() => router.push(`/editProduct?id=${product.product_id}`)}
                                    className="bg-red-600 text-white px-6 py-2 text-medium font-medium rounded-lg shadow hover:bg-red-700 transition-all"
                                >
                                    Edit Product
                                </button>
                            ) : (
                                <>
                                    <button
                                    onClick={makeAnOffer}
                                    className="bg-red-600 text-white px-6 py-2 text-medium font-medium rounded-lg shadow hover:bg-red-700 transition-all flex-shrink-1 whitespace-nowrap"
                                    >
                                        Make an Offer
                                    </button>

                                    <WishlistButton user={user} product={product}/>


                                    <LoginPrompt
                                        visible={showLoginPrompt}
                                    onClose={() => setShowLoginPrompt(false)}
                                    />
                                </>
                            
                            )}

                        </div>
                    </div>

                    {/* Seller Info */}
                    <div className="mt-2 text-lg">
                        <div>
                            <a
                                onClick={navigateToSeller}
                                className="text-red-600 hover:underline cursor-pointer"
                            >
                                {seller && seller.username}
                            </a>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="flex flex-wrap gap-2 mt-8">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
            {/* This is for simialr postings */}
            <h2 className="text-3xl font-bold text-white mb-4">Recommended Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-5">
                {similarProducts.map((simProduct) => (
                    <div
                        key={simProduct.product_id}
                        className="bg-white p-4 rounded-lg shadow hover:bg-gray-200 shadow-lg transition"
                        onClick={() => router.push(`/product?id=${simProduct.product_id}`)}
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            {simProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm truncate">
                            {simProduct.description}
                        </p>
                        <p className="text-red-600 font-bold mt-2">
                            ${simProduct.price?.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
            </div>
            
        </div>
    )
}
