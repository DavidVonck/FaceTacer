const http = require('http').createServer();

var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

var port = new SerialPort('COM3', {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

port.pipe(parser);

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

io.on('connection', socket => {
    console.log('a user connected');
    socket.on('message', message => {
        console.log(message);
        if (message == "happy") {
            port.write("1");
            console.log("1");
        } else {
            port.write("0");
            console.log("0");
        }
    });
});

http.listen(8080, function() {
    console.log("test");
});