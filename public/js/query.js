const BASE_URL = 'https://api.conceptnet.io/';
const BOOKMARK_BUFFER_LIMIT = 100;

/**
 * Maps a param object to a query string
 * 
 * E.g.
 * {name : bob, age : 3}
 * to
 * 'name=bob&age=3'
 * 
 * @param {object} param the parameter object
 * 
 * @returns {string} the query string
 */
function param_to_query_str(param) {
    let query_str = '';

    Object.keys(param).forEach(key =>
        query_str += `${key}=${param[key]}&`
    );

    // Do not return the last '&'
    return query_str.length == 0 ?
        '' : query_str.substring(0, query_str.length - 1);
}

/**
 * Maps a query string to a param object
 * 
 * E.g.
 * 'name=bob&age=3'
 * to
 * {name : bob, age : 3}
 * 
 * @param {string} query_str the query string
 * 
 * @returns {object} the parameters object
 */
function query_str_to_param(query_str) {
    let param = {};
    let query_strs = query_str.split('?');
    query_str = query_strs.length == 1 ? query_strs[0] : query_strs[1];

    query_str.split('&').forEach(pair => {
        let key = pair.split('=')[0];
        let value = pair.split('=')[1];

        param[key] = value;
    });

    return param;
}

/**
 * Parses the ConceptNet API response into a list of Relations
 * 
 * @param {object} api_response return value of the query_api function
 * 
 * @returns {Relation[]} the parsed relations, or an empty array
 */
function relations_from_api_response(api_response) {
    if (api_response.edges) {
        return api_response.edges.map(Relation.from_api);
    }
    else {
        return [];
    }
}

/**
 * 
 * @param {string} url 
 * 
 * @returns {Promise} a promise of the parsed JSON response
 */
function get_json(url) {
    // http://ccoenraets.github.io/es6-tutorial-data/promisify/
    if (sessionStorage.getItem(url) != null) {
        // get cached response
        return new Promise(resolve => {
            let cached_response = JSON.parse(sessionStorage.getItem(url));
            resolve(cached_response);
        });
    }
    else {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        })
            .then(response => {
                // caching the response
                sessionStorage.setItem(url, response);
                return response;
            })
            .then(JSON.parse)
            .catch(reason => Swal.fire({
                icon: 'error',
                title: 'HTTP Error',
                text: reason
            }));
    }
}

/**
 * Queries the ConceptNet REST API's query endpoint, with given parameters
 * 
 * @see https://github.com/commonsense/conceptnet5/wiki/API#complex-queries
 * @see https://github.com/commonsense/conceptnet5/wiki/API#overview-of-an-api-response
 * 
 * @param {object} params_map parameters for the query
 * @param {string} params_map.start a URI that the "start" or "subject" position must match
 * @param {string} params_map.end a URI that the "end" or "object" position must match
 * @param {string} params_map.rel a relation
 * @param {string} params_map.node a URI that must match either the start or the end
 * @param {string} params_map.other a URI that must match either the start or the end, and be different from node
 * @param {string} params_map.sources a URI that must match one of the sources of the edge
 * @param {number} params_map.offset pagination offset
 * @param {number} params_map.limit limit the number of results per page
 * 
 * @returns {Promise} a promise of the parsed JSON response
 */
function query_api(params_map) {
    let query_str = param_to_query_str(params_map);
    return get_json(`${BASE_URL}/query?${query_str}`);
}

/**
 * Queries the ConceptNet REST API's uri endpoint, with given parameters
 * 
 * @see https://github.com/commonsense/conceptnet5/wiki/API#getting-the-uri-for-a-phrase
 * @see https://github.com/commonsense/conceptnet5/wiki/API#overview-of-an-api-response
 * 
 * @param {object} params_map parameters for the query
 * @param {object} params_map.text the text
 * @param {object} params_map.language the language this text is in
 * 
 * @returns {Promise<string>} a promise of the parsed '@id' for the concept
 */
function uri_api(params_map) {
    let query_str = param_to_query_str(params_map);
    return get_json(`${BASE_URL}/uri?${query_str}`)
        .then(json_obj => json_obj['@id']);
}

/**
 * Keeps track of ConceptNet query results pagination.
 * This is meant to go forward in the results only
 */
class Bookmark {
    /**
     * @type {object}
     * @see query_api(params_map)
     */
    #params_map;

