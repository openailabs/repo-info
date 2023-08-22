//@typescript-eslint/no-unsafe-assignment
//@typescript-eslint/no-unsafe-member-access
//@typescript-eslint/no-unsafe-call
//@typescript-eslint/no-unsafe-argument
'use client';

import { Button } from '@acme/ui/button';
import { useSession } from '@clerk/nextjs';
import { api } from '~/trpc/client';
import { useRouter } from 'next/navigation';

export function SubscribeNow(props: { planId: string }) {
    const router = useRouter();
    const session = useSession();

    return (
        <Button
            onClick={async () => {
                if (!session.isSignedIn) router.push('/signin');

                const billingPortal = await api.stripe.createSession.mutate({
                    planId: props.planId,
                });
                if (billingPortal.success)
                    window.location.href = billingPortal.url;
            }}
        >
            Subscribe now
        </Button>
    );
}
