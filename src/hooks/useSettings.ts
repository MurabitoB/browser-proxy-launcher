import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TauriAPI } from '@/lib/tauri-api'
import { AppSettings } from '@/types'

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: TauriAPI.loadSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useSaveSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: TauriAPI.saveSettings,
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

export const useSettingsPath = () => {
  return useQuery({
    queryKey: ['settings-path'],
    queryFn: TauriAPI.getSettingsPath,
    staleTime: Infinity, // Path doesn't change
    gcTime: Infinity,
  })
}