var WebSocketServer = require('ws').Server;
var PORT = 8087;
var wss = new WebSocketServer({port: PORT});
var users = [];

wss.on('connection', function ( ws ) {
    ws.on('message', function( message ) {
        var item = JSON.parse( message );
        switch( item.type ) {
            case 'broadcast' :
                wss.clients.forEach(function( conn ) {
                    conn.send( JSON.stringify(item.message) );
                });
                break;
                
            case 'notification' :
                wss.clients.forEach(function( conn ) {
                    conn.send( JSON.stringify(item.message) );
                });
                break;

            case 'pair' :
                users[item.username] = ws;
                users[item.username].send( JSON.stringify(item.message) );
                break;
            default :
                // ws.send('Missing message type'); 
                break;
        }
    });

    ws.on('error', function( er ) {
        console.log( er );
    })


    ws.on('close', function() {
        console.log('connection closed');
    })
});
