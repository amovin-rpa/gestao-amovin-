export async function uploadToImgur(file) {
  if (!file) return '';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('https://api.imgbb.com/1/upload?key=SUA_API_KEY_AQUI', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      return data.data.url;
    } else {
      console.error('Erro upload:', data);
      return '';
    }
  } catch (error) {
    console.error('Erro foto:', error);
    return '';
  }
}
