/*
 * verinice.veo web
 * Copyright (C) 2024 jae
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

/**
 * @description Fetches system messages and evaluates their level as well as their effective date. Depending on when a message becomes effective two different timers per message may be initialized:
 * - effectiveTimer: triggers an event which hides the message.
 * - urgencyTimer: triggers an event which changes the message's state to urgent.
 */

import { STALE_TIME, useQuery } from '~/composables/api/utils/query';
import messagesQueryDefinitions from '~/composables/api/queryDefinitions/messages';
import { SystemMessageTimer } from '~/lib/timer';
import type { IVeoSystemMessageAlertType, IVeoSystemMessage } from '~/composables/api/queryDefinitions/messages';

export type TSystemMessageDisplayProps = {
  messageId: number;
  isShown: boolean;
  isUrgent: boolean;
  alertType: IVeoSystemMessageAlertType;
  isDismissable: boolean;
  effectiveDate: Date;
  effectiveTimer?: SystemMessageTimer;
  urgencyTimer?: SystemMessageTimer;
};

export type TSystemMessage = IVeoSystemMessage & { displayProps: TSystemMessageDisplayProps };

enum SystemMessageEvents {
  SYSTEM_MESSAGE_EXPIRED = 'system-message-expired',
  SYSTEM_MESSAGE_BECAME_URGENT = 'system-message-became-urgent'
}

const debug = ref();
const messages = ref<TSystemMessage[]>([]);

/** @description Used to track timers and prevent initializing more than one effectiveTimer per message */
const effectiveTimeouts = ref([]);

/** @description Used to track timers and prevent initializing more than one urgencyTimer per message */
const urgencyTimeouts = ref([]);

/** @description Defines a time span which determines if a message is considert `urgent`: effective - URGENCY_OFFSET */
const URGENCY_OFFSET = 1000 * 60 * 60; // 60 minuntes

export function useSystemMessages() {
  debug.value = useRuntimeConfig().public.debug;
  const makeMesssageUrgentHandler = ((event: CustomEvent) => makeMesssageUrgent(event.detail)) as EventListener;
  const hideMessageHandler = ((event: CustomEvent) => hideMessage(event.detail)) as EventListener;

  /** @description Fetches, caches and refetches system messages. */
  const { data } = useQuery({
    ...messagesQueryDefinitions.queries.fetchAll,
    staticQueryOptions: {
      staleTime: STALE_TIME.LONG,
      refetchInterval: STALE_TIME.LONG
    }
  });

  /** @description Adds display properties to message data, and sets up event listeners for when messages have to change state (urgent, expired) */
  watch(
    data,
    async () => {
      if (!data.value?.length) return;
      if (messages.value.length) await killTimers(messages.value);
      window.addEventListener(SystemMessageEvents.SYSTEM_MESSAGE_BECAME_URGENT, makeMesssageUrgentHandler);
      window.addEventListener(SystemMessageEvents.SYSTEM_MESSAGE_EXPIRED, hideMessageHandler);
      messages.value = handleMessages(data.value);
    },
    { immediate: true }
  );

  /** @description Stores current message state. */
  watch(messages, () => persist(messages.value), { deep: true });

  /** @description Removes event listeners. */
  onBeforeUnmount(async () => {
    window.removeEventListener(SystemMessageEvents.SYSTEM_MESSAGE_BECAME_URGENT, makeMesssageUrgentHandler);
    window.removeEventListener(SystemMessageEvents.SYSTEM_MESSAGE_EXPIRED, hideMessageHandler);
  });

  function makeMesssageUrgent(id: number) {
    messages.value = messages.value.map((message) => {
      if (message.id == id)
        return {
          ...message,
          displayProps: { ...message.displayProps, isUrgent: true, alertType: 'URGENT' }
        };
      return message;
    });
  }

  function hideMessage(id: number) {
    messages.value = messages.value.map((message) => {
      if (message.id == id)
        return {
          ...message,
          displayProps: { ...message.displayProps, isShown: false }
        };
      return message;
    });
  }

  return {
    data: messages
  };
}

function handleMessages(newMessages: IVeoSystemMessage[]): TSystemMessage[] {
  const oldMessages = getOldMessages();

  const messages = newMessages?.map((newMessage) => {
    const oldMessage = oldMessages.find((om) => om.id == newMessage.id);
    if (isUrgent(newMessage)) {
      return addDisplayProps(newMessage, { isShown: true });
    }
    if (!newMessage.effective) {
      return addDisplayProps(newMessage, { isShown: true });
    }
    if (oldMessage) {
      return addDisplayProps(newMessage, { isShown: oldMessage.displayProps.isShown });
    }
    return addDisplayProps(newMessage);
  });

  return messages?.filter(getRelevantMessages) ?? [];
}

