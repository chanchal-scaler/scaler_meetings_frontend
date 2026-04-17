export const imgToBase64 = (url) => new Promise((resolve, reject) => {
  if (url.substring(0, 19) === 'data:image/svg+xml;') {
    resolve(url);
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = error => reject(error);
  fetch(url, {
    method: 'GET',
    cache: 'no-cache',
  }).then(resp => resp.blob())
    .then(blobResp => reader.readAsDataURL(blobResp))
    .catch((error) => reject(error));
});

export const createFileFromUrl = async (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];
  const blob = await (await fetch(dataurl)).blob();
  return new File([blob], filename, { type: mime });
};
