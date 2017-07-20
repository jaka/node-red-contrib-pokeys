# node-red-contrib-pokeys
This module provides a set of nodes in Node-RED for interfacing Pokeys devices.

Currently, the following Node-RED nodes are available:
* reports: receives HTTP server reports
* digital: controls state of digital outputs

For example usage see `examples` directory.

### reports

This node parses HTTP server report from the following formats: CSV, CSV with `|` delimiter or, CSV with one entry in line; and emits a message for each entry recieved inside report. The report must be sent by POST method.

The message topic (`msg.topic`) is set to name of an entry, while payload (`msg.payload`) consists of parsed float. Message topic might be used as decision in next switch node, acting as demuxer.

### digital

This node sends a UDP packet (type 0x40) to a Pokeys device to set state of the selected output pin (from 1 to 55). Note, that the pin must be already set as an output pin by Pokeys configuration manager.

Pin number could be set at node configuration or by setting `msg.pin` to a pin number.

## Installation

To install run the following command in your Node-RED user directory (typically `~/.node-red`):
```
npm i https://github.com/jaka/node-red-contrib-pokeys
```
