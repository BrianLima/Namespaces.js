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
    

