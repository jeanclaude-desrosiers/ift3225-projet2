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
 * @param {(relation : Relation) => boolean} filter optional
 * 
 * @return {Relation[]} saved relations, or an empty array
 */
function load_relations(filter) {
    let relations = [];

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);

        if (key.startsWith('/a/')) {
            // Parse from string to JSON ...
            let json_obj = JSON.parse(localStorage.getItem(key));
            // ... and then from JSON to Relation
            let relation = Relation.from_json(json_obj);
            if (!filter || filter(relation)) {
                relations.push(relation);
            }
        }
    }

    return relations;
}

/**
 * Loads a relation saved into localStorage
 * 
 * @param {(relation : Relation) => boolean} filter optional
 * 
 * @return {Relation|null} saved relation, or null
 */
function load_random_relation(filter) {
    let relations = load_relations(filter);

    if (relations.length) {
        return relations[Math.floor(Math.random() * relations.length)];
    } else {
        return null;
    }
}

/**
 * Loads all the concepts saved into localStorage
 * 
 * @param {(concept : Concept) => boolean} filter optional
 * 
 * @return {Concept[]} saved concepts, or an empty array
 */
function load_concepts(filter) {
    let relations = load_relations();
    let concepts_map = new Map();

    relations.forEach(relation =>
        [relation.start, relation.end].forEach(concept => {
            if (!filter || filter(concept)) {
                concepts_map.set(concept.full_id, concept);
            }
        })
    );

    let concepts = [];
    for (const value of concepts_map.values()) {
        concepts.push(value)
    }

    return concepts
}

/**
 * Loads a concept saved into localStorage
 * 
 * @param {(concept : Concept) => boolean} filter optional
 * 
 * @return {Concept} saved concept, or null
 */
function load_random_concept(filter) {
    let concepts = load_concepts(filter);

    if (concepts.length) {
        return concepts[Math.floor(Math.random() * concepts.length)];
    } else {
        return null;
    }
}