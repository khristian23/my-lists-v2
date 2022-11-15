import constants from './util/constants';

declare module 'vue' {
  interface ComponentCustomProperties {
    $Consts: typeof constants;
  }
}
