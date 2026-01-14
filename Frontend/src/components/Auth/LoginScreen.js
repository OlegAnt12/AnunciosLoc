import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { testConnection } from '../../services/api';

export default function LoginScreen({ isDarkMode, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    
    try {
      // Primeiro testa a conexão
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        Alert.alert(
          'Problema de Conexão', 
          `Não foi possível conectar ao servidor.\n\n${connectionTest.error}\n\nVerifique se o servidor está rodando.`
        );
        return;
      }

      const result = await login({ username: email, password });
      if (result.success) {
        Alert.alert('Sucesso', `Bem-vindo de volta, ${result.data.username || result.data.name || 'utilizador'}!`);
      } else {
        Alert.alert('Erro', result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.log('❌ Erro detalhado no login:', error);
      
      let errorMessage = error.message || 'Credenciais inválidas';
      
      // Mensagens mais específicas
      if (error.message.includes('servidor')) {
        errorMessage = 'Servidor indisponível. Verifique se o backend está rodando.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tempo esgotado. O servidor está lento ou indisponível.';
      }
      
      Alert.alert('Erro no Login', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    
    // Pequeno delay para mostrar os campos preenchidos
    setTimeout(() => {
      Alert.alert(
        'Conta de Demo Carregada',
        `Email: ${demoUser.email}\nPassword: ${demoUser.password}\n\nClique em "Entrar" para continuar.`,
        [{ text: 'OK' }]
      );
    }, 300);
  };

  const testServerConnection = async () => {
    setLoading(true);
    try {
      const result = await testConnection();
      if (result.success) {
        Alert.alert('✅ Conexão OK', `Conectado com sucesso ao servidor!\n\nURL: ${result.url}`);
      } else {
        Alert.alert('❌ Problema de Conexão', result.error);
      }
    } catch (error) {
      Alert.alert('❌ Erro', 'Falha ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F8F9FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 16, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ 
            backgroundColor: '#FF6B35', 
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Icon name="message-alert" size={40} color="#FFF" />
          </View>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FF6B35', marginBottom: 8 }}>
            AnunciosLoc
          </Text>
          <Text style={{ fontSize: 16, color: '#636E72', textAlign: 'center', lineHeight: 22 }}>
            Sistema de anúncios baseado em localização
          </Text>
        </View>

        {/* Login Form */}
        <View style={{ 
          backgroundColor: '#FFF', 
          borderRadius: 16, 
          padding: 20, 
          marginBottom: 20, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#2D3436', 
            marginBottom: 20, 
            textAlign: 'center' 
          }}>
            Iniciar Sessão
          </Text>
          
          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>
              Email
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name="email-outline" 
                size={20} 
                color="#636E72" 
                style={{ position: 'absolute', left: 12, zIndex: 1 }} 
              />
              <TextInput
                style={{ 
                  borderWidth: 1, 
                  borderColor: '#DFE6E9', 
                  borderRadius: 8, 
                  padding: 12,
                  paddingLeft: 40,
                  fontSize: 16, 
                  backgroundColor: '#FFF',
                  flex: 1,
                  color: '#2D3436',
                }}
                placeholder="Digite o seu email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>
          
          {/* Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>
              Palavra-passe
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name="lock-outline" 
                size={20} 
                color="#636E72" 
                style={{ position: 'absolute', left: 12, zIndex: 1 }} 
              />
              <TextInput
                style={{ 
                  borderWidth: 1, 
                  borderColor: '#DFE6E9', 
                  borderRadius: 8, 
                  padding: 12,
                  paddingLeft: 40,
                  paddingRight: 40,
                  fontSize: 16, 
                  backgroundColor: '#FFF',
                  flex: 1,
                  color: '#2D3436',
                }}
                placeholder="Digite a sua palavra-passe"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={{ position: 'absolute', right: 12 }}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Icon 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#636E72" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Login Button */}
          <TouchableOpacity
            style={{ 
              backgroundColor: loading ? '#FFA07A' : '#FF6B35', 
              padding: 16, 
              borderRadius: 8, 
              alignItems: 'center', 
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading && (
              <Icon 
                name="loading" 
                size={20} 
                color="#FFF" 
                style={{ marginRight: 8 }} 
              />
            )}
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              {loading ? 'A processar...' : 'Entrar'}
            </Text>
          </TouchableOpacity>
          
          {/* Register Link */}
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <Text style={{ color: '#636E72', marginBottom: 8 }}>
              Não tem conta?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={{ padding: 8 }}
              disabled={loading}
            >
              <Text style={{ 
                color: '#FF6B35', 
                fontWeight: '600', 
                fontSize: 16,
                textDecorationLine: 'underline',
              }}>
                Criar uma conta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Accounts Section */}
        <View style={{ 
          backgroundColor: '#FFF', 
          borderRadius: 16, 
          padding: 20, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: '#2D3436', 
            marginBottom: 12, 
            textAlign: 'center' 
          }}>
            Contas de Teste
          </Text>
          
          <Text style={{ 
            color: '#636E72', 
            fontSize: 14, 
            marginBottom: 16, 
            textAlign: 'center',
            lineHeight: 20,
          }}>
            Use estes dados para testar a aplicação
          </Text>
          
          {/* Conta de Teste 1 */}
          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 16, 
              backgroundColor: '#F8F9FA', 
              borderRadius: 12, 
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#E9ECEF',
            }}
            onPress={() => handleDemoLogin({ 
              email: 'teste1@example.com', 
              password: '123456' 
            })}
            disabled={loading}
          >
            <View style={{ 
              backgroundColor: '#FF6B35', 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginRight: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>T1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#2D3436', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                Utilizador Teste 1
              </Text>
              <Text style={{ color: '#636E72', fontSize: 14 }}>
                Email: <Text style={{ fontWeight: '600' }}>teste1@example.com</Text>
              </Text>
              <Text style={{ color: '#636E72', fontSize: 14 }}>
                Password: <Text style={{ fontWeight: '600' }}>123456</Text>
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#636E72" />
          </TouchableOpacity>
          
          {/* Conta de Teste 2 */}
          <TouchableOpacity
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              padding: 16, 
              backgroundColor: '#F8F9FA', 
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E9ECEF',
            }}
            onPress={() => handleDemoLogin({ 
              email: 'teste2@example.com', 
              password: '123456' 
            })}
            disabled={loading}
          >
            <View style={{ 
              backgroundColor: '#FF6B35', 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginRight: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>T2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#2D3436', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                Utilizador Teste 2
              </Text>
              <Text style={{ color: '#636E72', fontSize: 14 }}>
                Email: <Text style={{ fontWeight: '600' }}>teste2@example.com</Text>
              </Text>
              <Text style={{ color: '#636E72', fontSize: 14 }}>
                Password: <Text style={{ fontWeight: '600' }}>123456</Text>
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#636E72" />
          </TouchableOpacity>
        </View>

        {/* Connection Test Button */}
        <TouchableOpacity
          style={{ 
            backgroundColor: '#6C757D', 
            padding: 12, 
            borderRadius: 8, 
            alignItems: 'center', 
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={testServerConnection}
          disabled={loading}
        >
          <Icon 
            name="wifi" 
            size={18} 
            color="#FFF" 
            style={{ marginRight: 8 }} 
          />
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
            Testar Conexão com Servidor
          </Text>
        </TouchableOpacity>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={{ 
            backgroundColor: '#FFF', 
            padding: 16, 
            borderRadius: 12, 
            alignItems: 'center', 
            marginTop: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={toggleTheme}
          disabled={loading}
        >
          <Icon 
            name={isDarkMode ? "weather-sunny" : "weather-night"} 
            size={20} 
            color="#FF6B35" 
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#FF6B35', fontWeight: '600', fontSize: 16 }}>
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </Text>
        </TouchableOpacity>

        {/* App Info Footer */}
        <View style={{ alignItems: 'center', marginTop: 30, padding: 16 }}>
          <Text style={{ color: '#636E72', fontSize: 12, textAlign: 'center', marginBottom: 4 }}>
            © 2024 AnunciosLoc • Versão 1.0.0
          </Text>
          <Text style={{ color: '#636E72', fontSize: 11, textAlign: 'center' }}>
            Sistema de mensagens baseado em localização
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}