    /**
     * @type {number}
     */
    #next_offset;

    /**
     * @type {number}
     */
    #limit;

    /**
     * @type {boolean}
     */
    #has_more;

    get has_more() {
        return this.#has_more;
    }

    /**
     * 
     * @param {object} params_map 
     */
    constructor(params_map) {
        this.#params_map = params_map;
        this.#limit = BOOKMARK_BUFFER_LIMIT;
        this.#next_offset = 0;
        this.#has_more = true;
    }

    /**
     * 
     * @returns {Promise<Relation[]>}
     */
    get_more() {
        if (!this.#has_more) {
            return new Promise(resolve => resolve([]));
        }

        this.#params_map.limit = this.#limit;
        this.#params_map.offset = this.#next_offset;

        return query_api(this.#params_map).then(json_obj => {
            let relations = relations_from_api_response(json_obj);

            this.#update_with(json_obj);

            return relations;
        });
    }

    /**
     * Updates pagination information, to reflect the current state of
     * the results given
     * 
     * @param {object} api_response return value of the query_api function
     */
    #update_with(api_response) {
        if (api_response.view && api_response.view.nextPage) {
            let next_page_id = api_response.view.nextPage;
            let next_page_param = query_str_to_param(next_page_id);

            this.#next_offset = parseInt(next_page_param.offset);
            this.#limit = parseInt(next_page_param.limit);
            this.#has_more = true;
        }
        else {
            this.#has_more = false;
        }
    }
}

class PaginatedQuery {
    /**
     * @type {Relation[]}
     */
    #relations;

    /**
     * @type {number}
     */
    #current_page;

    get current_page() {
        return this.#current_page;
    }

    /**
     * @type {number}
     */
    #results_per_page;

    get results_per_page() {
        return this.#results_per_page;
    }

    /**
     * @param {number} new_results_per_page 
     */
    set results_per_page(new_results_per_page) {
        this.#results_per_page = new_results_per_page;
        /*
         * ensure the new offset is the largest multiple of
         * the new limit, smaller than the old offset
         */
        this.current_offset =
            Math.floor(this.#current_page / this.#results_per_page) * this.#results_per_page;
    }

    get has_previous_page() {
        return this.#current_page > 0;
    }

    get is_current_page_full() {
        return this.#relations.length >= (this.#current_page + 1) * this.#results_per_page;
    }

    get has_next_page() {
        return (this.#relations.length > (this.#current_page + 1) * this.#results_per_page)
            || (this.#bookmarks.some(bookmark => bookmark.has_more));
    }

    /**
     * @type {Bookmark[]}
     */
    #bookmarks;

    /**
     * 
     * @param {object[]} params_maps 
     * @param {number} results_per_page 
     */
    constructor(params_maps, results_per_page) {
        this.#results_per_page = Math.max(1, results_per_page);
        this.#current_page = 0;
        this.#relations = [];
        this.#bookmarks = params_maps.map(param_map => new Bookmark(param_map));
    }

    /**
     * 
     * @returns {Relation[]}
     */
    go_to_previous_page() {
        if (this.has_previous_page) {
            this.#current_page--;
        }

        return this.get_current_page();
    }

    /**
     * 
     * @returns {Promise<Relation[]>}
     */
    get_current_page() {
        return this.#fill_current_page().then(() => {
            let start = this.#current_page * this.#results_per_page;
            let end = (this.#current_page + 1) * this.#results_per_page;

            // last page could be incomplete, we don't want an index out of bounds
            end = Math.min(end, this.#relations.length);

            return this.#relations.slice(start, end);
        });
    }

    /**
     * 
     * @returns {Promise<Relation[]>}
     */
    go_to_next_page() {
        if (this.has_next_page) {
            this.#current_page++;
        }

        return this.get_current_page();
    }

    /**
     * 
     * @returns {Promise}
     */
    #fill_current_page() {
        return Promise.all(this.#bookmarks.map(bookmark => bookmark.get_more()))
            .then(relations_arr => {
                this.#relations.push(...relations_arr.flat(1)
                    .filter(Relation.is_french_or_english));

                if (!this.is_current_page_full && this.has_next_page) {
                    return this.#fill_current_page();
                }
                else {
                    return null;
                }
            });
    }
}