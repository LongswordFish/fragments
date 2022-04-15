// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const logger = require('../logger');

var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();

const sharp = require('sharp');


// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, type, created, updated, size = 0 }) {

    if (id) {
      this.id = id;
    } else {
      this.id = nanoid();
    }

    if (!ownerId || ownerId.length === 0) {
      throw new Error("Fragment must have an owner ID");
    } else {
      this.ownerId = ownerId;
    }

    if (!type || type.length === 0) {
      throw new Error("Fragment must have a type");
    } else if (!Fragment.isSupportedType(type)) {
      throw new Error("Fragment type not supported");
    } else {
      this.type = type;
    }

    var a = JSON.stringify(new Date);
    if (created == null) {
      this.created = a.substring(1, a.length - 2);
    } else {
      this.created = created;
    }

    if (updated == null) {
      this.updated = a.substring(1, a.length - 2);
    } else {
      this.updated = updated;
    }

    if ("number" !== typeof (size) || size < 0) {
      throw new Error("Size must be a number and can not be a negative number ");
    } else {
      this.size = size;
    }



  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // A user might not have any fragments (yet), so return an empty
    // list instead of an error when there aren't any.
    try {
      logger.debug({ ownerId, expand }, 'Fragment.byUser()');
      const fragments = await listFragments(ownerId, expand);
      return expand ? fragments.map((fragment) => new Fragment(fragment)) : fragments;
    } catch (err) {
      // A user might not have any fragments (yet), so return an empty
      // list instead of an error when there aren't any.
      return [];
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      const returnValue = await readFragment(ownerId, id);
      if (!returnValue) {
        throw new Error("No fragment found");
      }
      return returnValue;
    } catch (err) {
      throw new Error(err);
    }


  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static async delete(ownerId, id) {
    try {
      await deleteFragment(ownerId, id);
    } catch (err) {
      throw new Error(err);
    }

  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    var a = JSON.stringify(new Date);
    this.updated = a.substring(1, a.length - 2);
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    logger.debug('get data');
    return readFragmentData(this.ownerId, this.id);

  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    try {
      if (!data) {
        throw new Error('Data can not be null');
      }
      var a = JSON.stringify(new Date);
      this.updated = a.substring(1, a.length - 2);
      this.size = Buffer.byteLength(data);
      await writeFragment(this);
      return await writeFragmentData(this.ownerId, this.id, data);
    } catch (error) {
      throw new Error(error);
    }

  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    const textTypes = [
      `text/plain`,
      `text/markdown`,
      `text/html`
    ];

    return textTypes.includes(this.mimeType);
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    var array = [];
    array.push(this.mimeType);
    return array;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const validTypes = [
      `text/plain`,
      `text/markdown`,
      `text/html`,
      `application/json`,
      `image/png`,
      `image/jpeg`,
      `image/webp`,
      `image/gif`
    ];

    if (!value || value.length === 0) {
      return false;
    }

    const delimiter = value.indexOf(";");
    var type;

    if (delimiter == -1) {
      type = value;
    } else {
      type = value.substring(0, delimiter);
    }

    if (validTypes.includes(type)) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * Returns true if the fragment can be converted to that ext type
   * @param {string} ext represents a content-type the user wants the fragment data to be 
   * @returns {boolean} true if we support this ext
   */
  isExtSupported(ext) {
    const supportedTypePairs = {
      "text/plain": [".txt"],
      "text/markdown": [".md", ".html", ".txt"],
      "text/html": [".html", ".txt"],
      "application/json": [".json", ".txt"],
      "image/png": [".png", ".jpg", ".webp", ".gif"],
      "image/jpeg": [".png", ".jpg", ".webp", ".gif"],
      "image/webp": [".png", ".jpg", ".webp", ".gif"],
      "image/gif": [".png", ".jpg", ".webp", ".gif"],
    }

    if ("" === ext) {
      return true;
    }

    if (supportedTypePairs[this.mimeType()].includes(ext)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns the data as the ext type
   * @param {string} ext represents a content-type the user wants the fragment data to be 
   * @returns Promise
   */
  async convertData(ext) {
    try {

      const data = await this.getData();
      logger.debug(`data is ` + data);
      if (ext === ".html" && this.mimeType() === "text/markdown") {
        return Buffer.from(md.render(data.toString()));
      }

      if (ext === ".png") {
        return await sharp(data).png().toBuffer();
      }
      if (ext === ".jpg") {
        return await sharp(data).jpeg().toBuffer();
      }
      if (ext === ".webp") {
        return await sharp(data).webp().toBuffer();
      }
      if (ext === ".gif") {
        return await sharp(data).gif().toBuffer();
      }

      return data;

    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Returns the content-type 
   * @param {string} ext represents a content-type the user wants the fragment data to be 
   * @returns String
   */
  convertContentType(ext) {
    switch (ext) {
      case ".txt":
        return "text/plain";
      case ".md":
        return "text/markdown";
      case ".html":
        return "text/html";
      case ".json":
        return "application/json";
      case ".png":
        return "image/png";
      case ".jpg":
        return "image/jpeg";
      case ".webp":
        return "image/webp";
      case ".gif":
        return "image/gif";
      default:
        return this.mimeType();
    }
  }
}

module.exports.Fragment = Fragment;
