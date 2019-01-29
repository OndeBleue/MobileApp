const REFRESH_TIMEOUT = 10000;
const MAXIMUM_POSITION_AGE = 10000;

// based on https://developer.mozilla.org/en-US/docs/Web/API/PositionError
const UNKNOWN_ERROR = 0;
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;
const GEOLOCATION_UNAVAILABLE = 4;

export function handleLocationError(error) {
  switch(error.code) {
    case PERMISSION_DENIED:
      return "Vous devez autoriser la localisation.";
    case POSITION_UNAVAILABLE:
      return "Votre position n'est pas disponible.";
    case TIMEOUT:
      return "Impossible d'obtenir votre position dans un délai raisonnable.";
    case GEOLOCATION_UNAVAILABLE:
      return "Votre navigateur ne supporte pas la géo-localisation.";
    case UNKNOWN_ERROR:
    default:
      return "Une erreur inconnue est survenue.";
  }
}

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(Object.assign(new Error("navigator.geolocation is not available"), { name: "PositionError", code: GEOLOCATION_UNAVAILABLE }));
    }
    navigator.geolocation.getCurrentPosition(resolve, ({ code, message }) =>
        reject(Object.assign(new Error(message), { name: "PositionError", code })),
      {
        enableHighAccuracy: true,
        timeout: REFRESH_TIMEOUT,
        maximumAge: MAXIMUM_POSITION_AGE
      });
  });
}

export function watchLocation(callback) {
  if (!navigator.geolocation) {
    return callback(Object.assign(new Error("navigator.geolocation is not available"), { name: "PositionError", code: GEOLOCATION_UNAVAILABLE }));
  }
  navigator.geolocation.watchPosition(
    (position) => callback(null, position),
    ({ code, message }) =>
    callback(Object.assign(new Error(message), { name: "PositionError", code })),
    {
      enableHighAccuracy: true,
      timeout: REFRESH_TIMEOUT,
      maximumAge: MAXIMUM_POSITION_AGE
    });
}
