/* eslint-disable */
import { BeforeInstallPromptEvent } from '@/models/models';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export {};
