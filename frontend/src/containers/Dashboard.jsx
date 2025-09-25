import React, { useState, useEffect } from 'react';
import FolderTree from '../components/FolderTree';
import ImageGrid from '../components/ImageGrid';
import UploadModal from '../components/UploadModal';
import { imageAPI } from '../api';
import Header from '../components/Header';

const Dashboard = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchImages(searchTerm);
    } else if (selectedFolder) {
      loadImages(selectedFolder._id);
    } else {
      setImages([]);
    }
  }, [selectedFolder, searchTerm]);

  const loadFolders = async () => {
    try {
      const data = await imageAPI.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders', error);
    }
  };

  const loadImages = async (folderId) => {
    try {
      const data = await imageAPI.getImagesByFolder(folderId);
      setImages(data);
    } catch (error) {
      console.error('Failed to load images', error);
    }
  };

  const searchImages = async (query) => {
    try {
      const data = await imageAPI.searchImages(query);
      setImages(data);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleUpload = () => {
    loadFolders();
    if (selectedFolder) {
      loadImages(selectedFolder._id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <FolderTree onSelectFolder={setSelectedFolder} selectedFolderId={selectedFolder?._id} onFoldersChange={loadFolders} />
        <main className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search images by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded mr-4"
            />
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Upload Image
            </button>
          </div>
          <ImageGrid images={images} />
        </main>
      </div>
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folders={folders}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default Dashboard;
