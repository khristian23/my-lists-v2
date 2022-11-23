import {
  cleanup,
  render,
  screen,
  within,
  RenderResult,
} from '@testing-library/vue';
import { ManageableItem, ActionIcon } from '@/models/models';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import TheList from '@/components/TheList.vue';
import { Quasar } from 'quasar';
import Constants from '@/util/constants';
import vuedraggable from 'vuedraggable';

interface TheListProps {
  headerLabel?: string;
  showHeader?: boolean;
  items?: Array<ManageableItem>;
  actionIcon?: ActionIcon;
  scratched?: boolean;
}

describe('The List', () => {
  function renderListWithProps(props: TheListProps): RenderResult {
    return render(TheList, {
      props,
      global: {
        plugins: [Quasar],
        components: { vuedraggable },
      },
    });
  }

  describe('The List header', () => {
    it.each([
      ['', true],
      ['some text', true],
      ['another text', false],
    ])(
      'setting "%s" as header title and header visible is %s',
      (headerLabel: string, showHeader: boolean) => {
        const items: Array<ManageableItem> = [];

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

  describe('Item rendering', () => {
    let items: Array<ManageableItem> = [];

    beforeEach(() => {
      items = [
        {
          id: '001',
          name: 'First item',
          description: 'First item description',
          actionIcon: Constants.itemActionIcon.edit,
          canBeDeleted: false,
        } as ManageableItem,
        {
          id: '002',
          name: 'Second item',
          actionIcon: Constants.itemActionIcon.done,
          numberOfItems: 343,
          canBeDeleted: false,
        } as ManageableItem,
        {
          id: '003',
          name: 'Third item',
          canBeDeleted: true,
        } as ManageableItem,
      ];

      renderListWithProps({
        items,
      });
    });

    afterEach(() => {
      cleanup();
    });

    it('should render a list with name and descriptions', () => {
      const description = screen.getByText('First item description');
      expect(description).toBeTruthy();

      const name = screen.getByText('Third item');
      expect(name).toBeTruthy();
    });

    it('should render action icons in list', () => {
      const renderedItems = screen.getAllByRole('button', {
        name: 'action',
      });

      expect(renderedItems.length).toBe(items.length);

      expect(
        within(renderedItems[0]).getByText(Constants.itemActionIcon.edit)
      ).toBeTruthy();

      expect(within(renderedItems[2]).queryByRole('img')).toBeFalsy();
    });

    it('should render number of items in list items', () => {
      const numberOfItems = screen.getByText('343 items');
      expect(numberOfItems).toBeTruthy();
    });

    it('should show deleted button for list items', () => {
      const deletableItems = screen.getAllByRole('button', {
        name: 'delete',
      });

      expect(within(deletableItems[0]).findByRole('img')).toBeTruthy();
    });
  });

  describe('Scratching items', () => {
    beforeEach(() => {
      const items: Array<ManageableItem> = [
        {
          id: '001',
          name: 'item name',
          description: 'item description',
        } as ManageableItem,
      ];

      renderListWithProps({
        items,
        scratched: true,
      });
    });

    it('should scratch item name', () => {
      const itemToBeScratched = screen.getByText('item name');

      const scratchedItems =
        itemToBeScratched.getElementsByClassName('scratched');

      expect(scratchedItems).toBeTruthy();
    });
  });
});
