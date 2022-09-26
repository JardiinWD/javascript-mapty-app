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

//#region Class
class App {
    #map; // Proprietà private
    #mapEvent // Proprietà private
    // Constructor di App
    constructor() {
        // Invoke del metodo Position
        // Non soffre di innalzamento
        this._getPosition()
        // Evento al submit
        form.addEventListener('submit', this._newWorkout.bind(this))
        // Selezione e cambio dell'input
        inputType.addEventListener('change', this._toggleElevationField)
    }
    // Methods di App
    _getPosition() {
        // Se localizzazione è attiva
        if (navigator.geolocation) {
            // this._loadMap => va bindata con il .bind per darle accesso al This
            // Altrimenti scatena un errore
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
                alert('Non posso prendere la geolocalizzazione')
            })
        }
    }
    // Caricamento Mapp
    _loadMap(position) {
        // Prendo la latitudine e la longitudine
        const { latitude, longitude } = position.coords
        // Verifico su GMaps
        // console.log(`https://www.google.it/maps/@${latitude},${longitude}`);
        //////////////////////
        // Leaflet Map //
        // Coordinate latitude/longitude salvate in un array
        const coords = [latitude, longitude]
        //'map' => E' l'id del mio DIV
        // 13 => E' lo zoom iniziale
        this.#map = L.map('map').setView(coords, 13);
        // console.log(map);
        // https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png => Tema della mappa
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Metodo di leaflet     
        this.#map.on('click', this._showForm.bind(this))
    }
    // Metodo per mostrare il form
    _showForm(mapE) {
        this.#mapEvent = mapE
        // Rimozione classe Hidden dal Form
        form.classList.remove('hidden')
        inputDistance.focus()
        // console.log(mapEvent);
    }
    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }
    // Metodo per il workout
    _newWorkout(e) {
        e.preventDefault() // Prevengo Refresh al Click
        // Pulizia di tutti i campi
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
        // Eseguo destructuring per la mia latitudine
        // e longitudine presente in latlng
        const { lat, lng } = this.#mapEvent.latlng
        // Marker che si sposta al click
        // con le coordinate prese dal destructuring di mapEvent.latlng
        L.marker([lat, lng]).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false, // Rimozione chiusura
            closeOnClick: false, // Rimozione chiusura al click
            className: 'running-popup',
        }))
            .setPopupContent('Workout')
            .openPopup();
    }
}
// Generazione istanza di App
const app = new App()

//#endregion

//#region Data

// Months
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//#endregion


