import { describe, it, expect, beforeAll } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

// @ts-ignore // TS thinks this file would not exist
import SystemMessageAlert from '~/components/system-message/Alert';

type TSystemMessageAlert = InstanceType<typeof SystemMessageAlert>;

// Local mocks -> can be used in this test file
// Global mocks are to be found in ~/tests/setup/mocks.ts
/*
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: 'de'
  });
});

mockNuxtImport('useVeoUser', () => {
  return () => () => ({
    authenticated: true,
    initialize: () => true,
    keycloakInitialized: true
  });
});
*/

// Test data
const message = {
  id: 1,
  message: {
    de: 'Das ist ein Test',
    en: 'This is a Test'
  },
  publication: '2024-11-12T13:09:16.448Z',
  effective: '2024-11-12T13:09:16.448Z',
  level: 'INFO',
  displayProps: {
    messageId: 1,
    isShown: true,
    isUrgent: true,
    alertType: 'INFO',
    isDismissable: true,
    effectiveDate: new Date(),
    effectiveTimer: undefined,
    urgencyTimer: undefined
  }
};

const messages = [message];

describe('SystemMessageAlert', () => {
  let component: TSystemMessageAlert;

  // Mount component and pass props
  beforeAll(async () => {
    component = await mountSuspended(SystemMessageAlert, {
      props: {
        messages
      }
    });
  });

  // Run tests on it
  it("checks if the message's text is shown correctly", () => {
    expect(component.text()).toContain('Das ist ein Test');
  });

  it('changes state when dismissing a message', async () => {
    const button = component.find('button');

    await button.trigger('click');

    expect(messages[0].displayProps.isShown).toBe(false);
  });
});
