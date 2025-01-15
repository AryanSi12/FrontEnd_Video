import React from "react";
import { useLocation, Link } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const suggestions = location.state?.suggestions || []; // Retrieve suggestions from state

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-4">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      {suggestions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {suggestions.map((video) => (
            <div
              key={video._id}
              className="bg-gray-800 rounded-lg shadow-md flex items-start p-4 hover:bg-gray-700 transition duration-200"
            >
              {/* Thumbnail */}
              <Link to={`/video/${video._id}`} className="mr-4 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-36 h-20 object-cover rounded-md"
                />
              </Link>

              {/* Video Details */}
              <div className="flex flex-col justify-between flex-grow">
                <Link to={`/video/${video._id}`} className="hover:underline">
                  <h3
                    className="text-lg font-semibold text-white mb-2 truncate"
                    title={video.title}
                  >
                    {video.title}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {video.description || "No description available"}
                </p>
                <Link
                  to={`/video/${video._id}`}
                  className="text-blue-500 hover:underline text-sm mt-auto"
                >
                  Watch Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-400">No results found!</p>
      )}
    </div>
  );
};

export default SearchResults;
