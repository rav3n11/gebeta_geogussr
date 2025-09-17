import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ImageViewProps {
  imageUrl: string
  timeLeft: number
}

export const ImageView = memo(({ imageUrl, timeLeft }: ImageViewProps) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center justify-between text-black">
            <div className="flex items-center gap-2">
              Memorize this place...
            </div>
            {timeLeft > 0 && (
              <div className="text-2xl font-bold text-black">
                {timeLeft}
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">
            You'll need to find this place on the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-hidden rounded-md border border-gray-200 bg-black">
            <div className="w-full h-[60vh] flex items-center justify-center bg-black">
              <img 
                src={imageUrl} 
                alt="Contribution" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ImageView.displayName = 'ImageView'

