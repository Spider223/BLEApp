import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BLECharacteristic, BLEService } from '../types/ble';

interface ServicesListProps {
  services: BLEService[];
  onSubscribeToCharacteristic: (
    serviceUUID: string,
    characteristicUUID: string,
    dataType: 'heartbeat' | 'temperature' | 'humidity' | 'pressure'
  ) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onSubscribeToCharacteristic,
}) => {
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  const toggleService = (serviceUUID: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceUUID)) {
      newExpanded.delete(serviceUUID);
    } else {
      newExpanded.add(serviceUUID);
    }
    setExpandedServices(newExpanded);
  };

  const getDataTypeFromUUID = (uuid: string): 'heartbeat' | 'temperature' | 'humidity' | 'pressure' => {
    const lowerUUID = uuid.toLowerCase();
    if (lowerUUID.includes('heart') || lowerUUID.includes('hr')) return 'heartbeat';
    if (lowerUUID.includes('temp') || lowerUUID.includes('temperature')) return 'temperature';
    if (lowerUUID.includes('humid') || lowerUUID.includes('moisture')) return 'humidity';
    if (lowerUUID.includes('press') || lowerUUID.includes('baro')) return 'pressure';
    return 'heartbeat'; // default
  };

  const handleSubscribe = (serviceUUID: string, characteristic: BLECharacteristic) => {
    if (!characteristic.properties.notify) {
      Alert.alert('Not Supported', 'This characteristic does not support notifications.');
      return;
    }

    const dataType = getDataTypeFromUUID(characteristic.uuid);
    onSubscribeToCharacteristic(serviceUUID, characteristic.uuid, dataType);
  };

  const renderCharacteristic = (serviceUUID: string, characteristic: BLECharacteristic) => (
    <View key={characteristic.uuid} style={styles.characteristicItem}>
      <View style={styles.characteristicHeader}>
        <Text style={styles.characteristicUUID}>{characteristic.uuid}</Text>
        <View style={styles.propertyBadges}>
          {characteristic.properties.read && (
            <View style={styles.propertyBadge}>
              <Text style={styles.propertyText}>R</Text>
            </View>
          )}
          {characteristic.properties.write && (
            <View style={styles.propertyBadge}>
              <Text style={styles.propertyText}>W</Text>
            </View>
          )}
          {characteristic.properties.notify && (
            <View style={[styles.propertyBadge, styles.notifyBadge]}>
              <Text style={styles.propertyText}>N</Text>
            </View>
          )}
          {characteristic.properties.indicate && (
            <View style={styles.propertyBadge}>
              <Text style={styles.propertyText}>I</Text>
            </View>
          )}
        </View>
      </View>

      {characteristic.value && (
        <Text style={styles.characteristicValue}>
          Value: {characteristic.value}
        </Text>
      )}

      {characteristic.properties.notify && (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => handleSubscribe(serviceUUID, characteristic)}
        >
          <Text style={styles.subscribeButtonText}>Subscribe to Notifications</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderService = (service: BLEService) => {
    const isExpanded = expandedServices.has(service.uuid);

    return (
      <View key={service.uuid} style={styles.serviceItem}>
        <TouchableOpacity
          style={styles.serviceHeader}
          onPress={() => toggleService(service.uuid)}
        >
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceUUID}>{service.uuid}</Text>
            <Text style={styles.characteristicCount}>
              {service.characteristics.length} characteristic(s)
            </Text>
          </View>
          <Text style={[styles.expandIcon, isExpanded && styles.expandedIcon]}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.characteristicsContainer}>
            {service.characteristics.map(char =>
              renderCharacteristic(service.uuid, char)
            )}
          </View>
        )}
      </View>
    );
  };

  if (services.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No services available</Text>
        <Text style={styles.emptySubtext}>
          Connect to a device to see its services and characteristics
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Services & Characteristics</Text>
        <Text style={styles.subtitle}>
          Tap on services to expand and view characteristics
        </Text>
      </View>

      {services.map(renderService)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  serviceItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceUUID: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  characteristicCount: {
    fontSize: 12,
    color: '#6C757D',
  },
  expandIcon: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: 'bold',
  },
  expandedIcon: {
    transform: [{ rotate: '180deg' }],
  },
  characteristicsContainer: {
    padding: 16,
  },
  characteristicItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  characteristicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characteristicUUID: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    flex: 1,
  },
  propertyBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  propertyBadge: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  notifyBadge: {
    backgroundColor: '#007AFF',
  },
  propertyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
  },
  characteristicValue: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});