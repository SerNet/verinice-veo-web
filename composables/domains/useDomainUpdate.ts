/*
 * verinice.veo web
 * Copyright (C) 2026 Haneen Husin
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
import { STALE_TIME, useQuery } from '~/composables/api/utils/query';
import type { IVeoDomainUpdate } from '~/composables/api/queryDefinitions/domainUpdate';
import messagesQueryDefinitions from '~/composables/api/queryDefinitions/domainUpdate';

export type TDomainUpdateMessage = {
  id: string;
  domainId: string;
  domainName: string;
  currentVersion: string;
  newVersion: string;
  isVisible: boolean;
};

export function useDomainUpdate() {
  const messages = ref<TDomainUpdateMessage[]>([]);

  const { data } = useQuery({
    ...messagesQueryDefinitions.queries.fetchAll,
    staticQueryOptions: {
      staleTime: STALE_TIME.LONG,
      refetchInterval: STALE_TIME.LONG
    }
  });

  const oldMessages = getOldMessages();
  watch(
    data,
    () => {
      if (!data.value?.length) {
        messages.value = [];
        return;
      }

      const transformed = transformUpdatesToMessages(data.value);

      messages.value = transformed.map((msg) => {
        const old = oldMessages.find((o) => o.id === msg.id);
        if (old) {
          return { ...msg, isVisible: old.isVisible };
        }
        return msg;
      });
    },
    { immediate: true }
  );

  // Persist whenever visibility changes
  watch(
    messages,
    () => {
      persist(messages.value);
    },
    { deep: true }
  );

  function dismissMessage(id: string) {
    messages.value = messages.value.map((m) => (m.id === id ? { ...m, isVisible: false } : m));
  }

  return {
    domainUpdateMessages: computed(() => messages.value.filter((m) => m.isVisible)),
    dismissDomainUpdateMessage: dismissMessage
  };
}

// Transform Update-domain-message
function transformUpdatesToMessages(updates: IVeoDomainUpdate[]): TDomainUpdateMessage[] {
  return updates
    .filter(
      (item) =>
        item.latestPossibleUpdate?.templateVersion &&
        item.domain.templateVersion !== item.latestPossibleUpdate.templateVersion
    )
    .map((item) => ({
      id: `message-${item.domain.id}`,
      domainId: item.domain.id,
      domainName: item.domain.displayName,
      currentVersion: item.domain.templateVersion,
      newVersion: item.latestPossibleUpdate.templateVersion,
      isVisible: true
    }));
}

function persist(messages: TDomainUpdateMessage[]) {
  window.localStorage.setItem('domain-update-messages', JSON.stringify(messages));
}

function getOldMessages(): TDomainUpdateMessage[] {
  try {
    return JSON.parse(window.localStorage.getItem('domain-update-messages') || '[]');
  } catch {
    return [];
  }
}
