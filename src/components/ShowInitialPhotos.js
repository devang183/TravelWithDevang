export default function FourPhotosGrid() {
    const photos=[
      'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg',
      'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg',
      'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg',
      'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/dublin/dublin29.jpg',
    ];
    return (
      <div className="grid grid-cols-4 gap-4 rounded-lg mb-4 w-full">
        {photos.map((src, i) => (
          <img key={i} src={src} alt={`Photo ${i + 1}`} className="rounded shadow transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl" />
        ))}
      </div>
    );
  }
  