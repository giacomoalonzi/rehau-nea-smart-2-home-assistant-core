/**
 * Parser for REHAU getUserData API responses
 * 
 * This parser extracts user information and installation list from the getUserData endpoint.
 * It can be used standalone to parse API response dumps for debugging and support purposes.
 * 
 * @example
 * ```typescript
 * import { UserDataParser } from './parsers/user-data-parser';
 * 
 * // Parse API response
 * const parser = new UserDataParser();
 * const result = parser.parse(apiResponse);
 * 
 * console.log(result.userId);
 * console.log(result.email);
 * result.installations.forEach(install => {
 *   console.log(`${install.name}: ${install.unique}`);
 * });
 * ```
 */

/**
 * Raw API response structure from getUserData endpoint
 */
export interface UserDataApiResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email?: string;
      name?: string;
      installs: Array<{
        _id: string;
        unique: string;
        name: string;
        address?: string;
        association?: {
          role?: string;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
  };
}

/**
 * Parsed installation information from getUserData
 */
export interface ParsedInstallationInfo {
  /** Installation database ID */
  id: string;
  /** Installation unique identifier (used for MQTT) */
  unique: string;
  /** Installation display name */
  name: string;
  /** Installation address (if available) */
  address: string | null;
  /** User's role in this installation (e.g., "owner", "guest") */
  role: string | null;
}

/**
 * Parsed user data result
 */
export interface ParsedUserData {
  /** User database ID */
  userId: string;
  /** User email address */
  email: string | null;
  /** User display name */
  userName: string | null;
  /** List of installations accessible to this user */
  installations: ParsedInstallationInfo[];
  /** Raw API response for debugging */
  raw: UserDataApiResponse;
}

/**
 * Parser class for getUserData API responses
 */
export class UserDataParser {
  /**
   * Parse a getUserData API response
   * 
   * @param response - Raw API response from getUserData endpoint
   * @returns Parsed user data with typed fields
   * @throws Error if response is invalid or missing required fields
   */
  parse(response: unknown): ParsedUserData {
    // Validate response structure
    if (!this.isValidResponse(response)) {
      throw new Error('Invalid getUserData response: missing required fields');
    }

    const apiResponse = response as UserDataApiResponse;

    if (!apiResponse.success) {
      throw new Error('getUserData API returned success=false');
    }

    const user = apiResponse.data.user;

    // Parse installations
    const installations: ParsedInstallationInfo[] = user.installs.map(install => ({
      id: install._id,
      unique: install.unique,
      name: install.name,
      address: install.address || null,
      role: install.association?.role || null,
    }));

    return {
      userId: user._id,
      email: user.email || null,
      userName: user.name || null,
      installations,
      raw: apiResponse,
    };
  }

  /**
   * Type guard to validate response structure
   */
  private isValidResponse(response: unknown): response is UserDataApiResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const r = response as Record<string, unknown>;

    // Check top-level structure
    if (typeof r.success !== 'boolean' || !r.data || typeof r.data !== 'object') {
      return false;
    }

    const data = r.data as Record<string, unknown>;
    if (!data.user || typeof data.user !== 'object') {
      return false;
    }

    const user = data.user as Record<string, unknown>;

    // Check required user fields
    if (typeof user._id !== 'string') {
      return false;
    }

    // Check installs array
    if (!Array.isArray(user.installs)) {
      return false;
    }

    // Validate each installation has required fields
    for (const install of user.installs) {
      if (!install || typeof install !== 'object') {
        return false;
      }
      const i = install as Record<string, unknown>;
      if (typeof i._id !== 'string' || typeof i.unique !== 'string' || typeof i.name !== 'string') {
        return false;
      }
    }

    return true;
  }

  /**
   * Parse from JSON string
   * 
   * @param jsonString - JSON string containing getUserData response
   * @returns Parsed user data
   * @throws Error if JSON is invalid or response structure is wrong
   */
  parseFromJson(jsonString: string): ParsedUserData {
    try {
      const response = JSON.parse(jsonString);
      return this.parse(response);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a summary string of parsed user data
   * 
   * @param parsed - Parsed user data
   * @returns Human-readable summary
   */
  getSummary(parsed: ParsedUserData): string {
    const lines: string[] = [];
    lines.push(`User ID: ${parsed.userId}`);
    if (parsed.email) {
      lines.push(`Email: ${parsed.email}`);
    }
    if (parsed.userName) {
      lines.push(`Name: ${parsed.userName}`);
    }
    lines.push(`Installations: ${parsed.installations.length}`);
    parsed.installations.forEach((install, idx) => {
      lines.push(`  ${idx + 1}. ${install.name} (${install.unique})`);
      if (install.address) {
        lines.push(`     Address: ${install.address}`);
      }
      if (install.role) {
        lines.push(`     Role: ${install.role}`);
      }
    });
    return lines.join('\n');
  }
}

export default UserDataParser;
