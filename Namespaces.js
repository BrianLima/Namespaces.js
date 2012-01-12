/*
    Namespace.js
    @author Victor Gama (@victrgama)
    @version 2.9.1a
*/
var Namespaces = (function() {
    var _registredNamespaces = {};
    var _listeners = {};
    /**
     * Retorna o objeto dentro de uma Array se o objeto não for uma Array
     *  @param      {Object} obj    O objeto a ser processado
     *  @returns    {Array}
     **/
    var _toArray = function(obj) {
        if(typeof(obj) === 'object' && obj.sort) {
            return obj;
        }
        return Array(obj);
    };
    /**
     * Tenta criar um XMLHttpRequest
     * @returns {XMLHttpRequest} O XMLHttpRequest
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
     * Verifica se uma solicitação {XMLHttpRequest} teve êxito a partir do seu status code
     * @param {Integer} status Código de status HTTP
     * @returns {Boolean}
     */
    var _isRequestOkay = function(status) {
        return (status >= 200 && status < 300) ||
        status == 304 ||
        status == 1223 ||
        (!status && (window.location.protocol == "file" || window.location.protocol == "chrome:"));
    };
    /**
     * Cria um elemento script com o valor especificado como conteúdo
     * @param {String} data O conteúdo do Script
     */
    var _createScript = function(data) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        
        if(typeof(window.execScript) === "object") { // IE como sempre, dando trabalho.
            window.execScript(data);
        } else {
            try {
                document.body.appendChild(script);
            } catch(e) { // Teremos que utilizar o Eval
                window["eval"](data);
            }
        }
    };
    /**
     * Dispara um evento
     * @param   {String} event O Identificador do evento
     * @param   {Object} properties As propriedades do evento
     */
    var _triggerEvent = function(event, properties) {
        if(!_listeners[event]) { return; }
        properties.event = event;
        for(var l = 0; l < _listeners[event].length; l++) {
            _listeners[event][l](properties);
        }
    };
    /**
     * Cria um objeto seguido do identificador do namespace especificado.
     * @public
     * @param   {String}    identifier  O identificador do namespace
     * @param   {Object}    $classes    Objeto na qual as propriedades serão implementadas no namespace
     * @return  {Object}
     */
    var _namespace = function(namespace) {
        var $classes = arguments[1] || false;
        var target = window;
        if(namespace != '') {
            var parts = event.split('.');
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
        return ns;
    };
    /**
     * Verifica se um identificador já está registrado
     * @public
     * @param   {String}    identifier  O Identificador a ser verificado
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
     * Mapeia um identificador para uma URL.
     * @public
     * @param {String}  identifier  Identificador a ser mapeado.
     * @returns {String} O caminho URL para o script
     */
    _namespace.mapNamespaceToUrl = function(namespace) {
        var regexp = new RegExp('\\.', 'g');
        return Namespace.baseUri + namespace.replace(regexp, '/') + '.js';
    };
    /**
     * Carrega um script remoto após mapear o caminho para o mesmo.
     * @param {String}      namespace   O Namespace a ser carregado
     * @param {Function}    callback    O callback para quando o script for carregado
     * @param {Function}    error       O callback para quando houver um erro durante o carregamento
     * @returns {Boolean}
     */
    var _loadScript = function(namespace) {
        var callback = arguments[1] || false;
        var error = arguments[2] || false;
        var isAsync = (typeof(callback) === "function");
        var url = _namespace.mapNamespaceToUrl(namespace);
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
        xhr.open("GET", uri, isAsync);
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
     * Importa um namespace carregando seu arquivo correspondente para o
     * documento.
     * @public
     * @param {String} namespace O Namespace a ser importado
     * @param {Function} callback A função a ser executada quando o namespace tiver sido importado.
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
     * Registra um callback para quando um determinado evento for disparado.
     * @public
     * @param   {String}    event   O evento a ser monitorado
     * @param   {Function}  callback    O callback para quando o evento for disparado
     */
    _namespace.addEventListener = function(event, callback) {
        if(!_listeners[event]) { _listeners[event] = []; }
        _listeners[event].push(callback);
    };
    /**
     * Remove o callback para um determinado evento.
     * @public
     * @param   {String}    event   O evento na qual o callback está associado
     * @param   {Function}  callback    O callback a ser removido
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
});

