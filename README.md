# AIRGUARD+

AIRGUARD+ is an automated, IoT-based environmental safety system. It actively monitors indoor Air Quality (AQI), Temperature, and Humidity in real-time. When dangerous gas levels or critical heat indexes are detected, the system automatically triggers a high-current exhaust fan to ventilate the area and pushes live data to a Firebase Realtime Database for remote monitoring.

## Features

* **Real-Time Automated Ventilation:** Automatically triggers an exhaust fan via an Active-Low relay when the AQI exceeds 1000 PPM or the Heat Index exceeds 33.0°C.
* **Custom Sensor Calibration:** Bypasses standard MQ-135 libraries in favor of raw analog voltage calculations to ensure accurate PPM readings without false triggers.
* **Cloud Integration:** Pushes live sensor telemetry and hardware status to Firebase every 5 seconds.
* **Local Display:** On-board 16x2 I2C LCD for immediate, offline environmental readouts.
* **Visual Status Indicators:** RGB LED integration to indicate system safety (Green = Safe, Red = Danger, Blue = Booting/Connecting).

## Hardware Requirements

* **Microcontroller:** NodeMCU ESP8266 (v2/v3)
* **Sensors:** * DHT22 (Temperature & Humidity)
  * MQ-135 (Gas / VOCs)
* **Actuators & Outputs:**
  * 5V Relay Module (Active-Low logic)
  * 5V Exhaust Fan
  * 16x2 LCD with I2C Backpack
  * Common Cathode RGB LED
* **Power Supply (Dual Setup):**
  * 5V USB Power (via Micro-USB to NodeMCU for logic/sensors)
  * 3.7V 18650 Battery Pack in parallel + TP4056 BMS (for raw motor power)

## Pin Mapping & Wiring

Due to the heavy current draw of the exhaust fan, this system uses an isolated dual-power setup. The microcontroller and sensors run on a 5V USB source, while the fan runs directly from the battery pack switched by the relay. **Both power sources MUST share a common ground.**

| Component | NodeMCU Pin | Power Source |
| :--- | :--- | :--- |
| **DHT22 Data** | `D4` (GPIO 2) | 3.3V (NodeMCU) |
| **MQ-135 Analog** | `A0` | `Vin` (5V from USB) |
| **I2C LCD SDA/SCL**| `D2` / `D1` | `Vin` (5V from USB) |
| **Relay `IN`** | `D3` (GPIO 0) | `Vin` (5V from USB) |
| **RGB LED (R,G,B)** | `D6`, `D7`, `D8` | 3.3V (NodeMCU) |

### Relay Output Wiring (The Gate)
* **Battery `OUT+` (from BMS)** -> Relay `COM` terminal.
* **Exhaust Fan Positive (Red)** -> Relay `NO` (Normally Open) terminal.
* **Exhaust Fan Negative (Black)** -> Battery `OUT-` (from BMS).

## Software Installation

### 1. Arduino IDE Setup
Ensure you have the ESP8266 board manager installed in your Arduino IDE. You will need to install the following libraries via the Library Manager:
* `ESP8266WiFi`
* `FirebaseESP8266` (by Mobizt)
* `DHT sensor library` (by Adafruit)
* `LiquidCrystal I2C` (by Frank de Brabander)

### 2. Configuration
Before uploading `AIRGUARD_Plus.ino` to your NodeMCU, update the configuration block with your credentials:

```cpp
// 1. NETWORK SETTINGS
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. FIREBASE SETTINGS
#define FIREBASE_HOST "your-project.firebasedatabase.app" 
#define FIREBASE_AUTH "your_database_secret"