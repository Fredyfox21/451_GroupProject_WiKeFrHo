import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function WishlistButton({ user, product }) {

    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        
        const checkWishlist = async () => {
            if (!user || !product) return;

            const { data, error } = await supabase
                .from('wishList')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.product_id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error checking wishlist:", error.message);
            } else {
                setIsWishlisted(!!data);
            }
        };

        checkWishlist();
    }, [user, product]);

    const toggleWishlist = async () => {
        if (!user || !product) return;

        const newWishlistedState = !isWishlisted;
        setIsWishlisted(newWishlistedState);

        if (newWishlistedState) {
            const { error } = await supabase
                .from('wishList')
                .insert([{ user_id: user.id, product_id: product.product_id }]);

            if (error) {
                console.error("Error adding to wishlist:", error.message);
                setIsWishlisted(false);
            }
        } else {
            const { error } = await supabase
                .from('wishList')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', product.product_id);

            if (error) {
                console.error("Error removing from wishlist:", error.message);
                setIsWishlisted(true);
            }
        }
    };

    return (
        
        <button
        onClick={toggleWishlist}
        className={`px-6 py-2 text-medium font-medium rounded-lg shadow transition-all flex-shrink-1 whitespace-nowrap ${
            isWishlisted
            ? 'bg-gray-500 text-white hover:bg-gray-600'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
        >
        {isWishlisted ? 'Unwishlist' : 'Add to Wishlist'}
        </button>
    );
}