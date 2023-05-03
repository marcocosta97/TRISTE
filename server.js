var express = require('express');
var serveStatic = require('serve-static');

const PORT = process.env.PORT || 5000;

var app = express();

app.use(serveStatic('.', {
    'index': ['index.html']
}));

app.listen(PORT, function () {
    console.log('Server is running. Point your browser to: http://localhost:' + PORT);
});