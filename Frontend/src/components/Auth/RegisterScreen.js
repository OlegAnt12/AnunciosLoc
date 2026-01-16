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

export default function RegisterScreen({ isDarkMode, toggleTheme }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigation = useNavigation();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As passwords não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A password deve ter pelo menos 6 caracteres');
      return;
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    setLoading(true);

    try {
      const result = await register({ 
        username: email,  // Usar email como username
        email, 
        password
      });
      
      if (result.success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        // A navegação é automática através do AuthContext
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
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
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{ 
            backgroundColor: '#FF6B35', 
            width: 60, 
            height: 60, 
            borderRadius: 30, 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: 12,
          }}>
            <Icon name="account-plus" size={30} color="#FFF" />
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FF6B35', marginBottom: 4 }}>
            Criar Conta
          </Text>
          <Text style={{ fontSize: 14, color: '#636E72', textAlign: 'center' }}>
            Junte-se à nossa comunidade
          </Text>
        </View>

        {/* Register Form */}
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
            fontSize: 22, 
            fontWeight: 'bold', 
            color: '#2D3436', 
            marginBottom: 20, 
            textAlign: 'center' 
          }}>
            Registar Nova Conta
          </Text>
          
          {/* Name Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>
              Nome completo *
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name="account-outline" 
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
                placeholder="Digite o seu nome completo"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>
              Email *
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
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>
              Password *
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
                placeholder="Crie uma password"
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

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#2D3436', marginBottom: 8, fontWeight: '600' }}>
              Confirmar Password *
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name="lock-check-outline" 
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
                placeholder="Confirme a password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                style={{ position: 'absolute', right: 12 }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Icon 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#636E72" 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Register Button */}
          <TouchableOpacity
            style={{ 
              backgroundColor: loading ? '#FFA07A' : '#28A745', 
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
            onPress={handleRegister}
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
              {loading ? 'A registar...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>
          
          {/* Login Link */}
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <Text style={{ color: '#636E72', marginBottom: 8 }}>
              Já tem conta?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ padding: 8 }}
              disabled={loading}
            >
              <Text style={{ 
                color: '#FF6B35', 
                fontWeight: '600', 
                fontSize: 16,
                textDecorationLine: 'underline',
              }}>
                Iniciar Sessão
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={{ 
            backgroundColor: '#FFF', 
            padding: 16, 
            borderRadius: 12, 
            alignItems: 'center', 
            marginTop: 10,
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
        <View style={{ alignItems: 'center', marginTop: 20, padding: 16 }}>
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