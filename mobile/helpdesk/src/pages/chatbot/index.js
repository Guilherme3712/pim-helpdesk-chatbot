import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import api from '../../services/api';
import { AuthContext } from "../../context/AuthContext";

const PRIMARY = '#3f67f5';
const BG = '#f4f7fa';

export default function Chatbot() {
  const scrollRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const [messages, setMessages] = useState([{ sender: 'ia', text: 'Olá! 👋 Descreva seu problema para que eu possa ajudar.' }]);
  const [input, setInput] = useState('');
  const [chamadoId, setChamadoId] = useState(null);
  const [status, setStatus] = useState('Nenhum chamado');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const { setLogged } = useContext(AuthContext);

useEffect(() => {
  async function boot() {
    const uid = await AsyncStorage.getItem('userId');
    const tk = await AsyncStorage.getItem('token');

    if (tk) api.defaults.headers.common.Authorization = `Bearer ${tk}`;

    if (uid) {
      setUserId(Number(uid));
    } else {
      console.log("Erro: userId não existe no AsyncStorage");
    }
  }
  boot();
}, []);


  useEffect(() => {
    if (!userId) return;
    findOpenChamado();
  }, [userId]);

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  function scrollToEnd() {
    if (!scrollRef.current) return;
    setTimeout(() => {
      try {
        scrollRef.current.scrollToEnd({ animated: true });
      } catch {}
    }, 50);
  }

  function mapStatusLabel(s) {
    if (!s) return 'Nenhum chamado';
    const val = String(s).toLowerCase();
    if (val === 'aberto') return 'Em aberto';
    if (val === 'em_andamento' || val === 'em-andamento') return 'Em andamento';
    if (val === 'fechado') return 'Fechado';
    return s;
  }

  async function findOpenChamado() {
    setLoading(true);
    try {
      const res = await api.get(`/chamados/usuario/${userId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      const open = list.find((c) => String(c.status).toLowerCase() !== 'fechado');
      if (open) {
        const id = open.id_chamado || open.id || null;
        setChamadoId(id);
        setStatus(mapStatusLabel(open.status));
        await carregarHistorico(id);
        return;
      }
      setStatus('Nenhum chamado');
      setMessages([{ sender: 'ia', text: 'Olá! 👋 Descreva seu problema para que eu possa ajudar.' }]);
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        e.message ||
        'Erro interno!.';
      // setMessages((m) => [...m, { sender: 'ia', text: `Erro ao verificar chamados: ${String(msg)}` }]);
      setStatus('Nenhum chamado');
    } finally {
      setLoading(false);
    }
  }

  async function carregarHistorico(id) {
    if (!id || !userId) return;
    setBusy(true);
    try {
      const res = await api.get(`/historico/${userId}/${id}`);
      const historico = (res.data?.historico || []).map((h) => ({
        sender: h.remetente === 'usuario' ? 'usuario' : 'ia',
        text: h.mensagem,
      }));
      if (historico.length) {
        setMessages(historico);
      } else {
        setMessages([{ sender: 'ia', text: 'Iniciando atendimento...' }]);
      }
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        e.message ||
        'Erro interno!.';
      setMessages((m) => [...m, { sender: 'ia', text: `Erro ao carregar histórico: ${String(msg)}` }]);
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    console.log("userId:", userId);

    const text = input.trim();
    if (!text) return;
    if (status === 'Fechado') {
      setMessages((m) => [...m, { sender: 'ia', text: '⚠️ Este chamado está encerrado. Abra um novo chamado para continuar.' }]);
      return;
    }

    setMessages((m) => [...m, { sender: 'usuario', text }]);
    setInput('');
    setBusy(true);

    try {
      const payload = { id_usuario: userId, mensagem: text };
      if (chamadoId) payload.id_chamado = chamadoId;
      const res = await api.post('/chat', payload);
      const data = res.data || {};
      if (data.chamado && (data.chamado.id_chamado || data.chamado.id)) {
        const returned = data.chamado.id_chamado || data.chamado.id;
        setChamadoId(returned);
        setStatus(mapStatusLabel(data.chamado.status ?? 'aberto'));
      }
      const resposta = data.mensagem_ia || data.mensagem || 'Resposta vazia do servidor.';
      setMessages((m) => [...m, { sender: 'ia', text: resposta }]);
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        e.message ||
        'Erro interno!.';
      setMessages((m) => [...m, { sender: 'ia', text: `Erro ao enviar/receber: ${String(msg)}` }]);
    } finally {
      setBusy(false);
    }
  }

  async function handleCloseTicket() {
    if (!chamadoId) return Alert.alert('Aviso', 'Nenhum chamado aberto para encerrar.');
    Alert.alert('Encerrar chamado', 'Deseja realmente encerrar este chamado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Encerrar',
        onPress: async () => {
          setBusy(true);
          try {
            const res = await api.put(`/chamados/${chamadoId}/fechar/usuario/${userId}`);
            setStatus('Fechado');
            const msg = res.data?.mensagem || 'Chamado encerrado com sucesso.';
            setMessages((m) => [...m, { sender: 'ia', text: msg }]);
          } catch (err) {
            setMessages((m) => [...m, { sender: 'ia', text: `Erro ao encerrar: ${String(err?.response?.data || err?.message || err)}` }]);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

async function handleLogout() {
  await AsyncStorage.multiRemove(['token', 'userId', 'userEmail']);
  api.defaults.headers.common.Authorization = undefined;
  setLogged(false);
}

  const isClosed = status === 'Fechado';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">💬 Chatbot de Suporte</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              Status: <Text style={{ fontWeight: '700' }}>{status}</Text>{' '}
              {chamadoId ? <Text>#{chamadoId}</Text> : status !== 'Fechado' ? <Text style={{ color: '#d97706' }}>(novo chamado será criado ao enviar)</Text> : null}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {!isClosed && (
              <TouchableOpacity onPress={handleCloseTicket} style={[styles.headerBtn]}>
                <Text style={[styles.headerBtnText, { color: '#ef4444' }]}>Encerrar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleLogout} style={[styles.headerBtn, { marginLeft: 8 }]}>
              <Text style={[styles.headerBtnText, { color: PRIMARY }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.chatContainer}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
          {loading || busy ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubbleWrap, m.sender === 'usuario' ? styles.bubbleRight : styles.bubbleLeft]}>
              <View style={[styles.bubble, m.sender === 'usuario' ? styles.bubblePrimary : styles.bubbleWhite]}>
                <Markdown>{m.text}</Markdown>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={isClosed ? 'Chamado encerrado — volte para o painel.' : 'Digite sua mensagem...'}
            placeholderTextColor="#9aa3b2"
            editable={!isClosed && !busy}
            style={styles.input}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend} disabled={isClosed || busy} style={[styles.sendBtn, (isClosed || busy) && { opacity: 0.6 }]}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerSafe: { backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: { flex: 1, marginRight: 8, flexShrink: 1 },
  title: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  subtitle: { color: '#6b7280', marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eef8' },
  headerBtnText: { color: PRIMARY, fontWeight: '700' },
  chatContainer: { flex: 1, padding: 12 },
  messages: { paddingBottom: 16 },
  bubbleWrap: { marginBottom: 10, flexDirection: 'row' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  bubblePrimary: { backgroundColor: PRIMARY, color: '#fff' },
  bubbleWhite: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6eef8' },
  bubbleRight: { justifyContent: 'flex-end' },
  bubbleLeft: { justifyContent: 'flex-start' },
  footer: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, height: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e6eef8' },
  sendBtn: { backgroundColor: PRIMARY, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  sendText: { color: '#fff', fontWeight: '700' },
});
