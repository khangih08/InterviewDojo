"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const roles_decorator_1 = require("../decorator/roles.decorator");
class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requireRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requireRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requireRoles.some((role) => user.role === role);
    }
}
exports.RolesGuard = RolesGuard;
//# sourceMappingURL=roles.guard.js.map