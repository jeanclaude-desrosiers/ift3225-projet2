const STORAGE_KEY = 'relations';

/**
 * 
 * @param {Relation|Relation[]} relations
 */
function save_relations(relations) {
    let existing_relations = load_relations();

    existing_relations.push(relations);

    let to_save = JSON.stringify(existing_relations);
    localStorage.setItem(STORAGE_KEY, to_save);
}

/**
 * @return {Relation[]}
 */
function load_relations() {
    relations_str = localStorage.getItem(STORAGE_KEY);

    if (relations_str) {
        relations_obj = JSON.parse(relations_str);
        return relations_obj.map(Relation.from_json);
    }
    else {
        return [];
    }
}