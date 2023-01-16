const BAUDRATES = [
    110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 256000
];

const $$ = document.querySelectorAll.bind(document);
const $ = document.querySelector.bind(document);

// [ tx, rx ]
const DIRECTION_POSITION = ['end', 'start'];
const DIRECTION_COLOR = ['primary', 'secondary'];
