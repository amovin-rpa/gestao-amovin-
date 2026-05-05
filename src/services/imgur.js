export async function uploadToImgur(file) {
  if (!file) return '';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: 'Client-ID 1482c3d5a9b4e3c'
      },
      body: formData
    });
    const data = await res.json();
    return data.data.link.replace('i.imgur.com', 'i.imgur.com/1200w.jpg'); // Otimiza
  } catch (error) {
    console.error('Erro foto Imgur:', error);
    return '';
  }
}
