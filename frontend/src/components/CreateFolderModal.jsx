import { useState } from 'react';
import { imageAPI } from '../api';

const CreateFolderModal = ({ isOpen, onClose, folders, onCreate, initialParentId }) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(initialParentId || '');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await imageAPI.createFolder({ name, parentId: parentId || null });
      onCreate();
      onClose();
      setName('');
      setParentId('');
    } catch (error) {
      console.error('Failed to create folder', error);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Create Folder</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Parent Folder (optional)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Root Directory</option>
              {folders.filter(f => f.type === 'folder').map(folder => (
                <option key={folder._id} value={folder._id}>{folder.path}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
