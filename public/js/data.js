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

    constructor() { }

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

/**
 * Keeps track of ConceptNet query results pagination
 */
class Bookmark {
    /**
     * @type {number}
     */
    current_offset;

    /**
     * @type {number}
     */
    #_limit;

    get limit() {
        return this.#_limit;
    }

    /**
     * @param {number} new_limit 
     */
    set limit(new_limit) {
        this._limit = new_limit;
        /*
         * ensure the new offset is the largest multiple of
         * the new limit, smaller than the old offset
         */
        this.current_offset =
            Math.floor(this.current_offset / this._limit) * this._limit;

        this._has_next = false;
    }

    /**
     * @type {boolean}
     */
    get has_previous() {
        this.current_offset - this.limit >= 0;
    }

    /**
     * @type {boolean}
     */
    #_has_next;

    get has_next() {
        return this._has_next;
    }

    constructor(limit) {
        this._limit = Math.max(1, Math.round(limit));
        this.current_offset = 0;
        this._has_next = false;
    }

    get has_prev_page() {
        return this.previous_offset != NO_OFFSET;
    }

    get has_next_page() {
        return this.next_offset != NO_OFFSET;
    }

    /**
     * Applies the appropriate 'limit' and 'offset' attributes on an existing query,
     * to get the following result page. If there is no next page, the parameters
     * for the current page are applied
     * 
     * @param {object} param existing parameters object
     * 
     * @returns {object} parameters object, with pagination
     */
    apply_next_page(param) {
        param.limit = this.limit;
        param.offset = this.current_offset +
            (this.has_next ? this.limit : 0);

        return param;
    }

    /**
     * Applies the appropriate 'limit' and 'offset' attributes on an existing query,
     * to get the previous result page. If there is no previous page, the parameters
     * for the current page are applied
     * 
     * @param {object} param existing parameters object
     * 
     * @returns {object} parameters object, with pagination
     */
    apply_previous_page(param) {
        param.limit = this.limit;
        param.offset = this.current_offset -
            (this.has_previous ? this.limit : 0);

        return param;
    }

    /**
     * Updates pagination information, to reflect the current state of
     * the results given
     * 
     * @param {object} api_response return value of the query_api function
     */
    update_with(api_response) {
        if (api_response.view) {
            let api_obj = api_response.view;
            current_param = _query_str_to_param(api_obj['@id']);

            this.current_offset = current_param.offset;
            this.limit = current_param.limit
            this._has_next = api_obj.nextPage ? true : false;
        }
        else {
            this.current_offset = 0;
            this._has_next = false;
        }
    }
}