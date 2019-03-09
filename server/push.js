const urlSafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');
const fs = require('fs');
const webpush = require('web-push');

webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
    'mailto:e.torrielli@gmail.com',
    vapid.publicKey,
    vapid.privateKey
);

let suscripciones = require('./subs-db');

module.exports.getKey = () => {
    return urlSafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (suscripcion) => {
    suscripciones.push(suscripcion);

    fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones));
};

module.exports.sendPush = (post) => {

    console.log(`Mandando pushes`);

    const notificacionesEnviadas = [];

    suscripciones.forEach((suscripcion, i) => {

        const pushProm = webpush.sendNotification(suscripcion, JSON.stringify(post))
            .then(console.log(`Notificacion enviada`))
            .catch(err => {

                console.log(`Notificacion fallo`);
                if (err.statusCode === 410) {
                    // ya no existe
                    suscripciones[i].borrar = true;
                }
            });

        notificacionesEnviadas.push(pushProm);
    });

    Promise.all(notificacionesEnviadas).then(() => {

        suscripciones = suscripciones.filter(subs => !subs.borrar);
        fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones));

    });
};