import { ref, watch } from 'vue';
import { format } from 'quasar';
import { useRoute } from 'vue-router';
import { GlobalComposableReturnValue } from '@/models/models';

const displayHeaderBackButton = ref(true);
const title = ref('');

export function useGlobals(
  shouldDisplayBackButton = true
): GlobalComposableReturnValue {
  const route = useRoute();

  const formatTitle = (value: string) => {
    if (!value) return;
    value = value.replace(/-/g, ' ');
    title.value = format.capitalize(value.toLowerCase());
  };

  const setTitle = (value: string) => {
    formatTitle(value);
  };

  watch(
    () => route?.name,
    (routeName) => formatTitle(routeName?.toString() ?? '')
  );

  formatTitle(route?.name?.toString() ?? '');

  displayHeaderBackButton.value = shouldDisplayBackButton;

  return {
    title,
    setTitle,
    displayHeaderBackButton,
  };
}
