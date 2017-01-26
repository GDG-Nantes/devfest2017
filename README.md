# Devfest Nantes 2017 Website

![Codeship Status](https://codeship.com/projects/59273070-c606-0134-ef94-5e1bd76d6753/status?branch=ci)

https://devfest2017-d7133.firebaseapp.com/

> Based on [Hoverboard Project](https://github.com/gdg-x/hoverboard)
> Template is brought by [Oleh Zasadnyy](https://plus.google.com/+OlehZasadnyy)
from [GDG Lviv](http://lviv.gdg.org.ua/).

### Setup
:book: [Full documentation](/docs/).

###### Prerequisites

Install [polymer-cli](https://github.com/Polymer/polymer-cli):

    npm i -g polymer-cli

and [Bower](https://bower.io/):

    npm i -g bower

##### Install dependencies

    bower install

##### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app:

    polymer serve

:book: Read more in [setup docs](/docs/tutorials/set-up.md).

##### Docker based development env

If you don't want to bother with the dependencies, you can develop in the docker container.

Build:

    docker build -t hoverboard .

and run:

    docker run -it -v "$PWD":/app -p 8080:8080 hoverboard

:book: Read more in [docker docs](/docs/tutorials/docker.md).

### Build

This command performs HTML, CSS, and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.
The minified files are output to the `build/unbundled` folder, and are suitable
for serving from a HTTP/2+Push compatible server.

In addition the command also creates a fallback `build/bundled` folder,
generated using fragment bundling, suitable for serving from non
H2/push-compatible servers or to clients that do not support H2/Push.

    polymer build

Or you can build in Docker container:

    docker run -v "$PWD":/app hoverboard polymer build

:book: Read more in [deploy docs](/docs/tutorials/deploy.md).
