var assert = require('chai').assert;
var create = require('./../../../bin/helpers/create');
var fs = require("fs");
var fields = (JSON.parse(fs.readFileSync("test/bin/helpers/fields.json", "utf8")));

describe('create', function(){
    describe('createFieldsSchema', function(){
        it('only creates schema for allowed values', function() {

            var schema = create.createFieldsSchema(fields, ['summary', 'components', 'fixVersions', 'description', 'customfield_11490']);

            assert.equal(Object.keys(schema.properties).length, 5);
            assert.property(schema.properties, 'summary');
            assert.property(schema.properties, 'components');
            assert.property(schema.properties, 'fixVersions');
            assert.property(schema.properties, 'description');
            assert.property(schema.properties, 'customfield_11490');
        });

        it('offers only help if there are allowedValues', function() {
            var schema = create.createFieldsSchema(fields, ['summary', 'components', 'fixVersions', 'description', 'customfield_11490']);
            assert.notOk(schema.properties.summary.help);
            assert.ok(schema.properties.customfield_11490.help);
            assert.ok(schema.properties.fixVersions.help);
            assert.notOk(schema.properties.description.help);
            assert.ok(schema.properties.components.help);
        });
    });

});