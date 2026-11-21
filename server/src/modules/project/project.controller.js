import * as projectService from './project.service.js';
import { success, created, noContent } from '../../core/utils/responseHelper.js';

export async function create(req, res) {
  const teamId = req.params.teamId || req.params.tId;
  const project = await projectService.create(req.user.id, teamId, req.body);
  return created(res, project, 'Project created successfully');
}

export async function listByTeam(req, res) {
  const teamId = req.params.teamId || req.params.tId;
  const projects = await projectService.getByTeam(req.user.id, teamId);
  return success(res, projects);
}

export async function get(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const project = await projectService.get(req.user.id, projectId);
  return success(res, project);
}

export async function update(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const project = await projectService.update(req.user.id, projectId, req.body);
  return success(res, project, 'Project updated successfully');
}

export async function archive(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const result = await projectService.archive(req.user.id, projectId);
  return success(res, result, 'Project archived successfully');
}

export async function getMembers(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const members = await projectService.getMembers(req.user.id, projectId);
  return success(res, members);
}

export async function addMember(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  const result = await projectService.addMember(
    req.user.id,
    projectId,
    req.body.userId,
    req.body.role
  );
  return created(res, result, 'Project member added successfully');
}

export async function removeMember(req, res) {
  const projectId = req.params.projectId || req.params.pId;
  await projectService.removeMember(req.user.id, projectId, req.params.userId);
  return noContent(res);
}
