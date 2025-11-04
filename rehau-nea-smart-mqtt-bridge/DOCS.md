# Configurable Intervals

All intervals in the TypeScript version are now configurable via environment variables.

## Environment Variables

Add these to your `.env` file:

```bash
# Intervals (in seconds)
ZONE_RELOAD_INTERVAL=300        # Reload zones every 5 minutes (default: 300)
REFERENTIALS_RELOAD_INTERVAL=86400  # Reload referentials every 24 hours (default: 86400)
TOKEN_REFRESH_INTERVAL=21600    # Refresh token every 6 hours (default: 21600)
```

## Defaults

| Interval | Default | Description |
|----------|---------|-------------|
| `ZONE_RELOAD_INTERVAL` | 300 seconds (5 minutes) | How often to reload zone data from REHAU API |
| `REFERENTIALS_RELOAD_INTERVAL` | 86400 seconds (24 hours) | How often to reload referentials from REHAU MQTT |
| `TOKEN_REFRESH_INTERVAL` | 21600 seconds (6 hours) | How often to refresh the authentication token |

## Authentication Changes

The TypeScript version now:
- ✅ **Performs fresh login on every boot** - No token file persistence
- ✅ **Automatically refreshes tokens** every 6 hours (configurable)
- ✅ **Falls back to fresh login** if token refresh fails
- ✅ **Stops all timers** on graceful shutdown

## Implementation Details

### Token Refresh
- Starts automatically after initial authentication
- Runs every `TOKEN_REFRESH_INTERVAL` seconds
- If refresh fails, attempts a fresh login
- Stopped on SIGTERM/SIGINT

### Zone Reload
- Fetches full installation data from REHAU API
- Updates all climate entities with latest values
- Runs every `ZONE_RELOAD_INTERVAL` seconds
- Stopped on SIGTERM/SIGINT

### Referentials Reload
- Reloads MQTT referentials (value/index mappings)
- Runs every `REFERENTIALS_RELOAD_INTERVAL` seconds
- Stopped when MQTT disconnects

## Example Configurations

### Fast Updates (Testing)
```bash
ZONE_RELOAD_INTERVAL=60          # 1 minute
REFERENTIALS_RELOAD_INTERVAL=3600  # 1 hour
TOKEN_REFRESH_INTERVAL=1800      # 30 minutes
```

### Conservative (Production)
```bash
ZONE_RELOAD_INTERVAL=600         # 10 minutes
REFERENTIALS_RELOAD_INTERVAL=86400  # 24 hours
TOKEN_REFRESH_INTERVAL=21600     # 6 hours
```

### Aggressive (Real-time)
```bash
ZONE_RELOAD_INTERVAL=30          # 30 seconds
REFERENTIALS_RELOAD_INTERVAL=43200  # 12 hours
TOKEN_REFRESH_INTERVAL=10800     # 3 hours
```

## Logging

The application logs when each interval is scheduled:
```
[INFO] Token refresh scheduled every 21600 seconds
[INFO] Referentials reload scheduled every 86400 seconds
[INFO] Zone reload scheduled every 300 seconds
```
