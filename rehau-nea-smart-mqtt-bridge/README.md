# REHAU NEA SMART MQTT Bridge

TypeScript-based MQTT bridge for REHAU NEA SMART 2.0 heating systems.

## About

This add-on connects your REHAU NEA SMART 2.0 heating system to Home Assistant via MQTT, creating climate entities for each zone with full control capabilities.

## Prerequisites

Before installing this add-on, you must have:

1. **REHAU NEA SMART 2.0 system** configured via the official REHAU app
   - Create your account and complete the initial setup
   - Configure your installation and zones in the REHAU mobile app
   - Ensure your system is working properly in the app before proceeding

2. **MQTT Broker running in Home Assistant**
   - Install the **Mosquitto broker** add-on from the official add-on store
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Search for "Mosquitto broker" and install it
   - **Important**: In Mosquitto configuration, either:
     - Leave authentication disabled (remove `logins:` section), OR
     - Create a user and provide those credentials in this add-on's configuration
   - Start the Mosquitto broker and enable "Start on boot"
   - Note: You can use any MQTT broker, but Mosquitto is recommended

3. **MQTT Integration configured in Home Assistant**
   - Go to **Settings** → **Devices & Services**
   - Click **Add Integration** and search for "MQTT"
   - Configure it to connect to your MQTT broker (usually `core-mosquitto` on port 1883)

## Features

- **Climate control entities** for each zone
- **Separate temperature and humidity sensors** per zone
- **Outside temperature sensor**
- **Installation-wide mode control**
- **Real-time MQTT updates** from REHAU system
- **Configurable update intervals**
- **Optimistic mode** for instant UI feedback
- **Automatic token refresh**

## Configuration

```yaml
rehau_email: "your@email.com"
rehau_password: "yourpassword"
mqtt_host: "core-mosquitto"
mqtt_port: 1883
mqtt_user: "homeassistant"
mqtt_password: "yourpassword"
log_level: "info"
zone_reload_interval: 300
token_refresh_interval: 21600
referentials_reload_interval: 86400
```

## Options

### Required

- `rehau_email`: Your REHAU NEA SMART account email
- `rehau_password`: Your REHAU NEA SMART account password
- `mqtt_host`: MQTT broker hostname (usually `core-mosquitto`)
- `mqtt_port`: MQTT broker port (default: 1883)

### Optional

- `mqtt_user`: MQTT username (if authentication is enabled)
- `mqtt_password`: MQTT password (if authentication is enabled)
- `log_level`: Logging level (debug, info, warn, error) - default: info
- `zone_reload_interval`: How often to reload zone data in seconds - default: 300 (5 minutes)
- `token_refresh_interval`: How often to refresh authentication token in seconds - default: 21600 (6 hours)
- `referentials_reload_interval`: How often to reload referentials in seconds - default: 86400 (24 hours)

## Where to Find Your Entities

After the add-on starts successfully, your REHAU entities will appear in Home Assistant:

### Climate Entities
- Go to **Settings** → **Devices & Services** → **MQTT**
- You'll see a device named **REHAU [Your Installation Name]**
- Click on it to see all climate controls and sensors

### Using the Entities
- **Climate controls** will appear in your climate entity list
  - Example: `climate.rehau_myinstallation_zone_2`
- **Temperature sensors** will be available for automations and dashboards
  - Example: `sensor.rehau_kitchen_temperature`
- **Humidity sensors** will show current humidity levels
  - Example: `sensor.rehau_kitchen_humidity`

All entities are automatically discovered via MQTT and will appear within a few minutes of starting the add-on.

## Support

For issues and feature requests, please visit:
https://github.com/manuxio/rehau-nea-smart-2-home-assistant/issues
