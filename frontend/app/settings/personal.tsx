import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { ChevronLeft, User, Mail, Phone, MapPin } from 'lucide-react-native';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = React.useState('Hrishith');
  const [email, setEmail] = React.useState('hrishith@example.com');
  const [phone, setPhone] = React.useState('+1 (555) 000-0000');
  const [location, setLocation] = React.useState('New York, USA');

  const InfoField = ({ label, value, onChangeText, icon: Icon }: any) => (
    <View style={[styles.fieldContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.labelRow}>
        <Icon size={16} color={colors.tabIconDefault} />
        <Text style={[styles.label, { color: colors.tabIconDefault }]}>{label}</Text>
      </View>
      <TextInput 
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        editable={true}
      />
    </View>
  );

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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Personal Details</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Manage your account information</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoField label="Full Name" value={name} onChangeText={setName} icon={User} />
          <InfoField label="Email Address" value={email} onChangeText={setEmail} icon={Mail} />
          <InfoField label="Phone Number" value={phone} onChangeText={setPhone} icon={Phone} />
          <InfoField label="Location" value={location} onChangeText={setLocation} icon={MapPin} />
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.tint }]}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 4, fontWeight: '600' },
  card: { borderRadius: 24, padding: 20, borderWidth: 1, gap: 20 },
  fieldContainer: { paddingBottom: 16, borderBottomWidth: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  input: { fontSize: 16, fontWeight: '700', padding: 0 },
  saveBtn: { marginTop: 40, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
