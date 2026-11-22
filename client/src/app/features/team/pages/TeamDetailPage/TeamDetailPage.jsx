import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, FolderKanban, Settings, Plus, ArrowLeft, Archive, Trash2 } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import { formatInitials } from '@/utils/formatters';
import { useTeam } from '../../hooks/useTeam';
import ProjectCard from '@/app/features/project/components/ProjectCard/ProjectCard';
import CreateProjectModal from '@/app/features/project/components/CreateProjectModal/CreateProjectModal';
import { useProject } from '@/app/features/project/hooks/useProject';
import './TeamDetailPage.scss';

export default function TeamDetailPage() {
  const { workspaceId, teamId } = useParams();
  const navigate = useNavigate();
  const {
    selectedTeam,
    teamMembers,
    loading,
    loadTeam,
    loadTeamMembers,
    handleUpdateTeam,
    handleRemoveTeamMember,
    handleArchiveTeam,
    isSubmitting,
  } = useTeam();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'members' | 'settings'
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { projects, loadTeamProjects } = useProject();

  const loadData = useCallback(() => {
    if (teamId) {
      loadTeam(teamId);
      loadTeamMembers(teamId);
      loadTeamProjects(teamId);
    }
  }, [teamId, loadTeam, loadTeamMembers, loadTeamProjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedTeam) {
      setEditForm({
        name: selectedTeam.name || '',
        description: selectedTeam.description || '',
      });
    }
  }, [selectedTeam]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    await handleUpdateTeam(teamId, editForm);
  };

  const onArchive = async () => {
    if (window.confirm('Are you sure you want to archive this team?')) {
      await handleArchiveTeam(teamId);
    }
  };

  if (loading && !selectedTeam) {
    return (
      <div className="team-detail-page__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="team-detail-page__not-found">
        <p>Team not found.</p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(`/workspaces/${workspaceId}`)}>
          Back to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      <div className="team-detail-page__nav">
        <button
          className="team-detail-page__back-btn"
          onClick={() => navigate(`/workspaces/${workspaceId}`)}
        >
          <ArrowLeft size={16} />
          <span>Back to Workspace</span>
        </button>
      </div>

      <div className="team-detail-header">
        <div className="team-detail-header__main">
          <div className="team-detail-header__icon">
            <Users size={24} />
          </div>
          <div className="team-detail-header__info">
            <div className="team-detail-header__title-row">
              <h1 className="team-detail-header__title">{selectedTeam.name}</h1>
              {selectedTeam.is_archived && (
                <span className="team-detail-header__archived-badge">
                  <Archive size={12} />
                  <span>Archived</span>
                </span>
              )}
            </div>
            {selectedTeam.description && (
              <p className="team-detail-header__desc">{selectedTeam.description}</p>
            )}
          </div>
        </div>

        {!selectedTeam.is_archived && (
          <div className="team-detail-header__actions">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateProjectOpen(true)}
            >
              New Project
            </Button>
          </div>
        )}
      </div>

      <div className="team-detail-tabs">
        <button
          className={`team-detail-tab ${activeTab === 'projects' ? 'team-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderKanban size={16} />
          <span>Projects</span>
        </button>

        <button
          className={`team-detail-tab ${activeTab === 'members' ? 'team-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={16} />
          <span>Members ({teamMembers.length})</span>
        </button>

        <button
          className={`team-detail-tab ${activeTab === 'settings' ? 'team-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>

      <div className="team-detail-content">
        {activeTab === 'projects' && (
          <div className="team-projects-tab">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Team Projects</h3>
              {!selectedTeam.is_archived && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  Create Project
                </Button>
              )}
            </div>

            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create projects to start tracking tasks and roadmaps with your team."
                action={
                  !selectedTeam.is_archived && (
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => setIsCreateProjectOpen(true)}
                    >
                      Create First Project
                    </Button>
                  )
                }
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id || proj._id}
                    project={proj}
                    onClick={() =>
                      navigate(
                        `/workspaces/${workspaceId}/teams/${teamId}/projects/${proj.id || proj._id}`
                      )
                    }
                  />
                ))}
              </div>
            )}

            <CreateProjectModal
              isOpen={isCreateProjectOpen}
              onClose={() => setIsCreateProjectOpen(false)}
              teamId={teamId}
              onCreated={() => loadTeamProjects(teamId)}
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div className="team-members-tab">
            {teamMembers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No members in this team"
                description="Members assigned to this team will show up here."
              />
            ) : (
              <div className="team-member-list">
                {teamMembers.map((member) => {
                  const mId = member.id || member.user_id;
                  return (
                    <div key={mId} className="team-member-item">
                      <div className="team-member-item__left">
                        <div className="team-member-item__avatar">
                          {formatInitials(member.name || member.email)}
                        </div>
                        <div className="team-member-item__info">
                          <span className="team-member-item__name">{member.name || 'Member'}</span>
                          <span className="team-member-item__email">{member.email}</span>
                        </div>
                      </div>

                      <div className="team-member-item__right">
                        <span className="team-member-item__role">
                          {member.role || 'TEAM_MEMBER'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleRemoveTeamMember(teamId, mId)}
                          title="Remove from team"
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
          <div className="team-settings-tab">
            <form onSubmit={handleSave} className="team-settings-form">
              <h3>Team Settings</h3>
              <Input
                label="Team Name"
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

              <div className="team-settings-form__actions">
                {!selectedTeam.is_archived && (
                  <Button
                    type="button"
                    variant="danger"
                    icon={Archive}
                    onClick={onArchive}
                  >
                    Archive Team
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
