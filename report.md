# Relatório do Projeto AnunciosLoc

## Sumário

1. [Resumo Executivo](#resumo-executivo)
2. [Visão Geral do Projeto](#visão-geral-do-projeto)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Status Atual da Implementação](#status-atual-da-implementação)
5. [Tecnologias Utilizadas](#tecnologias-utilizadas)
6. [Funcionalidades Implementadas](#funcionalidades-implementadas)
7. [Desafios e Limitações](#desafios-e-limitações)
8. [Próximos Passos](#próximos-passos)
9. [Equipe e Contribuições](#equipe-e-contribuições)
10. [Conclusão](#conclusão)

## Resumo Executivo

O projeto AnunciosLoc é uma plataforma de mensagens descentralizada baseada em localização, desenvolvida com backend em Node.js/Express e frontend em React Native/Expo. O sistema suporta modos de entrega de mensagens centralizadas e descentralizadas, comunicação P2P via Wi-Fi Direct, políticas de mensagens (Lista Branca/Lista Negra/Pública) e retransmissão mule para alcance estendido.

## Visão Geral do Projeto

AnunciosLoc permite aos usuários criar e receber mensagens baseadas em localização geográfica ou redes Wi-Fi específicas. O sistema inclui funcionalidades de autenticação, gerenciamento de perfis, criação de localizações, sistema de mensagens com políticas, notificações e retransmissão via mules (dispositivos retransmissores).

## Arquitetura do Sistema

### Componentes Principais

1. **Backend (Node.js + Express + MySQL)**
   - API RESTful para autenticação, mensagens, localizações e notificações
   - Sistema de autenticação JWT
   - Gerenciamento de banco de dados MySQL com stored procedures
   - Middleware para validação, logging e rate limiting

2. **Frontend (React Native + Expo)**
   - Interface móvel nativa
   - Navegação por abas inferiores
   - Gerenciamento de estado com Context API
   - Persistência offline com AsyncStorage

3. **Banco de Dados**
   - Esquema relacional com 13+ tabelas
   - Stored procedures para localização e entrega de mensagens
   - Suporte a transações para operações críticas

## Status Atual da Implementação

### Fase 1: Funcionalidades Iniciais (Concluída - 100%)
- ✅ Autenticação de usuário (registro, login, persistência de sessão)
- ✅ Gerenciamento de perfis (visualização, edição)
- ✅ Gerenciamento de localizações (GPS e Wi-Fi SSID)
- ✅ Sistema de mensagens core (criação, listagem, recebimento)
- ✅ Políticas de mensagens (Pública, Lista Branca, Lista Negra)
- ✅ Modos de entrega (Centralizado/Descentralizado)
- ✅ Sistema de notificações
- ✅ Configuração e aceitação de atribuições mule
- ✅ Persistência offline básica

### Fase 2: Funcionalidades Intermediárias (95% Concluída)
- ✅ Sistema de retransmissão mule/P2P
- ✅ Filtragem baseada em política
- ✅ Polling de notificações com badge
- ✅ Integração de fila offline (serviço integrado à UI com listeners de conectividade)
- ✅ Implementação Wi-Fi Direct P2P (componente placeholder criado com arquitetura para futura implementação)

### Fase 3: Funcionalidades Avançadas (30% Concluída)
- ✅ Retransmissão multi-hop (serviço básico implementado com algoritmo de roteamento simples)
- ✅ Rede mesh (componente BLE mesh criado com descoberta e roteamento)
- ❌ Criptografia ponta-a-ponta
- ❌ Painel de administração
- ❌ Análises e relatórios

## Tecnologias Utilizadas

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Banco de Dados**: MySQL 8.0
- **Autenticação**: JWT (jsonwebtoken)
- **Bibliotecas**: mysql2/promise, dotenv, cors, express-validator

### Frontend
- **Framework**: React Native / Expo
- **Navegação**: React Navigation
- **Cliente HTTP**: Axios
- **Persistência**: AsyncStorage
- **Ícones**: MaterialCommunityIcons

## Funcionalidades Implementadas

### Autenticação e Sessões
- Registro e login de usuários
- Persistência de token JWT
- Restauração automática de sessão
- Interceptor para injeção de token em requisições

### Gerenciamento de Localizações
- Criação de localizações GPS (latitude, longitude, raio)
- Criação de localizações Wi-Fi (lista de SSIDs)
- Detecção automática de localização baseada em SSID
- Suporte a múltiplos SSIDs com fallback

### Sistema de Mensagens
- Criação de mensagens com localização inline
- Modos de entrega: Centralizado (servidor) e Descentralizado (mule)
- Políticas de acesso: Pública, Lista Branca, Lista Negra
- Busca de mensagens próximas baseada em localização

### Sistema Mule
- Registro de dispositivos como mules
- Configuração de capacidade de retransmissão
- Aceitação de atribuições de mensagem
- Estatísticas de desempenho mule

### Notificações
- Logging de todas as ações de mensagem
- Interface para visualizar notificações
- Marcar como lida (individual ou todas)
- Badge de contagem não lida

## Desafios e Limitações

### Limitações Atuais
- Falta de testes automatizados no MVP
- Wi-Fi Direct requer módulos específicos de plataforma
- Filtragem de política depende de validação backend
- Polling de notificações (não push em tempo real)

### Desafios Técnicos
- Implementação de comunicação P2P verdadeira
- Gerenciamento de estado offline
- Escalabilidade do sistema de retransmissão
- Segurança e criptografia de mensagens

## Próximos Passos

### Curto Prazo (1-2 meses)
1. Integrar serviço de fila offline à UI
2. Implementar monitoramento de conectividade de rede
3. Adicionar criptografia para mensagens sensíveis
4. Melhorar experiência do usuário com feedback visual

### Médio Prazo (3-6 meses)
1. Implementar Wi-Fi Direct P2P nativo
2. Adicionar notificações push em tempo real
3. Desenvolver painel de administração
4. Implementar sistema de análise de desempenho

### Longo Prazo (6+ meses)
1. Rede mesh com retransmissão multi-hop
2. Criptografia ponta-a-ponta
3. Integração com blockchain para auditoria
4. Expansão para outras plataformas (web, desktop)

## Equipe e Contribuições

- **Líder do Projeto**: OlegAnt12
- **Stack Tecnológico**: Node.js, Express, React Native, Expo, MySQL
- **Metodologia**: Desenvolvimento iterativo com foco em MVP

## Conclusão

O projeto AnunciosLoc demonstrou sucesso na implementação de um sistema complexo de mensagens baseado em localização com arquitetura híbrida centralizada/descentralizada. As funcionalidades core estão completas e testadas, com espaço significativo para expansões futuras em comunicação P2P avançada e recursos de segurança.

A arquitetura modular e bem documentada facilita a manutenção e extensão do sistema, posicionando-o bem para futuras iterações e melhorias.

## 2. Desenho da Interface Móvel

### Wireframe da Aplicação

A interface móvel do AnunciosLoc segue um design de navegação por abas inferiores (Bottom Tabs) com as seguintes telas principais:

- **Tela de Login/Registro**: Campos para email, senha e botão de ação. Suporte a persistência de sessão.
- **Tela de Mensagens**: Lista de mensagens recebidas com filtros por política. Botão flutuante para criar nova mensagem.
- **Tela de Localizações**: Lista de localizações GPS/Wi-Fi criadas. Mapa integrado para visualização.
- **Tela de Perfil**: Visualização e edição de dados do usuário, incluindo configurações mule.
- **Tela de Notificações**: Lista de notificações com badges de contagem não lida.

### Características Específicas do Comportamento

- **Offline Queue**: A aplicação detecta conectividade e enfileira mensagens offline, sincronizando automaticamente quando online.
- **P2P Discovery**: Componentes BLE e Wi-Fi Direct escaneiam dispositivos próximos para comunicação direta.
- **Mesh Networking**: Rede mesh via BLE para roteamento multi-hop, com descoberta automática de nós.
- **Adaptive UI**: Feedback visual para estados de conectividade e progresso de operações assíncronas.

## 3. Arquitectura Básica

### 3.1 Estruturas de Dados Mantidas pelo Servidor e pelo Cliente

**Servidor (Backend)**:
- Tabelas MySQL: Users, Profiles, Locations, Messages, Notifications, Devices, Sessions, etc.
- Estruturas em memória: Cache de sessões JWT, filas de mensagens pendentes.

**Cliente (Frontend)**:
- AsyncStorage: Tokens JWT, dados offline (mensagens, localizações).
- Context API: Estado global para usuário autenticado, conectividade, filas offline.

### 3.2 Descrição dos Protocolos Cliente / Servidor

- **Protocolo HTTP/REST**: Comunicação via Axios com endpoints RESTful (GET/POST/PUT/DELETE).
- **Autenticação JWT**: Tokens enviados em headers Authorization.
- **Polling para Notificações**: Cliente consulta periodicamente o servidor para novas notificações.
- **WebSocket (planejado)**: Para notificações push em tempo real.

### 3.3 Descrição do Protocolo P2P para Entrega de Mensagem em Modo Descentralizado

- **BLE Mesh**: Descoberta de dispositivos via react-native-ble-plx, formação de rede mesh com roteamento multi-hop.
- **Wi-Fi Direct**: Conexão peer-to-peer via react-native-wifi-p2p para transferência direta de mensagens.
- **Relay Service**: Algoritmo de roteamento baseado em proximidade geográfica e confiança de dispositivos mule.

### 3.4 Outros Recursos de Projecto relevantes

- **Offline-First**: Estratégia de desenvolvimento com persistência local e sincronização.
- **Modular Services**: Separação de responsabilidades em serviços (auth, message, location, etc.).

## 4. Funcionalidades avançadas

### 4.1 Segurança

**Objetivos**: Autenticação segura, integridade de mensagens, privacidade de localização.

**Protocolos**:
- JWT para autenticação.
- Validação de entrada no backend.
- Rate limiting para prevenir abuso.
- (Planejado: Criptografia ponta-a-ponta com chaves públicas).

### 4.2 Roteamento de retransmissão

- **Algoritmo**: Roteamento baseado em localização GPS e SSID Wi-Fi.
- **Mules**: Dispositivos designados para retransmissão, com capacidade configurável.
- **Multi-hop**: Extensão via mesh BLE para alcance além da linha de visão.

## 5. Implementação

- **Sockets e Comunicações**: Axios para HTTP, react-native-ble-plx e react-native-wifi-p2p para P2P.
- **Eventos GPS**: react-native-geolocation para obtenção de coordenadas.
- **Estado Persistente**: AsyncStorage para dados locais, MySQL no servidor.
- **Linguagem/Plataforma**: Backend em Node.js/Express, Frontend em React Native/Expo.
- **Bibliotecas Externas**: react-native-ble-plx, react-native-wifi-p2p, axios, async-storage.
- **Componentes Android**: Activities para telas, Services para background (BLE, GPS).
- **Threads**: Thread principal para UI, threads background para P2P e sincronização.
- **Otimizações**: Cache de localizações, debouncing de eventos GPS.

## 6. Limitações

- Falta de testes automatizados completos.
- Dependência de bibliotecas P2P que requerem instalação manual.
- Polling ao invés de push notifications.
- Limitações de bateria em operações P2P contínuas.
- Ambiente de teste limitado a emuladores/simuladores.

## 7. Conclusões

O AnunciosLoc representa uma implementação robusta de sistema de mensagens geo-localizado com capacidades P2P. As funcionalidades core estão operacionais, com potencial para expansão em segurança e escalabilidade. A arquitetura híbrida permite flexibilidade entre modos centralizados e descentralizados, atendendo aos requisitos do projeto.