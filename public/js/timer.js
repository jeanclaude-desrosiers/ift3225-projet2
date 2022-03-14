/**
 * Timer precision, in milliseconds.
 * Ideally a factor of 1000
 * 
 * @type {number}
 */
const TIMER_PRECISION = 20;

class Timer {
    /**
     * In milliseconds
     * @type {number}
     */
    #start_time;

    get start_seconds() {
        return Math.floor(this.#start_time / 1000);
    }

    /**
     * In milliseconds
     * @type {number}
     */
    #rem_time;

    get remaining_seconds() {
        return Math.floor(this.#rem_time / 1000);
    }

    /**
     * @type {number}
     */
    #interval_id;

    /**
     * @type {(t : Timer) => void}
     */
    #on_update;

    /**
     * 
     * @param {number} start_time number of seconds the timer starts with
     * @param {(t : Timer) => void} on_update event handler
     */
    constructor(start_time, on_update) {
        this.#start_time = Math.max(0, Math.floor(start_time)) * 1000;
        this.#on_update = on_update;
        this.clear();
    }

    start() {
        this.#interval_id = setInterval(() => {
            this.#rem_time -= TIMER_PRECISION;
            if (this.#rem_time <= 0) {
                clearInterval(this.#interval_id);
            }

            this.#on_update(this);
        }, TIMER_PRECISION);
    }

    stop() {
        if (this.#interval_id) {
            clearInterval(this.#interval_id);
        }
    }

    clear() {
        this.stop();
        this.#rem_time = this.#start_time;
        this.#interval_id = 0;

        this.#on_update(this);
    }

    /**
     * 
     * @param {string} format 'HH', 'MM', 'SS' separated by ':'
     */
    pretty_print(format) {
        let rem_time = this.remaining_seconds;

        let seconds = rem_time % (60 ** 1);
        rem_time -= seconds;

        let minutes = (rem_time % (60 ** 2)) / (60 ** 1);
        rem_time -= minutes * 60;

        let hours = rem_time / (60 ** 2);

        return format.split(':').map(flag => {
            switch (flag) {
                case 'HH':
                    return hours.toString().padStart(2, '0');
                case 'MM':
                    return minutes.toString().padStart(2, '0');
                case 'SS':
                    return seconds.toString().padStart(2, '0');
                default:
                    return '##';
            }
        }).join(':');
    }
}