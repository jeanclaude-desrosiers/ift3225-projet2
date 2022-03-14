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

let points = 0;

/**
 * @type {Concept[]}
 */
let valid_answers = [];


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

    Swal.fire(
        `Wow, you made ${points} point(s)`,
        `Remaining valid answers were : ${valid_answers.map(concept => concept.name)}`,
        'success'
    );
    points = 0;
}

function start_btn_handler() {
    start_btn.setAttribute('disabled', 'true');
    timer.clear();

    let relation_to_guess = load_random_relation();
    valid_answers = load_concepts(concept =>
        concept.full_id == relation_to_guess.end.full_id
    );

    console.log(relation_to_guess);

    show_relation(relation_to_guess);

    timer.start();
    try_btn.removeAttribute('disabled');
}

function try_btn_handler() {
    let user_guess = answer_in.value.toLowerCase();
    let found_index = valid_answers.findIndex(concept =>
        concept.name.toLowerCase() == user_guess
    );

    if (found_index >= 0) {
        Swal.fire(
            'Good job!',
            'That\'s a correct guess',
            'success'
        );
        points++;

        valid_answers.splice(found_index, 1);
    }
    else {
        Swal.fire({
            icon: 'error',
            title: 'That\'s not it',
            text: 'Sorry, incorrect guess...'
        });
    }

    answer_in.value = '';
}

/**
 * 
 * @param {Relation} relation 
 */
function show_relation(relation) {
    question_p.textContent =
        `${relation.start.name} ${relation.name} ?`;
}