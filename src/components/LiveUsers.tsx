import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LiveUsers() {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    // Generate a random ID for the current user's session
    const sessionId = Math.random().toString(36).substring(2, 15);

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        // Count total unique keys in the presence state
        const count = Object.keys(presenceState).length;
        setOnlineCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
      <div className="relative flex h-2 w-2 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
      </div>
      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
        {onlineCount} {onlineCount === 1 ? 'persona conectada' : 'personas conectadas'}
      </span>
    </div>
  );
}
