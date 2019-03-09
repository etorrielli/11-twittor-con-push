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

const suscripciones = require('./subs-db');

module.exports.getKey = () => {
    return urlSafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (suscripcion) => {
    suscripciones.push(suscripcion);

    fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones));
};

module.exports.sendPush = (post) => {
    suscripciones.forEach((suscripcion, i) => {
        webpush.sendNotification(suscripcion, post.titulo);
    });
};