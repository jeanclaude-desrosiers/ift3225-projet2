const BASE_URL = 'http://api.conceptnet.io/';

/**
 * Queries the ConceptNet REST API, with given parameters
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
    const REQ = new Request(
        `${BASE_URL}${query_str}`,
        { method: 'GET' }
    );

    // https://fetch.spec.whatwg.org/
    // https://developer.mozilla.org/en-US/docs/Web/API/fetch#examples
    return fetch(REQ)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        });
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