import { useState } from 'react';
import { imageAPI } from '../api';

const UploadModal = ({ isOpen, onClose, folders, onUpload }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setName(droppedFile.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', name);
      formData.append('filePath', selectedFolder || null);
      await imageAPI.uploadSingleImage(formData);
      onUpload();
      onClose();
      setFile(null);
      setName('');
      setSelectedFolder('');
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Upload Image</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Image Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Select Folder (optional)</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Root Directory</option>
              {folders.filter(f => f.type === 'folder').map(folder => (
                <option key={folder._id} value={folder._id}>{folder.path}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Image File</label>
            <div
              className={`border-2 border-dashed p-4 rounded text-center ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {file ? (
                <p>{file.name}</p>
              ) : (
                <p>Drag and drop an image here, or click to select</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer text-blue-500 underline">
                Select File
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
