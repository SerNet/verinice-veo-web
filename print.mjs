/*
 * verinice.veo web
 * Copyright (C) 2021  Markus Werner
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import path from 'path';
import puppeteer from 'puppeteer';

const LANGS = ['de', 'en'];

async function main() {
  const outputFolder = path.resolve('./dist');
  const fileName = 'Documentation';
  const shorten = (str, len) => (str.length > len ? str.substr(0, len) + '...' : str);
  const url = process.argv[2] || `http://localhost:3000/docs/?print`;
  console.log('Opening browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--export-tagged-pdf'],
    pipe: true
  });
  console.log('Browser openend, creating new page');
  const page = await browser.newPage();
  console.log('New page created, registering event listeners');
  page
    .on('console', (message) => console.log(`    ${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.error('    ' + message))
    .on('response', (response) => console.log(` ☑️  ${response.status()} ${shorten(response.url(), 120)}`))
    .on('requestfailed', (request) => console.error(` ❌  ${request.failure().errorText} ${request.url()}`));
  console.log('Starting printing...');
  for await (const lang of LANGS) {
    const outputFile = `${outputFolder}/${fileName}_${lang}.pdf`;
    console.log(`Printing: ${url} (${lang})...`);
    await page.goto(url);
    // Setting the language via &lang=xyz gets overwritten by the browser locale, so we set the cookie by hand to avoid this. Also means the lang query parameter is only useful if set by hand.
    await page.setCookie({
      name: 'i18n_redirected',
      value: lang
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await Promise.race([
      page.evaluate(
        (event) => new Promise((resolve) => document.addEventListener(event, resolve, { once: true })),
        'PAGEDJS_AFTER_RENDERED'
      ),
      new Promise((resolve) => setTimeout(resolve, 30000))
    ]);
    await page.pdf({ path: outputFile, format: 'A4', printBackground: true });
    console.log(`Successfully created: ${outputFile}`);
  }
  await browser.close();
}

main();
