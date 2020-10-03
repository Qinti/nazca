# nazca
A new way of creating GUI  

![Logo](logo/NazcaLogo.png "Nazca")

Nazca is a special GUI language (syntactic sugar over css/html/js), which can 
define how object looks, how object acts and how it is placed in the hierarchy. 
There is no need to write separate css/html/js files - one *.nazca file will do 
everything.  

## Installation
Simply install it globally with the `npm`
```shell script
npm i -g nazca
```

## Guide  
You can think of it as an extended CSS. In general it defines the style, as a regular CSS would do. Now add to the CSS 
the functions and event handlers as JS does. After that just add a simple hierarchy of the children elements, as HTML 
does. If you imagine it all together, you'll get nazca, simple and beautiful.

### Initialization
Firstly you should initialize the project, adding .nazca file - this is a file with instructions on how to compile 
the project
```shell script
mkdir newProject
cd newProject
nazca init
```

It will generate a sample .nazca file:  
(comments are removed)
```json
{
    "sources": {
        "index": "nazca/index.nazca"
    },
    "out": {
        "path": "www", 
        "css": "css",  
        "html": ".",   
        "js": "js"     
    },
    "beautify": 0
}
```  

`.nazca` configuration file is a simple json with line and block comments.  
It contains the list of the sources and the output path.  
`sources` object is used to show to the compiler, what should be compiled. Every `*.nazca` file will generate *.css, 
*.html and *.js files with the same name.  

The `out` object contains the paths to place the output CSS/HTML/JS files to.  
`path` it's the general output folder path. Any generated files will be placed here or in the sub-folder. Sub-folders 
are defined by other parameters of this object.  
`css` The sub-folder of the `path`, where to generate CSS files to.  
`html` The sub-folder of the `path`, where to generate HTML files to.  
`js` The sub-folder of the `path`, where to generate JS files to.

`beautify` can have these values:
```javascript
{
    "beautify": 1, // means the output JS file should be beautified 
    "beautify": 0, // means the output JS file should not be post-processed after the generation 
    "beautify": -1, // means the output JS file should be uglified (compressed, minified) 
}
```

The sample .nazca file will generate this structure in your project directory
```shell script
www
  ┣─ css
  │  └─ index.css
  ┣─js
  │  └─ index.js
  └─ index.html
```  

#### Output to folders
Your html can be generated not only in a single file (`/some-page.html`), but in the `index.html` of a folder 
(`/some-page/`). To do this, at the end of the source name, you should specify `/`. Let's see an example config file 
that does the trick.
```json
{
    "sources": {
        "index": "nazca/index.nazca",
        "some-page/": "nazca/someSite.nazca",
        "another-page/": "nazca/anotherPage.nazca",
        "complex/structure/page/": "nazca/complexStructurePage.nazca"
    },
    "out": {
        "path": "www", 
        "css": "css",  
        "html": ".",   
        "js": "js"     
    },
    "beautify": 0
}
```
It will create an `index.html` and put it into `out.path/out.html` folder. It will create sub-folders - 
`some-page/` and `another-page/` in it, putting `index.html` inside of them. It will also create a folder `complex` with 
the folder `structure` with the folder `page` and put `index.html` inside it 
For CSS and JS it will simply create single
files, like in a previous example.  
This `.nazca` config will generate this folder structure.
```shell script
www
  ┣─ css
  │  ┣─ some-page.css
  │  ┣─ another-page.css
  │  ┣─ complexfolderstructure.css
  │  └─ index.css
  ┣─ js
  │  ┣─ some-page.js
  │  ┣─ another-page.js
  │  ┣─ complexfolderstructure.js
  │  └─ index.js
  ┣─ some-page
  │  └─ index.html
  ┣─ another-page
  │  └─ index.html
  ┣─ complex
  │  └─ structure
  │     └─ page
  │        └─ index.html
  └─ index.html
```  

