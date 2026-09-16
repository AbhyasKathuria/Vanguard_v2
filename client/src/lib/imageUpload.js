export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'vanguard_unsigned')
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo')
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Upload failed:', error)
    // Fallback: convert to base64 data URL for local display
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  }
}

export async function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result.split(',')[1])
    reader.readAsDataURL(file)
  })
}
