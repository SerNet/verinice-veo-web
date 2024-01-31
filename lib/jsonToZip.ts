/*
 * verinice.veo web
 * Copyright (C) 2023 SerNet
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

import JSZip from 'jszip';

/**
 * @description Write JSON into a file, zip it and make the browser download this zip archive.
 * @param data -- JSON data to be stored in a file
 * @param filename -- name of the file
 */
export async function downloadZIP(data: any, filename: string) {
  let zip;
  try {
    // Make a zip archive
    zip = await createZIP(data, filename);
    // Download that zip
    download(zip, filename);
  } catch (error) {
    throw new Error(`Downloading ZIP archive failed: ${error}`);
  }
}

export function createZIP(data: any, filename: string) {
  const json = JSON.stringify(data);
  const zip = new JSZip();
  zip.file(`${filename}.json`, json);
  // add more files to the archive:
  // zip.file('test-filename.txt', 'test content');
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/** Download a blob */
export function download(content: Blob, filename = 'download') {
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // Clean up
  URL.revokeObjectURL(a.href); // remove the reference to this file (for memory optimization)
  a.remove();
}
