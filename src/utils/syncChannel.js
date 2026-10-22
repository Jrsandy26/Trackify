// Realtime Cross-Account & Cross-Tab Collaboration Channel
let channel = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('trackify_team_collaboration');
  }
} catch (err) {
  console.warn('BroadcastChannel not supported in this environment:', err);
}

export const syncEventTypes = {
  INVITE_SENT: 'INVITE_SENT',
  INVITE_ACCEPTED: 'INVITE_ACCEPTED',
  INVITE_REVOKED: 'INVITE_REVOKED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  MEMBER_JOINED: 'MEMBER_JOINED'
};

export function broadcastTeamEvent(type, payload) {
  if (channel) {
    channel.postMessage({ type, payload, timestamp: Date.now() });
  }
  // Also dispatch local custom event so current tab handles it consistently
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trackify:sync', { detail: { type, payload } }));
  }
}

export function subscribeTeamEvents(callback) {
  if (!callback || typeof window === 'undefined') return () => {};

  const handleMessage = (event) => {
    callback(event.data || event.detail);
  };

  const handleCustom = (event) => {
    callback(event.detail);
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('trackify:sync', handleCustom);

  return () => {
    if (channel) channel.removeEventListener('message', handleMessage);
    window.removeEventListener('trackify:sync', handleCustom);
  };
}
