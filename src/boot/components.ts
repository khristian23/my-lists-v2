import { boot } from 'quasar/wrappers';
import TheList from 'components/TheList.vue';
import TheConfirmation from 'components/TheConfirmation.vue';

export default boot(({ app }) => {
  app.component('the-list', TheList);
  app.component('the-confirmation', TheConfirmation);
});
