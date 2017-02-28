servular - A simple HTTP(S) server, aimed for single page apps
==============================================================

Small, compact node server to serve up any local directory. While this is aimed
at single page applications, it can serve up any site big or small.

Usage
-----
To use, servular should be installed globally. It can then serve up any directory
just by running servular in that directory.
```
npm install -g servular
servular [options]
```

Options
-------
`-s` or `--ssl`: Use HTTPS (see --key and --cert)

`-r` or `--redirect`: When using HTTPS, use this flag to redirect HTTP/80 requests to the HTTPS service

`-k` or `--key [file]`: Path to key file (default: key.pem)

`-c` or `--cert [file]`: Path to cert file (default: cert.pem)

`-p` or `--port [number]`: Specify a port (default: 443 with --ssl, otherwise 80)

`-a` or `--address [IP/Name]`: Specify an address to use (default: 0.0.0.0)

`-v` or `--verbose-output`: Output request info to the console

`-d` or `--default [file]`: If requested file cannot be resolved, serve the requested page instead (default: index.html)