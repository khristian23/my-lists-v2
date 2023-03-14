import { describe, it, expect, vi } from 'vitest';
import EventManager from '@/services/EventManager';

describe('Event Manager', () => {
  // let eventManager: EventManager;
  const eventName1 = 'testEvent1';
  const eventName2 = 'testEvent2';

  it('should not trigger event with empty listeners', () => {
    EventManager.triggerEvent('An-unkown-listener');
  });

  it('should add and receive and event', () => {
    const fakeFunction = vi.fn();

    EventManager.addListener(eventName1, fakeFunction);

    EventManager.triggerEvent(eventName1);

    expect(fakeFunction).toHaveBeenCalledOnce();
  });

  it('should add multiple listeners and call them all', () => {
    const fakeFunction1 = vi.fn();
    const fakeFunction2 = vi.fn();

    EventManager.addListener(eventName1, fakeFunction1);
    EventManager.addListener(eventName1, fakeFunction2);

    EventManager.triggerEvent(eventName1);

    expect(fakeFunction1).toHaveBeenCalledOnce();
    expect(fakeFunction2).toHaveBeenCalledOnce();
  });

  it('should notify only listeners to the triggered event', () => {
    const fakeFunction1 = vi.fn();
    const fakeFunction2 = vi.fn();

    EventManager.addListener(eventName1, fakeFunction1);
    EventManager.addListener(eventName2, fakeFunction2);

    EventManager.triggerEvent(eventName2);

    expect(fakeFunction1).not.toHaveBeenCalled();
    expect(fakeFunction2).toHaveBeenCalledOnce();
  });

  it('should remove listener', () => {
    const fakeFunction1 = vi.fn();
    const fakeFunction2 = vi.fn();

    EventManager.addListener(eventName1, fakeFunction1);
    EventManager.addListener(eventName1, fakeFunction2);

    EventManager.removeListener(eventName1, fakeFunction1);

    EventManager.triggerEvent(eventName1);

    expect(fakeFunction1).not.toHaveBeenCalled();
    expect(fakeFunction2).toHaveBeenCalledOnce();
  });
});
