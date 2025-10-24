import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useSocket = (): {} => {

    const queryClient = useQueryClient();

    useEffect(() => {
        const handleNewNotification = (data: any) => {
            console.log('New notification:', data);
        }
    }, [queryClient]);


    return {};
};