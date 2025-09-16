/**
 * Cross-platform event emitter for balance updates
 * Works in both React Native and Web environments
 */

interface BalanceEventListener {
  (event: { type: string; transactionId?: string; timestamp?: number }): void;
}

class BalanceEventEmitter {
  private listeners: BalanceEventListener[] = [];

  subscribe(listener: BalanceEventListener): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(event: { type: string; transactionId?: string }): void {
    const eventWithTimestamp = {
      ...event,
      timestamp: Date.now(),
    };

    this.listeners.forEach((listener) => {
      try {
        listener(eventWithTimestamp);
      } catch (error) {
        console.error("Error in balance event listener:", error);
      }
    });
  }

  getListenerCount(): number {
    return this.listeners.length;
  }
}

// Global singleton instance
export const balanceEventEmitter = new BalanceEventEmitter();

// Convenience functions
export const emitBalanceUpdate = (type: string, transactionId?: string) => {
  balanceEventEmitter.emit({ type, transactionId });
};

export const subscribeToBalanceUpdates = (listener: BalanceEventListener) => {
  return balanceEventEmitter.subscribe(listener);
};

export default balanceEventEmitter;
