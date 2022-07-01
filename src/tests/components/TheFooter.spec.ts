import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import TheFooter from '@/components/TheFooter.vue';
import { Quasar } from 'quasar';
import ThePageLayoutTest from './helpers/ThePageLayoutTest.vue';

describe('The Footer', () => {
  it('should render the provided slot content', () => {
    render(ThePageLayoutTest, {
      slots: {
        default: '<the-footer>submit</the-footer>',
      },
      global: {
        plugins: [Quasar],
        components: { TheFooter },
      },
    });

    expect(screen.getByText('submit')).toBeTruthy();
  });
});
