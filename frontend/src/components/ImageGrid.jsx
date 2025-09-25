const ImageGrid = ({ images, onDragStart, showThumbnails = true, onDeleteImage, onImageClick }) => {
  return (
    <div className="space-y-2 p-4">
      {images.map(image => (
        <div
          key={image.id}
          className="bg-white rounded shadow cursor-move relative flex items-center p-2"
          draggable
          onDragStart={(e) => onDragStart && onDragStart(e, image.id)}
        >
          {showThumbnails ? (
            <img
              src={image.fileUrl}
              alt={image.name}
              className="w-16 h-16 object-cover rounded mr-4 cursor-pointer"
              onClick={() => onImageClick && onImageClick(image)}
            />
          ) : (
            <div
              className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded mr-4 cursor-pointer"
              onClick={() => onImageClick && onImageClick(image)}
            >
              🖼️
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold cursor-pointer" onClick={() => onImageClick && onImageClick(image)}>{image.name}</h3>
            <p className="text-sm text-gray-600">{image.size} bytes</p>
          </div>
          {onDeleteImage && (
            <button
              onClick={() => onDeleteImage(image.id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
