import React from 'react';

const ImageViewer = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
        >
          ×
        </button>
        <img
          src={image.imageSrc}
          alt={image.name}
          className="max-w-full max-h-full object-contain"
        />
        <div className="mt-4 text-white">
          <h3 className="text-lg font-bold">{image.name}</h3>
          <p>Size: {image.size} bytes</p>
          <p>Type: {image.mimetype}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
