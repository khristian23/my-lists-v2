import { boot } from 'quasar/wrappers';
import TheList from 'components/TheList.vue';

export default boot(({ app }) => {
  app.component('the-list', TheList);
});
