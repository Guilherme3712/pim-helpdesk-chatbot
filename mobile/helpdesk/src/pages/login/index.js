import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { AuthContext } from "../../context/AuthContext";

const PRIMARY = '#3f67f5';
const BG = '#f4f7fa';

export default function Login() {
  const nav = useNavigation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const { setLogged } = useContext(AuthContext);

  function decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(atob(normalized));
      return json;
    } catch (e) {
      return null;
    }
  }

  async function handleLogin() {
    setMsg(null);

    if (!email.trim() || !senha) {
      setMsg('Preencha email e senha.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/usuarios/login', {
        email: email.trim().toLowerCase(),
        senha,
      });

      const data = response.data;
      console.log('Login response data:', data);

      const token = data.access_token || data.token || data.jwt || null;
      let uid = null;

      // decodifica o jwt para extrair o user id
      const decoded = decodeJwt(token);
      if (decoded) {
        uid = decoded.sub || decoded.user_id || decoded.id_usuario || decoded.id;
      }

      // if (!uid && data.usuario) uid = data.usuario.id_usuario || data.usuario.id || null;

      if (token) await AsyncStorage.setItem('token', token);
      if (uid) await AsyncStorage.setItem('userId', String(uid));

      await AsyncStorage.setItem('userEmail', email.trim().toLowerCase());
      setLogged(true);
      nav.navigate('Chatbot')
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Erro ao fazer login. Tente novamente.';
      setMsg(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.heading}>Bem-vindo</Text>
          <Text style={styles.sub}>Entre com seu e-mail e senha para continuar.</Text>

          {msg && (
            <View style={[styles.alert, styles.alertError]}>
              <Text style={styles.alertText}>{msg}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9aa3b2"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="Sua senha"
              placeholderTextColor="#9aa3b2"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <View style={styles.signin}>
            <Text style={styles.small}>Não tem conta?</Text>
            <TouchableOpacity onPress={() => nav.navigate('Cadastro')}>
              <Text style={styles.signinLink}> Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>©2025 TechSupport IA.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 18, paddingTop: 28, paddingBottom: 36, flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxWidth: 760, alignSelf: 'center', width: '100%' },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sub: { color: '#6b7280', marginBottom: 12 },
  alert: { padding: 10, borderRadius: 8, marginBottom: 12 },
  alertError: { backgroundColor: '#fdecea' },
  alertText: { color: '#222' },
  field: { marginBottom: 12 },
  label: { color: '#6b7280', marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: '#f8fafc', borderRadius: 10, height: 48, paddingHorizontal: 12, fontSize: 15, borderWidth: 1, borderColor: '#e6eef8' },
  button: { backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700' },
  signin: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  small: { color: '#6b7280', fontSize: 13 },
  signinLink: { color: PRIMARY, fontWeight: '700' },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { color: '#9aa3b2', fontSize: 12 },
});
