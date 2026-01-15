import AsyncStorage from '@react-native-async-storage/async-storage';

const RELAY_QUEUE_KEY = 'relay_message_queue';
const MESH_NETWORK_KEY = 'mesh_network_nodes';

export const relayService = {
  // Multi-hop relay functionality
  async queueMessageForRelay(messageData, targetNodeId, hopCount = 0) {
    try {
      const queue = await this.getRelayQueue();
      const relayMsg = {
        ...messageData,
        targetNodeId,
        hopCount,
        maxHops: 3, // Limit to prevent infinite loops
        relayedAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(7),
      };
      queue.push(relayMsg);
      await AsyncStorage.setItem(RELAY_QUEUE_KEY, JSON.stringify(queue));
      return relayMsg.id;
    } catch (error) {
      console.error('Error queuing relay message:', error);
      throw error;
    }
  },

  async getRelayQueue() {
    try {
      const data = await AsyncStorage.getItem(RELAY_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading relay queue:', error);
      return [];
    }
  },

  async processRelayQueue() {
    try {
      const queue = await this.getRelayQueue();
      const meshNodes = await this.getMeshNetworkNodes();

      for (const msg of queue) {
        if (msg.hopCount >= msg.maxHops) {
          // Remove expired messages
          await this.removeFromRelayQueue(msg.id);
          continue;
        }

        // Find next hop in mesh network
        const nextHop = this.findNextHop(meshNodes, msg.targetNodeId);
        if (nextHop) {
          // Simulate sending to next hop
          console.log(`Relaying message ${msg.id} to node ${nextHop.id} (hop ${msg.hopCount + 1})`);
          msg.hopCount += 1;
          // In real implementation, this would use BLE/WiFi P2P to send
          await this.sendToNode(nextHop, msg);
          await this.removeFromRelayQueue(msg.id);
        }
      }
    } catch (error) {
      console.error('Error processing relay queue:', error);
    }
  },

  findNextHop(meshNodes, targetNodeId) {
    // Simple routing algorithm - find closest node to target
    // In real implementation, this would use more sophisticated routing
    return meshNodes.find(node => node.id !== targetNodeId) || null;
  },

  async sendToNode(node, message) {
    // Placeholder for actual P2P sending
    // Would use BLE or WiFi P2P to send message to specific node
    console.log(`Sending message to node ${node.id}:`, message);
    return Promise.resolve();
  },

  async removeFromRelayQueue(id) {
    try {
      const queue = await this.getRelayQueue();
      const filtered = queue.filter(msg => msg.id !== id);
      await AsyncStorage.setItem(RELAY_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from relay queue:', error);
    }
  },

  // Mesh Network Management
  async addMeshNode(nodeData) {
    try {
      const nodes = await this.getMeshNetworkNodes();
      const node = {
        id: nodeData.id || Math.random().toString(36).substring(7),
        name: nodeData.name,
        position: nodeData.position, // {latitude, longitude}
        capabilities: nodeData.capabilities || ['relay'], // relay, storage, etc.
        lastSeen: new Date().toISOString(),
        connections: nodeData.connections || [], // connected node IDs
      };

      // Remove existing node with same ID
      const filtered = nodes.filter(n => n.id !== node.id);
      filtered.push(node);

      await AsyncStorage.setItem(MESH_NETWORK_KEY, JSON.stringify(filtered));
      return node.id;
    } catch (error) {
      console.error('Error adding mesh node:', error);
      throw error;
    }
  },

  async getMeshNetworkNodes() {
    try {
      const data = await AsyncStorage.getItem(MESH_NETWORK_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading mesh nodes:', error);
      return [];
    }
  },

  async updateNodeConnections(nodeId, connections) {
    try {
      const nodes = await this.getMeshNetworkNodes();
      const nodeIndex = nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex >= 0) {
        nodes[nodeIndex].connections = connections;
        nodes[nodeIndex].lastSeen = new Date().toISOString();
        await AsyncStorage.setItem(MESH_NETWORK_KEY, JSON.stringify(nodes));
      }
    } catch (error) {
      console.error('Error updating node connections:', error);
    }
  },

  async discoverMeshNodes() {
    // Placeholder for mesh node discovery using BLE/WiFi P2P
    // Would scan for nearby devices and add them to mesh network
    console.log('Discovering mesh nodes...');
    return Promise.resolve([]);
  },

  async calculateRoute(sourceNodeId, targetNodeId) {
    // Simple Dijkstra-like routing for mesh network
    const nodes = await this.getMeshNetworkNodes();
    const distances = {};
    const previous = {};
    const unvisited = new Set(nodes.map(n => n.id));

    // Initialize distances
    nodes.forEach(node => {
      distances[node.id] = node.id === sourceNodeId ? 0 : Infinity;
    });

    while (unvisited.size > 0) {
      // Find node with smallest distance
      let current = null;
      let minDistance = Infinity;
      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          current = nodeId;
        }
      }

      if (current === null || distances[current] === Infinity) break;

      unvisited.delete(current);

      // Update distances to neighbors
      const currentNode = nodes.find(n => n.id === current);
      currentNode.connections.forEach(neighborId => {
        if (unvisited.has(neighborId)) {
          const distance = distances[current] + 1; // Simple hop count
          if (distance < distances[neighborId]) {
            distances[neighborId] = distance;
            previous[neighborId] = current;
          }
        }
      });
    }

    // Reconstruct path
    const path = [];
    let current = targetNodeId;
    while (current) {
      path.unshift(current);
      current = previous[current];
    }

    return path.length > 1 ? path : null; // Return path if route exists
  }
};

export default relayService;