export interface ContributionData {
  city_name: string
  latitude: number
  longitude: number
  description: string
  image_url: string
}

export interface ContributionResponse {
  id: string
  city_name: string
  latitude: number
  longitude: number
  image_url: string
  description: string
  created_at: string
}

// export interface UploadFileResponse {
//   url: string
// } 

export interface ContributionFormData {
  cityName: string
  description: string
  selectedFile: File | null
  imageUrl: string //for the cloudinary res
  selectedLocation: [number, number] | null
}

export interface ContributionState {
  isUploading: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  error: string
}
