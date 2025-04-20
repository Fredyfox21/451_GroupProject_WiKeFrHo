import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

// the code is a decent bit messy because I had an error where I was trying everything under the sun to fix it 
export default function CreateProduct() {
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
    const [itemSeller, setItemSeller] = useState(null);

    // I know this sucks, but I don't have the time to learn how to make it better right now
    const [itemTag1, setTag1] = useState(null);
    const [itemTag2, setTag2] = useState(null);
    const [itemTag3, setTag3] = useState(null);
    const [itemTag4, setTag4] = useState(null);
    const [itemTag5, setTag5] = useState(null);
    const [itemTag6, setTag6] = useState(null);
    const [itemTag7, setTag7] = useState(null);
    const [itemTag8, setTag8] = useState(null);
    const [itemTag9, setTag9] = useState(null);
    const [itemTag10, setTag10] = useState(null);

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
        //   setProductID(insertedProduct.product_id)
        const productId = insertedProduct.product_id;
     

        if (!insertedProduct?.product_id) {
            console.error("No product ID returned");
            return;
        }


        
        if (itemImageCover) {
            // first add image to storage
            const { data, error } = await supabase.storage
                .from('product-images') // Bucket name
                .upload(`${itemName}ImageCover-${Date.now()}`, itemImageCover); 

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
                console.log("Data: ",data)
                console.log("Public Data: ", publicData)
                console.log("Public Data.URL: ", publicData.publicUrl)
                const imageUrl = publicData.publicUrl;
                console.log("Image URL: ", imageUrl)

                console.log("productID: ", productId)
                console.log("imageURL: ", imageUrl)
                console.log("itemName: ", itemName)
    
      


                const { error: insertError } = await supabase.from("images").insert([
                    {
                        product_id: productId,
                        image: imageUrl,
                        name: itemName,
                        isCover: true,
                    },
                ]);
    
                if (insertError) {
                    console.error('Error uploading to image table', insertError)
                }
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

            console.log("productID: ", productId)
            console.log("imageURL: ", imageUrl)
            console.log("itemName: ", itemName)

            const { error: insertError } = await supabase.from("images").insert([
                {
                    product_id: productId,
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

            console.log("productID: ", productId)
            console.log("imageURL: ", imageUrl)
            console.log("itemName: ", itemName)

            const { error: insertError } = await supabase.from("images").insert([
                {
                    product_id: productId,
                    image: imageUrl,
                    name: itemName,      
                    isCover: false,
                },
            ]);

            if (insertError) {
                console.error('Error uploading to image table', insertError)
            }
        }

        if (itemTag1) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag1
                }
            ]);
        }

        if (itemTag2) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag2
                }
            ]);
        }

        if (itemTag3) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag3
                }
            ]);
        }
        
        if (itemTag4) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag4
                }
            ]);
        }

        if (itemTag5) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag5
                }
            ]);
        }
  
        if (itemTag6) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag6
                }
            ]);
        }

        if (itemTag7) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag7
                }
            ]);
        }

        if (itemTag8) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag8
                }
            ]);
        }

        if (itemTag9) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag9
                }
            ]);
        }

        if (itemTag10) {
            const {error: insertError} = await supabase.from("tag").insert([
                {
                    product_id: productId,
                    name: itemTag10
                }
            ]);
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
                            setItemImageCover(file);
                            setItemImageCoverPreview(
                                file ? URL.createObjectURL(file) : undefined);
                            }}  
                        required
                        />


                    {itemImageCoverPreview && (
                        <Image
                            src = {itemImageCoverPreview}
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

                    <input
                        placeholder="Tag 1"
                        value = {itemTag1}
                        onChange={(e) => setTag1(e.target.value)}
                        />

                    <input
                        placeholder="Tag 2"
                        value = {itemTag2}
                        onChange={(e) => setTag2(e.target.value)}
                        />

                    <input
                        placeholder="Tag 3"
                        value = {itemTag3}
                        onChange={(e) => setTag3(e.target.value)}
                        />

                    <input
                        placeholder="Tag 4"
                        value = {itemTag4}
                        onChange={(e) => setTag4(e.target.value)}
                        />

                    <input
                        placeholder="Tag 5"
                        value = {itemTag5}
                        onChange={(e) => setTag5(e.target.value)}
                        />

                    <input
                        placeholder="Tag 6"
                        value = {itemTag6}
                        onChange={(e) => setTag6(e.target.value)}
                        />
                    
                    <input
                        placeholder="Tag 7"
                        value = {itemTag7}
                        onChange={(e) => setTag7(e.target.value)}
                        />
                    
                    <input
                        placeholder="Tag 8"
                        value = {itemTag8}
                        onChange={(e) => setTag8(e.target.value)}
                        />

                    <input
                        placeholder="Tag 9"
                        value = {itemTag9}
                        onChange={(e) => setTag9(e.target.value)}
                        />

                    <input
                        placeholder="Tag 10"
                        value = {itemTag10}
                        onChange={(e) => setTag10(e.target.value)}
                        />

                    <button onClick={() => handleSubmit()}>SUBMIT</button>
            </div>

    )

}