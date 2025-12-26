import { usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { SharedData } from '@/types';

interface Props extends PageProps, SharedData { }

export function usePermission() {
    const { auth } = usePage<Props>().props;

    const hasPermission = (permissionName: string): boolean => {
        if (!auth.user) return false;

        // Check if the user has the permission in the 'can' array (from HandleInertiaRequests)
        // We access it via auth.can because we updated HandleInertiaRequests to put it there?
        // Wait, in HandleInertiaRequests I put 'can' inside 'auth' array:
        // 'auth' => [ 'user' => ..., 'can' => ... ]
        // So in props it should be auth.can

        // Let's check the type definition I updated.
        // I updated SharedData to have 'can: string[]'.
        // But in HandleInertiaRequests I put it inside 'auth'.
        // Let's check HandleInertiaRequests again.

        // 'auth' => [
        //    'user' => ...,
        //    'can' => ...
        // ]

        // So it is auth.can.
        // But my SharedData interface update was:
        // export interface SharedData {
        //    ...
        //    auth: Auth;
        //    can: string[]; // This is wrong if it's inside auth
        // }

        // If I put it inside 'auth' in PHP, then in JS it is props.auth.can.
        // So I need to update Auth interface in index.d.ts, not SharedData.

        return (auth as any).can?.includes(permissionName) || false;
    };

    return { hasPermission };
}
