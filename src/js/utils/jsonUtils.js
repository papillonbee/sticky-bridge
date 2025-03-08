const isValidJson = (jsonString) => {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (e) {
        return false;
    }
}

window.isValidJson = isValidJson;
