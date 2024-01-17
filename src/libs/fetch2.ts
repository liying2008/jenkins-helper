export type Fetch2Options = RequestInit & { timeout?: number }

export async function fetch2(resource: string | URL | Request, options: Fetch2Options = {}) {
  // default timeout is 30s
  const { timeout = 30_000 } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    return await fetch(resource, {
      ...options,
      signal: controller.signal,
    })
  } catch (e) {
    // console.log('fetch2:e', e)
    return Promise.reject(e)
  } finally {
    clearTimeout(id)
  }
}
