// scripts/test-voe.ts
import { connect } from 'puppeteer-real-browser';

async function main() {
  const { page, browser } = await connect({
    headless: false,
    turnstile: true,
  });

  await page.goto('https://www.voe.com.ua/disconnection/detailed', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.waitForFunction(() => !document.title.includes('зачекайте'), { timeout: 60000 });

  console.log(await page.content());
  await browser.close();
}

main().catch(console.error);
