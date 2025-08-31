import { useMemo } from 'react'
import { useBrowsers } from './useBrowsers'
import { useSettings } from './useSettings'
import { SiteConfig } from '@/types'

export const useAppData = () => {
  const { data: browsers = [], isLoading: browsersLoading, error: browsersError } = useBrowsers()
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useSettings()

  const sites = useMemo((): SiteConfig[] => {
    if (!settings?.sites) return []

    // Return sites as-is since they now use browser_id directly
    return settings.sites
  }, [settings?.sites])

  const proxies = settings?.proxies || []

  return {
    browsers,
    settings,
    sites,
    proxies,
    isLoading: browsersLoading || settingsLoading,
    error: browsersError || settingsError,
  }
}