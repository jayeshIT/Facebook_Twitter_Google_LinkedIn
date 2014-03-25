/**
 * XMLToJS Module 0.1
 *
 * To use:
 * var XMLToJS = require('xmlToJS');
 * var jsObject = XMLToJS.convert(xml);
 *
 * This will take XMl like the following:
 * 
    <atom:feed xmlns:atom="http://www.w3.org/2005/Atom">
        <atom:title>someTitle</atom:title>
        <atom:updated>2012-03-22T15:47:54Z</atom:updated>
        <atom:entry>
            <atom:value>value one</atom:value>
        </atom:entry>
        <atom:entry>
            <atom:value>value two</atom:value>
            <atom:readonly />
        </atom:entry>
        <atom:entry>
            <atom:value>value three</atom:value>
        </atom:entry>
    </atom:feed>
 * 
 * and turn it in to a predictable, easily used form:
 * 
    {
        title: [ 'someTitle' ],
        updated: [ '2012-03-22T15:47:54Z' ],
        entry: [
            { value: [ 'value one' ] },
            { value: [ 'value two' ], readonly: [ null ] },
            { value: [ 'value three' ] }
        ]
    }
 * 
 * Note that nodes always result in arrays, even if there is only a single value inside of them.
 */
var XMLToJS = exports || {};
/**
 * Recursively converts a Titanium XML document or node in to a JSON representation of it.
 */
XMLToJS.convert = function convert(xml) {
    var retVal = {};
 
    function cleanName(name) {
        return name.split(':').join('_');
    }
 
    var attrs = xml.attributes;
    if (attrs && attrs.length) {
        for (var i1 = 0, l1 = attrs.length; i1 < l1; i1++) {
            var attr = attrs.item(i1);
            retVal[cleanName(attr.name)] = attr.getValue();
        }
    }
 
    var nodes = xml.childNodes;
    if (nodes && nodes.length) {
        for (var i2 = 0, l2 = nodes.length; i2 < l2; i2++) {
            var node = nodes.item(i2);
            switch (node.nodeType) {
                case node.ELEMENT_NODE:
                    var name = cleanName(node.nodeName);
                    if (retVal[name] === undefined) {
                        retVal[name] = [];
                    }
                    retVal[name].push(convert(node));
                    break;
                case node.TEXT_NODE:
                    return node.nodeValue;
                    break;
            }
        }
    }
 
    if (!(attrs && attrs.length) && !(nodes && nodes.length)) {
        // empty node
        return null;
    }
 
    return retVal;
};