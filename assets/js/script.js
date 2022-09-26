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

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10) // ID univoco
    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, lng]
        this.distance = distance // in KM
        this.duration = duration // in Min
    }
}
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence
        this.calcPace()
    }
    calcPace() {
        // min/km
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain
        this.calcSpeed()
    }
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}

/* const run1 = new Running([39, -12], 5.2, 24, 178)
const cycle1 = new Cycling([39, -12], 27, 95, 525)
console.log(run1);
console.log(cycle1); */

///////////////////
// Application Architecture
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
        // Funzione per Input Validi
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        // Funzione per Verifica dei numeri Positivi
        const allPositive = (...inputs) => inputs.every(inp => inp > 0)
        e.preventDefault() // Prevengo Refresh al Click

        // Prendi dati dal Form
        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value

        // Controlli se dati sono validi

        // Controlla se Workout è Ciclismo o corsa
        if (type === 'running') {
            const cadence = +inputCadence.value
            // Controlli se dati sono validi
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert('Inputs have to be positive numbers!')
        }

        if (type === 'cycling') {
            const elevation = +inputElevation.value
            // Controlli se dati sono validi
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert('Inputs have to be positive numbers!')
        }



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
        })).setPopupContent('Workout').openPopup();

        // Pulizia di tutti i campi
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
    }
}
// Generazione istanza di App
const app = new App()

//#endregion

//#region Data

// Months
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//#endregion


