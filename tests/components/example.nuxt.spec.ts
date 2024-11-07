import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
};

describe('A very simple example test suite', () => {
  it('displays a message', async () => {
    const msg = 'Bonjour le monde';
    const wrapper = await mountSuspended(MessageComponent, {
      props: {
        msg
      }
    });

    // eslint-disable-next-line
    //console.log(wrapper.html());

    // Assert rendered text
    expect(wrapper.text()).toContain(msg);
  });
});
