import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Building2, FolderKanban, CheckCircle2, ArrowLeft } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import WorkloadChart from '../../components/WorkloadChart/WorkloadChart';
import ActivityFeed from '@/app/features/activity/components/ActivityFeed/ActivityFeed';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import Button from '@/components/Shared/Buttons/Button/Button';
import { useDashboard } from '../../hooks/useDashboard';
import { useActivity } from '@/app/features/activity/hooks/useActivity';
import { useWorkspace } from '@/app/features/workspace/hooks/useWorkspace';
import './DashboardPage.scss';

export default function DashboardPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspaceStats, loading, loadWorkspaceStats } = useDashboard();
  const { activities, loadWorkspaceActivity, loading: activityLoading } = useActivity();
  const { loadWorkspace } = useWorkspace();

  const loadData = useCallback(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId);
      loadWorkspaceStats(workspaceId);
      loadWorkspaceActivity(workspaceId);
    }
  }, [workspaceId, loadWorkspace, loadWorkspaceStats, loadWorkspaceActivity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !workspaceStats) {
    return (
      <div className="dashboard-page__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = workspaceStats || {};

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__nav">
        <button
          className="dashboard-page__back-btn"
          onClick={() => navigate(`/workspaces/${workspaceId}`)}
        >
          <ArrowLeft size={16} />
          <span>Back to Workspace</span>
        </button>
      </div>

      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Workspace Analytics</h1>
        <p className="dashboard-page__subtitle">
          Overview of members, teams, active projects, and system activities
        </p>
      </div>

      <div className="dashboard-page__stats-grid">
        <StatCard
          title="Total Members"
          value={stats.total_members ?? 0}
          icon={Users}
          subtitle="Collaborators"
        />
        <StatCard
          title="Total Teams"
          value={stats.total_teams ?? 0}
          icon={Building2}
          subtitle="Specialized units"
        />
        <StatCard
          title="Active Projects"
          value={stats.active_projects ?? 0}
          icon={FolderKanban}
          subtitle="In flight"
        />
        <StatCard
          title="Completed Projects"
          value={stats.completed_projects ?? 0}
          icon={CheckCircle2}
          subtitle="Delivered"
        />
      </div>

      <div className="dashboard-page__sections">
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3>Recent Workspace Activity</h3>
          </div>
          <ActivityFeed activities={activities} loading={activityLoading} />
        </div>
      </div>
    </div>
  );
}
