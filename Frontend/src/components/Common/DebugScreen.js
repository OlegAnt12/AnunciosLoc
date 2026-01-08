import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { testConnection } from '../../services/api';

export default function DebugScreen() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runConnectionTest = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const result = await testConnection();
      setResults(result);
      
      if (result.success) {
        Alert.alert('✅ Conexão OK', 'Conectado ao backend com sucesso!');
      } else {
        Alert.alert('❌ Conexão Falhou', result.error);
      }
    } catch (error) {
      setResults({ success: false, error: error.message });
      Alert.alert('❌ Erro no Teste', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#F8F9FA' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Debug - Teste de Conexão
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: testing ? '#6C757D' : '#007BFF',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={runConnectionTest}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
            Testar Conexão com Backend
          </Text>
        )}
      </TouchableOpacity>

      {results && (
        <View style={{
          backgroundColor: results.success ? '#D4EDDA' : '#F8D7DA',
          padding: 16,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: results.success ? '#28A745' : '#DC3545',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: results.success ? '#155724' : '#721C24',
            marginBottom: 8,
          }}>
            {results.success ? '✅ Conexão Bem-sucedida' : '❌ Falha na Conexão'}
          </Text>
          
          {results.data && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: '600', color: '#155724' }}>Resposta do Backend:</Text>
              <Text style={{ color: '#155724' }}>
                Status: {results.data.status}
              </Text>
              <Text style={{ color: '#155724' }}>
                Ambiente: {results.data.environment}
              </Text>
              <Text style={{ color: '#155724' }}>
                Base de Dados: {results.data.database}
              </Text>
            </View>
          )}
          
          {results.error && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: '600', color: '#721C24' }}>Erro:</Text>
              <Text style={{ color: '#721C24' }}>{results.error}</Text>
            </View>
          )}
          
          {results.details && (
            <View>
              <Text style={{ fontWeight: '600', color: '#721C24' }}>Detalhes:</Text>
              <Text style={{ color: '#721C24' }}>{results.details}</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ marginTop: 20, padding: 16, backgroundColor: '#E9ECEF', borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Solução de Problemas:</Text>
        <Text style={{ marginBottom: 4 }}>1. Verifique se o backend está rodando</Text>
        <Text style={{ marginBottom: 4 }}>2. Confirme a URL no config/api.js</Text>
        <Text style={{ marginBottom: 4 }}>3. Android: use 10.0.2.2 para emulador</Text>
        <Text style={{ marginBottom: 4 }}>4. Verifique as permissões de rede no Android</Text>
        <Text>5. Confirme se a porta 3000 está livre</Text>
      </View>
    </ScrollView>
  );
}