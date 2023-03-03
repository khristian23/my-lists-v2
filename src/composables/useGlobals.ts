import { ref, watch } from 'vue';
import { format } from 'quasar';
import { useRoute } from 'vue-router';
import { EventListener, EventManager } from '@/util/eventListener';

const displayHeaderBackButton = ref(true);
const title = ref('');
const eventManager = new EventManager();

export function useGlobals(shouldDisplayBackButton = true) {
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
    addEventListener: (eventName: string, listener: EventListener) =>
      eventManager.addListener(eventName, listener),
  };
}
