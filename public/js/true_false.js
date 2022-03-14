/**
 * @type {Timer}
 */
let timer;
/**
 * @type {Element}
 */
let question_p;
/**
 * @type {Element}
 */
let answer_in;
/**
 * @type {Element}
 */
let start_btn;
/**
 * @type {Element}
 */
let try_btn;
/**
 * @type {boolean}
 */
let expected;

document.addEventListener("DOMContentLoaded", () => {
    question_p = document.getElementById('question-p');
    answer_in = document.getElementById('answer-in');
    start_btn = document.getElementById('start-btn');
    try_btn = document.getElementById('try-btn');

    start_btn.setAttribute('disabled', 'true');
    try_btn.setAttribute('disabled', 'true');

    let time_display = document.getElementById('time-display-p');
    timer = new Timer(60, self_timer => {
        let time = self_timer.pretty_print('MM:SS');
        time_display.textContent = time;

        if (self_timer.remaining_seconds == 0) {
            end_game();
        }
    });

    start_btn.addEventListener('click', start_btn_handler);
    try_btn.addEventListener('click', try_btn_handler);
    start_btn.removeAttribute('disabled');
});

function end_game() {
    timer.stop();
    try_btn.setAttribute('disabled', 'true');

    question_p.textContent = '???';

    start_btn.removeAttribute('disabled');
}

function start_btn_handler() {
    start_btn.setAttribute('disabled', 'true');
    timer.clear();

    expected = Math.random() > 0.5;
    console.log(expected);

    let relation_to_guess = load_random_relation();
    let chosen_concept = load_random_concept(concept =>
        (concept.full_id == relation_to_guess.end.full_id) == expected
    );
    relation_to_guess.end = chosen_concept;

    show_relation(relation_to_guess);
    timer.start();
    try_btn.removeAttribute('disabled');
}

function try_btn_handler() {
    let user_guess = answer_in.value.toLowerCase();
    if (expected.toString() == user_guess) {
        Swal.fire(
            'Good job!',
            'That\'s the correct guess',
            'success'
        );

        end_game();
    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'That\'s not it',
            text: 'Sorry, incorrect guess...'
        });
    }
}

/**
 * 
 * @param {Relation} relation 
 */
function show_relation(relation) {
    question_p.textContent =
        `${relation.start.name} ${relation.name} ? ${relation.end.name}`;
}