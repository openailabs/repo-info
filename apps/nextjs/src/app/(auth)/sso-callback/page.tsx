'use client';

import * as Icons from '@acme/ui/icons';
import { useClerk } from '@clerk/nextjs';
import type { HandleOAuthCallbackParams } from '@clerk/types';
import { useEffect } from 'react';

// export const runtime = "edge";

export default function SSOCallback(props: {
    searchParams: HandleOAuthCallbackParams;
}) {
    const { handleRedirectCallback } = useClerk();

    useEffect(() => {
        void handleRedirectCallback(props.searchParams);
    }, [props.searchParams, handleRedirectCallback]);

    return (
        <div className="flex items-center justify-center">
            <Icons.Spinner className="mr-2 h-16 w-16 animate-spin" />
        </div>
    );
}
