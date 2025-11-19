/*
 * verinice.veo web
 * Copyright (C) 2025 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */
import Papa from 'papaparse';
import { ref } from 'vue';

interface CsvData {
  records: Record<string, any>[];
  headers: string[];
}

interface ParserOptions {
  delimiter?: string;
}

export function useCsvImporter() {
  const data = ref<CsvData>({ records: [], headers: [] });
  const isLoading = ref(false);
  const error = ref<string | undefined>(undefined);

  const detectDelimiter = (csvText: string): string => {
    const delimiters = [',', ';', '\t', '|', ':'];
    const sample = csvText.substring(0, Math.min(csvText.length, 5000));
    const lines = sample.split(/\r?\n/).slice(0, 10);

    const delimiterScores = delimiters.map((delim) => {
      const counts = lines.map((line) => line.split(delim).length - 1);
      const variance = Math.max(...counts) - Math.min(...counts);
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      return { delim, score: avg - variance * 0.1 };
    });

    return delimiterScores.sort((a, b) => b.score - a.score)[0].delim;
  };

  function sanitizeCSV(input) {
    if (typeof input !== 'string') {
      throw new TypeError('Expected a string');
    }

    return input
      .replace(/^\uFEFF/, '') // Remove utf-8 BOM
      .replace(/\r\n|\r/g, '\n'); // Normalize line breaks
  }

  const preprocessCsv = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return reject('Failed to read file.');

        let csvText = event.target.result as string;

        csvText = sanitizeCSV(csvText);

        const detectedDelimiter = detectDelimiter(csvText);

        const lines = csvText.split('\n');
        if (lines.length > 1) {
          const headerDelimiter = detectDelimiter(lines[0]);
          if (headerDelimiter !== detectedDelimiter) {
            lines[0] = lines[0].replace(new RegExp(`\\${headerDelimiter}`, 'g'), detectedDelimiter);
          }
        }

        resolve(lines.join('\n'));
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  /**
   * Pure function that parses CSV text and returns structured data.
   *
   * @param {string} csvText - The pre-processed CSV text to parse.
   * @param {ParserOptions} [options] - Optional parser options to customize the parsing behavior.
   * @returns {Promise<CsvData>} A promise that resolves with the parsed CSV data.
   */
  const parseCSVData = (csvText: string, options: ParserOptions = {}): Promise<CsvData> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        ...(options.delimiter ? { delimiter: options.delimiter } : {}),
        transformHeader: (header) => header.trim().replace(/\s+/g, '_').replace(/\W/g, ''),
        complete: (results) => {
          resolve({
            records: results.data,
            headers: results.meta.fields || []
          });
        },
        error: (err) => {
          reject(new Error(err.message));
        }
      });
    });
  };

  /**
   * Parses a CSV file and processes its content.
   *
   * @param {File} file - The CSV file to be parsed.
   * @param {ParserOptions} [options] - Optional parser options to customize the parsing behavior.
   * @returns {Promise<void>} A promise that resolves when the CSV parsing is complete.
   */
  const parseCsv = async (file: File, options: ParserOptions = {}): Promise<Ref<CsvData>> => {
    error.value = undefined;
    isLoading.value = true;

    try {
      const processedCsv = await preprocessCsv(file);
      data.value = await parseCSVData(processedCsv, options);
      return data;
    } catch (err) {
      error.value = (err as Error).message;
      data.value = { records: [], headers: [] };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    isLoading,
    error,
    parseCsv
  };
}
