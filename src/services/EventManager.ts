export type EventListener = () => void;

const listeners: { [K: string]: Array<EventListener> } = {};

export default {
  addListener(eventName: string, listener: EventListener) {
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }

    listeners[eventName].push(listener);
  },

  removeListener(eventName: string, listener: EventListener) {
    if (listeners[eventName]) {
      const listenerIndex = listeners[eventName].findIndex(
        (listenerCandidate) => listenerCandidate === listener
      );

      listeners[eventName].splice(listenerIndex, 1);
    }
  },

  triggerEvent(eventName: string) {
    if (listeners[eventName]) {
      listeners[eventName].forEach((listener) => listener());
    }
  },
};
