import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Settings, UserPlus, ArrowLeft, LayoutDashboard, Shield, Plus, FolderKanban } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import MemberList from '../../components/MemberList/MemberList';
import InviteModal from '@/app/features/invitation/components/InviteModal/InviteModal';
import TeamCard from '@/app/features/team/components/TeamCard/TeamCard';
import CreateTeamModal from '@/app/features/team/components/CreateTeamModal/CreateTeamModal';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useTeam } from '@/app/features/team/hooks/useTeam';
import { useInvitation } from '@/app/features/invitation/hooks/useInvitation';
import { useAuthContext } from '@/app/features/auth/context/auth.context';
import './WorkspaceDetailPage.scss';

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    selectedWorkspace,
    members,
    loading,
    loadWorkspace,
    loadMembers,
    handleUpdateWorkspace,
    handleUpdateMemberRole,
    handleRemoveMember,
    isSubmitting,
  } = useWorkspace();
  const { teams, loadWorkspaceTeams } = useTeam();
  const {
    workspaceInvitations,
    loadWorkspaceInvitations,
    handleCancelInvitation,
  } = useInvitation();

  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'members' | 'settings'
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const loadData = useCallback(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId);
      loadMembers(workspaceId);
      loadWorkspaceTeams(workspaceId);
      loadWorkspaceInvitations(workspaceId);
    }
  }, [workspaceId, loadWorkspace, loadMembers, loadWorkspaceTeams, loadWorkspaceInvitations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedWorkspace) {
      setEditForm({
        name: selectedWorkspace.name || '',
        description: selectedWorkspace.description || '',
      });
    }
  }, [selectedWorkspace]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    await handleUpdateWorkspace(workspaceId, editForm);
  };

  const userRole = (selectedWorkspace?.role || 'MEMBER').toUpperCase();
  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  const pendingInvitations = useMemo(() => {
    return (workspaceInvitations || []).filter(
      (inv) => inv.status === 'PENDING' || !inv.status
    );
  }, [workspaceInvitations]);

  if (loading && !selectedWorkspace) {
    return (
      <div className="workspace-detail-page__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="workspace-detail-page__not-found">
        <p>Workspace not found.</p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/workspaces')}>
          Back to Workspaces
        </Button>
      </div>
    );
  }

  return (
    <div className="workspace-detail-page">
      <div className="workspace-detail-page__nav">
        <button
          className="workspace-detail-page__back-btn"
          onClick={() => navigate('/workspaces')}
        >
          <ArrowLeft size={16} />
          <span>Workspaces</span>
        </button>
      </div>

      <div className="workspace-detail-header">
        <div className="workspace-detail-header__main">
          <div className="workspace-detail-header__icon">
            <Building2 size={24} />
          </div>
          <div className="workspace-detail-header__info">
            <div className="workspace-detail-header__title-row">
              <h1 className="workspace-detail-header__title">{selectedWorkspace.name}</h1>
              <span className={`workspace-detail-header__badge workspace-detail-header__badge--${userRole.toLowerCase()}`}>
                <Shield size={12} />
                <span>{userRole}</span>
              </span>
            </div>
            {selectedWorkspace.description && (
              <p className="workspace-detail-header__desc">{selectedWorkspace.description}</p>
            )}
          </div>
        </div>

        <div className="workspace-detail-header__actions">
          {isOwnerOrAdmin && (
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          )}
          <Button
            variant="secondary"
            icon={LayoutDashboard}
            onClick={() => navigate(`/dashboard/${workspaceId}`)}
          >
            Dashboard
          </Button>
        </div>
      </div>

      <div className="workspace-detail-tabs">
        <button
          className={`workspace-detail-tab ${activeTab === 'teams' ? 'workspace-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <FolderKanban size={16} />
          <span>Teams ({teams.length})</span>
        </button>

        <button
          className={`workspace-detail-tab ${activeTab === 'members' ? 'workspace-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={16} />
          <span>Members ({members.length})</span>
        </button>

        <button
          className={`workspace-detail-tab ${activeTab === 'settings' ? 'workspace-detail-tab--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>

      <div className="workspace-detail-content">
        {activeTab === 'teams' && (
          <div className="workspace-teams-tab">
            <div className="workspace-teams-tab__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Workspace Teams</h3>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateTeamOpen(true)}
              >
                Create Team
              </Button>
            </div>

            {teams.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No teams in this workspace"
                description="Organize your workspace into specialized engineering, product, or design teams."
                action={
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setIsCreateTeamOpen(true)}
                  >
                    Create First Team
                  </Button>
                }
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {teams.map((t) => (
                  <TeamCard
                    key={t.id || t._id}
                    team={t}
                    onClick={() => navigate(`/workspaces/${workspaceId}/teams/${t.id || t._id}`)}
                  />
                ))}
              </div>
            )}

            <CreateTeamModal
              isOpen={isCreateTeamOpen}
              onClose={() => setIsCreateTeamOpen(false)}
              workspaceId={workspaceId}
              onCreated={() => loadWorkspaceTeams(workspaceId)}
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div className="workspace-members-tab">
            <div className="workspace-members-tab__header">
              <h3>Workspace Members</h3>
              {isOwnerOrAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Invite Member
                </Button>
              )}
            </div>

            <MemberList
              members={members}
              currentRole={userRole}
              currentUserId={user?.id || user?._id}
              onUpdateRole={(userId, role) => handleUpdateMemberRole(workspaceId, userId, role)}
              onRemoveMember={(userId) => handleRemoveMember(workspaceId, userId)}
            />

            {isOwnerOrAdmin && pendingInvitations.length > 0 && (
              <div className="workspace-invitations-section">
                <h4 className="workspace-invitations-title">
                  Pending Invitations ({pendingInvitations.length})
                </h4>
                <div className="workspace-invitations-wrapper">
                  <table className="workspace-invitations-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingInvitations.map((inv) => {
                        const invId = inv.id || inv._id;
                        return (
                          <tr key={invId}>
                            <td className="workspace-invitations-email">{inv.email}</td>
                            <td>
                              <span className={`member-role-badge member-role-badge--${inv.role?.toLowerCase()}`}>
                                <Shield size={12} />
                                <span>{inv.role}</span>
                              </span>
                            </td>
                            <td>
                              <span className="workspace-invitations-status">
                                {inv.status || 'PENDING'}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelInvitation(workspaceId, invId)}
                                title="Cancel invitation"
                              >
                                Cancel
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="workspace-settings-tab">
            <form onSubmit={handleSaveSettings} className="workspace-settings-form">
              <h3>General Settings</h3>
              <Input
                label="Workspace Name"
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
                rows={4}
              />

              <div className="workspace-settings-form__actions">
                <Button type="submit" variant="primary" loading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
        onSent={() => {
          loadMembers(workspaceId);
          loadWorkspaceInvitations(workspaceId);
        }}
      />
    </div>
  );
}
