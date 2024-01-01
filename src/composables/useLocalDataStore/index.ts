import localforage from 'localforage'
import { t } from '~/libs/extension'

export function useLocalDataStore() {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: t('extName'),
    version: 2.0,
    storeName: 'local_data', // Should be alphanumeric, with underscores.
    description: 'background data storage.',
  })
  return localforage
}
