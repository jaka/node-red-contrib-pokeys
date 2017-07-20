const rawbody = require('raw-body');

module.exports = function(RED) {
    "use strict";

    function pokeysHTTP(n) {

        RED.nodes.createNode(this, n);

        if (RED.settings.httpNodeRoot !== false) {

            if (!n.url) {
                this.warn('pokeys reports: missing-path');
                return;
            }
            this.url = n.url;
            var node = this;

            this.callback = function(req, res, next) {

                if (!req.body || typeof(req.body) != 'object')
                  return next();

                for (var i = 0; i < req.body.length; i++)
                  node.send(req.body[i]);

                res.sendStatus(200);
            };

            this.parser = function(req, res, next) {

                req.body = null;

                rawbody(req, {
                    length: req.headers['content-length']
                }, function (err, buf) {

                    if (err) {
                        return next(err);
                    }

                    var delimiter;
                    var delimiter_string;

                    /* Detect delimiter */
                    if (buf.indexOf(124) > 0) {
                        delimiter = 124;
                        delimiter_string = 'CSV with |';
                    }
                    else if (buf.indexOf(10) > 0) {
                        delimiter = 10;
                        delimiter_string = 'CSV w/ LF';
                    }
                    else {
                        delimiter = 44;
                        delimiter_string = 'CSV';
                    }
                    if (typeof(delimiter) === 'undefined') {
                        var error = 'Unknown format';
                        node.status({fill: 'red', text: error});
                        return next(error);
                    }
                      
                    /* CSV to dictionary */
                    var lst = [];
                    var p;
                    var b = buf;

                    while ((p = b.indexOf(delimiter)) != -1) {
                        var rawkey = b.slice(0, p);
                        var key = rawkey.toString();
                        var value;
                        b = b.slice(p + 1);

                        var r = rawkey.indexOf(44);
                        if (r < 0) {
                            p = b.indexOf(delimiter);
                            if (p < 0) {
                                if (!b.length)
                                    return next('Cannot parse CSV');
                                value = b.toString();
                            }
                            else {
                                value = b.slice(0, p).toString();
                                b = b.slice(p + 1);
                            }
                        }
                        else {
                            value = key.slice(r + 1).toString();
                            key = key.slice(0, r);
                        }
                        value = parseFloat(value);
                        lst.push({topic: key, payload: value});
                    }

                    if (b.length) {
                        var r = b.indexOf(44);
                        if (!(r < 0)) {
                            var key = b.slice(0, r).toString();
                            var value = b.slice(r + 1).toString();
                            value = parseFloat(value);
                            lst.push({topic: key, payload: value});
                        }
                    }
                    node.status({fill: 'green', text: delimiter_string});
                    req.body = lst;

                    next();
                });
            }

            this.errorHandler = function(err, req, res, next) {
                node.warn(err);
                res.sendStatus(500);
            };

            RED.httpNode.post(this.url, this.parser, this.callback, this.errorHandler);

            this.on('close', function() {
                var node = this;
                RED.httpNode._router.stack.forEach(function(route, i, routes) {
                    if (route.route && route.route.path === node.url && route.route.methods['post']) {
                        routes.splice(i, 1);
                    }
                });
            });
        }
        else {
            this.warn('pokeys reports not created');
        }

    }
    RED.nodes.registerType('reports', pokeysHTTP);

};
