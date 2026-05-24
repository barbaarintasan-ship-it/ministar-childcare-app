import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS } from '../src/constants/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'parent') {
      router.replace('/(parent)');
    } else if (user.role === 'teacher') {
      router.replace('/(teacher)');
    } else if (user.role === 'admin') {
      router.replace('/(admin)');
    } else {
      router.replace('/login');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