### Compile
To compile the nazca code, simply go to a directory, where your `.nazca` file is located and run nazca
```shell script
cd /path/to/yourptoject
nazca
``` 

### Analyze
While compiling drops the process as soon as it finds the error in your source file, analyser checks the syntax and 
outputs you the list of classes, hierarchy and the list of errors (if any). 
```shell script
nazca analyse /your/file.nazca 
```
  
### Tutorial

#### Simple "Hello world"
Let's write a simple "Hello word", using nazca syntax. Create a folder, named "nazca" and add a file 
"nazca/index.nazca". It should contain this code:
```javascript
.html {
    .head {
        .title {
            text: A simple Hello World example;
        };
    };
    .body {
        .div {
            text: Hello world;
        };
    };
};
```
It looks pretty similar to the html code, except instead of html tags, you use object classes like `.objectClass`.  
All html tags are pre-defined as classes. Compiler automatically converts `.html` to `<html></html>`, when it generates 
HTML code.  

All values in nazca should end with `;`. Here, in the code above, you can see string values that start with `:` and end 
with `;` as well as an object hierarchy, where every object ends with `;`

Nazca has a special public variable, called `text` which is a text inside an html.  

After compiling it, you'll see an html: 
```html
 <html id="b">
    <head id="c">
         <title id="d">
            A simple Hello World example
        </title>
        <script src="js/index.js"></script>
        <link rel="stylesheet" type="text/css" href="css/index.css">
    </head>
    <body id="e">
        <div id="f">
            Hello world
        </div>
    </body>
</html>

```
It also generates empty CSS and useless JS files - they do nothing yet.  

Note: There also `html` public variable available. It's not recommended to use, but sometimes you may need to insert an 
HTML code in your element. While `text` modifies `innerText` of the element, `html` modifies `innerHTML`.

#### Styled "Hello world"
Let's style it a bit. We can just add some css properties to the main div
```javascript
.html {
    .head {
        .title {
            text: A simple Hello World example;
        };
    };
    .body {
        .div {
            text: Hello world;
            text-align: center;
            margin-top: 50px;
            color: green;
        };
    };
};
```

As you can see, we just added some CSS properties to it.   
Any public variable, which name is a CSS property interpreted 
by compiler and put inside the `style` attribute of the HTML element.    
Compiling it, will give you this html:
```html
 <html id="b">
    <head id="c">
        <title id="d">
            A simple Hello World example
        </title>
    <script src="js/styled.js"></script>
    <link rel="stylesheet" type="text/css" href="css/styled.css"></head>
    <body id="e">
        <div style="text-align: center;margin-top: 50px;color: green;" id="f">
            Hello world
        </div>
    </body>
</html>
```

It modifies an html, writing directly to `style` attribute, without modifying the CSS file. To do it, we should create 
a class.

#### Going classy
To avoid repetitive code, nazca allows classes to be used. Let's change our "Hello World" example to utilize classes:
```javascript
class HelloWorld < div {
    text: Hello world;
    text-align: center;
    margin-top: 50px;
    color: green;
};

.html {
    .head {
        .title {
            text: A simple Hello World example;
        };
    };
    .body {
        .HelloWorld;
    };
};
```

In the code above, we created a class, which extends the default nazca'a `div` class. For compiler it means it should 
have a new element, which basically a `div` html tag. It will have `class` attribute with the value of `HelloWorld`. 
Compiler also should create a css with a style, defined in this class.
if you compile the code above, you'll see that the CSS file is not empty, but contains css class. HTML tag we had 
previously uses `class` attribute now.

#### Separating the file
In nazca we can separate the file, by using `*include` directive. It shows the compiler where to take the source 
file from. Compiler reads it and inserts the content of the file, replacing the directive.
  
Create another file in your `nazca` directory, called `nazca/include.nazca`. We can move class code there, as we will 
only modify this one in the future.
`nazca/include.nazca`
```javascript
class HelloWorld < div {
    text: Hello world;
    text-align: center;
    margin-top: 50px;
    color: green;
};
```

