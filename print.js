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

const puppeteer = require('puppeteer');

async function main() {
  const url = `${process.env.CI_ENVIRONMENT_URL}/docs/?print`;
  console.log(`Printing: ${url}...`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--export-tagged-pdf'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.pagedjs_pages');
  await page.waitForTimeout(10000);
  const pdf = await page.pdf({ path: './output.pdf', format: 'A4' });

  await browser.close();
  return pdf;
}

main();
