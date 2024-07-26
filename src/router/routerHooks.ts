import constants from '@/util/constants';
import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useUser } from '@/composables/useUser';

const { getCurrentUserRef } = useUser();
const currentUser = getCurrentUserRef();

export function beforeEachRoute(
        to: RouteLocationNormalized, 
        from: RouteLocationNormalized, 
        next: NavigationGuardNext) {

    // const noLoggedUserWantsToRegister = to.name === constants.routes.register.name && !currentUser.value.isLoggedIn;
    // const noLoggedUserNavigatingToPage = to.name != constants.routes.login.name && !currentUser.value.isLoggedIn;

    // if (noLoggedUserWantsToRegister) {
    //   next();
    // } else if (noLoggedUserNavigatingToPage) {
    //   next({ name: constants.routes.login.name });
    // } else {
    //   next();
    // }

    const userIsLogged  = currentUser.value.isLoggedIn;

    if (userIsLogged) {
        if (to.name === constants.routes.register.name || to.name === constants.routes.login.name) {
            return next({ name: constants.routes.profile.name });
        }
        return next();
    } else {
        if (to.name === constants.routes.register.name) {
            return next();
        }
        return next({ name: constants.routes.login.name });
    }
};
