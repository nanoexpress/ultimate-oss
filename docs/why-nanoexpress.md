# Why nanoexpress is made

Good question ;)

## Question 1

Q: Why nanoexpress is made if there uWebSockets.js already replacement for Express.js?

A: nanoexpress implements `middleware` layer and these features

- Autodocument with `Swagger`
- Autovalidate with `Ajv`
- Autoserialization with `fast-json-stringify`

Also, `nanoexpress` will be faster, but not in all applications.

Last three features isn't available even on `express` as built-in, but `nanoexpress` gives these features and built-in.

## Question 2

Q: Why `nanoexpress` slower than `express` on my server?

A: First, please, make sure your server has at least 2-cores and you not using any free hosting as these may be limitation, but not limitation of `nanoexpress` nor `uWebSockets.js` itself.

If your logic is slow, try optimize them first, example, your SQL is slow and you call it 10-x in 3 request? Try cache requests as possible

## Question 3

Q: Why there `PRO` premium version?

A: To support project and help author

## Question 4

Q: Is you sponsoring `uWebSockets.js` author from money you got paid?

A: No, currently NO. In future may be changed

## Question 5

Q: Do you trust `uWebSockets.js`

A: yes

## Question 6

Q: Which benefits will get `Sponsors`?

See `Patreon` page for more information
