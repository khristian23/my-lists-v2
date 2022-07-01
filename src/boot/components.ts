import { boot } from 'quasar/wrappers';
import TheList from 'components/TheList.vue';
import TheConfirmation from 'components/TheConfirmation.vue';
import TheFooter from 'components/TheFooter.vue';

export default boot(({ app }) => {
  app.component('the-list', TheList);
  app.component('the-confirmation', TheConfirmation);
  app.component('the-footer', TheFooter);
});
