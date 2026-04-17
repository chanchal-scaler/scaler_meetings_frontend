export default async function convertToWebp(file) {
  if (file?.type === 'image/webp' || !file?.type?.includes('image')) {
    return file;
  }
  // Load the file into an image element
  const image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = reader.result;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });

  // Create a new canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set the canvas dimensions to match the image
  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Convert the canvas to a WebP blob
  const webpBlob = await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/webp', 0.7);
  });

  // Convert the blob to a File object with the
  // same name and type as the original file
  const name = file.name.split('.')[0];
  return new File([webpBlob], `${name}.webp`, { type: 'image/webp' });
}
