# werld-client-browser

## Bootstrapping the environment
    $ make

## Development

### Dependencies
- [node.js](http://nodejs.org/)
- [npm](http://npmjs.org/)

### Running the server
    $ make server

After starting the server check out `http://0.0.0.0:9000` on your browser.

### Running the watcher (recompiles build on file changes)
    $ make watch

## Production build
Just pass `NODE_ENV=production` to any of the `make` commands above, e.g.
`NODE_ENV=production make watch`. The production build differs from the
development build in that it has concatenated, minified and compressed assets.

## Author
   [Murilo Pereira](http://murilopereira.com)

## License
   Released under the [MIT license](https://github.com/mpereira/werld-client-browser/blob/master/LICENSE.md).
