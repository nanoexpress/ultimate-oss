import { httpMethods } from '../../constants.js';

export default (Route) => {
  const allMethods = httpMethods.concat(['ws']);

  Route.wraps = function _routeWrapWrapper(afterApply, beforeApply) {
    allMethods.forEach((method) => {
      const _oldCall = Route.prototype[method];
      Route.prototype[method] = function _routeWrapDefine(...args) {
        if (beforeApply) {
          beforeApply(method, args, this);
        }

        // Call parent method
        _oldCall.apply(this, args);

        if (afterApply) {
          afterApply(method, args, this);
        }
      };
    });
  };
};
