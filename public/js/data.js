/**
 * A single concept which may be related to other concepts
 */
class Concept {
    /**
     * The 'example' part in '/c/en/example'
     * @type {string}
     */
    id;

    /**
     * language, 'en' or 'fr'
     * @type {string}
     */
    lang;

    /**
     * Human-readable name. E.g. 'Blue cat' instead of 'blue_cat'
     * @type {string}
     */
    name;

    constructor() { }

    /**
     * Full id as in, '/c/en/example', not just 'example'
     * @type {string}
     */
    get full_id() {
        return `/c/${this.lang}/${this.id}`;
    }

    /**
     * Parses a JSON object into a new Concept object
     * 
     * @param {object} json_obj 
     * 
     * @return {Concept} parsed Concept
     */
    static from_json(json_obj) {
        let concept_obj = new Concept();

        concept_obj.id = json_obj.id;
        concept_obj.lang = json_obj.lang;
        concept_obj.name = json_obj.name;

        return concept_obj;
    }

    /**
     * Parses an object from the response from the ConceptNet REST API
     * 
     * @param {object} api_obj the 'concept' part of an edge, in an API response
     * 
     * @returns {Concept} parsed Concept
     */
    static from_api(api_obj) {
        let concept_obj = new Concept();

        concept_obj.id = api_obj['term'].split('/').pop();
        concept_obj.lang = api_obj.language;
        concept_obj.name = api_obj.label;

        return concept_obj;
    }
}

/**
 * Relates 2 concepts, with direction (start to end)
 */
class Relation {
    /**
     * The 'Synonym' part in '/r/Synonym'
     * @type {string}
     */
    id;

    /**
     * Human-readable name. E.g. 'Blue cat' instead of 'blue_cat'
     * @type {string}
     */
    name;

    /**
     * @type {Concept}
     */
    start;

    /**
     * @type {Concept}
     */
    end;

    constructor() { }

    /**
     * @type {string}
     */
    get full_id() {
        return `/a/[/r/${this.id}/,${this.start.full_id}/,${this.end.full_id}/]`;
    }

    /**
     * @type {string}
     */
    get short_id() {
        return `/r/${this.id}`;
    }

    /**
     * 
     * @param {Relation} relation 
     * @returns {boolean}
     */
    static is_french_or_english(relation) {
        return [relation.start.lang, relation.end.lang]
            .every(lang => lang == 'en' || lang == 'fr');
    }

    /**
     * Parses a JSON object into a new Relation object
     * 
     * @param {object} json_obj 
     * 
     * @return {Relation} parsed Relation
     */
    static from_json(json_obj) {
        let relation_obj = new Relation();

        relation_obj.id = json_obj.id;
        relation_obj.name = json_obj.name;

        relation_obj.start = Concept.from_json(json_obj.start);
        relation_obj.end = Concept.from_json(json_obj.end);

        return relation_obj;
    }

    /**
     * Parses an object from the response from the ConceptNet REST API
     * 
     * @param {object} api_obj the 'rel' part of an edge, in an API response
     * 
     * @returns {Relation} parsed Concept
     */
    static from_api(api_obj) {
        let relation_obj = new Relation();

        relation_obj.id = api_obj.rel['@id'].split('/').pop();
        relation_obj.name = api_obj.rel.label;

        relation_obj.start = Concept.from_api(api_obj.start);
        relation_obj.end = Concept.from_api(api_obj.end);

        return relation_obj
    }
}

function get_table_headers() {
    let ths = ['Start', 'Start (lang)', 'Relation', 'End', 'End (lang)'].map(label => {
        let th = document.createElement('th');
        th.textContent = label;

        return th;
    });

    let tr = document.createElement('tr');
    ths.forEach(th => tr.append(th));

    let thead = document.createElement('thead');
    thead.append(tr);

    return thead;
}


/**
 * 
 * @param {Relation[]} relations 
 * @param {Element} table 
 */
function sync_table(relations, table) {
    table.innerHTML = '';

    table.append(get_table_headers())
    let tbody = document.createElement('tbody');
    table.append(tbody);

    relations.forEach(relation => {
        let tds = [relation.start.name, relation.start.lang,
        relation.name, relation.end.name, relation.end.lang]
            .map(label => {
                let td = document.createElement('td');
                td.textContent = label;

                return td;
            });

        let tr = document.createElement('tr');
        tds.forEach(td => tr.append(td));

        tbody.append(tr);
    });
}