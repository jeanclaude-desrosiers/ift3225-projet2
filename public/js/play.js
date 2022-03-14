document.addEventListener("DOMContentLoaded", () => {
    let relations = load_relations();
    let relations_table = document.getElementById('relations-table');

    sync_table(relations, relations_table);
});