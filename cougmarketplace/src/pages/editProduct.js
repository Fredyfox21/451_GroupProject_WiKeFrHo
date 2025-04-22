import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import Image from "next/image";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const [product, setProduct] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemSeller, setItemSeller] = useState(null);

  // Image states
  const [itemImageCover, setItemImageCover] = useState(null);
  const [itemImage2, setItemImage2] = useState(null);
  const [itemImage3, setItemImage3] = useState(null);
  const [itemImageCoverPreview, setItemImageCoverPreview] = useState(null);
  const [itemImage2Preview, setItemImage2Preview] = useState(null);
  const [itemImage3Preview, setItemImage3Preview] = useState(null);

  // Tags and UI states
  const [tags, setTags] = useState(Array(10).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check user authentication
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          router.push("/login");
        } else {
          setItemSeller(data.session.user.id);
        }
      } catch (err) {
        setError("Failed to authenticate user");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch product details
        const { data, error } = await supabase
          .from('product')
          .select()
          .eq('product_id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Product not found");

        setProduct(data);
        setItemName(data.name);
        setItemDescription(data.description);
        setItemPrice(data.price);
        setItemQty(data.Qty);

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('tag')
          .select('name')
          .eq('product_id', id);

        if (tagsError) throw tagsError;

        // Initialize tags array with existing tags + empty slots
        const tagNames = tagsData.map(tag => tag.name);
        const filledTags = [...tagNames, ...Array(10 - tagNames.length).fill('')];
        setTags(filledTags);

        // Fetch existing images
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('image, isCover')
          .eq('product_id', id);

        if (imageError) throw imageError;

        if (imageData.length) {
          setItemImageCoverPreview(imageData.find(img => img.isCover)?.image || null);
          setItemImage2Preview(imageData.find(img => !img.isCover)?.image || null);
        }
      } catch (err) {
        setError(err.message || "Failed to load product data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleTagChange = (index, value) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const handleSubmit = async () => {
    if (!id) {
      setError("Product ID is missing");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      if (!itemName.trim() || !itemDescription.trim()) {
        throw new Error("Name and description are required");
      }
      if (isNaN(itemPrice)) {
        throw new Error("Price must be a number");
      }
      if (isNaN(itemQty)) {
        throw new Error("Quantity must be a number");
      }

      // Update product details
      const { data: productData, error: productUpdateError } = await supabase
        .from("product")
        .update({
          name: itemName,
          price: parseFloat(itemPrice),
          seller_id: itemSeller,
          Qty: parseInt(itemQty),
          description: itemDescription,
          postdate: new Date().toISOString()
        })
        .eq("product_id", id)
        .select();

      if (productUpdateError) throw productUpdateError;

      const productId = productData?.[0]?.product_id;
      if (!productId) throw new Error("Failed to get updated product ID");

      // Handle image uploads
      const uploadImage = async (image, isCover = false, label = "") => {
        if (!image) return null;

        const fileName = `${itemName.replace(/[^a-z0-9]/gi, '_')}-${label}-${Date.now()}`;
        
        // Delete old image if exists
        if (isCover && itemImageCoverPreview) {
          const oldFileName = itemImageCoverPreview.split('/').pop();
          await supabase.storage.from('product-images').remove([oldFileName]);
        }

        // Upload new image
        const { data, error } = await supabase
          .storage
          .from('product-images')
          .upload(fileName, image);

        if (error) throw error;

        const { data: publicData } = supabase
          .storage
          .from('product-images')
          .getPublicUrl(data.path);

        // Update image record
        const { error: imageError } = await supabase.from("images")
          .upsert([{
            product_id: productId,
            image: publicData.publicUrl,
            name: itemName,
            isCover: isCover,
          }]);

        if (imageError) throw imageError;

        return publicData.publicUrl;
      };

      // Process all image uploads
      await Promise.all([
        uploadImage(itemImageCover, true, "Cover"),
        uploadImage(itemImage2, false, "Image2"),
        uploadImage(itemImage3, false, "Image3")
      ]);

      // Update tags
      await supabase.from("tag").delete().eq('product_id', productId);
      
      const validTags = tags.filter(tag => tag?.trim());
      if (validTags.length > 0) {
        const { error: tagsError } = await supabase.from("tag")
          .insert(validTags.map(tag => ({ 
            product_id: productId, 
            name: tag 
          })));

        if (tagsError) throw tagsError;
      }

      setSuccess(true);
      setTimeout(() => router.push("/myProducts"), 1500);
    } catch (err) {
      setError(err.message || "Failed to update product");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      // First delete all related data
      
      // Delete tags
      await supabase.from('tag').delete().eq('product_id', id);
      
      // Get images to delete from storage
      const { data: images } = await supabase
        .from('images')
        .select('image')
        .eq('product_id', id);
      
      // Delete image records
      await supabase.from('images').delete().eq('product_id', id);
      
      // Delete images from storage
      if (images?.length) {
        const filesToDelete = images.map(img => img.image.split('/').pop());
        await supabase.storage.from('product-images').remove(filesToDelete);
      }
      
      // Finally delete the product
      const { error } = await supabase
        .from('product')
        .delete()
        .eq('product_id', id);
      
      if (error) throw error;
      
      router.push('/myProducts');
    } catch (err) {
      setError(err.message || "Failed to delete product");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      router.push('/myProducts');
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading product data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>{error || "Product not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-red-700 font-orbitron">
          Edit Product
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Product updated successfully!
          </div>
        )}

        {/* Product Details Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Item Name" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)} 
              className="w-full px-4 py-2 border rounded" 
              required
            />
            <textarea 
              placeholder="Item Description" 
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)} 
              className="w-full px-4 py-2 border rounded resize-none h-24" 
              required
            />
            <input 
              type="number" 
              placeholder="Price" 
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)} 
              className="w-full px-4 py-2 border rounded" 
              min="0"
              step="0.01"
              required
            />
            <input 
              type="number" 
              placeholder="Quantity" 
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)} 
              className="w-full px-4 py-2 border rounded" 
              min="0"
              required
            />
          </div>
        </div>

        {/* Images Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Cover Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setItemImageCover(file);
                  setItemImageCoverPreview(file ? URL.createObjectURL(file) : itemImageCoverPreview);
                }} 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100"
              />
              {itemImageCoverPreview && (
                <div className="mt-2">
                  <Image 
                    src={itemImageCoverPreview} 
                    alt="Cover preview" 
                    width={200} 
                    height={200} 
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2">Additional Image 1</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setItemImage2(file);
                  setItemImage2Preview(file ? URL.createObjectURL(file) : itemImage2Preview);
                }} 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100"
              />
              {itemImage2Preview && (
                <div className="mt-2">
                  <Image 
                    src={itemImage2Preview} 
                    alt="Image 2 preview" 
                    width={200} 
                    height={200} 
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2">Additional Image 2</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setItemImage3(file);
                  setItemImage3Preview(file ? URL.createObjectURL(file) : itemImage3Preview);
                }} 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-red-50 file:text-red-700
                  hover:file:bg-red-100"
              />
              {itemImage3Preview && (
                <div className="mt-2">
                  <Image 
                    src={itemImage3Preview} 
                    alt="Image 3 preview" 
                    width={200} 
                    height={200} 
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2 rounded transition ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            Cancel
          </button>

          {showDeleteConfirm ? (
            <div className="flex flex-col gap-2 w-full sm:flex-row">
              <button
                onClick={handleDeleteProduct}
                disabled={loading}
                className="flex-1 py-2 bg-red-800 hover:bg-red-900 text-white rounded transition"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
              >
                Cancel Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded transition"
            >
              Delete Product
            </button>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteProduct}
                  disabled={loading}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}