'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthGuard = () => {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            router.push('/login');
            return;
        }

        const userInfo = localStorage.getItem('user');

        if (!userInfo) {
            localStorage.removeItem('access_token');
            router.push('/login');
            return;
        }

        try {
            const user = JSON.parse(userInfo);

            // ✅ Check role
            if (user.role !== 'staff') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                router.push('/login');
            }

        } catch (error) {
            // If parsing fails, clear storage and redirect
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            router.push('/login');
        }

    }, [router]);
};