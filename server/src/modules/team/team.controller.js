import * as teamService from './team.service.js';
import { success, created, noContent } from '../../core/utils/responseHelper.js';

export async function create(req, res) {
  const workspaceId = req.params.workspaceId || req.params.wId;
  const team = await teamService.create(req.user.id, workspaceId, req.body);
  return created(res, team, 'Team created successfully');
}

export async function list(req, res) {
  const workspaceId = req.params.workspaceId || req.params.wId;
  const teams = await teamService.getByWorkspace(req.user.id, workspaceId);
  return success(res, teams);
}

export async function get(req, res) {
  const team = await teamService.get(req.user.id, req.params.teamId);
  return success(res, team);
}

export async function update(req, res) {
  const team = await teamService.update(req.user.id, req.params.teamId, req.body);
  return success(res, team, 'Team updated successfully');
}

export async function archive(req, res) {
  const result = await teamService.archive(req.user.id, req.params.teamId);
  return success(res, result, 'Team archived successfully');
}

export async function getMembers(req, res) {
  const members = await teamService.getMembers(req.user.id, req.params.teamId);
  return success(res, members);
}

export async function addMember(req, res) {
  const result = await teamService.addMember(
    req.user.id,
    req.params.teamId,
    req.body.userId,
    req.body.role
  );
  return created(res, result, 'Team member added successfully');
}

export async function removeMember(req, res) {
  await teamService.removeMember(req.user.id, req.params.teamId, req.params.userId);
  return noContent(res);
}
