import { BLEAnimationData } from '../types/ble';

// Demo data generator for testing animations
export class DemoDataGenerator {
  private interval: ReturnType<typeof setInterval> | null = null;
  private onDataReceived: ((data: BLEAnimationData) => void) | null = null;

  startGenerating(
    dataType: BLEAnimationData['type'] = 'heartbeat',
    onData: (data: BLEAnimationData) => void,
    intervalMs: number = 1000
  ) {
    this.onDataReceived = onData;

    this.interval = setInterval(() => {
      const data = this.generateDataPoint(dataType);
      this.onDataReceived?.(data);
    }, intervalMs);
  }

  stopGenerating() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.onDataReceived = null;
  }

  private generateDataPoint(type: BLEAnimationData['type']): BLEAnimationData {
    const timestamp = Date.now();

    switch (type) {
      case 'heartbeat':
        // Simulate heart rate between 60-100 BPM
        return {
          value: 60 + Math.random() * 40,
          timestamp,
          type: 'heartbeat',
        };

      case 'temperature':
        // Simulate temperature between 20-30°C
        return {
          value: 20 + Math.random() * 10,
          timestamp,
          type: 'temperature',
        };

      case 'humidity':
        // Simulate humidity between 30-70%
        return {
          value: 30 + Math.random() * 40,
          timestamp,
          type: 'humidity',
        };

      case 'pressure':
        // Simulate pressure between 1000-1020 hPa
        return {
          value: 1000 + Math.random() * 20,
          timestamp,
          type: 'pressure',
        };

      default:
        return {
          value: Math.random() * 100,
          timestamp,
          type: 'heartbeat',
        };
    }
  }

  // Generate a series of data points for testing
  static generateDataSeries(
    type: BLEAnimationData['type'],
    count: number = 20
  ): BLEAnimationData[] {
    const data: BLEAnimationData[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const timestamp = now - (count - i) * 1000; // Spread over time

      switch (type) {
        case 'heartbeat':
          data.push({
            value: 70 + Math.sin(i * 0.5) * 15 + Math.random() * 10,
            timestamp,
            type: 'heartbeat',
          });
          break;

        case 'temperature':
          data.push({
            value: 25 + Math.sin(i * 0.3) * 3 + Math.random() * 2,
            timestamp,
            type: 'temperature',
          });
          break;

        case 'humidity':
          data.push({
            value: 50 + Math.sin(i * 0.2) * 10 + Math.random() * 5,
            timestamp,
            type: 'humidity',
          });
          break;

        case 'pressure':
          data.push({
            value: 1010 + Math.sin(i * 0.1) * 5 + Math.random() * 3,
            timestamp,
            type: 'pressure',
          });
          break;
      }
    }

    return data;
  }
}

export const demoDataGenerator = new DemoDataGenerator();