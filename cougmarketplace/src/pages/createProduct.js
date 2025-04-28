import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

export default function CreateProduct() {
  const router = useRouter();

  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemSeller, setItemSeller] = useState(null);

  const [itemImageCover, setItemImageCover] = useState(null);
  const [itemImage2, setItemImage2] = useState(null);
  const [itemImage3, setItemImage3] = useState(null);

  const [itemImageCoverPreview, setItemImageCoverPreview] = useState(null);
  const [itemImage2Preview, setItemImage2Preview] = useState(null);
  const [itemImage3Preview, setItemImage3Preview] = useState(null);

  const [tags, setTags] = useState(Array(10).fill(''));

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        router.push("/login");
      } else {
        setItemSeller(data.session.user.id);
      }
    };
    checkUser();
  }, []);

  const handleTagChange = (index, value) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const handleSubmit = async () => {
    const currentDate = new Date().toISOString();

    const { data: productData, error: productInsertError } = await supabase
      .from("product")
      .insert([{
        name: itemName,
        price: itemPrice,
        seller_id: itemSeller,
        Qty: itemQty,
        description: itemDescription,
        postdate: currentDate
      }])
      .select();

    if (productInsertError) {
      console.error("Error inserting product:", productInsertError);
      return;
    }

    const productId = productData?.[0]?.product_id;
    if (!productId) return;

    const uploadImage = async (image, isCover = false, label = "") => {
      const fileName = `${itemName}-${label}-${Date.now()}`;
      const { data, error } = await supabase
        .storage
        .from('product-images')
        .upload(fileName, image);

      if (error) return;

      const { data: publicData } = supabase
        .storage
        .from('product-images')
        .getPublicUrl(data.path);

      const imageUrl = publicData?.publicUrl;

      await supabase.from("images").insert([{
        product_id: productId,
        image: imageUrl,
        name: itemName,
        isCover: isCover,
      }]);
    };

    if (itemImageCover) await uploadImage(itemImageCover, true, "Cover");
    if (itemImage2) await uploadImage(itemImage2, false, "Image2");
    if (itemImage3) await uploadImage(itemImage3, false, "Image3");

    for (let tag of tags) {
      if (tag?.trim()) {
        await supabase.from("tag").insert([{ product_id: productId, name: tag }]);
      }
    }

    router.push("/"); // optional redirect after submit
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl space-y-8">

        <h1 className="text-3xl font-bold text-center text-red-700 font-orbitron">Create New Product</h1>

        {/* Section: Product Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Item Name" value={itemName}
              onChange={(e) => setItemName(e.target.value)} className="w-full px-4 py-2 border rounded" />
            <textarea placeholder="Item Description" value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)} className="w-full px-4 py-2 border rounded resize-none h-24" />
            <input type="number" placeholder="Price" value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)} className="w-full px-4 py-2 border rounded" />
            <input type="number" placeholder="Quantity" value={itemQty}
              onChange={(e) => setItemQty(e.target.value)} className="w-full px-4 py-2 border rounded" />
          </div>
        </div>

        {/* Section: Images */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          <div className="space-y-4">
            <label className="block font-medium">Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              setItemImageCover(file);
              setItemImageCoverPreview(file ? URL.createObjectURL(file) : null);
            }} />
            {itemImageCoverPreview && <Image src={itemImageCoverPreview} alt="Cover" width={200} height={200} className="rounded" />}

            <label className="block font-medium">Image 2</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              setItemImage2(file);
              setItemImage2Preview(file ? URL.createObjectURL(file) : null);
            }} />
            {itemImage2Preview && <Image src={itemImage2Preview} alt="Image 2" width={200} height={200} className="rounded" />}

            <label className="block font-medium">Image 3</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              setItemImage3(file);
              setItemImage3Preview(file ? URL.createObjectURL(file) : null);
            }} />
            {itemImage3Preview && <Image src={itemImage3Preview} alt="Image 3" width={200} height={200} className="rounded" />}
          </div>
        </div>

        {/* Section: Tags */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tags (Optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            {tags.map((tag, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Tag ${index + 1}`}
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Submit Product
        </button>
      </div>
    </div>
  );
}
