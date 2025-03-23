import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function Product() {
    const [images, setImages] = useState([]);
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch images and data for the product
    useEffect(() => {
        if (!id) return;  // If `id` is not yet available, don't fetch data

        const fetchImages = async () => {
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

        fetchImages();
    }, [id]);

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

    return (
        <div>
            <div className="relative w-full mt-8">

                {/* Carousel wrapper */}
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
                <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 space-x-2">
                    {images.map((_, index) => (
                        <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                            currentIndex === index ? "bg-white" : "bg-gray-400"
                        }`}
                        ></button>
                    ))}
                </div>

            </div>
        </div>
    

    )
}