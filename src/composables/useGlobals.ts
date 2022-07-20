import { ref } from 'vue';
import { format } from 'quasar';
import { GlobalComposableReturnValue } from '@/models/models';

const title = ref('');
const displayHeaderBackButton = ref(true);

export function useGlobals(
  shouldDisplayBackButton = true
): GlobalComposableReturnValue {
  const setTitle = (value: string) => {
    value = value.replaceAll('-', ' ');
    title.value = format.capitalize(value.toLowerCase());
  };

  displayHeaderBackButton.value = shouldDisplayBackButton;

  return {
    title,
    setTitle,
    displayHeaderBackButton,
  };
}
