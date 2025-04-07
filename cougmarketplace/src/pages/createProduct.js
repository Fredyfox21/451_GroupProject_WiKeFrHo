import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

export default function CreateProduct() {
    const [productID, setProductID] = useState(null);
    const [itemName, setItemName] = useState(null);
    const [itemDescription, setItemDescription] = useState(null);
    const [itemPrice, setItemPrice] = useState(null);
    const [itemQty, setItemQty] = useState(null);
    const [itemImageCover, setItemImageCover] = useState(null);
    const [itemImageCoverPreview, setItemImageCoverPreview] = useState(null);
    const [itemImage2, setItemImage2] = useState(null);
    const [itemImage2Preview, setItemImage2Preview] = useState(null);
    const [itemImage3, setItemImage3] = useState(null);
    const [itemImage3Preview, setItemImage3Preview] = useState(null);

    const [itemTags, setItemTags] = useState(null);
    const [itemSeller, setItemSeller] = useState(null);

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
            setItemSeller(data.session.user.id); // The user object is in data.session.user - UNCOMMENT THIS WHEN DONE
          }
    
        };
        checkUser();
      }, []); // something in [] means it runs when that happens, nothing in it means it's the first thing called 

      // -------------------------------------

    const handleSubmit = async (e) => {
        //e.preventDefault();

        const currentDate = new Date().toISOString();
        const { data: productInsertData, error: productInsertError } = await supabase
            .from("product")
            .insert([
              {
                name: itemName,
                price: itemPrice,
                seller_id: itemSeller,
                Qty: itemQty,
                description: itemDescription,
                postdate: currentDate
              }
            ])
            .select();
          
          if (productInsertError) {
            console.error("Error inserting product data:", productInsertError);
            return;
          }

                   
          const insertedProduct = productInsertData?.[0];
          setProductID(insertedProduct.product_id)

     

          if (!insertedProduct?.product_id) {
            console.error("No product ID returned");
            return;
          }


        
        if (itemImageCover) {
            let imageUrl = null;
            console.log("In Image Cover")
            // first add image to storage
            const { data, error } = await supabase.storage
                .from('product-images') // Bucket name
                .upload(`${itemName}ImageCover-${Date.now()}-`, itemImageCover); 

            if (error) {
                console.error('Error uploading image:', error);
                //setError('Failed to upload image.');
                return;
            }

            // Get the public URL of the uploaded image
            if (data?.path) {
                const { data: publicData } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path);
                imageUrl = publicData.publicUrl;
            }

            console.log("productID: ", productID)
            console.log("imageURL: ", imageUrl)
            console.log("itemName: ", itemName)


            const { error: insertError } = await supabase.from('image').insert([
                {
                    product_id: productID,
                    image: imageUrl,
                    name: itemName,      
                    isCover: true,
                },
            ]);

            if (insertError) {
                console.error('Error uploading to image table', insertError)
            }
        }

        if (itemImage2) {
            let imageUrl = null;
            // console.log("In Image Cover")
            // first add image to storage
            const { data, error } = await supabase.storage
                .from('product-images') // Bucket name
                .upload(`${itemName}Image2-${Date.now()}-`, itemImage2); 

            if (error) {
                console.error('Error uploading image:', error);
                //setError('Failed to upload image.');
                return;
            }

            // Get the public URL of the uploaded image
            if (data?.path) {
                const { data: publicData } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path);
                imageUrl = publicData.publicUrl;
            }

            console.log("productID: ", productID)
            console.log("imageURL: ", imageUrl)
            console.log("itemName: ", itemName)

            const { error: insertError } = await supabase.from('image').insert([
                {
                    product_id: productID,
                    image: imageUrl,
                    name: itemName,      
                    isCover: false,
                },
            ]);

            if (insertError) {
                console.error('Error uploading to image table', insertError)
            }
        }

        if (itemImage3) {
            let imageUrl = null;
            // console.log("In Image Cover")
            // first add image to storage
            const { data, error } = await supabase.storage
                .from('product-images') // Bucket name
                .upload(`${itemName}Image3-${Date.now()}-`, itemImage3); 

            if (error) {
                console.error('Error uploading image:', error);
                //setError('Failed to upload image.');
                return;
            }

            // Get the public URL of the uploaded image
            if (data?.path) {
                const { data: publicData } = supabase.storage
                .from('product-images')
                .getPublicUrl(data.path);
                imageUrl = publicData.publicUrl;
            }

            console.log("productID: ", productID)
            console.log("imageURL: ", imageUrl)
            console.log("itemName: ", itemName)

            const { error: insertError } = await supabase.from('image').insert([
                {
                    product_id: productID,
                    image: imageUrl,
                    name: itemName,      
                    isCover: false,
                },
            ]);

            if (insertError) {
                console.error('Error uploading to image table', insertError)
            }
        }
        


    };


    return (
            <div className="bg-gray-400 bg-opacity-75 p-8 rounded-lg shadow-lg w-96 text-white">
                <h1 className="text-red-700 text-4xl font-bold text-center mb-6" style={{ fontFamily: 'Orbitron' }}>Product Creation</h1>
                    <input
                        placeholder="Item Name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        />
                    
                    <textarea
                        placeholder="Item Description"
                        className="descSize"  // Apply a custom class
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        required
                    />
                    
                    <input 
                        type="number"
                        placeholder="Item Price"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        required
                        />
                    <input 
                        type="number"
                        placeholder="Item Quantity"
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        required
                        />
                    <input 
                        type="file"
                        accept ="image/*"
                        alt="ItemImageCover"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            //setItemImageCover(file);
                            setItemImageCover(
                                file ? URL.createObjectURL(file) : undefined);
                            }}  
                        required
                        />

                    {itemImageCover && (
                        <Image
                            src = {itemImageCover}
                            width = {400}
                            height = {400}
                            />    
                        )
                    }

                    <input 
                        type="file"
                        accept ="image/*"
                        alt="ItemImage2"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setItemImage2(file);
                            setItemImage2Preview(
                                file ? URL.createObjectURL(file) : undefined);
                            }}  
                        />

                    {itemImage2Preview && (
                        <Image
                            src = {itemImage2Preview}
                            width = {400}
                            height = {400}
                            />    
                        )
                    }

                    <input 
                        type="file"
                        accept ="image/*"
                        alt="ItemImage3"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setItemImage3(file);
                            setItemImage3Preview(
                                file ? URL.createObjectURL(file) : undefined);
                            }}  
                        />

                    {itemImage3Preview && (
                        <Image
                            src = {itemImage3Preview}
                            width = {400}
                            height = {400}
                            />    
                        )
                    }
                    <button onClick={() => handleSubmit()}>SUBMIT</button>
            </div>

    )

}