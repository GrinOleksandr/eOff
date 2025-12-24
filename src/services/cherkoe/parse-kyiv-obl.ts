import { delay } from '../../common/utils';

const puppeteer = require('puppeteer');

export async function getDtekData(city: string, street: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  await page.goto('https://www.dtek-krem.com.ua/ua/shutdowns', {
    waitUntil: 'networkidle2',
  });

  // // After page loads, save HTML to see actual structure
  // const html = await page.content();
  // console.log(html);
  //
  // // Or save to file for easier inspection
  // const fs = require('fs');
  // fs.writeFileSync('./page-debug.html', html);

  // Wait for Incapsula challenge to resolve
  await delay(3000);

  const debugInfo = await page.evaluate(() => {
    const discon = (window as any)['DisconSchedule'];

    return {
      exists: typeof discon !== 'undefined',
      type: typeof discon,
      keys: discon ? Object.keys(discon) : [],
      factExists: discon ? typeof discon.fact : 'no discon',
      factKeys: discon?.fact ? Object.keys(discon.fact) : [],
      // Try to get raw value
      factRaw: discon?.fact ? JSON.stringify(discon.fact).substring(0, 200) : null,
    };
  });

  console.log('Debug:', debugInfo);

  const debugPage = await page.evaluate(() => {
    return {
      title: document.title,
      bodyLength: document.body.innerHTML.length,
      hasIncapsula: document.body.innerHTML.includes('Incapsula'),
      // Check for any script with DisconSchedule
      scriptCount: document.querySelectorAll('script').length,
      hasDisconInHtml: document.body.innerHTML.includes('DisconSchedule'),
      // First 500 chars of body
      bodyPreview: document.body.innerHTML.substring(0, 500),
    };
  });

  console.log('Page debug:', debugPage);

  const pageData = await page.evaluate(() => {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const html = document.body.innerHTML;

    // Extract "update":"24.12.2025 11:45" from raw HTML
    const updateMatch = html.match(/"update"\s*:\s*"(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})"/);

    return {
      csrfToken: csrfMeta ? csrfMeta.getAttribute('content') : null,
      updateFact: updateMatch ? updateMatch[1] : null,
    };
  });

  console.log('pageData:', pageData);

  const { csrfToken, updateFact } = pageData;

  if (!csrfToken || !updateFact) {
    throw new Error('Failed to extract required page data');
  }

  // Make the AJAX request
  const result = await page.evaluate(
    async (csrf: string, cityVal: string, streetVal: string, updateFactVal: string) => {
      const response = await fetch('/ua/ajax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': csrf,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: new URLSearchParams({
          method: 'getHomeNum',
          'data[0][name]': 'city',
          'data[0][value]': cityVal,
          'data[1][name]': 'street',
          'data[1][value]': streetVal,
          'data[2][name]': 'updateFact',
          'data[2][value]': updateFactVal,
        }),
      });
      return response.json();
    },
    csrfToken,
    city,
    street,
    updateFact
  );

  await browser.close();
  return result;
}

// Usage
// getDtekData('м. Боярка', 'вул. Шевченка').then(console.log).catch(console.error);
// 'м. Боярка', 'вул. Шевченка'
