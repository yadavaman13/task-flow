import * as wsMemberQ from '../../queries/workspaceMember.queries.js';
import { ForbiddenError } from '../errors/AppError.js';

export const authorize = {
  /**
   * Verify user is a workspace member. Optionally require specific roles.
   * Attaches req.workspaceMember.
   */
  workspaceMember(requiredRoles = []) {
    return async (req, _res, next) => {
      const workspaceId = req.params.workspaceId || req.params.wId;
      const member = await wsMemberQ.findMember(workspaceId, req.user.id);
      if (!member) throw new ForbiddenError('Not a workspace member');
      if (requiredRoles.length && !requiredRoles.includes(member.role)) {
        throw new ForbiddenError('Insufficient workspace role');
      }
      req.workspaceMember = member;
      next();
    };
  },
};
