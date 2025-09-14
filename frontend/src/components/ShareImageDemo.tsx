import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateShareImage, downloadShareImage } from '../utils/shareImage'

export const ShareImageDemo = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleGenerateDemo = async () => {
    try {
      setIsGenerating(true)
      
      const demoData = {
        userName: 'Demo User',
        score: 7500,
        distance: 1.2,
        roundScore: 7500,
        tier: {
          tier: 'Perfect!',
          color: '#10b981',
          description: 'Incredible accuracy!'
        },
        isNewBest: true
      }
      
      const dataUrl = await generateShareImage(demoData)
      setGeneratedImage(dataUrl)
    } catch (error) {
      console.error('Error generating demo image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      downloadShareImage(generatedImage, 'gebeta-demo-score.png')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Share Image Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGenerateDemo}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Demo Image'}
        </Button>
        
        {generatedImage && (
          <div className="space-y-2">
            <img 
              src={generatedImage} 
              alt="Generated share image" 
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
  )
}
