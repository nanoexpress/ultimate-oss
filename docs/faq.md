# FAQ

## Why nanoexpress is made

Good question ;)

This documentation page answers question from [here](https://www.reddit.com/r/node/comments/egpenm/why_would_one_use_nanoexpress_over_just/?utm_source=share&utm_medium=web2x) asked by one of user intered in nanoexpress

## Why nanoexpress is made if there uWebSockets.js already replacement for Express.js

nanoexpress implements `middleware` layer and these features

- Autodocument with `Swagger`
- Autovalidate with `Ajv`
- Autoserialization with `fast-json-stringify`

Also, `nanoexpress` will be faster, but not in all applications.

Last three features isn't available even on `express` as built-in, but `nanoexpress` gives these features and built-in.

## Why `nanoexpress` slower than `express` on my server

First, please, make sure your server has at least 2-cores and you not using any free hosting as these may be limitation, but not limitation of `nanoexpress` nor `uWebSockets.js` itself.

If your logic is slow, try optimize them first, example, your SQL is slow and you call it 10-x in 3 request? Try cache requests as possible

## Why there `PRO` paid version

To support project and help author

## Is you sponsoring `uWebSockets.js` author from money you get paid

No, currently NO

## Do you trust to `uWebSockets.js`

Yes!

## Which benefits will get `Sponsors`

See [Patreon](http://patreon.com/nanoexpress) page for more information
