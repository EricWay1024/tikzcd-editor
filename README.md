# Drawing commutative diagrams for [Typst](https://typst.app)

**This fork makes it generate
[`typst commute`](https://gitlab.com/giacomogallina/commute) code instead of
LaTeX!!!**

Try it [here](https://tikzcd-typst-editor.pages.dev/) or on [https://t.yw.je](https://t.yw.je).

This project is still quite limited as it now only supports the following
arrow types:
- vanilla (i.e. with nothing on it),
- injection,
- surjection,
- definition,
- dashed,
- curved.

But hey, you don't need much more than these to learn abstract nonsense, right...?

LaTeX rendering for labels have been disabled because they usually don't make any sense here for your beautiful, curly-bracket-free Typst code.

(Since I'm too busy learning homological algebra I haven't made a Typst parser for it so obviously the parse button wouldn't work.)

The following comes from the original repo.

---

# tikzcd-editor [![CI](https://github.com/yishn/tikzcd-editor/workflows/CI/badge.svg)](https://github.com/yishn/tikzcd-editor/actions)

A simple visual editor for creating commutative diagrams.

You can
[download the latest release](https://github.com/yishn/tikzcd-editor/releases)
to host it on your own or [try it out here](https://tikzcd.yichuanshen.de/).

![Screenshot](./screenshot.png)

## Building

Make sure you have [Node.js](https://nodejs.org/) and npm installed. First,
clone this repository:

```
$ git clone https://github.com/yishn/tikzcd-editor
$ cd tikzcd-editor
```

Install dependencies with npm:

```
$ npm install
```

You can build by using the `build` command:

```
$ npm run build
```

This will create a minified bundle `bundle.js` and its source map. To launch,
simply open `index.html` in your favorite modern browser.

Use the `watch` command for development:

```
$ npm run watch
```

To create a self-contained archive file ready for distribution, run the
following command:

```
$ npm run dist
```

This will create a folder and a `zip` file in the `dist` folder.

## Contributing

Bug reports and pull requests are always welcome! Please consult the
[issues list](https://github.com/yishn/tikzcd-editor/issues) for existing issues
beforehand.

You can also support this project by [donating](https://paypal.me/yishn/4).

## Donators

A big thanks to these lovely people:

- Jeremy Rouse
- Marko Rodriguez
- Steve Heim
- Max New
- Bingyu Zhang
- Ariella Lee

## Related

- [jsx-tikzcd](https://github.com/yishn/jsx-tikzcd) - Render tikzcd diagrams
  with JSX.
