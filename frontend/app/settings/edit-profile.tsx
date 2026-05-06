import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Camera, Sparkles } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState('Hrishith');
  const [bio, setBio] = useState('Passionate traveler exploring the hidden gems of the world.');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: 'Back',
          headerTransparent: true,
        }} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { borderColor: colors.tint }]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.tint }]}>
              <Camera size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.tabIconDefault }]}>Display Name</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.tabIconDefault }]}>Bio</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              placeholder="Tell us about your travels..."
            />
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.tint }]}>
          <Sparkles size={18} color="#fff" />
          <Text style={styles.saveBtnText}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { position: 'relative', padding: 4, borderWidth: 2, borderRadius: 64 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  cameraBtn: { position: 'absolute', bottom: 4, right: 4, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  form: { gap: 24 },
  field: { gap: 8 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  input: { height: 56, borderWidth: 1, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '600' },
  textArea: { height: 120, paddingTop: 16, textAlignVertical: 'top' },
  saveBtn: { marginTop: 40, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10, elevation: 8, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
