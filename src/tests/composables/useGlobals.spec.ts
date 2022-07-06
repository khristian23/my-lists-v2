import { describe, it, expect } from 'vitest';
import useGlobals from '@/composables/useGlobals';

describe('Globals Composable', () => {
  it('should set and format the title', () => {
    const { title, setTitle } = useGlobals();

    setTitle('some-Unformatted-Title');

    expect(title.value).toEqual('Some unformatted title');
  });

  it('should set display back button', () => {
    const shouldDisplayBackButton = true;
    const { displayHeaderBackButton } = useGlobals(shouldDisplayBackButton);

    expect(displayHeaderBackButton.value).toEqual(shouldDisplayBackButton);
  });
});
