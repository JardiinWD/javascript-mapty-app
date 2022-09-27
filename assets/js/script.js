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
    clicks = 0;

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, lng]
        this.distance = distance // in KM
        this.duration = duration // in Min
    }
    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    click() {
        this.clicks++;
    }
}
class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence
        this.calcPace()
        this._setDescription() // Set del metodo setDescription
    }
    calcPace() {
        // min/km
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain
        this.calcSpeed()
        this._setDescription() // Set del metodo setDescription
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
    #workouts = []
    #mapZoomLevel = 13
    // Constructor di App
    constructor() {
        // Invoke del metodo Position
        // Non soffre di innalzamento
        this._getPosition()
        // Get data from local storage
        this._getLocalStorage();
        // Evento al submit
        form.addEventListener('submit', this._newWorkout.bind(this))
        // Selezione e cambio dell'input
        inputType.addEventListener('change', this._toggleElevationField)
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
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
    // Caricamento Mappa
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
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
        // console.log(map);
        // https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png => Tema della mappa
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Metodo di leaflet     
        this.#map.on('click', this._showForm.bind(this))
        // Ciclo sull'array di Workouts
        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        });
    }
    // Metodo per mostrare il form
    _showForm(mapE) {
        this.#mapEvent = mapE
        // Rimozione classe Hidden dal Form
        form.classList.remove('hidden')
        inputDistance.focus()
        // console.log(mapEvent);
    }
    // Metodo per nascondere form
    _hideForm() {
        // Svuotare Inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
        form.style.display = 'none'
        form.classList.add('hidden')
        // Il form deve comunque riprendere il display Grid dopo 1sec
        setTimeout(() => (form.style.display = 'grid'), 1000)
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
        // Eseguo destructuring per la mia latitudine
        // e longitudine presente in latlng
        const { lat, lng } = this.#mapEvent.latlng
        let workout;
        // Controlli se dati sono validi

        // Controlla se Workout è Ciclismo o corsa
        if (type === 'running') {
            const cadence = +inputCadence.value
            // Controlli se dati sono validi
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) return alert('Inputs have to be positive numbers!')
            workout = new Running([lat, lng], distance, duration, cadence)
        }
        // Push del Workout per bici
        this.#workouts.push(workout)


        if (type === 'cycling') {
            const elevation = +inputElevation.value
            // Controlli se dati sono validi
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert('Inputs have to be positive numbers!')
            workout = new Cycling([lat, lng], distance, duration, elevation)
        }
        // Push del Workout per bici
        this.#workouts.push(workout)

        // Marker che si sposta al click
        this._renderWorkoutMarker(workout)
        // con le coordinate prese dal destructuring di mapEvent.latlng
        this._renderWorkout(workout)


        // Pulizia di tutti i campi
        this._hideForm()
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false, // Rimozione chiusura
            closeOnClick: false, // Rimozione chiusura al click
            className: `${workout.type}-popup`,
        }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();
    }

    _renderWorkout(workout) {
        let html =
            `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
            `
        if (workout.type === 'running') {
            html +=
                `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `
        }
        if (workout.type === 'cycling') {
            html +=
                `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `
        }
        form.insertAdjacentHTML('afterend', html)
    }

    // metodo per centrare Mappa
    _moveToPopup(e) {
        if (!this.#map) return;
        const workoutEl = e.target.closest('.workout')
        console.log(workoutEl);
        // Verifica in caso di assenza dell'elemento WorkoutEl
        if (!workoutEl) return
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id)
        console.log(workout);
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            }
        })
    }

    // Set the local Storage
    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    // Get the local Storage
    _getLocalStorage() {
        // Prendo i dati dal local Storage
        const data = JSON.parse(localStorage.getItem('workouts'));
        // Se non presenti verifico con condizione usando un return
        if (!data) return;
        // Se invece fossero presenti vengono salvati nella var #workouts
        this.#workouts = data;
        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        });
    }

    // Reset
    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}
// Generazione istanza di App
const app = new App()

//#endregion



