#!/usr/bin/env node
/**
 * CLI tool to parse getUserData API responses
 * 
 * Usage:
 *   npm run parseUserData -- <filename>
 *   npm run parseUserData -- <filename> --summary
 */

import { UserDataParser } from './user-data-parser';
import * as fs from 'fs';
import * as path from 'path';

function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run parseUserData -- <filename> [--summary]');
    console.log('');
    console.log('Arguments:');
    console.log('  <filename>   Path to JSON file containing getUserData response');
    console.log('  --summary    Output human-readable summary instead of JSON');
    console.log('');
    console.log('Examples:');
    console.log('  npm run parseUserData -- user-data.json');
    console.log('  npm run parseUserData -- user-data.json --summary');
    process.exit(0);
  }
  
  // Find filename (first argument that doesn't start with --)
  const filename = args.find(arg => !arg.startsWith('--'));
  if (!filename) {
    console.error('Error: No filename provided');
    console.error('Usage: npm run parseUserData -- <filename> [--summary]');
    process.exit(1);
  }
  
  // Check if summary mode is requested
  const summaryMode = args.includes('--summary');
  
  try {
    // Resolve file path
    const filePath = path.resolve(process.cwd(), filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Read file
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse
    const parser = new UserDataParser();
    const result = parser.parseFromJson(jsonContent);
    
    // Output
    if (summaryMode) {
      console.log(parser.getSummary(result));
    } else {
      // Output parsed data as JSON (without raw response)
      const output = {
        userId: result.userId,
        email: result.email,
        userName: result.userName,
        installations: result.installations,
      };
      console.log(JSON.stringify(output, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
