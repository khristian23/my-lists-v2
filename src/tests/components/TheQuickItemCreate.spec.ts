import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, RenderResult, cleanup } from '@testing-library/vue';
import { Quasar } from 'quasar';
import TheQuickItemCreate from '@/components/TheQuickItemCreate.vue';

describe('The Quick Item Create', () => {
  function renderQuickCreate(): RenderResult {
    return render(TheQuickItemCreate, {
      global: {
        plugins: [Quasar],
      },
    });
  }

  afterEach(() => cleanup());

  it('should render the component', () => {
    const { getByPlaceholderText } = renderQuickCreate();

    expect(getByPlaceholderText('Quick create'));
  });

  it('should emit create item event', async () => {
    const { getByText, emitted } = renderQuickCreate();

    await fireEvent.click(getByText('Create'));

    expect(emitted()).toHaveProperty('create');
  });
});
