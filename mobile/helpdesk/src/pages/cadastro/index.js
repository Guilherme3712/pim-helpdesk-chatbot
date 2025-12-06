import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../../services/api.js';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleRegister() {
    setErro('');
    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      await api.post('/usuarios/cadastro', { nome, email, senha });
      navigation.navigate('Login');
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        e.response?.data?.message ||
        e.message ||
        'Erro ao cadastrar. Tente novamente.';
      setErro(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', padding: 24 }}>
      <View style={{ backgroundColor: 'white', padding: 28, borderRadius: 16, elevation: 3 }}>
        <Text style={{ fontSize: 26, fontWeight: '600', marginBottom: 6, color: '#0f172a' }}>
          Criar conta
        </Text>

        <Text style={{ fontSize: 14, color: '#475569', marginBottom: 26 }}>
          Preencha seus dados para criar sua conta de suporte.
        </Text>

        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: '#475569', marginBottom: 6 }}>Nome completo</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            placeholderTextColor="#94a3b8"
            style={{
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#cbd5e1',
              padding: 14,
              borderRadius: 10
            }}
          />
        </View>

        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: '#475569', marginBottom: 6 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            style={{
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#cbd5e1',
              padding: 14,
              borderRadius: 10
            }}
          />
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: '#475569', marginBottom: 6 }}>Senha</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Crie uma senha"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={{
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#cbd5e1',
              padding: 14,
              borderRadius: 10
            }}
          />
        </View>

        {erro ? (
          <Text style={{ color: '#dc2626', marginTop: 10 }}>
            {erro}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            paddingVertical: 14,
            borderRadius: 10,
            marginTop: 22,
            alignItems: 'center'
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Cadastrar
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
          <Text style={{ color: '#2563eb', textAlign: 'center', fontSize: 14 }}>
            Já tenho uma conta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
