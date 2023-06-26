import localforage from 'localforage'
import { t } from './extension'

export function configLocalDataStore() {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: t('extName'),
    version: 2.0,
    storeName: 'local_data', // Should be alphanumeric, with underscores.
    description: 'background data storage.',
  })

  return localforage
}
