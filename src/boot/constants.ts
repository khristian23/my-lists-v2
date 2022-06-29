import { boot } from 'quasar/wrappers';
import Constants from 'src/util/constants';

export default boot(({ app }) => {
  app.config.globalProperties.$Const = Constants;
});
