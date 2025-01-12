import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Menu, MenuItem } from "@mui/material";

const PlaylistVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { playlistId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      console.log(playlistId);

      try {
        const response = await axios.get(
          `http://localhost:7000/api/v1/playlist/getvideos/${playlistId}`,
          { withCredentials: true }
        );
        console.log(response.data.data[0].videoDetails);

        setVideos(response.data.data[0].videoDetails);
      } catch (error) {
        console.log("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [playlistId]);

  const handleMenuOpen = (event, video) => {
    setAnchorEl(event.currentTarget);
    
    setSelectedVideo(video);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVideo(null);
  };

  const handleRemoveVideo = async () => {
    if (!selectedVideo) return;

    try {
      await axios.patch(
        `http://localhost:7000/api/v1/playlist/remove/${selectedVideo._id}/${playlistId}`,
        {},
        { withCredentials: true }  
      );
      setVideos(videos.filter((video) => video._id !== selectedVideo._id));
    } catch (error) {
      console.log("Error removing video:", error);
    } finally {
      handleMenuClose();
    }
  };

  console.log(videos);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-full max-w-5xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="mt-8 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            Playlist Videos
          </h2>
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <p className="text-gray-400 text-lg mb-4">No videos found</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="flex flex-col sm:flex-row cursor-pointer items-start sm:items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full sm:w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 flex-1">
                    <h3 className="text-lg font-medium text-white">{video.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {video.description || "No description"}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white mt-2 sm:mt-0"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents triggering `onClick` for the parent div
                      handleMenuOpen(e, video);
                    }}
                  >
                    ⋮ {/* Vertical three dots */}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRemoveVideo}>Remove</MenuItem>
      </Menu>
    </div>
  );
};

export default PlaylistVideos;
