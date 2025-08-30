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
    console.log(
      "📱 BalanceEventEmitter: Listener added, total listeners:",
      this.listeners.length
    );

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
        console.log(
          "📱 BalanceEventEmitter: Listener removed, total listeners:",
          this.listeners.length
        );
      }
    };
  }

  emit(event: { type: string; transactionId?: string }): void {
    const eventWithTimestamp = {
      ...event,
      timestamp: Date.now(),
    };

    console.log("📢 BalanceEventEmitter: Emitting event:", eventWithTimestamp);

    this.listeners.forEach((listener) => {
      try {
        listener(eventWithTimestamp);
      } catch (error) {
        console.error("❌ BalanceEventEmitter: Error in listener:", error);
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
