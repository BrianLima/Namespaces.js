Namespaces.js
=============
Namespaces.js helps you to organize complex Javascript classes. Featuring:

 * Event handlers
 * Asynchronous namespace loading
 * Callbacks

Usage
-----

### Creating a namespace:
#### 1st way (less cool)

    Namespaces("foo.bar"); // Creates namespace foo.bar
    foo.bar.log = function(message) {
        if(console) console.log(message);
    }
    foo.bar.log("hello, world!"); // Prints "hello, world" on console, if available.

#### 2nd way (pretty groovy)

    Namespaces("foo.bar", {
        log: function(message) {
            if(console) console.log(message);
        }
    });
    foo.bar.log("hello, world"); // Prints "hello, world" on console, if available.

### Importing an existent namespace
Importing namespaces is pretty easy, you just need to specift which one you want to import.

    Namespaces.import("foo.bar.test"); // Imports foo/bar/test.js into document.

After this point, you can access any `foo.bar.test`'s property or method.

#### Using callbacks
You can also set a callbacks (for success and error), which will be executed after the namespace gets imported.

    Namespaces.import("foo.bar.inexistent", function() {
        foo.bar.log("imported successfully");
    }, function() {
        foo.bar.log("something miserable happened.");
    });

**Note:** Using callbacks will force `Namespaces.js` to make an Asynchronous HTTP request, while otherwise, a normal HTTP request is made.

### Using event listeners
Is possible to assign callback functions to a determined event using `addEventListener` and `removeEventListener` functions.

#### Assigning events

    Namespaces.addEventHandler("importFailed", function(event) {
        foo.bar.log("Failed to import namespace " + event.Namespace);
    });
    // That anonymous function is called when an import operation fails. 
    // It also provides some event information, under the event argument.

#### Removing an event assignment

    Namespaces.removeEventHandler("importFailed", function(event) {
        foo.bar.log("Failed to import namespace " + event.Namespace);
    });
    // Note that when removing an event assignment, you must provide the same parameters when assigning it.
    

License Information
===================

Copyright (c) 2012, Victor Gama de Oliveira.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Victor Gama de Oliveira nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
