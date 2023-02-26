export type EventListener = () => void;

export class EventManager {
  listeners: { [K: string]: Array<EventListener> } = {};

  addListener(eventName: string, listener: EventListener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listener);
  }

  removeListener(eventName: string, listener: EventListener) {
    if (this.listeners[eventName]) {
      const listenerIndex = this.listeners[eventName].findIndex(
        (listenerCandidate) => listenerCandidate === listener
      );

      this.listeners[eventName].splice(listenerIndex, 1);
    }
  }

  triggerEvent(eventName: string) {
    this.listeners[eventName].forEach((listener) => listener());
  }
}
