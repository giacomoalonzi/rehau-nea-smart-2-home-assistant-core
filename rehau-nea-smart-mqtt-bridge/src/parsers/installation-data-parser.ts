/**
 * Parser for REHAU getInstallationData (getDataofInstall) API responses
 * 
 * This parser extracts complete installation data including zones, channels, controllers,
 * and system status from the getDataofInstall endpoint.
 * It can be used standalone to parse API response dumps for debugging and support purposes.
 * 
 * @example
 * ```typescript
 * import { InstallationDataParser } from './parsers/installation-data-parser';
 * 
 * // Parse API response
 * const parser = new InstallationDataParser();
 * const result = parser.parse(apiResponse);
 * 
 * console.log(`Installation: ${result.name}`);
 * console.log(`Connected: ${result.connectionState}`);
 * console.log(`Outside temp: ${result.outsideTemperature.celsius}°C`);
 * 
 * result.groups.forEach(group => {
 *   group.zones.forEach(zone => {
 *     console.log(`Zone ${zone.name}: ${zone.channels[0]?.currentTemperature.celsius}°C`);
 *   });
 * });
 * ```
 */

/**
 * Temperature value with multiple representations
 */
export interface ParsedTemperature {
  /** Temperature in Celsius */
  celsius: number | null;
  /** Temperature in Fahrenheit */
  fahrenheit: number | null;
  /** Raw API value (Fahrenheit × 10) */
  raw: number | null;
}

/**
 * Parsed channel (thermostat/sensor) data
 */
export interface ParsedChannel {
  /** Channel database ID */
  id: string;
  /** Channel zone number */
  channelZone: number;
  /** Controller number this channel belongs to */
  controllerNumber: number | null;
  /** Current temperature */
  currentTemperature: ParsedTemperature;
  /** Target setpoint temperature */
  setpointTemperature: ParsedTemperature;
  /** Humidity percentage (0-100) */
  humidity: number | null;
  /** Dewpoint temperature in Celsius */
  dewpoint: number | null;
  /** Open window detection active */
  openWindow: boolean;
  /** Low battery warning */
  lowBattery: boolean;
  /** Operating mode (0=comfort, 1=reduced, 2=standby, 3=off) */
  mode: number | null;
  /** Heating demand percentage (0-100) */
  demand: number | null;
  /** Channel configuration */
  config: {
    /** Heating enabled */
    heating: boolean;
    /** Cooling enabled */
    cooling: boolean;
    /** Ring activation (light ring) */
    ringActivation: boolean;
    /** Manual control locked */
    locked: boolean;
  };
  /** All setpoint temperatures */
  setpoints: {
    heatingNormal: ParsedTemperature;
    heatingReduced: ParsedTemperature;
    heatingStandby: ParsedTemperature;
    coolingNormal: ParsedTemperature;
    coolingReduced: ParsedTemperature;
  };
  /** Raw channel data for debugging */
  raw: Record<string, unknown>;
}

/**
 * Parsed zone data
 */
export interface ParsedZone {
  /** Zone database ID */
  id: string;
  /** Zone number */
  number: number;
  /** Zone display name */
  name: string;
  /** Channels (thermostats) in this zone */
  channels: ParsedChannel[];
}

/**
 * Parsed group data
 */
export interface ParsedGroup {
  /** Group database ID */
  id: string;
  /** Group display name */
  name: string;
  /** Zones in this group */
  zones: ParsedZone[];
}

/**
 * Parsed controller data
 */
export interface ParsedController {
  /** Controller number */
  number: number;
  /** Controller unique identifier */
  unique: string | null;
  /** Zone IDs managed by this controller */
  zones: string[];
}

/**
 * Parsed mixed circuit data
 */
export interface ParsedMixedCircuit {
  /** Circuit number */
  number: number;
  /** Setpoint temperature */
  setpoint: ParsedTemperature;
  /** Supply temperature */
  supply: ParsedTemperature;
  /** Return temperature */
  return: ParsedTemperature;
  /** Valve opening percentage (0-100) */
  opening: number | null;
  /** Pump information */
  pumps: Array<{
    number: number;
    on: boolean;
    tonSeconds: number | null;
    toffSeconds: number | null;
  }>;
}

/**
 * Parsed installation data result
 */
