import { describe, beforeEach, it, expect } from 'vitest';
import constants from '@/util/constants';
import { Router } from 'vue-router';
import { createRouterForRoutes } from './helpers/router';
import { renderTestLayout } from './helpers/pageRender';

let router: Router;

describe('Register oage', () => {

    beforeEach(async () => {
        router = createRouterForRoutes([
            { name: constants.routes.register.name },
            { name: constants.routes.login.name }
        ]);

        router.push({ name: constants.routes.register.name });
        await router.isReady();
    });

    it('should render the page', () => {
        const { getByText } = renderTestLayout(router);
        expect(getByText('Confirm Password')).toBeTruthy();
    })

});
