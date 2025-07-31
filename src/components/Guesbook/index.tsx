'use client';

import { useState, useEffect } from 'react';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MessageSquare, Globe } from 'lucide-react';

interface GuestbookProps {
  isVerify: boolean;
}

interface GuestbookEntry {
  id: string;
  address: string;
  name: string;
  message: string;
  timestamp: Date;
}

export const Guestbook = ({ isVerify }: GuestbookProps) => {
  const [userName, setUserName] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Simular datos iniciales
  useEffect(() => {
    const mockEntries: GuestbookEntry[] = [
      {
        id: '1',
        address: '0x1234...5678',
        name: 'Alice',
        message: '¡Hola World Chain!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];
    setEntries(mockEntries);
  }, []);

  const submitMessage = async () => {
    if (!userName.trim() || !userMessage.trim()) {
      setFeedback('Please complete name and message');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newEntry: GuestbookEntry = {
        id: Date.now().toString(),
        address: "0x123...",
        name: userName,
        message: userMessage,
        timestamp: new Date(),
      };
      setEntries((prev) => [newEntry, ...prev]);
      setUserName('');
      setUserMessage('');
      setFeedback('Message added!');
    } catch {
      setFeedback('Failed to submit message');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 3600000);
    return diff < 1 ? 'Just now' : `${diff}h ago`;
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Globe size={28} /> World Chain Guestbook
      </h1>

      <p>Verify your account to leave a message for the World Chain community 🌍</p>

      {!isVerify && (
        <>
          <div style={{ marginTop: '1rem' }}>
            <label>
              Name:
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ display: 'block', marginTop: 4, border: 'solid 0.1px black', borderRadius: '5px' }}
              />
            </label>
            <label style={{marginTop: '5px'}}>
              Message:
              <textarea
                rows={3}
                cols={40}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                style={{ display: 'block', marginTop: 4, border: 'solid 0.1px black', borderRadius: '5px' }}
              />
            </label>
            <Button onClick={submitMessage} disabled={isLoading} style={{ marginTop: '10px' }}>
              {isLoading ? 'Submitting...' : 'Add Message'}
            </Button>
          </div>
        </>
      )}
      {feedback && <LiveFeedback>{feedback}</LiveFeedback>}

      <hr style={{ margin: '2rem 0' }} />

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={20} /> Messages ({entries.length})
      </h2>

      {entries.map((entry) => (
        <div key={entry.id} style={{ borderBottom: '1px solid #ccc', marginTop: '1rem', paddingBottom: '1rem' }}>
          <strong>{entry.name}</strong> — <span style={{ color: '#555' }}>{entry.address}</span>
          <p>{entry.message}</p>
          <small>{formatTimeAgo(entry.timestamp)}</small>
        </div>
      ))}
    </div>
  );
};
