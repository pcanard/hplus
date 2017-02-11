const express = require('express');
const mongoose = require('mongoose');
const { json, urlencoded } = require('body-parser');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/hplus');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => console.log('connected to db'));

const Input = mongoose.model('Input', new mongoose.Schema({}, { strict: false }));

const inputRouter = express.Router();

inputRouter.route('/inputs')
    .put((req, res, next) => {
        const result = parseInputs(req.body.input);

        const inputs = new Input(result);

        inputs.save((err) => {
            if (err) {
                console.log(' OH MY GOD');
            } else {
                console.log('OKKKKK');
            }
        });
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

const IDENTIFIERS_MAPPING = {
    '@': 'users',
    '@@': 'actions',
    '#': 'places',
    '##': 'colors',
    '%': 'descriptions'
};
const SPECIAL_IDENTIFIERS = orderKeys(Object.keys(IDENTIFIERS_MAPPING));
console.log(SPECIAL_IDENTIFIERS);

function parseInputs(input = '') {
    const x = splitter(input);
    return mapper(x);
}

function orderKeys(keys) {
    return keys.sort((a, b) => a.length < b.length);
}

function mapper(chunks) {
    const dest = {};

    chunks.forEach(chunk => {
        for (const key of SPECIAL_IDENTIFIERS) {
            if (chunk.startsWith(key)) {
                if (!dest[IDENTIFIERS_MAPPING[key]]) {
                    dest[IDENTIFIERS_MAPPING[key]] = [];
                }
                dest[IDENTIFIERS_MAPPING[key]].push(filter(chunk));
                break ;
            }
        }
    });

    return dest;
}

function filter(chunk) {
    const identifier = SPECIAL_IDENTIFIERS.find(identifier => chunk.startsWith(identifier));

    return chunk.substr(identifier.length);
}

function splitter(input) {
    const dest = [];

    for (let i = 0, len = input.length; i < len; i++) {
        if (i === 0 || (i > 0  && input[i - 1] === ' ')) {
            const endInput = input.substr(i);

            const stop = SPECIAL_IDENTIFIERS.some(identifier => {
                return endInput.startsWith(identifier);
            });

            if (stop) {
                dest.push(toNextSplit(endInput));
            }
        }
    }
    return dest;
}

function toNextSplit(input) {
    for (let i = 0, len = input.length; i < len; i++) {
        if (i > 0  && input[i - 1] === ' ') {
            const endInput = input.substr(i);

            const stop = SPECIAL_IDENTIFIERS.some(identifier => {
                return endInput.startsWith(identifier);
            });

            if (stop) {
                return input.substr(0, i -1);
            }
        }
    }
    return input;
}

