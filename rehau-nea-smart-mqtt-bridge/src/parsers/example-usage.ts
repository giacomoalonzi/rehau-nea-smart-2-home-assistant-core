/**
 * Example usage of REHAU API parsers
 * 
 * This file demonstrates how to use the UserDataParser and InstallationDataParser
 * classes to parse API response dumps. These parsers can be used in any project
 * to analyze REHAU API responses for debugging and support purposes.
 */

import { UserDataParser, InstallationDataParser } from './index';
import * as fs from 'fs';

/**
 * Example: Parse getUserData response from JSON file
 */
function parseUserDataFromFile(filePath: string): void {
  console.log('\n=== Parsing getUserData Response ===\n');
  
  try {
    // Read JSON file
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    
    // Create parser and parse
    const parser = new UserDataParser();
    const result = parser.parseFromJson(jsonContent);
    
    // Display summary
    console.log(parser.getSummary(result));
    
    // Access typed data
    console.log('\n--- Typed Access ---');
    console.log(`User ID: ${result.userId}`);
    console.log(`Email: ${result.email}`);
    console.log(`Number of installations: ${result.installations.length}`);
    
    result.installations.forEach((install, idx) => {
      console.log(`\nInstallation ${idx + 1}:`);
      console.log(`  ID: ${install.id}`);
      console.log(`  Unique: ${install.unique}`);
      console.log(`  Name: ${install.name}`);
      console.log(`  Address: ${install.address || 'N/A'}`);
      console.log(`  Role: ${install.role || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Error parsing user data:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example: Parse getInstallationData response from JSON file
 */
function parseInstallationDataFromFile(filePath: string, targetUnique?: string): void {
  console.log('\n=== Parsing getInstallationData Response ===\n');
  
  try {
    // Read JSON file
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    
    // Create parser and parse
    const parser = new InstallationDataParser();
    const result = parser.parseFromJson(jsonContent, targetUnique);
    
    // Display summary
    console.log(parser.getSummary(result));
    
    // Access typed data
    console.log('\n--- Typed Access ---');
    console.log(`Installation ID: ${result.id}`);
    console.log(`Unique: ${result.unique}`);
    console.log(`Name: ${result.name}`);
    console.log(`Connected: ${result.connectionState}`);
    console.log(`Version: ${result.version}`);
    
    if (result.outsideTemperature.celsius !== null) {
      console.log(`Outside Temperature: ${result.outsideTemperature.celsius}°C (${result.outsideTemperature.fahrenheit}°F)`);
    }
    
    console.log(`\nOperation Mode:`);
    console.log(`  Heating: ${result.operationMode.heating}`);
    console.log(`  Cooling: ${result.operationMode.cooling}`);
    console.log(`  Manual: ${result.operationMode.manual}`);
    
    console.log(`\nGroups: ${result.groups.length}`);
    result.groups.forEach(group => {
      console.log(`\n  Group: ${group.name} (${group.id})`);
      console.log(`  Zones: ${group.zones.length}`);
      
      group.zones.forEach(zone => {
        console.log(`\n    Zone ${zone.number}: ${zone.name}`);
        console.log(`    Channels: ${zone.channels.length}`);
        
        zone.channels.forEach(channel => {
          console.log(`\n      Channel ${channel.channelZone}:`);
          if (channel.currentTemperature.celsius !== null) {
            console.log(`        Current: ${channel.currentTemperature.celsius}°C`);
          }
          if (channel.setpointTemperature.celsius !== null) {
            console.log(`        Setpoint: ${channel.setpointTemperature.celsius}°C`);
          }
          if (channel.humidity !== null) {
            console.log(`        Humidity: ${channel.humidity}%`);
          }
          console.log(`        Heating: ${channel.config.heating}, Cooling: ${channel.config.cooling}`);
          console.log(`        Open Window: ${channel.openWindow}`);
        });
      });
    });
    
    if (result.mixedCircuits.length > 0) {
      console.log(`\nMixed Circuits: ${result.mixedCircuits.length}`);
      result.mixedCircuits.forEach(circuit => {
        console.log(`\n  Circuit ${circuit.number}:`);
        if (circuit.supply.celsius !== null) {
          console.log(`    Supply: ${circuit.supply.celsius}°C`);
        }
        if (circuit.return.celsius !== null) {
          console.log(`    Return: ${circuit.return.celsius}°C`);
        }
        if (circuit.opening !== null) {
          console.log(`    Opening: ${circuit.opening}%`);
        }
        circuit.pumps.forEach(pump => {
          console.log(`    Pump ${pump.number}: ${pump.on ? 'ON' : 'OFF'}`);
        });
      });
    }
    
  } catch (error) {
    console.error('Error parsing installation data:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example: Parse from object (e.g., from API response)
 */
function parseFromApiResponse(): void {
  console.log('\n=== Parsing from API Response Object ===\n');
  
  // Example getUserData response
  const userDataResponse = {
    success: true,
    data: {
      user: {
        _id: 'user123',
        email: 'user@example.com',
        name: 'John Doe',
        installs: [
          {
            _id: 'install456',
            unique: 'ABC123DEF456',
            name: 'My Home',
            address: '123 Main Street',
            association: {
              role: 'owner'
            }
          }
        ]
      }
    }
  };
  
  try {
    const parser = new UserDataParser();
    const result = parser.parse(userDataResponse);
    console.log('Successfully parsed user data:');
    console.log(parser.getSummary(result));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Main function to demonstrate usage
 */
function main(): void {
  console.log('REHAU API Parser Examples');
  console.log('=========================');
  
  // Example 1: Parse from object
  parseFromApiResponse();
  
  // Example 2: Parse from files (uncomment and provide file paths)
  // parseUserDataFromFile('./user-data-response.json');
  // parseInstallationDataFromFile('./installation-data-response.json');
  // parseInstallationDataFromFile('./installation-data-response.json', 'ABC123DEF456');
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  parseUserDataFromFile,
  parseInstallationDataFromFile,
  parseFromApiResponse,
};
