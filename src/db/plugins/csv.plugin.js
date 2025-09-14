const CsvBuilder = require('csv-builder');

const csv = (schema, options = {}) => {

  /**
   * CSV from Aggregate
   */
  schema.static("csvAggregate", function (aggregate, staticOptions) {
    const builder = new CsvBuilder({ ...options, ...staticOptions });
    const aggregation = this.aggregate(aggregate).cursor({ batchSize: 1000, useMongooseAggCursor: true });
    return aggregation.pipe(builder.createTransformStream());
  });

  /**
   * CSV from mongoose documents
   * @param {Array<Documents>} docs Array of mongoose documents
   * @return {Stream} Csv read stream.
   */

  schema.static('csvDocsStream', function (docs) {
    if (!docs) {
      throw new Error('[Model].csvReadStream requires an array of documents.');
    }

    const headers = Object.keys(schema.paths).reduce((acc, path) => {
      if (schema.paths[path].options && schema.paths[path].options.private) return acc;
      return [...acc, path];
    }, []);

    const builder = new CsvBuilder({ ...options, headers });
    const data = docs.map(function (obj) {
      return obj._doc;
    });

    return builder.createReadStream(data);
  });
}


module.exports = csv;