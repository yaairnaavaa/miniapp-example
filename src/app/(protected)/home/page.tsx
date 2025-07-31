"use client";

import { useEffect, useState } from 'react';
import { Page } from '@/components/PageLayout';
import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { Guestbook } from '@/components/Guesbook';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import type { Session } from 'next-auth';


import abi from '@/abi/ContractAbi.json'
import { IDKitWidget, ISuccessResult, useIDKit } from '@worldcoin/idkit'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, type BaseError } from 'wagmi'
import { decodeAbiParameters, parseAbiParameters } from 'viem'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isVerify, setIsVerify] = useState<boolean>(false);

	const account = useAccount()
	const { setOpen } = useIDKit()
  const [done, setDone] = useState(false)
  const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
	const { isLoading: isConfirming, isSuccess: isConfirmed } = 
		useWaitForTransactionReceipt({
			hash,
		});

  const submitTx = async (proof: ISuccessResult) => {
		try {
			await writeContractAsync({
				address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
				account: account.address!,
				abi,
				functionName: 'verifyAndExecute',
				args: [
					account.address!,
					BigInt(proof!.merkle_root),
					BigInt(proof!.nullifier_hash),
					decodeAbiParameters(
						parseAbiParameters('uint256[8]'),
						proof!.proof as `0x${string}`
					)[0],
				],
			})
			setDone(true)
		} catch (error) {throw new Error((error as BaseError).shortMessage)}
	}

  useEffect(() => {
    const fetchAuth = async () => {
      const res = await import('@/auth').then((m) => m.auth());
      console.log(res);
      setSession(res);
    };
    fetchAuth();
  }, []);

  return (
		<div>
			{account.isConnected && (<>
				<IDKitWidget
					app_id={process.env.NEXT_PUBLIC_APP_ID as `app_${string}`}
					action={process.env.NEXT_PUBLIC_ACTION as string}
					signal={account.address}
					onSuccess={submitTx}
					autoClose
				/>

				{!done && <button onClick={() => setOpen(true)}>{!hash && (isPending ? "Pending, please check your wallet..." : "Verify and Execute Transaction")}</button>}

				{hash && <p>Transaction Hash: {hash}</p>}
				{isConfirming && <p>Waiting for confirmation...</p>} 
				{isConfirmed && <p>Transaction confirmed.</p>}
				{error && <p>Error: {(error as BaseError).message}</p>}
			</>)}
		</div>
	)

  // return (
  //   <>
  //     <Page.Header className="p-0">
  //       <TopBar
  //         title="Home"
  //         endAdornment={
  //           session?.user && (
  //             <div className="flex items-center gap-2">
  //               <p className="text-sm font-semibold capitalize">
  //                 {session.user.username}
  //               </p>
  //               <Marble src={session.user.profilePictureUrl} className="w-12" />
  //               <label>{JSON.stringify(session.user)}</label>
  //             </div>
  //           )
  //         }
  //       />
  //     </Page.Header>
  //     <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
  //       <UserInfo />
  //       <Verify onVerified={setIsVerify} />
  //       <Guestbook isVerify={isVerify} session={session} />
  //     </Page.Main>
  //   </>
  // );
}
