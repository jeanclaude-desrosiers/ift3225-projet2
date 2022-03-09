// https://caniuse.com/es6

console.log(load_relations());
console.log(load_relations()[0].start.full_id);

api_obj = {
    "@id": "/a/[/r/UsedFor/,/c/en/example/,/c/en/explain/]",
    "dataset": "/d/conceptnet/4/en",
    "end": {
        "@id": "/c/en/explain",
        "label": "explain something",
        "language": "en",
        "term": "/c/en/explain"
    },
    "license": "cc:by/4.0",
    "rel": {
        "@id": "/r/UsedFor",
        "label": "UsedFor"
    },
    "sources": [
        {
            "activity": "/s/activity/omcs/omcs1_possibly_free_text",
            "contributor": "/s/contributor/omcs/pavlos"
        }
    ],
    "start": {
        "@id": "/c/en/example",
        "label": "an example",
        "language": "en",
        "term": "/c/en/example"
    },
    "surfaceText": "You can use [[an example]] to [[explain something]]",
    "weight": 1.0,
    "@context": [
        "//api.conceptnet.io/ld/conceptnet5.7/context.ld.json",
        "//api.conceptnet.io/ld/conceptnet5.7/pagination.ld.json"
    ]
};

let my_rel = new Relation(api_obj);

save_relations(my_rel);