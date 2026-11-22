import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderKanban, CheckSquare, Users, Settings, Plus, ArrowLeft, Archive, Trash2, Lock } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Select from '@/components/Shared/Form/Select/Select';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import { formatInitials } from '@/utils/formatters';
import { PROJECT_STATUSES, PROJECT_VISIBILITY } from '@/utils/constants';
import { useProject } from '../../hooks/useProject';
import './ProjectDetailPage.scss';

export default function ProjectDetailPage() {
  const { workspaceId, teamId, projectId } = useParams();
  const navigate = useNavigate();
  const {
    selectedProject,
    projectMembers,
    loading,
    loadProject,
    loadProjectMembers,
    handleUpdateProject,
    handleRemoveProjectMember,
    handleArchiveProject,
    isSubmitting,
  } = useProject();

  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'members' | 'settings'
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: PROJECT_STATUSES.ACTIVE,
    visibility: PROJECT_VISIBILITY.TEAM,
  });

  const loadData = useCallback(() => {
    if (projectId) {
      loadProject(projectId);
      loadProjectMembers(projectId);
    }
  }, [projectId, loadProject, loadProjectMembers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedProject) {
      setEditForm({
        name: selectedProject.name || '',
        description: selectedProject.description || '',
        status: selectedProject.status || PROJECT_STATUSES.ACTIVE,
        visibility: selectedProject.visibility || PROJECT_VISIBILITY.TEAM,
      });
    }
  }, [selectedProject]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    await handleUpdateProject(projectId, editForm);
  };

  const onArchive = async () => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      await handleArchiveProject(projectId);
    }
  };

  if (loading && !selectedProject) {
    return (
      <div className="project-detail-page__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="project-detail-page__not-found">
        <p>Project not found.</p>
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate(`/workspaces/${workspaceId}/teams/${teamId}`)}
        >
          Back to Team
        </Button>
      </div>
    );
  }

  const isPrivate = selectedProject.visibility === 'PRIVATE';
  const status = selectedProject.status || 'ACTIVE';

  return (
    <div className="project-detail-page">
      <div className="project-detail-page__nav">
        <button
          className="project-detail-page__back-btn"
          onClick={() => navigate(`/workspaces/${workspaceId}/teams/${teamId}`)}
        >
          <ArrowLeft size={16} />
          <span>Back to Team</span>
        </button>
      </div>

      <div className="project-detail-header">
        <div className="project-detail-header__main">
          <div className="project-detail-header__icon">
            <FolderKanban size={24} />
          </div>
          <div className="project-detail-header__info">
            <div className="project-detail-header__title-row">
              <h1 className="project-detail-header__title">{selectedProject.name}</h1>
              <div className="project-detail-header__badges">
                {isPrivate && (
                  <span className="project-badge project-badge--private">
                    <Lock size={12} />
                    <span>Private</span>
                  </span>
                )}
                <span className={`project-badge project-badge--${status.toLowerCase()}`}>
                  {status}
                </span>
              </div>
            </div>
            {selectedProject.description && (
              <p className="project-detail-header__desc">{selectedProject.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="project-detail-tabs">
        <button
          className={`project-detail-tab ${activeTab === 'tasks' ? 'project-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} />
          <span>Tasks</span>
        </button>

        <button
          className={`project-detail-tab ${activeTab === 'members' ? 'project-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={16} />
          <span>Members ({projectMembers.length})</span>
        </button>

        <button
          className={`project-detail-tab ${activeTab === 'settings' ? 'project-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>

      <div className="project-detail-content">
        {activeTab === 'tasks' && (
          <div className="project-tasks-tab">
            <EmptyState
              icon={CheckSquare}
              title="Project Tasks"
              description="Tasks assigned to this project will be listed here with status boards and filtering."
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div className="project-members-tab">
            {projectMembers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No specific project members"
                description={
                  isPrivate
                    ? 'This private project requires explicit member assignment.'
                    : 'All members of this team have access to this project.'
                }
              />
            ) : (
              <div className="project-member-list">
                {projectMembers.map((member) => {
                  const mId = member.id || member.user_id;
                  return (
                    <div key={mId} className="project-member-item">
                      <div className="project-member-item__left">
                        <div className="project-member-item__avatar">
                          {formatInitials(member.name || member.email)}
                        </div>
                        <div className="project-member-item__info">
                          <span className="project-member-item__name">{member.name || 'Member'}</span>
                          <span className="project-member-item__email">{member.email}</span>
                        </div>
                      </div>

                      <div className="project-member-item__right">
                        <span className="project-member-item__role">
                          {member.role || 'PROJECT_MEMBER'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleRemoveProjectMember(projectId, mId)}
                          title="Remove from project"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="project-settings-tab">
            <form onSubmit={handleSave} className="project-settings-form">
              <h3>Project Settings</h3>
              <Input
                label="Project Name"
                name="name"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />

              <Textarea
                label="Description"
                name="description"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />

              <Select
                label="Status"
                name="status"
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                options={[
                  { value: 'PLANNING', label: 'Planning' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
              />

              <Select
                label="Visibility"
                name="visibility"
                value={editForm.visibility}
                onChange={(e) => setEditForm((p) => ({ ...p, visibility: e.target.value }))}
                options={[
                  { value: 'TEAM', label: 'Team — accessible to all team members' },
                  { value: 'PRIVATE', label: 'Private — accessible only to assigned members' },
                ]}
              />

              <div className="project-settings-form__actions">
                {status !== 'ARCHIVED' && (
                  <Button
                    type="button"
                    variant="danger"
                    icon={Archive}
                    onClick={onArchive}
                  >
                    Archive Project
                  </Button>
                )}
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
