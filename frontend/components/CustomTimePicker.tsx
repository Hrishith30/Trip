import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onChange: (event: any, date?: Date) => void;
  accentColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export default function CustomTimePicker({
  visible,
  value,
  onClose,
  onChange,
  accentColor,
  textColor,
  bgColor,
  borderColor,
}: Props) {
  if (!visible) return null;

  // On Android, DateTimePicker opens its own native dialog window.
  // Rendering an overlay wrapper causes touch conflicts, so we just return the picker itself.
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="time"
        is24Hour={false}
        display="default"
        onChange={onChange}
      />
    );
  }

  // On iOS, DateTimePicker renders inline, so we provide our absoluteFill bottom-sheet wrapper.
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={[styles.popup, { backgroundColor: bgColor, borderColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor }]}>Select Time</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}>
              <Text style={{ color: accentColor, fontWeight: '800', fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={onChange}
            textColor={textColor}
            style={{ width: '100%', height: 200 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '800' },
});
