/**
 * REHAU API Response Parsers
 * 
 * This module provides standalone parsers for REHAU API responses.
 * These parsers can be used independently in different projects to parse
 * API response dumps for debugging, support, and development purposes.
 */

export {
  UserDataParser,
  type UserDataApiResponse,
  type ParsedUserData,
  type ParsedInstallationInfo,
} from './user-data-parser';

export {
  InstallationDataParser,
  type InstallationDataApiResponse,
  type ParsedInstallationData,
  type ParsedTemperature,
  type ParsedChannel,
  type ParsedZone,
  type ParsedGroup,
  type ParsedController,
  type ParsedMixedCircuit,
} from './installation-data-parser';
