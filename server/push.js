const urlSafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');
const fs = require('fs');
const webpush = require('web-push');

function setAppPush(app) {

    console.log(`app: ${app}`);

    const vapidAppList = vapid.filter(item => {
        if (item.app === app) {
            return item;
        }
    });

    const vapidApp = vapidAppList[0];

    webpush.setVapidDetails(
        'mailto:e.torrielli@gmail.com',
        vapidApp.publicKey,
        vapidApp.privateKey
    );
}


let suscripciones = require('./subs-db');

module.exports.getKey = (app) => {

    const vapidAppList = vapid.filter(item => {
        if (item.app === app) {
            return item;
        }
    });

    const vapidApp = vapidAppList[0];

    return urlSafeBase64.decode(vapidApp.publicKey);
};

module.exports.addSubscription = (suscripcion) => {
    suscripciones.push(suscripcion);

    fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones));
};

module.exports.sendPush = (post) => {

    console.log(`Mandando pushes`);

    const notificacionesEnviadas = [];

    setAppPush(post.app);


    if (post.usuario != null && post.usuario != undefined && post.usuario !== '' && post.usuario !== 'anonimo') {
        const suscripcionesTemp = suscripciones.filter(item => {
            if (item.usuario === post.usuario) {
                return item;
            }
        });

        suscripcionesTemp.forEach((suscripcion, i) => {
            const pushProm = webpush.sendNotification(suscripcion, JSON.stringify(post))
                .then(console.log(`Notificacion enviada`))
                .catch(err => {

                    console.log(`Notificacion fallo`);
                });
            notificacionesEnviadas.push(pushProm);
        });
    } else {
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
    }

    Promise.all(notificacionesEnviadas).then(() => {

        suscripciones = suscripciones.filter(subs => !subs.borrar);
        fs.writeFileSync(`${ __dirname }/subs-db.json`, JSON.stringify(suscripciones));

    });
}
;