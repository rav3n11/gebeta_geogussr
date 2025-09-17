import { useState, useCallback } from 'react'
import type { ContributionFormData, ContributionState, ContributionData } from '../types/contribution'
import { uploadFile, submitContribution, validateFile } from '../api/contributionApi'

export const useContributionForm = () => {
  const [formData, setFormData] = useState<ContributionFormData>({
    cityName: '',
    description: '',
    selectedFile: null,
    imageUrl: '',
    selectedLocation: null
  })

  const [state, setState] = useState<ContributionState>({
    isUploading: false,
    isSubmitting: false,
    isSubmitted: false,
    error: ''
  })

  const updateFormData = useCallback((updates: Partial<ContributionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: '' }))
  }, [])

  const setStateUpdates = useCallback((updates: Partial<ContributionState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      cityName: '',
      description: '',
      selectedFile: null,
      imageUrl: '',
      selectedLocation: null
    })
    setState({
      isUploading: false,
      isSubmitting: false,
      isSubmitted: false,
      error: ''
    })
  }, [])

  return {
    formData,
    state,
    updateFormData,
    setError,
    clearError,
    setStateUpdates,
    resetForm
  }
}

export const useFileUpload = () => {
  const handleFileSelect = useCallback((file: File, onError: (error: string) => void) => {
    const validation = validateFile(file)
    if (!validation.isValid) {
      onError(validation.error!)
      return null
    }
    return file
  }, [])

  const handleUpload = useCallback(async (
    file: File,
    onSuccess: (url: string) => void,
    onError: (error: string) => void,
    setState: (updates: Partial<ContributionState>) => void
  ) => {
    setState({ isUploading: true })
    onError('')

    try {
      const url = await uploadFile(file)
      onSuccess(url)
    } catch (err) {
      console.error('Upload error:', err)
      onError('failed to upload image. try sgain:(')
    } finally {
      setState({ isUploading: false })
    }
  }, [])

  return {
    handleFileSelect,
    handleUpload
  }
}

export const useContributionSubmission = () => {
  const handleSubmit = useCallback(async (
    formData: ContributionFormData,
    onSuccess: () => void,
    onError: (error: string) => void,
    setState: (updates: Partial<ContributionState>) => void
  ) => {
    if (!formData.selectedLocation) {
      onError('please select a location on the map')
      return
    }
    if (!formData.cityName.trim()) {
      onError('please enter a city name')
      return
    }
    if (!formData.description.trim()) {
      onError('please enter a description')
      return
    }
    if (!formData.imageUrl.trim()) {
      onError('please upload an image')
      return
    }

    setState({ isSubmitting: true })
    onError('')

    try {
      const contributionData: ContributionData = {
        city_name: formData.cityName.trim(),
        latitude: formData.selectedLocation[1], 
        longitude: formData.selectedLocation[0],
        description: formData.description.trim(),
        image_url: formData.imageUrl.trim()
      }

      await submitContribution(contributionData)
      onSuccess()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to submit contribution')
    } finally {
      setState({ isSubmitting: false })
    }
  }, [])

  return {
    handleSubmit
  }
}
