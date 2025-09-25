import React, { useState, useEffect } from 'react';
import FolderTree from '../components/FolderTree';
import ImageGrid from '../components/ImageGrid';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import ImageViewer from '../components/ImageViewer';
import { imageAPI } from '../api';
import Header from '../components/Header';

const Breadcrumb = ({ path, onNavigate }) => {
  return (
    <div className="flex items-center space-x-2 mb-4 p-4 border-b">
      {path.map((item, index) => (
        <React.Fragment key={item.id || 'root'}>
          {index > 0 && <span className="text-gray-500">/</span>}
          <button
            onClick={() => onNavigate(item.id)}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [rootContents, setRootContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createParent, setCreateParent] = useState(null);
  const [currentPath, setCurrentPath] = useState([{ id: null, name: 'Home' }]);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchImages(searchTerm);
    } else if (selectedFolder) {
      loadImages(selectedFolder.id);
    } else {
      loadRootContents();
    }
  }, [selectedFolder, searchTerm]);

  useEffect(() => {
    setCurrentPath(buildPath(selectedFolder));
  }, [selectedFolder, folders]);

  const buildPath = (folder) => {
    const path = [];
    let current = folder;
    while (current) {
      path.unshift({ id: current.id, name: current.name });
      current = folders.find(f => f.id === current.parentId);
    }
    path.unshift({ id: null, name: 'Home' });
    return path;
  };

  const handleBreadcrumbNavigate = (folderId) => {
    if (folderId === null) {
      setSelectedFolder(null);
    } else {
      const folder = folders.find(f => f.id === folderId);
      setSelectedFolder(folder);
    }
  };

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

  const loadRootImages = async () => {
    try {
      const data = await imageAPI.getRootImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to load root images', error);
    }
  };

  const loadRootContents = async () => {
    try {
      const data = await imageAPI.getRootContents();
      setRootContents(data);
      const images = data.filter(item => item.type === 'image');
      setImages(images);
    } catch (error) {
      console.error('Failed to load root contents', error);
    }
  };

  const searchImages = async (query) => {
    try {
      const data = await imageAPI.searchImages(query, selectedFolder?.id);
      setImages(data);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const handleUpload = () => {
    loadFolders();
    if (selectedFolder) {
      loadImages(selectedFolder.id);
    } else {
      loadRootContents();
    }
  };

  const handleFolderCreated = async () => {
    await loadFolders();
    if (selectedFolder) {
      loadImages(selectedFolder.id);
    } else {
      loadRootContents();
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await imageAPI.deleteFolder(folderId);
        loadFolders();
        if (selectedFolder) {
          loadImages(selectedFolder.id);
        } else {
          loadRootContents();
        }
      } catch (error) {
        console.error('Delete failed', error);
        alert('Failed to delete folder');
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imageAPI.deleteImage(imageId);
        if (selectedFolder) {
          loadImages(selectedFolder.id);
        } else {
          loadRootContents();
        }
      } catch (error) {
        console.error('Delete failed', error);
        alert('Failed to delete image');
      }
    }
  };

  const handleImageDragStart = (e, imageId) => {
    e.dataTransfer.setData('imageId', imageId);
  };

  const handleDropOnFolder = async (folderId, e) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData('imageId');
    if (imageId) {
      try {
        await imageAPI.moveImage({ imageId, folderId });
        loadFolders();
        if (selectedFolder) {
          loadImages(selectedFolder.id);
        } else {
          loadRootImages();
        }
      } catch (error) {
        console.error('Move failed', error);
      }
    }
  };

  const onCreateFolderClick = () => {
    setCreateParent(null);
    setCreateModalOpen(true);
  };

  const onUploadClick = () => {
    setUploadModalOpen(true);
  };

  const getImage = async (img) => {
    const data = await imageAPI.getImage(img.id);
    setSelectedImage(data);
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  };

  const subfolders = selectedFolder ? folders.filter(f => f.parentId === selectedFolder.id) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <FolderTree
          onSelectFolder={setSelectedFolder}
          selectedFolderId={selectedFolder?.id}
          onFoldersChange={loadFolders}
          onDropOnFolder={handleDropOnFolder}
          onCreateFolderClick={onCreateFolderClick}
          onUploadClick={onUploadClick}
        />
        <main className="flex-1 overflow-y-auto">
          <Breadcrumb path={currentPath} onNavigate={handleBreadcrumbNavigate} />
          <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search images by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border rounded mr-4"
              />
            </div>
            {searchTerm ? (
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">Search Results</h3>
                <div className="space-y-1">
                  {images.map(img => (
                    <div
                      key={img.id}
                      className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                      onClick={() => getImage(img)}
                    >
                      📝 {highlightText(img.name, searchTerm)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {selectedFolder && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2">Subfolders</h3>
                    <div className="space-y-1">
                      {subfolders.map(folder => (
                        <div
                          key={folder.id}
                          className="cursor-pointer flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                        >
                          <span onClick={() => setSelectedFolder(folder)}>📁 {folder.name}</span>
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!selectedFolder && rootContents.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2">Root Folders</h3>
                    <div className="space-y-1">
                      {rootContents.filter(item => item.type === 'folder').map(folder => (
                        <div
                          key={folder.id}
                          className="cursor-pointer flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                        >
                          <span onClick={() => setSelectedFolder(folder)}>📁 {folder.name}</span>
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      {rootContents.filter(item => item.type === 'image').map(img => (
                        <div
                          key={img.id}
                          className="cursor-pointer flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                        >
                          <span onClick={() => getImage(img)}>📝 {img.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folders={folders}
        onUpload={handleUpload}
        initialFolderId={selectedFolder?.id}
      />
      <CreateFolderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        folders={folders}
        onCreate={handleFolderCreated}
        initialParentId={createParent}
      />
      <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default Dashboard;
