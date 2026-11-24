import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Search } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import EmptyState from '@/components/Shared/Feedback/EmptyState/EmptyState';
import WorkspaceCard from '../../components/WorkspaceCard/WorkspaceCard';
import CreateWorkspaceModal from '../../components/CreateWorkspaceModal/CreateWorkspaceModal';
import InviteModal from '@/app/features/invitation/components/InviteModal/InviteModal';
import { useWorkspace } from '../../hooks/useWorkspace';
import './WorkspaceListPage.scss';

export default function WorkspaceListPage() {
  const { workspaces, loadWorkspaces, loading } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteWorkspace, setInviteWorkspace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ws.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="workspace-list-page">
      <div className="workspace-list-page__header">
        <div className="workspace-list-page__title-group">
          <h1 className="workspace-list-page__title">Workspaces</h1>
          <p className="workspace-list-page__subtitle">
            Manage your organization&apos;s workspaces, teams, and projects
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Workspace
        </Button>
      </div>

      {workspaces.length > 0 && (
        <div className="workspace-list-page__toolbar">
          <div className="workspace-search">
            <Search size={16} className="workspace-search__icon" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="workspace-search__input"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="workspace-list-page__loading">
          <Spinner size="lg" />
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={searchTerm ? 'No matching workspaces' : 'No workspaces yet'}
          description={
            searchTerm
              ? 'Try adjusting your search query to find what you are looking for.'
              : 'Create your first workspace to start collaborating with your team.'
          }
          action={
            !searchTerm && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setIsModalOpen(true)}
              >
                Create Workspace
              </Button>
            )
          }
        />
      ) : (
        <div className="workspace-list-page__grid">
          {filteredWorkspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id || ws._id}
              workspace={ws}
              onClick={() => navigate(`/workspaces/${ws.id || ws._id}`)}
              onInvite={(wsToInvite) => setInviteWorkspace(wsToInvite)}
            />
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newWs) => {
          navigate(`/workspaces/${newWs.id || newWs._id}`);
        }}
      />

      {inviteWorkspace && (
        <InviteModal
          isOpen={Boolean(inviteWorkspace)}
          onClose={() => setInviteWorkspace(null)}
          workspaceId={inviteWorkspace.id || inviteWorkspace._id}
          onSent={() => loadWorkspaces()}
        />
      )}
    </div>
  );
}
