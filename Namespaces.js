/*
    Namespaces.js
    @author Victor Gama (@victrgama)
    http://github.com/VictorGama/Namespaces.js
    @version 2.9.2b
*/
var Namespaces = (function() {
    var _registredNamespaces = {};
    var _listeners = {};
    /**
     * Returns the object inside an Array if object isn't already an Array.
     *  @param      {Object} obj    Object to be processed
     *  @returns    {Array}
     **/
    var _toArray = function(obj) {
        if(typeof(obj) === 'object' && obj.sort) {
            return obj;
        }
        return Array(obj);
    };
    /**
     * Returns a random-generated string
     * @param   Integer length String length
     * @returns String  The random-generated string
     */
    var _rndStr = function(length) {
        length = length || 6;
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var result = "";
        for (var i = 0; i < length; i++) {
            var index = Math.floor(Math.random() * chars.length);
            result += chars.substring(index, index + 1);
        }
        return result;
    }
    /**
     * Try to create a XMLHttpRequest
     * @returns {XMLHttpRequest} The XMLHttpRequest
     */
    var _createXMLHttpRequest = function() {
        var xhr;
        try { xhr = new XMLHttpRequest(); } catch(ex) {
            try { xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(ex1) {
                try { xhr = new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(ex2) {
                    try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch(ex3) {
                        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch(ex4) {
                            throw new Error("Esse navegador não suporta XMLHttpRequest");
                        }
                    }
                }
            }
        }
        return xhr;
    };
    /**
     * Checks if a request (XMLHttpRequest) has been successfull from it's status code
     * @param {Integer} status Http Status Code
     * @returns {Boolean}
     */
    var _isRequestOkay = function(status) {
        return (status >= 200 && status < 300) ||
        status == 304 ||
        status == 1223 ||
        (!status && (window.location.protocol == "file" || window.location.protocol == "chrome:"));
    };
    /**
     * Creates a script element with the specified value as the content
     * @param {String} data Script's content
     */
    var _createScript = function(data) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        
        if(typeof(window.execScript) === "object") {
            window.execScript(data);
        } else {
            try {
                document.body.appendChild(script);
            } catch(e) { // The Evil Eval
                window["eval"](data);
            }
        }
    };
    /**
     * Throws an event
     * @param   {String} event Event's ID
     * @param   {Object} properties Event's properties
     */
    var _triggerEvent = function(event, properties) {
        if(!_listeners[event]) { return; }
        properties.event = event;
        for(var l = 0; l < _listeners[event].length; l++) {
            _listeners[event][l](properties);
        }
    };
    /**
     * Creates an object followed by the specified namespace's identifier
     * @public
     * @param   {String}    identifier  Namespace's identifier
     * @param   {Object}    $classes    Object which properties and method will be implemented on the namespace
     * @return  {Object}
     */
    var _namespace = function(namespace) {
        var $classes = arguments[1] || false;
        var target = window;
        if(namespace != '') {
            var parts = namespace.split('.');
            for(var p = 0; p < parts.length; p++) {
                if(!target[parts[p]]) { target[parts[p]] = {}; }
                else { target = target[parts[p]]; }
            }
        }
        
        if($classes) {
            for(var $class in $classes) {
                if($classes.hasOwnProperty($class)) { target[$class] = $classes[$class]; }
            }
        }
        
        _triggerEvent("created", { namespace: namespace });
        return target;
    };
    /**
     * Checks if an identifier is already registred
     * @public
     * @param   {String}    identifier  Identifier to be checked
     * @returns {Boolean}
     */
    _namespace.exists = function(namespace) {
        if(namespace === '') { return true; }
        var parts = namespace.split('.');
        var target = window;
        for(var n = 0; n < parts.length; n++) {
            if(!target[parts[n]]) { return false; }
            target = target[parts[n]];
        }
        return true;
    };
    /**
     * Maps an identifier to an Url
     * @public
     * @param {String}  identifier  Identifier to be mapped
     * @returns {String} URL path to the script
     */
    _namespace.mapNamespaceToUrl = function(namespace) {
        var regexp = new RegExp('\\.', 'g');
        var burl = Namespaces.baseUrl;
        burl = burl + (burl[burl.length - 1] == '/' || burl[burl.length - 1] == '\\' ? '' : "/");
        return burl + namespace.replace(regexp, '/') + '.js';
    };
    /**
     * Loads a script after mapping it's path
     * @param {String}      namespace   Namespace to be loaded
     * @param {Function}    callback    Success callback
     * @param {Function}    error       Optional error callback
     * @returns {Boolean}
     */
    var _loadScript = function(namespace) {
        var callback = arguments[1] || false;
        var error = arguments[2] || false;
        var isAsync = (typeof(callback) === "function");
        var url = _namespace.mapNamespaceToUrl(namespace);
        if(Namespaces.stopCaching) {
            url += "? =" + _rndStr();
        }
        var event = {
            namespace: namespace,
            url: url,
            wasAsync: isAsync,
            callback: callback
        };
        
        var xhr = _createXMLHttpRequest();
        var completed = function() {
            _createScript(xhr.responseText);
            _triggerEvent("included", event);
            if(callback) { callback(); return true; } else { return true; }
        }
        var failed = function() {
            event.status = xhr.status;
            event.xhr = xhr;
            _triggerEvent("importFailed", event);
            if(error) { error(); return false; } else { return false; }
        }
        xhr.open("GET", url, isAsync);
        if(isAsync) {
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4) {
                    if(_isRequestOkay(xhr.status || 0)) {
                        completed();
                    } else {
                        failed();
                    }
                }
            }
        } else {
            xhr.send(null);
            if(_isRequestOkay(xhr.status || 0)) {
                completed();
            }
            failed();
        }
    };
    /**
     * Imports a namespace loading it's corresponding file to the document
     * @public
     * @param {String} namespace Namespace to be imported
     * @param {Function} callback Function to be executed after namespace gets loaded
     */
    _namespace.import = function(namespace) {
        var callback = arguments[1] || false;
        var error = arguments[2] || false;
        if(_registredNamespaces[namespace]) {
            if(callback) { callback(); }
            return true;
        }
        if(callback) {
            _loadScript(namespace, function() {
                _registredNamespaces[namespace] = true;
                callback();
                return true;
            }, function() {
                error();
                return false;
            });
        } else {
            if(_loadScript(namespace)) {
                _registredNamespaces[namespace] = true;
                return true;
            }
        }
        return false;
    };
    /**
     * Register a callback for a determined event
     * 
     * @public
     * @param   {String}    event   Event to be watched
     * @param   {Function}  callback    Callback
     */
    _namespace.addEventListener = function(event, callback) {
        if(!_listeners[event]) { _listeners[event] = []; }
        _listeners[event].push(callback);
    };
    /**
     * Unregister an event's callback
     * @public
     * @param   {String}    event   Associated event's callback
     * @param   {Function}  callback    Callback to be removed
     */
    _namespace.removeEventListener = function(event, callback) {
        if(!_listeners[event]) { return; }
        for(var l = 0; i < _listeners[event].length; l++) {
            if(_listeners[event][l] == callback) {
                delete _listeners[event][l];
                return;
            }
        }
    };
    return _namespace;
})();

// Namespaces default configuration

// Sets the baseUrl where Namespaces.js will look for .js files
Namespaces.baseUrl = "/";
// 
Namespaces.stopCaching = true;
