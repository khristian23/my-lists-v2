import { describe, it, expect, vi } from 'vitest';
import constants from '@/util/constants';
import { useUser } from '@/composables/useUser';
import User from '@/models/user';
import { beforeEachRoute } from '@/router/routerHooks';
import { RouteLocationNormalized } from 'vue-router';

describe('Before Each Route', () => {
    it('should redirect logged user to profile page when trying to navigate to registration page', async () => {
        const { setCurrentUser } = useUser();

        const testUser = new User({ name: 'TestUser' });
        setCurrentUser(testUser);
        expect(testUser.isLoggedIn).toBeTruthy();

        const to = { name: constants.routes.register.name } as RouteLocationNormalized;
        const from = {} as RouteLocationNormalized;
        const next = vi.fn();

        beforeEachRoute(to, from, next);

        const parameterUsedToCallNextFn = next.mock.calls[0][0];
        expect(parameterUsedToCallNextFn.name).toBe(constants.routes.profile.name);
    });

    it('should redirect logged user to profile page when trying to navigate to login page', async () => {
        const { setCurrentUser } = useUser();

        const testUser = new User({ name: 'TestUser' });
        setCurrentUser(testUser);
        expect(testUser.isLoggedIn).toBeTruthy();

        const to = { name: constants.routes.login.name } as RouteLocationNormalized;
        const from = {} as RouteLocationNormalized;
        const next = vi.fn();

        beforeEachRoute(to, from, next);

        const parameterUsedToCallNextFn = next.mock.calls[0][0];
        expect(parameterUsedToCallNextFn.name).toBe(constants.routes.profile.name);
    });

    it('should allow logged user to navigate to any page', async () => {
        const { setCurrentUser } = useUser();

        const testUser = new User({ name: 'TestUser' });
        setCurrentUser(testUser);
        expect(testUser.isLoggedIn).toBeTruthy();

        const to = { name: constants.routes.lists.name } as RouteLocationNormalized;
        const from = {} as RouteLocationNormalized;
        const next = vi.fn();

        beforeEachRoute(to, from, next);

        expect(next).toBeCalled();

        const parameterUsedToCallNextFn = next.mock.calls[0][0];
        expect(parameterUsedToCallNextFn).toBeUndefined();
    });

    it('should redirect anonymous user to login page when trying to navigate to any page', async () => {
        const { setCurrentUserAsAnonymous, getCurrentUserRef } = useUser();

        setCurrentUserAsAnonymous();
        expect(getCurrentUserRef().value.isLoggedIn).toBeFalsy();

        const to = { name: constants.routes.lists.name } as RouteLocationNormalized;
        const from = {} as RouteLocationNormalized;
        const next = vi.fn();

        beforeEachRoute(to, from, next);

        const parameterUsedToCallNextFn = next.mock.calls[0][0];
        expect(parameterUsedToCallNextFn.name).toBe(constants.routes.login.name);
    });

    it('should allow an anonymous user to navigate to registration page', async () => {
        const { setCurrentUserAsAnonymous, getCurrentUserRef } = useUser();

        setCurrentUserAsAnonymous();
        expect(getCurrentUserRef().value.isLoggedIn).toBeFalsy();

        const to = { name: constants.routes.register.name } as RouteLocationNormalized;
        const from = {} as RouteLocationNormalized;
        const next = vi.fn();

        beforeEachRoute(to, from, next);

        expect(next).toBeCalled();

        const parameterUsedToCallNextFn = next.mock.calls[0][0];
        expect(parameterUsedToCallNextFn).toBeUndefined();
    });
}); 
