import { boot } from 'quasar/wrappers';
import TheList from 'components/TheList.vue';
import TheConfirmation from 'components/TheConfirmation.vue';
import TheFooter from 'components/TheFooter.vue';
import TheHeader from 'components/TheHeader.vue';
import TheListLoader from 'components/TheListProps.vue';
import TheMenuLink from 'components/TheMenuLink.vue';

export default boot(({ app }) => {
  app.component('the-list', TheList);
  app.component('the-confirmation', TheConfirmation);
  app.component('the-footer', TheFooter);
  app.component('the-header', TheHeader);
  app.component('the-list-loader', TheListLoader);
  app.component('the-menu-link', TheMenuLink);
});
