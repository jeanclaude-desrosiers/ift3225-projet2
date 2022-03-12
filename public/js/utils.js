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
    let query_str = '/query?';

    Object.keys(param).forEach(key =>
        query_str += `${key}=${param[key]}&`
    );

    // Do not return the last '&' or '?'
    return query_str.substring(0, query_str.length - 1);
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
    query_str = query_str.split('?')[1];

    query_str.split('&').forEach(pair => {
        let key, value = pair.split('=');

        param[key] = value;
    });

    return param;
}