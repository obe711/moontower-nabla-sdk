/* eslint-disable no-param-reassign */

function removeEmptyProps(obj) {
  return [...Object.keys(obj)].reduce((acc, prop) => {
    if (obj[prop] === '') return acc;

    return {
      ...acc,
      [prop]: obj[prop],
    };
  }, {});
}

const textSearch = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @param {string} [search] - Search for a string in the fields specified in the searchableFields property
   * @returns {Promise<QueryResult>}
   */
  schema.statics.textSearch = async function (search, options = {}) {
    //const filter = removeEmptyProps(unCheckedFilter);

    // Global Search
    const searchFilter = [...this.searchableFields()].map((field) => {
      return {
        [field]: { $regex: search, $options: 'i' },
      };
    });
    const searchQuery = search ? { $or: searchFilter } : {};

    const countPromise = this.countDocuments({ ...searchQuery }).exec();
    let docsPromise = this.find({ ...searchQuery });

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a, b) => ({ path: b, populate: a }))
        );
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const result = {
        results,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

module.exports = textSearch;