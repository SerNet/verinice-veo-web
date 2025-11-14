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
import { createZIP } from '~/lib/jsonToZip';
import { chunk } from 'lodash';
import type { IVeoObjectHistoryEntry } from '~/types/VeoTypes';
import type { IVeoPagedRevision } from '~/composables/api/queryDefinitions/history';
import { format } from 'date-fns';

// Types
export enum PrepPhase {
  Idle = 'IDLE',
  Download = 'DOWNLOAD',
  Zip = 'ZIP',
  Done = 'DONE'
}

export type HistoryZipArchive = {
  displayName: string;
  fileName: string;
  zip: Blob;
};
export type UpdateLoadingState = ({
  phase,
  currentPercentage,
  totalPercentage
}: {
  phase: PrepPhase;
  currentPercentage: number;
  totalPercentage: number;
}) => void;
export type HistoryChunk = {
  name: string;
  displayName: string;
  chunk: IVeoObjectHistoryEntry[];
};

export type FetchFnParams = {
  size?: number | undefined;
  afterId?: string | undefined;
};

export type FetchFnResult = {
  totalItemCount: number;
  items: IVeoObjectHistoryEntry[];
};

interface ILoadHistoryParams {
  fetchFn: ({ size, afterId }: FetchFnParams) => Promise<FetchFnResult | IVeoPagedRevision>;
  history?: IVeoObjectHistoryEntry[];
  size?: number;
  afterId?: undefined | string;
  updateLoadingState?: UpdateLoadingState;
  currentPercentage?: number;
}

async function loadHistory({
  fetchFn,
  history = [],
  size = 2500,
  afterId = undefined,
  updateLoadingState,
  currentPercentage = 0
}: ILoadHistoryParams): Promise<IVeoObjectHistoryEntry[]> {
  try {
    const fetchedHistory = await fetchFn({ size, afterId });
    const currentHistory = [...history, ...fetchedHistory.items];
    const currentAfterId = currentHistory[currentHistory.length - 1]?.id;

    currentPercentage++;
    const totalPercentage =
      fetchedHistory.totalItemCount % size === 0 ?
        Math.floor(fetchedHistory.totalItemCount / size)
      : Math.floor(fetchedHistory.totalItemCount / size) + 1;
    if (updateLoadingState)
      updateLoadingState({
        phase: PrepPhase.Download,
        currentPercentage,
        totalPercentage
      });

    if (fetchedHistory.items.length < size) {
      return currentHistory;
    } else {
      return await loadHistory({
        fetchFn,
        history: currentHistory,
        size,
        afterId: currentAfterId,
        updateLoadingState,
        currentPercentage
      });
    }
  } catch (error) {
    throw new Error('Could not fetch history data.', { cause: error });
  }
}

function chunkHistory(historyItems: IVeoObjectHistoryEntry[], archiveSize = 10000) {
  const archiveName = { displayName: '', name: '', counter: 0 };
  const chunks = chunk(historyItems, archiveSize);

  const chunkedHistory = chunks.map((chunk) => {
    const { displayName, fileName } = composeFileName(chunk);

    if (fileName === archiveName.name) {
      archiveName.counter++;
    } else {
      archiveName.counter = 0;
    }

    // Account for equal names: history_2023-02-13_2023-02-05.zip, history_2023-02-13_2023-02-05_1.zip ...
    const countedName = archiveName.counter === 0 ? fileName : fileName + '_' + archiveName.counter;
    const countedDisplayName = archiveName.counter === 0 ? displayName : displayName + ` (${archiveName.counter})`;

    archiveName.name = fileName;
    return { chunk, name: countedName, displayName: countedDisplayName };
  });

  return chunkedHistory;
}

async function createZipFromHistoryChunk(_chunk: HistoryChunk) {
  const { chunk, name, displayName } = _chunk;
  const zip = await createZIP(chunk, name);
  return { zip, fileName: name, displayName };
}

async function createZipArchives(
  updateLoadingState: UpdateLoadingState,
  chunks: HistoryChunk[] = [],
  _zipArchives: HistoryZipArchive[] = [],
  _currentChunk = 0
): Promise<HistoryZipArchive[]> {
  const archive = await createZipFromHistoryChunk(chunks[_currentChunk]);
  const zipArchives = [..._zipArchives, archive];

  updateLoadingState({
    phase: PrepPhase.Zip,
    currentPercentage: _currentChunk + 1,
    totalPercentage: chunks.length
  });

  if (chunks.length === _currentChunk + 1) {
    return zipArchives;
  }

  _currentChunk++;
  return await createZipArchives(updateLoadingState, chunks, zipArchives, _currentChunk);
}

function composeFileName(chunk: IVeoObjectHistoryEntry[]) {
  const startDate = new Date(chunk[0].time);
  const endDate = new Date(chunk[chunk.length - 1].time);

  const displayName = `${format(startDate, 'dd.MM.yyyy')} – ${format(endDate, 'dd.MM.yyyy')}`;
  const fileName = `history_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
  return { displayName, fileName };
}

// DEVELOPMENT
const devFetchHistoryData = async () => {
  const devUrl = 'http://localhost:3001/testData';
  const response = await fetch(devUrl);
  const json = await response.json();
  return json[0];
};

export { loadHistory, chunkHistory, createZipArchives, devFetchHistoryData };
