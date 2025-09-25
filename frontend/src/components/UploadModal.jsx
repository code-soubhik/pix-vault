import { useState } from 'react';
import { imageAPI } from '../api';

const buildFolderOptions = (folders, parentId = null, prefix = '') => {
  const options = [];
  folders.filter(f => f.parentId === parentId).forEach(folder => {
    options.push({ id: folder.id, name: prefix + folder.name });
    options.push(...buildFolderOptions(folders, folder.id, prefix + '  '));
  });
  return options;
};

const UploadModal = ({ isOpen, onClose, folders, onUpload, initialFolderId }) => {
  const [uploadType, setUploadType] = useState('single');
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(initialFolderId || '');
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

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (uploadType === 'single') {
        if (!file || !name.trim()) return;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('name', name);
        formData.append('filePath', selectedFolder || null);
        await imageAPI.uploadSingleImage(formData);
      } else {
        if (files.length === 0) return;
        const formData = new FormData();
        const paths = [];
        files.forEach(f => {
          formData.append('images', f);
          paths.push(f.webkitRelativePath);
        });
        formData.append('paths', JSON.stringify(paths));
        await imageAPI.uploadMultipleImages(formData);
      }
      onUpload();
      onClose();
      setFile(null);
      setFiles([]);
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
        <h2 className="text-lg font-bold mb-4">Upload Images</h2>
        <div className="mb-4">
          <label className="block mb-1">Upload Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="single"
                checked={uploadType === 'single'}
                onChange={(e) => setUploadType(e.target.value)}
                className="mr-2"
              />
              Single Image
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="multiple"
                checked={uploadType === 'multiple'}
                onChange={(e) => setUploadType(e.target.value)}
                className="mr-2"
              />
              Folder of Images
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {uploadType === 'single' && (
            <>
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
                  {buildFolderOptions(folders.filter(f => f.type === 'folder')).map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
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
            </>
          )}
          {uploadType === 'multiple' && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Select Folder (optional)</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Root Directory</option>
                  {buildFolderOptions(folders.filter(f => f.type === 'folder')).map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Image Folder</label>
                <div className="border-2 border-dashed p-4 rounded text-center border-gray-300">
                  <p>Select a folder containing images (supports nested folders)</p>
                  <input
                    type="file"
                    webkitdirectory="true"
                    multiple
                    accept="image/*"
                    onChange={handleFolderSelect}
                    className="hidden"
                    id="folder-input"
                  />
                  <label htmlFor="folder-input" className="cursor-pointer text-blue-500 underline block mt-2">
                    Select Folder
                  </label>
                  {files.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">{files.length} images selected</p>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" disabled={uploading || (uploadType === 'single' ? !file : files.length === 0)} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
