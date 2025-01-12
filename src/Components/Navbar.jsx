import React, { useState, useEffect } from "react";
import { FiSearch, FiLogIn, FiUserPlus, FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProfileMenu from './ProfileMenu';
import axios from 'axios';
import { clearUserDetails } from "../Redux/userSlice";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const { userDetails, isLoggedIn } = useSelector((state) => state.user);
  const [videos, setVideos] = useState([]);
  const [sugg,setSugg] = useState([])
  const [noResults,setNoResults]=useState(false)
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/v1/videos/video/random-videos?page=1&limit=100&sortBy=createdAt&sortType=1",
          { withCredentials: true },
        );
        setVideos(response.data.data.videos);
      } catch (error) {
        console.log(error);
        
      }
    };
    fetchVideos();
    const validateToken = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/v1/users/current-user', {
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
  }, []);

  const HandleChange = (e) =>{
    const query=e.target.value;
    console.log(videos);
    if(videos.length > 0){
      const suggestions = videos.filter(video => video.title.toLowerCase().includes(query.toLowerCase()))
      setSugg(suggestions)
    }
    else{
      setSugg([])
    }
    
  }

  const handleSubmit = () => {

  }

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:7000/api/v1/users/logout', null, {
        withCredentials: true,
      });
      dispatch(clearUserDetails());
    } catch (error) {
      console.error("Error in logging out:", error.message);
    }
  };

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="bg-slate-950 text-white shadow-md">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center">
          <img
            src="Logo_VideoPlayer.jpg"
            alt="Logo"
            className="w-10 h-10 object-cover"
          />
          <span className="ml-2 text-xl font-semibold text-gray-300">MyApp</span>
        </div>

        {/* Hamburger Menu */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center w-1/2">
  <div className="relative w-full">
    <input
      type="text"
      placeholder="Search"
      onChange={HandleChange}
      className="w-full px-4 py-2 pl-10 rounded-md bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
    />
    <FiSearch
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      size={20}
    />
    {noResults && (
      <p className="block text-xl mt-2 text-red-500 font-medium">
        No Results Found!
      </p>
    )}
    <div className="relative">
      <ul className="absolute z-10 w-full mt-2 rounded-md bg-gray-900 shadow-lg max-h-60 overflow-y-auto">
        {!noResults &&
          sugg &&
          sugg.map((suggest) => (
            <li
              key={suggest.title}
              className="px-4 py-2 flex items-center text-gray-200 hover:bg-gray-700 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <Link
                to={`/video/${suggest._id}`}
                className="flex items-center gap-2 w-full"
              >
                <span className="truncate">{suggest.title}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  </div>
  <button
  onChange={handleSubmit}
  className="ml-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-300">
    Search
  </button>
</div>

        <div className="hidden md:flex items-center">
          {isLoggedIn ? (
            <ProfileMenu userDetails={userDetails} onLogout={handleLogout} />
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                <FiLogIn size={20} />
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                <FiUserPlus size={20} />
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-slate-950 text-white px-6 pb-4">
          <div className="md:hidden flex flex-col bg-slate-950 text-white px-6 pb-4">
          <div className="flex items-center gap-4 mt-4">
            <input
              type="text"
              placeholder="Search"
              onChange={HandleChange}
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button
            onChange={handleSubmit}
            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-all duration-300">
              Search
            </button>
          </div>
          {noResults && (
            <p className="mt-4 text-center text-lg font-medium text-red-500">
              No Results Found!
            </p>
          )}
          <div className="relative mt-2">
            <ul className="absolute w-full mt-2 bg-gray-900 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
              {!noResults &&
                sugg &&
                sugg.map((suggest) => (
                  <li
                    key={suggest.title}
                    className="px-4 py-2 flex items-center text-gray-200 hover:bg-gray-700 hover:text-white transition-all duration-200 cursor-pointer"
                  >
                    <Link
                      to={`/post/${suggest.$id}`}
                      className="flex items-center gap-2 w-full"
                    >
                      <span className="truncate">{suggest.title}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        {isLoggedIn ? (
            <div className="mt-4">
              <ProfileMenu userDetails={userDetails} onLogout={handleLogout} />
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                <FiLogIn size={20} />
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                <FiUserPlus size={20} />
                Signup
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
