$(document).ready(function(){
    var socket = io('http://localhost:7777');
    socket.on('connection', function (data) {
        console.log(data);
    });

    socket.on('tcp', function(data){
        $('.panel-tcp .cont-info').prepend("<p>"+data.datos+"</p>");
    });
    socket.on('packet', function(data){
        $('.panel-packets .cont-info').prepend("<p>"+data.datos+"</p>");
    });
    socket.on('ips', function(data){
        $('.panel-ips .cont-info').prepend("<p>"+data.datos+"</p>");
    });
    socket.on('raw', function(data){
    });
    socket.on('disconnect', function(){
        console.log("Disconnect");
    });
    socket.on('error', function(){
        console.log("Error occured.");
    });
});
