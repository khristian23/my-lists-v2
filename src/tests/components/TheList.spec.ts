import { render, screen } from '@testing-library/vue';
import { ManageableItem } from 'src/components/models';
import { describe, it, expect } from 'vitest';
import TheList from './src/components/TheList.vue';
import { Quasar } from 'quasar';

describe('TheList', () => {
  it('render header title', async () => {
    const headerText = 'The Header';
    const items: Array<ManageableItem> = [];

    render(TheList, {
      props: { header: headerText, items },
      global: {
        plugins: [Quasar],
        stubs: ['draggable'],
      },
    });

    const view = await screen.findByText(headerText);

    expect(view).toBeTruthy();
    expect(0).toBeFalsy();
  });
});
