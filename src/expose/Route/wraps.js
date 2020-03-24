import { httpMethods } from '../../constants.js';

export default (Route) => {
  const allMethods = httpMethods.concat(['ws']);

  Route.wraps = function (afterApply, beforeApply) {
    allMethods.forEach((method) => {
      const _oldCall = Route.prototype[method];
      Route.prototype[method] = function (...args) {
        beforeApply && beforeApply(method, args, this);

        // Call parent method
        _oldCall.apply(this, args);

        afterApply && afterApply(method, args, this);
      };
    });
  };
};
