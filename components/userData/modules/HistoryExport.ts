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

// Types
export enum PrepPhase  {
  Idle,
  Download,
  Zip,
  Done
}

export type HistoryZipArchive = { name: string; zip: Blob; };
export type UpdateLoadingState  = ({ phase, cur, total }: { phase: PrepPhase, cur: number, total: number } ) => void
export type HistoryChunk = { name: string, chunk: IVeoObjectHistoryEntry[] }

export type FetchFnParams = { size?: number | undefined; afterId?: string | undefined; }

export type FetchFnResult = {
  totalItemCount: number,
  items: IVeoObjectHistoryEntryWithId[]
}

interface IVeoObjectHistoryEntryWithId extends IVeoObjectHistoryEntry {
  id: string;
}

interface ILoadHistoryParams {
  fetchFn: ({ size, afterId }: FetchFnParams) => Promise<FetchFnResult>;
  history?: IVeoObjectHistoryEntryWithId[];
  size?: number;
  afterId?: undefined | string;
  updateLoadingState?: UpdateLoadingState;
  cur?: number;
}

async function loadHistory({
  fetchFn, history = [], size = 2500, afterId = undefined, updateLoadingState, cur = 0}: ILoadHistoryParams ):
  Promise<IVeoObjectHistoryEntryWithId[]> {
  try {
    const fetchedHistory = await fetchFn({ size, afterId });
    const currentHistory = [...history, ...fetchedHistory.items];
    const currentAfterId = currentHistory[currentHistory.length - 1]?.id;

    cur++;
    const total = fetchedHistory.totalItemCount % size === 0 ? Math.floor(fetchedHistory.totalItemCount/size) : Math.floor(fetchedHistory.totalItemCount/size) + 1;
    if(updateLoadingState) updateLoadingState({ phase: PrepPhase.Download, cur, total });

    if (fetchedHistory.items.length < size) {
      return currentHistory;
    } else {
      return await loadHistory({
        fetchFn,
        history: currentHistory,
        size,
        afterId: currentAfterId,
        updateLoadingState,
        cur
      });
    }
  }
  catch (error) {
    throw new Error('Could not fetch history data.', { cause: error });
  }
}

function chunkHistory(historyItems: IVeoObjectHistoryEntry[], archiveSize = 10000) {
  const archiveName = { prevName: '', name: '', counter: 0 };
  const chunks = chunk(historyItems, archiveSize);

  const chunkedHistory = chunks.map((chunk) => {
    const _name = composeFileName(chunk);

    // Account for equal names: history_2023-02-13_2023-02-05.zip, history_2023-02-13_2023-02-05_1.zip ...
    archiveName.counter === 0 ? _name : _name + "_" + archiveName.counter;

    if (_name === archiveName.name) {
      archiveName.counter++;
    } else {
      archiveName.counter = 0;
    }

    const countedName =
      archiveName.counter === 0 ?
        _name :
        _name + "_" + archiveName.counter;

    archiveName.name = _name;
    return {chunk, name: countedName};
  });

  return chunkedHistory;
}

async function createZipFromHistoryChunk(_chunk: HistoryChunk) {
  const {name, chunk } = _chunk;
  const zip = await createZIP(chunk, name);
  return { zip, name };
}

async function createZipArchives(
  updateLoadingState: UpdateLoadingState,
  chunks: HistoryChunk[] = [],
  _zipArchives: HistoryZipArchive[] = [],
  _currentChunk = 0
): Promise<HistoryZipArchive[]>

{
  const archive = await createZipFromHistoryChunk(chunks[_currentChunk]);
  const zipArchives = [..._zipArchives, archive];

  updateLoadingState({ phase: PrepPhase.Zip, cur: _currentChunk + 1, total: chunks.length });

  if (chunks.length === _currentChunk + 1) {
    return zipArchives;
  }

  _currentChunk++;
  return await createZipArchives(updateLoadingState, chunks, zipArchives, _currentChunk);
}

function composeFileName(chunk: IVeoObjectHistoryEntry[]) {
  const startDate = transformDateString(chunk[0].time);
  const endDate = transformDateString(chunk[chunk.length - 1].time);
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
  return json[0];
};

export {
  loadHistory,
  chunkHistory,
  createZipArchives,
  devFetchHistoryData
};
