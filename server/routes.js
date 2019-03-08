// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();


const mensajes = [

    {
        _id: 'XXX',
        user: 'spiderman',
        mensaje: 'Hola Mundo'
    }

];


// Get mensajes
router.get('/', function (req, res) {
    // res.json('Obteniendo mensajes');
    res.json(mensajes);
});


// Post mensaje
router.post('/', function (req, res) {

    const mensaje = {
        mensaje: req.body.mensaje,
        user: req.body.user
    };

    mensajes.push(mensaje);

    console.log(mensajes);


    res.json({
        ok: true,
        mensaje
    });
});

// Almacenar la suscripcion
router.post('/subscribe', function (req, res) {

    res.json('subscribe');
});

// Almacenar la suscripcion
router.get('/key', function (req, res) {

    res.json('key publico');
});

// Enviar una notificacion push a las personas que nosotros queramos
// Es algo que se controla del lado del SERVER
router.post('/push', function (req, res) {

    res.json('push');
});


module.exports = router;