`nazca/index.nazca`
```javascript
*include: include.nazca;

.html {
    .head {
        .title {
            text: A simple Hello World example;
        };
    };
    .body {
        .HelloWorld;
    };
};
```

We don't need to modify `.nazca` config file. We still need just one css, one html and one js file for one page. When 
compiler finds the `*include` directive, it simply replaces it with the content of the file. In the end our 
`index.nazca` will become similar to the one we had in a previous tutorial section.

#### Let's do something!
The hello world example is great, but it just creates the html page with some css. Without any action it's not 
fascinating. Nazca also compiles a JavaScript methods into JS functions.  
In nazca there are 3 types of visibility - public, protected and private and 2 main entities - methods (functions) and 
variables.
Public methods are defined similar to a CSS property. It could have a list of input parameters with default values. The 
body of the method is a JavaScript as you know it. Private methods are defined as method with the special character `-` 
and protected methods are defined with `#`.
```javascript
class SomeClass {
    publicMethod: (inputVariable = false) {
        console.log('This is a public method');
    };
    #protectedMethod: (inputVariable = false) {
        console.log('This is a protected method');
    };
    -privateMethod: (inputVariable = false, anotherInputVariable = true) {
        console.log('This is a protected method');
    };
};
```
JavaScript has no concept of the visibility, and you may not be familiar with it from other languages. The `public` 
methods and properties are the entities that are seen from the other classes (like regular JS properties and functions).
`private` are visible only inside the object of the class, to which they belong. `protected` are the same as 
`private`, but also visible to all (and only) inherited classes. You can read 
<a href="https://en.wikipedia.org/wiki/Access_modifiers" target="_blank">this wikipedia article</a> if you want to know more.
  
Variable (property) could be public/protected/private as well as it could be of a different type - string, numeric, 
regex, object, array, boolean.
```javascript
class SomeClass {
    publicString: Some public string;
    -privateNumber: 23;
    #protectedRegex: /^[a-z\d]+/ig;
    publictObject: {
        a: 1,
        b: 2
    };
    #protectedArray: [1, 2, 3];   
};
``` 
Note: Don't forget to end each variable and function with `;`  
  
Let's modify our `nazca/include.js` to change the color of the text every `n` seconds.
```javascript
class HelloWorld < div {
    text: Hello world;
    text-align: center;
    margin-top: 50px;
    color: green;

    -colors: ['red', 'yellow', 'green', 'cyan',  'blue', 'violet'];
    -index: 3;

    changeColor: (seconds = 2) {
        setInterval(() => {
            color = colors[index];
            
            index++;
            if(index >= colors.length) {
                index = 0;
            }
        }, seconds * 1000);
    };
};
``` 
Please note that nazca creates additional JavaScript code around all private/protected/public variables as well as css 
option and html attributes. To be able to use them in your methods, they have to be declared. In later example you'll 
see we declare empty variables like `variable:;` and define it later in methods.
    
In the method code you don't have to specify `this` or any visibility accessor 
(private/protected/public). Compiler checks what was declared and replaces it with correct context in resulting JS. 
However keep in mind that in nazca all private/protected/public methods and properties should have unique names. This 
class is invalid:
```javascript
class InvalidClass {
    method: () {};
    -method: () {};
    method: ;
};
``` 
We declared a public method, a private method and a public variable with the same names. Compiler does not accept it.
  
Returning to the main example - it has a public method and a couple of private parameters defined, but it still does 
nothing, and the method is never called. In the next section, we will discuss on how to actually call it.

