import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import CreatePlaylist from "./CreatePlaylist"; // Import modal component

const UserPlaylists = () => {
  
  const generateColorFromName = (name) => {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#33FFF6", "#FFC733",
    ];
    const charCodeSum = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const navigate = useNavigate();
  const { userDetails } = useSelector((state) => state.user);
  useEffect(() => {
    if (!userDetails) return; // Do not fetch playlists if there is no user
    
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/v1/playlist/user/${userDetails.id}`,
          { withCredentials: true }
        );
        
        
        if (response.data.data.length > 0) setPlaylists(response.data.data);
      } catch (error) {
        console.log("Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [userDetails]);

  const handleCreatePlaylist = () => {
    setShowModal(true); // Show modal when create button is clicked
  };

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists([...playlists, newPlaylist]);
    setShowModal(false);
  };

  if (!userDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <p className="text-lg">Please login to access your playlists.</p>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-full max-w-6xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-100">Your Playlists</h2>
          <button
            onClick={handleCreatePlaylist}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow-md transition-transform transform hover:scale-105"
          >
            Create New Playlist
          </button>
        </div>
        <div className="px-6 pb-6">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <p className="text-gray-400 text-lg mb-4">No playlists found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="flex flex-col bg-slate-800 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-700 transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/playlist-videos/${playlist._id}`)}
                >
                  {/* Thumbnail */}
                <div className="relative h-40 bg-gray-700 flex items-center justify-center">
                  {playlist.videoDetails.length > 0 && playlist.videoDetails[0].thumbnail ? (
                    <img
                      src={playlist.videoDetails[0].thumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundColor: generateColorFromName(playlist.name),
                        color: "white",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    >
                      {playlist.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                    {playlist.videoDetails.length} videos
                  </div>
                </div>
{/* Playlist Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white truncate">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      {playlist.description || "No description"}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">Updated {playlist.updatedAt || "recently"}</p>
                    <p className="text-blue-400 text-xs mt-1">View full playlist</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <CreatePlaylist
          onClose={() => setShowModal(false)}
          onCreate={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default UserPlaylists;
