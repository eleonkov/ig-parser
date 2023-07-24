import { Page } from 'puppeteer'
import { SharedDataOutput } from './types/sharedData'

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const getPostsByUserName = async (page: Page): Promise<SharedDataOutput[]> => {
  const shortCodes = await page.evaluate(async () =>
    Array.from(document.querySelectorAll<HTMLLinkElement>('._aabd [role="link"]'), (link) =>
      link.href.split('/p/')[1].replace('/', '')
    )
  )

  const output: SharedDataOutput[] = []

  for (let i = 0; i < 5; i++) {
    await page.goto(`https://www.instagram.com/p/${shortCodes[i]}/embed/captioned/`, {
      waitUntil: 'networkidle0',
    })

    const sharedData = await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return window.__additionalData?.extra?.data?.shortcode_media
    })

    if (!sharedData) continue

    const shortcode = shortCodes[i]
    const timestamp = sharedData.taken_at_timestamp
    const likes = sharedData?.edge_liked_by?.count

    output.push({ timestamp, likes, shortcode })
  }

  return output
}
