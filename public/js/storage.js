/**
 * Saves multiple Relation objects into localStorage.
 * Adds them to the already saved relations
 * 
 * @param {Relation[]} relations the relations to save
 */
function save_relations(relations) {
    relations.forEach(relation =>
        localStorage.setItem(relation.full_id, JSON.stringify(relation))
    );
}

/**
 * Loads all the relations saved into localStorage
 * 
 * @returns {object} a 'full_id' => 'Relation' map object
 */
function load_relations_map() {
    let relations_map = {};

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);

        if (key.startsWith('/a/')) {
            // Parse from string to JSON ...
            relations_map[key] = JSON.parse(localStorage.getItem(key));
            // ... and then from JSON to Relation
            relations_map[key] = Relation.from_json(relations_map[key]);
        }
    }

    return relations_map;
}

/**
 * Loads all the relations saved into localStorage
 * 
 * @return {Relation[]} saved relations, or an empty array
 */
function load_relations() {
    let relations = [];

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);

        if (key.startsWith('/a/')) {
            // Parse from string to JSON ...
            let json_obj = JSON.parse(localStorage.getItem(key));
            // ... and then from JSON to Relation
            relations.push(Relation.from_json(json_obj));
        }
    }

    return relations;
}