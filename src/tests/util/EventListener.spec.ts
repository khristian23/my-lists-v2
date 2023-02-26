import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventManager } from '@/util/eventListener';

describe('Event Listener', () => {
  let eventManager: EventManager;
  const eventName1 = 'testEvent1';
  const eventName2 = 'testEvent2';

  beforeEach(() => {
    eventManager = new EventManager();
  });

  it('should add and receive and event', () => {
    const fakeFunction = vi.fn();

    eventManager.addListener(eventName1, fakeFunction);

    eventManager.triggerEvent(eventName1);

    expect(fakeFunction).toHaveBeenCalledOnce();
  });

  it('should add multiple listeners and call them all', () => {
    const fakeFunction1 = vi.fn();
    const fakeFunction2 = vi.fn();

    eventManager.addListener(eventName1, fakeFunction1);
    eventManager.addListener(eventName1, fakeFunction2);

    eventManager.triggerEvent(eventName1);

    expect(fakeFunction1).toHaveBeenCalledOnce();
    expect(fakeFunction2).toHaveBeenCalledOnce();
  });

  it('should notify only listeners to the triggered event', () => {
    const fakeFunction1 = vi.fn();
    const fakeFunction2 = vi.fn();

    eventManager.addListener(eventName1, fakeFunction1);
    eventManager.addListener(eventName2, fakeFunction2);

    eventManager.triggerEvent(eventName2);

    expect(fakeFunction1).not.toHaveBeenCalled();
    expect(fakeFunction2).toHaveBeenCalledOnce();
  });

  it('should remove listener', () => {
    const fakeFunction1 = vi.fn();
    const fakeFunction2 = vi.fn();

    eventManager.addListener(eventName1, fakeFunction1);
    eventManager.addListener(eventName1, fakeFunction2);

    eventManager.removeListener(eventName1, fakeFunction1);

    eventManager.triggerEvent(eventName1);

    expect(fakeFunction1).not.toHaveBeenCalled();
    expect(fakeFunction2).toHaveBeenCalledOnce();
  });
});