export interface ParsedInstallationData {
  /** Installation database ID */
  id: string;
  /** Installation unique identifier (used for MQTT) */
  unique: string;
  /** Installation display name */
  name: string;
  /** Installation address */
  address: string | null;
  /** Firmware version */
  version: string | null;
  /** Controller online status */
  connectionState: boolean;
  /** Timezone */
  timezone: string | null;
  /** Geofencing absence level (0=home, 1+=away) */
  absenceLevel: number | null;
  /** Geofencing active */
  geoInstallActive: boolean;
  /** Outside temperature */
  outsideTemperature: ParsedTemperature;
  /** Outside temperature (filtered) */
  outsideTemperatureFiltered: ParsedTemperature;
  /** Cooling conditions value */
  coolingConditions: number | null;
  /** Global operation mode */
  operationMode: {
    /** Heating enabled globally */
    heating: boolean;
    /** Cooling enabled globally */
    cooling: boolean;
    /** Manual mode active */
    manual: boolean;
  };
  /** Number of controllers */
  numberOfControllers: number | null;
  /** Number of mixed circuits */
  numberOfMixedCircuits: number | null;
  /** Controllers */
  controllers: ParsedController[];
  /** Groups containing zones */
  groups: ParsedGroup[];
  /** Mixed circuits (heating/cooling circuits) */
  mixedCircuits: ParsedMixedCircuit[];
  /** Raw API response for debugging */
  raw: unknown;
}

/**
 * Raw API response structure from getDataofInstall endpoint
 */
export interface InstallationDataApiResponse {
  success?: boolean;
  data?: {
    user?: {
      _id?: string;
      email?: string;
      installs?: unknown[];
    };
  };
}

/**
 * Parser class for getInstallationData API responses
 */
export class InstallationDataParser {
  /**
   * Parse a getDataofInstall API response
   * 
   * @param response - Raw API response from getDataofInstall endpoint
   * @param targetUnique - Optional unique ID to find specific installation
   * @returns Parsed installation data with typed fields
   * @throws Error if response is invalid or installation not found
   */
  parse(response: unknown, targetUnique?: string): ParsedInstallationData {
    // Validate response structure
    if (!this.isValidResponse(response)) {
      throw new Error('Invalid getInstallationData response: missing required fields');
    }

    const apiResponse = response as InstallationDataApiResponse;

    // Extract installation from response
    const installs = apiResponse.data?.user?.installs;
    if (!Array.isArray(installs) || installs.length === 0) {
      throw new Error('No installations found in response');
    }

    // Find target installation
    let install: Record<string, unknown>;
    if (targetUnique) {
      const found = installs.find((i: unknown) => {
        return typeof i === 'object' && i !== null && (i as Record<string, unknown>).unique === targetUnique;
      });
      if (!found) {
        throw new Error(`Installation with unique ID "${targetUnique}" not found`);
      }
      install = found as Record<string, unknown>;
    } else {
      install = installs[0] as Record<string, unknown>;
    }

    // Parse installation data
    return this.parseInstallation(install, response);
  }

