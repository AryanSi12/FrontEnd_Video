import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const VideoDetail = () => {
  const { id } = useParams(); // Get video ID from the URL
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggested] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false); // State for subscription
  const [playlists, setPlaylists] = useState([]); // List of existing playlists
  const [showPlaylistModal, setShowPlaylistModal] = useState(false); // Modal visibility
  const [newPlaylistName, setNewPlaylistName] = useState(""); // New playlist name
  const [comments, setComments] = useState([]); // List of comments
  const [newComment, setNewComment] = useState(""); // New comment input
  const [replyingTo, setReplyingTo] = useState(null); // Tracks the comment being replied to
  const [replyContent, setReplyContent] = useState(""); // Stores the reply content
  const navigate = useNavigate();
  const { userDetails, isLoggedIn } = useSelector((state) => state.user);
  console.log(userDetails);
  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(
          `https://backend-video-1.onrender.com/api/v1/videos/${id}`,
          {
            withCredentials: true,
          }
        );
        const suggVideos = await axios.get(
          "https://backend-video-1.onrender.com/api/v1/videos/video/random-videos?page=1&limit=10&sortBy=createdAt&sortType=1",
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
          `https://backend-video-1.onrender.com/api/v1/playlist/user/${userDetails.id}`,
          {
            withCredentials: true, // Ensures cookies are sent with the request
          }
        );
        setPlaylists(response.data.data);
      } catch (error) {
        console.error("Error fetching playlists:", error.message);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `https://backend-video-1.onrender.com/api/v1/comment/${id}`,
          { withCredentials: true }
        );
        console.log(response);
        
        
        setComments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching comments:", error.message);
      }
    };

    fetchVideo();
    fetchPlaylists();
    fetchComments();
  }, [id]);

  if (!video) return <div className="text-center text-white">Loading...</div>;

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId === replyingTo ? null : commentId); // Toggle reply input visibility
  };

  const handleReplySubmit = async (parentId,content) => {
    try {
      const response = await axios.post(
        `https://backend-video-1.onrender.com/api/v1/comment/addReply/${id}/${parentId}`,
        {
          content : content,
        },
        { withCredentials: true }
      );
      
      setComments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error.message);
    }
  }

  const handleReplySubmitLocal = (parentCommentId) => {
    if (!replyContent.trim()) return;
    handleReplySubmit(parentCommentId, replyContent); // Pass reply to parent component
    setReplyContent("");
    setReplyingTo(null);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return; // Prevent empty comments
    try {
      const response = await axios.post(
        `https://backend-video-1.onrender.com/api/v1/comment/${id}`,
        { content : newComment },
        { withCredentials: true }
      );
      setComments([...comments, response.data.data]); // Update comments list
      setNewComment(""); // Clear the input
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const response = await axios.patch(
        `https://backend-video-1.onrender.com/api/v1/playlist/add/${video[0]._id}/${playlistId}`,
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
        "https://backend-video-1.onrender.com/api/v1/playlists/create",
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

  
  
  const handleLike = async () => {
    try {
      const response = await axios.post(
        `https://backend-video-1.onrender.com/api/v1/likes/toggle/v/${video[0]._id}`,
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
        `https://backend-video-1.onrender.com/api/v1/users/subscribe/${video[0].uploadedBy._id}`,
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

        {/* Like, Subscribe */}
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
            className={`px-4 py-2 rounded-lg ${
              isSubscribed ? "bg-gray-600" : "bg-red-500 hover:bg-red-600"
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
        <h2
          className="text-lg font-semibold mb-2 cursor-pointer"
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
        >
          {isDescriptionOpen ? "Hide Description" : "Show Description"}
        </h2>
        {isDescriptionOpen && (
          <p className="text-gray-300 bg-gray-800 p-3 rounded-lg">
            {video[0].description || "No description available."}
          </p>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">
          {comments.length} Comments
        </h2>

        {/* Add Comment */}
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={userDetails.avatar} // Replace with actual user avatar path
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-lg outline-none"
            />
          </div>
          <button
            className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white"
            onClick={handleCommentSubmit}
          >
            Comment
          </button>
        </div>

        {/* Sort Comments */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400">{comments.length} Comments</p>
          <select className="bg-gray-800 text-gray-300 p-2 rounded-lg outline-none">
            <option value="top">Top Comments</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Comments List */}
        <div className="bg-gray-900 text-white p-4 rounded-md space-y-6">
      {comments && comments.map((comment) => (
        <div key={comment._id} className="mb-8">
          {/* Parent Comment */}
          <div className="flex items-start gap-4">
            <img
              src={comment.owner.avatar || "https://via.placeholder.com/50"}
              alt="Avatar"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {comment.owner.username || "Unknown"}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-300">{comment.content}</p>

              {/* Reply Button */}
              <button
                onClick={() => handleReplyClick(comment._id)}
                className="mt-2 text-sm text-blue-500 hover:underline focus:outline-none"
              >
                Reply
              </button>

              {/* Reply Input */}
              {replyingTo === comment._id && (
                <div className="mt-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleReplySubmitLocal(comment._id)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white"
                    >
                      Submit Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Replies for the Parent Comment */}
          {comment.replies
            .filter((reply) => reply.parentComment === comment._id) // Match replies with their parent comment
            .map((reply) => (
              <div
                key={reply._id}
                className="mt-4 ml-10 border-l-2 border-gray-700 pl-4"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={reply.owner.avatar} // Placeholder avatar
                    alt="Reply Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{reply.owner.username}</span>{" "}
                      {/* Replace with actual owner */}
                      <span className="text-gray-500 text-sm">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
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
