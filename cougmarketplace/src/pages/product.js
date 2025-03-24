import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import ProductPreview from "@/components/ProductPreview";

export default function Product() {
    const [images, setImages] = useState([]);
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [tags, setTags] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

    const handleViewProduct = () => {
        // Navigate to the product page
    }

    // Fetch seller data and tages
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
        if (images.length === 0) return;  // If there are no images, don't do anything

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
    }, []);

    const navigateToSeller = (e) => {
        e.preventDefault();
        // navigate to the seller's profile once it's implemented
    };

    const makeAnOffer= () => {
        // Add the product to the cart
    };

    return (
        <body style={{ backgroundColor: "#f7fafc" }} className="container mx-auto px-4 py-8 bg-gray-100">
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
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full ${
                                        currentIndex === index ? "bg-gray-200" : "bg-gray-400"
                                    }`}
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
                            <button
                                onClick={makeAnOffer}
                                className="bg-red-600 text-white px-6 py-2 text-medium font-medium rounded-lg shadow hover:bg-red-700 transition-all flex-shrink-1 whitespace-nowrap"
                            >
                                Make an Offer
                            </button>
                            
                            <button
                                onClick={makeAnOffer}
                                className="bg-red-600 text-white px-6 py-2 text-medium font-medium rounded-lg shadow hover:bg-red-700 transition-all flex-shrink-1 whitespace-nowrap"
                            >
                                Add to Wishlist
                            </button>
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
            <div className="mt-8 text-lg">
                <p className="text-gray-700">
                    Check out similar products
                </p>
                
                {/* Link to Seller's Other Products */}
                <a
                    onClick={navigateToSeller} // Assume you have a function to handle this navigation
                    className="text-red-600 hover:underline cursor-pointer mt-2"
                >
                </a>
            </div>

        </body>
    )
}