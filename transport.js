(function( w ) {
    Transport = function(server) {
        this.ws = null;
        this.server = server;
        this.reconnection_attempts = 0;
        this.closed = false;
        this.connected = false;
        this.messageCallback = function() {};
        // Connect
        this.connect();
    };
    Transport.prototype = {
        send: function(message) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send( message );
                return true;
            } else {
                return false;
            }
        },
        connect: function() {
            var transport = this;
            if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
                console.log('WebSocket ' + this.server + ' is already connected');
                return false;
            }
            if (this.ws) {
                this.ws.close();
            }
            
            try {
                this.ws = new WebSocket( this.server );
            } catch (e) {
                console.warn('error connecting to WebSocket ' + this.server + ': ' + e);
            }

            // this.ws.binaryType = 'arraybuffer';
            this.ws.onopen = function() {
                transport.onOpen();
            };
            this.ws.onclose = function(e) {
                transport.onClose(e);
            };
            this.ws.onmessage = function(e) {
                transport.onMessage(e);
            };
            this.ws.onerror = function(e) {
                transport.onError(e);
            };
        },
        onOpen : function() {
            this.connected = true;
            console.log('WebSocket ' + this.server + ' connected');
            this.closed = false;
        },
        onClose: function(e) {
            this.connected = false;
            console.log('WebSocket disconnected (code: ' + e.code + (e.reason ? '| reason: ' + e.reason : '') + ')');
        },
        onMessage : function(e) {
            var message,
                data = e.data;

            // CRLF Keep Alive response from server. Ignore it.
            if (data === '\r\n') {
                return;
            }
        },
        onError: function(e) {
            console.warn('WebSocket connection error: ' + JSON.stringify(e));
        },
        broadcast : function( data ) {
            this.transportSend('broadcast', data);
        },
        notification : function( data ) {
            this.transportSend('notification', data);
        },
        pair : function( data ) {
            this.transportSend('pair', data);
        },
        transportSend : function( type, data ) {
            if(!this.ws) {
                return;
            }
            var messages = {};
            if( typeof data === 'string') {
                messages.type = type;
                messages.message = data;
                this.send( JSON.stringify( messages ) );
            } else if(typeof data === 'object') {
                messages.type = type;
                messages.message = data;
                this.send( JSON.stringify( messages ) );
            }
        } 
    };
    w.Transport = Transport;
})( window );

