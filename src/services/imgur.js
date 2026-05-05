export async function uploadToImgur(file) {
  if (!file) return '';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('https://api.imgbb.com/1/upload?key=060960c4dbe92c7d945e2c79dc923324', {
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
