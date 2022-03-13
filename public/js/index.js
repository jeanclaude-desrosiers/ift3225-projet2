// https://caniuse.com/es6

/**
 * @type {PaginatedQuery}
 */
let paginated_query;
/**
 * @type {Element}
 */
let prev_btn;
/**
 * @type {Element}
 */
let next_btn;
/**
 * @type {Element}
 */
let search_btn;
/**
 * @type {Element}
 */
let relations_table;


function disable_btns() {
    [search_btn, prev_btn, next_btn]
        .forEach(btn => btn.setAttribute('disabled', 'true'));
}

function update_btns() {
    search_btn.removeAttribute('disabled');

    paginated_query.has_previous_page ?
        prev_btn.removeAttribute('disabled') :
        prev_btn.setAttribute('disabled', 'true');
    paginated_query.has_next_page ?
        next_btn.removeAttribute('disabled') :
        next_btn.setAttribute('disabled', 'true');
}

document.addEventListener("DOMContentLoaded", () => {
    relations_table = document.getElementById('relations-table');
    prev_btn = document.getElementById('prev-btn');
    next_btn = document.getElementById('next-btn');
    search_btn = document.getElementById('search-btn');

    disable_btns();
    search_btn.removeAttribute('disabled');

    sync_table([], relations_table);

    prev_btn.addEventListener('click', prev_btn_handler);
    next_btn.addEventListener('click', next_btn_handler);
    search_btn.addEventListener('click', search_btn_handler);
});

function search_btn_handler() {
    disable_btns();

    let concept_name = document.getElementById('concept-in').value;
    let rel_name = document.getElementById('relation-in').value;

    let concepts = [
        Concept.from_json({ id: concept_name, lang: 'en' }),
        Concept.from_json({ id: concept_name, lang: 'fr' })
    ];

    let relation = new Relation();
    relation.id = rel_name;

    let params_maps = concepts.map(concept => {
        let param_map = {
            node: concept.full_id,
        };

        if (rel_name) {
            param_map['rel'] = relation.short_id;
        }

        return param_map
    });

    paginated_query = new PaginatedQuery(params_maps, 50);

    paginated_query.get_current_page().then(relations => {
        sync_table(relations, relations_table);
        update_btns();
    });
}

function next_btn_handler() {
    disable_btns();

    paginated_query.go_to_next_page().then(relations => {
        sync_table(relations, relations_table);
        update_btns();
    });
}

function prev_btn_handler() {
    disable_btns();

    paginated_query.go_to_previous_page().then(relations => {
        sync_table(relations, relations_table);
        update_btns();
    });
}