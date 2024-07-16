import MainLayoutTest from './MainLayoutTest.vue';
import { RenderResult, render } from '@testing-library/vue';
import { Quasar } from 'quasar';
import { Router } from 'vue-router';
import constants from '@/util/constants';

export function renderTestLayout(router: Router): RenderResult {
    return render(MainLayoutTest, {
        global: {
            plugins: [Quasar, router],
            stubs: {
                TheFooter: {
                    template: '<div><slot></slot></div>',
                }
            },
            mocks: {
                $Const: constants
            }
        }
    });
}