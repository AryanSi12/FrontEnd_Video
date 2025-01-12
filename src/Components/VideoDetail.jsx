import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const VideoDetail = () => {
  const { id } = useParams(); // Get video ID from the URL
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggested] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false); // State for subscription
  const [playlists, setPlaylists] = useState([]); // List of existing playlists
  const [showPlaylistModal, setShowPlaylistModal] = useState(false); // Modal visibility
  const [newPlaylistName, setNewPlaylistName] = useState(""); // New playlist name
  const navigate = useNavigate();
  const { userDetails, isLoggedIn } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/v1/videos/${id}`,
          {
            withCredentials: true,
          }
        );
        const suggVideos = await axios.get(
          "http://localhost:7000/api/v1/videos/video/random-videos?page=1&limit=10&sortBy=createdAt&sortType=1",
          { withCredentials: true }
        );
        setSuggested(suggVideos.data.data.videos);
        setVideo(response.data.data);
        setLikes(response.data.data[0]?.TotalLikes || 0);
        setIsSubscribed(response.data.data[0].isSubscriber);
        setLiked(response.data.data[0]?.isLiked || false);
      } catch (error) {
        console.error("Error fetching video data:", error.message);
      }
    };


    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/v1/playlist/user/${userDetails.id}`,
          {
              withCredentials: true, // Ensures cookies are sent with the request
          }
      );
      
        console.log(response);
        
        setPlaylists(response.data.data);
      } catch (error) {
        console.error("Error fetching playlists:", error.message);
      }
    };

    fetchVideo();
    fetchPlaylists();
  }, [id]);

  if (!video) return <div className="text-center text-white">Loading...</div>;

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:7000/api/v1/likes/toggle/v/${video[0]._id}`,
        null,
        { withCredentials: true }
      );
      if (response.data.message === "like added") {
        setLikes(likes + 1);
        setLiked(true);
      } else if (response.data.message === "like removed") {
        setLikes(likes > 0 ? likes - 1 : 0);
        setLiked(false);
      }
    } catch (error) {
      console.error("Error toggling like:", error.message);
    }
  };

  const handleSubscribe = async () => {
    try {
      const toggleSubscribe = await axios.get(
        `http://localhost:7000/api/v1/users/subscribe/${video[0].uploadedBy._id}`,
        {
          withCredentials: true,
        }
      );
      if (toggleSubscribe.data.message === "Unsubscribed successfully")
        setIsSubscribed(false);
      else setIsSubscribed(true);
    } catch (error) {
      console.error("Error in subscribing:", error.message);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const response = await axios.patch(
        `http://localhost:7000/api/v1/playlist/add/${video[0]._id}/${playlistId}`,
        {},
        { withCredentials: true }
      );
      alert(response.data.message || "Video added to playlist successfully!");
      setShowPlaylistModal(false);
    } catch (error) {
      console.error("Error adding video to playlist:", error.message);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const response = await axios.post(
        "http://localhost:7000/api/v1/playlists/create",
        { name: newPlaylistName },
        { withCredentials: true }
      );
      setPlaylists([...playlists, response.data.data]); // Update playlists state
      setShowPlaylistModal(false); // Close the modal
      setNewPlaylistName(""); // Reset the input
      alert("Playlist created successfully!");
    } catch (error) {
      console.error("Error creating playlist:", error.message);
    }
  };


  return (
    <div className="flex flex-col lg:flex-row p-4 bg-gray-900 text-white min-h-screen">
      {/* Main Video Section */}
      <div className="w-full lg:w-3/4 bg-gray-800 p-4 rounded-lg shadow-lg">
        {/* Video Player */}
        <div className="w-full h-64 md:h-96 bg-black">
          <video
            src={video[0].videoFile}
            controls
            className="w-full h-full object-cover"
          />
        </div>

        {/* Video Title */}
        <h1 className="text-2xl font-semibold mt-4">{video[0].title}</h1>

        {/* Video Details */}
        <div className="flex items-center justify-between text-sm text-gray-400 mt-2">
          <div className="flex items-center space-x-2">
            <img
              src={video[0].uploadedBy?.avatar || "default-avatar-url.jpg"}
              alt={video[0].uploadedBy?.username || "Unknown"}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() =>
                navigate(
                  `/account/${video[0].uploadedBy?.username || "unknown"}`
                )
              }
            />
            <p>
              Uploaded by:{" "}
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() =>
                  navigate(
                    `/account/${video[0].uploadedBy?.username || "unknown"}`
                  )
                }
              >
                {video[0].uploadedBy?.username || "Unknown"}
              </span>
            </p>
          </div>
          <p>Views: {video[0].views || 0}</p>
        </div>

        {/* Like, Dislike, Subscribe, Add to Playlist */}
        <div className="flex items-center space-x-4 mt-4">
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              liked ? "text-red-500" : "text-white"
            }`}
            onClick={handleLike}
          >
            <FaHeart className="mr-2 text-2xl" /> {likes}
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${
              isSubscribed
                ? "bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
            onClick={() => setShowPlaylistModal(true)}
          >
            Add to Playlist
          </button>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-300">
            {video[0].description || "No description available."}
          </p>
        </div>
      </div>

      {/* Suggested Videos */}
      <div className="w-full lg:w-1/4 p-4 bg-gray-800 rounded-lg shadow-lg ml-0 lg:ml-4 mt-4 lg:mt-0">
        <h2 className="text-lg font-semibold mb-4">Up Next</h2>
        {suggestedVideos.map((suggestedVideo) => (
          <div
            key={suggestedVideo._id}
            className="flex flex-col gap-3 mb-6 bg-gray-700 rounded-lg shadow-md hover:shadow-lg cursor-pointer overflow-hidden transition-transform transform hover:scale-105"
            onClick={() => navigate(`/video/${suggestedVideo._id}`)}
          >
            <img
              src={suggestedVideo.thumbnail}
              alt={suggestedVideo.title}
              className="w-full h-36 object-cover"
            />
            <div className="p-3">
              <h3 className="text-md font-medium text-white mb-1">
                {suggestedVideo.title}
              </h3>
              <p className="text-sm text-gray-400">
                {suggestedVideo.owner?.username || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {Math.floor(suggestedVideo.duration / 60)}:
                {String(Math.floor(suggestedVideo.duration % 60)).padStart(
                  2,
                  "0"
                )}{" "}
                mins
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-96">
            <h2 className="text-lg font-semibold mb-4">Add to Playlist</h2>
            {playlists.map((playlist) => (
              <button
                key={playlist._id}
                className="w-full text-left p-2 mb-2 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() => handleAddToPlaylist(playlist._id)}
              >
                {playlist.name}
              </button>
            ))}
            <div className="mt-4">
              <input
                type="text"
                placeholder="New Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded mb-2"
              />
              <button
                className="w-full px-4 py-2 bg-green-500 rounded hover:bg-green-600"
                onClick={handleCreatePlaylist}
              >
                Create Playlist
              </button>
            </div>
            <button
              className="w-full px-4 py-2 mt-4 bg-red-500 rounded hover:bg-red-600"
              onClick={() => setShowPlaylistModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetail;
