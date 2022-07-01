import { fireEvent, render, screen, cleanup } from '@testing-library/vue';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import TheConfirmationTest from './helpers/TheConfirmationTest.vue';
import { Quasar } from 'quasar';

const noop = () => undefined;
Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

describe('The Confirmation', () => {
  const customMessage = 'This is a custom message';

  beforeEach(() => {
    render(TheConfirmationTest, {
      props: { message: customMessage },
      global: {
        plugins: [Quasar],
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should open on demand with a custom message', async () => {
    expect(screen.queryByText(customMessage)).toBeFalsy();

    await fireEvent.click(screen.getByText('open'));

    expect(screen.getByText(customMessage)).toBeTruthy();
  });

  it('should close the dialog on positive option', async () => {
    await fireEvent.click(screen.getByText('open'));

    await fireEvent.click(screen.getByText('Yes'));

    expect(screen.queryByText(customMessage)).toBeFalsy();
    expect(screen.getByText('result: true')).toBeTruthy();
  });

  it('should close the dialog on negative option', async () => {
    await fireEvent.click(screen.getByText('open'));

    await fireEvent.click(screen.getByText('No'));

    expect(screen.queryByText(customMessage)).toBeFalsy();
    expect(screen.getByText('result: false')).toBeTruthy();
  });
});
