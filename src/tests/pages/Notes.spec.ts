import { cleanup, fireEvent, render, waitFor } from '@testing-library/vue';
import constants from '@/util/constants';
import userEvent from '@testing-library/user-event';
import { describe, it, vi, beforeEach, expect, afterEach } from 'vitest';
import { Router } from 'vue-router';
import { createRouterForRoutes } from './helpers/router';
import MainLayoutTest from './helpers/MainLayoutTest.vue';
import { Quasar } from 'quasar';
import ListService from '@/services/ListService';
import Note from '@/models/note';

vi.mock('@/services/ListService');

let router: Router;

const FAKE_NOTE_ID = 'NoteId';

document.execCommand = vi.fn();
document.queryCommandState = vi.fn();

describe('Notes page', () => {
  function renderNote() {
    return render(MainLayoutTest, {
      global: {
        plugins: [Quasar, router],
        stubs: {
          TheFooter: {
            template: '<div><slot></slot></div>',
          },
        },
        provide: {
          saveDelay: () => 100,
        },
      },
    });
  }

  beforeEach(async () => {
    router = createRouterForRoutes([{ name: constants.routes.note.name }]);
    router.push({
      name: constants.routes.note.name,
      params: { id: FAKE_NOTE_ID },
    });
    await router.isReady();

    vi.mocked(ListService).getListableById.mockResolvedValue(
      new Note({
        id: FAKE_NOTE_ID,
        name: 'Note Name',
        description: 'Note Description',
        noteContent: 'This is the notes content',
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('should render the component', () => {
    const { container } = renderNote();

    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
  });

  it('should read the content from existing note', async () => {
    const { getByText } = renderNote();

    await waitFor(() => {
      getByText('title: Note name');
    });
    getByText('This is the notes content');
  });

  it('should save the content', async () => {
    const spy = vi.spyOn(ListService, 'saveNoteContent');

    const { container, getByRole } = renderNote();

    const editor = container.querySelector(
      '[contenteditable="true"]'
    ) as HTMLElement;

    await userEvent.type(editor, '{enter} more content');

    const saveButton = getByRole('button', { name: 'Save' });
    await fireEvent.click(saveButton);

    expect(spy).toHaveBeenCalled();
  });

  it('should trigger save automatically on change', async () => {
    const spy = vi.spyOn(ListService, 'saveNoteContent');

    const { container } = renderNote();

    const editor = container.querySelector(
      '[contenteditable="true"]'
    ) as HTMLElement;

    await userEvent.type(editor, '{enter} more content');

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });
});
