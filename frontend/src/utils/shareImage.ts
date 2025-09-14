interface ShareImageData {
  userName: string
  score: number
  distance: number | null
  roundScore: number | null
  tier: {
    tier: string
    color: string
    description: string
  }
  isNewBest: boolean
}


export const generateShareImage = async (data: ShareImageData): Promise<string> => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Set canvas size for more vertical aspect ratio (600x800 for better mobile sharing)
  canvas.width = 600
  canvas.height = 800

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#f8fafc')
  gradient.addColorStop(1, '#e2e8f0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add subtle pattern overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
  for (let i = 0; i < canvas.width; i += 40) {
    for (let j = 0; j < canvas.height; j += 40) {
      if ((i + j) % 80 === 0) {
        ctx.fillRect(i, j, 1, 1)
      }
    }
  }

  // Header section - centered
  const headerY = 60
  const logoSize = 80
  const logoX = (canvas.width - logoSize) / 2
  
  // Load and draw logo
  try {
    const logo = await loadImage('/logo.svg')
    ctx.drawImage(logo, logoX, headerY, logoSize, logoSize)
    console.log('Logo loaded successfully')
  } catch (error) {
    console.log('Logo failed to load, using fallback:', error)
    // Fallback: draw a simple circle with "G" if logo fails to load
    // Draw circle background
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(logoX + logoSize/2, headerY + logoSize/2, logoSize/2, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw "G" text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('G', logoX + logoSize/2, headerY + logoSize/2 + 16)
  }

  // Game title - centered below logo
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Guess the Place', canvas.width / 2, headerY + logoSize + 35)

  // Subtitle - centered
  ctx.fillStyle = '#64748b'
  ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText('Can you recognize a corner of Ethiopia?', canvas.width / 2, headerY + logoSize + 65)

  // Main content area - centered
  const contentY = headerY + logoSize + 100

  // User name - centered
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Great job, ${data.userName}!`, canvas.width / 2, contentY)

  // Score tier with background - centered
  const tierY = contentY + 40
  const tierWidth = 280
  const tierHeight = 80
  const tierX = (canvas.width - tierWidth) / 2
  
  // Get proper tier colors based on score
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Perfect!': return { bg: '#000000', text: '#ffffff' }
      case 'Excellent': return { bg: '#374151', text: '#ffffff' }
      case 'Great': return { bg: '#4b5563', text: '#ffffff' }
      case 'Good': return { bg: '#9ca3af', text: '#000000' }
      case 'Fair': return { bg: '#d1d5db', text: '#000000' }
      case 'Miss': return { bg: '#e5e7eb', text: '#000000' }
      default: return { bg: '#6b7280', text: '#ffffff' }
    }
  }
  
  const tierColors = getTierColor(data.tier.tier)
  
  // Tier background - solid color instead of transparent
  ctx.fillStyle = tierColors.bg
  ctx.fillRect(tierX, tierY, tierWidth, tierHeight)
  
  // Tier border
  ctx.strokeStyle = tierColors.bg
  ctx.lineWidth = 2
  ctx.strokeRect(tierX, tierY, tierWidth, tierHeight)
  
  // Tier text
  ctx.fillStyle = tierColors.text
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.tier.tier, canvas.width / 2, tierY + 35)

  // Tier description
  ctx.fillStyle = tierColors.text === '#ffffff' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(data.tier.description, canvas.width / 2, tierY + 60)

  // Score section - centered
  const scoreY = tierY + tierHeight + 50
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Your Score', canvas.width / 2, scoreY)

  // Score value - large and centered
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(`${data.score} points`, canvas.width / 2, scoreY + 60)

  // Additional details - centered in two columns
  const detailsY = scoreY + 100
  ctx.fillStyle = '#64748b'
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'

  if (data.distance !== null) {
    ctx.fillText(`Distance: ${data.distance.toFixed(1)} km`, canvas.width / 2 - 60, detailsY)
  }
  
  if (data.roundScore !== null) {
    ctx.fillText(`Round Score: ${data.roundScore} pts`, canvas.width / 2 + 60, detailsY)
  }

  // New best badge - centered below score
  if (data.isNewBest) {
    const badgeY = scoreY + 80
    const badgeWidth = 180
    const badgeHeight = 35
    const badgeX = (canvas.width - badgeWidth) / 2
    
    // Badge background
    ctx.fillStyle = '#10b981'
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight)
    
    // Badge text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('NEW BEST!', canvas.width / 2, badgeY + 22)
  }

  // Bottom section with "Powered by Gebeta" and date
  const bottomY = canvas.height - 40
  ctx.fillStyle = '#64748b'
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Powered by Gebeta', canvas.width / 2, bottomY)
  
  // Add date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  ctx.fillStyle = '#9ca3af'
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(currentDate, canvas.width / 2, bottomY + 18)

  // Add some subtle geometric patterns only
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)'
  for (let i = 0; i < 4; i++) {
    const x = 80 + (i % 2) * 440
    const y = 300 + Math.floor(i / 2) * 400
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas.toDataURL('image/png')
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      console.log('Image loaded:', src, 'dimensions:', img.width, 'x', img.height)
      resolve(img)
    }
    img.onerror = (error) => {
      console.error('Failed to load image:', src, error)
      reject(error)
    }
    img.src = src
  })
}

export const downloadShareImage = (dataUrl: string, fileName: string = 'gebeta-score.png') => {
  // Check if we're in Telegram WebApp
  const webApp = (window as any).Telegram?.WebApp
  
  if (webApp) {
    // In Telegram, use the official downloadFile method
    if (webApp.downloadFile) {
      try {
        // Convert data URL to blob and create a temporary URL
        fetch(dataUrl).then(response => response.blob()).then(blob => {
          const blobUrl = URL.createObjectURL(blob)
          
          // Use the official downloadFile method
          webApp.downloadFile({
            url: blobUrl,
            filename: fileName
          }, (success: boolean) => {
            if (success) {
              webApp.showAlert('Download started!')
            } else {
              webApp.showAlert('Download cancelled or failed.')
            }
            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl)
          })
        }).catch(() => {
          // Fallback to bot integration
          downloadViaBot(webApp, dataUrl, fileName)
        })
      } catch (error) {
        // Fallback to bot integration
        downloadViaBot(webApp, dataUrl, fileName)
      }
    } else {
      // Fallback to bot integration if downloadFile not available
      downloadViaBot(webApp, dataUrl, fileName)
    }
    return
  }
  
  // Regular browser download - simple and reliable approach
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadViaBot = (webApp: any, dataUrl: string, fileName: string) => {
  try {
    // Convert data URL to base64
    const base64 = dataUrl.split(',')[1]
    
    // Send image data to bot for download
    webApp.sendData(JSON.stringify({
      type: 'download_score',
      action: 'download_image',
      image: base64,
      filename: fileName,
      timestamp: Date.now()
    }))
    
    // Show confirmation
    webApp.showAlert('Image sent to bot! Check your chat to download the image.')
    
  } catch (error) {
    console.error('Error downloading via bot:', error)
    // Final fallback: show alert with instructions
    webApp.showAlert('Image ready! Long-press the image above to save it to your device.')
  }
}

export const shareImage = async (data: ShareImageData) => {
  try {
    const dataUrl = await generateShareImage(data)
    
    // Check if we're in Telegram WebApp
    const isTelegram = (window as any).Telegram?.WebApp
    
    if (isTelegram) {
      // Use Telegram's sharing methods
      await shareInTelegram(dataUrl, data)
      return
    }
    
    // For regular browsers, try native sharing first
    if (navigator.share && navigator.canShare) {
      try {
        // Convert data URL to blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], 'gebeta-score.png', { type: 'image/png' })
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Gebeta Score!',
            text: `I scored ${data.score} points in Guess the Place! Can you beat my score?`,
            files: [file]
          })
          return
        }
      } catch (shareError) {
        console.log('Native sharing failed, falling back to download')
      }
    }
    
    // Fallback to download for regular browsers
    downloadShareImage(dataUrl)
  } catch (error) {
    console.error('Error sharing image:', error)
    throw error
  }
}

const shareInTelegram = async (dataUrl: string, data: ShareImageData) => {
  try {
    const webApp = (window as any).Telegram?.WebApp
    
    if (webApp) {
      // Create share text for Telegram
      const shareText = `🎯 *My Gebeta Score!*\n\n` +
        `Score: ${data.score} points\n` +
        `Distance: ${data.distance ? `${Math.round(data.distance)}km` : 'Unknown'}\n` +
        `Tier: ${data.tier.tier}\n` +
        `${data.isNewBest ? '🏆 NEW BEST!' : ''}\n\n` +
        `Can you beat my score? Play now!`
      
      // Create a shareable URL with the text
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/gebeta_bot')}&text=${encodeURIComponent(shareText)}`
      
      // Use the correct Telegram method
      webApp.openTelegramLink(shareUrl)
      
    } else {
      // Fallback: open share URL in regular browser
      const shareText = `🎯 My Gebeta Score! Score: ${data.score} points. Can you beat my score?`
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/gebeta_bot')}&text=${encodeURIComponent(shareText)}`
      window.open(shareUrl, '_blank')
    }
    
  } catch (error) {
    console.error('Error sharing in Telegram:', error)
    // Fallback to showing the image in a new tab
    window.open(dataUrl, '_blank')
  }
}
