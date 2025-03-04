import React, { useEffect, useState } from "react";

import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { clearUserDetails } from "../Redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
const Hero = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch()
  const { userDetails, isLoggedIn } = useSelector((state) => state.user);
  useEffect(()=>{
    const validateToken = async () => {
      try {
        const response = await axios.get('https://backend-video-1.onrender.com/api/v1/users/current-user', {
          withCredentials: true,
        });
        if (response) {
        } else {
          dispatch(clearUserDetails());
        }
      } catch (error) {
        dispatch(clearUserDetails());
      }
    };

    if (isLoggedIn) {
      validateToken();
    }
  },[])
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("https://backend-video-1.onrender.com/api/v1/videos/video/random-videos?page=1&limit=100&sortBy=createdAt&sortType=1",
          { withCredentials: true },
        );
        setVideos(response.data.data.videos);
      } catch (error) {
        console.log(error);
        
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-slate-950 text-white">
      {/* Sidebar */}
      <div className={`absolute inset-y-0 left-0 transform ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-slate-950 flex flex-col justify-between p-4 z-50`}>
        <div className="flex justify-between items-center md:hidden mb-4">
          <h1 className="text-xl font-bold">Menu</h1>
          <button onClick={() => setMenuOpen(false)} className="text-xl">&times;</button>
        </div>
        <div className="flex flex-col">
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 text-left hover:bg-gray-700 rounded-md"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/subscribed_channels")}
            className="w-full py-2 px-4 text-left hover:bg-gray-700 rounded-md"
          >
            Subscriptions
          </button>
          <button
            onClick={() => navigate("/liked-videos")}
            className="w-full py-2 px-4 text-left hover:bg-gray-700 rounded-md"
          >
            Liked Videos
          </button>
          <button
            onClick={() => navigate("/my-videos")}
            className="w-full py-2 px-4 text-left hover:bg-gray-700 rounded-md"
          >
            My Videos
          </button>
          <button
            onClick={() => navigate("/user-playlists")}
            className="w-full py-2 px-4 text-left hover:bg-gray-700 rounded-md"
          >
            My Playlists
          </button>
          <button
            onClick={() => navigate("/publish")}
            className="w-full py-2 px-4 text-left hover:bg-gray-700 rounded-md"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Menu Button for Small Screens */}
      <div className=" h-screen md:hidden absolute top-20 bottom-14 left-4 z-50">
  <button
    onClick={() => setMenuOpen(true)}
    className="bg-slate-800 p-2 rounded-md text-white"
  >
    ☰
  </button>
</div>


      {/* Video Gallery */}
      <div className="w-full bg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto mt-12">
  {isLoggedIn ? (
    videos.map((video) => (
      <div
        key={video._id}
        className="rounded-md bg-gray-950 shadow-md hover:scale-105 transform transition-all duration-300 cursor-pointer"
        onClick={() => navigate(`/video/${video._id}`)}
      >
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-44 object-cover rounded-t-md"
          />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-md">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-3">
          <h3 className="text-lg font-medium truncate">{video.title}</h3>
          <p className="text-sm text-gray-500">{video.owner?.username || "Unknown"}</p>
        </div>
      </div>
    ))
  ) : (
    <div className="sm:hidden flex flex-col items-center justify-center h-64 bg-gray-800 rounded-md text-center shadow-md">
  <p className="text-lg font-semibold text-gray-300 mb-4">
    Please sign in to view the videos.
  </p>
  <button
    onClick={() => navigate("/signup")}
    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-all duration-300"
  >
    Click to register
  </button>
</div>

  )}
</div>

</div>
  );
};

export default Hero;
