import { generateShareImage } from '../shareImage'

// Mock canvas and image loading
const mockCanvas = {
  width: 1200,
  height: 630,
  getContext: jest.fn(() => ({
    fillStyle: '',
    font: '',
    textAlign: '',
    fillRect: jest.fn(),
    fillText: jest.fn(),
    drawImage: jest.fn(),
    strokeStyle: '',
    lineWidth: 0,
    beginPath: jest.fn(),
    arc: jest.fn(),
    stroke: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn()
    })),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image-data')
  }))
}

const mockImage = {
  crossOrigin: '',
  onload: null as (() => void) | null,
  onerror: null as ((error: any) => void) | null,
  src: ''
}

// Mock document.createElement
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas
    }
    if (tagName === 'img') {
      return mockImage
    }
    return {}
  })
})

// Mock Image constructor
global.Image = jest.fn(() => mockImage) as any

// Mock fetch for data URL conversion
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob(['mock-image-data'], { type: 'image/png' }))
  })
) as any

describe('shareImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate a share image with correct data', async () => {
    const mockData = {
      userName: 'Test User',
      score: 5000,
      distance: 2.5,
      roundScore: 5000,
      tier: {
        tier: 'Perfect!',
        color: '#10b981',
        description: 'Incredible accuracy!'
      },
      isNewBest: true
    }

    const result = await generateShareImage(mockData)

    expect(result).toBe('data:image/png;base64,mock-image-data')
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
  })

  it('should handle missing distance gracefully', async () => {
    const mockData = {
      userName: 'Test User',
      score: 0,
      distance: null,
      roundScore: null,
      tier: {
        tier: 'Unknown',
        color: '#64748b',
        description: 'No distance calculated'
      },
      isNewBest: false
    }

    const result = await generateShareImage(mockData)

    expect(result).toBe('data:image/png;base64,mock-image-data')
  })
})