#### Construction
Every class in nazca could have a special method, called `constructor`. This is the first method that is executed, when 
the object is initialized with `new ClassName(...inputParameters);`. It is always public   
In our case we do not initialise it in with the `new` keyword, but we have the object that is the part of the hierarchy.
In this case, the constructor will be called as soon as the object is loaded on the page (to be precise, when the 
`DOMContentLoaded` event is fired).  
Let's modify the example to actually work now.
```javascript
class HelloWorld < div {
    text: Hello world;
    text-align: center;
    margin-top: 50px;
    color: green;

    -colors: ['red', 'yellow', 'green', 'cyan',  'blue', 'violet'];
    -index: 3;

    constructor: () {
        changeColor();
    };

    changeColor: (seconds = 2) {
        setInterval(() => {
            color = colors[index];

            index++;
            if(index >= colors.length) {
                index = 0;
            }
        }, seconds * 1000);
    };
};
```

#### Event handlers
In a previous tutorial we implemented a page with "Hello World" text, that changes the color every 2 seconds. 
Let's add some user interaction: an input field that accepts the time period in seconds, and a button that sets it.

```javascript
class HelloWorld < div {
    -colors: ['red', 'yellow', 'green', 'cyan',  'blue', 'violet'];
    -index: 3;
    -interval:;

    constructor: () {
        interval = setInterval(() => changeColor(), 2000);
    };

    changeColor: () {
        helloWorld.color = colors[index];

        index++;
        if(index >= colors.length) {
            index = 0;
        }
    };

    helloWorld.div {
        text: Hello world;
        text-align: center;
        margin-top: 50px;
        color: green;
    };
    .div {
        margin-top: 15px;
        text-align: center;

        time.input {
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
            width: 50px;

            value: 2;
            $type: number;
        };
        .button {
            border-radius: 5px;
            background-color: blue;
            color: white;
            cursor: pointer;
            padding: 5px;
            border: 1px solid #ccc;

            text: Set;

            @click: () {
                clearInterval(interval);
                let seconds = parseInt(time.value) || 2;
                interval = setInterval(() => changeColor(), seconds * 1000);
            };
        };
    };
};
```

In the example above we defined a hierarchy of the `HelloWorld` class. It now has a text as a div, an input, a button 
and a dif that contains these two.  
We used special public property, called `value` it defines the value of the elements of type `input`, `select` and 
`textarea`. See <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue" target="_blank">value attribute</a> for reference  
  
We also set the attribute of the input field. All attributes in nazca are defined with prefix `$`. For example:
```javascript
class someClass < input{
    $type: text;
    $placeholder: Your text;
};
```
See <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes" target="_blank">the full list of attributes</a>
  
In this tutorial we added an event handler for the nazca object, by prepending `@` to the event name. For example:
```javascript
class SomeClass {
    @click: () {};
    @mousedown: () {};
};
```  
See <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element#Events" target="_blamk">the complete list of events</a>

All children in the hierarchy act in the scope of the main class and have access to the private/protected/public 
attributes of the class.

#### Getters and Setters
The concept of the getters nd setters is used in ES6 and in the old style JS. Sometimes you want the property act as a 
method. doing some other actions apart of setting the properties. In nazca to declare the getter, you should use `<` 
operator at the beginnings, for the setter, use `>`. Let's see another example, where we get and set the variable.
Please replace the content of the `include.nazca` with this code:
```javascript
class HelloWorld < div {
    text: Hello world;
    text-align: center;
    margin-top: 50px;

    constructor: () {
        who = 'Doggy';
        console.log(who);
    };

    >who: (value) {
        text = `Hello ${value}`;
    };
    <who: () {
        let who = /^Hello (.+)/;
        return who;
    };
};
``` 

