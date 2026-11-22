/**
 * Client-Side Ultra-Compressed WebP Processor using HTML5 <canvas>
 * Resizes images to max 1200px and exports as highly-optimized WebP (quality 0.72)
 * Stored directly with the article record in Supabase PostgreSQL (zero CDN dependencies).
 */
export async function compressImageToDataUrlWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.72
): Promise<{ dataUrl: string; originalSizeKb: number; compressedSizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to create canvas rendering context'))
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/webp', quality)
        const originalSizeKb = Math.round(file.size / 1024)
        // Approximate base64 string size in KB
        const compressedSizeKb = Math.round((dataUrl.length * 0.75) / 1024)

        resolve({ dataUrl, originalSizeKb, compressedSizeKb })
      }

      img.onerror = () => reject(new Error('Failed to load image element'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.72
): Promise<Blob> {
  const { dataUrl } = await compressImageToDataUrlWebP(file, maxWidth, maxHeight, quality)
  const res = await fetch(dataUrl)
  return await res.blob()
}
