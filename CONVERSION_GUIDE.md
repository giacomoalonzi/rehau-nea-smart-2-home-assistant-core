# TypeScript Conversion Guide

## Completed Files

✅ `types.ts` - All type definitions
✅ `logger.ts` - Typed logger
✅ `rehau-auth.ts` - Authentication with types
✅ `mqtt-bridge.ts` - MQTT bridge with types
✅ `tsconfig.json` - TypeScript configuration
✅ `package.json` - Updated dependencies

## Remaining Files to Convert

### climate-controller.ts (858 lines)

Key conversion patterns:

```typescript
import logger from './logger';
import RehauMQTTBridge from './mqtt-bridge';
import RehauAuthPersistent from './rehau-auth';
import { 
  RehauInstallation, 
  ClimateState, 
  ZoneInfo, 
  HACommand,
  RehauMQTTMessage,
  RehauChannel,
  RehauCommandData
} from './types';

class ClimateController {
  private mqttBridge: RehauMQTTBridge;
  private rehauApi: RehauAuthPersistent;
  private installations: Map<string, ClimateState>;

  constructor(mqttBridge: RehauMQTTBridge, rehauApi: RehauAuthPersistent) {
    this.mqttBridge = mqttBridge;
    this.rehauApi = rehauApi;
    this.installations = new Map<string, ClimateState>();
    
    // Message handler with proper typing
    this.mqttBridge.onMessage((topicOrCommand, payload?) => {
      if (typeof topicOrCommand === 'object' && topicOrCommand.type === 'ha_command') {
        this.handleHomeAssistantCommand(topicOrCommand);
      } else if (typeof topicOrCommand === 'string' && payload) {
        this.handleRehauUpdate(topicOrCommand, payload);
      }
    });
  }

  initializeInstallation(install: RehauInstallation): void {
    // ... implementation with typed parameters
  }

  private convertTemp(rawValue: number | undefined): number | null {
    if (rawValue === undefined || rawValue === null) return null;
    const celsius = ((rawValue / 10 - 32) / 1.8);
    return Math.round(celsius * 10) / 10;
  }

  private publishCurrentTemperature(zoneKey: string, temperature: number): void {
    // ... implementation
  }

  // All other methods with proper types
}

export default ClimateController;
```

### index.ts (264 lines)

Key conversion patterns:

```typescript
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import logger from './logger';
import RehauAuthPersistent from './rehau-auth';
import RehauMQTTBridge from './mqtt-bridge';
import ClimateController from './climate-controller';

dotenv.config();

const app: Express = express();
app.use(express.json());

interface Config {
  rehau: {
    email: string;
    password: string;
  };
  mqtt: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  api: {
    port: number;
  };
}

const config: Config = {
  rehau: {
    email: process.env.REHAU_EMAIL || '',
    password: process.env.REHAU_PASSWORD || ''
  },
  mqtt: {
    host: process.env.MQTT_HOST || 'localhost',
    port: parseInt(process.env.MQTT_PORT || '1883'),
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD
  },
  api: {
    port: parseInt(process.env.API_PORT || '3000')
  }
};

// Initialize components with proper types
const auth = new RehauAuthPersistent(config.rehau.email, config.rehau.password);
const mqttBridge = new RehauMQTTBridge(auth, config.mqtt);
const rehauApi = auth;
const climateController = new ClimateController(mqttBridge, rehauApi);

// Express routes with typed handlers
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    authenticated: auth.isAuthenticated(),
    mqttConnected: mqttBridge.isConnected()
  });
});

// ... rest of implementation
```

## Type Conversion Patterns

### 1. Function Parameters

```typescript
// Before (JS)
function processZone(zone, installId) {
  // ...
}

// After (TS)
function processZone(zone: RehauZone, installId: string): void {
  // ...
}
```

### 2. Nullable Values

```typescript
// Before (JS)
let temperature = null;

// After (TS)
let temperature: number | null = null;
```

### 3. Map/Array Types

```typescript
// Before (JS)
this.installations = new Map();

// After (TS)
this.installations = new Map<string, ClimateState>();
```

### 4. Async Functions

```typescript
// Before (JS)
async getInstallationData(install) {
  // ...
}

// After (TS)
async getInstallationData(install: InstallInfo): Promise<RehauInstallation> {
  // ...
}
```

### 5. Optional Parameters

```typescript
// Before (JS)
function publish(topic, payload, options = {}) {
  // ...
}

// After (TS)
function publish(topic: string, payload: string | object, options: IClientPublishOptions = {}): void {
  // ...
}
```

### 6. Error Handling

```typescript
// Before (JS)
catch (error) {
  logger.error('Error:', error.message);
}

// After (TS)
catch (error) {
  logger.error('Error:', (error as Error).message);
}
```

## Building and Running

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run development mode
npm run dev

# Run production
npm start
```

## Type Safety Benefits

1. **Compile-time checks** - Errors caught before runtime
2. **IntelliSense** - Better IDE autocomplete
3. **Refactoring** - Safe renames and changes
4. **Documentation** - Types serve as inline docs
5. **Maintenance** - Easier to understand code flow
