'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useState } from 'react';

/**
 * This component is an example of how to use World ID in Mini Apps
 * Minikit commands must be used on client components
 * It's critical you verify the proof on the server side
 * Read More: https://docs.world.org/mini-apps/commands/verify#verifying-the-proof
 */

interface VerifyProps {
  onVerified: (verifyRes: boolean) => void; // Puedes tipar verifyRes si conoces su estructura exacta
}

export const Verify = ({ onVerified }: VerifyProps) => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);

  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Device,
  );

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    setButtonState('pending');
    setWhichVerification(verificationLevel);
    const result = await MiniKit.commandsAsync.verify({
      action: 'verify-action', // Make sure to create this in the developer portal -> incognito actions
      verification_level: verificationLevel,
    });
    // Verify the proof
    const response = await fetch('/api/verify-proof', {
      method: 'POST',
      body: JSON.stringify({
        payload: result.finalPayload,
        action: 'verify-action',
      }),
    });

    const data = await response.json();
    if (data.verifyRes.success) {
      setButtonState('success');
      // Normally you'd do something here since the user is verified
      // Here we'll just do nothing
      onVerified(true); 
    } else {
      setButtonState('failed');
      onVerified(false); 
      // Reset the button state after 3 seconds
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">Verify</p>
      <LiveFeedback
        label={{
          failed: 'Failed to verify',
          pending: 'Verifying',
          success: 'Verified',
        }}
        state={
          whichVerification === VerificationLevel.Orb ? buttonState : undefined
        }
        className="w-full"
      >
        <Button
          onClick={() => onClickVerify(VerificationLevel.Orb)}
          disabled={buttonState === 'pending'}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Verify (Orb)
        </Button>
      </LiveFeedback>
    </div>
  );
};
