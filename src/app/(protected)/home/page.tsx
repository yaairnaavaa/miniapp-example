"use client";

import { useEffect, useState } from 'react';
import { Page } from '@/components/PageLayout';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { Guestbook } from '@/components/Guesbook';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';

export default function Home() {
  const [session, setSession] = useState<any>(null); // Te sugiero tiparlo si sabes la forma de session
  const [isVerify, setIsVerify] = useState<boolean>(false);

  useEffect(() => {
    const fetchAuth = async () => {
      const res = await import('@/auth').then((m) => m.auth());
      setSession(res);
    };
    fetchAuth();
  }, []);

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Home"
          endAdornment={
            session?.user && (
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold capitalize">
                  {session.user.username}
                </p>
                <Marble src={session.user.profilePictureUrl} className="w-12" />
              </div>
            )
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        <UserInfo />
        <Verify onVerified={setIsVerify} />
        <Guestbook isVerify={isVerify} />
      </Page.Main>
    </>
  );
}
