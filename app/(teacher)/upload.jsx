import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Button from '../../src/components/common/Button';
import { CHILDREN } from '../../src/data/mockData';

const { width } = Dimensions.get('window');

// Mock uploaded photos (emoji tiles)
const UPLOADED = [
  { id: 'up1', emoji: '🎨', color: '#e1f5ee', date: '2:10 PM', tags: ['Emma', 'Liam'] },
  { id: 'up2', emoji: '🌳', color: '#dcfce7', date: '11:05 AM', tags: ['All'] },
  { id: 'up3', emoji: '😄', color: '#dbeafe', date: '9:30 AM', tags: ['Noah', 'Mia'] },
  { id: 'up4', emoji: '📚', color: '#fef3c7', date: '10:35 AM', tags: ['Emma'] },
];

export default function UploadScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [selectedChildren, setSelectedChildren] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(UPLOADED);

  const toggleChild = (id) => {
    setSelectedChildren(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access in settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      handleUpload(result.assets.length);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      handleUpload(1);
    }
  };

  const handleUpload = async (count) => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    const taggedNames = selectedChildren.length > 0
      ? selectedChildren.map(id => CHILDREN.find(c => c.id === id)?.firstName).filter(Boolean)
      : ['All'];
    const newPhoto = {
      id: String(Date.now()),
      emoji: ['🎨', '😄', '🌳', '📚', '🎵', '🧩'][Math.floor(Math.random() * 6)],
      color: ['#e1f5ee', '#dbeafe', '#ede9fe', '#fef3c7', '#fce7f3'][Math.floor(Math.random() * 5)],
      date: 'Just now',
      tags: taggedNames,
    };
    setUploaded(prev => [newPhoto, ...prev]);
    setSelectedChildren([]);
    setCaption('');
    Alert.alert('Success', `${count} photo${count > 1 ? 's' : ''} uploaded and shared with parents!`);
  };

  const presentChildren = CHILDREN.filter(c => c.status !== 'absent');
  const tileSize = (width - 32 - 8) / 3;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('uploadTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Upload buttons */}
        <View style={[styles.uploadCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📷 Add Photos</Text>
          <View style={styles.uploadBtns}>
            <TouchableOpacity
              onPress={takePhoto}
              style={[styles.uploadBtn, { backgroundColor: COLORS.primary }]}
            >
              <Ionicons name="camera" size={26} color="#fff" />
              <Text style={styles.uploadBtnLabel}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              style={[styles.uploadBtn, { backgroundColor: COLORS.teacher }]}
            >
              <Ionicons name="images" size={26} color="#fff" />
              <Text style={styles.uploadBtnLabel}>{t('choosePhoto')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tag children */}
        <View style={[styles.tagCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>👶 {t('selectChildren')}</Text>
          <View style={styles.childrenGrid}>
            {presentChildren.map(child => {
              const selected = selectedChildren.includes(child.id);
              return (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => toggleChild(child.id)}
                  style={[
                    styles.childChip,
                    {
                      backgroundColor: selected ? COLORS.primary + '20' : theme.cardAlt,
                      borderColor: selected ? COLORS.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{child.emoji}</Text>
                  <Text style={[styles.childChipName, { color: selected ? COLORS.primary : theme.textSecondary }]}>
                    {child.firstName}
                  </Text>
                  {selected && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.tagHint, { color: theme.textMuted }]}>
            {selectedChildren.length === 0 ? 'Leave empty to share with all' : `Tagged: ${selectedChildren.length} children`}
          </Text>
        </View>

        {/* Upload progress */}
        {uploading && (
          <View style={[styles.uploadingBox, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="cloud-upload" size={22} color={COLORS.primary} />
            <Text style={[styles.uploadingText, { color: COLORS.primaryDark }]}>{t('uploading')}</Text>
          </View>
        )}

        {/* Already uploaded today */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          ✅ Uploaded Today ({uploaded.length})
        </Text>
        <View style={styles.gallery}>
          {uploaded.map(photo => (
            <View
              key={photo.id}
              style={[styles.galleryTile, { backgroundColor: photo.color, width: tileSize, height: tileSize }]}
            >
              <Text style={{ fontSize: 30 }}>{photo.emoji}</Text>
              <View style={styles.tileFooter}>
                <Text style={styles.tileTime}>{photo.date}</Text>
              </View>
              <View style={styles.tileTags}>
                {photo.tags.slice(0, 2).map((tag, i) => (
                  <View key={i} style={styles.tileTag}>
                    <Text style={styles.tileTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
  tagCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 12 },
  uploadBtns: { flexDirection: 'row', gap: 12 },
  uploadBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 22, borderRadius: 16,
  },
  uploadBtnLabel: { color: '#fff', fontSize: 14, fontWeight: '800' },
  childrenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  childChipName: { fontSize: 12, fontWeight: '700' },
  tagHint: { fontSize: 11, fontWeight: '600', fontStyle: 'italic' },
  uploadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14, marginBottom: 16,
  },
  uploadingText: { fontSize: 14, fontWeight: '700' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 20 },
  galleryTile: {
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  tileFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', padding: 4,
  },
  tileTime: { color: '#fff', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  tileTags: {
    position: 'absolute', top: 4, left: 4, flexDirection: 'row', gap: 2, flexWrap: 'wrap',
  },
  tileTag: {
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6,
  },
  tileTagText: { color: '#fff', fontSize: 8, fontWeight: '700' },
});
