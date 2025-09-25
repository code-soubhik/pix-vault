import { useState, useEffect } from 'react';
import { imageAPI } from '../api';
import CreateFolderModal from './CreateFolderModal';

const FolderTree = ({ onSelectFolder, selectedFolderId, onFoldersChange }) => {
  const [folders, setFolders] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [parentForNew, setParentForNew] = useState(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await imageAPI.getFolders();
      setFolders(data);
      if (onFoldersChange) onFoldersChange(data);
    } catch (error) {
      console.error('Failed to load folders', error);
    }
  };

  const toggleExpanded = (id) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCreateFolder = () => {
    setCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setCreateModalOpen(false);
    setParentForNew(null);
  };

  const handleFolderCreated = () => {
    loadFolders();
  };

  const renderTree = (items, level = 0) => {
    return items.map(item => (
      <div key={item._id} style={{ paddingLeft: level * 20 }}>
        <div className="flex items-center">
          {item.type === 'folder' && (
            <button onClick={() => toggleExpanded(item._id)} className="mr-2">
              {expanded.has(item._id) ? '▼' : '▶'}
            </button>
          )}
          <span
            className={`cursor-pointer ${selectedFolderId === item._id ? 'bg-blue-200' : ''}`}
            onClick={() => onSelectFolder(item)}
          >
            {item.type === 'folder' ? '📁' : '🖼️'} {item.name}
          </span>
          {item.type === 'folder' && (
            <button
              onClick={() => {
                setParentForNew(item._id);
                setCreateModalOpen(true);
              }}
              className="ml-2 text-sm text-blue-500"
            >
              + Folder
            </button>
          )}
        </div>
        {item.type === 'folder' && expanded.has(item._id) && (
          <div>
            {renderTree(item.children || [], level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Build tree structure
  const buildTree = (flat) => {
    const map = {};
    const roots = [];
    flat.forEach(item => {
      map[item._id] = { ...item, children: [] };
    });
    flat.forEach(item => {
      if (item.parentId) {
        map[item.parentId].children.push(map[item._id]);
      } else {
        roots.push(map[item._id]);
      }
    });
    return roots;
  };

  const tree = buildTree(folders);

  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="text-lg font-bold mb-4">Folders</h2>
      <button
        onClick={() => {
          setParentForNew(null);
          setCreateModalOpen(true);
        }}
        className="mb-2 text-sm text-blue-500"
      >
        + Root Folder
      </button>
      <div>{renderTree(tree)}</div>
      <CreateFolderModal
        isOpen={createModalOpen}
        onClose={handleModalClose}
        folders={folders}
        onCreate={handleFolderCreated}
        initialParentId={parentForNew}
      />
    </div>
  );
}


  export default FolderTree;
