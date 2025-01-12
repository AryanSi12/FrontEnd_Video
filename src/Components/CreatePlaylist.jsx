import React from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

const CreatePlaylist = ({ onClose, onCreate }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { userDetails } = useSelector((state) => state.user);

  const onSubmit = async (data) => {
    console.log(data);
    
    try {
      const response = await axios.post(
        'http://localhost:7000/api/v1/playlist/',
        { name: data.playlistName, description: data.playlistDescription},
        { withCredentials: true }
      );
      onCreate(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Playlist</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('playlistName', { required: 'Playlist name is required' })}
            type="text"
            placeholder="Playlist Name"
            className="w-full p-2 mb-4 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none"
          />
          {errors.playlistName && <p className="text-red-500 mb-4">{errors.playlistName.message}</p>}

          <textarea
            {...register('playlistDescription', { required: 'Playlist description is required' })}
            placeholder="Playlist Description"
            className="w-full p-2 mb-4 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none"
          />
          {errors.playlistDescription && <p className="text-red-500 mb-4">{errors.playlistDescription.message}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylist;