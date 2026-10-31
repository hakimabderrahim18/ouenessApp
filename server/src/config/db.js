const mongoose = require('mongoose');

/**
 * Sanitizes MongoDB connection string by removing duplicate query parameters
 * such as duplicated `w=majority` or duplicate question marks that cause
 * "URI option 'w' cannot appear more than once in the connection string".
 */
const sanitizeMongoUri = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;

  let uri = rawUri.trim();

  // Strip wrapping quotes if user pasted with quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  // If corrupted prefix exists (e.g. 'retrymongodb+srv://' or accidental duplicate URLs)
  if (uri.includes('mongodb+srv://')) {
    uri = uri.slice(uri.lastIndexOf('mongodb+srv://'));
  } else if (uri.includes('mongodb://')) {
    uri = uri.slice(uri.lastIndexOf('mongodb://'));
  }

  const qIndex = uri.indexOf('?');
  if (qIndex === -1) {
    // If no query parameters, ensure database name is specified
    if (uri.endsWith('/')) {
      uri += 'loginaft_db';
    } else if (!uri.split('://')[1]?.includes('/')) {
      uri += '/loginaft_db';
    }
    return `${uri}?retryWrites=true&w=majority`;
  }

  let base = uri.slice(0, qIndex);
  let fullQuery = uri.slice(qIndex + 1);

  // If a database name was accidentally placed after the first query string
  // e.g. .../?retryWrites=true&w=majority/loginaft_db?retryWrites=true&w=majority
  const slashMatch = fullQuery.match(/\/([a-zA-Z0-9_-]+)/);
  if (base.endsWith('/') && slashMatch) {
    base = base + slashMatch[1];
    fullQuery = fullQuery.replace(slashMatch[0], '');
  } else if (base.endsWith('/')) {
    base += 'loginaft_db';
  } else if (!base.split('://')[1]?.includes('/')) {
    base += '/loginaft_db';
  }

  // Split query on both '&' and '?' to catch accidental duplicate query parameters
  const tokens = fullQuery.split(/[?&]/);
  const paramMap = new Map();

  for (const token of tokens) {
    if (!token) continue;
    const eqIdx = token.indexOf('=');
    let key = '';
    let val = '';
    if (eqIdx !== -1) {
      key = decodeURIComponent(token.slice(0, eqIdx)).trim();
      val = decodeURIComponent(token.slice(eqIdx + 1)).trim();
    } else {
      key = decodeURIComponent(token).trim();
    }
    if (key) {
      // Deduplicate keys (like duplicate 'w' or 'retryWrites') so each key appears exactly once
      paramMap.set(key, val);
    }
  }

  const cleanQuery = Array.from(paramMap.entries())
    .map(([k, v]) => (v ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : encodeURIComponent(k)))
    .join('&');

  return base + (cleanQuery ? `?${cleanQuery}` : '');
};

const connectDB = async () => {
  try {
    const rawUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loginaft_db';
    const cleanUri = sanitizeMongoUri(rawUri);

    const conn = await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.sanitizeMongoUri = sanitizeMongoUri;

