'use client';

import { useState, useEffect } from 'react';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MessageSquare, Globe } from 'lucide-react';
import type { Session } from 'next-auth';
import { MiniKit } from "@worldcoin/minikit-js";
import { Contract_Abi } from "@/abi/ContractAbi";
import { getPublicClient } from '@wagmi/core';
import { config } from '@/providers/wagmi-config';

interface GuestbookProps {
  isVerify: boolean;
  session: Session | null;
}

interface GuestbookEntry {
  id: bigint;
  address: `0x${string}`;
  name: string;
  message: string;
  timestamp: Date;
}

export const Guestbook = ({ isVerify, session }: GuestbookProps) => {
  const [userName, setUserName] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const publicClient = getPublicClient(config);

  const fetchEntries = async () => {
    try {
      const rawEntries = await publicClient.readContract({
        abi: Contract_Abi,
        address: "0x3679e60D898D9Db14Cf3cc5342344A81ac7b5711",
        functionName: "getLatestEntries",
        args: [],
      });

      const typedEntries = rawEntries as {
        id: bigint;
        author: `0x${string}`;
        name: string;
        message: string;
        timestamp: bigint;
      }[];

      const parsedEntries: GuestbookEntry[] = typedEntries.map((entry) => ({
        id: entry.id,
        address: entry.author,
        name: entry.name,
        message: entry.message,
        timestamp: new Date(Number(entry.timestamp) * 1000),
      }));

      setEntries(parsedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const submitMessage = async () => {
    if (!userName.trim() || !userMessage.trim()) {
      setFeedback('Please complete name and message');
      return;
    }
    setIsLoading(true);
    try {
      await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: "0x3679e60D898D9Db14Cf3cc5342344A81ac7b5711",
            abi: Contract_Abi,
            functionName: 'addEntry',
            args: [userName, userMessage],
          },
        ],
      });

      setUserName('');
      setUserMessage('');
      setFeedback('Message added!');
      await fetchEntries(); // 🔁 Recargar mensajes
    } catch {
      setFeedback('Failed to submit message');
    } finally {
      setIsLoading(false);
    }
  };

  function shortenAddress(address: string, chars = 5): string {
    return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
  }

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

      {isVerify && (
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
            <label style={{ marginTop: '5px' }}>
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
        <div key={entry.id.toString()} style={{ borderBottom: '1px solid #ccc', marginTop: '1rem', paddingBottom: '1rem' }}>
          <strong>{entry.name}</strong> — <span style={{ color: '#555' }}>{shortenAddress(entry.address)}</span>
          <p>{entry.message}</p>
          <small>{formatTimeAgo(entry.timestamp)}</small>
        </div>
      ))}
    </div>
  );
};
