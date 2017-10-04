const dgram = require('dgram');
const PORT = 20055;

var checksum = function(buf) {
    if (buf.length < 8)
        return 0;
    var sum = 0;
    for (var i = 0; i < 7; i++)
        sum += buf.readUInt8(i);
    return sum % 256;
};

module.exports = function(RED) {
    "use strict";
    
    function pokeysUDPout(n) {

        RED.nodes.createNode(this, n);

        this.addr = n.addr;
        this.pin = n.pin;
        var node = this;

        var opts = {
            type: 'udp4',
            reuseAddr: true
        };

        var sock;
        sock = dgram.createSocket(opts);
        sock.on('error', function(err) {
            node.warn('UDP error!');
        });

        node.on('input', function(msg) {

            var addr = node.addr || msg.ip || '';
            var pin = parseInt(node.pin) || parseInt(msg.pin) || 0;
            if (!pin || pin < 1 || pin > 55) {
                node.error('Output pin out of range.');
                return;
            }

            if (msg.hasOwnProperty('payload')) {

                var state = null;
                if (typeof(msg.payload) === 'string')
                  state = (msg.payload.toLower() === 'on');
                else if (typeof(msg.payload) === 'number')
                  state = (msg.payload === 1);
                else
                  state = !!msg.payload;

                const context = node.context();
                var counter = context.get('counter') || 0;
                counter++;
                context.set('counter', counter % 0xff);

                node.status({});
                var msg = [0xbb, 0x40, pin - 1, state ? 1 : 0, 0, 0, counter, 0];          
                var dbuf = Buffer.from(msg);
                const csm = checksum(dbuf);
                dbuf.writeUInt8(csm, 7);
                   
                const zbuf = Buffer.alloc(64 - 8);           
                const buf = Buffer.concat([dbuf, zbuf]);

                sock.send(buf, 0, buf.length, PORT, addr, function(err, bytes) {
                    if (err) {
                        node.error('pokeys digital out: ' + err,msg);
                    }
                    msg = null;
                });
            }
        });

        node.on('close', function() {
            try {
                sock.close();
            } catch (err) {
                node.warn('pokeys digital out: Cannot close UDP socket!');
            }
        });

    }
    RED.nodes.registerType('digital out', pokeysUDPout);

};
