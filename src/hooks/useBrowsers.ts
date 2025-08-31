import { useQuery } from '@tanstack/react-query'
import { TauriAPI } from '@/lib/tauri-api'
import { Browser } from '@/types'

export const useBrowsers = () => {
  return useQuery({
    queryKey: ['browsers'],
    queryFn: TauriAPI.detectBrowsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    retry: 2,
    retryDelay: 1000,
  })
}