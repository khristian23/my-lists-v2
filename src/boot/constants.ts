import constants from '@/util/constants';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.config.globalProperties.$Const = constants;
});
