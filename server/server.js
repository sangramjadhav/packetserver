var pcap = require('pcap');
var util = require('util');
var staticServer = require('node-static');
var pcap_session = pcap.createSession('wlp2s0b1', 'tcp port 80');
var dns_cache    = pcap.dns_cache;
var tcp_tracker  = new pcap.TCPTracker();
var http = require('http');
var socketio = require('socket.io');
var inspect = require('sys').inspect;
var file = new staticServer.Server('../client/dist/');
var tcpSession = new pcap.TCPSession();
console.log('Listening interface: ' + pcap_session.device_name);

var app = http.createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
});

io = socketio(app);

/* Server Port */
var port = 7777;
app.listen(port);
console.log('Listening on ' + port);

io.on('connection', function (socket) {
    socket.emit('connection', { state: 'connected' });
    socket.on('home_services', function (data) {
        console.log(data);
    });

    pcap_session.on('packet', function (raw_packet) {
        var packet = pcap.decode.packet(raw_packet),
            ipLayer = packet.payload.payload,
            ips = ipLayer.saddr+'>'+ipLayer.daddr;
        tcp_tracker.track_packet(packet);
        socket.emit('raw', { datos: packet });
        socket.emit('ips', { datos: ips });
        socket.emit('packet', { datos: packet.toString() });
    });
    
    tcp_tracker.on('session', function (session) {
        session.on('start', function (session) {
            socket.emit('tcp', { datos: "Started TCP session between " + session.src_name + " and " + session.dst_name });
        });
        
        session.on("data recv", function (session, data) {
            socket.emit('tcp', { datos: session.dst_name + " -> " + session.src_name + " data recv " + session.recv_bytes_payload + " + " + data.length + " bytes" });
        });
        
        session.on("data send", function (session, data) {
            socket.emit('tcp', { datos: session.src_name + " -> " + session.dst_name + " data send " + session.send_bytes_payload + " + " + data.length + " bytes" });
        });
        
        session.on('end', function (session) {
            socket.emit('tcp', { datos: "End of TCP session between " + session.src_name + " and " + session.dst_name });
        });
    });
});
