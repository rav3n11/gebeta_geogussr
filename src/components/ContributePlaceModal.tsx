import { useRef, useCallback } from 'react'
import { memo } from 'react'
import GebetaMap from '@gebeta/tiles'
import type { GebetaMapRef } from '@gebeta/tiles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Upload, X,  Image as ImageIcon } from 'lucide-react'
import { useContributionForm, useFileUpload, useContributionSubmission } from '@/hooks/useContribution'

interface ContributePlaceModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ContributePlaceModal = memo(({ isOpen, onClose }: ContributePlaceModalProps) => {
  const mapRef = useRef<GebetaMapRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { formData, state, updateFormData, setError, clearError, setStateUpdates, resetForm } = useContributionForm()
  const { handleFileSelect, handleUpload } = useFileUpload()
  const { handleSubmit } = useContributionSubmission()

  const handleMapClick = useCallback((lngLat: [number, number]) => {
    updateFormData({ selectedLocation: lngLat })
    clearError()
    

    if (mapRef.current) {
      mapRef.current.clearMarkers()
      mapRef.current.addImageMarker(
        lngLat,
        '/pin.png', 
        [30, 30], 
        undefined, 
        10, 
        '<b>Selected ocation</b>' 
      )
    }
  }, [updateFormData, clearError])

  const handleFileSelectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validatedFile = handleFileSelect(file, setError)
      if (validatedFile) {
        updateFormData({ selectedFile: validatedFile })
      }
    }
  }, [handleFileSelect, setError, updateFormData])

  const handleUploadClick = useCallback(() => {
    if (!formData.selectedFile) {
      setError('please select an image file')
      return
    }

    handleUpload(
      formData.selectedFile,
      (url) => updateFormData({ imageUrl: url }),
      setError,
      setStateUpdates
    )
  }, [formData.selectedFile, handleUpload, setError, updateFormData, setStateUpdates])

  const handleSubmitClick = useCallback(() => {
    handleSubmit(
      formData,
      () => {
        setStateUpdates({ isSubmitted: true })
       
        setTimeout(() => {
        
          if (mapRef.current) {
            mapRef.current.clearMarkers()
          }
          resetForm()
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          onClose()
        }, 3000)
      },
      setError,
      setStateUpdates
    )
  }, [formData, handleSubmit, setError, setStateUpdates, resetForm, onClose])

  const handleClose = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.clearMarkers()
    }
    resetForm()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }, [resetForm, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-2 sm:p-4">
      {state.isSubmitted && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
            <div>
              <p className="text-sm font-medium text-green-700">Contribution submitted</p>
              <p className="text-xs text-green-700/80">Thanks for contributing! Closing…</p>
            </div>
          </div>
        </div>
      )}
      <Card className="w-full max-w-6xl mx-auto shadow-2xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-black" />
              <CardTitle className="text-xl text-black">Contribute a Place</CardTitle>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <CardDescription className="text-gray-600 mt-2">
            Click on the map to select a location, then fill in the details below
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row h-[70vh]">
            
            <div className="relative bg-gray-100 flex-1 lg:w-1/2 min-h-[40vh] lg:min-h-full">
              <GebetaMap
                ref={mapRef}
                apiKey={import.meta.env.VITE_GEBETA_MAPS_API_KEY}
                center={[38.7685, 9.0161]} 
                zoom={6}
                onMapClick={handleMapClick}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

           
            <div className="lg:w-1/2 p-3 lg:p-6 overflow-y-auto max-h-[30vh] lg:max-h-full">
              <div className="space-y-3 lg:space-y-4">
                {state.error && (
                  <div className="p-2 lg:p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{state.error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    City Name *
                  </label>
                  <input
                    type="text"
                    value={formData.cityName}
                    onChange={(e) => updateFormData({ cityName: e.target.value })}
                    placeholder="e.g., Addis Ababa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Describe the location (e.g., Street near the stadium)"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Image Upload *
                  </label>
                  <div className="space-y-2 lg:space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelectChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    />
                    
                    {formData.selectedFile && (
                      <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <ImageIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{formData.selectedFile.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({(formData.selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleUploadClick}
                          disabled={state.isUploading || !!formData.imageUrl}
                          size="sm"
                          variant="outline"
                          className="ml-2 flex-shrink-0"
                        >
                          {state.isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-black mr-1"></div>
                              <span className="hidden sm:inline">Uploading...</span>
                            </>
                          ) : formData.imageUrl ? (
                            '✓'
                          ) : (
                            'Upload'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {formData.imageUrl && (
                      <div className="p-2 lg:p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-600 mb-2">Image uploaded successfully!</p>
                        <img 
                          src={formData.imageUrl} 
                          alt="Uploaded preview" 
                          className="w-full h-20 lg:h-24 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {formData.selectedLocation && (
                  <div className="p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs lg:text-sm text-blue-600">
                      Selected: {formData.selectedLocation[1].toFixed(4)}, {formData.selectedLocation[0].toFixed(4)}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 pt-2 lg:pt-4">
                  <Button 
                    onClick={handleSubmitClick}
                    disabled={state.isSubmitting || state.isUploading || !formData.selectedLocation || !formData.imageUrl}
                    className="flex-1 bg-black text-white hover:bg-gray-800 text-sm lg:text-base"
                  >
                    {state.isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        <span className="hidden sm:inline">Submitting...</span>
                        <span className="sm:hidden">Submitting</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Submit Contribution</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleClose}
                    variant="outline"
                    className="px-4 lg:px-6 text-sm lg:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ContributePlaceModal.displayName = 'ContributePlaceModal'