/** @description Removes messages users do not need to see. E.g because they are past their effective date. */
function getRelevantMessages(message: TSystemMessage) {
  const now = new Date();
  const effectiveDate = message.effective;
  if (!effectiveDate) return true;
  return new Date(effectiveDate) >= now;
}

/** @description Determines if a message is urgent. **/
function isUrgent(message: IVeoSystemMessage, timeToUrgent = URGENCY_OFFSET) {
  if (!message) return false;
  const timeToEffective = Math.floor(new Date(message.effective).valueOf() - new Date().valueOf());
  return timeToEffective >= 0 && timeToEffective <= timeToUrgent;
}

/** @description Adds an object to each message which handles how a message will be displayed. And when it is supposed to change its state. */
function addDisplayProps(
  message: IVeoSystemMessage,
  { isShown = true, urgencyInterval = URGENCY_OFFSET } = {}
): TSystemMessage {
  return {
    ...message,
    displayProps: new DisplayProps({
      message,
      isShown,
      urgencyInterval
    })
  };
}

class DisplayProps {
  messageId: number;
  isShown: boolean;
  isUrgent: boolean;
  alertType: IVeoSystemMessageAlertType;
  isDismissable: boolean;
  effectiveDate: Date | null;
  effectiveTimer: SystemMessageTimer;
  urgencyTimer: SystemMessageTimer;

  constructor({
    message,
    isShown,
    urgencyInterval
  }: {
    message: IVeoSystemMessage;
    isShown?: boolean;
    urgencyInterval: number;
  }) {
    this.messageId = message.id;
    this.isShown = isShown;
    this.isUrgent = isUrgent(message);
    this.alertType = this.isUrgent ? 'URGENT' : message.level;
    this.isDismissable = this.alertType == 'INFO' || false;
    this.effectiveDate = new Date(message.effective);
    this.effectiveTimer = this.setSystemMessageTimer(SystemMessageEvents.SYSTEM_MESSAGE_EXPIRED, urgencyInterval);
    this.urgencyTimer = this.setSystemMessageTimer(
      SystemMessageEvents.SYSTEM_MESSAGE_BECAME_URGENT,
      urgencyInterval,
      urgencyInterval
    );
  }

  emit(eventName: string, detail: number) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  calculateTimeToEffectiveDate(date: Date) {
    if (!date) return 0;
    const now = new Date();
    return date.valueOf() - now.valueOf();
  }

  setSystemMessageTimer(eventType: string, urgencyInterval: number, timeOffset = 0) {
    if (!this.effectiveDate) return;

    const timers = eventType == SystemMessageEvents.SYSTEM_MESSAGE_EXPIRED ? effectiveTimeouts : urgencyTimeouts;
    const timeToEffective = this.calculateTimeToEffectiveDate(this.effectiveDate);
    if (timeToEffective === null) return;
    const timeout = timeToEffective - timeOffset;

    // Do not set up new timer if a message already has a running timer
    if (timers.value.find((t) => t.messageId == this.messageId)) return;

    // Do not set up timer if message is past its effecitve date,
    // or if its becoming urgent is to far ahead in the future
    if (timeout < 0 || timeout > urgencyInterval * 2) return;

    const timer = new SystemMessageTimer(timeout, () => this.emit(eventType, this.messageId), this.messageId);

    // Track existing timers
    timers.value.push(timer);
    return timer;
  }
}

/** @description Clears timeouts of all messages and resets variables which track existing timers. */
async function killTimers(messages: TSystemMessage[]) {
  messages.forEach((message: TSystemMessage) => {
    message.displayProps?.effectiveTimer?.cancel();
    message.displayProps?.urgencyTimer?.cancel();
  });
  effectiveTimeouts.value = [];
  urgencyTimeouts.value = [];
}

function persist(messages: TSystemMessage[]) {
  window.localStorage.setItem('veo-messages', JSON.stringify(messages));
}

function getOldMessages(): TSystemMessage[] {
  try {
    return JSON.parse(window.localStorage.getItem('veo-messages')) ?? [];
  } catch (error) {
    if (debug.value) console.error(error);
    return [];
  }
}
