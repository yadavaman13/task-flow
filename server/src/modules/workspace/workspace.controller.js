import * as workspaceService from './workspace.service.js';
import { success, created, noContent } from '../../core/utils/responseHelper.js';

export async function create(req, res) {
  const workspace = await workspaceService.create(req.user.id, req.body);
  return created(res, workspace, 'Workspace created successfully');
}

export async function list(req, res) {
  const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
  return success(res, workspaces);
}

export async function get(req, res) {
  const workspace = await workspaceService.get(req.user.id, req.params.workspaceId);
  return success(res, workspace);
}

export async function update(req, res) {
  const workspace = await workspaceService.update(req.user.id, req.params.workspaceId, req.body);
  return success(res, workspace, 'Workspace updated successfully');
}

export async function getMembers(req, res) {
  const members = await workspaceService.getMembers(req.user.id, req.params.workspaceId);
  return success(res, members);
}

export async function removeMember(req, res) {
  await workspaceService.removeMember(req.user.id, req.params.workspaceId, req.params.userId);
  return noContent(res);
}

export async function updateMemberRole(req, res) {
  const result = await workspaceService.updateMemberRole(
    req.user.id,
    req.params.workspaceId,
    req.params.userId,
    req.body.role
  );
  return success(res, result, 'Member role updated successfully');
}
