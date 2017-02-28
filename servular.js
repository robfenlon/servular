#!/usr/bin/env node
'use strict'

const http = require('http'),
   https = require('https'),
   fs = require('fs'),
   args = require('commander'),
   mimeTypes = require('mime-types'),
   packageJson = require('./package.json');

args
   .version(packageJson.version)
   .option('-s, --ssl', 'Use HTTPS (see --key and --cert)')
   .option('-r, --redirect', 'When using HTTPS, use this flag to redirect HTTP/80 requests to the HTTPS service')
   .option('-k, --key [file]', 'Path to key file [key.pem]', 'key.pem')
   .option('-c, --cert [file]', 'Path to cert file [cert.pem]', 'cert.pem')
   .option('-p, --port [number]', 'Specify a port [443 with --ssl, otherwise 80]')
   .option('-a, --address [IP/Name]', 'Specify an address to use [0.0.0.0]', '0.0.0.0')
   .option('-v, --verbose-output', 'Output request info to the console')
   .option('-d, --default [file]', 'If requested file cannot be resolved, serve the requested page instead [index.html]', 'index.html')
   .parse(process.argv);

const options = args.ssl ?
   {
      key: fs.readFileSync(args.key).toString(),
      cert: fs.readFileSync(args.cert).toString()
   } :
   {},
   port = args.port || (args.ssl ? 443 : 80);

const app = function (req, res) {
   const serveFile = function (requestedResource) {
      try {
         var buffer = fs.readFileSync(requestedResource);
      } catch (err) {
         if (err.code === 'ENOENT') {
            console.error(requestedResource + ' does not exist, serving ' + args.default + ' instead.');
            return serveFile(args.default);
         } else {
            throw err;
         }
      }

      return {
         header: mimeTypes.lookup(requestedResource),
         content: buffer
      };
   };

   if (args.verboseOutput) {
      const date = new Date().toUTCString();
      console.log(date + ' - Request: ' + req.url);
   }

   const requestedResource = req.url.split('?')[0].substring(1) || args.default,
      resource = serveFile(requestedResource);

   res.writeHead(200, { 'Content-Type': resource.header });
   res.write(resource.content);
   res.end();
};

const server = args.ssl ? https.createServer(options, app) : http.createServer(app);

server.listen(port, args.address, function () {
   const prefix = args.ssl ? 'https://' : 'http://';
   return console.log('servular started on ' + prefix + args.address + ':' + port);
});

if (args.ssl && args.redirect) {
   const redirectApp = function (req, res) {
      const host = req.headers.host.split(':')[0];
      const redirectUrl = 'https://' + host + ':' + port + req.url;
      if (args.verboseOutput) {
         const date = new Date().toUTCString();
         console.log(date + ' - Redirect to: ' + redirectUrl);
      }
      res.writeHead(301, { 'Location': redirectUrl });
      res.end();
   }

   http.createServer(redirectApp).listen(80, args.address, function () {
      return console.log('servular redirect started on http://' + args.address + ':80');
   });
}