import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Props {
  visible: boolean;
  value: Date;
  title?: string;
  minimumDate?: Date | null;
  maximumDate?: Date | null;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  // Color tokens
  accentColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  mutedColor: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CustomDatePicker({
  visible,
  value,
  title = 'Select Date',
  minimumDate,
  maximumDate,
  onClose,
  onConfirm,
  accentColor,
  textColor,
  bgColor,
  borderColor,
  mutedColor,
}: Props) {
  const [selected, setSelected] = useState<Date>(value || new Date());
  const [viewYear, setViewYear] = useState((value || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState((value || new Date()).getMonth());

  // Sync internal state when value or visibility changes
  useEffect(() => {
    if (visible && value) {
      setSelected(value);
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [visible, value]);

  const minDay = minimumDate ? startOfDay(minimumDate) : null;
  const maxDay = maximumDate ? startOfDay(maximumDate) : null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    setSelected(date);
  };

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Card — stops touch propagation so tapping inside doesn't close */}
        <TouchableOpacity activeOpacity={1} style={[styles.popup, { backgroundColor: bgColor, borderColor }]}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <TouchableOpacity onPress={() => onConfirm(selected)} hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}>
              <Text style={{ color: accentColor, fontWeight: '800', fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronLeft size={20} color={accentColor} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: textColor }]}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronRight size={20} color={accentColor} />
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View style={styles.weekRow}>
            {DAYS.map(d => (
              <Text key={d} style={[styles.dayLabel, { color: mutedColor }]}>{d}</Text>
            ))}
          </View>

          {/* Day Grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={`e-${i}`} style={styles.cell} />;

              const cellDate = startOfDay(new Date(viewYear, viewMonth, day));
              const isSelected = sameDay(cellDate, selected);
              const isDisabled =
                (minDay !== null && cellDate < minDay) ||
                (maxDay !== null && cellDate > maxDay);
              const isToday = sameDay(cellDate, new Date());

              return (
                <TouchableOpacity
                  key={`d-${day}`}
                  style={styles.cell}
                  onPress={() => !isDisabled && handleDay(day)}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayInner,
                    isSelected && { backgroundColor: accentColor },
                    !isSelected && isToday && { borderWidth: 1.5, borderColor: accentColor },
                  ]}>
                    <Text style={[
                      styles.dayNum,
                      { color: isSelected ? '#fff' : isDisabled ? borderColor : textColor },
                      isToday && !isSelected && { color: accentColor, fontWeight: '800' },
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navBtn: { padding: 4 },
  monthLabel: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  weekRow: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 4 },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingVertical: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNum: { fontSize: 15, fontWeight: '600' },
});
