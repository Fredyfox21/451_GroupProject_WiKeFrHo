import "../app/globals.css";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';  // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the styles
import Confetti from 'react-confetti'; // Import Confetti
import Image from "next/image";

export default function Profile(){
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [userInfo, setUserInfo] = useState({FirstName: '', LastName: '', username: '', bio: ''});
    const router = useRouter();
    const [showConfetti, setShowConfetti] = useState(false); // State to control confetti
    useEffect(() =>{
        const checkUser = async () => {
            const { data, error} = await supabase.auth.getSession()

            if(error){
                console.error("Error fetching user:", error?.message);
                router.push("/login");
            } else if(!data?.session?.user){
                router.push("/login");
            } else{
                setUser(data.session.user)
                //console.log(data.session.user)
            }

        };
        checkUser();
    },[])

    useEffect(() => {
        if(!user) return;
        const fetchUserData = async () => {
            try {
                const{data, error} = await supabase
                .from('userImage')
                .select('image')
                .eq('user_id', user.id)
                .single();
                console.log(data.image);
             if (error){
                console.error('Error: Unable to fetch image:', error.message);
             } else{
                if (data.image) 
                  setProfileImage(data.image);
             }

              const {data: userInfoData, error: userInfoError} = await supabase
                .from('user')
                .select('FirstName, LastName, username, bio')
                .eq('id', user.id)
                .single();
              if(userInfoError){
                console.error('Error fetching user info:', userInfoError.message)
              }else{
                setUserInfo({
                  FirstName: userInfoData.FirstName||'',
                  LastName: userInfoData.LastName||'',
                  username: userInfoData.username||'',
                  bio: userInfoData.bio||''
                });
                console.log(userInfo.FirstName);
              }


            } catch(error){
                console.error('Error:', error.message)
            }
        }

        fetchUserData();
    },[user])

    

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !user){
          
          return;
        }
      
        setUploading(true);
      
        const filePath = `${user.id}-${Date.now()}`;
      
        
        const { data, error } = await supabase.storage
        .from("profile-pictures") 
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
        if (error) {
          console.error("Upload error:", error.message);
          setUploading(false);
          return;
        }
      
        
        const {data:publicURL} = await supabase.storage.from("profile-pictures").getPublicUrl(filePath);
        if (!publicURL) {
          console.error("Error: Could not retrieve public URL");
          setUploading(false);
          return;
        }
      
        
        const { error: updateError } = await supabase
          .from("userImage")
          .update({ image: publicURL.publicUrl})
          .eq("user_id", user.id);
      
        if (updateError) {
          console.error("Error updating profile image URL:", updateError.message);
          setUploading(false);
          return;
        } else{
          setProfileImage(publicURL.publicUrl);
        }
        setUploading(false);
      };
      
      const handleSubmit = async (event) => {
          event.preventDefault();

          if(!user) return;

          const{FirstName, LastName, username, bio} = userInfo;

          const{error} = await supabase
            .from('user')
            .upsert(
              {id: user.id, FirstName, LastName, username, bio},
              {onConflict: ['id']}
            );
          if (error) {
            console.error('Error updating profile data:', error.message);
          } else {
            console.log('Profile updated successfully!');
            toast.success('Profile updated successfully!');
            setShowConfetti(true); // Trigger confetti
            setTimeout(() => setShowConfetti(false), 4000); // Hide confetti after 10 seconds
          }
      };

      const goToHome = () => {
        router.push("/home");
      };


      return (
        <div 
            className="flex flex-col items-center justify-center min-h-screen bg-gray-300 p-6" 
            style={{ backgroundImage: 'url("/Images/dacoogasbg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="bg-gray-200 shadow-lg rounded-lg p-6 flex flex-col items-center w-full max-w-md">

              
                {/* Profile Image */}
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile Picture"
                        width={150}
                        height={150}
                        className="w-32 h-32 rounded-full object-cover border-4 border-red-700"
                    />
                ) : (
                    <div className="w-36 h-36 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-gray-600">No Image</span>
                    </div>
                )}

                {/* Edit Button */}
                <label className="mt-4 cursor-pointer bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition">
                    {uploading ? "Uploading..." : "Edit Profile Picture"}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>

                {/* Edit Profile Form */}
                <form onSubmit={handleSubmit} className="mt-4 w-full max-w-md">
                    <div className="mb-4">
                        <label className="text-lg text-red-700">First Name</label>
                        <input
                            type="text"
                            value={userInfo.FirstName}
                            onChange={(e) => setUserInfo({ ...userInfo, FirstName: e.target.value })}
                            placeholder="First Name"
                            className="w-full p-2 border rounded mb-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-lg text-red-700">Last Name</label>
                        <input
                            type="text"
                            value={userInfo.LastName}
                            onChange={(e) => setUserInfo({ ...userInfo, LastName: e.target.value })}
                            placeholder="Last Name"
                            className="w-full p-2 border rounded mb-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-lg text-red-700">Username</label>
                        <input
                            type="text"
                            value={userInfo.username}
                            onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                            placeholder="Username"
                            className="w-full p-2 border rounded mb-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-lg text-red-700">Bio</label>
                        <textarea
                            value={userInfo.bio}
                            onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                            placeholder="Tell us about yourself"
                            className="w-full p-2 border rounded mb-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-700 text-white py-2 rounded mt-2 hover:bg-red-800"
                    >
                        Save
                    </button>
                </form>
            </div>
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
            {/* Confetti Animation */}
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

            {/* Toast Container for success message */}
            <ToastContainer />
        </div>
    )
}