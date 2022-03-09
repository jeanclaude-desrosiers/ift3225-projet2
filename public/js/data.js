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

    /**
     * 
     * @param {object} api_obj object returned by the ConceptNet API
     */
    constructor(api_obj) {
        if (api_obj) {
            this.id = api_obj['@id'].split('/').pop();
            this.lang = api_obj.language;
            this.name = api_obj.label;
        }
    }

    /**
     * Full id as in, '/c/en/example', not just 'example'
     * @type {string}
     */
    get full_id() {
        return `/c/${this.lang}/${this.id}`;
    }

    /**
     * 
     * @param {object} json_obj 
     * 
     * @return {Concept}
     */
    static from_json(json_obj) {
        let concept_obj = new Concept();

        concept_obj.id = json_obj.id;
        concept_obj.lang = json_obj.lang;
        concept_obj.name = json_obj.name;

        return concept_obj;
    }
}

/**
 * Relates 2 concepts, with direction (start to end)
 */
class Relation {
    /**
     * The 'example' part in '/c/en/example'
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

    /**
     * 
     * @param {object} api_obj object returned by the ConceptNet API
     */
    constructor(api_obj) {
        if (api_obj) {
            this.id = api_obj.rel['@id'].split('/').pop();
            this.name = api_obj.rel.label;

            this.start = new Concept(api_obj.start);
            this.end = new Concept(api_obj.end);
        }
    }

    /**
     * 
     * @param {object} json_obj 
     * @returns {Relation}
     */
    static from_json(json_obj) {
        let relation_obj = new Relation();

        relation_obj.id = json_obj.id;
        relation_obj.name = json_obj.name;

        relation_obj.start = Concept.from_json(json_obj.start);
        relation_obj.end = Concept.from_json(json_obj.end);

        return relation_obj;
    }
}