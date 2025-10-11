import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from './app.vue';

describe('forgeline-brief', () => {
  it('renders without crashing', () => {
    const wrapper = mount(App);
    expect(wrapper.exists()).toBe(true);
  });
});
