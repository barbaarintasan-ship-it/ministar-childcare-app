import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 32 - 8) / 3;

// Photo placeholders (colored tiles with emojis)
const PHOTO_SECTIONS = [
  {
    date: 'Today — May 24',
    photos: [
      { emoji: '🎨', color: '#e1f5ee' },
      { emoji: '😄', color: '#dbeafe' },
      { emoji: '🌳', color: '#dcfce7' },
      { emoji: '🍽', color: '#fef3c7' },
      { emoji: '🧩', color: '#ede9fe' },
      { emoji: '📚', color: '#ffedd5' },
    ],
  },
  {
    date: 'Yesterday — May 23',
    photos: [
      { emoji: '🎵', color: '#fce7f3' },
      { emoji: '🏃', color: '#dbeafe' },
      { emoji: '🌻', color: '#fef3c7' },
      { emoji: '✂️', color: '#e1f5ee' },
    ],
  },
  {
    date: 'May 22',
    photos: [
      { emoji: '🐛', color: '#dcfce7' },
      { emoji: '🖌️', color: '#ede9fe' },
      { emoji: '🥗', color: '#fef3c7' },
    ],
  },
];

export default function PhotosScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const totalPhotos = PHOTO_SECTIONS.reduce((sum, s) => sum + s.photos.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header
        title={t('photosTitle')}
        rightComponent={
          <TouchableOpacity
            onPress={() => Alert.alert('Download', 'Downloading all photos...')}
            style={styles.downloadBtn}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* Today's count banner */}
        <View style={[styles.countBanner, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '44' }]}>
          <Ionicons name="images" size={20} color={COLORS.primary} />
          <Text style={[styles.countText, { color: COLORS.primaryDark }]}>
            {PHOTO_SECTIONS[0].photos.length} {t('newPhotos')} 🌟
          </Text>
          <TouchableOpacity style={[styles.shareAllBtn, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="share-outline" size={14} color="#fff" />
            <Text style={styles.shareAllText}>Share</Text>
          </TouchableOpacity>
        </View>

        {PHOTO_SECTIONS.map((section, si) => (
          <View key={si} style={{ marginBottom: 20 }}>
            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
              {si === 0 ? '📅 ' : ''}{section.date}
            </Text>
            <View style={styles.grid}>
              {section.photos.map((photo, pi) => (
                <TouchableOpacity
                  key={pi}
                  onPress={() => Alert.alert('Photo', 'Photo viewer coming soon!')}
                  style={[
                    styles.photoTile,
                    {
                      backgroundColor: photo.color,
                      width: PHOTO_SIZE,
                      height: PHOTO_SIZE,
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.photoEmoji}>{photo.emoji}</Text>
                  {pi === 0 && si === 0 && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                  <View style={styles.photoOverlay}>
                    <Ionicons name="expand-outline" size={14} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Total count */}
        <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
          <Ionicons name="camera" size={16} color={theme.textMuted} />
          <Text style={[styles.totalText, { color: theme.textMuted }]}>
            {totalPhotos} photos total this week
          </Text>
        </View>

        {/* Request more photos */}
        <TouchableOpacity
          style={[styles.requestBtn, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '44' }]}
          onPress={() => Alert.alert('Request', 'Photo request sent to teacher!')}
        >
          <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.requestText, { color: COLORS.primaryDark }]}>
            Request more photos from teacher
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  countBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14, marginBottom: 16, borderWidth: 1,
  },
  countText: { flex: 1, fontSize: 13, fontWeight: '700' },
  shareAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  shareAllText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dateLabel: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  photoTile: {
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  photoEmoji: { fontSize: 36 },
  newBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  photoOverlay: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 3,
  },
  totalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 16, borderTopWidth: 1, marginBottom: 16,
  },
  totalText: { fontSize: 12, fontWeight: '600' },
  requestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  requestText: { flex: 1, fontSize: 13, fontWeight: '700' },
  downloadBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
});
