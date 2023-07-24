import fs from 'fs'
import puppeteer from 'puppeteer'
import { getUnixTime, formatDistance, parse } from 'date-fns'

import accounts from './config/accounts.json'
import { getPostsByUserName, sleep } from './utils'
import { Accounts } from './types/accounts'
import { SharedDataOutput } from './types/sharedData'

import {} from './types/environment'

if (!process.env.CAR || !process.env.LOGIN || !process.env.PASSWORD) {
  console.error('Error: LOGIN, PASSWORD, CAR fields are required!')
}

const database = accounts as Accounts

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  })

  const page = await browser.newPage()

  await page.exposeFunction('convertDateToUnix', (date: string) => getUnixTime(new Date(date)))

  await page.goto('https://www.instagram.com/', {
    waitUntil: 'networkidle0',
  })

  await page.click('button._a9--._a9_0')
  await sleep(1000)

  await page.type('[name="username"]', process.env.LOGIN)
  await sleep(1500)
  await page.type('[name="password"]', process.env.PASSWORD)
  await sleep(1500)
  await page.click('[type="submit"]')
  await sleep(1500)

  await page.waitForNavigation()
  await sleep(7000)

  let sharedData: SharedDataOutput[] = []

  for (const username of database[process.env.CAR].owners) {
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle0',
    })

    const userData = await getPostsByUserName(page)

    const updatedData = userData.filter((item) => {
      return item.timestamp > database[process.env.CAR].lastUpdate
    })

    sharedData = [...sharedData, ...updatedData]
  }

  database[process.env.CAR].lastUpdate = getUnixTime(new Date())

  fs.writeFileSync(__dirname + '/config/accounts.json', JSON.stringify(database))

  const slicedOutput = [...sharedData.sort((a, b) => b.likes - a.likes).slice(0, 40)]

  console.table(
    slicedOutput.map((content) => ({
      date: formatDistance(new Date(), new Date(content.timestamp * 1000)) + ' ago',
      likes: content.likes,
      link: `https://www.instagram.com/p/${content.shortcode}`,
    }))
  )

  await browser.close()
})()
