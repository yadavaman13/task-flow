import * as invitationService from './invitation.service.js';
import { success, created } from '../../core/utils/responseHelper.js';

export async function send(req, res) {
  const workspaceId = req.params.workspaceId || req.params.wId;
  const result = await invitationService.send(req.user.id, workspaceId, req.body);
  return created(res, result, 'Invitation sent successfully');
}

export async function getByWorkspace(req, res) {
  const workspaceId = req.params.workspaceId || req.params.wId;
  const invitations = await invitationService.getByWorkspace(req.user.id, workspaceId);
  return success(res, invitations);
}

export async function getMyPending(req, res) {
  const invitations = await invitationService.getMyPending(req.user.id);
  return success(res, invitations);
}

export async function accept(req, res) {
  const result = await invitationService.accept(req.user.id, req.body.token);
  return success(res, result, 'Invitation accepted');
}

export async function decline(req, res) {
  const result = await invitationService.decline(req.user.id, req.body.token);
  return success(res, result, 'Invitation declined');
}

export async function cancel(req, res) {
  const result = await invitationService.cancel(req.user.id, req.params.id);
  return success(res, result, 'Invitation cancelled');
}
