import { describe, it, expect, vi } from 'vitest';
import { useGlobals } from '@/composables/useGlobals';

describe('Globals Composable', () => {
  it('should set and format the title', () => {
    const { title, setTitle } = useGlobals();

    setTitle('some-Unformatted-Title');

    expect(title.value).toEqual('Some unformatted title');
  });

  it('should build a title from the route name', () => {
    vi.mock('vue-router', () => ({
      useRoute: vi.fn(() => ({
        name: 'my-route-name',
      })),
    }));

    const { title } = useGlobals();

    expect(title.value).toBe('My route name');

    vi.restoreAllMocks();
  });

  it('should provolege set title than route name', () => {
    vi.mock('vue-router', () => ({
      useRoute: vi.fn(() => ({
        name: 'mnot-to-be-considered-route-name',
      })),
    }));

    const { title, setTitle } = useGlobals();

    setTitle('A preferred title');
    expect(title.value).toBe('A preferred title');

    vi.restoreAllMocks();
  });

  it('should set display back button', () => {
    const shouldDisplayBackButton = true;
    const { displayHeaderBackButton } = useGlobals(shouldDisplayBackButton);

    expect(displayHeaderBackButton.value).toEqual(shouldDisplayBackButton);
  });
});
