/**
 * Client-Side Image Compressor using HTML5 <canvas>
 * Resizes any image to a maximum dimension of 1600px and exports as clean WebP (quality 0.82)
 * Typically yields ~100-250 KB files with zero server processing overhead.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<Blob> {
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
            maxHeight = maxHeight
            height = Math.round((height * maxHeight) / img.height)
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

        // Apply smooth bilinear scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas to WebP conversion failed'))
            }
          },
          'image/webp',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image element'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}
