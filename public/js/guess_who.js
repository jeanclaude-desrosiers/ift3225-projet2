/**
 * @type {Timer}
 */
let timer;
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
 * @type {Element}
 */
let clues_ul;

/**
 * @type {Concept}
 */
let concept_to_guess;

/**
 * @type {Relation[]}
 */
let clues;

let points = 8;


document.addEventListener("DOMContentLoaded", () => {
    answer_in = document.getElementById('answer-in');
    start_btn = document.getElementById('start-btn');
    try_btn = document.getElementById('try-btn');
    clues_ul = document.getElementById('clues-ul');

    start_btn.setAttribute('disabled', 'true');
    try_btn.setAttribute('disabled', 'true');

    let time_display = document.getElementById('time-display-p');
    timer = new Timer(2 * 60, self_timer => {
        let time = self_timer.pretty_print('MM:SS');
        time_display.textContent = time;


        if (self_timer.remaining_seconds == 0) {
            end_game();
        }
        else if (self_timer.remaining_seconds != self_timer.start_seconds &&
            self_timer.remaining_seconds % 20 == 0) {
            if ((self_timer.remaining_seconds / 20) < clues.length) {
                add_clue(clues[self_timer.remaining_seconds / 20]);
            }
            else {
                // no more clues left
                end_game();
            }
        }
    });

    start_btn.addEventListener('click', start_btn_handler);
    try_btn.addEventListener('click', try_btn_handler);
    start_btn.removeAttribute('disabled');
});

/**
 * 
 * @param {Relation} relation 
 */
function add_clue(relation) {
    points--;
    let clue;

    if (relation.start == null) {
        clue = `??? ${relation.name} ${relation.end.name}`;
    }
    else {
        clue = `${relation.start.name} ${relation.name} ???`;
    }

    let li = document.createElement('li');
    li.textContent = clue;

    clues_ul.append(li);
}

function end_game() {
    timer.stop();
    try_btn.setAttribute('disabled', 'true');

    start_btn.removeAttribute('disabled');

    Swal.fire(
        `Wow, you made ${points} point(s)`,
        'Impressive...',
        'success'
    );

    clues_ul.innerHTML = '';

    points = 8;
}

function start_btn_handler() {
    start_btn.setAttribute('disabled', 'true');
    timer.clear();

    concept_to_guess = load_random_concept();

    clues = load_relations(relation =>
        relation.start.full_id == concept_to_guess.full_id ||
        relation.end.full_id == concept_to_guess.full_id
    ).map(relation => {
        if (relation.start.full_id == concept_to_guess.full_id) {
            relation.start == null;
        }
        else {
            relation.end == null;
        }

        return relation;
    });

    console.log(concept_to_guess);
    console.log(clues);


    timer.start();
    add_clue(clues[0]);
    try_btn.removeAttribute('disabled');
}

function try_btn_handler() {
    let user_guess = answer_in.value.toLowerCase();

    if (concept_to_guess.name.toLowerCase() == user_guess) {
        Swal.fire(
            'Good job!',
            'That\'s a correct guess',
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

    answer_in.value = '';
}