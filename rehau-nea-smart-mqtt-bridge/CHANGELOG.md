# Changelog

## [2.1.0] - 2025-11-04

### Added
- **LIVE Data Sensors** - Real-time system monitoring
  - Mixed Circuit sensors (setpoint, supply, return temperatures, valve opening, pump state)
  - Digital I/O sensors (DI0-DI4, DO0-DO5)
  - All sensors marked as diagnostic entities (hidden by default)
  - Automatic MQTT discovery in Home Assistant
- **Periodic LIVE Data Polling**
  - Automatic refresh every 5 minutes (configurable via `LIVE_DATA_INTERVAL`)
  - Only polls when connected to REHAU MQTT
  - Keeps sensor values up-to-date
- **Enhanced Debug Logging**
  - Full message dumps when `LOG_LEVEL=debug`
  - Sensitive data redaction (passwords, tokens, emails, addresses)
  - Circular reference handling in JSON serialization
  - Startup warning about potential data exposure in debug mode
  - HTTP response logging (status, headers, body)
  - Condensed logging for large data structures

### Fixed
- MQTT re-subscription on reconnection for both REHAU and Home Assistant
- HTTP 418 errors by correcting request headers (Origin, Referer, User-Agent)
- LOG_LEVEL environment variable not being read (dotenv loading order)
- Circular JSON serialization errors in logger
- LIVE_DIDO crash when DI/DO arrays are undefined (added safety checks)
- Installation name in device identifiers (was showing ID instead of name)
- Temperature conversion for Mixed Circuit sensors (Fahrenheit to Celsius)
- Reduced log noise (config dumps only at debug level)

### Changed
- Retained MQTT messages for sensor states (persist across HA restarts)
- LIVE data request logging changed from info to debug level
- Better error handling throughout the application

### Security
- Sensitive data redaction in debug logs
  - Passwords, tokens, API keys redacted
  - Email addresses partially masked
  - Installation addresses and coordinates redacted
  - User data structure preserved while hiding sensitive fields

## [2.0.2] - 2025-11-04

### Fixed
- Re-publish MQTT discovery configs on every zone reload to ensure persistence
- Outside temperature sensor discovery now refreshes periodically
- Zone climate and sensor discovery configs refresh every 5 minutes (configurable)
- Improved resilience to MQTT broker restarts

## [2.0.1] - 2025-11-04

### Fixed
- Fixed MQTT authentication handling for optional credentials
- Improved Mosquitto broker compatibility
- Better handling of empty MQTT username/password

### Changed
- Updated documentation with MQTT broker setup requirements

## [2.0.0] - 2025-11-04

### Added
- Full TypeScript implementation with strict typing
- Configurable intervals via environment variables
  - Zone reload interval (default: 5 minutes)
  - Token refresh interval (default: 6 hours)
  - Referentials reload interval (default: 24 hours)
- Fresh login on every boot (no token persistence)
- Automatic token refresh with fallback to fresh login
- Optimistic mode for instant UI feedback
- Separate temperature and humidity sensors per zone
- Outside temperature sensor
- Installation-wide mode control

### Changed
- Converted from JavaScript to TypeScript
- Improved error handling and logging
- Better MQTT connection management

## [1.0.0] - 2025-11-03

### Added
- Initial release
- REHAU NEA SMART 2.0 authentication
- MQTT bridge between REHAU and Home Assistant
- Home Assistant MQTT Climate integration
- REST API for direct control
- Automatic MQTT discovery
- Real-time temperature and mode updates