  /**
   * Parse installation object
   */
  private parseInstallation(install: Record<string, unknown>, rawResponse: unknown): ParsedInstallationData {
    // Parse operation mode
    const userConfig = install.user as Record<string, unknown> | undefined;
    const heatCoolAuto = userConfig?.heatcool_auto_01 as Record<string, unknown> | undefined;
    const operationMode = {
      heating: heatCoolAuto?.heating === true,
      cooling: heatCoolAuto?.cooling === true,
      manual: heatCoolAuto?.manual === true,
    };

    // Parse controllers
    const controllers: ParsedController[] = [];
    if (Array.isArray(install.controllers)) {
      for (const ctrl of install.controllers) {
        if (typeof ctrl === 'object' && ctrl !== null) {
          const c = ctrl as Record<string, unknown>;
          controllers.push({
            number: typeof c.number === 'number' ? c.number : 0,
            unique: typeof c.unique === 'string' ? c.unique : null,
            zones: Array.isArray(c.zones) ? c.zones.filter((z): z is string => typeof z === 'string') : [],
          });
        }
      }
    }

    // Parse groups and zones
    const groups: ParsedGroup[] = [];
    if (Array.isArray(install.groups)) {
      for (const grp of install.groups) {
        if (typeof grp === 'object' && grp !== null) {
          const g = grp as Record<string, unknown>;
          const zones: ParsedZone[] = [];

          if (Array.isArray(g.zones)) {
            for (const zn of g.zones) {
              if (typeof zn === 'object' && zn !== null) {
                const z = zn as Record<string, unknown>;
                const channels: ParsedChannel[] = [];

                if (Array.isArray(z.channels)) {
                  for (const ch of z.channels) {
                    if (typeof ch === 'object' && ch !== null) {
                      channels.push(this.parseChannel(ch as Record<string, unknown>));
                    }
                  }
                }

                zones.push({
                  id: typeof z._id === 'string' ? z._id : '',
                  number: typeof z.number === 'number' ? z.number : 0,
                  name: typeof z.name === 'string' ? z.name : '',
                  channels,
                });
              }
            }
          }

          groups.push({
            id: typeof g._id === 'string' ? g._id : '',
            name: typeof g.name === 'string' ? g.name : '',
            zones,
          });
        }
      }
    }

    // Parse mixed circuits
    const mixedCircuits: ParsedMixedCircuit[] = [];
    if (Array.isArray(install.mixedCircuits)) {
      for (const mc of install.mixedCircuits) {
        if (typeof mc === 'object' && mc !== null) {
          mixedCircuits.push(this.parseMixedCircuit(mc as Record<string, unknown>));
        }
      }
    }

    return {
      id: typeof install._id === 'string' ? install._id : '',
      unique: typeof install.unique === 'string' ? install.unique : '',
      name: typeof install.name === 'string' ? install.name : '',
      address: typeof install.address === 'string' ? install.address : null,
      version: typeof install.version === 'string' ? install.version : null,
      connectionState: install.connectionState === true,
      timezone: typeof install.timezone === 'string' ? install.timezone : null,
      absenceLevel: typeof install.absenceLevel === 'number' ? install.absenceLevel : null,
      geoInstallActive: install.geoInstallActive === true,
      outsideTemperature: this.parseTemperature(install.outside_temp),
      outsideTemperatureFiltered: this.parseTemperature(install.outsideTempFiltered),
      coolingConditions: typeof install.coolingConditions === 'number' ? install.coolingConditions : null,
      operationMode,
      numberOfControllers: typeof install.number_cc === 'number' ? install.number_cc : null,
      numberOfMixedCircuits: typeof install.number_mixed === 'number' ? install.number_mixed : null,
      controllers,
      groups,
      mixedCircuits,
      raw: rawResponse,
    };
  }

  /**
   * Parse channel data
   */
  private parseChannel(channel: Record<string, unknown>): ParsedChannel {
    const ccConfigBits = channel.cc_config_bits as Record<string, unknown> | undefined;
    const channelConfig = channel.channel_config as Record<string, unknown> | undefined;

    return {
      id: typeof channel._id === 'string' ? channel._id : '',
      channelZone: typeof channel.channel_zone === 'number' ? channel.channel_zone : 0,
      controllerNumber: typeof channel.controllerNumber === 'number' ? channel.controllerNumber : null,
      currentTemperature: this.parseTemperature(channel.temp_zone),
      setpointTemperature: this.parseTemperature(channel.setpoint_used),
      humidity: typeof channel.humidity === 'number' ? channel.humidity : null,
      dewpoint: typeof channel.dewpoint === 'number' ? channel.dewpoint / 10 : null,
      openWindow: channel.openWindow === true,
      lowBattery: channel.lowBattery === true,
      mode: typeof channel.mode_permanent === 'number' ? channel.mode_permanent : null,
      demand: typeof channel.demand === 'number' ? channel.demand : null,
      config: {
        heating: channelConfig?.heating === true,
        cooling: channelConfig?.cooling === true,
        ringActivation: ccConfigBits?.ring_activation === true,
        locked: ccConfigBits?.lock === true,
      },
      setpoints: {
        heatingNormal: this.parseTemperature(channel.setpoint_h_normal),
        heatingReduced: this.parseTemperature(channel.setpoint_h_reduced),
        heatingStandby: this.parseTemperature(channel.setpoint_h_standby),
        coolingNormal: this.parseTemperature(channel.setpoint_c_normal),
        coolingReduced: this.parseTemperature(channel.setpoint_c_reduced),
      },
      raw: channel,
    };
  }

