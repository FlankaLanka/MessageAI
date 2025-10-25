import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

class NetworkService {
  private listeners: Set<(state: NetworkState) => void> = new Set();
  private currentState: NetworkState = {
    isConnected: false,
    isInternetReachable: null,
    type: null
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.updateState(state);
      
      // Listen for network state changes
      NetInfo.addEventListener(this.handleNetworkChange.bind(this));
      
    } catch (error) {
      console.error('Error initializing network service:', error);
    }
  }

  private handleNetworkChange(state: any) {
    this.updateState(state);
  }

  private updateState(state: any) {
    const newState: NetworkState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type
    };

    // Only update if state actually changed
    if (JSON.stringify(newState) !== JSON.stringify(this.currentState)) {
      this.currentState = newState;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error notifying network listener:', error);
      }
    });
  }

  // Public methods
  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  isOnline(): boolean {
    return this.currentState.isConnected && 
           (this.currentState.isInternetReachable === true || 
            this.currentState.isInternetReachable === null);
  }

  subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  async refresh(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      this.updateState(state);
      return this.getCurrentState();
    } catch (error) {
      console.error('Error refreshing network state:', error);
      return this.getCurrentState();
    }
  }
}

// Create singleton instance
export const networkService = new NetworkService();

// React hook for network state
export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(networkService.getCurrentState());

  useEffect(() => {
    const unsubscribe = networkService.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}

export default networkService;
