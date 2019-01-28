export function handleLocationError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      return "Vous devez autoriser la localisation.";
    case error.POSITION_UNAVAILABLE:
      return "Votre position n'est pas disponible.";
    case error.TIMEOUT:
      return "Impossible d'obtenir votre position dans un délai raisonnable.";
    case error.GEOLOCATION_UNAVAILABLE:
      return "Votre navigateur ne supporte pas la géo-localisation.";
    case error.UNKNOWN_ERROR:
      return "Une erreur inconnue est survenue.";
  }
}

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(Object.assign(new Error("navigator.geolocation is not available"), { name: "PositionError", code: "GEOLOCATION_UNAVAILABLE" }));
    }
    navigator.geolocation.getCurrentPosition(resolve, ({ code, message }) =>
        reject(Object.assign(new Error(message), { name: "PositionError", code })),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
  });
}