#### Hierarchy manipulation
You can predefine the class hierarchy, which then will be transformed into HTML DOM. This is a preferred method, but 
sometimes you want to manipulate it on the go. For example you want your class generate children, based on the input 
parameters. To do it, special property of nazca object is used, called `children`. It has 2 methods - `add(nazcaObject)`
and `remove(nazcaObject)`. Let's change the `include.nazca`:
```javascript
class Container < div {
};

class Hello < div {
    padding: 5px;
    margin: 5px;
    background-color: #eee;
    display: inline-block;

    text: Hello;
};

class HelloWorld < div {
    -container:;
    -world:;

    constructor: () {
        generate(3);

        setInterval(() => {
            generate(Math.round(Math.random() * 10));
        }, 3000);
    };

    -generate: (n = 1) {
        while (children.length) {
            children.remove(children.at(0));
        }
        if (world) {
            children.remove(world);
        }

        container = new Container();
        children.add(container);

        world = new Hello();
        world.text = 'World';
        children.add(world);

        for (let i=0; i<n; i++) {
            let hello = new Hello();
            container.children.add(hello);
        }
    };
};
```
While nazca interprets the inheritance of the DOM element in for the classes and when you define hierarchy, you can't 
use it directly in the method code like `new div()`. That's why in the example above we declared new `Container` class 
which is a simple div element with no style modified. Then the `Hello` class is created - a simple inline-block div with
the text "Hello" in it.  
`HelloWorld` class now have a special private `generate()` method. It takes the quantity of the `Hello` objects as an 
input parameter and add them as children. As defined in the constructor - every 3 seconds the quantity is randomly 
generated and the children object are removed and added again.

#### Inheritance
All HTML elements in nazca are predefined as classes. For example `<div></div>` can be defined as an object of any class
inherited from `div`, as we did in the example above. Your classes are not necessary are graphical elements and should 
be added to the page, for all other cases they should be inherited from the predefined class.  
The class can be inherited from many other classes with the operator `<`.
```javascript
class grandChild < child < parent < grandParent {
    // ... your code
};
```
In this case, `grandChild` inherits all the protected and public properties and methods from the `grandParent`, then from `parent`, 
then from `child`. While public parameters become public parameters of the `grandChild` and can be used by other objects 
publicly. Protected parameters, inherited are seen only by `grandChild`. Any private parameters of the parent classes 
are never seen to the children.  
The order of the inheritance is important. For example, in the code above, the `parent` has the method `show()` and the 
`child` also has it. On this case the `grandChild` will inherit the method `show()` of the `child`. If we change the 
order like this, it will take the method `show()` of the `parent`
```javascript
class grandChild < parent < child < grandParent {
    // ... your code
};
```
The simple example of the inheritance:
```javascript
class Animal {
    -name: Animal;
    live: () {};
}; 

class Mammal < Amnimal {
    -name: Mammal;
    #canwalk: () {};
    drinkMilk: () {};
};

class Dog < Mammal < Animal {
    -name: Dog;
  
    constructor: () {
        if(canWalk()) {
            drinkMilk();
        }

        live();
    };
    
    bark: () {};
};
```

In this example The class `dog` inherits the method `drinkMilk()` from the ancestor `Mammal` as well as a method 
`live()` from the `Animal`. It also inherits the protected method `canWalk()` from the `Mammal`. The private property 
`name` are used internally by the class and is not inherited in this case.

#### Method inheritance
Sometimes you would want to change the inherited method behavior, but also utilise the old one. To use the parent's 
method, you should use `^` operator.  
Example:
```javascript
class Div < div {
    text-decoration: none;
    color: black;
};

class HelloDoggy < div {
    #element:;

    constructor: () {
        element = new Div();
        element.text = "Hello Doggy";
        children.add(element);
    };

    #decorate: () {
        element['text-decoration'] = 'underline';
    };
};

class HelloWorld < HelloDoggy {
    -anotherElement:;

    constructor: () {
        anotherElement = new Div();
        anotherElement.text = "... and the whole world";
        children.add(anotherElement);

        decorate();
    };

    #decorate: () {
        ^decorate();
        element['color'] = 'chocolate';
        anotherElement['color'] = 'chocolate';
    };

};
```
As you can see in an example above, we override the `decorate()` function of the child class. It uses parent's function,
adding some decoration to it. Because `HelloWorld` is the child, the constructor of the parent is called first. The 
`element` of the class `Div` is added a a child of an object with the text "Hello Doggy". The child class also adds 
another `Div` to the page with the text "... and the whole world". Old `decorate()` just added underline for it, while 
the new one uses the functionality of the old one and adds a new functionality - it makes both objects of the chocolate
color.
 