  /**
   * Parse mixed circuit data
   */
  private parseMixedCircuit(circuit: Record<string, unknown>): ParsedMixedCircuit {
    const pumps: ParsedMixedCircuit['pumps'] = [];
    
    if (Array.isArray(circuit.PUMPx)) {
      for (const pump of circuit.PUMPx) {
        if (typeof pump === 'object' && pump !== null) {
          const p = pump as Record<string, unknown>;
          const values = Array.isArray(p.values) && p.values.length > 0 ? p.values[0] : null;
          if (values && typeof values === 'object') {
            const v = values as Record<string, unknown>;
            pumps.push({
              number: typeof p.number === 'number' ? p.number : 0,
              on: v.pumpOn === true,
              tonSeconds: typeof v.ton === 'number' ? v.ton : null,
              toffSeconds: typeof v.toff === 'number' ? v.toff : null,
            });
          }
        }
      }
    }

    return {
      number: typeof circuit.number === 'number' ? circuit.number : 0,
      setpoint: this.parseTemperature(circuit.mixed_circuit1_setpoint),
      supply: this.parseTemperature(circuit.mixed_circuit1_supply),
      return: this.parseTemperature(circuit.mixed_circuit1_return),
      opening: typeof circuit.mixed_circuit1_opening === 'number' ? circuit.mixed_circuit1_opening : null,
      pumps,
    };
  }

  /**
   * Parse temperature value from Fahrenheit×10 to multiple formats
   */
  private parseTemperature(value: unknown): ParsedTemperature {
    if (typeof value !== 'number') {
      return { celsius: null, fahrenheit: null, raw: null };
    }

    const fahrenheit = value / 10;
    const celsius = ((fahrenheit - 32) * 5) / 9;

    return {
      celsius: Math.round(celsius * 10) / 10,
      fahrenheit: Math.round(fahrenheit * 10) / 10,
      raw: value,
    };
  }

  /**
   * Type guard to validate response structure
   */
  private isValidResponse(response: unknown): response is InstallationDataApiResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const r = response as Record<string, unknown>;

    // Check if we have data structure
    if (!r.data || typeof r.data !== 'object') {
      return false;
    }

    const data = r.data as Record<string, unknown>;
    if (!data.user || typeof data.user !== 'object') {
      return false;
    }

    const user = data.user as Record<string, unknown>;
    if (!Array.isArray(user.installs)) {
      return false;
    }

    return true;
  }

  /**
   * Parse from JSON string
   * 
   * @param jsonString - JSON string containing getInstallationData response
   * @param targetUnique - Optional unique ID to find specific installation
   * @returns Parsed installation data
   * @throws Error if JSON is invalid or response structure is wrong
   */
  parseFromJson(jsonString: string, targetUnique?: string): ParsedInstallationData {
    try {
      const response = JSON.parse(jsonString);
      return this.parse(response, targetUnique);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get a summary string of parsed installation data
   * 
   * @param parsed - Parsed installation data
   * @returns Human-readable summary
   */
  getSummary(parsed: ParsedInstallationData): string {
    const lines: string[] = [];
    lines.push(`Installation: ${parsed.name} (${parsed.unique})`);
    if (parsed.address) {
      lines.push(`Address: ${parsed.address}`);
    }
    lines.push(`Connected: ${parsed.connectionState ? 'Yes' : 'No'}`);
    if (parsed.version) {
      lines.push(`Version: ${parsed.version}`);
    }
    if (parsed.outsideTemperature.celsius !== null) {
      lines.push(`Outside Temperature: ${parsed.outsideTemperature.celsius}°C`);
    }
    lines.push(`Operation Mode: Heating=${parsed.operationMode.heating}, Cooling=${parsed.operationMode.cooling}`);
    lines.push(`\nGroups: ${parsed.groups.length}`);
    
    parsed.groups.forEach(group => {
      lines.push(`\n  Group: ${group.name}`);
      group.zones.forEach(zone => {
        lines.push(`    Zone ${zone.number}: ${zone.name}`);
        zone.channels.forEach(channel => {
          const temp = channel.currentTemperature.celsius;
          const setpoint = channel.setpointTemperature.celsius;
          const tempStr = temp !== null ? `${temp}°C` : 'N/A';
          const setpointStr = setpoint !== null ? `${setpoint}°C` : 'N/A';
          lines.push(`      Channel ${channel.channelZone}: ${tempStr} → ${setpointStr}`);
          if (channel.humidity !== null) {
            lines.push(`        Humidity: ${channel.humidity}%`);
          }
        });
      });
    });

    if (parsed.mixedCircuits.length > 0) {
      lines.push(`\nMixed Circuits: ${parsed.mixedCircuits.length}`);
      parsed.mixedCircuits.forEach(circuit => {
        const supply = circuit.supply.celsius;
        const supplyStr = supply !== null ? `${supply}°C` : 'N/A';
        lines.push(`  Circuit ${circuit.number}: Supply ${supplyStr}, Opening ${circuit.opening}%`);
      });
    }

    return lines.join('\n');
  }
}

export default InstallationDataParser;
