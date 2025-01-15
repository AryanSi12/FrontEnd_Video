import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          "https://backend-video-1.onrender.com/api/v1/videos/video/user-videos",
          {
            withCredentials: true, // Include credentials if needed
          }
        );
        console.log(response.data.data);
        if (response.data.data.videos.length > 0)
          setVideos(response.data.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );

  if (videos.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950 text-gray-400 text-xl font-semibold">
        No videos found
      </div>
    );

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-full max-w-6xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="mt-8 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            My Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="rounded-md bg-slate-800 shadow-md hover:scale-105 transform transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-44 object-cover rounded-t-md"
                  />
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded-md">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium truncate">{video.title}</h3>
                  <p className="text-sm text-gray-500">
                    {video.owner?.username || "Unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVideos;