#### Data from the server
When you are developing the web application you need a way to communicate between your server and a user's browser. 
You can do it with AJAX, but sometime you need a simple way to generate a static content on the page. Before nazca 
for this purpose you could use a template engine to render server data into the page. It could be Jade (Pug), Mustache 
or some other engine you get used to.  
Nazca creates the static client-side code and it has no templating abilities.      
However you may need to pass the data from the server to the page initially. To do this, a special directive used.  
You should use `*json <name> = <path>;`. It will load the json from the `path` url into the global variable named 
`name`. The global object has `ready()` function that accept a callback. Every callback will be called, when the json 
is loaded.    
Let's see an example. Create a simple json file available under `www/data.json`: 
 ```json
{
  "text": "Hello World",
  "color": "crimson"
}
```
Change your `include.nzca`:
```javascript
*json: serverData = data.json;

class HelloWorld < div {
    text:;
    color:;

    constructor: () {
        window.serverData.ready(() => {
            text = window.serverData.text;
            color = window.serverData.color;
        });
    };
};
```
In example above the json is a static file, but it can be generated by the server every time. You can change the text 
or the color inside the json and see how your resulting page changes.

#### Font-face directive
Because of the syntax difference the 
<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule" target="_blank">at-rules</a> are not possible to 
implement in nazca. Most of them can be handled inside the methods as JavaScript would do.  
For the font-face, special `*font-face` 
directive could be used. As the value you should use an object with the syntax defined by 
<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face" target="_blank">@font-face</a> rule.
For this example to work, you should download 
<a href="https://raw.githubusercontent.com/Qinti/nazca/master/grandstander.woff2" download>this font file</a> and put it
inside your generated `www` folder.  
(<a href="https://github.com/Etcetera-Type-Co/Grandstander/blob/master/OFL.txt" target="_blank">font file license</a>)
```javascript
*json: serverData = data.json;
*font-face: {
    font-family: Hello Font;
    src: url("/www/grandstander.woff2") format("woff2");
};

class HelloWorld < div {
    text:;
    color:;
    font-family: Hello Font;

    constructor: () {
        window.serverData.ready(() => {
            text = window.serverData.text;
            color = window.serverData.color;
        });
    };
};
``` 

#### Object states
One thing inherited from the CSS are the object states, called 
<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes" target="_blank">pseudo-classes</a>. In nazca 
you can have a special proerty of the class, defined with prefix `:`. Compiler will generate a pseudo-class inside your 
css file. States should be CSS-only objects, which means they could only have CSS properties, no custom properties or 
methods should used, as the content of your `*font-face` directive is written "as is" in the resulting `*.css` file 
```javascript
class Link < a {
    display: block;
    margin-top: 10px;

    :visited: {
        color: blue;
    };
};

class HelloWorld < div {
    .a {
        $href: #link1;
        text: Click me and see how your browser shows visited links;
    };

    .Link {
        $href: #link2;
        text: Click me and see how 'visited' state sets the color to blue;
    };
};
```

#### Conclusion note
Nazca is a very new project that could not reach it's full potential yet. While it covers all of HTML generation and you 
could write any JavaScript inside the methods, it still could miss CSS features you need. In this case you can use a 
little hack with including raw css in your `*.nazca`. 
```javascript
.html {
    .head {
        .link {
            $rel: stylesheet;
            $type: text/css;
            $href: url_to_your_css;
        };
    };
};
``` 
It is not recommended to mix raw css and nazca, but in case nazca does not have some feature required by you, please 
create an issue on github and while it is going to be implemented, include your custom CSS like this.