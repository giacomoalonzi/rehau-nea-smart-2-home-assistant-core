# REHAU API Response Parsers

This directory contains standalone TypeScript parsers for REHAU API responses. These parsers provide type-safe parsing and validation of API responses with clear, strongly-typed output objects.

## Purpose

- **Code Clarity**: Separate parsing logic from business logic
- **Reusability**: Use these parsers in different projects
- **Support & Debugging**: Parse API response dumps from users to improve parsers and provide better support
- **Type Safety**: All output objects have explicit string types for better IDE support and type checking

## Quick Start - CLI Commands

Parse JSON files directly from the command line:

```bash
# Parse user data - JSON output
npm run parseUserData -- user-data.json

# Parse user data - human-readable summary
npm run parseUserData -- user-data.json --summary

# Parse installation data - JSON output
npm run parseInstallationData -- installation-data.json

# Parse installation data - human-readable summary
npm run parseInstallationData -- installation-data.json --summary

# Parse specific installation by unique ID
npm run parseInstallationData -- installation-data.json --unique ABC123DEF456

# Show help
npm run parseUserData -- --help
npm run parseInstallationData -- --help
```

## Parsers

### UserDataParser

Parses responses from the `getUserData` API endpoint.

**Input**: Raw API response from `/v2/users/{email}/getUserData`

**Output**: Typed object containing:
- User ID, email, and name
- List of installations with IDs, unique identifiers, names, addresses, and roles

**Example**:
```typescript
import { UserDataParser } from './parsers';

const parser = new UserDataParser();
const result = parser.parse(apiResponse);

console.log(result.userId);           // string
console.log(result.email);            // string | null
console.log(result.installations);    // ParsedInstallationInfo[]

result.installations.forEach(install => {
  console.log(install.id);            // string
  console.log(install.unique);        // string
  console.log(install.name);          // string
  console.log(install.address);       // string | null
  console.log(install.role);          // string | null
});
```

### InstallationDataParser

Parses responses from the `getDataofInstall` API endpoint.

**Input**: Raw API response from `/v2/users/{email}/getDataofInstall`

**Output**: Typed object containing:
- Installation metadata (ID, name, address, version, connection state)
- Temperature values (with Celsius, Fahrenheit, and raw representations)
- Operation mode (heating/cooling/manual)
- Groups, zones, and channels with full thermostat data
- Mixed circuits with pump information
- Controllers

**Example**:
```typescript
import { InstallationDataParser } from './parsers';

const parser = new InstallationDataParser();
const result = parser.parse(apiResponse, 'installation-unique-id');

console.log(result.name);                              // string
console.log(result.connectionState);                   // boolean
console.log(result.outsideTemperature.celsius);        // number | null
console.log(result.outsideTemperature.fahrenheit);     // number | null

result.groups.forEach(group => {
  group.zones.forEach(zone => {
    zone.channels.forEach(channel => {
      console.log(channel.currentTemperature.celsius);  // number | null
      console.log(channel.setpointTemperature.celsius); // number | null
      console.log(channel.humidity);                    // number | null
      console.log(channel.openWindow);                  // boolean
      console.log(channel.config.heating);              // boolean
      console.log(channel.config.cooling);              // boolean
    });
  });
});
```

## Usage in Different Projects

These parsers are designed to be portable. To use them in another project:

1. **Copy the parser files**:
   - `user-data-parser.ts`
   - `installation-data-parser.ts`
   - `index.ts` (optional, for convenient imports)

2. **Install dependencies** (only TypeScript is required):
   ```bash
   npm install --save-dev typescript
   ```

3. **Import and use**:
   ```typescript
   import { UserDataParser, InstallationDataParser } from './parsers';
   ```

## Parsing from Files

Both parsers support parsing from JSON files:

```typescript
import { UserDataParser } from './parsers';
import * as fs from 'fs';

const parser = new UserDataParser();

// Option 1: Parse from JSON string
const jsonString = fs.readFileSync('user-data.json', 'utf-8');
const result = parser.parseFromJson(jsonString);

// Option 2: Parse from object
const jsonObject = JSON.parse(jsonString);
const result2 = parser.parse(jsonObject);
```

## Getting Summaries

Both parsers provide a `getSummary()` method for human-readable output:

```typescript
const parser = new UserDataParser();
const result = parser.parse(apiResponse);
console.log(parser.getSummary(result));
```

Output example:
```
User ID: user123
Email: user@example.com
Name: John Doe
Installations: 2
  1. My Home (ABC123DEF456)
     Address: 123 Main Street
     Role: owner
  2. Vacation House (XYZ789GHI012)
     Address: 456 Beach Road
     Role: guest
```

## Error Handling

Both parsers validate input and throw descriptive errors:

```typescript
try {
  const result = parser.parse(apiResponse);
} catch (error) {
  console.error('Parsing failed:', error.message);
  // Examples:
  // - "Invalid getUserData response: missing required fields"
  // - "getUserData API returned success=false"
  // - "Installation with unique ID "ABC123" not found"
}
```

## Type Definitions

All types are exported for use in your code:

```typescript
import type {
  ParsedUserData,
  ParsedInstallationInfo,
  ParsedInstallationData,
  ParsedTemperature,
  ParsedChannel,
  ParsedZone,
  ParsedGroup,
} from './parsers';
```

## Example Usage

See `example-usage.ts` for complete examples of:
- Parsing from JSON files
- Parsing from API response objects
- Accessing typed data
- Displaying summaries

Run the examples:
```bash
npx ts-node src/parsers/example-usage.ts
```

## Support Workflow

When users report issues, you can ask them to:

1. Capture API responses to JSON files
2. Send you the JSON files
3. Parse them using the CLI commands:

```bash
# Quick summary of user's setup
npm run parseUserData -- customer-user-data.json --summary
npm run parseInstallationData -- customer-install-data.json --summary

# Full JSON output for detailed analysis
npm run parseUserData -- customer-user-data.json > parsed-user.json
npm run parseInstallationData -- customer-install-data.json > parsed-install.json
```

Or use the parsers programmatically:

```typescript
import { UserDataParser, InstallationDataParser } from './parsers';
import * as fs from 'fs';

// Parse user's data
const userParser = new UserDataParser();
const userData = userParser.parseFromJson(
  fs.readFileSync('user-data-from-customer.json', 'utf-8')
);

console.log('Customer has', userData.installations.length, 'installations');

// Parse installation data
const installParser = new InstallationDataParser();
const installData = installParser.parseFromJson(
  fs.readFileSync('installation-data-from-customer.json', 'utf-8')
);

console.log(installParser.getSummary(installData));
```

## Temperature Conversions

The `InstallationDataParser` automatically converts temperatures from the API's Fahrenheit×10 format:

```typescript
// API returns: 716 (which is 71.6°F)
// Parser provides:
{
  celsius: 22.0,
  fahrenheit: 71.6,
  raw: 716
}
```

## Notes

- All parsers are **immutable** - they don't modify the input data
- All parsers include the **raw response** in their output for debugging
- Type guards ensure **runtime validation** of API responses
- All string types are explicitly typed (not `any` or `unknown`)
