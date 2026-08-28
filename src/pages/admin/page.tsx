import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Overview from './components/Overview';
import Verifications from './components/Verifications';
import OfficialEffects from './components/OfficialEffects';
import Users from './components/Users';
import Requirements from './components/Requirements';
import Messages from './components/Messages';

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const initialTab = params.get('tab') || 'overview';
  const validTabs = ['overview', 'verifications', 'official', 'users', 'requirements', 'banned', 'messages'];
  const [tab, setTab] = useState(validTabs.includes(initialTab) ? initialTab : 'overview');

  const handleTabChange = (next: string) => {
    setTab(next);
    if (next === 'overview') params.delete('tab');
    else params.set('tab', next);
    setParams(params, { replace: true });
  };

  return (
    <AdminLayout activeTab={tab} onTabChange={handleTabChange}>
      {tab === 'overview' && <Overview onNavigateTab={handleTabChange} />}
      {tab === 'verifications' && <Verifications />}
      {tab === 'official' && <OfficialEffects />}
      {tab === 'users' && <Users />}
      {tab === 'requirements' && <Requirements />}
      {tab === 'banned' && <Users bannedOnly />}
      {tab === 'messages' && <Messages />}
    </AdminLayout>
  );
}