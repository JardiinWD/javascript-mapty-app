'use strict';

//#region Const and Variables 
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//#endregion

//#region Data

// Months
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//#endregion

//#region Geolocation 

// Se localizzazione è attiva
if (navigator.geolocation) {
    // () => la prima arrow è la funzione callback
    // () => La seconda arrow è la funzione che scaturisce l'errore
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Verifico la posizione
            console.log(position);
            // Prendo la latitudine e la longitudine
            const { latitude, longitude } = position.coords
            // Verifico in console
            console.log(latitude, longitude);
            // Verifico su GMaps
            console.log(`https://www.google.it/maps/@${latitude},${longitude}`);
            //////////////////////
            // Leaflet Map
            const coords = [latitude, longitude]
            //'map' => E' l'id del mio DIV
            // 13 => E' lo zoom iniziale
            const map = L.map('map').setView(coords, 13);
            // https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png => Tema della mappa
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            // Marker
            L.marker(coords)
                .addTo(map)
                .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                .openPopup();
        }, () => {
            alert('Non posso prendere la geolocalizzazione')
        })
}

//#endregion
