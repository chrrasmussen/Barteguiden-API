var mapper = require("object-mapper");
var extend = require("xtend");

var fromDatabaseToPublicMapping = {
    id: { key: "eventID", transform: function (value) { return value.toString(); } },
    title: { key: "title" },
    startAt: { key: "startAt" },
    placeName: { key: "placeName" },
    address: { key: "address" },
    latitude: { key: "latitude" },
    longitude: { key: "longitude" },
    ageLimit: { key: "ageLimit" },
    price: { key: "price" },
    categoryID: { key: "categoryID" },
    description_en: { key: "descriptions", transform: addDescription("en") },
    description_nb: { key: "descriptions", transform: addDescription("nb") },
    isRecommended: { key: "isRecommended" },
    imageURL: { key: "imageURL" },
    eventURL: { key: "eventURL" },
};

var fromDatabaseToAdminMapping = extend(fromDatabaseToPublicMapping, {
    isPublished: { key: "isPublished" },
    externalURL: { key: "externalURL" },
    externalID: { key: "externalID" },
    createdAt: { key: "createdAt" },
    updatedAt: { key: "updatedAt" }
});

var fromAdminToDatabaseMapping = {
    title: { key: "title" },
    startAt: { key: "startAt", transform: convertToDate },
    placeName: { key: "placeName" },
    address:  { key: "address" },
    latitude: { key: "latitude" },
    longitude: { key: "longitude" },
    ageLimit: { key: "ageLimit" },
    price: { key: "price" },
    categoryID: { key: "categoryID" },
    descriptions: [
        { key: "description_en", transform: getDescription("en") },
        { key: "description_nb", transform: getDescription("nb") }
    ],
    isRecommended: { key: "isRecommended" },
    imageURL: { key: "imageURL" },
    eventURL: { key: "eventURL" },
    isPublished: { key: "isPublished" },
    externalURL: { key: "externalURL" },
    externalID: { key: "externalID" }
};

function convertToDate(dateString) {
    return new Date(Date.parse(dateString));
}

function getDescription(language) {
    return function (descriptions) {
        if (!Array.isArray(descriptions)) {
            return null;
        }
        
        for (var i = 0; i < descriptions.length; i++) {
            var description = descriptions[i];
            if (description.language === language) {
                return description.text;
            }
        }
    };
}

function addDescription(language) {
    return function (value, fromObject, toObject) {
        var output = mapper.getKeyValue(toObject, "descriptions") || [];
        if (value) {
            output.push({
                language: language,
                text: value
            });
        }
        
        return output;
    };
}

function cleanUpOutput (output) {
    for (var key in output) {
        var value = output[key];
        if (value === null) {
            delete output[key];
        }
        else if (typeof(value) === "string") {
            output[key] = value.trim().replace(/\s+/g, " "); // TODO: Remove replace() when the iOS-app supports newlines for description
        }
    }
}

module.exports = {
    fromDatabaseToPublic: function (event) {
        return mapper.merge(event, {}, fromDatabaseToPublicMapping);
    },
    
    fromDatabaseToAdmin: function (event) {
        return mapper.merge(event, {}, fromDatabaseToAdminMapping);
    },
    
    fromAdminToDatabase: function (event) {
        var output = mapper.merge(event, {}, fromAdminToDatabaseMapping);
        cleanUpOutput(output);
        return output;
    }
};