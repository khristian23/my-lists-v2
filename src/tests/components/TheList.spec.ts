import { cleanup, render, screen } from '@testing-library/vue';
import { List } from 'src/components/models';
import { describe, it, expect } from 'vitest';
import TheList from './src/components/TheList.vue';
import { Quasar } from 'quasar';

interface TheListProps {
  headerLabel?: string;
  showHeader?: boolean;
  items?: Array<List>;
  iconAction?: string;
  scratched?: boolean;
}

describe('The List', () => {
  function renderListWithProps(props: TheListProps) {
    render(TheList, {
      props,
      global: {
        plugins: [Quasar],
        stubs: ['draggable'],
      },
    });
  }

  it.each([
    ['', true],
    ['some text', true],
    ['another text', false],
  ])(
    'setting "%s" as header title and header visible is %s',
    (headerLabel: string, showHeader: boolean) => {
      const items: Array<List> = [];

      renderListWithProps({
        headerLabel,
        showHeader,
        items,
      });

      const collapseButton = screen.queryByRole('button', {
        name: 'expand/collapse',
      });

      if (showHeader) {
        expect(collapseButton).toBeTruthy();
      } else {
        expect(collapseButton).toBeFalsy();
      }

      cleanup();
    }
  );
});
