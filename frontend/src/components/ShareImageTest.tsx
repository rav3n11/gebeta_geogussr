import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateShareImage, downloadShareImage } from '../utils/shareImage'

export const ShareImageTest = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleGenerateTest = async () => {
    try {
      setIsGenerating(true)
      
      const testData = {
        userName: 'Test User',
        score: 8500,
        distance: 0.8,
        roundScore: 8500,
        tier: {
          tier: 'Perfect!',
          color: '#10b981',
          description: 'Incredible accuracy!'
        },
        isNewBest: true
      }
      
      const dataUrl = await generateShareImage(testData)
      setGeneratedImage(dataUrl)
    } catch (error) {
      console.error('Error generating test image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      downloadShareImage(generatedImage, 'gebeta-vertical-test.png')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Vertical Share Image Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGenerateTest}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Vertical Test Image'}
          </Button>
          
          {generatedImage && (
            <div className="space-y-2">
              <img 
                src={generatedImage} 
                alt="Generated vertical share image" 
                className="w-full rounded-lg border"
              />
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="w-full"
              >
                Download Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
