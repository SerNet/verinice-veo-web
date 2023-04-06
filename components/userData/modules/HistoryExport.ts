/*
 * verinice.veo web
 * Copyright (C) 2023 jae
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
import { createZIP } from "~~/lib/jsonToZip";
import { chunk } from "lodash";
import { IVeoObjectHistoryEntry } from "~~/types/VeoTypes";  

type FetchFnParams = { 
  size?: number; 
  afterId?: string | null; 
}

type FetchFnResult = {items: IVeoObjectHistoryEntryWithId[]}

interface IVeoObjectHistoryEntryWithId extends IVeoObjectHistoryEntry {
  id: string;
}

interface ILoadHistoryParams {
  fetchFn(params: FetchFnParams): FetchFnResult;
  history?: IVeoObjectHistoryEntryWithId[];
  size?: number;
  afterId?: null | string;
}

async function loadHistoryData({ 
  fetchFn, history = [], size = 10000, afterId = null }: ILoadHistoryParams ): 
  Promise<IVeoObjectHistoryEntryWithId[]> {
  try {
    const fetchedHistory = await fetchFn({ size, afterId });
    const currentHistory = [...history, ...fetchedHistory.items];
    const currentAfterId = currentHistory[currentHistory.length - 1]?.id; 

    if (fetchedHistory.items.length < size) {
      return currentHistory;
    } else {
      return await loadHistoryData({
        fetchFn, 
        history: currentHistory, 
        size, 
        afterId: currentAfterId 
      });
    }
  }
  catch (error) {
    throw new Error('Could not fetch history data.', { cause: error });
  }
}

async function createZipArchives(historyItems: IVeoObjectHistoryEntry[], archiveSize = 5000) {
  const chunks = chunk(historyItems, archiveSize);
  const archiveName = { prevName: '', name: '', counter: 0 };
  const zipArchives = await Promise.all(chunks.map(async (chunk) => {

    const _name = composeFileName(chunk);
    // Account for equal names: history_2023-02-13_2023-02-05.zip, history_2023-02-13_2023-02-05_1.zip ...
    if (_name === archiveName.name) {
      archiveName.counter++;
    } else {
      archiveName.counter = 0;
    }

    const countedName = 
      archiveName.counter === 0 ? 
        _name : 
        _name + "_" + archiveName.counter;

    archiveName.name = countedName;

    const zip = await createZIP(chunk, countedName);
    return ({ name: countedName, zip });
  }));
  return zipArchives;
}

function composeFileName(chunk: IVeoObjectHistoryEntry[]) {
  const startDate = transformDateString(chunk[0].content.createdAt);
  const endDate = transformDateString(chunk[chunk.length - 1].content.createdAt);
  return `history_${startDate}_${endDate}`;
}

function transformDateString(ISODateString: string) {
  return ISODateString.split("T")[0];
}

// DEVELOPMENT
const devFetchHistoryData = async () => {
  const devUrl='http://localhost:3001/testData';
  const response = await fetch(devUrl);
  const json = await response.json();
  return {items: [...json]};
};

export {
  loadHistoryData,
  createZipArchives,
  devFetchHistoryData
};
