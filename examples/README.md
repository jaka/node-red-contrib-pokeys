# Example

### Example 1 (with server reports and digital outputs)

##### Pokeys configuration

In first example a DS18B20 temperature sensor is connected with data pin to a pin 50 (and with a pull-up resistor of value 4k7 to 3.3 V). Moreover, a LED with 330 Ohm resistor is connected between pin 10 and 3.3 V, thus output state of 1 means the LED turned off and 0 turned on.

Our goal is to create a responsive web interface where we can see current temperature and toggle the LED on and off. Furthermore, we want feedback from Pokeys to see if output pin was really toggled.

![pin10](pin10output.png "Pin 10 Output")

In Pokeys configuration manager we make sure that pin 10 is set as output and DS18B20 is configured as sensor 1 in EasySensor dialog.

![easysensor](easysensor.png "Sensor 1")

Before setting server report, a dashboard must be made from our Sensor 1, named *Temp*, and output pin named *LED*. These names are arbitrary, but must be different from each other. Order of entries is not important.
![dashboard](dashboard_config.png "Dashboard")

Now we can configure report server. Our node plug-in acts as a web server, so a *Standard HTTP request* is needed. Server IP must be an IP where Node-RED is accessible (or will be accessible) and it is likely to be 192.168.1.200 or similar. Server port is also needed, usually Node-RED runs through 1880, so enter 1880. Data format is not mandatory, it could be anything since the plug-in detects and parses all three formats.

Method is *POST* and destination is `/pokeys`.

![report_server_configuration](report_server_configuration.png "Report server configuration")

##### Node-RED configuration

![flow1](flow1.png "Flow 1")

![dashboard](dashboard.png "Dashboard")

