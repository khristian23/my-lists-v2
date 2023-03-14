import { describe, it, expect, afterEach } from 'vitest';
import TheFavoriteButton from '@/components/TheFavoriteButton.vue';
import { render, fireEvent, cleanup } from '@testing-library/vue';
import { Quasar } from 'quasar';

describe('The Favorite Button', () => {
  function renderComponent(props: Record<string, boolean>) {
    return render(TheFavoriteButton, {
      props,
      global: {
        plugins: [Quasar],
      },
    });
  }

  afterEach(() => cleanup());

  it('should render the componenr', () => {
    const { getByText } = renderComponent({});

    getByText('Favorite');
  });

  it('should emit favorite event when clicking label', async () => {
    const { getByText, emitted } = renderComponent({});

    await fireEvent.click(getByText('Favorite'));

    expect(emitted()).toHaveProperty('click');
  });

  it('should emit favorite event when clicking icon', async () => {
    const { getByRole, emitted } = renderComponent({});

    await fireEvent.click(getByRole('button'));

    expect(emitted()).toHaveProperty('click');
  });

  it('should render a red icon when is favorite', () => {
    const { getByRole } = renderComponent({ favorite: true });

    expect(getByRole('button').className).includes('is-favorite');
  });

  it('should render a white icon when is not favorite', () => {
    const { getByRole } = renderComponent({ favorite: false });

    expect(getByRole('button').className).not.includes('is-favorite');
  });
});
