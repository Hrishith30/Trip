import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, useColorScheme, FlatList, TouchableOpacity, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform, Animated, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Search, Plus, MessageCircle, Sparkles, Send, X, ArrowLeft, Bot, Paperclip, Image as ImageIcon, FileText, Music as MusicIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  attachment?: {
    type: 'image' | 'pdf' | 'audio';
    uri: string;
    name: string;
  };
}

const CHATS = [
  { id: 'ai', name: 'Wayfarer AI', lastMsg: "How can I help with your trip?", time: 'Just now', unread: 0, isAI: true },
  { id: '1', name: 'Paris Trip Group', lastMsg: "Don't forget the museum tickets!", time: '10:30 AM', unread: 3, avatar: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=100&auto=format&fit=crop' },
  { id: '2', name: 'Alex Johnson', lastMsg: 'Sent a photo', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' },
  { id: '4', name: 'Sarah Miller', lastMsg: 'Are we still on for lunch?', time: '2:15 PM', unread: 1, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' },
];

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeChat, setActiveChat] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your Wayfarer AI. Ready to plan your next adventure?", sender: 'bot' }
  ]);
  const [attachment, setAttachment] = useState<any>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const handleSend = () => {
    if (inputText.trim() === '' && !attachment) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      text: inputText, 
      sender: 'user',
      attachment: attachment || undefined
    };

    setMessages([...messages, userMsg]);
    setInputText('');
    setAttachment(null);
    
    if (activeChat?.isAI) {
      setTimeout(() => {
        const botMsg: Message = { 
          id: (Date.now()+1).toString(), 
          text: attachment ? "Received your file! I'll process that right away." : "I've analyzed that for you! What else can I help with?", 
          sender: 'bot' 
        };
        setMessages(prev => [...prev, botMsg]);
      }, 1000);
    }
  };

  const pickImage = async () => {
    setShowAttachMenu(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAttachment({
        type: 'image',
        uri: result.assets[0].uri,
        name: 'Photo.jpg'
      });
    }
  };

  const pickDocument = async (type: 'application/pdf' | 'audio/*') => {
    setShowAttachMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: type,
    });

    if (!result.canceled) {
      setAttachment({
        type: type.includes('pdf') ? 'pdf' : 'audio',
        uri: result.assets[0].uri,
        name: result.assets[0].name
      });
    }
  };

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.chatItem, { borderBottomColor: colors.border }]}
      onPress={() => setActiveChat(item)}
    >
      {item.isAI ? (
        <View style={[styles.aiAvatar, { backgroundColor: colors.tint + '15' }]}>
          <Sparkles size={28} color={colors.tint} />
        </View>
      ) : (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      )}
      <View style={styles.chatMain}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: item.isAI ? colors.tint : colors.text, fontWeight: item.isAI ? '800' : '700' }]}>
            {item.name}
          </Text>
          <Text style={[styles.chatTime, { color: colors.tabIconDefault }]}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={[styles.chatMsg, { color: colors.tabIconDefault }]} numberOfLines={1}>
            {item.lastMsg}
          </Text>
          {item.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (activeChat) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.detailHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setActiveChat(null)} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            {activeChat.isAI ? (
               <View style={[styles.aiAvatarSmall, { backgroundColor: colors.tint + '15' }]}>
                <Sparkles size={16} color={colors.tint} />
              </View>
            ) : (
              <Image source={{ uri: activeChat.avatar }} style={styles.avatarSmall} />
            )}
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{activeChat.name}</Text>
              <Text style={[styles.headerStatus, { color: colors.secondary }]}>Online</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.chatContent}>
          {messages.map(m => (
            <View key={m.id} style={[styles.msgWrapper, m.sender === 'user' ? styles.userWrap : styles.botWrap]}>
              <View style={[styles.bubble, m.sender === 'user' ? [styles.userBubble, {backgroundColor: colors.tint}] : [styles.botBubble, {backgroundColor: colors.card, borderColor: colors.border}]]}>
                {m.attachment && (
                  <View style={styles.attachmentPreview}>
                    {m.attachment.type === 'image' ? (
                      <Image source={{ uri: m.attachment.uri }} style={styles.msgImage} />
                    ) : (
                      <View style={styles.fileRow}>
                        {m.attachment.type === 'pdf' ? <FileText size={20} color={m.sender === 'user' ? '#fff' : colors.tint} /> : <MusicIcon size={20} color={m.sender === 'user' ? '#fff' : colors.tint} />}
                        <Text style={[styles.fileName, { color: m.sender === 'user' ? '#fff' : colors.text }]} numberOfLines={1}>{m.attachment.name}</Text>
                      </View>
                    )}
                  </View>
                )}
                {m.text ? <Text style={[styles.msgText, { color: m.sender === 'user' ? '#fff' : colors.text }]}>{m.text}</Text> : null}
              </View>
            </View>
          ))}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
          {showAttachMenu && (
            <View style={[styles.attachMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.menuItem} onPress={pickImage}>
                <View style={[styles.menuIcon, { backgroundColor: '#3b82f620' }]}><ImageIcon size={20} color="#3b82f6" /></View>
                <Text style={[styles.menuText, { color: colors.text }]}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => pickDocument('application/pdf')}>
                <View style={[styles.menuIcon, { backgroundColor: '#ef444420' }]}><FileText size={20} color="#ef4444" /></View>
                <Text style={[styles.menuText, { color: colors.text }]}>PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => pickDocument('audio/*')}>
                <View style={[styles.menuIcon, { backgroundColor: '#10b98120' }]}><MusicIcon size={20} color="#10b981" /></View>
                <Text style={[styles.menuText, { color: colors.text }]}>Audio</Text>
              </TouchableOpacity>
            </View>
          )}

          {attachment && (
            <View style={[styles.currentAttach, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              <Text style={[styles.attachName, { color: colors.text }]} numberOfLines={1}>📎 {attachment.name}</Text>
              <TouchableOpacity onPress={() => setAttachment(null)}>
                <X size={18} color={colors.tabIconDefault} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAttachMenu(!showAttachMenu)}>
              <Plus size={24} color={colors.tabIconDefault} style={{ transform: [{ rotate: showAttachMenu ? '45deg' : '0deg' }] }} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.tabIconDefault}
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.tint }]} onPress={handleSend}>
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity style={[styles.plusBtn, { backgroundColor: colors.tint + '15' }]}>
          <Plus size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} stroke={colors.tabIconDefault} />
        <TextInput
          placeholder="Search chats..."
          placeholderTextColor={colors.tabIconDefault}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={CHATS}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  plusBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 10, marginBottom: 20, paddingHorizontal: 16, height: 50, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  chatItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 20 },
  aiAvatar: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chatMain: { flex: 1, marginLeft: 16 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 16 },
  chatTime: { fontSize: 12 },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMsg: { fontSize: 14, flex: 1, marginRight: 10 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 8, marginRight: 8 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarSmall: { width: 40, height: 40, borderRadius: 14 },
  aiAvatarSmall: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerStatus: { fontSize: 12, fontWeight: '600' },
  chatContent: { padding: 20, gap: 16 },
  msgWrapper: { flexDirection: 'row', width: '100%' },
  userWrap: { justifyContent: 'flex-end' },
  botWrap: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  msgText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  attachmentPreview: { marginBottom: 8, borderRadius: 12, overflow: 'hidden' },
  msgImage: { width: 200, height: 150, borderRadius: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  fileName: { fontSize: 14, fontWeight: '600', maxWidth: 150 },
  attachMenu: { position: 'absolute', bottom: 70, left: 16, right: 16, padding: 16, borderRadius: 20, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  menuItem: { alignItems: 'center', gap: 8 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 12, fontWeight: '600' },
  currentAttach: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  attachName: { fontSize: 13, fontWeight: '600', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, fontSize: 16, height: 44 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
