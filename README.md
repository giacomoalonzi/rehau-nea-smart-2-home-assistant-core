# REHAU NEA SMART 2.0 - Home Assistant Add-on

Home Assistant add-on for REHAU NEA SMART 2.0 heating system integration via MQTT.

## Installation

### Step 1: Add Repository to Home Assistant

1. Navigate to **Settings** → **Add-ons** → **Add-on Store**
2. Click the **⋮** (three dots) menu in the top right
3. Select **Repositories**
4. Add this URL:
   ```
   https://github.com/manuxio/rehau-nea-smart-2-home-assistant
   ```
5. Click **Add**

### Step 2: Install the Add-on

1. Refresh the Add-on Store page
2. Find **REHAU NEA SMART 2.0 MQTT Bridge** in the list
3. Click on it and press **Install**
4. Wait for the installation to complete

### Step 3: Configure the Add-on

1. Go to the **Configuration** tab
2. Fill in your REHAU credentials:
   - **rehau_email**: Your REHAU NEA SMART account email
   - **rehau_password**: Your REHAU NEA SMART account password
3. Configure MQTT settings:
   - **mqtt_host**: Usually `core-mosquitto` if using the Mosquitto add-on
   - **mqtt_port**: Usually `1883`
   - **mqtt_user**: Your MQTT username (if authentication is enabled)
   - **mqtt_password**: Your MQTT password (if authentication is enabled)
4. (Optional) Adjust intervals:
   - **zone_reload_interval**: How often to reload zone data (default: 300 seconds)
   - **token_refresh_interval**: How often to refresh authentication (default: 21600 seconds)
   - **referentials_reload_interval**: How often to reload referentials (default: 86400 seconds)

### Step 4: Start the Add-on

1. Go to the **Info** tab
2. Click **Start**
3. Enable **Start on boot** if you want it to start automatically
4. Check the **Log** tab to verify it's running correctly

## Features

- **Climate control entities** for each heating zone
- **Separate temperature and humidity sensors** per zone
- **Outside temperature sensor**
- **Installation-wide mode control** (heat/cool)
- **Optimistic mode** for instant UI feedback
- **Real-time MQTT updates** from REHAU system
- **Configurable update intervals**
- **Automatic token refresh** with fallback to fresh login
- **TypeScript implementation** with strict type safety

## What You'll Get in Home Assistant

After starting the add-on, you'll see:

- **Climate entities**: One per zone (e.g., `climate.rehau_<installation>_zone_<number>`)
  - Control temperature setpoint
  - Switch between comfort/away presets
  - Turn zones on/off
- **Temperature sensors**: One per zone (e.g., `sensor.rehau_<room>_temperature`)
- **Humidity sensors**: One per zone (e.g., `sensor.rehau_<room>_humidity`)
- **Outside temperature sensor**: `sensor.rehau_<installation>_outside_temp`
- **Mode control**: `climate.rehau_<installation>_mode_control` for heat/cool switching

## Troubleshooting

### Add-on won't start
- Check the Log tab for error messages
- Verify your REHAU credentials are correct
- Ensure MQTT broker is running and accessible

### No entities appearing
- Check that MQTT integration is set up in Home Assistant
- Verify the add-on is connected to MQTT (check logs)
- Wait a few minutes for discovery to complete

### Entities show as unavailable
- Check MQTT broker is running
- Verify MQTT credentials in add-on configuration
- Restart the add-on

## Support

For issues and feature requests, please visit:
https://github.com/manuxio/rehau-nea-smart-2-home-assistant/issues
