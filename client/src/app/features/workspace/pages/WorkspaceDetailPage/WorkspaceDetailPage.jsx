import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Settings, UserPlus, ArrowLeft, LayoutDashboard, Shield } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Input from '@/components/Shared/Form/Input/Input';
import Textarea from '@/components/Shared/Form/Textarea/Textarea';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import MemberList from '../../components/MemberList/MemberList';
import { useWorkspace } from '../../hooks/useWorkspace';
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

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'settings'
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const loadData = useCallback(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId);
      loadMembers(workspaceId);
    }
  }, [workspaceId, loadWorkspace, loadMembers]);

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

  const userRole = selectedWorkspace.role || 'MEMBER';

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
        {activeTab === 'members' && (
          <div className="workspace-members-tab">
            <div className="workspace-members-tab__header">
              <h3>Workspace Members</h3>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => navigate('/invitations')}
              >
                Manage Invitations
              </Button>
            </div>

            <MemberList
              members={members}
              currentRole={userRole}
              currentUserId={user?.id}
              onUpdateRole={(userId, role) => handleUpdateMemberRole(workspaceId, userId, role)}
              onRemoveMember={(userId) => handleRemoveMember(workspaceId, userId)}
            />
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
    </div>
  );
}
