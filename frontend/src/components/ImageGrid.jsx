const ImageGrid = ({ images }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {images.map(image => (
        <div key={image._id} className="bg-white rounded shadow">
          <img src={image.fileUrl} alt={image.name} className="w-full h-48 object-cover rounded-t" />
          <div className="p-2">
            <h3 className="font-bold">{image.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
