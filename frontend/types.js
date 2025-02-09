

/**
 * @typedef {Object} Hospital
 * @property {string} id
 * @property {string} name
 * @property {number} distance
 * @property {[number, number]} position
 * @property {string} [address]
 * @property {string} [amenity]
 * @property {string} [healthcare]
 * @property {string} [phone]
 */

/**
 * @typedef {Object} OverpassResponse
 * @property {Array<{
 *   id: number,
 *   lat: number,
 *   lon: number,
 *   tags: {
 *     name?: string,
 *     amenity?: string,
 *     healthcare?: string,
 *     'addr:street'?: string,
 *     'addr:housenumber'?: string,
 *     'addr:postcode'?: string,
 *     'addr:city'?: string,
 *     phone?: string
 *   }
 * }>} elements
 */
export default type;