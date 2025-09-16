import type { ContributionData, ContributionResponse } from '../types/contribution'


export const uploadFile = async (file: File): Promise<string> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error('Missing Cloudinary config')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`cloudinary upload failed: ${response.status} ${text}`)
    }

    const data = await response.json() as { secure_url?: string; url?: string }
    const url = data.secure_url || data.url
    if (!url) {
      throw new Error('cloudinary didnt return url')
    }
    return url
  } catch (error) {
    console.error('upload error:', error)
    throw new Error('failed to upload image')
  }
}




export const submitContribution = async (contributionData: ContributionData): Promise<ContributionResponse> => {
  try {
    const response = await fetch('/api/contributions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contributionData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ContributionResponse = await response.json()
    return result
  } catch (error) {
    console.error('error submitting contribution :(', error)
    throw error
  }
}


export const fetchContributions = async (): Promise<ContributionResponse[]> => {
  try {
    const response = await fetch('/api/contributions')
    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`)
    }
    const result: ContributionResponse[] = await response.json()
    return result
  } catch (error) {
    console.error('error fetching contributions:(', error)
    throw error
  }
}


export const fetchContributionById = async (id: string): Promise<ContributionResponse> => {
  try {
    const response = await fetch(`/api/contributions/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result: ContributionResponse = await response.json()
    return result
  } catch (error) {
    console.error('error fetching contribution by id:', error)
    throw error
  }
}


export const validateFile = (file: File): { isValid: boolean; error?: string } => {

  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'please select an image file' }
  }
  
 
  if (file.size > 4 * 1024 * 1024) {
    return { isValid: false, error: 'file size must be less than 4mb' }
  }
  
  return { isValid: true }
}
