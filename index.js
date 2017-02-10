const express = require('express');
const mongoose = require('mongoose');
const { json, urlencoded } = require('body-parser');

mongoose.connect('mongodb://localhost/hplus');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log('connected to db')
});

const inputRouter = express.Router()

inputRouter.route('/inputs')
    .put((req, res, next) => {
        const result = parseInputs(req.body.input);

        res.json(result);
    })
    .get((req, res, next) => {
        const result = parseInputs(req.query.input);

        res.json(result);
    });

const app = express()
    .use(json({ limit: '50mb' }))
    .use(urlencoded({ extended: false }))
    .use(inputRouter)
    .use((req, res, next) => {
        res.send('salut pierre');
    })
    .listen(3000, () => {
        console.log('Server started');
    });

function parseInputs(input = '') {
    const chunks = input.split(' ');
    const res = {};

    chunks.forEach(chunks => {
        switch (chunks.substring(0, 1)) {
            case '@': {
                const content = chunks.substring(1);
                if (!res.peoples) {
                    res.peoples = [content]
                } else {
                    res.peoples.push(content);
                }
                break;
            }
            case '#': {
                const content = chunks.substring(1);
                if (!res.places) {
                    res.places = [content]
                } else {
                    res.places.push(content);
                }
                break;
            }
        }
    });

    return res;
}
