import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const Index = () => {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace('/Homepage/Homepage');
        }, 100);

    return () => clearTimeout(timeout);
    }, [router]);

    return null;
};

export default Index;