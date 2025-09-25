import { useState, useEffect } from 'react';
import { imageAPI } from '../api';
import CreateFolderModal from './CreateFolderModal';

const FolderTree = ({ onSelectFolder, selectedFolderId, onFoldersChange, onDropOnFolder, onCreateFolderClick, onUploadClick }) => {
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
      <div key={item.id} style={{ paddingLeft: level * 20 }}>
        <div className="flex items-center">
          {item.type === 'folder' && (
            <button onClick={() => toggleExpanded(item.id)} className={`cursor-pointer mr-2 ${expanded.has(item.id) ? 'rotate-90' : ''}`}>
              {">"}
            </button>
          )}
          <span
            className={`cursor-pointer ${selectedFolderId === item.id ? 'bg-blue-200' : ''}`}
            onClick={() => onSelectFolder(item)}
            onDrop={(e) => item.type === 'folder' && onDropOnFolder && onDropOnFolder(item.id, e)}
            onDragOver={(e) => item.type === 'folder' && e.preventDefault()}
          >
            {item.type === 'folder' ? '📁' : '🖼️'} {item.name}
          </span>
          {item.type === 'folder' && (
            <button
              onClick={() => {
                setParentForNew(item.id);
                setCreateModalOpen(true);
              }}
              className="ml-2 text-sm text-blue-500"
            >
              + Folder
            </button>
          )}
        </div>
        {item.type === 'folder' && expanded.has(item.id) && (
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
      map[item.id] = { ...item, children: [] };
    });
    flat.forEach(item => {
      if (item.parentId) {
        if (map[item.parentId]) {
          map[item.parentId].children.push(map[item.id]);
        }
      } else {
        roots.push(map[item.id]);
      }
    });
    return roots;
  };

  const tree = buildTree(folders);

  return (
    <div className="w-64 h-[90vh] overflow-y-auto bg-gray-100 p-4">
      <h2 className="text-lg font-bold mb-4">Folders</h2>
      <div className="flex space-x-2 mb-2">
        <button
          onClick={onCreateFolderClick}
          className="text-sm text-blue-500 hover:underline"
        >
          + Create Folder
        </button>
        <button
          onClick={onUploadClick}
          className="text-sm text-green-500 hover:underline"
        >
          + Upload File
        </button>
      </div>
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
