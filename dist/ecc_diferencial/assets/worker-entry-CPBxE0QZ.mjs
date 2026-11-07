var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _internal, _buildCache, _additionalStyles, _getBuildCache, _commands, _onError;
function checkWindows() {
  const global2 = globalThis;
  const platform = global2.process?.platform;
  if (typeof platform === "string") return platform.startsWith("win");
  const os = global2.Deno?.build?.os;
  if (typeof os === "string") return os === "windows";
  return global2.navigator?.platform?.startsWith("Win") ?? false;
}
const isWindows = checkWindows();
function assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
  }
}
function assertArg$1(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol !== "file:") {
    throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
  }
  return url;
}
function fromFileUrl$2(url) {
  url = assertArg$1(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
const CHAR_UPPERCASE_A = 65;
const CHAR_LOWERCASE_A = 97;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_Z = 122;
const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_COLON = 58;
function isPosixPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH;
}
function isPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH || code2 === CHAR_BACKWARD_SLASH;
}
function isWindowsDeviceRoot(code2) {
  return code2 >= CHAR_LOWERCASE_A && code2 <= CHAR_LOWERCASE_Z || code2 >= CHAR_UPPERCASE_A && code2 <= CHAR_UPPERCASE_Z;
}
function fromFileUrl$1(url) {
  url = assertArg$1(url);
  let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname !== "") {
    path = `\\\\${url.hostname}${path}`;
  }
  return path;
}
function fromFileUrl(url) {
  return isWindows ? fromFileUrl$1(url) : fromFileUrl$2(url);
}
function isAbsolute$2(path) {
  assertPath(path);
  return path.length > 0 && isPosixPathSeparator(path.charCodeAt(0));
}
function isAbsolute$1(path) {
  assertPath(path);
  const len = path.length;
  if (len === 0) return false;
  const code2 = path.charCodeAt(0);
  if (isPathSeparator(code2)) {
    return true;
  } else if (isWindowsDeviceRoot(code2)) {
    if (len > 2 && path.charCodeAt(1) === CHAR_COLON) {
      if (isPathSeparator(path.charCodeAt(2))) return true;
    }
  }
  return false;
}
function isAbsolute(path) {
  return isWindows ? isAbsolute$1(path) : isAbsolute$2(path);
}
function assertArg(path) {
  assertPath(path);
  if (path.length === 0) return ".";
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code2;
  for (let i2 = 0; i2 <= path.length; ++i2) {
    if (i2 < path.length) code2 = path.charCodeAt(i2);
    else if (isPathSeparator2(code2)) break;
    else code2 = CHAR_FORWARD_SLASH;
    if (isPathSeparator2(code2)) {
      if (lastSlash === i2 - 1 || dots === 1) ;
      else if (lastSlash !== i2 - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i2;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i2;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += `${separator}..`;
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += separator + path.slice(lastSlash + 1, i2);
        else res = path.slice(lastSlash + 1, i2);
        lastSegmentLength = i2 - lastSlash - 1;
      }
      lastSlash = i2;
      dots = 0;
    } else if (code2 === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function normalize$1(path) {
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  assertArg(path);
  const isAbsolute2 = isPosixPathSeparator(path.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator(path.charCodeAt(path.length - 1));
  path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
  if (path.length === 0 && !isAbsolute2) path = ".";
  if (path.length > 0 && trailingSeparator) path += "/";
  if (isAbsolute2) return `/${path}`;
  return path;
}
function join$2(path, ...paths) {
  if (path === void 0) return ".";
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath(path2));
  const joined = paths.filter((path2) => path2.length > 0).join("/");
  return joined === "" ? "." : normalize$1(joined);
}
function normalize(path) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  assertArg(path);
  const len = path.length;
  let rootEnd = 0;
  let device;
  let isAbsolute2 = false;
  const code2 = path.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code2)) {
      isAbsolute2 = true;
      if (isPathSeparator(path.charCodeAt(1))) {
        let j2 = 2;
        let last = j2;
        for (; j2 < len; ++j2) {
          if (isPathSeparator(path.charCodeAt(j2))) break;
        }
        if (j2 < len && j2 !== last) {
          const firstPart = path.slice(last, j2);
          last = j2;
          for (; j2 < len; ++j2) {
            if (!isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            last = j2;
            for (; j2 < len; ++j2) {
              if (isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 === len) {
              return `\\\\${firstPart}\\${path.slice(last)}\\`;
            } else if (j2 !== last) {
              device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
              rootEnd = j2;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot(code2)) {
      if (path.charCodeAt(1) === CHAR_COLON) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
      }
    }
  } else if (isPathSeparator(code2)) {
    return "\\";
  }
  let tail;
  if (rootEnd < len) {
    tail = normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
  } else {
    tail = "";
  }
  if (tail.length === 0 && !isAbsolute2) tail = ".";
  if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
    tail += "\\";
  }
  if (device === void 0) {
    if (isAbsolute2) {
      if (tail.length > 0) return `\\${tail}`;
      else return "\\";
    }
    return tail;
  } else if (isAbsolute2) {
    if (tail.length > 0) return `${device}\\${tail}`;
    else return `${device}\\`;
  }
  return device + tail;
}
function join$1(path, ...paths) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath(path2));
  paths = paths.filter((path2) => path2.length > 0);
  if (paths.length === 0) return ".";
  let needsReplace = true;
  let slashCount = 0;
  const firstPart = paths[0];
  if (isPathSeparator(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
          else {
            needsReplace = false;
          }
        }
      }
    }
  }
  let joined = paths.join("\\");
  if (needsReplace) {
    for (; slashCount < joined.length; ++slashCount) {
      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
    }
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return normalize(joined);
}
function join(path, ...paths) {
  return isWindows ? join$1(path, ...paths) : join$2(path, ...paths);
}
function cwd(errorMessage) {
  const global2 = globalThis;
  const getCwd = global2.process?.cwd ?? global2.Deno?.cwd;
  if (typeof getCwd !== "function") {
    throw new TypeError(errorMessage);
  }
  return getCwd();
}
function resolve$2(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
    let path;
    if (i2 >= 0) path = pathSegments[i2];
    else {
      path = cwd("Resolved a relative path without a current working directory (CWD)");
    }
    assertPath(path);
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
function assertArgs(from2, to2) {
  assertPath(from2);
  assertPath(to2);
  if (from2 === to2) return "";
}
function relative$2(from2, to2) {
  assertArgs(from2, to2);
  from2 = resolve$2(from2);
  to2 = resolve$2(to2);
  if (from2 === to2) return "";
  let fromStart = 1;
  const fromEnd = from2.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (!isPosixPathSeparator(from2.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 1;
  const toEnd = to2.length;
  for (; toStart < toEnd; ++toStart) {
    if (!isPosixPathSeparator(to2.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (isPosixPathSeparator(to2.charCodeAt(toStart + i2))) {
          return to2.slice(toStart + i2 + 1);
        } else if (i2 === 0) {
          return to2.slice(toStart + i2);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator(from2.charCodeAt(fromStart + i2))) {
          lastCommonSep = i2;
        } else if (i2 === 0) {
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from2.charCodeAt(fromStart + i2);
    const toCode = to2.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator(fromCode)) lastCommonSep = i2;
  }
  let out = "";
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || isPosixPathSeparator(from2.charCodeAt(i2))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  if (out.length > 0) return out + to2.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator(to2.charCodeAt(toStart))) ++toStart;
    return to2.slice(toStart);
  }
}
function resolve$1(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1; i2--) {
    let path;
    if (i2 >= 0) {
      path = pathSegments[i2];
    } else if (!resolvedDevice) {
      path = cwd("Resolved a drive-letter-less path without a current working directory (CWD)");
    } else {
      path = cwd("Resolved a relative path without a current working directory (CWD)");
      if (path === void 0 || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path = `${resolvedDevice}\\`;
      }
    }
    assertPath(path);
    const len = path.length;
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute2 = false;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
      if (isPathSeparator(code2)) {
        isAbsolute2 = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j2 = 2;
          let last = j2;
          for (; j2 < len; ++j2) {
            if (isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            const firstPart = path.slice(last, j2);
            last = j2;
            for (; j2 < len; ++j2) {
              if (!isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 < len && j2 !== last) {
              last = j2;
              for (; j2 < len; ++j2) {
                if (isPathSeparator(path.charCodeAt(j2))) break;
              }
              if (j2 === len) {
                device = `\\\\${firstPart}\\${path.slice(last)}`;
                rootEnd = j2;
              } else if (j2 !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                rootEnd = j2;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code2)) {
        if (path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator(code2)) {
      rootEnd = 1;
      isAbsolute2 = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute2;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function relative$1(from2, to2) {
  assertArgs(from2, to2);
  const fromOrig = resolve$1(from2);
  const toOrig = resolve$1(to2);
  if (fromOrig === toOrig) return "";
  from2 = fromOrig.toLowerCase();
  to2 = toOrig.toLowerCase();
  if (from2 === to2) return "";
  let fromStart = 0;
  let fromEnd = from2.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (from2.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; fromEnd - 1 > fromStart; --fromEnd) {
    if (from2.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 0;
  let toEnd = to2.length;
  for (; toStart < toEnd; ++toStart) {
    if (to2.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; toEnd - 1 > toStart; --toEnd) {
    if (to2.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (to2.charCodeAt(toStart + i2) === CHAR_BACKWARD_SLASH) {
          return toOrig.slice(toStart + i2 + 1);
        } else if (i2 === 2) {
          return toOrig.slice(toStart + i2);
        }
      }
      if (fromLen > length) {
        if (from2.charCodeAt(fromStart + i2) === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i2;
        } else if (i2 === 2) {
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from2.charCodeAt(fromStart + i2);
    const toCode = to2.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i2;
  }
  if (i2 !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || from2.charCodeAt(i2) === CHAR_BACKWARD_SLASH) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}
function relative(from2, to2) {
  return isWindows ? relative$1(from2, to2) : relative$2(from2, to2);
}
const VERSION = "1.10.0";
const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function _makeCompatibilityCheck(ownVersion) {
  const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  const rejectedVersions = /* @__PURE__ */ new Set();
  const myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) return () => false;
  const ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) return function isExactmatch(globalVersion) {
    return globalVersion === ownVersion;
  };
  function _reject(v2) {
    rejectedVersions.add(v2);
    return false;
  }
  function _accept(v2) {
    acceptedVersions.add(v2);
    return true;
  }
  return function isCompatible2(globalVersion) {
    if (acceptedVersions.has(globalVersion)) return true;
    if (rejectedVersions.has(globalVersion)) return false;
    const globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) return _reject(globalVersion);
    const globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) return _reject(globalVersion);
    if (ownVersionParsed.major !== globalVersionParsed.major) return _reject(globalVersion);
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) return _accept(globalVersion);
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) return _accept(globalVersion);
    return _reject(globalVersion);
  };
}
const isCompatible = _makeCompatibilityCheck(VERSION);
const major = VERSION.split(".")[0];
const GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
const _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
function _makeGlobalApi() {
  return Object.defineProperty({}, "version", {
    value: VERSION,
    enumerable: true,
    writable: false,
    configurable: false
  });
}
function registerGlobal(type, instance, diag, allowOverride = false) {
  var _global$GLOBAL_OPENTE;
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_global$GLOBAL_OPENTE = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _global$GLOBAL_OPENTE !== void 0 ? _global$GLOBAL_OPENTE : _makeGlobalApi();
  if (!allowOverride && api[type]) {
    const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
    diag.error(err.stack || err.message);
    return false;
  }
  if (api.version !== "1.10.0") {
    const err = /* @__PURE__ */ new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`);
    diag.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
  return true;
}
let _compatibleGlobalApi;
function getGlobal(type) {
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api == null) return;
  if (api !== _compatibleGlobalApi) {
    if (!api.version || !isCompatible(api.version)) return;
    _compatibleGlobalApi = api;
  }
  return api[type];
}
function unregisterGlobal(type, diag) {
  diag.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) delete api[type];
}
var DiagComponentLogger = class {
  constructor(props) {
    this._namespace = props.namespace || "DiagComponentLogger";
  }
  debug(...args) {
    return logProxy("debug", this._namespace, args);
  }
  error(...args) {
    return logProxy("error", this._namespace, args);
  }
  info(...args) {
    return logProxy("info", this._namespace, args);
  }
  warn(...args) {
    return logProxy("warn", this._namespace, args);
  }
  verbose(...args) {
    return logProxy("verbose", this._namespace, args);
  }
};
function logProxy(funcName, namespace, args) {
  const logger = getGlobal("diag");
  if (!logger) return;
  return logger[funcName](namespace, ...args);
}
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < 0) maxLevel = 0;
  else if (maxLevel > 9999) maxLevel = 9999;
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    const theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) return theFunc.bind(logger);
    return function() {
    };
  }
  return {
    error: _filterFunc("error", 30),
    warn: _filterFunc("warn", 50),
    info: _filterFunc("info", 60),
    debug: _filterFunc("debug", 70),
    verbose: _filterFunc("verbose", 80)
  };
}
const API_NAME$5 = "diag";
var DiagAPI = class DiagAPI2 {
  /** Get the singleton instance of the DiagAPI API */
  static instance() {
    if (!this._instance) this._instance = new DiagAPI2();
    return this._instance;
  }
  /**
  * Private internal constructor
  * @private
  */
  constructor() {
    function _logProxy(funcName) {
      return function(...args) {
        const logger = getGlobal("diag");
        if (!logger) return;
        return logger[funcName](...args);
      };
    }
    const self2 = this;
    const setLogger = (logger, optionsOrLogLevel = {
      logLevel: 60
    }) => {
      var _optionsOrLogLevel$lo;
      if (logger === self2) {
        var _err$stack;
        const err = /* @__PURE__ */ new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
        self2.error((_err$stack = err.stack) !== null && _err$stack !== void 0 ? _err$stack : err.message);
        return false;
      }
      if (typeof optionsOrLogLevel === "number") optionsOrLogLevel = {
        logLevel: optionsOrLogLevel
      };
      const oldLogger = getGlobal("diag");
      const newLogger = createLogLevelDiagLogger((_optionsOrLogLevel$lo = optionsOrLogLevel.logLevel) !== null && _optionsOrLogLevel$lo !== void 0 ? _optionsOrLogLevel$lo : 60, logger);
      if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
        var _Error$stack;
        const stack = (_Error$stack = (/* @__PURE__ */ new Error()).stack) !== null && _Error$stack !== void 0 ? _Error$stack : "<failed to generate stacktrace>";
        oldLogger.warn(`Current logger will be overwritten from ${stack}`);
        newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
      }
      return registerGlobal("diag", newLogger, self2, true);
    };
    self2.setLogger = setLogger;
    self2.disable = () => {
      unregisterGlobal(API_NAME$5, self2);
    };
    self2.createComponentLogger = (options2) => {
      return new DiagComponentLogger(options2);
    };
    self2.verbose = _logProxy("verbose");
    self2.debug = _logProxy("debug");
    self2.info = _logProxy("info");
    self2.warn = _logProxy("warn");
    self2.error = _logProxy("error");
  }
};
var BaggageImpl = class BaggageImpl2 {
  constructor(entries) {
    this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
  }
  getEntry(key) {
    const entry = this._entries.get(key);
    if (!entry) return;
    return Object.assign({}, entry);
  }
  getAllEntries() {
    return Array.from(this._entries.entries());
  }
  setEntry(key, entry) {
    const newBaggage = new BaggageImpl2(this._entries);
    newBaggage._entries.set(key, entry);
    return newBaggage;
  }
  removeEntry(key) {
    const newBaggage = new BaggageImpl2(this._entries);
    newBaggage._entries.delete(key);
    return newBaggage;
  }
  removeEntries(...keys) {
    const newBaggage = new BaggageImpl2(this._entries);
    for (const key of keys) newBaggage._entries.delete(key);
    return newBaggage;
  }
  clear() {
    return new BaggageImpl2();
  }
};
DiagAPI.instance();
function createBaggage(entries = {}) {
  return new BaggageImpl(new Map(Object.entries(entries)));
}
function createContextKey(description) {
  return Symbol.for(description);
}
const ROOT_CONTEXT = new class BaseContext {
  /**
  * Construct a new context which inherits values from an optional parent context.
  *
  * @param parentContext a context from which to inherit values
  */
  constructor(parentContext) {
    const self2 = this;
    self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
    self2.getValue = (key) => self2._currentContext.get(key);
    self2.setValue = (key, value) => {
      const context = new BaseContext(self2._currentContext);
      context._currentContext.set(key, value);
      return context;
    };
    self2.deleteValue = (key) => {
      const context = new BaseContext(self2._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }
}();
if (typeof console !== "undefined") {
  for (const key of ["error", "warn", "info", "debug", "trace", "log"]) if (typeof console[key] === "function") ;
}
var NoopMeter = class {
  constructor() {
  }
  /**
  * @see {@link Meter.createGauge}
  */
  createGauge(_name, _options) {
    return NOOP_GAUGE_METRIC;
  }
  /**
  * @see {@link Meter.createHistogram}
  */
  createHistogram(_name, _options) {
    return NOOP_HISTOGRAM_METRIC;
  }
  /**
  * @see {@link Meter.createCounter}
  */
  createCounter(_name, _options) {
    return NOOP_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.createUpDownCounter}
  */
  createUpDownCounter(_name, _options) {
    return NOOP_UP_DOWN_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.createObservableGauge}
  */
  createObservableGauge(_name, _options) {
    return NOOP_OBSERVABLE_GAUGE_METRIC;
  }
  /**
  * @see {@link Meter.createObservableCounter}
  */
  createObservableCounter(_name, _options) {
    return NOOP_OBSERVABLE_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.createObservableUpDownCounter}
  */
  createObservableUpDownCounter(_name, _options) {
    return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
  }
  /**
  * @see {@link Meter.addBatchObservableCallback}
  */
  addBatchObservableCallback(_callback, _observables) {
  }
  /**
  * @see {@link Meter.removeBatchObservableCallback}
  */
  removeBatchObservableCallback(_callback) {
  }
};
var NoopMetric = class {
};
var NoopCounterMetric = class extends NoopMetric {
  add(_value, _attributes) {
  }
};
var NoopUpDownCounterMetric = class extends NoopMetric {
  add(_value, _attributes) {
  }
};
var NoopGaugeMetric = class extends NoopMetric {
  record(_value, _attributes) {
  }
};
var NoopHistogramMetric = class extends NoopMetric {
  record(_value, _attributes) {
  }
};
var NoopObservableMetric = class {
  addCallback(_callback) {
  }
  removeCallback(_callback) {
  }
};
var NoopObservableCounterMetric = class extends NoopObservableMetric {
};
var NoopObservableGaugeMetric = class extends NoopObservableMetric {
};
var NoopObservableUpDownCounterMetric = class extends NoopObservableMetric {
};
const NOOP_METER = new NoopMeter();
const NOOP_COUNTER_METRIC = new NoopCounterMetric();
const NOOP_GAUGE_METRIC = new NoopGaugeMetric();
const NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
const NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
const NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
const NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
const NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
var NoopLogger = class {
  emit(_logRecord) {
  }
  enabled() {
    return false;
  }
};
const NOOP_LOGGER = new NoopLogger();
const defaultTextMapGetter = {
  get(carrier, key) {
    if (carrier == null) return;
    return carrier[key];
  },
  keys(carrier) {
    if (carrier == null) return [];
    return Object.keys(carrier);
  }
};
const defaultTextMapSetter = {
  set(carrier, key, value) {
    if (carrier == null) return;
    carrier[key] = value;
  }
};
const INVALID_SPANID = "0000000000000000";
const INVALID_TRACEID = "00000000000000000000000000000000";
const INVALID_SPAN_CONTEXT = {
  traceId: INVALID_TRACEID,
  spanId: INVALID_SPANID,
  traceFlags: 0
};
var NonRecordingSpan = class {
  constructor(spanContext = INVALID_SPAN_CONTEXT) {
    this._spanContext = spanContext;
  }
  spanContext() {
    return this._spanContext;
  }
  setAttribute(_key, _value) {
    return this;
  }
  setAttributes(_attributes) {
    return this;
  }
  addEvent(_name, _attributes) {
    return this;
  }
  addLink(_link) {
    return this;
  }
  addLinks(_links) {
    return this;
  }
  setStatus(_status) {
    return this;
  }
  updateName(_name) {
    return this;
  }
  end(_endTime) {
  }
  isRecording() {
    return false;
  }
  recordException(_exception, _time) {
  }
};
const isHex = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
function isValidHex(id, length) {
  if (typeof id !== "string" || id.length !== length) return false;
  let r2 = 0;
  for (let i2 = 0; i2 < id.length; i2 += 4) r2 += (isHex[id.charCodeAt(i2)] | 0) + (isHex[id.charCodeAt(i2 + 1)] | 0) + (isHex[id.charCodeAt(i2 + 2)] | 0) + (isHex[id.charCodeAt(i2 + 3)] | 0);
  return r2 === length;
}
function isValidTraceId(traceId) {
  return isValidHex(traceId, 32) && traceId !== "00000000000000000000000000000000";
}
function isValidSpanId(spanId) {
  return isValidHex(spanId, 16) && spanId !== "0000000000000000";
}
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan(spanContext);
}
var NoopContextManager = class {
  active() {
    return ROOT_CONTEXT;
  }
  with(_context, fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  bind(_context, target) {
    return target;
  }
  enable() {
    return this;
  }
  disable() {
    return this;
  }
  /** @experimental This API is experimental and may change in minor releases without prior notice. */
  attach(_context) {
    return {
      dispose() {
      }
    };
  }
};
const API_NAME$4 = "context";
const NOOP_CONTEXT_MANAGER = new NoopContextManager();
const NOOP_TOKEN = Object.freeze({
  dispose: () => {
  }
});
var ContextAPI = class ContextAPI2 {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._attachUnsupportedWarned = false;
  }
  /** Get the singleton instance of the Context API */
  static getInstance() {
    if (!this._instance) this._instance = new ContextAPI2();
    return this._instance;
  }
  /**
  * Set the current context manager.
  *
  * @returns true if the context manager was successfully registered, else false
  */
  setGlobalContextManager(contextManager) {
    return registerGlobal(API_NAME$4, contextManager, DiagAPI.instance());
  }
  /**
  * Get the currently active context
  */
  active() {
    return this._getContextManager().active();
  }
  /**
  * Execute a function with an active context
  *
  * @param context context to be active during function execution
  * @param fn function to execute in a context
  * @param thisArg optional receiver to be used for calling fn
  * @param args optional arguments forwarded to fn
  */
  with(context, fn, thisArg, ...args) {
    return this._getContextManager().with(context, fn, thisArg, ...args);
  }
  /**
  * Bind a context to a target function or event emitter
  *
  * @param context context to bind to the event emitter or function. Defaults to the currently active context
  * @param target function or event emitter to bind
  */
  bind(context, target) {
    return this._getContextManager().bind(context, target);
  }
  /**
  * Imperatively sets `context` as active, returning a {@link ContextManagementToken} whose
  * {@link ContextManagementToken.dispose} restores the previous context.
  *
  * This is a delicate, low-level API - prefer {@link with}/{@link bind}, which
  * restore context automatically. Use `attach` only to bridge callback
  * boundaries that `with` cannot wrap. Call `token.dispose()` when the
  * operation is done.
  *
  * **Caveat for async functions:** If called inside an async function before
  * the first `await`, the context change may leak into the caller's context
  * and remain active there. Prefer {@link with} for async code.
  *
  * Support is best-effort and varies by the active ContextManager (see
  * {@link ContextManager.attach}); if it does not implement `attach`, this logs
  * a warning and returns a no-op token.
  *
  * @param context The Context to attach
  * @returns A {@link ContextManagementToken} whose dispose() restores the previous Context
  * @since 1.10.0
  * @experimental This API is experimental and may change in minor releases without prior notice.
  */
  attach(context) {
    const contextManager = this._getContextManager();
    if (contextManager.attach) return contextManager.attach(context);
    if (!this._attachUnsupportedWarned) {
      this._attachUnsupportedWarned = true;
      DiagAPI.instance().warn("The current ContextManager does not implement attach(). The context will not be attached. Use a ContextManager that supports attach() (e.g. AsyncLocalStorageContextManager) or use with()/bind() instead.");
    }
    return NOOP_TOKEN;
  }
  _getContextManager() {
    return getGlobal(API_NAME$4) || NOOP_CONTEXT_MANAGER;
  }
  /** Disable and remove the global context manager */
  disable() {
    this._getContextManager().disable();
    unregisterGlobal(API_NAME$4, DiagAPI.instance());
  }
};
const SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
function getSpan(context) {
  return context.getValue(SPAN_KEY) || void 0;
}
function getActiveSpan() {
  return getSpan(ContextAPI.getInstance().active());
}
function setSpan(context, span) {
  return context.setValue(SPAN_KEY, span);
}
function deleteSpan(context) {
  return context.deleteValue(SPAN_KEY);
}
function setSpanContext(context, spanContext) {
  return setSpan(context, new NonRecordingSpan(spanContext));
}
function getSpanContext(context) {
  var _getSpan;
  return (_getSpan = getSpan(context)) === null || _getSpan === void 0 ? void 0 : _getSpan.spanContext();
}
const contextApi = ContextAPI.getInstance();
var NoopTracer = class {
  startSpan(name, options2, context = contextApi.active()) {
    if (Boolean(options2 === null || options2 === void 0 ? void 0 : options2.root)) return new NonRecordingSpan();
    const parentFromContext = context && getSpanContext(context);
    if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) return new NonRecordingSpan(parentFromContext);
    else return new NonRecordingSpan();
  }
  startActiveSpan(name, arg2, arg3, arg4) {
    var _ctx;
    let opts;
    let ctx;
    let fn;
    if (arguments.length < 2) return;
    else if (arguments.length === 2) fn = arg2;
    else if (arguments.length === 3) {
      opts = arg2;
      fn = arg3;
    } else {
      opts = arg2;
      ctx = arg3;
      fn = arg4;
    }
    const parentContext = (_ctx = ctx) !== null && _ctx !== void 0 ? _ctx : contextApi.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = setSpan(parentContext, span);
    return contextApi.with(contextWithSpanSet, fn, void 0, span);
  }
};
function isSpanContext(spanContext) {
  return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
}
const NOOP_TRACER = new NoopTracer();
var ProxyTracer = class {
  constructor(provider, name, version2, options2) {
    this._provider = provider;
    this.name = name;
    this.version = version2;
    this.options = options2;
  }
  startSpan(name, options2, context) {
    return this._getTracer().startSpan(name, options2, context);
  }
  startActiveSpan(_name, _options, _context, _fn) {
    const tracer2 = this._getTracer();
    return Reflect.apply(tracer2.startActiveSpan, tracer2, arguments);
  }
  /**
  * Try to get a tracer from the proxy tracer provider.
  * If the proxy tracer provider has no delegate, return a noop tracer.
  */
  _getTracer() {
    if (this._delegate) return this._delegate;
    const tracer2 = this._provider.getDelegateTracer(this.name, this.version, this.options);
    if (!tracer2) return NOOP_TRACER;
    this._delegate = tracer2;
    return this._delegate;
  }
};
let SpanStatusCode = /* @__PURE__ */ (function(SpanStatusCode2) {
  SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
  SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
  SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
  return SpanStatusCode2;
})({});
var NoopTracerProvider = class {
  getTracer(_name, _version, _options) {
    return new NoopTracer();
  }
};
const NOOP_TRACER_PROVIDER = new NoopTracerProvider();
var ProxyTracerProvider = class {
  /**
  * Get a {@link ProxyTracer}
  */
  getTracer(name, version2, options2) {
    var _this$getDelegateTrac;
    return (_this$getDelegateTrac = this.getDelegateTracer(name, version2, options2)) !== null && _this$getDelegateTrac !== void 0 ? _this$getDelegateTrac : new ProxyTracer(this, name, version2, options2);
  }
  getDelegate() {
    var _this$_delegate;
    return (_this$_delegate = this._delegate) !== null && _this$_delegate !== void 0 ? _this$_delegate : NOOP_TRACER_PROVIDER;
  }
  /**
  * Set the delegate tracer provider
  */
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  getDelegateTracer(name, version2, options2) {
    var _this$_delegate2;
    return (_this$_delegate2 = this._delegate) === null || _this$_delegate2 === void 0 ? void 0 : _this$_delegate2.getTracer(name, version2, options2);
  }
};
ContextAPI.getInstance();
DiagAPI.instance();
var NoopLoggerProvider = class {
  getLogger(_name, _version, _options) {
    return new NoopLogger();
  }
};
const NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
var ProxyLogger = class {
  constructor(provider, name, version2, options2) {
    this._provider = provider;
    this.name = name;
    this.version = version2;
    this.options = options2;
  }
  /**
  * Emit a log record. This method should only be used by log appenders.
  *
  * @param logRecord
  */
  emit(logRecord) {
    this._getLogger().emit(logRecord);
  }
  enabled(options2) {
    return this._getLogger().enabled(options2);
  }
  /**
  * Try to get a logger from the proxy logger provider.
  * If the proxy logger provider has no delegate, return a noop logger.
  */
  _getLogger() {
    if (this._delegate) return this._delegate;
    const logger = this._provider._getDelegateLogger(this.name, this.version, this.options);
    if (!logger) return NOOP_LOGGER;
    this._delegate = logger;
    return this._delegate;
  }
};
var ProxyLoggerProvider = class {
  getLogger(name, version2, options2) {
    var _this$_getDelegateLog;
    return (_this$_getDelegateLog = this._getDelegateLogger(name, version2, options2)) !== null && _this$_getDelegateLog !== void 0 ? _this$_getDelegateLog : new ProxyLogger(this, name, version2, options2);
  }
  /**
  * Get the delegate logger provider.
  * Used by tests only.
  * @internal
  */
  _getDelegate() {
    var _this$_delegate;
    return (_this$_delegate = this._delegate) !== null && _this$_delegate !== void 0 ? _this$_delegate : NOOP_LOGGER_PROVIDER;
  }
  /**
  * Set the delegate logger provider
  * @internal
  */
  _setDelegate(delegate) {
    this._delegate = delegate;
  }
  /**
  * @internal
  */
  _getDelegateLogger(name, version2, options2) {
    var _this$_delegate2;
    return (_this$_delegate2 = this._delegate) === null || _this$_delegate2 === void 0 ? void 0 : _this$_delegate2.getLogger(name, version2, options2);
  }
};
const API_NAME$3 = "logs";
var LogsAPI = class LogsAPI2 {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._proxyLoggerProvider = new ProxyLoggerProvider();
  }
  /** Get the singleton instance of the Logs API */
  static getInstance() {
    if (!this._instance) this._instance = new LogsAPI2();
    return this._instance;
  }
  setGlobalLoggerProvider(provider) {
    const success = registerGlobal(API_NAME$3, provider, DiagAPI.instance());
    if (success) this._proxyLoggerProvider._setDelegate(provider);
    return success;
  }
  /**
  * Returns the global logger provider.
  *
  * @returns LoggerProvider
  */
  getLoggerProvider() {
    return getGlobal(API_NAME$3) || this._proxyLoggerProvider;
  }
  /**
  * Returns a Logger, creating one if one with the given name, version,
  * schemaUrl, and attributes is not already created.
  *
  * Getting a Logger may be expensive, especially when `attributes` are
  * provided. Reuse Logger instances where possible instead of calling
  * `getLogger()` on hot paths.
  *
  * @param name The name of the logger or instrumentation library.
  * @param version The version of the logger or instrumentation library.
  * @param options The options of the logger or instrumentation library.
  * @returns {@link Logger}
  */
  getLogger(name, version2, options2) {
    return this.getLoggerProvider().getLogger(name, version2, options2);
  }
  /** Remove the global logger provider */
  disable() {
    unregisterGlobal(API_NAME$3, DiagAPI.instance());
    this._proxyLoggerProvider = new ProxyLoggerProvider();
  }
};
LogsAPI.getInstance();
var NoopMeterProvider = class {
  getMeter(_name, _version, _options) {
    return NOOP_METER;
  }
};
const NOOP_METER_PROVIDER = new NoopMeterProvider();
const API_NAME$2 = "metrics";
var MetricsAPI = class MetricsAPI2 {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Metrics API */
  static getInstance() {
    if (!this._instance) this._instance = new MetricsAPI2();
    return this._instance;
  }
  /**
  * Set the current global meter provider.
  * Returns true if the meter provider was successfully registered, else false.
  */
  setGlobalMeterProvider(provider) {
    return registerGlobal(API_NAME$2, provider, DiagAPI.instance());
  }
  /**
  * Returns the global meter provider.
  */
  getMeterProvider() {
    return getGlobal(API_NAME$2) || NOOP_METER_PROVIDER;
  }
  /**
  * Returns a meter from the global meter provider.
  */
  getMeter(name, version2, options2) {
    return this.getMeterProvider().getMeter(name, version2, options2);
  }
  /** Remove the global meter provider */
  disable() {
    unregisterGlobal(API_NAME$2, DiagAPI.instance());
  }
};
MetricsAPI.getInstance();
var NoopTextMapPropagator = class {
  /** Noop inject function does nothing */
  inject(_context, _carrier) {
  }
  /** Noop extract function does nothing and returns the input context */
  extract(context, _carrier) {
    return context;
  }
  fields() {
    return [];
  }
};
const BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
function getBaggage(context) {
  return context.getValue(BAGGAGE_KEY) || void 0;
}
function getActiveBaggage() {
  return getBaggage(ContextAPI.getInstance().active());
}
function setBaggage(context, baggage) {
  return context.setValue(BAGGAGE_KEY, baggage);
}
function deleteBaggage(context) {
  return context.deleteValue(BAGGAGE_KEY);
}
const API_NAME$1 = "propagation";
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
var PropagationAPI = class PropagationAPI2 {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this.createBaggage = createBaggage;
    this.getBaggage = getBaggage;
    this.getActiveBaggage = getActiveBaggage;
    this.setBaggage = setBaggage;
    this.deleteBaggage = deleteBaggage;
  }
  /** Get the singleton instance of the Propagator API */
  static getInstance() {
    if (!this._instance) this._instance = new PropagationAPI2();
    return this._instance;
  }
  /**
  * Set the current propagator.
  *
  * @returns true if the propagator was successfully registered, else false
  */
  setGlobalPropagator(propagator) {
    return registerGlobal(API_NAME$1, propagator, DiagAPI.instance());
  }
  /**
  * Inject context into a carrier to be propagated inter-process
  *
  * @param context Context carrying tracing data to inject
  * @param carrier carrier to inject context into
  * @param setter Function used to set values on the carrier
  */
  inject(context, carrier, setter = defaultTextMapSetter) {
    return this._getGlobalPropagator().inject(context, carrier, setter);
  }
  /**
  * Extract context from a carrier
  *
  * @param context Context which the newly created context will inherit from
  * @param carrier Carrier to extract context from
  * @param getter Function used to extract keys from a carrier
  */
  extract(context, carrier, getter = defaultTextMapGetter) {
    return this._getGlobalPropagator().extract(context, carrier, getter);
  }
  /**
  * Return a list of all fields which may be used by the propagator.
  */
  fields() {
    return this._getGlobalPropagator().fields();
  }
  /** Remove the global propagator */
  disable() {
    unregisterGlobal(API_NAME$1, DiagAPI.instance());
  }
  _getGlobalPropagator() {
    return getGlobal(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
  }
};
PropagationAPI.getInstance();
const API_NAME = "trace";
var TraceAPI = class TraceAPI2 {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._proxyTracerProvider = new ProxyTracerProvider();
    this.wrapSpanContext = wrapSpanContext;
    this.isSpanContextValid = isSpanContextValid;
    this.deleteSpan = deleteSpan;
    this.getSpan = getSpan;
    this.getActiveSpan = getActiveSpan;
    this.getSpanContext = getSpanContext;
    this.setSpan = setSpan;
    this.setSpanContext = setSpanContext;
  }
  /** Get the singleton instance of the Trace API */
  static getInstance() {
    if (!this._instance) this._instance = new TraceAPI2();
    return this._instance;
  }
  /**
  * Set the current global tracer.
  *
  * @returns true if the tracer provider was successfully registered, else false
  */
  setGlobalTracerProvider(provider) {
    const success = registerGlobal(API_NAME, this._proxyTracerProvider, DiagAPI.instance());
    if (success) this._proxyTracerProvider.setDelegate(provider);
    return success;
  }
  /**
  * Returns the global tracer provider.
  */
  getTracerProvider() {
    return getGlobal(API_NAME) || this._proxyTracerProvider;
  }
  /**
  * Returns a tracer from the global tracer provider.
  */
  getTracer(name, version2) {
    return this.getTracerProvider().getTracer(name, version2);
  }
  /** Remove the global tracer provider */
  disable() {
    unregisterGlobal(API_NAME, DiagAPI.instance());
    this._proxyTracerProvider = new ProxyTracerProvider();
  }
};
const trace = TraceAPI.getInstance();
let BUILD_ID = "f451b3477b44f97de599232b7556f128bcf8a54c";
const DENO_DEPLOYMENT_ID = void 0;
function setBuildId(id) {
  BUILD_ID = id;
}
const {
  Deno: Deno$1
} = globalThis;
const noColor = typeof Deno$1?.noColor === "boolean" ? Deno$1.noColor : false;
let enabled = !noColor;
function code(open, close) {
  return {
    open: `\x1B[${open.join(";")}m`,
    close: `\x1B[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g")
  };
}
function run(str, code2) {
  return enabled ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}
function bold(str) {
  return run(str, code([1], 22));
}
function cyan(str) {
  return run(str, code([36], 39));
}
function clampAndTruncate(n2, max = 255, min = 0) {
  return Math.trunc(Math.max(Math.min(n2, max), min));
}
function rgb8(str, color2) {
  return run(str, code([38, 5, clampAndTruncate(color2)], 39));
}
function bgRgb8(str, color2) {
  return run(str, code([48, 5, clampAndTruncate(color2)], 49));
}
var n$1, l$3, u$3, t$2, i$3, r$1, o$3, e$1, f$4, c$3, a$3, s$3, h$2, p$3, v$2, y$2, d$2 = {}, w$2 = [], _$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, g$1 = Array.isArray;
function m$2(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function b$1(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function k$2(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n$1.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return x$2(l2, e2, i2, r2, null);
}
function x$2(n2, t2, i2, r2, o2) {
  var e2 = {
    type: n2,
    props: t2,
    key: i2,
    ref: r2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: null == o2 ? ++u$3 : o2,
    __i: -1,
    __u: 0
  };
  return null == o2 && null != l$3.vnode && l$3.vnode(e2), e2;
}
function S(n2) {
  return n2.children;
}
function C$1(n2, l2) {
  this.props = n2, this.context = l2;
}
function $$1(n2, l2) {
  if (null == l2) return n2.__ ? $$1(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? $$1(n2) : null;
}
function I$1(n2) {
  if (n2.__P && n2.__d) {
    var u2 = n2.__v, t2 = u2.__e, i2 = [], r2 = [], o2 = m$2({}, u2);
    o2.__v = u2.__v + 1, l$3.vnode && l$3.vnode(o2), q$1(n2.__P, o2, u2, n2.__n, n2.__P.namespaceURI, 32 & u2.__u ? [t2] : null, i2, null == t2 ? $$1(u2) : t2, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, D$1(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t2 && P$1(o2);
  }
}
function P$1(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l2) {
    if (null != l2 && null != l2.__e) return n2.__e = n2.__c.base = l2.__e;
  }), P$1(n2);
}
function A$1(n2) {
  (!n2.__d && (n2.__d = true) && i$3.push(n2) && !H$1.__r++ || r$1 != l$3.debounceRendering) && ((r$1 = l$3.debounceRendering) || o$3)(H$1);
}
function H$1() {
  try {
    for (var n2, l2 = 1; i$3.length; ) i$3.length > l2 && i$3.sort(e$1), n2 = i$3.shift(), l2 = i$3.length, I$1(n2);
  } finally {
    i$3.length = H$1.__r = 0;
  }
}
function L(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h3, p2, v2, y2, _2, g2 = t2 && t2.__k || w$2, m2 = l2.length;
  for (f2 = T$2(u2, l2, g2, f2, m2), s2 = 0; s2 < m2; s2++) null != (p2 = u2.__k[s2]) && (h3 = -1 != p2.__i && g2[p2.__i] || d$2, p2.__i = s2, _2 = q$1(n2, p2, h3, i2, r2, o2, e2, f2, c2, a2), v2 = p2.__e, p2.ref && h3.ref != p2.ref && (h3.ref && J(h3.ref, null, p2), a2.push(p2.ref, p2.__c || v2, p2)), null == y2 && null != v2 && (y2 = v2), 4 & p2.__u ? (f2 = j$2(p2, f2, n2), h3.__e && (h3.__e = null)) : "function" == typeof p2.type && void 0 !== _2 ? f2 = _2 : v2 && (f2 = v2.nextSibling), p2.__u &= -7);
  return u2.__e = y2, f2;
}
function T$2(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, a2 = u2.length, s2 = a2, h3 = 0;
  for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = x$2(null, o2, null, null, null) : g$1(o2) ? o2 = n2.__k[r2] = x$2(S, {
    children: o2
  }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = x$2(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h3, o2.__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = O(o2, u2, f2, s2)) && (s2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > a2 ? h3-- : i2 < a2 && h3++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h3-- : c2 == f2 + 1 ? h3++ : (c2 > f2 ? h3-- : h3++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (s2) for (r2 = 0; r2 < a2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = $$1(e2)), K(e2, e2));
  return t2;
}
function j$2(n2, l2, u2) {
  var t2, i2;
  if ("function" == typeof n2.type) {
    for (t2 = n2.__k, i2 = 0; t2 && i2 < t2.length; i2++) t2[i2] && (t2[i2].__ = n2, l2 = j$2(t2[i2], l2, u2));
    return l2;
  }
  n2.__e != l2 && (l2 && n2.type && !l2.parentNode && (l2 = $$1(n2)), l2 = u2.insertBefore(n2.__e, l2 || null));
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function O(n2, l2, u2, t2) {
  var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], a2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == e2 || a2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (a2 ? 1 : 0)) {
    for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
  }
  return -1;
}
function z$2(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || _$1.test(l2) ? u2 : u2 + "px";
}
function N$1(n2, l2, u2, t2, i2) {
  var r2, o2;
  n: if ("style" == l2) {
    if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || z$2(n2.style, l2, "");
      if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || z$2(n2.style, l2, u2[l2]);
    }
  } else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(s$3, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2[a$3] = t2[a$3] : (u2[a$3] = h$2, n2.addEventListener(l2, r2 ? v$2 : p$3, r2)) : n2.removeEventListener(l2, r2 ? v$2 : p$3, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function V$1(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2[c$3]) u2[c$3] = h$2++;
      else if (u2[c$3] < t2[a$3]) return;
      return t2(l$3.event ? l$3.event(u2) : u2);
    }
  };
}
function q$1(n2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h3, p2, v2, y2, d2, _2, k2, x2, M2, I2, P2, A2, H2, T2, j2, F2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (s2 = l$3.__b) && s2(u2);
  n: if ("function" == typeof F2) {
    h3 = e2.length;
    try {
      if (x2 = u2.props, M2 = F2.prototype && F2.prototype.render, I2 = (s2 = F2.contextType) && i2[s2.__c], P2 = s2 ? I2 ? I2.props.value : s2.__ : i2, t2.__c ? k2 = (p2 = u2.__c = t2.__c).__ = p2.__E : (M2 ? u2.__c = p2 = new F2(x2, P2) : (u2.__c = p2 = new C$1(x2, P2), p2.constructor = F2, p2.render = Q), I2 && I2.sub(p2), p2.state || (p2.state = {}), p2.__n = i2, v2 = p2.__d = true, p2.__h = [], p2._sb = []), M2 && null == p2.__s && (p2.__s = p2.state), M2 && null != F2.getDerivedStateFromProps && (p2.__s == p2.state && (p2.__s = m$2({}, p2.__s)), m$2(p2.__s, F2.getDerivedStateFromProps(x2, p2.__s))), y2 = p2.props, d2 = p2.state, p2.__v = u2, v2) M2 && null == F2.getDerivedStateFromProps && null != p2.componentWillMount && p2.componentWillMount(), M2 && null != p2.componentDidMount && p2.__h.push(p2.componentDidMount);
      else {
        if (M2 && null == F2.getDerivedStateFromProps && x2 !== y2 && null != p2.componentWillReceiveProps && p2.componentWillReceiveProps(x2, P2), u2.__v == t2.__v || !p2.__e && null != p2.shouldComponentUpdate && false === p2.shouldComponentUpdate(x2, p2.__s, P2)) {
          u2.__v != t2.__v && (p2.props = x2, p2.state = p2.__s, p2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
            n3 && (n3.__ = u2);
          }), w$2.push.apply(p2.__h, p2._sb), p2._sb = [], p2.__h.length && e2.push(p2), f2 = $$1(t2);
          break n;
        }
        null != p2.componentWillUpdate && p2.componentWillUpdate(x2, p2.__s, P2), M2 && null != p2.componentDidUpdate && p2.__h.push(function() {
          p2.componentDidUpdate(y2, d2, _2);
        });
      }
      if (p2.context = P2, p2.props = x2, p2.__P = n2, p2.__e = false, A2 = l$3.__r, H2 = 0, M2) p2.state = p2.__s, p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), w$2.push.apply(p2.__h, p2._sb), p2._sb = [];
      else do {
        p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), p2.state = p2.__s;
      } while (p2.__d && ++H2 < 25);
      p2.state = p2.__s, null != p2.getChildContext && (i2 = m$2(m$2({}, i2), p2.getChildContext())), M2 && !v2 && null != p2.getSnapshotBeforeUpdate && (_2 = p2.getSnapshotBeforeUpdate(y2, d2)), T2 = null != s2 && s2.type === S && null == s2.key ? E(s2.props.children) : s2, f2 = L(n2, g$1(T2) ? T2 : [T2], u2, t2, i2, r2, o2, e2, f2, c2, a2), p2.base = u2.__e, u2.__u &= -161, p2.__h.length && e2.push(p2), k2 && (p2.__E = p2.__ = null);
    } catch (n3) {
      if (e2.length = h3, u2.__v = null, c2 || null != o2) {
        if (n3.then) {
          for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
          null != o2 && (o2[o2.indexOf(f2)] = null), u2.__e = f2;
        } else if (null != o2) for (j2 = o2.length; j2--; ) b$1(o2[j2]);
      } else u2.__e = t2.__e;
      null == u2.__k && (u2.__k = t2.__k || []), n3.then || B$2(u2), l$3.__e(n3, u2, t2);
    }
  } else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = G(t2.__e, u2, t2, i2, r2, o2, e2, c2, a2);
  return (s2 = l$3.diffed) && s2(u2), 128 & u2.__u ? void 0 : f2;
}
function B$2(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B$2));
}
function D$1(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) J(t2[i2], t2[++i2], t2[++i2]);
  l$3.__c && l$3.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$3.__e(n3, u3.__v);
    }
  });
}
function E(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g$1(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m$2({}, n2);
}
function G(u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h3, p2, v2, y2, w2, _2, m2 = i2.props || d$2, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (s2 = 0; s2 < e2.length; s2++) if ((y2 = e2[s2]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
      u2 = y2, e2[s2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$3.__m && l$3.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) m2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = "textarea" == x2 && null != k2.defaultValue ? null : e2 && n$1.call(u2.childNodes), !c2 && null != e2) for (m2 = {}, s2 = 0; s2 < u2.attributes.length; s2++) m2[(y2 = u2.attributes[s2]).name] = y2.value;
    for (s2 in m2) y2 = m2[s2], "dangerouslySetInnerHTML" == s2 ? p2 = y2 : "children" == s2 || s2 in k2 || "value" == s2 && "defaultValue" in k2 || "checked" == s2 && "defaultChecked" in k2 || N$1(u2, s2, null, y2, o2);
    for (s2 in k2) y2 = k2[s2], "children" == s2 ? v2 = y2 : "dangerouslySetInnerHTML" == s2 ? h3 = y2 : "value" == s2 ? w2 = y2 : "checked" == s2 ? _2 = y2 : c2 && "function" != typeof y2 || m2[s2] === y2 || N$1(u2, s2, y2, m2[s2], o2);
    if (h3) c2 || p2 && (h3.__html == p2.__html || h3.__html == u2.innerHTML) || (u2.innerHTML = h3.__html), t2.__k = [];
    else if (p2 && (u2.innerHTML = ""), L("template" == t2.type ? u2.content : u2, g$1(v2) ? v2 : [v2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && $$1(i2, 0), c2, a2), null != e2) for (s2 = e2.length; s2--; ) b$1(e2[s2]);
    c2 && "textarea" != x2 || (s2 = "value", "progress" == x2 && null == w2 ? u2.removeAttribute("value") : null != w2 && (w2 !== u2[s2] || "progress" == x2 && !w2 || "option" == x2 && w2 != m2[s2]) && N$1(u2, s2, w2, m2[s2], o2), s2 = "checked", null != _2 && _2 != u2[s2] && N$1(u2, s2, _2, m2[s2], o2));
  }
  return u2;
}
function J(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$3.__e(n3, t2);
  }
}
function K(n2, u2, t2) {
  var i2, r2;
  if (l$3.unmount && l$3.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || J(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$3.__e(n3, u2);
    }
    i2.base = i2.__P = i2.__n = null;
  }
  if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && K(i2[r2], u2, t2 || "function" != typeof n2.type);
  t2 || b$1(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function Q(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function X(n2) {
  function l2(n3) {
    var u2, t2;
    return this.getChildContext || (u2 = /* @__PURE__ */ new Set(), (t2 = {})[l2.__c] = this, this.getChildContext = function() {
      return t2;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, A$1(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + y$2++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n$1 = w$2.slice, l$3 = {
  __e: function(n2, l2, u2, t2) {
    for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
    } catch (l3) {
      n2 = l3;
    }
    throw n2;
  }
}, u$3 = 0, t$2 = function(n2) {
  return null != n2 && void 0 === n2.constructor;
}, C$1.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$2({}, this.state), "function" == typeof n2 && (n2 = n2(m$2({}, u2), this.props)), n2 && m$2(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), A$1(this));
}, C$1.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), A$1(this));
}, C$1.prototype.render = S, i$3 = [], o$3 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$1 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, H$1.__r = 0, f$4 = Math.random().toString(8), c$3 = "__d" + f$4, a$3 = "__a" + f$4, s$3 = /(PointerCapture)$|Capture$/i, h$2 = 0, p$3 = V$1(false), v$2 = V$1(true), y$2 = 0;
var t$1 = /["&<]/;
function n(r2) {
  if (0 === r2.length || false === t$1.test(r2)) return r2;
  for (var e2 = 0, n2 = 0, o2 = "", f2 = ""; n2 < r2.length; n2++) {
    switch (r2.charCodeAt(n2)) {
      case 34:
        f2 = "&quot;";
        break;
      case 38:
        f2 = "&amp;";
        break;
      case 60:
        f2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== e2 && (o2 += r2.slice(e2, n2)), o2 += f2, e2 = n2 + 1;
  }
  return n2 !== e2 && (o2 += r2.slice(e2, n2)), o2;
}
var o$2 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, f$3 = 0, i$2 = Array.isArray;
function u$2(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = {
    type: e2,
    props: p2,
    key: n2,
    ref: a2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: --f$3,
    __i: -1,
    __u: 0,
    __source: i2,
    __self: u2
  };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$3.vnode && l$3.vnode(l2), l2;
}
function a$2(r2) {
  var t2 = u$2(S, {
    tpl: r2,
    exprs: [].slice.call(arguments, 1)
  });
  return t2.key = t2.__v, t2;
}
var c$2 = {}, p$2 = /[A-Z]/g;
function l$2(e2, t2) {
  if (l$3.attr) {
    var f2 = l$3.attr(e2, t2);
    if ("string" == typeof f2) return f2;
  }
  if (t2 = (function(r2) {
    return null !== r2 && "object" == typeof r2 && "function" == typeof r2.valueOf ? r2.valueOf() : r2;
  })(t2), "ref" === e2 || "key" === e2) return "";
  if ("style" === e2 && "object" == typeof t2) {
    var i2 = "";
    for (var u2 in t2) {
      var a2 = t2[u2];
      if (null != a2 && "" !== a2) {
        var l2 = "-" == u2[0] ? u2 : c$2[u2] || (c$2[u2] = u2.replace(p$2, "-$&").toLowerCase()), s2 = ";";
        "number" != typeof a2 || l2.startsWith("--") || o$2.test(l2) || (s2 = "px;"), i2 = i2 + l2 + ":" + a2 + s2;
      }
    }
    return e2 + '="' + n(i2) + '"';
  }
  return null == t2 || false === t2 || "function" == typeof t2 || "object" == typeof t2 ? "" : true === t2 ? e2 : e2 + '="' + n("" + t2) + '"';
}
function s$2(r2) {
  if (null == r2 || "boolean" == typeof r2 || "function" == typeof r2) return null;
  if ("object" == typeof r2) {
    if (void 0 === r2.constructor) return r2;
    if (i$2(r2)) {
      for (var e2 = 0; e2 < r2.length; e2++) r2[e2] = s$2(r2[e2]);
      return r2;
    }
  }
  return n("" + r2);
}
class HttpError extends Error {
  /**
   * The HTTP status code.
   *
   * @example Basic usage
   * ```ts
   * import { App, HttpError } from "fresh";
   * import { expect } from "@std/expect";
   *
   * const app = new App()
   *   .get("/", () => new Response("ok"))
   *   .get("/not-found", () => {
   *      throw new HttpError(404, "Nothing here");
   *    });
   *
   * const handler = app.handler();
   *
   * try {
   *   await handler(new Request("http://localhost/not-found"))
   * } catch (error) {
   *   expect(error).toBeInstanceOf(HttpError);
   *   expect(error.status).toBe(404);
   *   expect(error.message).toBe("Nothing here");
   * }
   * ```
   */
  status;
  /**
   * Constructs a new instance.
   *
   * @param status The HTTP status code.
   * @param message The error message. Defaults to the status text of the given
   * status code.
   * @param options Optional error options.
   */
  constructor(status, message, options2) {
    super(message, options2);
    this.name = this.constructor.name;
    this.status = status;
  }
}
const INTERNAL_PREFIX = "/_frsh";
const DEV_ERROR_OVERLAY_URL = `${INTERNAL_PREFIX}/error_overlay`;
const PARTIAL_SEARCH_PARAM = "fresh-partial";
const ASSET_CACHE_BUST_KEY = "__frsh_c";
const DATA_CURRENT = "data-current";
const DATA_ANCESTOR = "data-ancestor";
const DATA_FRESH_KEY = "data-frsh-key";
const CLIENT_NAV_ATTR = "f-client-nav";
var OptionsType = /* @__PURE__ */ (function(OptionsType2) {
  OptionsType2["ATTR"] = "attr";
  OptionsType2["VNODE"] = "vnode";
  OptionsType2["HOOK"] = "__h";
  OptionsType2["DIFF"] = "__b";
  OptionsType2["RENDER"] = "__r";
  OptionsType2["DIFFED"] = "diffed";
  OptionsType2["ERROR"] = "__e";
  return OptionsType2;
})({});
function matchesUrl(current, needle, currentSearch) {
  const needleUrl = new URL(needle, "http://localhost");
  let href = needleUrl.pathname;
  const needleSearch = needleUrl.search;
  if (href !== "/" && href.endsWith("/")) {
    href = href.slice(0, -1);
  }
  if (current !== "/" && current.endsWith("/")) {
    current = current.slice(0, -1);
  }
  if (current === href) {
    if (needleSearch && currentSearch !== void 0 && needleSearch !== currentSearch) {
      return 1;
    }
    return 2;
  } else if (current.startsWith(href + "/") || href === "/") {
    return 1;
  }
  return 0;
}
function setActiveUrl(vnode, pathname, search) {
  const props = vnode.props;
  const hrefProp = props.href;
  if (typeof hrefProp === "string" && hrefProp.startsWith("/")) {
    if (props["aria-current"] !== void 0) return;
    const match = matchesUrl(pathname, hrefProp, search);
    if (match === 2) {
      props[DATA_CURRENT] = "true";
      props["aria-current"] = "page";
    } else if (match === 1) {
      props[DATA_ANCESTOR] = "true";
      props["aria-current"] = "true";
    }
  }
}
var PartialMode = /* @__PURE__ */ (function(PartialMode2) {
  PartialMode2[PartialMode2["Replace"] = 0] = "Replace";
  PartialMode2[PartialMode2["Append"] = 1] = "Append";
  PartialMode2[PartialMode2["Prepend"] = 2] = "Prepend";
  return PartialMode2;
})({});
function assetInternal(path, buildId) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  try {
    const url = new URL(path, "https://freshassetcache.local");
    if (url.protocol !== "https:" || url.host !== "freshassetcache.local" || url.searchParams.has(ASSET_CACHE_BUST_KEY)) {
      return path;
    }
    url.searchParams.set(ASSET_CACHE_BUST_KEY, buildId);
    return url.pathname + url.search + url.hash;
  } catch (err) {
    console.warn(`Failed to create asset() URL, falling back to regular path ('${path}'):`, err);
    return path;
  }
}
function assetSrcSetInternal(srcset, buildId) {
  if (srcset.includes("(")) return srcset;
  const parts = srcset.split(",");
  const constructed = [];
  for (const part of parts) {
    const trimmed = part.trimStart();
    const leadingWhitespace = part.length - trimmed.length;
    if (trimmed === "") return srcset;
    let urlEnd = trimmed.indexOf(" ");
    if (urlEnd === -1) urlEnd = trimmed.length;
    const leading = part.substring(0, leadingWhitespace);
    const url = trimmed.substring(0, urlEnd);
    const trailing = trimmed.substring(urlEnd);
    constructed.push(leading + assetInternal(url, buildId) + trailing);
  }
  return constructed.join(",");
}
function assetHashingHook(vnode, buildId) {
  if (vnode.type === "img" || vnode.type === "source") {
    const {
      props
    } = vnode;
    if (props["data-fresh-disable-lock"]) return;
    if (typeof props.src === "string") {
      props.src = assetInternal(props.src, buildId);
    }
    if (typeof props.srcset === "string") {
      props.srcset = assetSrcSetInternal(props.srcset, buildId);
    }
  }
}
const HeadContext = X(false);
function Head(props) {
  return k$2(HeadContext, {
    value: true
  }, props.children);
}
function asset(path) {
  return assetInternal(path, BUILD_ID);
}
function Partial(props) {
  return props.children;
}
Partial.displayName = "Partial";
const UNDEFINED = -1;
const NULL = -2;
const NAN = -3;
const INFINITY_POS = -4;
const INFINITY_NEG = -5;
const ZERO_NEG = -6;
const HOLE = -7;
function stringify(data, custom) {
  const out = [];
  const indexes = /* @__PURE__ */ new Map();
  const res = serializeInner(out, indexes, data, custom);
  if (res < 0) {
    return String(res);
  }
  return `[${out.join(",")}]`;
}
function serializeInner(out, indexes, value, custom) {
  const seenIdx = indexes.get(value);
  if (seenIdx !== void 0) return seenIdx;
  if (value === void 0) return UNDEFINED;
  if (value === null) return NULL;
  if (Number.isNaN(value)) return NAN;
  if (value === Infinity) return INFINITY_POS;
  if (value === -Infinity) return INFINITY_NEG;
  if (value === 0 && 1 / value < 0) return ZERO_NEG;
  const idx = out.length;
  out.push("");
  indexes.set(value, idx);
  let str = "";
  if (typeof value === "number") {
    str += String(value);
  } else if (typeof value === "boolean") {
    str += String(value);
  } else if (typeof value === "bigint") {
    str += `["BigInt","${value}"]`;
  } else if (typeof value === "string") {
    str += JSON.stringify(value);
  } else if (Array.isArray(value)) {
    str += "[";
    for (let i2 = 0; i2 < value.length; i2++) {
      if (i2 in value) {
        str += serializeInner(out, indexes, value[i2], custom);
      } else {
        str += HOLE;
      }
      if (i2 < value.length - 1) {
        str += ",";
      }
    }
    str += "]";
  } else if (typeof value === "object") {
    if (custom !== void 0) {
      for (const k2 in custom) {
        const fn = custom[k2];
        if (fn === void 0) continue;
        const res = fn(value);
        if (res === void 0) continue;
        const innerIdx = serializeInner(out, indexes, res.value, custom);
        str = `["${k2}",${innerIdx}]`;
        out[idx] = str;
        return idx;
      }
    }
    if (value instanceof URL) {
      str += `["URL","${value.href}"]`;
    } else if (value instanceof Date) {
      let iso;
      try {
        iso = value.toISOString();
      } catch {
        iso = "Invalid Date";
      }
      str += `["Date","${iso}"]`;
    } else if (value instanceof RegExp) {
      str += `["RegExp",${JSON.stringify(value.source)}, "${value.flags}"]`;
    } else if (value instanceof Uint8Array) {
      str += `["Uint8Array","${b64encode(value.buffer)}"]`;
    } else if (value instanceof Set) {
      const items = new Array(value.size);
      let i2 = 0;
      value.forEach((v2) => {
        items[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Set",[${items.join(",")}]]`;
    } else if (value instanceof Map) {
      const items = new Array(value.size * 2);
      let i2 = 0;
      value.forEach((v2, k2) => {
        items[i2++] = serializeInner(out, indexes, k2, custom);
        items[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Map",[${items.join(",")}]]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.Instant) {
      str += `["Temporal.Instant","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.ZonedDateTime) {
      str += `["Temporal.ZonedDateTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainDate) {
      str += `["Temporal.PlainDate","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainTime) {
      str += `["Temporal.PlainTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainDateTime) {
      str += `["Temporal.PlainDateTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainYearMonth) {
      str += `["Temporal.PlainYearMonth","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainMonthDay) {
      str += `["Temporal.PlainMonthDay","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.Duration) {
      str += `["Temporal.Duration","${value.toString()}"]`;
    } else {
      str += "{";
      const keys = Object.keys(value);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        str += JSON.stringify(key) + ":";
        str += serializeInner(out, indexes, value[key], custom);
        if (i2 < keys.length - 1) {
          str += ",";
        }
      }
      str += "}";
    }
  } else if (typeof value === "function") {
    throw new Error(`Serializing functions is not supported.`);
  }
  out[idx] = str;
  return idx;
}
const base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
function b64encode(buffer) {
  const uint8 = new Uint8Array(buffer);
  let result = "", i2;
  const l2 = uint8.length;
  for (i2 = 2; i2 < l2; i2 += 3) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2 | uint8[i2] >> 6];
    result += base64abc[uint8[i2] & 63];
  }
  if (i2 === l2 + 1) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4];
    result += "==";
  }
  if (i2 === l2) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
const rawToEntityEntries = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]];
Object.fromEntries([...rawToEntityEntries.map(([raw, entity]) => [entity, raw]), ["&apos;", "'"], ["&nbsp;", " "]]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[...rawToEntity.keys()].join("")}]`, "g");
function escape(str) {
  return str.replaceAll(rawRe, (m2) => rawToEntity.get(m2));
}
function tabs2Spaces(str) {
  return str.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length));
}
function createCodeFrame(text, lineNum, columnNum) {
  const before = 2;
  const after = 3;
  const lines = text.split("\n");
  if (lines.length <= lineNum || lines[lineNum].length < columnNum) {
    return;
  }
  const start = Math.max(0, lineNum - before);
  const end = Math.min(lines.length, lineNum + after + 1);
  const maxLineNum = String(end).length;
  const padding = " ".repeat(maxLineNum);
  const spaceLines = [];
  let maxLineLen = 0;
  for (let i2 = start; i2 < end; i2++) {
    const line = tabs2Spaces(lines[i2]);
    spaceLines.push(line);
    if (line.length > maxLineLen) maxLineLen = line.length;
  }
  const activeLine = spaceLines[lineNum - start];
  const count = Math.max(0, activeLine.length - lines[lineNum].length + columnNum);
  const sep = "|";
  let out = "";
  for (let i2 = 0; i2 < spaceLines.length; i2++) {
    const line = spaceLines[i2];
    const currentLine = (padding + (i2 + start + 1)).slice(-maxLineNum);
    if (i2 === lineNum - start) {
      out += `> ${currentLine} ${sep} ${line}
`;
      const columnMarker = "^";
      out += `  ${padding} ${sep} ${" ".repeat(count)}${columnMarker}
`;
    } else {
      out += `  ${currentLine} ${sep} ${line}
`;
    }
  }
  return out;
}
const STACK_FRAME = /^\s*at\s+(?:(.*)\s+)?\((.*):(\d+):(\d+)\)$/;
function getFirstUserFile(stack, rootDir) {
  const lines = stack.split("\n");
  for (let i2 = 0; i2 < lines.length; i2++) {
    const match = lines[i2].match(STACK_FRAME);
    if (match) {
      const fnName = match[1] ?? "";
      const file = match[2];
      const line = +match[3];
      const column = +match[4];
      if (file.startsWith("file://")) {
        const filePath = fromFileUrl(file);
        if (relative(rootDir, filePath).startsWith(".")) {
          continue;
        }
        return {
          fnName,
          file,
          line,
          column
        };
      }
    }
  }
}
function getCodeFrame(stack, rootDir) {
  const file = getFirstUserFile(stack, rootDir);
  if (file) {
    try {
      const filePath = fromFileUrl(file.file);
      const text = Deno.readTextFileSync(filePath);
      return createCodeFrame(text, file.line - 1, file.column - 1);
    } catch {
    }
  }
}
const SCRIPT_ESCAPE = /<\/(style|script)/gi;
const COMMENT_ESCAPE = /<!--/gi;
function escapeScript(content, options2 = {}) {
  return content.replaceAll(SCRIPT_ESCAPE, "<\\/$1").replaceAll(COMMENT_ESCAPE, options2.json ? "\\u003C!--" : "\\x3C!--");
}
class UniqueNamer {
  #seen = /* @__PURE__ */ new Map();
  getUniqueName(name) {
    name = name.replaceAll(/([^A-Za-z0-9_$]+)/g, "_");
    if (/^\d/.test(name) || JS_RESERVED.has(name)) {
      name = "_" + name;
    }
    const count = this.#seen.get(name);
    if (count === void 0) {
      this.#seen.set(name, 1);
    } else {
      this.#seen.set(name, count + 1);
      name = `${name}_${count}`;
    }
    return name;
  }
}
const JS_RESERVED = /* @__PURE__ */ new Set([
  // Reserved keywords
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "let",
  "static",
  "yield",
  "await",
  "enum",
  "implements",
  "interface",
  "package",
  "private",
  "protected",
  "public",
  "abstract",
  "boolean",
  "byte",
  "char",
  "double",
  "final",
  "float",
  "goto",
  "int",
  "long",
  "native",
  "short",
  "synchronized",
  "throws",
  "transient",
  "volatile",
  "arguments",
  "as",
  "async",
  "eval",
  "from",
  "get",
  "of",
  "set",
  // JavaScript built-in objects that could cause shadowing bugs
  "Array",
  "ArrayBuffer",
  "Boolean",
  "DataView",
  "Date",
  "Error",
  "EvalError",
  "Float32Array",
  "Float64Array",
  "Function",
  "Infinity",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Intl",
  "JSON",
  "Map",
  "Math",
  "NaN",
  "Number",
  "Object",
  "Promise",
  "Proxy",
  "RangeError",
  "ReferenceError",
  "Reflect",
  "RegExp",
  "Set",
  "String",
  "Symbol",
  "SyntaxError",
  "TypeError",
  "Uint8Array",
  "Uint8ClampedArray",
  "Uint16Array",
  "Uint32Array",
  "URIError",
  "WeakMap",
  "WeakSet",
  "BigInt",
  "BigInt64Array",
  "BigUint64Array",
  // Web APIs commonly used in islands
  "console",
  "fetch",
  "Request",
  "Response",
  "Headers",
  "URL",
  "URLSearchParams",
  "Event",
  "EventTarget",
  "AbortController",
  "AbortSignal",
  "FormData",
  "Blob",
  "File",
  "FileReader",
  "TextEncoder",
  "TextDecoder",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "WebSocket",
  "Worker",
  "MessageChannel",
  "MessagePort",
  "BroadcastChannel",
  "crypto",
  "atob",
  "btoa",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "queueMicrotask",
  "structuredClone",
  // Browser-specific globals
  "document",
  "window",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  // Deno-specific globals
  "Deno",
  // Node.js compatibility globals (for Deno's Node compat mode)
  "process",
  "global",
  "Buffer"
]);
function isLazy(value) {
  return typeof value === "function";
}
var t, r, u$1, i$1, o$1 = 0, f$2 = [], c$1 = l$3, e = c$1.__b, a$1 = c$1.__r, v$1 = c$1.diffed, l$1 = c$1.__c, m$1 = c$1.unmount, p$1 = c$1.__;
function s$1(n2, t2) {
  c$1.__h && c$1.__h(r, n2, o$1 || t2), o$1 = 0;
  var u2 = r.__H || (r.__H = {
    __: [],
    __h: []
  });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d$1(n2) {
  return o$1 = 1, y$1(D, n2);
}
function y$1(n2, u2, i2) {
  var o2 = s$1(t++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [D(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r, !r.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = false, i3 = o2.__c.props !== n3;
      if (o2.__c.__H.__.some(function(n4) {
        if (n4.__N) {
          u3 = true;
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2) {
        var f3 = c2.call(this, n3, t2, r2);
        return u3 ? f3 || i3 : f3;
      }
      return !u3 || i3;
    };
    r.__f = true;
    var c2 = r.shouldComponentUpdate, e2 = r.componentWillUpdate;
    r.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function h$1(n2, u2) {
  var i2 = s$1(t++, 3);
  !c$1.__s && C(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r.__H.__h.push(i2));
}
function A(n2) {
  return o$1 = 5, T$1(function() {
    return {
      current: n2
    };
  }, []);
}
function T$1(n2, r2) {
  var u2 = s$1(t++, 7);
  return C(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function x$1(n2) {
  var u2 = r.context[n2.__c], i2 = s$1(t++, 9);
  return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r)), u2.props.value) : n2.__;
}
function j$1() {
  for (var n2; n2 = f$2.shift(); ) {
    var t2 = n2.__H;
    if (n2.__P && t2) try {
      t2.__h.some(z$1), t2.__h.some(B$1), t2.__h = [];
    } catch (r2) {
      t2.__h = [], c$1.__e(r2, n2.__v);
    }
  }
}
c$1.__b = function(n2) {
  r = null, e && e(n2);
}, c$1.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), p$1 && p$1(n2, t2);
}, c$1.__r = function(n2) {
  a$1 && a$1(n2), t = 0;
  var i2 = (r = n2.__c).__H;
  i2 && (u$1 === r ? (i2.__h = [], r.__h = [], i2.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.some(z$1), i2.__h.some(B$1), i2.__h = [], t = 0)), u$1 = r;
}, c$1.diffed = function(n2) {
  v$1 && v$1(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f$2.push(t2) && i$1 === c$1.requestAnimationFrame || ((i$1 = c$1.requestAnimationFrame) || w$1)(j$1)), t2.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u, n3.u = void 0);
  })), u$1 = r = null;
}, c$1.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.some(z$1), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B$1(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c$1.__e(r2, n3.__v);
    }
  }), l$1 && l$1(n2, t2);
}, c$1.unmount = function(n2) {
  m$1 && m$1(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.some(function(n3) {
    try {
      z$1(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c$1.__e(t2, r2.__v));
};
var k$1 = "function" == typeof requestAnimationFrame;
function w$1(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k$1 && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k$1 && (t2 = requestAnimationFrame(r2));
}
function z$1(n2) {
  var t2 = r, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r = t2;
}
function B$1(n2) {
  var t2 = r;
  n2.__c = n2.__(), r = t2;
}
function C(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
const options = l$3;
class RenderState {
  ctx;
  buildCache;
  partialId;
  nonce;
  partialDepth;
  partialCount;
  error;
  // deno-lint-ignore no-explicit-any
  slots;
  // deno-lint-ignore no-explicit-any
  islandProps;
  islands;
  islandAssets;
  /** CSS assets already injected in `<head>` via `RemainingHead`. */
  injectedCss;
  // deno-lint-ignore no-explicit-any
  encounteredPartials;
  owners;
  ownerStack;
  headComponents;
  // TODO: merge into bitmask field
  renderedHtmlTag;
  renderedHtmlBody;
  renderedHtmlHead;
  hasRuntimeScript;
  /** Set to true when any element in the tree renders f-client-nav="true". */
  clientNavEnabled;
  /**
   * True when the page needs Fresh's client runtime (islands, client nav, or
   * `<Partial>` regions on a full document). Partial subresponses omit boot;
   * `encounteredPartials` must not force runtime for those requests.
   */
  get needsClientRuntime() {
    if (this.islands.size > 0 || this.clientNavEnabled) {
      return true;
    }
    if (!this.ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM) && this.encounteredPartials.size > 0) {
      return true;
    }
    return false;
  }
  constructor(ctx, buildCache, partialId) {
    this.ctx = ctx;
    this.buildCache = buildCache;
    this.partialId = partialId;
    this.partialDepth = 0;
    this.partialCount = 0;
    this.error = null;
    this.slots = [];
    this.islandProps = [];
    this.islands = /* @__PURE__ */ new Set();
    this.islandAssets = /* @__PURE__ */ new Set();
    this.injectedCss = /* @__PURE__ */ new Set();
    this.encounteredPartials = /* @__PURE__ */ new Set();
    this.owners = /* @__PURE__ */ new Map();
    this.ownerStack = [];
    this.headComponents = /* @__PURE__ */ new Map();
    this.renderedHtmlTag = false;
    this.renderedHtmlBody = false;
    this.renderedHtmlHead = false;
    this.hasRuntimeScript = false;
    this.clientNavEnabled = false;
    this.nonce = crypto.randomUUID().replace(/-/g, "");
  }
  clear() {
    this.islands.clear();
    this.encounteredPartials.clear();
    this.owners.clear();
    this.injectedCss.clear();
    this.slots = [];
    this.islandProps = [];
    this.ownerStack = [];
  }
}
let RENDER_STATE = null;
function setRenderState(state) {
  RENDER_STATE = state;
}
const oldVNodeHook = options[OptionsType.VNODE];
options[OptionsType.VNODE] = (vnode) => {
  if (RENDER_STATE !== null) {
    RENDER_STATE.owners.set(vnode, RENDER_STATE.ownerStack.at(-1));
    if (vnode.type === "a") {
      setActiveUrl(vnode, RENDER_STATE.ctx.url.pathname, RENDER_STATE.ctx.url.search);
    }
  }
  assetHashingHook(vnode, BUILD_ID);
  if (typeof vnode.type === "function") {
    if (vnode.type === Partial) {
      const props = vnode.props;
      const key = normalizeKey(vnode.key);
      const mode = !props.mode || props.mode === "replace" ? PartialMode.Replace : props.mode === "append" ? PartialMode.Append : PartialMode.Prepend;
      props.children = wrapWithMarker(props.children, "partial", `${props.name}:${mode}:${key}`);
    }
  } else if (typeof vnode.type === "string") {
    if (RENDER_STATE !== null && (vnode.type === "script" || vnode.type === "style")) {
      const props = vnode.props;
      if (!props.nonce) {
        props.nonce = RENDER_STATE.nonce;
      }
    }
    if (vnode.type === "body") {
      const scripts = k$2(FreshScripts, null);
      if (vnode.props.children == null) {
        vnode.props.children = scripts;
      } else if (Array.isArray(vnode.props.children)) {
        vnode.props.children.push(scripts);
      } else {
        vnode.props.children = [vnode.props.children, scripts];
      }
    }
    if (CLIENT_NAV_ATTR in vnode.props) {
      vnode.props[CLIENT_NAV_ATTR] = String(vnode.props[CLIENT_NAV_ATTR]);
    }
  }
  oldVNodeHook?.(vnode);
};
const oldAttrHook = options[OptionsType.ATTR];
options[OptionsType.ATTR] = (name, value) => {
  if (name === CLIENT_NAV_ATTR) {
    return `${CLIENT_NAV_ATTR}="${String(Boolean(value))}"`;
  } else if (name === "key") {
    return `${DATA_FRESH_KEY}="${escape(String(value))}"`;
  }
  return oldAttrHook?.(name, value);
};
const PATCHED = /* @__PURE__ */ new WeakSet();
function normalizeKey(key) {
  const value = key ?? "";
  const s2 = typeof value !== "string" ? String(value) : value;
  return s2.replaceAll(":", "_");
}
const oldDiff = options[OptionsType.DIFF];
options[OptionsType.DIFF] = (vnode) => {
  if (RENDER_STATE !== null) {
    patcher: if (typeof vnode.type === "function" && vnode.type !== S) {
      if (vnode.type === Partial) {
        RENDER_STATE.partialDepth++;
        const name = vnode.props.name;
        if (typeof name === "string") {
          if (RENDER_STATE.encounteredPartials.has(name)) {
            throw new Error(`Rendered response contains duplicate partial name: "${name}"`);
          }
          RENDER_STATE.encounteredPartials.add(name);
        }
        if (hasIslandOwner(RENDER_STATE, vnode)) {
          throw new Error(`<Partial> components cannot be used inside islands.`);
        }
        const mode = vnode.props.mode;
        if ((mode === "append" || mode === "prepend") && vnode.key == null) {
          console.warn(`<Partial name="${name}" mode="${mode}"> is missing a "key" prop. Without a key, Preact cannot correctly reconcile ${mode}ed children. Add a unique key to fix this.`);
        }
      } else if (!PATCHED.has(vnode)) {
        const island = RENDER_STATE.buildCache.islandRegistry.get(vnode.type);
        const insideIsland = hasIslandOwner(RENDER_STATE, vnode);
        if (island === void 0) {
          if (insideIsland) break patcher;
          if (vnode.key !== void 0) {
            const key = normalizeKey(vnode.key);
            const originalType2 = vnode.type;
            vnode.type = (props) => {
              const child = k$2(originalType2, props);
              PATCHED.add(child);
              return wrapWithMarker(child, "key", key);
            };
          }
          break patcher;
        }
        const {
          islands: islands2,
          islandProps,
          islandAssets
        } = RENDER_STATE;
        if (insideIsland) {
          for (let i2 = 0; i2 < island.css.length; i2++) {
            const css2 = island.css[i2];
            islandAssets.add(css2);
          }
          break patcher;
        }
        islands2.add(island);
        const originalType = vnode.type;
        vnode.type = (props) => {
          for (const name in props) {
            const value = props[name];
            if (name === "children" || t$2(value) && !isSignal(value)) {
              const slotId = RENDER_STATE.slots.length;
              RENDER_STATE.slots.push({
                id: slotId,
                name,
                vnode: value
              });
              props[name] = k$2(Slot, {
                name,
                id: slotId
              }, value);
            }
          }
          const propsIdx = islandProps.push({
            slots: [],
            props
          }) - 1;
          const child = k$2(originalType, props);
          PATCHED.add(child);
          const key = normalizeKey(vnode.key);
          return wrapWithMarker(child, "island", `${island.name}:${propsIdx}:${key}`);
        };
      }
    } else if (typeof vnode.type === "string") {
      switch (vnode.type) {
        case "html":
          RENDER_STATE.renderedHtmlTag = true;
          break;
        case "head": {
          RENDER_STATE.renderedHtmlHead = true;
          const entryAssets2 = RENDER_STATE.buildCache.getEntryAssets();
          const items = [];
          if (entryAssets2.length > 0) {
            for (let i2 = 0; i2 < entryAssets2.length; i2++) {
              const id = entryAssets2[i2];
              if (id.endsWith(".css")) {
                items.push(
                  // deno-lint-ignore no-explicit-any
                  k$2("link", {
                    rel: "stylesheet",
                    href: asset(id)
                  })
                );
              }
            }
          }
          const activeSpan = trace.getActiveSpan();
          if (activeSpan) {
            const spanCtx = activeSpan.spanContext();
            if (isSpanContextValid(spanCtx)) {
              const flags = spanCtx.traceFlags & 1 ? "01" : "00";
              const traceparent = `00-${spanCtx.traceId}-${spanCtx.spanId}-${flags}`;
              items.push(
                // deno-lint-ignore no-explicit-any
                k$2("meta", {
                  name: "traceparent",
                  content: traceparent
                })
              );
            }
          }
          items.push(k$2(RemainingHead, null));
          if (Array.isArray(vnode.props.children)) {
            vnode.props.children.push(...items);
          } else if (vnode.props.children !== null && typeof vnode.props.children === "object") {
            items.unshift(vnode.props.children);
            vnode.props.children = items;
          } else {
            vnode.props.children = items;
          }
          break;
        }
        case "body":
          RENDER_STATE.renderedHtmlBody = true;
          break;
        case "title":
        case "meta":
        case "link":
        case "script":
        case "style":
        case "base":
        case "noscript":
        case "template":
          {
            if (PATCHED.has(vnode)) {
              break;
            }
            const originalType = vnode.type;
            let cacheKey = vnode.key ?? (originalType === "title" ? "title" : null);
            if (cacheKey === null) {
              const props = vnode.props;
              const keys = Object.keys(vnode.props);
              keys.sort();
              cacheKey = `${originalType}`;
              for (let i2 = 0; i2 < keys.length; i2++) {
                const key = keys[i2];
                if (key === "children" || key === "nonce" || key === "ref") {
                  continue;
                } else if (key === "dangerouslySetInnerHTML") {
                  cacheKey += String(props[key].__html);
                  continue;
                } else if (originalType === "meta" && key === "content") {
                  continue;
                } else if (originalType === "link" && key === "href") {
                  continue;
                }
                cacheKey += `::${props[key]}`;
              }
            }
            const originalKey = vnode.key;
            vnode.type = (props) => {
              const value = x$1(HeadContext);
              if (originalKey) {
                props["data-key"] = originalKey;
              }
              const vnode2 = k$2(originalType, props);
              PATCHED.add(vnode2);
              if (RENDER_STATE !== null) {
                if (value) {
                  RENDER_STATE.headComponents.set(cacheKey, vnode2);
                  return null;
                } else if (value !== void 0) {
                  const cached = RENDER_STATE.headComponents.get(cacheKey);
                  if (cached !== void 0) {
                    RENDER_STATE.headComponents.delete(cacheKey);
                    return cached;
                  }
                }
              }
              return vnode2;
            };
          }
          break;
      }
      if (CLIENT_NAV_ATTR in vnode.props && vnode.props[CLIENT_NAV_ATTR] === "true") {
        RENDER_STATE.clientNavEnabled = true;
      }
      if (vnode.key !== void 0 && (RENDER_STATE.partialDepth > 0 || hasIslandOwner(RENDER_STATE, vnode))) {
        vnode.props[DATA_FRESH_KEY] = String(vnode.key);
      }
    }
  }
  oldDiff?.(vnode);
};
const oldRender = options[OptionsType.RENDER];
options[OptionsType.RENDER] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== S && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.push(vnode);
  }
  oldRender?.(vnode);
};
const oldDiffed = options[OptionsType.DIFFED];
options[OptionsType.DIFFED] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== S && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.pop();
    if (vnode.type === Partial) {
      RENDER_STATE.partialDepth--;
    }
  }
  oldDiffed?.(vnode);
};
function RemainingHead() {
  if (RENDER_STATE !== null) {
    const items = [];
    if (RENDER_STATE.headComponents.size > 0) {
      items.push(...RENDER_STATE.headComponents.values());
    }
    RENDER_STATE.islands.forEach((island) => {
      if (island.css.length > 0) {
        for (let i2 = 0; i2 < island.css.length; i2++) {
          const css2 = island.css[i2];
          if (!RENDER_STATE.injectedCss.has(css2)) {
            RENDER_STATE.injectedCss.add(css2);
            items.push(k$2("link", {
              rel: "stylesheet",
              href: css2
            }));
          }
        }
      }
    });
    RENDER_STATE.islandAssets.forEach((css2) => {
      if (!RENDER_STATE.injectedCss.has(css2)) {
        RENDER_STATE.injectedCss.add(css2);
        items.push(k$2("link", {
          rel: "stylesheet",
          href: css2
        }));
      }
    });
    if (items.length > 0) {
      return k$2(S, null, items);
    }
  }
  return null;
}
function Slot(props) {
  if (RENDER_STATE !== null) {
    RENDER_STATE.slots[props.id] = null;
  }
  return wrapWithMarker(props.children, "slot", `${props.id}:${props.name}`);
}
function hasIslandOwner(current, vnode) {
  let tmpVNode = vnode;
  let owner;
  while ((owner = current.owners.get(tmpVNode)) !== void 0) {
    if (current.buildCache.islandRegistry.has(owner.type)) {
      return true;
    }
    tmpVNode = owner;
  }
  return false;
}
function wrapWithMarker(vnode, kind, markerText) {
  return k$2(S, null, k$2(S, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: `frsh:${kind}:${markerText}`
  }), vnode, k$2(S, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: "/frsh:" + kind
  }));
}
function isSignal(x2) {
  return x2 !== null && typeof x2 === "object" && typeof x2.peek === "function" && "value" in x2;
}
function isComputedSignal(x2) {
  return isSignal(x2) && ("x" in x2 && typeof x2.x === "function" || "_fn" in x2 && typeof x2._fn === "function");
}
function isVNode(x2) {
  return x2 !== null && typeof x2 === "object" && "type" in x2 && "ref" in x2 && "__k" in x2 && t$2(x2);
}
const stringifiers = {
  Computed: (value) => {
    return isComputedSignal(value) ? {
      value: value.peek()
    } : void 0;
  },
  Signal: (value) => {
    return isSignal(value) ? {
      value: value.peek()
    } : void 0;
  },
  Slot: (value) => {
    if (isVNode(value) && value.type === Slot) {
      const props = value.props;
      return {
        value: {
          name: props.name,
          id: props.id
        }
      };
    }
  }
};
function FreshScripts() {
  if (RENDER_STATE === null) return null;
  if (RENDER_STATE.hasRuntimeScript) {
    return null;
  }
  RENDER_STATE.hasRuntimeScript = true;
  const {
    slots
  } = RENDER_STATE;
  const lateCssLinks = [];
  RENDER_STATE.islands.forEach((island) => {
    for (let i2 = 0; i2 < island.css.length; i2++) {
      const css2 = island.css[i2];
      if (!RENDER_STATE.injectedCss.has(css2)) {
        RENDER_STATE.injectedCss.add(css2);
        lateCssLinks.push(k$2("link", {
          rel: "stylesheet",
          href: css2
        }));
      }
    }
  });
  RENDER_STATE.islandAssets.forEach((css2) => {
    if (!RENDER_STATE.injectedCss.has(css2)) {
      RENDER_STATE.injectedCss.add(css2);
      lateCssLinks.push(k$2("link", {
        rel: "stylesheet",
        href: css2
      }));
    }
  });
  return k$2(S, null, ...lateCssLinks, slots.map((slot) => {
    if (slot === null) return null;
    return k$2("template", {
      key: slot.id,
      id: `frsh-${slot.id}-${slot.name}`
    }, slot.vnode);
  }), k$2(FreshRuntimeScript, null));
}
function FreshRuntimeScript() {
  const {
    islands: islands2,
    nonce,
    ctx,
    islandProps,
    partialId,
    buildCache
  } = RENDER_STATE;
  const basePath = ctx.config.basePath;
  const islandArr = Array.from(islands2);
  if (ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
    const islands22 = islandArr.map((island) => {
      return {
        exportName: island.exportName,
        chunk: island.file,
        name: island.name
      };
    });
    const serializedProps = stringify(islandProps, stringifiers);
    const json = {
      islands: islands22,
      props: serializedProps
    };
    return k$2("script", {
      id: `__FRSH_STATE_${partialId}`,
      type: "application/json",
      dangerouslySetInnerHTML: {
        __html: escapeScript(JSON.stringify(json), {
          json: true
        })
      }
    });
  } else if (RENDER_STATE.needsClientRuntime || buildCache.hmrClientEntry !== void 0) {
    const islandImports = islandArr.map((island) => {
      const named = island.exportName === "default" ? island.name : island.exportName === island.name ? `{ ${island.exportName} }` : `{ ${island.exportName} as ${island.name} }`;
      const islandSpec = island.file.startsWith(".") ? island.file.slice(1) : island.file;
      return `import ${named} from "${basePath}${islandSpec}";`;
    }).join("");
    const islandObj = "{" + islandArr.map((island) => island.name).join(",") + "}";
    const serializedProps = escapeScript(JSON.stringify(stringify(islandProps, stringifiers)), {
      json: true
    });
    const runtimeUrl = buildCache.clientEntry.startsWith(".") ? buildCache.clientEntry.slice(1) : buildCache.clientEntry;
    const scriptContent = `import { boot } from "${basePath}${runtimeUrl}";${islandImports}boot(${islandObj},${serializedProps});`;
    return k$2(S, null, k$2("script", {
      type: "module",
      nonce,
      dangerouslySetInnerHTML: {
        __html: scriptContent
      }
    }), buildCache.features.errorOverlay ? k$2(ShowErrorOverlay, null) : null);
  }
  return buildCache.features.errorOverlay ? k$2(ShowErrorOverlay, null) : null;
}
function ShowErrorOverlay() {
  if (RENDER_STATE === null) return null;
  const {
    ctx
  } = RENDER_STATE;
  const error = ctx.error;
  if (error === null || error === void 0) return null;
  if (error instanceof HttpError && error.status < 500) {
    return null;
  }
  const basePath = ctx.config.basePath;
  const searchParams = new URLSearchParams();
  if (typeof error === "object") {
    if ("message" in error) {
      searchParams.append("message", String(error.message));
    }
    if ("stack" in error && typeof error.stack === "string") {
      searchParams.append("stack", error.stack);
      const codeFrame = getCodeFrame(error.stack, ctx.config.root);
      if (codeFrame !== void 0) {
        searchParams.append("code-frame", codeFrame);
      }
    }
  } else {
    searchParams.append("message", String(error));
  }
  return k$2("iframe", {
    id: "fresh-error-overlay",
    src: `${basePath}${DEV_ERROR_OVERLAY_URL}?${searchParams.toString()}`,
    style: "unset: all; position: fixed; top: 0; left: 0; z-index: 99999; width: 100%; height: 100%; border: none;"
  });
}
const NONCE_SYMBOL = /* @__PURE__ */ Symbol.for("__freshNonce");
const version$2 = "2.3.3";
const denoJson = {
  version: version$2
};
const CURRENT_FRESH_VERSION = denoJson.version;
const tracer = trace.getTracer("fresh", CURRENT_FRESH_VERSION);
function recordSpanError(span, err) {
  if (err instanceof Error) {
    span.recordException(err);
  } else {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: String(err)
    });
  }
}
function isAsyncAnyComponent(fn) {
  return typeof fn === "function" && fn.constructor.name === "AsyncFunction";
}
async function renderAsyncAnyComponent(fn, props) {
  return await tracer.startActiveSpan("invoke async component", async (span) => {
    span.setAttribute("fresh.span_type", "fs_routes/async_component");
    try {
      const result = await fn(props);
      span.setAttribute("fresh.component_response", result instanceof Response ? "http" : "jsx");
      return result;
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}
async function renderRouteComponent(ctx, def, child) {
  const vnodeProps = {
    Component: child,
    config: ctx.config,
    data: def.props,
    error: ctx.error,
    info: ctx.info,
    isPartial: ctx.isPartial,
    params: ctx.params,
    req: ctx.req,
    state: ctx.state,
    url: ctx.url,
    route: ctx.route
  };
  if (isAsyncAnyComponent(def.component)) {
    const result = await renderAsyncAnyComponent(def.component, vnodeProps);
    if (result instanceof Response) {
      return result;
    }
    return result;
  }
  return k$2(def.component, vnodeProps);
}
var o = "__s", i = "__c", a = "__k", u = "__d", c = "__s", f$1 = /[\s\n\\/='"\0<>]/, s = /^(xlink|xmlns|xml)([A-Z])/, l = /^(?:accessK|auto[A-Z]|cell|ch|col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z])/, p = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, h = /* @__PURE__ */ new Set(["draggable", "spellcheck"]);
function d(e2) {
  void 0 !== e2.__g ? e2.__g |= 8 : e2[u] = true;
}
function v(e2) {
  void 0 !== e2.__g ? e2.__g &= -9 : e2[u] = false;
}
function m(e2) {
  return void 0 !== e2.__g ? !!(8 & e2.__g) : true === e2[u];
}
var y = /["&<]/;
function _(e2) {
  if (0 === e2.length || false === y.test(e2)) return e2;
  for (var t2 = 0, n2 = 0, r2 = "", o2 = ""; n2 < e2.length; n2++) {
    switch (e2.charCodeAt(n2)) {
      case 34:
        o2 = "&quot;";
        break;
      case 38:
        o2 = "&amp;";
        break;
      case 60:
        o2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== t2 && (r2 += e2.slice(t2, n2)), r2 += o2, t2 = n2 + 1;
  }
  return n2 !== t2 && (r2 += e2.slice(t2, n2)), r2;
}
var g = {}, k = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), b = /[A-Z]/g;
function x(e2) {
  var t2 = "";
  for (var n2 in e2) {
    var r2 = e2[n2];
    if (null != r2 && "" !== r2) {
      var o2 = "-" == n2[0] ? n2 : g[n2] || (g[n2] = n2.replace(b, "-$&").toLowerCase()), i2 = ";";
      "number" != typeof r2 || o2.startsWith("--") || k.has(o2) || (i2 = "px;"), t2 = t2 + o2 + ":" + r2 + i2;
    }
  }
  return t2 || void 0;
}
function w() {
  this.__d = true;
}
function H(e2, t2) {
  return {
    __v: e2,
    context: t2,
    props: e2.props,
    setState: w,
    forceUpdate: w,
    __d: true,
    __h: new Array(0)
  };
}
var T = {}, j = [], P = Array.isArray, $ = Object.assign, U = "", Z = "<!--$s-->", F = "<!--/$s-->";
function M(e2) {
  return "string" == typeof e2 ? Z + e2 + F : P(e2) ? (e2.unshift(Z), e2.push(F), e2) : e2 && "function" == typeof e2.then ? e2.then(M) : Z + e2 + F;
}
function W() {
  return {
    beforeDiff: l$3.__b,
    afterDiff: l$3.diffed,
    renderHook: l$3.__r,
    unmountHook: l$3.unmount,
    rootHook: l$3.__,
    commitHook: l$3.__c,
    catchError: l$3.__e,
    errorBoundaries: l$3.errorBoundaries
  };
}
function B(e2) {
  var t2 = l$3[o];
  l$3[o] = true;
  try {
    return e2();
  } finally {
    l$3[o] = t2;
  }
}
function z(n2, r2, o2) {
  var i2 = W();
  try {
    var u2 = B(function() {
      var u3, c2 = k$2(S, null);
      return c2[a] = [n2], i2.rootHook && i2.rootHook(n2, ((u3 = {})[a] = c2, u3.nodeType = 1, u3)), q(n2, r2 || T, false, void 0, c2, false, o2, i2);
    });
    return P(u2) ? u2.join(U) : u2;
  } catch (e2) {
    if (e2.then) throw new Error('Use "renderToStringAsync" for suspenseful rendering.');
    throw e2;
  } finally {
    i2.commitHook && B(function() {
      return i2.commitHook(n2, j);
    }), j.length = 0;
  }
}
function N(e2, t2, n2) {
  var r2, o2 = e2.type, a2 = true;
  return e2[i] ? (a2 = false, (r2 = e2[i]).state = r2[c]) : r2 = new o2(e2.props, t2), e2[i] = r2, r2.__v = e2, r2.props = e2.props, r2.context = t2, d(r2), null == r2.state && (r2.state = T), null == r2[c] && (r2[c] = r2.state), o2.getDerivedStateFromProps ? r2.state = $({}, r2.state, o2.getDerivedStateFromProps(r2.props, r2.state)) : a2 && r2.componentWillMount ? (r2.componentWillMount(), r2.state = r2[c] !== r2.state ? r2[c] : r2.state) : !a2 && r2.componentWillUpdate && r2.componentWillUpdate(), n2.renderHook && n2.renderHook(e2), r2.render(r2.props, r2.state, t2);
}
function q(e2, n2, o2, u2, y2, g2, k2, b2) {
  if (null == e2 || true === e2 || false === e2 || e2 === U) return U;
  var w2 = typeof e2;
  if ("object" != w2) return "function" == w2 ? U : "string" == w2 ? _(e2) : e2 + U;
  if (P(e2)) {
    var C2, D2 = U;
    y2[a] = e2;
    for (var A2 = e2.length, S$1 = 0; S$1 < A2; S$1++) {
      var E2 = e2[S$1];
      if (null != E2 && "boolean" != typeof E2) {
        var L2, j2 = q(E2, n2, o2, u2, y2, g2, k2, b2);
        "string" == typeof j2 ? D2 += j2 : (C2 || (C2 = new Array(A2)), D2 && C2.push(D2), D2 = U, P(j2) ? (L2 = C2).push.apply(L2, j2) : C2.push(j2));
      }
    }
    return C2 ? (D2 && C2.push(D2), C2) : D2;
  }
  if (!t$2(e2)) return U;
  e2.__ = y2, b2.beforeDiff && b2.beforeDiff(e2);
  var Z2 = e2.type, F2 = e2.props;
  if ("function" == typeof Z2) {
    var W2, z2, O2, R = n2;
    if (Z2 === S) {
      if ("tpl" in F2) {
        for (var K2, G2 = U, J2 = 0; J2 < F2.tpl.length; J2++) if (G2 += F2.tpl[J2], F2.exprs && J2 < F2.exprs.length) {
          var Q2 = F2.exprs[J2];
          if (null == Q2) continue;
          if ("object" == typeof Q2 && (t$2(Q2) || P(Q2))) {
            var X2, Y = q(Q2, n2, o2, u2, e2, g2, k2, b2);
            "string" == typeof Y ? G2 += Y : (K2 || (K2 = []), G2 && K2.push(G2), G2 = U, P(Y) ? (X2 = K2).push.apply(X2, Y) : K2.push(Y));
          } else G2 += Q2;
        }
        return K2 ? (G2 && K2.push(G2), K2) : G2;
      }
      if ("UNSTABLE_comment" in F2) return "<!--" + _(F2.UNSTABLE_comment) + "-->";
      z2 = F2.children;
    } else {
      if (null != (W2 = Z2.contextType)) {
        var ee = n2[W2.__c];
        R = ee ? ee.props.value : W2.__;
      }
      var te = Z2.prototype && "function" == typeof Z2.prototype.render;
      if (te) z2 = /**#__NOINLINE__**/
      N(e2, R, b2), O2 = e2[i];
      else {
        e2[i] = O2 = /**#__NOINLINE__**/
        H(e2, R);
        for (var ne = 0; m(O2) && ne++ < 25; ) {
          v(O2), b2.renderHook && b2.renderHook(e2);
          try {
            z2 = Z2.call(O2, F2, R);
          } catch (t2) {
            throw t2;
          }
        }
        d(O2);
      }
      if (null != O2.getChildContext && (n2 = $({}, n2, O2.getChildContext())), te && b2.errorBoundaries && (Z2.getDerivedStateFromError || O2.componentDidCatch)) {
        z2 = null != z2 && z2.type === S && null == z2.key && null == z2.props.tpl ? z2.props.children : z2;
        try {
          return q(z2, n2, o2, u2, e2, g2, false, b2);
        } catch (r2) {
          return Z2.getDerivedStateFromError && (O2[c] = Z2.getDerivedStateFromError(r2)), O2.componentDidCatch && O2.componentDidCatch(r2, T), m(O2) ? (z2 = N(e2, n2, b2), null != (O2 = e2[i]).getChildContext && (n2 = $({}, n2, O2.getChildContext())), q(z2 = null != z2 && z2.type === S && null == z2.key && null == z2.props.tpl ? z2.props.children : z2, n2, o2, u2, e2, g2, k2, b2)) : U;
        } finally {
          b2.afterDiff && b2.afterDiff(e2), b2.unmountHook && b2.unmountHook(e2);
        }
      }
    }
    z2 = null != z2 && z2.type === S && null == z2.key && null == z2.props.tpl ? z2.props.children : z2;
    try {
      var re2 = q(z2, n2, o2, u2, e2, g2, k2, b2);
      return b2.afterDiff && b2.afterDiff(e2), b2.unmountHook && b2.unmountHook(e2), e2._suspended ? M(re2) : re2;
    } catch (t2) {
      if (k2 && k2.onError) {
        var oe = (function t3(r2) {
          return k2.onError(r2, e2, function(e3, r3) {
            try {
              return B(function() {
                return q(e3, n2, o2, u2, r3, g2, k2, b2);
              });
            } catch (e4) {
              return t3(e4);
            }
          });
        })(t2);
        return void 0 !== oe ? oe : (b2.catchError && b2.catchError(t2, e2), U);
      }
      throw t2;
    }
  }
  var ie, ae = "<" + Z2, ue = U;
  for (var ce in F2) {
    var fe = F2[ce];
    if ("function" != typeof (fe = V(fe) ? fe.value : fe) || "class" === ce || "className" === ce) {
      switch (ce) {
        case "children":
          ie = fe;
          continue;
        case "key":
        case "ref":
        case "__self":
        case "__source":
          continue;
        case "htmlFor":
          if ("for" in F2) continue;
          ce = "for";
          break;
        case "className":
          if ("class" in F2) continue;
          ce = "class";
          break;
        case "defaultChecked":
          ce = "checked";
          break;
        case "defaultSelected":
          ce = "selected";
          break;
        case "defaultValue":
        case "value":
          switch (ce = "value", Z2) {
            case "textarea":
              ie = fe;
              continue;
            case "select":
              u2 = fe;
              continue;
            case "option":
              u2 != fe || "selected" in F2 || (ae += " selected");
          }
          break;
        case "dangerouslySetInnerHTML":
          ue = fe && fe.__html;
          continue;
        case "style":
          "object" == typeof fe && (fe = x(fe));
          break;
        case "acceptCharset":
          ce = "accept-charset";
          break;
        case "httpEquiv":
          ce = "http-equiv";
          break;
        default:
          if (f$1.test(ce)) continue;
          s.test(ce) ? ce = ce.replace(s, "$1:$2").toLowerCase() : "-" !== ce[4] && !h.has(ce) || null == fe ? o2 ? p.test(ce) && (ce = "panose1" === ce ? "panose-1" : ce.replace(/([A-Z])/g, "-$1").toLowerCase()) : l.test(ce) && (ce = ce.toLowerCase()) : fe += U;
      }
      null != fe && false !== fe && (ae = true === fe || fe === U ? ae + " " + ce : ae + " " + ce + '="' + _(fe + U) + '"');
    }
  }
  if (f$1.test(Z2)) throw new Error(Z2 + " is not a valid HTML tag name in " + ae + ">");
  if (ue || ("string" == typeof ie ? ue = _(ie) : null != ie && false !== ie && true !== ie && (ue = q(ie, n2, "svg" === Z2 || "foreignObject" !== Z2 && o2, u2, e2, g2, k2, b2))), b2.afterDiff && b2.afterDiff(e2), b2.unmountHook && b2.unmountHook(e2), !ue && I.has(Z2)) return ae + "/>";
  var se = "</" + Z2 + ">", le = ae + ">";
  return P(ue) ? [le].concat(ue, [se]) : "string" != typeof ue ? [le, ue, se] : le + ue + se;
}
var I = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
function V(e2) {
  return null !== e2 && "object" == typeof e2 && "function" == typeof e2.peek && "value" in e2;
}
const ENCODER = new TextEncoder();
function isWebSocketHandlers(value) {
  if (typeof value !== "object" || value === null) return false;
  const v2 = value;
  return typeof v2.open === "function" || typeof v2.message === "function" || typeof v2.close === "function" || typeof v2.error === "function";
}
let getBuildCache;
let getInternals;
let setAdditionalStyles;
class Context {
  constructor(req, url, info, route, params, config2, next, buildCache) {
    __privateAdd(this, _internal, {
      app: null,
      layouts: []
    });
    __publicField(this, "config");
    __publicField(this, "url");
    __publicField(this, "req");
    __publicField(this, "route");
    __publicField(this, "params");
    __publicField(this, "state", {});
    __publicField(this, "data");
    __publicField(this, "error", null);
    __publicField(this, "info");
    __publicField(this, "isPartial");
    __publicField(this, "next");
    __privateAdd(this, _buildCache);
    __privateAdd(this, _additionalStyles, null);
    __publicField(this, "Component");
    this.url = url;
    this.req = req;
    this.info = info;
    this.params = params;
    this.route = route;
    this.config = config2;
    this.isPartial = url.searchParams.has(PARTIAL_SEARCH_PARAM);
    this.next = next;
    __privateSet(this, _buildCache, buildCache);
  }
  /**
   * Return a redirect response to the specified path. This is the
   * preferred way to do redirects in Fresh.
   *
   * ```ts
   * ctx.redirect("/foo/bar") // redirect user to "<yoursite>/foo/bar"
   *
   * // Disallows protocol relative URLs for improved security. This
   * // redirects the user to `<yoursite>/evil.com` which is safe,
   * // instead of redirecting to `http://evil.com`.
   * ctx.redirect("//evil.com/");
   * ```
   */
  redirect(pathOrUrl, status = 302) {
    let location = pathOrUrl;
    if (pathOrUrl !== "/" && pathOrUrl.startsWith("/")) {
      let idx = pathOrUrl.indexOf("?");
      if (idx === -1) {
        idx = pathOrUrl.indexOf("#");
      }
      const pathname = idx > -1 ? pathOrUrl.slice(0, idx) : pathOrUrl;
      const search = idx > -1 ? pathOrUrl.slice(idx) : "";
      location = `${pathname.replaceAll(/\/+/g, "/")}${search}`;
    }
    if (this.isPartial) {
      const hashIdx = location.indexOf("#");
      const base = hashIdx > -1 ? location.slice(0, hashIdx) : location;
      const hash = hashIdx > -1 ? location.slice(hashIdx) : "";
      const separator = base.includes("?") ? "&" : "?";
      location = `${base}${separator}${PARTIAL_SEARCH_PARAM}=true${hash}`;
    }
    return new Response(null, {
      status,
      headers: {
        location
      }
    });
  }
  /**
   * Render JSX and return an HTML `Response` instance.
   * ```tsx
   * ctx.render(<h1>hello world</h1>);
   * ```
   */
  async render(vnode, init = {}, config2 = {}) {
    if (arguments.length === 0) {
      throw new Error(`No arguments passed to: ctx.render()`);
    } else if (vnode !== null && !t$2(vnode)) {
      throw new Error(`Non-JSX element passed to: ctx.render()`);
    }
    const defs = config2.skipInheritedLayouts ? [] : __privateGet(this, _internal).layouts;
    const appDef = config2.skipAppWrapper ? null : __privateGet(this, _internal).app;
    const props = this;
    for (let i2 = defs.length - 1; i2 >= 0; i2--) {
      const child = vnode;
      props.Component = () => child;
      const def = defs[i2];
      const result = await renderRouteComponent(this, def, () => child);
      if (result instanceof Response) {
        return result;
      }
      vnode = result;
    }
    let appChild = vnode;
    let appVNode;
    let hasApp = true;
    if (isAsyncAnyComponent(appDef)) {
      props.Component = () => appChild;
      const result = await renderAsyncAnyComponent(appDef, props);
      if (result instanceof Response) {
        return result;
      }
      appVNode = result;
    } else if (appDef !== null) {
      appVNode = k$2(appDef, {
        Component: () => appChild,
        config: this.config,
        data: null,
        error: this.error,
        info: this.info,
        isPartial: this.isPartial,
        params: this.params,
        req: this.req,
        state: this.state,
        url: this.url,
        route: this.route
      });
    } else {
      hasApp = false;
      appVNode = appChild ?? k$2(S, null);
    }
    const headers = getHeadersFromInit(init);
    headers.set("Content-Type", "text/html; charset=utf-8");
    const responseInit = {
      status: init.status ?? 200,
      headers,
      statusText: init.statusText
    };
    let partialId = "";
    if (this.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
      partialId = crypto.randomUUID();
      headers.set("X-Fresh-Id", partialId);
    }
    let renderNonce = "";
    const html = tracer.startActiveSpan("render", (span) => {
      span.setAttribute("fresh.span_type", "render");
      const state = new RenderState(this, __privateGet(this, _buildCache), partialId);
      if (__privateGet(this, _additionalStyles) !== null) {
        for (let i2 = 0; i2 < __privateGet(this, _additionalStyles).length; i2++) {
          const css2 = __privateGet(this, _additionalStyles)[i2];
          state.islandAssets.add(css2);
        }
      }
      try {
        setRenderState(state);
        let html2 = z(vnode ?? k$2(S, null));
        if (hasApp) {
          appChild = a$2([html2]);
          html2 = z(appVNode);
        }
        if (!state.renderedHtmlBody || !state.renderedHtmlHead || !state.renderedHtmlTag) {
          let fallback = a$2([html2]);
          if (!state.renderedHtmlBody) {
            let scripts = null;
            if (this.url.pathname !== this.config.basePath + DEV_ERROR_OVERLAY_URL) {
              scripts = k$2(FreshScripts, null);
            }
            fallback = k$2("body", null, fallback, scripts);
          }
          if (!state.renderedHtmlHead) {
            fallback = k$2(S, null, k$2("head", null, k$2("meta", {
              charset: "utf-8"
            })), fallback);
          }
          if (!state.renderedHtmlTag) {
            fallback = k$2("html", null, fallback);
          }
          html2 = z(fallback);
        }
        return `<!DOCTYPE html>${html2}`;
      } catch (err) {
        if (err instanceof Error) {
          span.recordException(err);
        } else {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: String(err)
          });
        }
        throw err;
      } finally {
        const basePath = this.config.basePath;
        const linkParts = [];
        if (state.needsClientRuntime || state.buildCache.hmrClientEntry !== void 0) {
          const runtimeUrl = state.buildCache.clientEntry.startsWith(".") ? state.buildCache.clientEntry.slice(1) : state.buildCache.clientEntry;
          linkParts.push(`<${encodeURI(`${basePath}${runtimeUrl}`)}>; rel="modulepreload"; as="script"`);
          state.islands.forEach((island) => {
            const specifier = `${basePath}${island.file.startsWith(".") ? island.file.slice(1) : island.file}`;
            linkParts.push(`<${encodeURI(specifier)}>; rel="modulepreload"; as="script"`);
          });
        }
        if (linkParts.length > 0) {
          headers.append("Link", linkParts.join(", "));
        }
        renderNonce = state.nonce;
        state.clear();
        setRenderState(null);
        span.end();
      }
    });
    const response = new Response(html, responseInit);
    response[NONCE_SYMBOL] = renderNonce;
    return response;
  }
  /**
   * Respond with text. Sets `Content-Type: text/plain`.
   * ```tsx
   * app.use(ctx => ctx.text("Hello World!"));
   * ```
   */
  text(content, init) {
    return new Response(content, init);
  }
  /**
   * Respond with html string. Sets `Content-Type: text/html`.
   * ```tsx
   * app.get("/", ctx => ctx.html("<h1>foo</h1>"));
   * ```
   */
  html(content, init) {
    const headers = getHeadersFromInit(init);
    headers.set("Content-Type", "text/html; charset=utf-8");
    return new Response(content, {
      ...init,
      headers
    });
  }
  /**
   * Respond with json string, same as `Response.json()`. Sets
   * `Content-Type: application/json`.
   * ```tsx
   * app.get("/", ctx => ctx.json({ foo: 123 }));
   * ```
   */
  // deno-lint-ignore no-explicit-any
  json(content, init) {
    return Response.json(content, init);
  }
  /**
   * Helper to stream a sync or async iterable and encode text
   * automatically.
   *
   * ```tsx
   * function* gen() {
   *   yield "foo";
   *   yield "bar";
   * }
   *
   * app.use(ctx => ctx.stream(gen()))
   * ```
   *
   * Or pass in the function directly:
   *
   * ```tsx
   * app.use(ctx => {
   *   return ctx.stream(function* gen() {
   *     yield "foo";
   *     yield "bar";
   *   });
   * );
   * ```
   */
  stream(stream, init) {
    const raw = typeof stream === "function" ? stream() : stream;
    const body = ReadableStream.from(raw).pipeThrough(new TransformStream({
      transform(chunk, controller) {
        if (chunk instanceof Uint8Array) {
          controller.enqueue(chunk);
        } else if (chunk === void 0) {
          controller.enqueue(void 0);
        } else {
          const raw2 = ENCODER.encode(String(chunk));
          controller.enqueue(raw2);
        }
      }
    }));
    return new Response(body, init);
  }
  upgrade(handlersOrOptions, maybeOptions) {
    let handlers2;
    let options2;
    if (isWebSocketHandlers(handlersOrOptions)) {
      handlers2 = handlersOrOptions;
      options2 = maybeOptions;
    } else {
      options2 = handlersOrOptions;
    }
    if (this.req.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      throw new HttpError(400, "Expected a WebSocket upgrade request");
    }
    const {
      socket,
      response
    } = Deno.upgradeWebSocket(this.req, options2);
    if (handlers2 === void 0) {
      return {
        socket,
        response
      };
    }
    if (handlers2.open) {
      socket.addEventListener("open", () => handlers2.open(socket));
    }
    if (handlers2.message) {
      socket.addEventListener("message", (ev) => handlers2.message(socket, ev));
    }
    if (handlers2.close) {
      socket.addEventListener("close", (ev) => handlers2.close(socket, ev.code, ev.reason));
    }
    if (handlers2.error) {
      socket.addEventListener("error", (ev) => handlers2.error(socket, ev));
    }
    return response;
  }
}
_internal = /* @__PURE__ */ new WeakMap();
_buildCache = /* @__PURE__ */ new WeakMap();
_additionalStyles = /* @__PURE__ */ new WeakMap();
getInternals = (ctx) => __privateGet(ctx, _internal);
getBuildCache = (ctx) => __privateGet(ctx, _buildCache);
setAdditionalStyles = (ctx, css2) => __privateSet(ctx, _additionalStyles, css2);
function getHeadersFromInit(init) {
  if (init === void 0) {
    return new Headers();
  }
  return init.headers !== void 0 ? init.headers instanceof Headers ? init.headers : new Headers(init.headers) : new Headers();
}
function newByMethod() {
  return {
    GET: null,
    POST: null,
    PATCH: null,
    DELETE: null,
    PUT: null,
    HEAD: null,
    OPTIONS: null
  };
}
const IS_PATTERN = /[*:{}+?()]/;
const EMPTY = [];
class UrlPatternRouter {
  #statics = /* @__PURE__ */ new Map();
  #dynamics = /* @__PURE__ */ new Map();
  #dynamicArr = [];
  #allowed = /* @__PURE__ */ new Map();
  getAllowedMethods(pattern) {
    const allowed = this.#allowed.get(pattern);
    if (allowed === void 0) return EMPTY;
    return Array.from(allowed);
  }
  add(method, pathname, item) {
    let allowed = this.#allowed.get(pathname);
    if (allowed === void 0) {
      allowed = /* @__PURE__ */ new Set();
      this.#allowed.set(pathname, allowed);
    }
    allowed.add(method);
    let byMethod;
    if (IS_PATTERN.test(pathname)) {
      let def = this.#dynamics.get(pathname);
      if (def === void 0) {
        def = {
          pattern: new URLPattern({
            pathname
          }),
          byMethod: newByMethod()
        };
        this.#dynamics.set(pathname, def);
        this.#dynamicArr.push(def);
      }
      byMethod = def.byMethod;
    } else {
      let def = this.#statics.get(pathname);
      if (def === void 0) {
        def = {
          pattern: pathname,
          byMethod: newByMethod()
        };
        this.#statics.set(pathname, def);
      }
      byMethod = def.byMethod;
    }
    if (byMethod[method] === null) {
      byMethod[method] = item;
    }
  }
  match(method, url) {
    const result = {
      params: /* @__PURE__ */ Object.create(null),
      item: null,
      methodMatch: false,
      pattern: null
    };
    let pathname = url.pathname;
    let staticMatch = this.#statics.get(pathname);
    if (staticMatch === void 0 && pathname !== "/") {
      const alt = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname + "/";
      const altMatch = this.#statics.get(alt);
      if (altMatch !== void 0) {
        staticMatch = altMatch;
        pathname = alt;
      }
    }
    if (staticMatch !== void 0) {
      result.pattern = pathname;
      let item = staticMatch.byMethod[method];
      if (method === "HEAD" && item === null) {
        item = staticMatch.byMethod.GET;
      }
      if (item !== null) {
        result.methodMatch = true;
        result.item = item;
      }
      return result;
    }
    for (let i2 = 0; i2 < this.#dynamicArr.length; i2++) {
      const route = this.#dynamicArr[i2];
      const match = route.pattern.exec(url);
      if (match === null) continue;
      result.pattern = route.pattern.pathname;
      let item = route.byMethod[method];
      if (method === "HEAD" && item === null) {
        item = route.byMethod.GET;
      }
      if (item !== null) {
        result.methodMatch = true;
        result.item = item;
        for (const [key, value] of Object.entries(match.pathname.groups)) {
          result.params[key] = value === void 0 ? "" : decodeURI(value);
        }
      }
      break;
    }
    return result;
  }
}
function patternToSegments(path, root2, includeLast = false) {
  const out = [root2];
  if (path === "/" || path === "*" || path === "/*") return out;
  const cleaned = path.replace(/\{[^}]*\}\??/g, "");
  let start = -1;
  for (let i2 = 0; i2 < cleaned.length; i2++) {
    const ch = cleaned[i2];
    if (ch === "/") {
      if (i2 > 0) {
        const raw = cleaned.slice(start + 1, i2);
        out.push(raw);
      }
      start = i2;
    }
  }
  if (includeLast && start < cleaned.length - 1) {
    out.push(cleaned.slice(start + 1));
  }
  return out;
}
function mergePath(basePath, path, isMounting) {
  if (basePath.endsWith("*")) basePath = basePath.slice(0, -1);
  if (basePath === "/") basePath = "";
  if (path === "*") path = isMounting ? "" : "/*";
  else if (path === "/*") path = "/*";
  const s2 = basePath !== "" && path === "/" ? "" : path;
  return basePath + s2;
}
function toRoutePath(path) {
  if (path === "") return "*";
  return path;
}
const STATUS_CODE = {
  /** RFC 7231, 6.2.1 */
  Continue: 100,
  /** RFC 7231, 6.2.2 */
  SwitchingProtocols: 101,
  /** RFC 2518, 10.1 */
  Processing: 102,
  /** RFC 8297 **/
  EarlyHints: 103,
  /** RFC 7231, 6.3.1 */
  OK: 200,
  /** RFC 7231, 6.3.2 */
  Created: 201,
  /** RFC 7231, 6.3.3 */
  Accepted: 202,
  /** RFC 7231, 6.3.4 */
  NonAuthoritativeInfo: 203,
  /** RFC 7231, 6.3.5 */
  NoContent: 204,
  /** RFC 7231, 6.3.6 */
  ResetContent: 205,
  /** RFC 7233, 4.1 */
  PartialContent: 206,
  /** RFC 4918, 11.1 */
  MultiStatus: 207,
  /** RFC 5842, 7.1 */
  AlreadyReported: 208,
  /** RFC 3229, 10.4.1 */
  IMUsed: 226,
  /** RFC 7231, 6.4.1 */
  MultipleChoices: 300,
  /** RFC 7231, 6.4.2 */
  MovedPermanently: 301,
  /** RFC 7231, 6.4.3 */
  Found: 302,
  /** RFC 7231, 6.4.4 */
  SeeOther: 303,
  /** RFC 7232, 4.1 */
  NotModified: 304,
  /** RFC 7231, 6.4.5 */
  UseProxy: 305,
  /** RFC 7231, 6.4.7 */
  TemporaryRedirect: 307,
  /** RFC 7538, 3 */
  PermanentRedirect: 308,
  /** RFC 7231, 6.5.1 */
  BadRequest: 400,
  /** RFC 7235, 3.1 */
  Unauthorized: 401,
  /** RFC 7231, 6.5.2 */
  PaymentRequired: 402,
  /** RFC 7231, 6.5.3 */
  Forbidden: 403,
  /** RFC 7231, 6.5.4 */
  NotFound: 404,
  /** RFC 7231, 6.5.5 */
  MethodNotAllowed: 405,
  /** RFC 7231, 6.5.6 */
  NotAcceptable: 406,
  /** RFC 7235, 3.2 */
  ProxyAuthRequired: 407,
  /** RFC 7231, 6.5.7 */
  RequestTimeout: 408,
  /** RFC 7231, 6.5.8 */
  Conflict: 409,
  /** RFC 7231, 6.5.9 */
  Gone: 410,
  /** RFC 7231, 6.5.10 */
  LengthRequired: 411,
  /** RFC 7232, 4.2 */
  PreconditionFailed: 412,
  /** RFC 7231, 6.5.11 */
  ContentTooLarge: 413,
  /** RFC 7231, 6.5.12 */
  URITooLong: 414,
  /** RFC 7231, 6.5.13 */
  UnsupportedMediaType: 415,
  /** RFC 7233, 4.4 */
  RangeNotSatisfiable: 416,
  /** RFC 7231, 6.5.14 */
  ExpectationFailed: 417,
  /** RFC 7168, 2.3.3 */
  Teapot: 418,
  /** RFC 7540, 9.1.2 */
  MisdirectedRequest: 421,
  /** RFC 4918, 11.2 */
  UnprocessableEntity: 422,
  /** RFC 4918, 11.3 */
  Locked: 423,
  /** RFC 4918, 11.4 */
  FailedDependency: 424,
  /** RFC 8470, 5.2 */
  TooEarly: 425,
  /** RFC 7231, 6.5.15 */
  UpgradeRequired: 426,
  /** RFC 6585, 3 */
  PreconditionRequired: 428,
  /** RFC 6585, 4 */
  TooManyRequests: 429,
  /** RFC 6585, 5 */
  RequestHeaderFieldsTooLarge: 431,
  /** RFC 7725, 3 */
  UnavailableForLegalReasons: 451,
  /** RFC 7231, 6.6.1 */
  InternalServerError: 500,
  /** RFC 7231, 6.6.2 */
  NotImplemented: 501,
  /** RFC 7231, 6.6.3 */
  BadGateway: 502,
  /** RFC 7231, 6.6.4 */
  ServiceUnavailable: 503,
  /** RFC 7231, 6.6.5 */
  GatewayTimeout: 504,
  /** RFC 7231, 6.6.6 */
  HTTPVersionNotSupported: 505,
  /** RFC 2295, 8.1 */
  VariantAlsoNegotiates: 506,
  /** RFC 4918, 11.5 */
  InsufficientStorage: 507,
  /** RFC 5842, 7.2 */
  LoopDetected: 508,
  /** RFC 2774, 7 */
  NotExtended: 510,
  /** RFC 6585, 6 */
  NetworkAuthenticationRequired: 511
};
const STATUS_TEXT = {
  [STATUS_CODE.Accepted]: "Accepted",
  [STATUS_CODE.AlreadyReported]: "Already Reported",
  [STATUS_CODE.BadGateway]: "Bad Gateway",
  [STATUS_CODE.BadRequest]: "Bad Request",
  [STATUS_CODE.Conflict]: "Conflict",
  [STATUS_CODE.Continue]: "Continue",
  [STATUS_CODE.Created]: "Created",
  [STATUS_CODE.EarlyHints]: "Early Hints",
  [STATUS_CODE.ExpectationFailed]: "Expectation Failed",
  [STATUS_CODE.FailedDependency]: "Failed Dependency",
  [STATUS_CODE.Forbidden]: "Forbidden",
  [STATUS_CODE.Found]: "Found",
  [STATUS_CODE.GatewayTimeout]: "Gateway Timeout",
  [STATUS_CODE.Gone]: "Gone",
  [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported",
  [STATUS_CODE.IMUsed]: "IM Used",
  [STATUS_CODE.InsufficientStorage]: "Insufficient Storage",
  [STATUS_CODE.InternalServerError]: "Internal Server Error",
  [STATUS_CODE.LengthRequired]: "Length Required",
  [STATUS_CODE.Locked]: "Locked",
  [STATUS_CODE.LoopDetected]: "Loop Detected",
  [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed",
  [STATUS_CODE.MisdirectedRequest]: "Misdirected Request",
  [STATUS_CODE.MovedPermanently]: "Moved Permanently",
  [STATUS_CODE.MultiStatus]: "Multi Status",
  [STATUS_CODE.MultipleChoices]: "Multiple Choices",
  [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required",
  [STATUS_CODE.NoContent]: "No Content",
  [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info",
  [STATUS_CODE.NotAcceptable]: "Not Acceptable",
  [STATUS_CODE.NotExtended]: "Not Extended",
  [STATUS_CODE.NotFound]: "Not Found",
  [STATUS_CODE.NotImplemented]: "Not Implemented",
  [STATUS_CODE.NotModified]: "Not Modified",
  [STATUS_CODE.OK]: "OK",
  [STATUS_CODE.PartialContent]: "Partial Content",
  [STATUS_CODE.PaymentRequired]: "Payment Required",
  [STATUS_CODE.PermanentRedirect]: "Permanent Redirect",
  [STATUS_CODE.PreconditionFailed]: "Precondition Failed",
  [STATUS_CODE.PreconditionRequired]: "Precondition Required",
  [STATUS_CODE.Processing]: "Processing",
  [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required",
  [STATUS_CODE.ContentTooLarge]: "Content Too Large",
  [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
  [STATUS_CODE.RequestTimeout]: "Request Timeout",
  [STATUS_CODE.URITooLong]: "URI Too Long",
  [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable",
  [STATUS_CODE.ResetContent]: "Reset Content",
  [STATUS_CODE.SeeOther]: "See Other",
  [STATUS_CODE.ServiceUnavailable]: "Service Unavailable",
  [STATUS_CODE.SwitchingProtocols]: "Switching Protocols",
  [STATUS_CODE.Teapot]: "I'm a teapot",
  [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect",
  [STATUS_CODE.TooEarly]: "Too Early",
  [STATUS_CODE.TooManyRequests]: "Too Many Requests",
  [STATUS_CODE.Unauthorized]: "Unauthorized",
  [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
  [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity",
  [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type",
  [STATUS_CODE.UpgradeRequired]: "Upgrade Required",
  [STATUS_CODE.UseProxy]: "Use Proxy",
  [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates"
};
function isHandlerByMethod(handler2) {
  return handler2 !== null && !Array.isArray(handler2) && typeof handler2 === "object";
}
function compileMiddlewares(middlewares, onError) {
  if (middlewares.length === 0) return (ctx) => ctx.next();
  let chain = (_ctx, tail) => tail();
  for (let i2 = middlewares.length - 1; i2 >= 0; i2--) {
    const nextChain = chain;
    let middleware = middlewares[i2];
    chain = async (ctx, tail) => {
      const internals = getInternals(ctx);
      const {
        app: prevApp,
        layouts: prevLayouts
      } = internals;
      ctx.next = () => Promise.resolve(nextChain(ctx, tail));
      try {
        const result = await middleware(ctx);
        if (typeof result === "function") {
          middleware = result;
          return await result(ctx);
        }
        return result;
      } catch (err) {
        if (ctx.error !== err) {
          ctx.error = err;
          if (onError !== void 0) {
            onError(err);
          }
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    };
  }
  const count = middlewares.length;
  return (ctx) => {
    const tail = ctx.next;
    return tracer.startActiveSpan("middlewares", {
      attributes: {
        "fresh.middleware.count": count
      }
    }, async (span) => {
      try {
        return await chain(ctx, tail);
      } catch (err) {
        recordSpanError(span, err);
        throw err;
      } finally {
        span.end();
      }
    });
  };
}
function newSegment(pattern, parent) {
  return {
    pattern,
    middlewares: [],
    layout: null,
    app: null,
    errorRoute: null,
    notFound: null,
    parent,
    children: /* @__PURE__ */ new Map()
  };
}
function getOrCreateSegment(root2, path, includeLast) {
  let current = root2;
  const segments = patternToSegments(path, root2.pattern, includeLast);
  for (let i2 = 0; i2 < segments.length; i2++) {
    const seg = segments[i2];
    if (seg === root2.pattern) {
      current = root2;
    } else {
      let child = current.children.get(seg);
      if (child === void 0) {
        child = newSegment(seg, current);
        current.children.set(seg, child);
      }
      current = child;
    }
  }
  return current;
}
function segmentToMiddlewares(segment) {
  const result = [];
  const stack = [];
  let current = segment;
  while (current !== null) {
    stack.push(current);
    current = current.parent;
  }
  const root2 = stack.at(-1);
  for (let i2 = stack.length - 1; i2 >= 0; i2--) {
    const seg = stack[i2];
    const {
      layout,
      app: app2,
      errorRoute
    } = seg;
    result.push(async function segmentMiddleware(ctx) {
      const internals = getInternals(ctx);
      const prevApp = internals.app;
      const prevLayouts = internals.layouts;
      if (app2 !== null) {
        internals.app = app2;
      }
      if (layout !== null) {
        if (layout.config?.skipAppWrapper) {
          internals.app = null;
        }
        const def = {
          props: null,
          component: layout.component
        };
        if (layout.config?.skipInheritedLayouts) {
          internals.layouts = [def];
        } else {
          internals.layouts = [...internals.layouts, def];
        }
      }
      try {
        return await ctx.next();
      } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        if (root2.notFound !== null && status === 404) {
          return await root2.notFound(ctx);
        }
        if (errorRoute !== null) {
          return await renderRoute(ctx, errorRoute, status);
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    });
    if (seg.middlewares.length > 0) {
      result.push(...seg.middlewares);
    }
  }
  return result;
}
async function renderRoute(ctx, route, status = 200) {
  const internals = getInternals(ctx);
  if (route.config?.skipAppWrapper) {
    internals.app = null;
  }
  if (route.config?.skipInheritedLayouts) {
    internals.layouts = [];
  }
  const method = ctx.req.method.toUpperCase();
  const handlers2 = route.handler;
  if (handlers2 === void 0) {
    throw new Error(`Unexpected missing handlers`);
  }
  const headers = new Headers();
  headers.set("Content-Type", "text/html;charset=utf-8");
  const res = await tracer.startActiveSpan("handler", {
    attributes: {
      "fresh.span_type": "fs_routes/handler"
    }
  }, async (span) => {
    try {
      let fn = null;
      if (isHandlerByMethod(handlers2)) {
        if (handlers2[method] !== void 0) {
          fn = handlers2[method];
        } else if (method === "HEAD" && handlers2.GET !== void 0) {
          fn = handlers2.GET;
        }
      } else {
        fn = handlers2;
      }
      if (fn === null) return await ctx.next();
      return await fn(ctx);
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
  if (res instanceof Response) {
    return res;
  }
  if (typeof res.status === "number") {
    status = res.status;
  }
  if (res.headers !== void 0) {
    if (res.headers instanceof Headers) {
      res.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(res.headers)) {
      for (let i2 = 0; i2 < res.headers.length; i2++) {
        const entry = res.headers[i2];
        headers.set(entry[0], entry[1]);
      }
    } else {
      for (const [name, value] of Object.entries(res.headers)) {
        headers.set(name, value);
      }
    }
  }
  let vnode = null;
  if (route.component !== void 0) {
    const result = await renderRouteComponent(ctx, {
      component: route.component,
      // deno-lint-ignore no-explicit-any
      props: res.data
    }, () => null);
    if (result instanceof Response) {
      return result;
    }
    vnode = result;
  }
  return ctx.render(vnode, {
    headers,
    status
  });
}
const DEFAULT_NOT_FOUND = () => {
  throw new HttpError(404);
};
const DEFAULT_NOT_ALLOWED_METHOD = () => {
  throw new HttpError(405);
};
const DEFAULT_RENDER = () => (
  // deno-lint-ignore no-explicit-any
  Promise.resolve({
    data: {}
  })
);
function ensureHandler(route) {
  if (route.handler === void 0) {
    route.handler = route.component !== void 0 ? DEFAULT_RENDER : DEFAULT_NOT_FOUND;
  } else if (isHandlerByMethod(route.handler)) {
    if (route.component !== void 0 && !route.handler.GET) {
      route.handler.GET = DEFAULT_RENDER;
    }
  }
}
var CommandType = /* @__PURE__ */ (function(CommandType2) {
  CommandType2["Middleware"] = "middleware";
  CommandType2["Layout"] = "layout";
  CommandType2["App"] = "app";
  CommandType2["Route"] = "route";
  CommandType2["Error"] = "error";
  CommandType2["NotFound"] = "notFound";
  CommandType2["Handler"] = "handler";
  CommandType2["FsRoute"] = "fsRoute";
  return CommandType2;
})({});
function newErrorCmd(pattern, routeOrMiddleware, includeLastSegment) {
  const route = typeof routeOrMiddleware === "function" ? {
    handler: routeOrMiddleware
  } : routeOrMiddleware;
  ensureHandler(route);
  return {
    type: "error",
    pattern,
    item: route,
    includeLastSegment
  };
}
function newAppCmd(component) {
  return {
    type: "app",
    component
  };
}
function newLayoutCmd(pattern, component, config2, includeLastSegment) {
  return {
    type: "layout",
    pattern,
    component,
    config: config2,
    includeLastSegment
  };
}
function newMiddlewareCmd(pattern, fns, includeLastSegment) {
  return {
    type: "middleware",
    pattern,
    fns,
    includeLastSegment
  };
}
function newNotFoundCmd(routeOrMiddleware) {
  const route = typeof routeOrMiddleware === "function" ? {
    handler: routeOrMiddleware
  } : routeOrMiddleware;
  ensureHandler(route);
  return {
    type: "notFound",
    fn: (ctx) => renderRoute(ctx, route)
  };
}
function newRouteCmd(pattern, route, config2, includeLastSegment) {
  let normalized;
  if (isLazy(route)) {
    normalized = async () => {
      const result = await route();
      ensureHandler(result);
      return result;
    };
  } else {
    ensureHandler(route);
    normalized = route;
  }
  return {
    type: "route",
    pattern,
    route: normalized,
    config: config2,
    includeLastSegment
  };
}
function newHandlerCmd(method, pattern, fns, includeLastSegment) {
  return {
    type: "handler",
    pattern,
    method,
    fns,
    includeLastSegment
  };
}
function applyCommands(router, commands, basePath, onError) {
  const root2 = newSegment("", null);
  applyCommandsInner(root2, router, commands, basePath, onError);
  const rootMiddlewares = segmentToMiddlewares(root2);
  return {
    rootHandler: compileMiddlewares(rootMiddlewares, onError)
  };
}
function applyCommandsInner(root2, router, commands, basePath, onError) {
  for (let i2 = 0; i2 < commands.length; i2++) {
    const cmd = commands[i2];
    switch (cmd.type) {
      case "middleware": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.middlewares.push(...cmd.fns);
        break;
      }
      case "notFound": {
        root2.notFound = cmd.fn;
        break;
      }
      case "error": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.errorRoute = cmd.item;
        break;
      }
      case "app": {
        root2.app = cmd.component;
        break;
      }
      case "layout": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.layout = {
          component: cmd.component,
          config: cmd.config ?? null
        };
        break;
      }
      case "route": {
        const {
          pattern,
          route,
          config: config2
        } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const fns = segmentToMiddlewares(segment);
        if (isLazy(route)) {
          const routePath = mergePath(basePath, config2?.routeOverride ?? pattern, false);
          let def;
          fns.push(async (ctx) => {
            if (def === void 0) {
              def = await route();
            }
            if (def.css !== void 0) {
              setAdditionalStyles(ctx, def.css);
            }
            return renderRoute(ctx, def);
          });
          const compiled = compileMiddlewares(fns, onError);
          if (config2 === void 0 || config2.methods === "ALL") {
            router.add("GET", routePath, compiled);
            router.add("DELETE", routePath, compiled);
            router.add("HEAD", routePath, compiled);
            router.add("OPTIONS", routePath, compiled);
            router.add("PATCH", routePath, compiled);
            router.add("POST", routePath, compiled);
            router.add("PUT", routePath, compiled);
          } else if (Array.isArray(config2.methods)) {
            for (let i3 = 0; i3 < config2.methods.length; i3++) {
              const method = config2.methods[i3];
              router.add(method, routePath, compiled);
            }
          }
        } else {
          fns.push((ctx) => renderRoute(ctx, route));
          const routePath = toRoutePath(mergePath(basePath, route.config?.routeOverride ?? pattern, false));
          const compiled = compileMiddlewares(fns, onError);
          if (typeof route.handler === "function") {
            router.add("GET", routePath, compiled);
            router.add("DELETE", routePath, compiled);
            router.add("HEAD", routePath, compiled);
            router.add("OPTIONS", routePath, compiled);
            router.add("PATCH", routePath, compiled);
            router.add("POST", routePath, compiled);
            router.add("PUT", routePath, compiled);
          } else if (isHandlerByMethod(route.handler)) {
            for (const method of Object.keys(route.handler)) {
              router.add(method, routePath, compiled);
            }
          }
        }
        break;
      }
      case "handler": {
        const {
          pattern,
          fns,
          method
        } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const result = segmentToMiddlewares(segment);
        result.push(...fns);
        const compiled = compileMiddlewares(result, onError);
        const resPath = toRoutePath(mergePath(basePath, pattern, false));
        if (method === "ALL") {
          router.add("GET", resPath, compiled);
          router.add("DELETE", resPath, compiled);
          router.add("HEAD", resPath, compiled);
          router.add("OPTIONS", resPath, compiled);
          router.add("PATCH", resPath, compiled);
          router.add("POST", resPath, compiled);
          router.add("PUT", resPath, compiled);
        } else {
          router.add(method, resPath, compiled);
        }
        break;
      }
      case "fsRoute": {
        const items = cmd.getItems();
        const base = mergePath(basePath, cmd.pattern, true);
        applyCommandsInner(root2, router, items, base, onError);
        break;
      }
      default:
        throw new Error(`Unknown command: ${JSON.stringify(cmd)}`);
    }
  }
}
function isFreshFile(mod, commandType) {
  if (mod === null || typeof mod !== "object") return false;
  return typeof mod.default === "function" || commandType === CommandType.Middleware && Array.isArray(mod.default) || typeof mod.config === "object" || typeof mod.handlers === "object" || typeof mod.handlers === "function" || typeof mod.handler === "object" || typeof mod.handler === "function";
}
function fsItemsToCommands(items) {
  const commands = [];
  for (let i2 = 0; i2 < items.length; i2++) {
    const item = items[i2];
    const {
      filePath,
      type,
      mod: rawMod,
      pattern,
      routePattern
    } = item;
    switch (type) {
      case CommandType.Middleware: {
        if (isLazy(rawMod)) continue;
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        let middlewares = handlers2 ?? mod.default ?? null;
        if (middlewares === null) continue;
        if (isHandlerByMethod(middlewares)) {
          warnInvalidRoute(`Middleware does not support object handlers with GET, POST, etc. in ${filePath}`);
          continue;
        }
        if (!Array.isArray(middlewares)) {
          middlewares = [middlewares];
        }
        commands.push(newMiddlewareCmd(pattern, middlewares, true));
        continue;
      }
      case CommandType.Layout: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        if (handlers2 !== null) {
          warnInvalidRoute("Layout does not support handlers");
        }
        if (!mod.default) continue;
        commands.push(newLayoutCmd(pattern, mod.default, mod.config, true));
        continue;
      }
      case CommandType.Error: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        commands.push(newErrorCmd(pattern, {
          component: mod.default ?? void 0,
          config: mod.config ?? void 0,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }, true));
        continue;
      }
      case CommandType.NotFound: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        commands.push(newNotFoundCmd({
          config: mod.config,
          component: mod.default,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }));
        continue;
      }
      case CommandType.App: {
        const {
          mod
        } = validateFsMod(filePath, rawMod, type);
        if (mod.default === void 0) continue;
        commands.push(newAppCmd(mod.default));
        continue;
      }
      case CommandType.Route: {
        let normalized;
        let config2 = {};
        if (isLazy(rawMod)) {
          normalized = async () => {
            return await tracer.startActiveSpan("lazy-route", {
              attributes: {
                "fresh.route_name": rawMod.name ?? "anonymous"
              }
            }, async (span) => {
              try {
                const result = await rawMod();
                return normalizeRoute(filePath, result, routePattern, type);
              } catch (err) {
                recordSpanError(span, err);
                throw err;
              } finally {
                span.end();
              }
            });
          };
          config2.methods = item.overrideConfig?.methods ?? "ALL";
          config2.routeOverride = item.overrideConfig?.routeOverride ?? routePattern;
        } else {
          normalized = normalizeRoute(filePath, rawMod, routePattern, type);
          if (rawMod.config) {
            config2 = rawMod.config;
          }
        }
        commands.push(newRouteCmd(pattern, normalized, config2, false));
        continue;
      }
      case CommandType.Handler:
        throw new Error(`Not supported`);
      case CommandType.FsRoute:
        throw new Error(`Nested FsRoutes are not supported`);
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }
  return commands;
}
function warnInvalidRoute(message) {
  console.warn(`🍋 %c[WARNING] Unsupported route config: ${message}`, "color:rgb(251, 184, 0)");
}
function validateFsMod(filePath, mod, commandType) {
  if (!isFreshFile(mod, commandType)) {
    const hint = commandType === CommandType.Middleware ? `Middleware files must have a default export (function or array of functions).

  Example:
    export default define.middleware(async (ctx) => {
      return await ctx.next();
    });` : `Route files must export a default component, a "handler" or "handlers" export, or a "config" export.

  Example:
    export const handler = define.handlers({ GET(ctx) { ... } });
    export default define.page((props) => <h1>Hello</h1>);`;
    throw new Error(`Could not find relevant exports in: ${filePath}

${hint}`);
  }
  const handlers2 = mod.handlers ?? mod.handler ?? null;
  if (typeof handlers2 === "function" && handlers2.length > 1) {
    throw new Error(`Handlers must only have one argument but found more than one. Check the function signature in: ${filePath}`);
  }
  return {
    handlers: handlers2,
    mod
  };
}
function normalizeRoute(filePath, rawMod, routePattern, commandType) {
  const {
    handlers: handlers2,
    mod
  } = validateFsMod(filePath, rawMod, commandType);
  return {
    config: {
      ...mod.config,
      routeOverride: mod.config?.routeOverride ?? routePattern
    },
    // deno-lint-ignore no-explicit-any
    handler: handlers2 ?? void 0,
    component: mod.default,
    css: rawMod.css
  };
}
class MockBuildCache {
  #files;
  root = "";
  clientEntry = "";
  islandRegistry = /* @__PURE__ */ new Map();
  features = {
    errorOverlay: false
  };
  constructor(files, mode) {
    this.features.errorOverlay = mode === "development";
    this.#files = files;
  }
  getEntryAssets() {
    return [];
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#files);
  }
  readFile(_pathname) {
    return Promise.resolve(null);
  }
}
const DEFAULT_CONN_INFO = {
  localAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 8080
  },
  remoteAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 1234
  }
};
const defaultOptionsHandler = (methods) => {
  return () => Promise.resolve(new Response(null, {
    status: 204,
    headers: {
      Allow: methods.join(", ")
    }
  }));
};
const DEFAULT_ERROR_HANDLER = async (ctx) => {
  const {
    error
  } = ctx;
  if (error instanceof HttpError) {
    if (error.status >= 500) {
      console.error(error);
    }
    const message = error.message || STATUS_TEXT[error.status];
    return new Response(message, {
      status: error.status
    });
  }
  console.error(error);
  return new Response("Internal server error", {
    status: 500
  });
};
function createOnListen(basePath, options2) {
  return (params) => {
    const pathname = basePath + "/";
    const protocol = "key" in options2 && options2.key && options2.cert ? "https:" : "http:";
    let hostname = params.hostname;
    if (Deno.build.os === "windows" && (hostname === "0.0.0.0" || hostname === "::")) {
      hostname = "localhost";
    }
    hostname = hostname.startsWith("::") ? `[${hostname}]` : hostname;
    console.log();
    console.log(bgRgb8(rgb8(" 🍋 Fresh ready   ", 0), 121));
    const sep = options2.remoteAddress ? "" : "\n";
    const space = options2.remoteAddress ? " " : "";
    const localLabel = bold("Local:");
    const address = cyan(`${protocol}//${hostname}:${params.port}${pathname}`);
    const helper = hostname === "0.0.0.0" || hostname === "::" ? cyan(` (${protocol}//localhost:${params.port}${pathname})`) : "";
    console.log(`    ${localLabel}  ${space}${address}${helper}${sep}`);
    if (options2.remoteAddress) {
      const remoteLabel = bold("Remote:");
      const remoteAddress = cyan(options2.remoteAddress);
      console.log(`    ${remoteLabel}  ${remoteAddress}
`);
    }
  };
}
async function listenOnFreePort(options2, handler2) {
  let firstError = null;
  for (let port = 8e3; port < 8020; port++) {
    try {
      return await Deno.serve({
        ...options2,
        port
      }, handler2);
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse) {
        if (!firstError) firstError = err;
        continue;
      }
      throw err;
    }
  }
  throw firstError;
}
let setBuildCache;
const NOOP = () => {
};
class App {
  constructor(config2 = {}) {
    __privateAdd(this, _getBuildCache, () => null);
    __privateAdd(this, _commands, []);
    __privateAdd(this, _onError, NOOP);
    __publicField(this, "config");
    this.config = {
      root: ".",
      basePath: config2.basePath ?? "",
      mode: config2.mode ?? "production",
      trustProxy: config2.trustProxy ?? false
    };
  }
  use(pathOrMiddleware, ...middlewares) {
    let pattern;
    let fns;
    if (typeof pathOrMiddleware === "string") {
      pattern = pathOrMiddleware;
      fns = middlewares;
    } else {
      pattern = "*";
      middlewares.unshift(pathOrMiddleware);
      fns = middlewares;
    }
    __privateGet(this, _commands).push(newMiddlewareCmd(pattern, fns, true));
    return this;
  }
  /**
   * Set the app's 404 error handler. Can be a {@linkcode Route} or a {@linkcode Middleware}.
   */
  notFound(routeOrMiddleware) {
    __privateGet(this, _commands).push(newNotFoundCmd(routeOrMiddleware));
    return this;
  }
  onError(path, routeOrMiddleware) {
    __privateGet(this, _commands).push(newErrorCmd(path, routeOrMiddleware, true));
    return this;
  }
  appWrapper(component) {
    __privateGet(this, _commands).push(newAppCmd(component));
    return this;
  }
  layout(path, component, config2) {
    __privateGet(this, _commands).push(newLayoutCmd(path, component, config2, true));
    return this;
  }
  route(path, route, config2) {
    __privateGet(this, _commands).push(newRouteCmd(path, route, config2, true));
    return this;
  }
  /**
   * Add middlewares for GET requests at the specified path.
   */
  get(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("GET", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for POST requests at the specified path.
   */
  post(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("POST", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for PATCH requests at the specified path.
   */
  patch(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PATCH", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for PUT requests at the specified path.
   */
  put(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PUT", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for DELETE requests at the specified path.
   */
  delete(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("DELETE", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for HEAD requests at the specified path.
   */
  head(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("HEAD", path, middlewares, true));
    return this;
  }
  /**
   * Register a WebSocket endpoint at the specified path.
   *
   * ```ts
   * app.ws("/chat", {
   *   open(socket) { console.log("connected"); },
   *   message(socket, event) { socket.send(event.data); },
   * });
   * ```
   */
  ws(path, handlers2, options2) {
    return this.get(path, (ctx) => ctx.upgrade(handlers2, options2));
  }
  /**
   * Add middlewares for all HTTP verbs at the specified path.
   */
  all(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("ALL", path, middlewares, true));
    return this;
  }
  /**
   * Insert file routes collected in {@linkcode Builder} at this point.
   * @param pattern Append file routes at this pattern instead of the root
   * @returns
   */
  fsRoutes(pattern = "*") {
    __privateGet(this, _commands).push({
      type: CommandType.FsRoute,
      pattern,
      getItems: () => {
        const buildCache = __privateGet(this, _getBuildCache).call(this);
        if (buildCache === null) return [];
        return buildCache.getFsRoutes();
      },
      includeLastSegment: false
    });
    return this;
  }
  /**
   * Merge another {@linkcode App} instance into this app at the
   * specified path.
   */
  mountApp(path, app2) {
    for (let i2 = 0; i2 < __privateGet(app2, _commands).length; i2++) {
      const cmd = __privateGet(app2, _commands)[i2];
      if (cmd.type !== CommandType.App && cmd.type !== CommandType.NotFound) {
        let effectivePattern = cmd.pattern;
        if (app2.config.basePath) {
          effectivePattern = mergePath(app2.config.basePath, cmd.pattern, false);
        }
        const clone2 = {
          ...cmd,
          pattern: mergePath(path, effectivePattern, true),
          includeLastSegment: cmd.pattern === "/" || cmd.includeLastSegment
        };
        __privateGet(this, _commands).push(clone2);
        continue;
      }
      __privateGet(this, _commands).push(cmd);
    }
    const self2 = this;
    __privateSet(app2, _getBuildCache, () => {
      var _a;
      return __privateGet(_a = self2, _getBuildCache).call(_a);
    });
    return this;
  }
  /**
   * Create handler function for `Deno.serve` or to be used in
   * testing.
   */
  handler() {
    let buildCache = __privateGet(this, _getBuildCache).call(this);
    if (buildCache === null) {
      if (this.config.mode === "production" && DENO_DEPLOYMENT_ID !== void 0) ;
      else {
        buildCache = new MockBuildCache([], this.config.mode);
      }
    }
    const router = new UrlPatternRouter();
    const {
      rootHandler
    } = applyCommands(router, __privateGet(this, _commands), this.config.basePath, __privateGet(this, _onError));
    const trustProxy = this.config.trustProxy;
    return async (req, conn = DEFAULT_CONN_INFO) => {
      const url = new URL(req.url);
      url.pathname = url.pathname.replace(/\/+/g, "/");
      if (trustProxy) {
        const proto = req.headers.get("x-forwarded-proto");
        if (proto) {
          url.protocol = proto + ":";
        }
        const host = req.headers.get("x-forwarded-host");
        if (host) {
          url.host = host;
        }
      }
      const method = req.method.toUpperCase();
      const matched = router.match(method, url);
      let {
        params,
        pattern,
        item: handler2,
        methodMatch
      } = matched;
      const span = trace.getActiveSpan();
      if (span && pattern) {
        span.updateName(`${method} ${pattern}`);
        span.setAttribute("http.route", pattern);
      }
      let next;
      if (pattern === null || !methodMatch) {
        handler2 = rootHandler;
      }
      if (matched.pattern !== null && !methodMatch) {
        if (method === "OPTIONS") {
          const allowed = router.getAllowedMethods(matched.pattern);
          next = defaultOptionsHandler(allowed);
        } else {
          next = DEFAULT_NOT_ALLOWED_METHOD;
        }
      } else {
        next = DEFAULT_NOT_FOUND;
      }
      const ctx = new Context(req, url, conn, matched.pattern, params, this.config, next, buildCache);
      try {
        const result = await (handler2 !== null ? handler2(ctx) : next());
        if (!(result instanceof Response)) {
          throw new Error(`Expected a "Response" instance to be returned, but got: ${result}`);
        }
        if (method === "HEAD") {
          return new Response(null, result);
        }
        return result;
      } catch (err) {
        ctx.error = err;
        return await DEFAULT_ERROR_HANDLER(ctx);
      }
    };
  }
  /**
   * Spawn a server for this app.
   */
  async listen(options2 = {}) {
    if (!options2.onListen) {
      options2.onListen = createOnListen(this.config.basePath, options2);
    }
    const handler2 = this.handler();
    if (options2.port) {
      await Deno.serve(options2, handler2);
      return;
    }
    await listenOnFreePort(options2, handler2);
  }
}
_getBuildCache = /* @__PURE__ */ new WeakMap();
_commands = /* @__PURE__ */ new WeakMap();
_onError = /* @__PURE__ */ new WeakMap();
setBuildCache = (app2, cache, mode) => {
  app2.config.root = cache.root;
  app2.config.mode = mode;
  __privateSet(app2, _getBuildCache, () => cache);
};
class ProdBuildCache {
  root;
  #snapshot;
  islandRegistry;
  clientEntry;
  features;
  constructor(root2, snapshot2) {
    this.root = root2;
    this.features = {
      errorOverlay: false
    };
    setBuildId(snapshot2.version);
    this.#snapshot = snapshot2;
    this.islandRegistry = snapshot2.islands;
    this.clientEntry = snapshot2.clientEntry;
  }
  getEntryAssets() {
    return this.#snapshot.entryAssets;
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#snapshot.fsRoutes);
  }
  async readFile(pathname) {
    const {
      staticFiles: staticFiles2
    } = this.#snapshot;
    const info = staticFiles2.get(pathname);
    if (info === void 0) return null;
    const filePath = isAbsolute(info.filePath) ? info.filePath : join(this.root, info.filePath);
    const [stat, file] = await Promise.all([Deno.stat(filePath), Deno.open(filePath)]);
    return {
      hash: info.hash,
      contentType: info.contentType,
      size: stat.size,
      readable: file.readable,
      close: () => file.close(),
      immutable: info.immutable
    };
  }
}
class IslandPreparer {
  #namer = new UniqueNamer();
  prepare(registry2, mod, chunkName, modName, css2) {
    for (const [name, value] of Object.entries(mod)) {
      if (typeof value !== "function") continue;
      const islandName = name === "default" ? modName : name;
      const uniqueName = this.#namer.getUniqueName(islandName);
      const fn = value;
      registry2.set(fn, {
        exportName: name,
        file: chunkName,
        fn,
        name: uniqueName,
        css: css2
      });
    }
  }
}
function Button(props) {
  return u$2("button", {
    ...props,
    class: "px-2 py-1 border-gray-500 border-2 rounded-sm bg-white hover:bg-gray-200 transition-colors"
  });
}
const $$_tpl_1$4 = ['<div class="flex gap-8 py-6">', '<p class="text-3xl tabular-nums">', "</p>", "</div>"];
function Counter(props) {
  return a$2($$_tpl_1$4, u$2(Button, {
    id: "decrement",
    onClick: () => props.count.value -= 1,
    children: "-1"
  }), s$2(props.count), u$2(Button, {
    id: "increment",
    onClick: () => props.count.value += 1,
    children: "+1"
  }));
}
const Counter$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Counter
}, Symbol.toStringTag, {
  value: "Module"
}));
function round(v2) {
  return v2 + 0.5 | 0;
}
const lim = (v2, l2, h3) => Math.max(Math.min(v2, h3), l2);
function p2b(v2) {
  return lim(round(v2 * 2.55), 0, 255);
}
function n2b(v2) {
  return lim(round(v2 * 255), 0, 255);
}
function b2n(v2) {
  return lim(round(v2 / 2.55) / 100, 0, 1);
}
function n2p(v2) {
  return lim(round(v2 * 100), 0, 100);
}
const map$1 = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15
};
const hex = [..."0123456789ABCDEF"];
const h1 = (b2) => hex[b2 & 15];
const h2 = (b2) => hex[(b2 & 240) >> 4] + hex[b2 & 15];
const eq = (b2) => (b2 & 240) >> 4 === (b2 & 15);
const isShort = (v2) => eq(v2.r) && eq(v2.g) && eq(v2.b) && eq(v2.a);
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === "#") {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
      };
    }
  }
  return ret;
}
const alpha = (a2, f2) => a2 < 255 ? f2(a2) : "";
function hexString(v2) {
  var f2 = isShort(v2) ? h1 : h2;
  return v2 ? "#" + f2(v2.r) + f2(v2.g) + f2(v2.b) + alpha(v2.a, f2) : void 0;
}
const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h3, s2, l2) {
  const a2 = s2 * Math.min(l2, 1 - l2);
  const f2 = (n2, k2 = (n2 + h3 / 30) % 12) => l2 - a2 * Math.max(Math.min(k2 - 3, 9 - k2, 1), -1);
  return [f2(0), f2(8), f2(4)];
}
function hsv2rgbn(h3, s2, v2) {
  const f2 = (n2, k2 = (n2 + h3 / 60) % 6) => v2 - v2 * s2 * Math.max(Math.min(k2, 4 - k2, 1), 0);
  return [f2(5), f2(3), f2(1)];
}
function hwb2rgbn(h3, w2, b2) {
  const rgb = hsl2rgbn(h3, 1, 0.5);
  let i2;
  if (w2 + b2 > 1) {
    i2 = 1 / (w2 + b2);
    w2 *= i2;
    b2 *= i2;
  }
  for (i2 = 0; i2 < 3; i2++) {
    rgb[i2] *= 1 - w2 - b2;
    rgb[i2] += w2;
  }
  return rgb;
}
function hueValue(r2, g2, b2, d2, max) {
  if (r2 === max) {
    return (g2 - b2) / d2 + (g2 < b2 ? 6 : 0);
  }
  if (g2 === max) {
    return (b2 - r2) / d2 + 2;
  }
  return (r2 - g2) / d2 + 4;
}
function rgb2hsl(v2) {
  const range = 255;
  const r2 = v2.r / range;
  const g2 = v2.g / range;
  const b2 = v2.b / range;
  const max = Math.max(r2, g2, b2);
  const min = Math.min(r2, g2, b2);
  const l2 = (max + min) / 2;
  let h3, s2, d2;
  if (max !== min) {
    d2 = max - min;
    s2 = l2 > 0.5 ? d2 / (2 - max - min) : d2 / (max + min);
    h3 = hueValue(r2, g2, b2, d2, max);
    h3 = h3 * 60 + 0.5;
  }
  return [h3 | 0, s2 || 0, l2];
}
function calln(f2, a2, b2, c2) {
  return (Array.isArray(a2) ? f2(a2[0], a2[1], a2[2]) : f2(a2, b2, c2)).map(n2b);
}
function hsl2rgb(h3, s2, l2) {
  return calln(hsl2rgbn, h3, s2, l2);
}
function hwb2rgb(h3, w2, b2) {
  return calln(hwb2rgbn, h3, w2, b2);
}
function hsv2rgb(h3, s2, v2) {
  return calln(hsv2rgbn, h3, s2, v2);
}
function hue(h3) {
  return (h3 % 360 + 360) % 360;
}
function hueParse(str) {
  const m2 = HUE_RE.exec(str);
  let a2 = 255;
  let v2;
  if (!m2) {
    return;
  }
  if (m2[5] !== v2) {
    a2 = m2[6] ? p2b(+m2[5]) : n2b(+m2[5]);
  }
  const h3 = hue(+m2[2]);
  const p1 = +m2[3] / 100;
  const p2 = +m2[4] / 100;
  if (m2[1] === "hwb") {
    v2 = hwb2rgb(h3, p1, p2);
  } else if (m2[1] === "hsv") {
    v2 = hsv2rgb(h3, p1, p2);
  } else {
    v2 = hsl2rgb(h3, p1, p2);
  }
  return {
    r: v2[0],
    g: v2[1],
    b: v2[2],
    a: a2
  };
}
function rotate(v2, deg) {
  var h3 = rgb2hsl(v2);
  h3[0] = hue(h3[0] + deg);
  h3 = hsl2rgb(h3);
  v2.r = h3[0];
  v2.g = h3[1];
  v2.b = h3[2];
}
function hslString(v2) {
  if (!v2) {
    return;
  }
  const a2 = rgb2hsl(v2);
  const h3 = a2[0];
  const s2 = n2p(a2[1]);
  const l2 = n2p(a2[2]);
  return v2.a < 255 ? `hsla(${h3}, ${s2}%, ${l2}%, ${b2n(v2.a)})` : `hsl(${h3}, ${s2}%, ${l2}%)`;
}
const map$2 = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
};
const names$1 = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function unpack() {
  const unpacked = {};
  const keys = Object.keys(names$1);
  const tkeys = Object.keys(map$2);
  let i2, j2, k2, ok, nk;
  for (i2 = 0; i2 < keys.length; i2++) {
    ok = nk = keys[i2];
    for (j2 = 0; j2 < tkeys.length; j2++) {
      k2 = tkeys[j2];
      nk = nk.replace(k2, map$2[k2]);
    }
    k2 = parseInt(names$1[ok], 16);
    unpacked[nk] = [k2 >> 16 & 255, k2 >> 8 & 255, k2 & 255];
  }
  return unpacked;
}
let names;
function nameParse(str) {
  if (!names) {
    names = unpack();
    names.transparent = [0, 0, 0, 0];
  }
  const a2 = names[str.toLowerCase()];
  return a2 && {
    r: a2[0],
    g: a2[1],
    b: a2[2],
    a: a2.length === 4 ? a2[3] : 255
  };
}
const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
  const m2 = RGB_RE.exec(str);
  let a2 = 255;
  let r2, g2, b2;
  if (!m2) {
    return;
  }
  if (m2[7] !== r2) {
    const v2 = +m2[7];
    a2 = m2[8] ? p2b(v2) : lim(v2 * 255, 0, 255);
  }
  r2 = +m2[1];
  g2 = +m2[3];
  b2 = +m2[5];
  r2 = 255 & (m2[2] ? p2b(r2) : lim(r2, 0, 255));
  g2 = 255 & (m2[4] ? p2b(g2) : lim(g2, 0, 255));
  b2 = 255 & (m2[6] ? p2b(b2) : lim(b2, 0, 255));
  return {
    r: r2,
    g: g2,
    b: b2,
    a: a2
  };
}
function rgbString(v2) {
  return v2 && (v2.a < 255 ? `rgba(${v2.r}, ${v2.g}, ${v2.b}, ${b2n(v2.a)})` : `rgb(${v2.r}, ${v2.g}, ${v2.b})`);
}
const to = (v2) => v2 <= 31308e-7 ? v2 * 12.92 : Math.pow(v2, 1 / 2.4) * 1.055 - 0.055;
const from = (v2) => v2 <= 0.04045 ? v2 / 12.92 : Math.pow((v2 + 0.055) / 1.055, 2.4);
function interpolate$1(rgb1, rgb2, t2) {
  const r2 = from(b2n(rgb1.r));
  const g2 = from(b2n(rgb1.g));
  const b2 = from(b2n(rgb1.b));
  return {
    r: n2b(to(r2 + t2 * (from(b2n(rgb2.r)) - r2))),
    g: n2b(to(g2 + t2 * (from(b2n(rgb2.g)) - g2))),
    b: n2b(to(b2 + t2 * (from(b2n(rgb2.b)) - b2))),
    a: rgb1.a + t2 * (rgb2.a - rgb1.a)
  };
}
function modHSL(v2, i2, ratio) {
  if (v2) {
    let tmp = rgb2hsl(v2);
    tmp[i2] = Math.max(0, Math.min(tmp[i2] + tmp[i2] * ratio, i2 === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v2.r = tmp[0];
    v2.g = tmp[1];
    v2.b = tmp[2];
  }
}
function clone$1(v2, proto) {
  return v2 ? Object.assign(proto || {}, v2) : v2;
}
function fromObject(input) {
  var v2 = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
  };
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v2 = {
        r: input[0],
        g: input[1],
        b: input[2],
        a: 255
      };
      if (input.length > 3) {
        v2.a = n2b(input[3]);
      }
    }
  } else {
    v2 = clone$1(input, {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    });
    v2.a = n2b(v2.a);
  }
  return v2;
}
function functionParse(str) {
  if (str.charAt(0) === "r") {
    return rgbParse(str);
  }
  return hueParse(str);
}
class Color {
  constructor(input) {
    if (input instanceof Color) {
      return input;
    }
    const type = typeof input;
    let v2;
    if (type === "object") {
      v2 = fromObject(input);
    } else if (type === "string") {
      v2 = hexParse(input) || nameParse(input) || functionParse(input);
    }
    this._rgb = v2;
    this._valid = !!v2;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var v2 = clone$1(this._rgb);
    if (v2) {
      v2.a = b2n(v2.a);
    }
    return v2;
  }
  set rgb(obj) {
    this._rgb = fromObject(obj);
  }
  rgbString() {
    return this._valid ? rgbString(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? hexString(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? hslString(this._rgb) : void 0;
  }
  mix(color2, weight) {
    if (color2) {
      const c1 = this.rgb;
      const c2 = color2.rgb;
      let w2;
      const p2 = weight === w2 ? 0.5 : weight;
      const w3 = 2 * p2 - 1;
      const a2 = c1.a - c2.a;
      const w1 = ((w3 * a2 === -1 ? w3 : (w3 + a2) / (1 + w3 * a2)) + 1) / 2;
      w2 = 1 - w1;
      c1.r = 255 & w1 * c1.r + w2 * c2.r + 0.5;
      c1.g = 255 & w1 * c1.g + w2 * c2.g + 0.5;
      c1.b = 255 & w1 * c1.b + w2 * c2.b + 0.5;
      c1.a = p2 * c1.a + (1 - p2) * c2.a;
      this.rgb = c1;
    }
    return this;
  }
  interpolate(color2, t2) {
    if (color2) {
      this._rgb = interpolate$1(this._rgb, color2._rgb, t2);
    }
    return this;
  }
  clone() {
    return new Color(this.rgb);
  }
  alpha(a2) {
    this._rgb.a = n2b(a2);
    return this;
  }
  clearer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 - ratio;
    return this;
  }
  greyscale() {
    const rgb = this._rgb;
    const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
    rgb.r = rgb.g = rgb.b = val;
    return this;
  }
  opaquer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 + ratio;
    return this;
  }
  negate() {
    const v2 = this._rgb;
    v2.r = 255 - v2.r;
    v2.g = 255 - v2.g;
    v2.b = 255 - v2.b;
    return this;
  }
  lighten(ratio) {
    modHSL(this._rgb, 2, ratio);
    return this;
  }
  darken(ratio) {
    modHSL(this._rgb, 2, -ratio);
    return this;
  }
  saturate(ratio) {
    modHSL(this._rgb, 1, ratio);
    return this;
  }
  desaturate(ratio) {
    modHSL(this._rgb, 1, -ratio);
    return this;
  }
  rotate(deg) {
    rotate(this._rgb, deg);
    return this;
  }
}
function noop() {
}
const uid = /* @__PURE__ */ (() => {
  let id = 0;
  return () => id++;
})();
function isNullOrUndef(value) {
  return value === null || value === void 0;
}
function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === "[object" && type.slice(-6) === "Array]") {
    return true;
  }
  return false;
}
function isObject(value) {
  return value !== null && Object.prototype.toString.call(value) === "[object Object]";
}
function isNumberFinite(value) {
  return (typeof value === "number" || value instanceof Number) && isFinite(+value);
}
function finiteOrDefault(value, defaultValue) {
  return isNumberFinite(value) ? value : defaultValue;
}
function valueOrDefault(value, defaultValue) {
  return typeof value === "undefined" ? defaultValue : value;
}
const toPercentage = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 : +value / dimension;
const toDimension = (value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 * dimension : +value;
function callback(fn, args, thisArg) {
  if (fn && typeof fn.call === "function") {
    return fn.apply(thisArg, args);
  }
}
function each(loopable, fn, thisArg, reverse) {
  let i2, len, keys;
  if (isArray(loopable)) {
    len = loopable.length;
    {
      for (i2 = 0; i2 < len; i2++) {
        fn.call(thisArg, loopable[i2], i2);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i2 = 0; i2 < len; i2++) {
      fn.call(thisArg, loopable[keys[i2]], keys[i2]);
    }
  }
}
function _elementsEqual(a0, a1) {
  let i2, ilen, v0, v1;
  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }
  for (i2 = 0, ilen = a0.length; i2 < ilen; ++i2) {
    v0 = a0[i2];
    v1 = a1[i2];
    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }
  return true;
}
function clone(source) {
  if (isArray(source)) {
    return source.map(clone);
  }
  if (isObject(source)) {
    const target = /* @__PURE__ */ Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k2 = 0;
    for (; k2 < klen; ++k2) {
      target[keys[k2]] = clone(source[keys[k2]]);
    }
    return target;
  }
  return source;
}
function isValidKey(key) {
  return ["__proto__", "prototype", "constructor"].indexOf(key) === -1;
}
function _merger(key, target, source, options2) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    merge(tval, sval, options2);
  } else {
    target[key] = clone(sval);
  }
}
function merge(target, source, options2) {
  const sources = isArray(source) ? source : [source];
  const ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options2 = options2 || {};
  const merger = options2.merger || _merger;
  let current;
  for (let i2 = 0; i2 < ilen; ++i2) {
    current = sources[i2];
    if (!isObject(current)) {
      continue;
    }
    const keys = Object.keys(current);
    for (let k2 = 0, klen = keys.length; k2 < klen; ++k2) {
      merger(keys[k2], target, current, options2);
    }
  }
  return target;
}
function mergeIf(target, source) {
  return merge(target, source, {
    merger: _mergerIf
  });
}
function _mergerIf(key, target, source) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone(sval);
  }
}
const keyResolvers = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (v2) => v2,
  // default resolvers
  x: (o2) => o2.x,
  y: (o2) => o2.y
};
function _splitKey(key) {
  const parts = key.split(".");
  const keys = [];
  let tmp = "";
  for (const part of parts) {
    tmp += part;
    if (tmp.endsWith("\\")) {
      tmp = tmp.slice(0, -1) + ".";
    } else {
      keys.push(tmp);
      tmp = "";
    }
  }
  return keys;
}
function _getKeyResolver(key) {
  const keys = _splitKey(key);
  return (obj) => {
    for (const k2 of keys) {
      if (k2 === "") {
        break;
      }
      obj = obj && obj[k2];
    }
    return obj;
  };
}
function resolveObjectKey(obj, key) {
  const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
  return resolver(obj);
}
function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const defined = (value) => typeof value !== "undefined";
const isFunction = (value) => typeof value === "function";
const setsEqual = (a2, b2) => {
  if (a2.size !== b2.size) {
    return false;
  }
  for (const item of a2) {
    if (!b2.has(item)) {
      return false;
    }
  }
  return true;
};
function _isClickEvent(e2) {
  return e2.type === "mouseup" || e2.type === "click" || e2.type === "contextmenu";
}
const PI = Math.PI;
const TAU = 2 * PI;
const PITAU = TAU + PI;
const INFINITY = Number.POSITIVE_INFINITY;
const RAD_PER_DEG = PI / 180;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_THIRDS_PI = PI * 2 / 3;
const log10 = Math.log10;
const sign = Math.sign;
function almostEquals(x2, y2, epsilon) {
  return Math.abs(x2 - y2) < epsilon;
}
function niceNum(range) {
  const roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1e3) ? roundedRange : range;
  const niceRange = Math.pow(10, Math.floor(log10(range)));
  const fraction = range / niceRange;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}
function _factorize(value) {
  const result = [];
  const sqrt = Math.sqrt(value);
  let i2;
  for (i2 = 1; i2 < sqrt; i2++) {
    if (value % i2 === 0) {
      result.push(i2);
      result.push(value / i2);
    }
  }
  if (sqrt === (sqrt | 0)) {
    result.push(sqrt);
  }
  result.sort((a2, b2) => a2 - b2).pop();
  return result;
}
function isNonPrimitive(n2) {
  return typeof n2 === "symbol" || typeof n2 === "object" && n2 !== null && !(Symbol.toPrimitive in n2 || "toString" in n2 || "valueOf" in n2);
}
function isNumber(n2) {
  return !isNonPrimitive(n2) && !isNaN(parseFloat(n2)) && isFinite(n2);
}
function almostWhole(x2, epsilon) {
  const rounded = Math.round(x2);
  return rounded - epsilon <= x2 && rounded + epsilon >= x2;
}
function _setMinAndMaxByKey(array, target, property) {
  let i2, ilen, value;
  for (i2 = 0, ilen = array.length; i2 < ilen; i2++) {
    value = array[i2][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}
function toRadians(degrees) {
  return degrees * (PI / 180);
}
function toDegrees(radians) {
  return radians * (180 / PI);
}
function _decimalPlaces(x2) {
  if (!isNumberFinite(x2)) {
    return;
  }
  let e2 = 1;
  let p2 = 0;
  while (Math.round(x2 * e2) / e2 !== x2) {
    e2 *= 10;
    p2++;
  }
  return p2;
}
function getAngleFromPoint(centrePoint, anglePoint) {
  const distanceFromXCenter = anglePoint.x - centrePoint.x;
  const distanceFromYCenter = anglePoint.y - centrePoint.y;
  const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
  let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
  if (angle < -0.5 * PI) {
    angle += TAU;
  }
  return {
    angle,
    distance: radialDistanceFromCenter
  };
}
function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
function _angleDiff(a2, b2) {
  return (a2 - b2 + PITAU) % TAU - PI;
}
function _normalizeAngle(a2) {
  return (a2 % TAU + TAU) % TAU;
}
function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
  const a2 = _normalizeAngle(angle);
  const s2 = _normalizeAngle(start);
  const e2 = _normalizeAngle(end);
  const angleToStart = _normalizeAngle(s2 - a2);
  const angleToEnd = _normalizeAngle(e2 - a2);
  const startToAngle = _normalizeAngle(a2 - s2);
  const endToAngle = _normalizeAngle(a2 - e2);
  return a2 === s2 || a2 === e2 || sameAngleIsFullCircle && s2 === e2 || angleToStart > angleToEnd && startToAngle < endToAngle;
}
function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
function _isBetween(value, start, end, epsilon = 1e-6) {
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
function _lookup(table, value, cmp) {
  cmp = cmp || ((index2) => table[index2] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid;
  while (hi - lo > 1) {
    mid = lo + hi >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return {
    lo,
    hi
  };
}
const _lookupByKey = (table, key, value, last) => _lookup(table, value, last ? (index2) => {
  const ti = table[index2][key];
  return ti < value || ti === value && table[index2 + 1][key] === value;
} : (index2) => table[index2][key] < value);
const _rlookupByKey = (table, key, value) => _lookup(table, value, (index2) => table[index2][key] >= value);
function _filterBetween(values, min, max) {
  let start = 0;
  let end = values.length;
  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }
  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
const arrayEvents = ["push", "pop", "shift", "splice", "unshift"];
function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }
  Object.defineProperty(array, "_chartjs", {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [listener]
    }
  });
  arrayEvents.forEach((key) => {
    const method = "_onData" + _capitalize(key);
    const base = array[key];
    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value(...args) {
        const res = base.apply(this, args);
        array._chartjs.listeners.forEach((object) => {
          if (typeof object[method] === "function") {
            object[method](...args);
          }
        });
        return res;
      }
    });
  });
}
function unlistenArrayEvents(array, listener) {
  const stub = array._chartjs;
  if (!stub) {
    return;
  }
  const listeners = stub.listeners;
  const index2 = listeners.indexOf(listener);
  if (index2 !== -1) {
    listeners.splice(index2, 1);
  }
  if (listeners.length > 0) {
    return;
  }
  arrayEvents.forEach((key) => {
    delete array[key];
  });
  delete array._chartjs;
}
function _arrayUnique(items) {
  const set2 = new Set(items);
  if (set2.size === items.length) {
    return items;
  }
  return Array.from(set2);
}
const requestAnimFrame = (function() {
  if (typeof window === "undefined") {
    return function(callback2) {
      return callback2();
    };
  }
  return window.requestAnimationFrame;
})();
function throttled(fn, thisArg) {
  let argsToUse = [];
  let ticking = false;
  return function(...args) {
    argsToUse = args;
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, () => {
        ticking = false;
        fn.apply(thisArg, argsToUse);
      });
    }
  };
}
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}
const _toLeftRightCenter = (align) => align === "start" ? "left" : align === "end" ? "right" : "center";
const _alignStartEnd = (align, start, end) => align === "start" ? start : align === "end" ? end : (start + end) / 2;
const _textX = (align, left, right, rtl) => {
  const check = rtl ? "left" : "right";
  return align === check ? right : align === "center" ? (left + right) / 2 : left;
};
function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  const pointCount = points.length;
  let start = 0;
  let count = pointCount;
  if (meta._sorted) {
    const {
      iScale,
      vScale,
      _parsed
    } = meta;
    const spanGaps = meta.dataset ? meta.dataset.options ? meta.dataset.options.spanGaps : null : null;
    const axis = iScale.axis;
    const {
      min,
      max,
      minDefined,
      maxDefined
    } = iScale.getUserBounds();
    if (minDefined) {
      start = Math.min(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, axis, min).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo
      );
      if (spanGaps) {
        const distanceToDefinedLo = _parsed.slice(0, start + 1).reverse().findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        start -= Math.max(0, distanceToDefinedLo);
      }
      start = _limitValue(start, 0, pointCount - 1);
    }
    if (maxDefined) {
      let end = Math.max(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1
      );
      if (spanGaps) {
        const distanceToDefinedHi = _parsed.slice(end - 1).findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        end += Math.max(0, distanceToDefinedHi);
      }
      count = _limitValue(end, start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }
  return {
    start,
    count
  };
}
function _scaleRangesChanged(meta) {
  const {
    xScale,
    yScale,
    _scaleRanges
  } = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
  Object.assign(_scaleRanges, newRanges);
  return changed;
}
const atEdge = (t2) => t2 === 0 || t2 === 1;
const elasticIn = (t2, s2, p2) => -(Math.pow(2, 10 * (t2 -= 1)) * Math.sin((t2 - s2) * TAU / p2));
const elasticOut = (t2, s2, p2) => Math.pow(2, -10 * t2) * Math.sin((t2 - s2) * TAU / p2) + 1;
const effects = {
  linear: (t2) => t2,
  easeInQuad: (t2) => t2 * t2,
  easeOutQuad: (t2) => -t2 * (t2 - 2),
  easeInOutQuad: (t2) => (t2 /= 0.5) < 1 ? 0.5 * t2 * t2 : -0.5 * (--t2 * (t2 - 2) - 1),
  easeInCubic: (t2) => t2 * t2 * t2,
  easeOutCubic: (t2) => (t2 -= 1) * t2 * t2 + 1,
  easeInOutCubic: (t2) => (t2 /= 0.5) < 1 ? 0.5 * t2 * t2 * t2 : 0.5 * ((t2 -= 2) * t2 * t2 + 2),
  easeInQuart: (t2) => t2 * t2 * t2 * t2,
  easeOutQuart: (t2) => -((t2 -= 1) * t2 * t2 * t2 - 1),
  easeInOutQuart: (t2) => (t2 /= 0.5) < 1 ? 0.5 * t2 * t2 * t2 * t2 : -0.5 * ((t2 -= 2) * t2 * t2 * t2 - 2),
  easeInQuint: (t2) => t2 * t2 * t2 * t2 * t2,
  easeOutQuint: (t2) => (t2 -= 1) * t2 * t2 * t2 * t2 + 1,
  easeInOutQuint: (t2) => (t2 /= 0.5) < 1 ? 0.5 * t2 * t2 * t2 * t2 * t2 : 0.5 * ((t2 -= 2) * t2 * t2 * t2 * t2 + 2),
  easeInSine: (t2) => -Math.cos(t2 * HALF_PI) + 1,
  easeOutSine: (t2) => Math.sin(t2 * HALF_PI),
  easeInOutSine: (t2) => -0.5 * (Math.cos(PI * t2) - 1),
  easeInExpo: (t2) => t2 === 0 ? 0 : Math.pow(2, 10 * (t2 - 1)),
  easeOutExpo: (t2) => t2 === 1 ? 1 : -Math.pow(2, -10 * t2) + 1,
  easeInOutExpo: (t2) => atEdge(t2) ? t2 : t2 < 0.5 ? 0.5 * Math.pow(2, 10 * (t2 * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t2 * 2 - 1)) + 2),
  easeInCirc: (t2) => t2 >= 1 ? t2 : -(Math.sqrt(1 - t2 * t2) - 1),
  easeOutCirc: (t2) => Math.sqrt(1 - (t2 -= 1) * t2),
  easeInOutCirc: (t2) => (t2 /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t2 * t2) - 1) : 0.5 * (Math.sqrt(1 - (t2 -= 2) * t2) + 1),
  easeInElastic: (t2) => atEdge(t2) ? t2 : elasticIn(t2, 0.075, 0.3),
  easeOutElastic: (t2) => atEdge(t2) ? t2 : elasticOut(t2, 0.075, 0.3),
  easeInOutElastic(t2) {
    const s2 = 0.1125;
    const p2 = 0.45;
    return atEdge(t2) ? t2 : t2 < 0.5 ? 0.5 * elasticIn(t2 * 2, s2, p2) : 0.5 + 0.5 * elasticOut(t2 * 2 - 1, s2, p2);
  },
  easeInBack(t2) {
    const s2 = 1.70158;
    return t2 * t2 * ((s2 + 1) * t2 - s2);
  },
  easeOutBack(t2) {
    const s2 = 1.70158;
    return (t2 -= 1) * t2 * ((s2 + 1) * t2 + s2) + 1;
  },
  easeInOutBack(t2) {
    let s2 = 1.70158;
    if ((t2 /= 0.5) < 1) {
      return 0.5 * (t2 * t2 * (((s2 *= 1.525) + 1) * t2 - s2));
    }
    return 0.5 * ((t2 -= 2) * t2 * (((s2 *= 1.525) + 1) * t2 + s2) + 2);
  },
  easeInBounce: (t2) => 1 - effects.easeOutBounce(1 - t2),
  easeOutBounce(t2) {
    const m2 = 7.5625;
    const d2 = 2.75;
    if (t2 < 1 / d2) {
      return m2 * t2 * t2;
    }
    if (t2 < 2 / d2) {
      return m2 * (t2 -= 1.5 / d2) * t2 + 0.75;
    }
    if (t2 < 2.5 / d2) {
      return m2 * (t2 -= 2.25 / d2) * t2 + 0.9375;
    }
    return m2 * (t2 -= 2.625 / d2) * t2 + 0.984375;
  },
  easeInOutBounce: (t2) => t2 < 0.5 ? effects.easeInBounce(t2 * 2) * 0.5 : effects.easeOutBounce(t2 * 2 - 1) * 0.5 + 0.5
};
function isPatternOrGradient(value) {
  if (value && typeof value === "object") {
    const type = value.toString();
    return type === "[object CanvasPattern]" || type === "[object CanvasGradient]";
  }
  return false;
}
function color(value) {
  return isPatternOrGradient(value) ? value : new Color(value);
}
function getHoverColor(value) {
  return isPatternOrGradient(value) ? value : new Color(value).saturate(0.5).darken(0.1).hexString();
}
const numbers = ["x", "y", "borderWidth", "radius", "tension"];
const colors = ["color", "borderColor", "backgroundColor"];
function applyAnimationsDefaults(defaults2) {
  defaults2.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  });
  defaults2.describe("animation", {
    _fallback: false,
    _indexable: false,
    _scriptable: (name) => name !== "onProgress" && name !== "onComplete" && name !== "fn"
  });
  defaults2.set("animations", {
    colors: {
      type: "color",
      properties: colors
    },
    numbers: {
      type: "number",
      properties: numbers
    }
  });
  defaults2.describe("animations", {
    _fallback: "animation"
  });
  defaults2.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (v2) => v2 | 0
        }
      }
    }
  });
}
function applyLayoutsDefaults(defaults2) {
  defaults2.set("layout", {
    autoPadding: true,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
const intlCache = /* @__PURE__ */ new Map();
function getNumberFormat(locale, options2) {
  options2 = options2 || {};
  const cacheKey = locale + JSON.stringify(options2);
  let formatter = intlCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options2);
    intlCache.set(cacheKey, formatter);
  }
  return formatter;
}
function formatNumber(num, locale, options2) {
  return getNumberFormat(locale, options2).format(num);
}
const formatters = {
  values(value) {
    return isArray(value) ? value : "" + value;
  },
  numeric(tickValue, index2, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const locale = this.chart.options.locale;
    let notation;
    let delta = tickValue;
    if (ticks.length > 1) {
      const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
      if (maxTick < 1e-4 || maxTick > 1e15) {
        notation = "scientific";
      }
      delta = calculateDelta(tickValue, ticks);
    }
    const logDelta = log10(Math.abs(delta));
    const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
    const options2 = {
      notation,
      minimumFractionDigits: numDecimal,
      maximumFractionDigits: numDecimal
    };
    Object.assign(options2, this.options.ticks.format);
    return formatNumber(tickValue, locale, options2);
  },
  logarithmic(tickValue, index2, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const remain = ticks[index2].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
    if ([1, 2, 3, 5, 10, 15].includes(remain) || index2 > 0.8 * ticks.length) {
      return formatters.numeric.call(this, tickValue, index2, ticks);
    }
    return "";
  }
};
function calculateDelta(tickValue, ticks) {
  let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}
var Ticks = {
  formatters
};
function applyScaleDefaults(defaults2) {
  defaults2.set("scale", {
    display: true,
    offset: false,
    reverse: false,
    beginAtZero: false,
    bounds: "ticks",
    clip: true,
    grace: 0,
    grid: {
      display: true,
      lineWidth: 1,
      drawOnChartArea: true,
      drawTicks: true,
      tickLength: 8,
      tickWidth: (_ctx, options2) => options2.lineWidth,
      tickColor: (_ctx, options2) => options2.color,
      offset: false
    },
    border: {
      display: true,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: false,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: true,
      autoSkip: true,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Ticks.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: false,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  });
  defaults2.route("scale.ticks", "color", "", "color");
  defaults2.route("scale.grid", "color", "", "borderColor");
  defaults2.route("scale.border", "color", "", "borderColor");
  defaults2.route("scale.title", "color", "", "color");
  defaults2.describe("scale", {
    _fallback: false,
    _scriptable: (name) => !name.startsWith("before") && !name.startsWith("after") && name !== "callback" && name !== "parser",
    _indexable: (name) => name !== "borderDash" && name !== "tickBorderDash" && name !== "dash"
  });
  defaults2.describe("scales", {
    _fallback: "scale"
  });
  defaults2.describe("scale.ticks", {
    _scriptable: (name) => name !== "backdropPadding" && name !== "callback",
    _indexable: (name) => name !== "backdropPadding"
  });
}
const overrides = /* @__PURE__ */ Object.create(null);
const descriptors = /* @__PURE__ */ Object.create(null);
function getScope$1(node, key) {
  if (!key) {
    return node;
  }
  const keys = key.split(".");
  for (let i2 = 0, n2 = keys.length; i2 < n2; ++i2) {
    const k2 = keys[i2];
    node = node[k2] || (node[k2] = /* @__PURE__ */ Object.create(null));
  }
  return node;
}
function set(root2, scope, values) {
  if (typeof scope === "string") {
    return merge(getScope$1(root2, scope), values);
  }
  return merge(getScope$1(root2, ""), scope);
}
class Defaults {
  constructor(_descriptors2, _appliers) {
    this.animation = void 0;
    this.backgroundColor = "rgba(0,0,0,0.1)";
    this.borderColor = "rgba(0,0,0,0.1)";
    this.color = "#666";
    this.datasets = {};
    this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
    this.elements = {};
    this.events = ["mousemove", "mouseout", "click", "touchstart", "touchmove"];
    this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    };
    this.hover = {};
    this.hoverBackgroundColor = (ctx, options2) => getHoverColor(options2.backgroundColor);
    this.hoverBorderColor = (ctx, options2) => getHoverColor(options2.borderColor);
    this.hoverColor = (ctx, options2) => getHoverColor(options2.color);
    this.indexAxis = "x";
    this.interaction = {
      mode: "nearest",
      intersect: true,
      includeInvisible: false
    };
    this.maintainAspectRatio = true;
    this.onHover = null;
    this.onClick = null;
    this.parsing = true;
    this.plugins = {};
    this.responsive = true;
    this.scale = void 0;
    this.scales = {};
    this.showLine = true;
    this.drawActiveElementsOnTop = true;
    this.describe(_descriptors2);
    this.apply(_appliers);
  }
  set(scope, values) {
    return set(this, scope, values);
  }
  get(scope) {
    return getScope$1(this, scope);
  }
  describe(scope, values) {
    return set(descriptors, scope, values);
  }
  override(scope, values) {
    return set(overrides, scope, values);
  }
  route(scope, name, targetScope, targetName) {
    const scopeObject = getScope$1(this, scope);
    const targetScopeObject = getScope$1(this, targetScope);
    const privateName = "_" + name;
    Object.defineProperties(scopeObject, {
      [privateName]: {
        value: scopeObject[name],
        writable: true
      },
      [name]: {
        enumerable: true,
        get() {
          const local = this[privateName];
          const target = targetScopeObject[targetName];
          if (isObject(local)) {
            return Object.assign({}, target, local);
          }
          return valueOrDefault(local, target);
        },
        set(value) {
          this[privateName] = value;
        }
      }
    });
  }
  apply(appliers) {
    appliers.forEach((apply) => apply(this));
  }
}
var defaults = /* @__PURE__ */ new Defaults({
  _scriptable: (name) => !name.startsWith("on"),
  _indexable: (name) => name !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: false,
    _indexable: false
  }
}, [applyAnimationsDefaults, applyLayoutsDefaults, applyScaleDefaults]);
function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }
  return (font.style ? font.style + " " : "") + (font.weight ? font.weight + " " : "") + font.size + "px " + font.family;
}
function _measureText(ctx, data, gc, longest, string) {
  let textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}
function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  let data = cache.data = cache.data || {};
  let gc = cache.garbageCollect = cache.garbageCollect || [];
  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }
  ctx.save();
  ctx.font = font;
  let longest = 0;
  const ilen = arrayOfThings.length;
  let i2, j2, jlen, thing, nestedThing;
  for (i2 = 0; i2 < ilen; i2++) {
    thing = arrayOfThings[i2];
    if (thing !== void 0 && thing !== null && !isArray(thing)) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      for (j2 = 0, jlen = thing.length; j2 < jlen; j2++) {
        nestedThing = thing[j2];
        if (nestedThing !== void 0 && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }
  ctx.restore();
  const gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i2 = 0; i2 < gcLen; i2++) {
      delete data[gc[i2]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}
function _alignPixel(chart, pixel, width) {
  const devicePixelRatio = chart.currentDevicePixelRatio;
  const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
function clearCanvas(canvas, ctx) {
  if (!ctx && !canvas) {
    return;
  }
  ctx = ctx || canvas.getContext("2d");
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
function drawPoint(ctx, options2, x2, y2) {
  drawPointLegend(ctx, options2, x2, y2, null);
}
function drawPointLegend(ctx, options2, x2, y2, w2) {
  let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
  const style = options2.pointStyle;
  const rotation = options2.rotation;
  const radius = options2.radius;
  let rad = (rotation || 0) * RAD_PER_DEG;
  if (style && typeof style === "object") {
    type = style.toString();
    if (type === "[object HTMLImageElement]" || type === "[object HTMLCanvasElement]") {
      ctx.save();
      ctx.translate(x2, y2);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }
  if (isNaN(radius) || radius <= 0) {
    return;
  }
  ctx.beginPath();
  switch (style) {
    // Default includes circle
    default:
      if (w2) {
        ctx.ellipse(x2, y2, w2 / 2, radius, 0, 0, TAU);
      } else {
        ctx.arc(x2, y2, radius, 0, TAU);
      }
      ctx.closePath();
      break;
    case "triangle":
      width = w2 ? w2 / 2 : radius;
      ctx.moveTo(x2 + Math.sin(rad) * width, y2 - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x2 + Math.sin(rad) * width, y2 - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x2 + Math.sin(rad) * width, y2 - Math.cos(rad) * radius);
      ctx.closePath();
      break;
    case "rectRounded":
      cornerRadius = radius * 0.516;
      size = radius - cornerRadius;
      xOffset = Math.cos(rad + QUARTER_PI) * size;
      xOffsetW = Math.cos(rad + QUARTER_PI) * (w2 ? w2 / 2 - cornerRadius : size);
      yOffset = Math.sin(rad + QUARTER_PI) * size;
      yOffsetW = Math.sin(rad + QUARTER_PI) * (w2 ? w2 / 2 - cornerRadius : size);
      ctx.arc(x2 - xOffsetW, y2 - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
      ctx.arc(x2 + yOffsetW, y2 - xOffset, cornerRadius, rad - HALF_PI, rad);
      ctx.arc(x2 + xOffsetW, y2 + yOffset, cornerRadius, rad, rad + HALF_PI);
      ctx.arc(x2 - yOffsetW, y2 + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
      ctx.closePath();
      break;
    case "rect":
      if (!rotation) {
        size = Math.SQRT1_2 * radius;
        width = w2 ? w2 / 2 : size;
        ctx.rect(x2 - width, y2 - size, 2 * width, 2 * size);
        break;
      }
      rad += QUARTER_PI;
    /* falls through */
    case "rectRot":
      xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
      ctx.moveTo(x2 - xOffsetW, y2 - yOffset);
      ctx.lineTo(x2 + yOffsetW, y2 - xOffset);
      ctx.lineTo(x2 + xOffsetW, y2 + yOffset);
      ctx.lineTo(x2 - yOffsetW, y2 + xOffset);
      ctx.closePath();
      break;
    case "crossRot":
      rad += QUARTER_PI;
    /* falls through */
    case "cross":
      xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
      ctx.moveTo(x2 - xOffsetW, y2 - yOffset);
      ctx.lineTo(x2 + xOffsetW, y2 + yOffset);
      ctx.moveTo(x2 + yOffsetW, y2 - xOffset);
      ctx.lineTo(x2 - yOffsetW, y2 + xOffset);
      break;
    case "star":
      xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
      ctx.moveTo(x2 - xOffsetW, y2 - yOffset);
      ctx.lineTo(x2 + xOffsetW, y2 + yOffset);
      ctx.moveTo(x2 + yOffsetW, y2 - xOffset);
      ctx.lineTo(x2 - yOffsetW, y2 + xOffset);
      rad += QUARTER_PI;
      xOffsetW = Math.cos(rad) * (w2 ? w2 / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w2 ? w2 / 2 : radius);
      ctx.moveTo(x2 - xOffsetW, y2 - yOffset);
      ctx.lineTo(x2 + xOffsetW, y2 + yOffset);
      ctx.moveTo(x2 + yOffsetW, y2 - xOffset);
      ctx.lineTo(x2 - yOffsetW, y2 + xOffset);
      break;
    case "line":
      xOffset = w2 ? w2 / 2 : Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x2 - xOffset, y2 - yOffset);
      ctx.lineTo(x2 + xOffset, y2 + yOffset);
      break;
    case "dash":
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 + Math.cos(rad) * (w2 ? w2 / 2 : radius), y2 + Math.sin(rad) * radius);
      break;
    case false:
      ctx.closePath();
      break;
  }
  ctx.fill();
  if (options2.borderWidth > 0) {
    ctx.stroke();
  }
}
function _isPointInArea(point, area, margin) {
  margin = margin || 0.5;
  return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
function unclipArea(ctx) {
  ctx.restore();
}
function _steppedLineTo(ctx, previous, target, flip, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === "middle") {
    const midpoint = (previous.x + target.x) / 2;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === "after" !== !!flip) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}
function _bezierCurveTo(ctx, previous, target, flip) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
}
function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }
  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }
  if (opts.color) {
    ctx.fillStyle = opts.color;
  }
  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }
  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}
function decorateText(ctx, x2, y2, line, opts) {
  if (opts.strikethrough || opts.underline) {
    const metrics2 = ctx.measureText(line);
    const left = x2 - metrics2.actualBoundingBoxLeft;
    const right = x2 + metrics2.actualBoundingBoxRight;
    const top = y2 - metrics2.actualBoundingBoxAscent;
    const bottom = y2 + metrics2.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}
function drawBackdrop(ctx, opts) {
  const oldColor = ctx.fillStyle;
  ctx.fillStyle = opts.color;
  ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
  ctx.fillStyle = oldColor;
}
function renderText(ctx, text, x2, y2, font, opts = {}) {
  const lines = isArray(text) ? text : [text];
  const stroke = opts.strokeWidth > 0 && opts.strokeColor !== "";
  let i2, line;
  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);
  for (i2 = 0; i2 < lines.length; ++i2) {
    line = lines[i2];
    if (opts.backdrop) {
      drawBackdrop(ctx, opts.backdrop);
    }
    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }
      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }
      ctx.strokeText(line, x2, y2, opts.maxWidth);
    }
    ctx.fillText(line, x2, y2, opts.maxWidth);
    decorateText(ctx, x2, y2, line, opts);
    y2 += Number(font.lineHeight);
  }
  ctx.restore();
}
function addRoundedRectPath(ctx, rect) {
  const {
    x: x2,
    y: y2,
    w: w2,
    h: h3,
    radius
  } = rect;
  ctx.arc(x2 + radius.topLeft, y2 + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
  ctx.lineTo(x2, y2 + h3 - radius.bottomLeft);
  ctx.arc(x2 + radius.bottomLeft, y2 + h3 - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
  ctx.lineTo(x2 + w2 - radius.bottomRight, y2 + h3);
  ctx.arc(x2 + w2 - radius.bottomRight, y2 + h3 - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
  ctx.lineTo(x2 + w2, y2 + radius.topRight);
  ctx.arc(x2 + w2 - radius.topRight, y2 + radius.topRight, radius.topRight, 0, -HALF_PI, true);
  ctx.lineTo(x2 + radius.topLeft, y2);
}
const LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
const FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function toLineHeight(value, size) {
  const matches = ("" + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === "normal") {
    return size * 1.2;
  }
  value = +matches[2];
  switch (matches[3]) {
    case "px":
      return value;
    case "%":
      value /= 100;
      break;
  }
  return size * value;
}
const numberOrZero = (v2) => +v2 || 0;
function _readValueToProps(value, props) {
  const ret = {};
  const objProps = isObject(props);
  const keys = objProps ? Object.keys(props) : props;
  const read = isObject(value) ? objProps ? (prop) => valueOrDefault(value[prop], value[props[prop]]) : (prop) => value[prop] : () => value;
  for (const prop of keys) {
    ret[prop] = numberOrZero(read(prop));
  }
  return ret;
}
function toTRBL(value) {
  return _readValueToProps(value, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function toTRBLCorners(value) {
  return _readValueToProps(value, ["topLeft", "topRight", "bottomLeft", "bottomRight"]);
}
function toPadding(value) {
  const obj = toTRBL(value);
  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;
  return obj;
}
function toFont(options2, fallback) {
  options2 = options2 || {};
  fallback = fallback || defaults.font;
  let size = valueOrDefault(options2.size, fallback.size);
  if (typeof size === "string") {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options2.style, fallback.style);
  if (style && !("" + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = void 0;
  }
  const font = {
    family: valueOrDefault(options2.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options2.lineHeight, fallback.lineHeight), size),
    size,
    style,
    weight: valueOrDefault(options2.weight, fallback.weight),
    string: ""
  };
  font.string = toFontString(font);
  return font;
}
function resolve(inputs, context, index2, info) {
  let i2, ilen, value;
  for (i2 = 0, ilen = inputs.length; i2 < ilen; ++i2) {
    value = inputs[i2];
    if (value === void 0) {
      continue;
    }
    if (value !== void 0) {
      return value;
    }
  }
}
function _addGrace(minmax, grace, beginAtZero) {
  const {
    min,
    max
  } = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = (value, add) => beginAtZero && value === 0 ? 0 : value + add;
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}
function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}
function _createResolver(scopes, prefixes = [""], rootScopes, fallback, getTarget = () => scopes[0]) {
  const finalRootScopes = rootScopes || scopes;
  if (typeof fallback === "undefined") {
    fallback = _resolve("_fallback", scopes);
  }
  const cache = {
    [Symbol.toStringTag]: "Object",
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: finalRootScopes,
    _fallback: fallback,
    _getTarget: getTarget,
    override: (scope) => _createResolver([scope, ...scopes], prefixes, finalRootScopes, fallback)
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(target, prop) {
      delete target[prop];
      delete target._keys;
      delete scopes[0][prop];
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get(target, prop) {
      return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes, scopes, target));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(target, prop) {
      return getKeysFromAllScopes(target).includes(prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },
    /**
    * A trap for setting property values.
    */
    set(target, prop, value) {
      const storage = target._storage || (target._storage = getTarget());
      target[prop] = storage[prop] = value;
      delete target._keys;
      return true;
    }
  });
}
function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(target, prop) {
      delete target[prop];
      delete proxy[prop];
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get(target, prop, receiver) {
      return _cached(target, prop, () => _resolveWithContext(target, prop, receiver));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
        enumerable: true,
        configurable: true
      } : void 0 : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },
    /**
    * A trap for the in operator.
    */
    has(target, prop) {
      return Reflect.has(proxy, prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(proxy);
    },
    /**
    * A trap for setting property values.
    */
    set(target, prop, value) {
      proxy[prop] = value;
      delete target[prop];
      return true;
    }
  });
}
function _descriptors(proxy, defaults2 = {
  scriptable: true,
  indexable: true
}) {
  const {
    _scriptable = defaults2.scriptable,
    _indexable = defaults2.indexable,
    _allKeys = defaults2.allKeys
  } = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}
const readKey = (prefix, name) => prefix ? prefix + _capitalize(name) : name;
const needsSubResolver = (prop, value) => isObject(value) && prop !== "adapters" && (Object.getPrototypeOf(value) === null || value.constructor === Object);
function _cached(target, prop, resolve2) {
  if (Object.prototype.hasOwnProperty.call(target, prop) || prop === "constructor") {
    return target[prop];
  }
  const value = resolve2();
  target[prop] = value;
  return value;
}
function _resolveWithContext(target, prop, receiver) {
  const {
    _proxy,
    _context,
    _subProxy,
    _descriptors: descriptors2
  } = target;
  let value = _proxy[prop];
  if (isFunction(value) && descriptors2.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors2.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors2);
  }
  return value;
}
function _resolveScriptable(prop, getValue, target, receiver) {
  const {
    _proxy,
    _context,
    _subProxy,
    _stack
  } = target;
  if (_stack.has(prop)) {
    throw new Error("Recursion detected: " + Array.from(_stack).join("->") + "->" + prop);
  }
  _stack.add(prop);
  let value = getValue(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}
function _resolveArray(prop, value, target, isIndexable) {
  const {
    _proxy,
    _context,
    _subProxy,
    _descriptors: descriptors2
  } = target;
  if (typeof _context.index !== "undefined" && isIndexable(prop)) {
    return value[_context.index % value.length];
  } else if (isObject(value[0])) {
    const arr = value;
    const scopes = _proxy._scopes.filter((s2) => s2 !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver(scopes, _proxy, prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors2));
    }
  }
  return value;
}
function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}
const getScope = (key, parent) => key === true ? parent : typeof key === "string" ? resolveObjectKey(parent, key) : void 0;
function addScopes(set2, parentScopes, key, parentFallback, value) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set2.add(scope);
      const fallback = resolveFallback(scope._fallback, key, value);
      if (typeof fallback !== "undefined" && fallback !== key && fallback !== parentFallback) {
        return fallback;
      }
    } else if (scope === false && typeof parentFallback !== "undefined" && key !== parentFallback) {
      return null;
    }
  }
  return false;
}
function createSubResolver(parentScopes, resolver, prop, value) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [...parentScopes, ...rootScopes];
  const set2 = /* @__PURE__ */ new Set();
  set2.add(value);
  let key = addScopesFromKey(set2, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (typeof fallback !== "undefined" && fallback !== prop) {
    key = addScopesFromKey(set2, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set2), [""], rootScopes, fallback, () => subGetTarget(resolver, prop, value));
}
function addScopesFromKey(set2, allScopes, key, fallback, item) {
  while (key) {
    key = addScopes(set2, allScopes, key, fallback, item);
  }
  return key;
}
function subGetTarget(resolver, prop, value) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    return value;
  }
  return target || {};
}
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  let value;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (typeof value !== "undefined") {
      return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
    }
  }
}
function _resolve(key, scopes) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (typeof value !== "undefined") {
      return value;
    }
  }
}
function getKeysFromAllScopes(target) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}
function resolveKeysFromAllScopes(scopes) {
  const set2 = /* @__PURE__ */ new Set();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter((k2) => !k2.startsWith("_"))) {
      set2.add(key);
    }
  }
  return Array.from(set2);
}
function _parseObjectDataRadialScale(meta, data, start, count) {
  const {
    iScale
  } = meta;
  const {
    key = "r"
  } = this._parsing;
  const parsed = new Array(count);
  let i2, ilen, index2, item;
  for (i2 = 0, ilen = count; i2 < ilen; ++i2) {
    index2 = i2 + start;
    item = data[index2];
    parsed[i2] = {
      r: iScale.parse(resolveObjectKey(item, key), index2)
    };
  }
  return parsed;
}
const EPSILON = Number.EPSILON || 1e-14;
const getPoint = (points, i2) => i2 < points.length && !points[i2].skip && points[i2];
const getValueAxis = (indexAxis) => indexAxis === "x" ? "y" : "x";
function splineCurve(firstPoint, middlePoint, afterPoint, t2) {
  const previous = firstPoint.skip ? middlePoint : firstPoint;
  const current = middlePoint;
  const next = afterPoint.skip ? middlePoint : afterPoint;
  const d01 = distanceBetweenPoints(current, previous);
  const d12 = distanceBetweenPoints(next, current);
  let s01 = d01 / (d01 + d12);
  let s12 = d12 / (d01 + d12);
  s01 = isNaN(s01) ? 0 : s01;
  s12 = isNaN(s12) ? 0 : s12;
  const fa = t2 * s01;
  const fb = t2 * s12;
  return {
    previous: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y)
    },
    next: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y)
    }
  };
}
function monotoneAdjust(points, deltaK, mK) {
  const pointsLen = points.length;
  let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i2 = 0; i2 < pointsLen - 1; ++i2) {
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i2 + 1);
    if (!pointCurrent || !pointAfter) {
      continue;
    }
    if (almostEquals(deltaK[i2], 0, EPSILON)) {
      mK[i2] = mK[i2 + 1] = 0;
      continue;
    }
    alphaK = mK[i2] / deltaK[i2];
    betaK = mK[i2 + 1] / deltaK[i2];
    squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
    if (squaredMagnitude <= 9) {
      continue;
    }
    tauK = 3 / Math.sqrt(squaredMagnitude);
    mK[i2] = alphaK * tauK * deltaK[i2];
    mK[i2 + 1] = betaK * tauK * deltaK[i2];
  }
}
function monotoneCompute(points, mK, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  let delta, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i2 = 0; i2 < pointsLen; ++i2) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i2 + 1);
    if (!pointCurrent) {
      continue;
    }
    const iPixel = pointCurrent[indexAxis];
    const vPixel = pointCurrent[valueAxis];
    if (pointBefore) {
      delta = (iPixel - pointBefore[indexAxis]) / 3;
      pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
      pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i2];
    }
    if (pointAfter) {
      delta = (pointAfter[indexAxis] - iPixel) / 3;
      pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
      pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i2];
    }
  }
}
function splineCurveMonotone(points, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  const deltaK = Array(pointsLen).fill(0);
  const mK = Array(pointsLen);
  let i2, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (i2 = 0; i2 < pointsLen; ++i2) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i2 + 1);
    if (!pointCurrent) {
      continue;
    }
    if (pointAfter) {
      const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
      deltaK[i2] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
    }
    mK[i2] = !pointBefore ? deltaK[i2] : !pointAfter ? deltaK[i2 - 1] : sign(deltaK[i2 - 1]) !== sign(deltaK[i2]) ? 0 : (deltaK[i2 - 1] + deltaK[i2]) / 2;
  }
  monotoneAdjust(points, deltaK, mK);
  monotoneCompute(points, mK, indexAxis);
}
function capControlPoint(pt, min, max) {
  return Math.max(Math.min(pt, max), min);
}
function capBezierPoints(points, area) {
  let i2, ilen, point, inArea, inAreaPrev;
  let inAreaNext = _isPointInArea(points[0], area);
  for (i2 = 0, ilen = points.length; i2 < ilen; ++i2) {
    inAreaPrev = inArea;
    inArea = inAreaNext;
    inAreaNext = i2 < ilen - 1 && _isPointInArea(points[i2 + 1], area);
    if (!inArea) {
      continue;
    }
    point = points[i2];
    if (inAreaPrev) {
      point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
      point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
    }
    if (inAreaNext) {
      point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
      point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
    }
  }
}
function _updateBezierControlPoints(points, options2, area, loop, indexAxis) {
  let i2, ilen, point, controlPoints;
  if (options2.spanGaps) {
    points = points.filter((pt) => !pt.skip);
  }
  if (options2.cubicInterpolationMode === "monotone") {
    splineCurveMonotone(points, indexAxis);
  } else {
    let prev = loop ? points[points.length - 1] : points[0];
    for (i2 = 0, ilen = points.length; i2 < ilen; ++i2) {
      point = points[i2];
      controlPoints = splineCurve(prev, point, points[Math.min(i2 + 1, ilen - (loop ? 0 : 1)) % ilen], options2.tension);
      point.cp1x = controlPoints.previous.x;
      point.cp1y = controlPoints.previous.y;
      point.cp2x = controlPoints.next.x;
      point.cp2y = controlPoints.next.y;
      prev = point;
    }
  }
  if (options2.capBezierPoints) {
    capBezierPoints(points, area);
  }
}
function _isDomSupported() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
function _getParentNode(domNode) {
  let parent = domNode.parentNode;
  if (parent && parent.toString() === "[object ShadowRoot]") {
    parent = parent.host;
  }
  return parent;
}
function parseMaxStyle(styleValue, node, parentProperty) {
  let valueInPixels;
  if (typeof styleValue === "string") {
    valueInPixels = parseInt(styleValue, 10);
    if (styleValue.indexOf("%") !== -1) {
      valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }
  return valueInPixels;
}
const getComputedStyle = (element) => element.ownerDocument.defaultView.getComputedStyle(element, null);
function getStyle(el, property) {
  return getComputedStyle(el).getPropertyValue(property);
}
const positions = ["top", "right", "bottom", "left"];
function getPositionedStyle(styles, style, suffix) {
  const result = {};
  suffix = suffix ? "-" + suffix : "";
  for (let i2 = 0; i2 < 4; i2++) {
    const pos = positions[i2];
    result[pos] = parseFloat(styles[style + "-" + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}
const useOffsetPos = (x2, y2, target) => (x2 > 0 || y2 > 0) && (!target || !target.shadowRoot);
function getCanvasPosition(e2, canvas) {
  const touches = e2.touches;
  const source = touches && touches.length ? touches[0] : e2;
  const {
    offsetX,
    offsetY
  } = source;
  let box = false;
  let x2, y2;
  if (useOffsetPos(offsetX, offsetY, e2.target)) {
    x2 = offsetX;
    y2 = offsetY;
  } else {
    const rect = canvas.getBoundingClientRect();
    x2 = source.clientX - rect.left;
    y2 = source.clientY - rect.top;
    box = true;
  }
  return {
    x: x2,
    y: y2,
    box
  };
}
function getRelativePosition(event, chart) {
  if ("native" in event) {
    return event;
  }
  const {
    canvas,
    currentDevicePixelRatio
  } = chart;
  const style = getComputedStyle(canvas);
  const borderBox = style.boxSizing === "border-box";
  const paddings = getPositionedStyle(style, "padding");
  const borders = getPositionedStyle(style, "border", "width");
  const {
    x: x2,
    y: y2,
    box
  } = getCanvasPosition(event, canvas);
  const xOffset = paddings.left + (box && borders.left);
  const yOffset = paddings.top + (box && borders.top);
  let {
    width,
    height
  } = chart;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x2 - xOffset) / width * canvas.width / currentDevicePixelRatio),
    y: Math.round((y2 - yOffset) / height * canvas.height / currentDevicePixelRatio)
  };
}
function getContainerSize(canvas, width, height) {
  let maxWidth, maxHeight;
  if (width === void 0 || height === void 0) {
    const container = canvas && _getParentNode(canvas);
    if (!container) {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    } else {
      const rect = container.getBoundingClientRect();
      const containerStyle = getComputedStyle(container);
      const containerBorder = getPositionedStyle(containerStyle, "border", "width");
      const containerPadding = getPositionedStyle(containerStyle, "padding");
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, "clientWidth");
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, "clientHeight");
    }
  }
  return {
    width,
    height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}
const round1 = (v2) => Math.round(v2 * 10) / 10;
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
  const style = getComputedStyle(canvas);
  const margins = getPositionedStyle(style, "margin");
  const maxWidth = parseMaxStyle(style.maxWidth, canvas, "clientWidth") || INFINITY;
  const maxHeight = parseMaxStyle(style.maxHeight, canvas, "clientHeight") || INFINITY;
  const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
  let {
    width,
    height
  } = containerSize;
  if (style.boxSizing === "content-box") {
    const borders = getPositionedStyle(style, "border", "width");
    const paddings = getPositionedStyle(style, "padding");
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    height = round1(width / 2);
  }
  const maintainHeight = bbWidth !== void 0 || bbHeight !== void 0;
  if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
    height = containerSize.height;
    width = round1(Math.floor(height * aspectRatio));
  }
  return {
    width,
    height
  };
}
function retinaScale(chart, forceRatio, forceStyle) {
  const pixelRatio = forceRatio || 1;
  const deviceHeight = round1(chart.height * pixelRatio);
  const deviceWidth = round1(chart.width * pixelRatio);
  chart.height = round1(chart.height);
  chart.width = round1(chart.width);
  const canvas = chart.canvas;
  if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
    canvas.style.height = `${chart.height}px`;
    canvas.style.width = `${chart.width}px`;
  }
  const canvasHeight = Math.floor(deviceHeight);
  const canvasWidth = Math.floor(deviceWidth);
  if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== canvasHeight || canvas.width !== canvasWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}
const supportsEventListenerOptions = (function() {
  let passiveSupported = false;
  try {
    const options2 = {
      get passive() {
        passiveSupported = true;
        return false;
      }
    };
    if (_isDomSupported()) {
      window.addEventListener("test", null, options2);
      window.removeEventListener("test", null, options2);
    }
  } catch (e2) {
  }
  return passiveSupported;
})();
function readUsedSize(element, property) {
  const value = getStyle(element, property);
  const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : void 0;
}
function _pointInLine(p1, p2, t2, mode) {
  return {
    x: p1.x + t2 * (p2.x - p1.x),
    y: p1.y + t2 * (p2.y - p1.y)
  };
}
function _steppedInterpolation(p1, p2, t2, mode) {
  return {
    x: p1.x + t2 * (p2.x - p1.x),
    y: mode === "middle" ? t2 < 0.5 ? p1.y : p2.y : mode === "after" ? t2 < 1 ? p1.y : p2.y : t2 > 0 ? p2.y : p1.y
  };
}
function _bezierInterpolation(p1, p2, t2, mode) {
  const cp1 = {
    x: p1.cp2x,
    y: p1.cp2y
  };
  const cp2 = {
    x: p2.cp1x,
    y: p2.cp1y
  };
  const a2 = _pointInLine(p1, cp1, t2);
  const b2 = _pointInLine(cp1, cp2, t2);
  const c2 = _pointInLine(cp2, p2, t2);
  const d2 = _pointInLine(a2, b2, t2);
  const e2 = _pointInLine(b2, c2, t2);
  return _pointInLine(d2, e2, t2);
}
const getRightToLeftAdapter = function(rectX, width) {
  return {
    x(x2) {
      return rectX + rectX + width - x2;
    },
    setWidth(w2) {
      width = w2;
    },
    textAlign(align) {
      if (align === "center") {
        return align;
      }
      return align === "right" ? "left" : "right";
    },
    xPlus(x2, value) {
      return x2 - value;
    },
    leftForLtr(x2, itemWidth) {
      return x2 - itemWidth;
    }
  };
};
const getLeftToRightAdapter = function() {
  return {
    x(x2) {
      return x2;
    },
    setWidth(w2) {
    },
    textAlign(align) {
      return align;
    },
    xPlus(x2, value) {
      return x2 + value;
    },
    leftForLtr(x2, _itemWidth) {
      return x2;
    }
  };
};
function getRtlAdapter(rtl, rectX, width) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
function overrideTextDirection(ctx, direction) {
  let style, original;
  if (direction === "ltr" || direction === "rtl") {
    style = ctx.canvas.style;
    original = [style.getPropertyValue("direction"), style.getPropertyPriority("direction")];
    style.setProperty("direction", direction, "important");
    ctx.prevTextDirection = original;
  }
}
function restoreTextDirection(ctx, original) {
  if (original !== void 0) {
    delete ctx.prevTextDirection;
    ctx.canvas.style.setProperty("direction", original[0], original[1]);
  }
}
function propertyFn(property) {
  if (property === "angle") {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle
    };
  }
  return {
    between: _isBetween,
    compare: (a2, b2) => a2 - b2,
    normalize: (x2) => x2
  };
}
function normalizeSegment({
  start,
  end,
  count,
  loop,
  style
}) {
  return {
    start: start % count,
    end: end % count,
    loop: loop && (end - start + 1) % count === 0,
    style
  };
}
function getSegment(segment, points, bounds) {
  const {
    property,
    start: startBound,
    end: endBound
  } = bounds;
  const {
    between,
    normalize: normalize2
  } = propertyFn(property);
  const count = points.length;
  let {
    start,
    end,
    loop
  } = segment;
  let i2, ilen;
  if (loop) {
    start += count;
    end += count;
    for (i2 = 0, ilen = count; i2 < ilen; ++i2) {
      if (!between(normalize2(points[start % count][property]), startBound, endBound)) {
        break;
      }
      start--;
      end--;
    }
    start %= count;
    end %= count;
  }
  if (end < start) {
    end += count;
  }
  return {
    start,
    end,
    loop,
    style: segment.style
  };
}
function _boundSegment(segment, points, bounds) {
  if (!bounds) {
    return [segment];
  }
  const {
    property,
    start: startBound,
    end: endBound
  } = bounds;
  const count = points.length;
  const {
    compare,
    between,
    normalize: normalize2
  } = propertyFn(property);
  const {
    start,
    end,
    loop,
    style
  } = getSegment(segment, points, bounds);
  const result = [];
  let inside = false;
  let subStart = null;
  let value, point, prevValue;
  const startIsBefore = () => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
  const endIsBefore = () => compare(endBound, value) === 0 || between(endBound, prevValue, value);
  const shouldStart = () => inside || startIsBefore();
  const shouldStop = () => !inside || endIsBefore();
  for (let i2 = start, prev = start; i2 <= end; ++i2) {
    point = points[i2 % count];
    if (point.skip) {
      continue;
    }
    value = normalize2(point[property]);
    if (value === prevValue) {
      continue;
    }
    inside = between(value, startBound, endBound);
    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i2 : prev;
    }
    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({
        start: subStart,
        end: i2,
        loop,
        count,
        style
      }));
      subStart = null;
    }
    prev = i2;
    prevValue = value;
  }
  if (subStart !== null) {
    result.push(normalizeSegment({
      start: subStart,
      end,
      loop,
      count,
      style
    }));
  }
  return result;
}
function _boundSegments(line, bounds) {
  const result = [];
  const segments = line.segments;
  for (let i2 = 0; i2 < segments.length; i2++) {
    const sub = _boundSegment(segments[i2], line.points, bounds);
    if (sub.length) {
      result.push(...sub);
    }
  }
  return result;
}
function findStartAndEnd(points, count, loop, spanGaps) {
  let start = 0;
  let end = count - 1;
  if (loop && !spanGaps) {
    while (start < count && !points[start].skip) {
      start++;
    }
  }
  while (start < count && points[start].skip) {
    start++;
  }
  start %= count;
  if (loop) {
    end += start;
  }
  while (end > start && points[end % count].skip) {
    end--;
  }
  end %= count;
  return {
    start,
    end
  };
}
function solidSegments(points, start, max, loop) {
  const count = points.length;
  const result = [];
  let last = start;
  let prev = points[start];
  let end;
  for (end = start + 1; end <= max; ++end) {
    const cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop = false;
        result.push({
          start: start % count,
          end: (end - 1) % count,
          loop
        });
        start = last = cur.stop ? end : null;
      }
    } else {
      last = end;
      if (prev.skip) {
        start = end;
      }
    }
    prev = cur;
  }
  if (last !== null) {
    result.push({
      start: start % count,
      end: last % count,
      loop
    });
  }
  return result;
}
function _computeSegments(line, segmentOptions) {
  const points = line.points;
  const spanGaps = line.options.spanGaps;
  const count = points.length;
  if (!count) {
    return [];
  }
  const loop = !!line._loop;
  const {
    start,
    end
  } = findStartAndEnd(points, count, loop, spanGaps);
  if (spanGaps === true) {
    return splitByStyles(line, [{
      start,
      end,
      loop
    }], points, segmentOptions);
  }
  const max = end < start ? end + count : end;
  const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
function splitByStyles(line, segments, points, segmentOptions) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}
function doSplitByStyles(line, segments, points, segmentOptions) {
  const chartContext = line._chart.getContext();
  const baseStyle = readStyle(line.options);
  const {
    _datasetIndex: datasetIndex,
    options: {
      spanGaps
    }
  } = line;
  const count = points.length;
  const result = [];
  let prevStyle = baseStyle;
  let start = segments[0].start;
  let i2 = start;
  function addStyle(s2, e2, l2, st) {
    const dir = spanGaps ? -1 : 1;
    if (s2 === e2) {
      return;
    }
    s2 += count;
    while (points[s2 % count].skip) {
      s2 -= dir;
    }
    while (points[e2 % count].skip) {
      e2 += dir;
    }
    if (s2 % count !== e2 % count) {
      result.push({
        start: s2 % count,
        end: e2 % count,
        loop: l2,
        style: st
      });
      prevStyle = st;
      start = e2 % count;
    }
  }
  for (const segment of segments) {
    start = spanGaps ? start : segment.start;
    let prev = points[start % count];
    let style;
    for (i2 = start + 1; i2 <= segment.end; i2++) {
      const pt = points[i2 % count];
      style = readStyle(segmentOptions.setContext(createContext(chartContext, {
        type: "segment",
        p0: prev,
        p1: pt,
        p0DataIndex: (i2 - 1) % count,
        p1DataIndex: i2 % count,
        datasetIndex
      })));
      if (styleChanged(style, prevStyle)) {
        addStyle(start, i2 - 1, segment.loop, prevStyle);
      }
      prev = pt;
      prevStyle = style;
    }
    if (start < i2 - 1) {
      addStyle(start, i2 - 1, segment.loop, prevStyle);
    }
  }
  return result;
}
function readStyle(options2) {
  return {
    backgroundColor: options2.backgroundColor,
    borderCapStyle: options2.borderCapStyle,
    borderDash: options2.borderDash,
    borderDashOffset: options2.borderDashOffset,
    borderJoinStyle: options2.borderJoinStyle,
    borderWidth: options2.borderWidth,
    borderColor: options2.borderColor
  };
}
function styleChanged(style, prevStyle) {
  if (!prevStyle) {
    return false;
  }
  const cache = [];
  const replacer = function(key, value) {
    if (!isPatternOrGradient(value)) {
      return value;
    }
    if (!cache.includes(value)) {
      cache.push(value);
    }
    return cache.indexOf(value);
  };
  return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
}
function getSizeForArea(scale, chartArea, field) {
  return scale.options.clip ? scale[field] : chartArea[field];
}
function getDatasetArea(meta, chartArea) {
  const {
    xScale,
    yScale
  } = meta;
  if (xScale && yScale) {
    return {
      left: getSizeForArea(xScale, chartArea, "left"),
      right: getSizeForArea(xScale, chartArea, "right"),
      top: getSizeForArea(yScale, chartArea, "top"),
      bottom: getSizeForArea(yScale, chartArea, "bottom")
    };
  }
  return chartArea;
}
function getDatasetClipArea(chart, meta) {
  const clip = meta._clip;
  if (clip.disabled) {
    return false;
  }
  const area = getDatasetArea(meta, chart.chartArea);
  return {
    left: clip.left === false ? 0 : area.left - (clip.left === true ? 0 : clip.left),
    right: clip.right === false ? chart.width : area.right + (clip.right === true ? 0 : clip.right),
    top: clip.top === false ? 0 : area.top - (clip.top === true ? 0 : clip.top),
    bottom: clip.bottom === false ? chart.height : area.bottom + (clip.bottom === true ? 0 : clip.bottom)
  };
}
class Animator {
  constructor() {
    this._request = null;
    this._charts = /* @__PURE__ */ new Map();
    this._running = false;
    this._lastDate = void 0;
  }
  _notify(chart, anims, date, type) {
    const callbacks = anims.listeners[type];
    const numSteps = anims.duration;
    callbacks.forEach((fn) => fn({
      chart,
      initial: anims.initial,
      numSteps,
      currentStep: Math.min(date - anims.start, numSteps)
    }));
  }
  _refresh() {
    if (this._request) {
      return;
    }
    this._running = true;
    this._request = requestAnimFrame.call(window, () => {
      this._update();
      this._request = null;
      if (this._running) {
        this._refresh();
      }
    });
  }
  _update(date = Date.now()) {
    let remaining = 0;
    this._charts.forEach((anims, chart) => {
      if (!anims.running || !anims.items.length) {
        return;
      }
      const items = anims.items;
      let i2 = items.length - 1;
      let draw2 = false;
      let item;
      for (; i2 >= 0; --i2) {
        item = items[i2];
        if (item._active) {
          if (item._total > anims.duration) {
            anims.duration = item._total;
          }
          item.tick(date);
          draw2 = true;
        } else {
          items[i2] = items[items.length - 1];
          items.pop();
        }
      }
      if (draw2) {
        chart.draw();
        this._notify(chart, anims, date, "progress");
      }
      if (!items.length) {
        anims.running = false;
        this._notify(chart, anims, date, "complete");
        anims.initial = false;
      }
      remaining += items.length;
    });
    this._lastDate = date;
    if (remaining === 0) {
      this._running = false;
    }
  }
  _getAnims(chart) {
    const charts = this._charts;
    let anims = charts.get(chart);
    if (!anims) {
      anims = {
        running: false,
        initial: true,
        items: [],
        listeners: {
          complete: [],
          progress: []
        }
      };
      charts.set(chart, anims);
    }
    return anims;
  }
  listen(chart, event, cb) {
    this._getAnims(chart).listeners[event].push(cb);
  }
  add(chart, items) {
    if (!items || !items.length) {
      return;
    }
    this._getAnims(chart).items.push(...items);
  }
  has(chart) {
    return this._getAnims(chart).items.length > 0;
  }
  start(chart) {
    const anims = this._charts.get(chart);
    if (!anims) {
      return;
    }
    anims.running = true;
    anims.start = Date.now();
    anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
    this._refresh();
  }
  running(chart) {
    if (!this._running) {
      return false;
    }
    const anims = this._charts.get(chart);
    if (!anims || !anims.running || !anims.items.length) {
      return false;
    }
    return true;
  }
  stop(chart) {
    const anims = this._charts.get(chart);
    if (!anims || !anims.items.length) {
      return;
    }
    const items = anims.items;
    let i2 = items.length - 1;
    for (; i2 >= 0; --i2) {
      items[i2].cancel();
    }
    anims.items = [];
    this._notify(chart, anims, Date.now(), "complete");
  }
  remove(chart) {
    return this._charts.delete(chart);
  }
}
var animator = /* @__PURE__ */ new Animator();
const transparent = "transparent";
const interpolators = {
  boolean(from2, to2, factor) {
    return factor > 0.5 ? to2 : from2;
  },
  color(from2, to2, factor) {
    const c0 = color(from2 || transparent);
    const c1 = c0.valid && color(to2 || transparent);
    return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to2;
  },
  number(from2, to2, factor) {
    return from2 + (to2 - from2) * factor;
  }
};
class Animation {
  constructor(cfg, target, prop, to2) {
    const currentValue = target[prop];
    to2 = resolve([cfg.to, to2, currentValue, cfg.from]);
    const from2 = resolve([cfg.from, currentValue, to2]);
    this._active = true;
    this._fn = cfg.fn || interpolators[cfg.type || typeof from2];
    this._easing = effects[cfg.easing] || effects.linear;
    this._start = Math.floor(Date.now() + (cfg.delay || 0));
    this._duration = this._total = Math.floor(cfg.duration);
    this._loop = !!cfg.loop;
    this._target = target;
    this._prop = prop;
    this._from = from2;
    this._to = to2;
    this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(cfg, to2, date) {
    if (this._active) {
      this._notify(false);
      const currentValue = this._target[this._prop];
      const elapsed = date - this._start;
      const remain = this._duration - elapsed;
      this._start = date;
      this._duration = Math.floor(Math.max(remain, cfg.duration));
      this._total += elapsed;
      this._loop = !!cfg.loop;
      this._to = resolve([cfg.to, to2, currentValue, cfg.from]);
      this._from = resolve([cfg.from, currentValue, to2]);
    }
  }
  cancel() {
    if (this._active) {
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }
  tick(date) {
    const elapsed = date - this._start;
    const duration = this._duration;
    const prop = this._prop;
    const from2 = this._from;
    const loop = this._loop;
    const to2 = this._to;
    let factor;
    this._active = from2 !== to2 && (loop || elapsed < duration);
    if (!this._active) {
      this._target[prop] = to2;
      this._notify(true);
      return;
    }
    if (elapsed < 0) {
      this._target[prop] = from2;
      return;
    }
    factor = elapsed / duration % 2;
    factor = loop && factor > 1 ? 2 - factor : factor;
    factor = this._easing(Math.min(1, Math.max(0, factor)));
    this._target[prop] = this._fn(from2, to2, factor);
  }
  wait() {
    const promises = this._promises || (this._promises = []);
    return new Promise((res, rej) => {
      promises.push({
        res,
        rej
      });
    });
  }
  _notify(resolved) {
    const method = resolved ? "res" : "rej";
    const promises = this._promises || [];
    for (let i2 = 0; i2 < promises.length; i2++) {
      promises[i2][method]();
    }
  }
}
class Animations {
  constructor(chart, config2) {
    this._chart = chart;
    this._properties = /* @__PURE__ */ new Map();
    this.configure(config2);
  }
  configure(config2) {
    if (!isObject(config2)) {
      return;
    }
    const animationOptions = Object.keys(defaults.animation);
    const animatedProps = this._properties;
    Object.getOwnPropertyNames(config2).forEach((key) => {
      const cfg = config2[key];
      if (!isObject(cfg)) {
        return;
      }
      const resolved = {};
      for (const option of animationOptions) {
        resolved[option] = cfg[option];
      }
      (isArray(cfg.properties) && cfg.properties || [key]).forEach((prop) => {
        if (prop === key || !animatedProps.has(prop)) {
          animatedProps.set(prop, resolved);
        }
      });
    });
  }
  _animateOptions(target, values) {
    const newOptions = values.options;
    const options2 = resolveTargetOptions(target, newOptions);
    if (!options2) {
      return [];
    }
    const animations = this._createAnimations(options2, newOptions);
    if (newOptions.$shared) {
      awaitAll(target.options.$animations, newOptions).then(() => {
        target.options = newOptions;
      }, () => {
      });
    }
    return animations;
  }
  _createAnimations(target, values) {
    const animatedProps = this._properties;
    const animations = [];
    const running = target.$animations || (target.$animations = {});
    const props = Object.keys(values);
    const date = Date.now();
    let i2;
    for (i2 = props.length - 1; i2 >= 0; --i2) {
      const prop = props[i2];
      if (prop.charAt(0) === "$") {
        continue;
      }
      if (prop === "options") {
        animations.push(...this._animateOptions(target, values));
        continue;
      }
      const value = values[prop];
      let animation = running[prop];
      const cfg = animatedProps.get(prop);
      if (animation) {
        if (cfg && animation.active()) {
          animation.update(cfg, value, date);
          continue;
        } else {
          animation.cancel();
        }
      }
      if (!cfg || !cfg.duration) {
        target[prop] = value;
        continue;
      }
      running[prop] = animation = new Animation(cfg, target, prop, value);
      animations.push(animation);
    }
    return animations;
  }
  update(target, values) {
    if (this._properties.size === 0) {
      Object.assign(target, values);
      return;
    }
    const animations = this._createAnimations(target, values);
    if (animations.length) {
      animator.add(this._chart, animations);
      return true;
    }
  }
}
function awaitAll(animations, properties) {
  const running = [];
  const keys = Object.keys(properties);
  for (let i2 = 0; i2 < keys.length; i2++) {
    const anim = animations[keys[i2]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  return Promise.all(running);
}
function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  let options2 = target.options;
  if (!options2) {
    target.options = newOptions;
    return;
  }
  if (options2.$shared) {
    target.options = options2 = Object.assign({}, options2, {
      $shared: false,
      $animations: {}
    });
  }
  return options2;
}
function scaleClip(scale, allowedOverflow) {
  const opts = scale && scale.options || {};
  const reverse = opts.reverse;
  const min = opts.min === void 0 ? allowedOverflow : 0;
  const max = opts.max === void 0 ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}
function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  const x2 = scaleClip(xScale, allowedOverflow);
  const y2 = scaleClip(yScale, allowedOverflow);
  return {
    top: y2.end,
    right: x2.end,
    bottom: y2.start,
    left: x2.start
  };
}
function toClip(value) {
  let t2, r2, b2, l2;
  if (isObject(value)) {
    t2 = value.top;
    r2 = value.right;
    b2 = value.bottom;
    l2 = value.left;
  } else {
    t2 = r2 = b2 = l2 = value;
  }
  return {
    top: t2,
    right: r2,
    bottom: b2,
    left: l2,
    disabled: value === false
  };
}
function getSortedDatasetIndices(chart, filterVisible) {
  const keys = [];
  const metasets = chart._getSortedDatasetMetas(filterVisible);
  let i2, ilen;
  for (i2 = 0, ilen = metasets.length; i2 < ilen; ++i2) {
    keys.push(metasets[i2].index);
  }
  return keys;
}
function applyStack(stack, value, dsIndex, options2 = {}) {
  const keys = stack.keys;
  const singleMode = options2.mode === "single";
  let i2, ilen, datasetIndex, otherValue;
  if (value === null) {
    return;
  }
  let found = false;
  for (i2 = 0, ilen = keys.length; i2 < ilen; ++i2) {
    datasetIndex = +keys[i2];
    if (datasetIndex === dsIndex) {
      found = true;
      if (options2.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if (isNumberFinite(otherValue) && (singleMode || value === 0 || sign(value) === sign(otherValue))) {
      value += otherValue;
    }
  }
  if (!found && !options2.all) {
    return 0;
  }
  return value;
}
function convertObjectDataToArray(data, meta) {
  const {
    iScale,
    vScale
  } = meta;
  const iAxisKey = iScale.axis === "x" ? "x" : "y";
  const vAxisKey = vScale.axis === "x" ? "x" : "y";
  const keys = Object.keys(data);
  const adata = new Array(keys.length);
  let i2, ilen, key;
  for (i2 = 0, ilen = keys.length; i2 < ilen; ++i2) {
    key = keys[i2];
    adata[i2] = {
      [iAxisKey]: key,
      [vAxisKey]: data[key]
    };
  }
  return adata;
}
function isStacked(scale, meta) {
  const stacked = scale && scale.options.stacked;
  return stacked || stacked === void 0 && meta.stack !== void 0;
}
function getStackKey(indexScale, valueScale, meta) {
  return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}
function getUserBounds(scale) {
  const {
    min,
    max,
    minDefined,
    maxDefined
  } = scale.getUserBounds();
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}
function getOrCreateStack(stacks, stackKey, indexValue) {
  const subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}
function getLastIndexInStack(stack, vScale, positive, type) {
  for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) {
    const value = stack[meta.index];
    if (positive && value > 0 || !positive && value < 0) {
      return meta.index;
    }
  }
  return null;
}
function updateStacks(controller, parsed) {
  const {
    chart,
    _cachedMeta: meta
  } = controller;
  const stacks = chart._stacks || (chart._stacks = {});
  const {
    iScale,
    vScale,
    index: datasetIndex
  } = meta;
  const iAxis = iScale.axis;
  const vAxis = vScale.axis;
  const key = getStackKey(iScale, vScale, meta);
  const ilen = parsed.length;
  let stack;
  for (let i2 = 0; i2 < ilen; ++i2) {
    const item = parsed[i2];
    const {
      [iAxis]: index2,
      [vAxis]: value
    } = item;
    const itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index2);
    stack[datasetIndex] = value;
    stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
    stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
    const visualValues = stack._visualValues || (stack._visualValues = {});
    visualValues[datasetIndex] = value;
  }
}
function getFirstScaleId(chart, axis) {
  const scales2 = chart.scales;
  return Object.keys(scales2).filter((key) => scales2[key].axis === axis).shift();
}
function createDatasetContext(parent, index2) {
  return createContext(parent, {
    active: false,
    dataset: void 0,
    datasetIndex: index2,
    index: index2,
    mode: "default",
    type: "dataset"
  });
}
function createDataContext(parent, index2, element) {
  return createContext(parent, {
    active: false,
    dataIndex: index2,
    parsed: void 0,
    raw: void 0,
    element,
    index: index2,
    mode: "default",
    type: "data"
  });
}
function clearStacks(meta, items) {
  const datasetIndex = meta.controller.index;
  const axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }
  items = items || meta._parsed;
  for (const parsed of items) {
    const stacks = parsed._stacks;
    if (!stacks || stacks[axis] === void 0 || stacks[axis][datasetIndex] === void 0) {
      continue;
    }
    delete stacks[axis][datasetIndex];
    if (stacks[axis]._visualValues !== void 0 && stacks[axis]._visualValues[datasetIndex] !== void 0) {
      delete stacks[axis]._visualValues[datasetIndex];
    }
  }
}
const isDirectUpdateMode = (mode) => mode === "reset" || mode === "none";
const cloneIfNotShared = (cached, shared) => shared ? cached : Object.assign({}, cached);
const createStack = (canStack, meta, chart) => canStack && !meta.hidden && meta._stacked && {
  keys: getSortedDatasetIndices(chart, true),
  values: null
};
class DatasetController {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(chart, datasetIndex) {
    this.chart = chart;
    this._ctx = chart.ctx;
    this.index = datasetIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = void 0;
    this._parsing = false;
    this._data = void 0;
    this._objectData = void 0;
    this._sharedOptions = void 0;
    this._drawStart = void 0;
    this._drawCount = void 0;
    this.enableOptionSharing = false;
    this.supportsDecimation = false;
    this.$context = void 0;
    this._syncList = [];
    this.datasetElementType = new.target.datasetElementType;
    this.dataElementType = new.target.dataElementType;
    this.initialize();
  }
  initialize() {
    const meta = this._cachedMeta;
    this.configure();
    this.linkScales();
    meta._stacked = isStacked(meta.vScale, meta);
    this.addElements();
    if (this.options.fill && !this.chart.isPluginEnabled("filler")) {
      console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
    }
  }
  updateIndex(datasetIndex) {
    if (this.index !== datasetIndex) {
      clearStacks(this._cachedMeta);
    }
    this.index = datasetIndex;
  }
  linkScales() {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    const chooseId = (axis, x2, y2, r2) => axis === "x" ? x2 : axis === "r" ? r2 : y2;
    const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, "x"));
    const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, "y"));
    const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, "r"));
    const indexAxis = meta.indexAxis;
    const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
    const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
    meta.xScale = this.getScaleForId(xid);
    meta.yScale = this.getScaleForId(yid);
    meta.rScale = this.getScaleForId(rid);
    meta.iScale = this.getScaleForId(iid);
    meta.vScale = this.getScaleForId(vid);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(scaleID) {
    return this.chart.scales[scaleID];
  }
  _getOtherScale(scale) {
    const meta = this._cachedMeta;
    return scale === meta.iScale ? meta.vScale : meta.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const meta = this._cachedMeta;
    if (this._data) {
      unlistenArrayEvents(this._data, this);
    }
    if (meta._stacked) {
      clearStacks(meta);
    }
  }
  _dataCheck() {
    const dataset = this.getDataset();
    const data = dataset.data || (dataset.data = []);
    const _data = this._data;
    if (isObject(data)) {
      const meta = this._cachedMeta;
      this._data = convertObjectDataToArray(data, meta);
    } else if (_data !== data) {
      if (_data) {
        unlistenArrayEvents(_data, this);
        const meta = this._cachedMeta;
        clearStacks(meta);
        meta._parsed = [];
      }
      if (data && Object.isExtensible(data)) {
        listenArrayEvents(data, this);
      }
      this._syncList = [];
      this._data = data;
    }
  }
  addElements() {
    const meta = this._cachedMeta;
    this._dataCheck();
    if (this.datasetElementType) {
      meta.dataset = new this.datasetElementType();
    }
  }
  buildOrUpdateElements(resetNewElements) {
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    let stackChanged = false;
    this._dataCheck();
    const oldStacked = meta._stacked;
    meta._stacked = isStacked(meta.vScale, meta);
    if (meta.stack !== dataset.stack) {
      stackChanged = true;
      clearStacks(meta);
      meta.stack = dataset.stack;
    }
    this._resyncElements(resetNewElements);
    if (stackChanged || oldStacked !== meta._stacked) {
      updateStacks(this, meta._parsed);
      meta._stacked = isStacked(meta.vScale, meta);
    }
  }
  configure() {
    const config2 = this.chart.config;
    const scopeKeys = config2.datasetScopeKeys(this._type);
    const scopes = config2.getOptionScopes(this.getDataset(), scopeKeys, true);
    this.options = config2.createResolver(scopes, this.getContext());
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};
  }
  parse(start, count) {
    const {
      _cachedMeta: meta,
      _data: data
    } = this;
    const {
      iScale,
      _stacked
    } = meta;
    const iAxis = iScale.axis;
    let sorted = start === 0 && count === data.length ? true : meta._sorted;
    let prev = start > 0 && meta._parsed[start - 1];
    let i2, cur, parsed;
    if (this._parsing === false) {
      meta._parsed = data;
      meta._sorted = true;
      parsed = data;
    } else {
      if (isArray(data[start])) {
        parsed = this.parseArrayData(meta, data, start, count);
      } else if (isObject(data[start])) {
        parsed = this.parseObjectData(meta, data, start, count);
      } else {
        parsed = this.parsePrimitiveData(meta, data, start, count);
      }
      const isNotInOrderComparedToPrev = () => cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
      for (i2 = 0; i2 < count; ++i2) {
        meta._parsed[i2 + start] = cur = parsed[i2];
        if (sorted) {
          if (isNotInOrderComparedToPrev()) {
            sorted = false;
          }
          prev = cur;
        }
      }
      meta._sorted = sorted;
    }
    if (_stacked) {
      updateStacks(this, parsed);
    }
  }
  parsePrimitiveData(meta, data, start, count) {
    const {
      iScale,
      vScale
    } = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = new Array(count);
    let i2, ilen, index2;
    for (i2 = 0, ilen = count; i2 < ilen; ++i2) {
      index2 = i2 + start;
      parsed[i2] = {
        [iAxis]: singleScale || iScale.parse(labels[index2], index2),
        [vAxis]: vScale.parse(data[index2], index2)
      };
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const {
      xScale,
      yScale
    } = meta;
    const parsed = new Array(count);
    let i2, ilen, index2, item;
    for (i2 = 0, ilen = count; i2 < ilen; ++i2) {
      index2 = i2 + start;
      item = data[index2];
      parsed[i2] = {
        x: xScale.parse(item[0], index2),
        y: yScale.parse(item[1], index2)
      };
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const {
      xScale,
      yScale
    } = meta;
    const {
      xAxisKey = "x",
      yAxisKey = "y"
    } = this._parsing;
    const parsed = new Array(count);
    let i2, ilen, index2, item;
    for (i2 = 0, ilen = count; i2 < ilen; ++i2) {
      index2 = i2 + start;
      item = data[index2];
      parsed[i2] = {
        x: xScale.parse(resolveObjectKey(item, xAxisKey), index2),
        y: yScale.parse(resolveObjectKey(item, yAxisKey), index2)
      };
    }
    return parsed;
  }
  getParsed(index2) {
    return this._cachedMeta._parsed[index2];
  }
  getDataElement(index2) {
    return this._cachedMeta.data[index2];
  }
  applyStack(scale, parsed, mode) {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const value = parsed[scale.axis];
    const stack = {
      keys: getSortedDatasetIndices(chart, true),
      values: parsed._stacks[scale.axis]._visualValues
    };
    return applyStack(stack, value, meta.index, {
      mode
    });
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    const parsedValue = parsed[scale.axis];
    let value = parsedValue === null ? NaN : parsedValue;
    const values = stack && parsed._stacks[scale.axis];
    if (stack && values) {
      stack.values = values;
      value = applyStack(stack, parsedValue, this._cachedMeta.index);
    }
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
  }
  getMinMax(scale, canStack) {
    const meta = this._cachedMeta;
    const _parsed = meta._parsed;
    const sorted = meta._sorted && scale === meta.iScale;
    const ilen = _parsed.length;
    const otherScale = this._getOtherScale(scale);
    const stack = createStack(canStack, meta, this.chart);
    const range = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    const {
      min: otherMin,
      max: otherMax
    } = getUserBounds(otherScale);
    let i2, parsed;
    function _skip() {
      parsed = _parsed[i2];
      const otherValue = parsed[otherScale.axis];
      return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
    }
    for (i2 = 0; i2 < ilen; ++i2) {
      if (_skip()) {
        continue;
      }
      this.updateRangeFromParsed(range, scale, parsed, stack);
      if (sorted) {
        break;
      }
    }
    if (sorted) {
      for (i2 = ilen - 1; i2 >= 0; --i2) {
        if (_skip()) {
          continue;
        }
        this.updateRangeFromParsed(range, scale, parsed, stack);
        break;
      }
    }
    return range;
  }
  getAllParsedValues(scale) {
    const parsed = this._cachedMeta._parsed;
    const values = [];
    let i2, ilen, value;
    for (i2 = 0, ilen = parsed.length; i2 < ilen; ++i2) {
      value = parsed[i2][scale.axis];
      if (isNumberFinite(value)) {
        values.push(value);
      }
    }
    return values;
  }
  getMaxOverflow() {
    return false;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const parsed = this.getParsed(index2);
    return {
      label: iScale ? "" + iScale.getLabelForValue(parsed[iScale.axis]) : "",
      value: vScale ? "" + vScale.getLabelForValue(parsed[vScale.axis]) : ""
    };
  }
  _update(mode) {
    const meta = this._cachedMeta;
    this.update(mode || "default");
    meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
  }
  update(mode) {
  }
  draw() {
    const ctx = this._ctx;
    const chart = this.chart;
    const meta = this._cachedMeta;
    const elements2 = meta.data || [];
    const area = chart.chartArea;
    const active = [];
    const start = this._drawStart || 0;
    const count = this._drawCount || elements2.length - start;
    const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
    let i2;
    if (meta.dataset) {
      meta.dataset.draw(ctx, area, start, count);
    }
    for (i2 = start; i2 < start + count; ++i2) {
      const element = elements2[i2];
      if (element.hidden) {
        continue;
      }
      if (element.active && drawActiveElementsOnTop) {
        active.push(element);
      } else {
        element.draw(ctx, area);
      }
    }
    for (i2 = 0; i2 < active.length; ++i2) {
      active[i2].draw(ctx, area);
    }
  }
  getStyle(index2, active) {
    const mode = active ? "active" : "default";
    return index2 === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index2 || 0, mode);
  }
  getContext(index2, active, mode) {
    const dataset = this.getDataset();
    let context;
    if (index2 >= 0 && index2 < this._cachedMeta.data.length) {
      const element = this._cachedMeta.data[index2];
      context = element.$context || (element.$context = createDataContext(this.getContext(), index2, element));
      context.parsed = this.getParsed(index2);
      context.raw = dataset.data[index2];
      context.index = context.dataIndex = index2;
    } else {
      context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
      context.dataset = dataset;
      context.index = context.datasetIndex = this.index;
    }
    context.active = !!active;
    context.mode = mode;
    return context;
  }
  resolveDatasetElementOptions(mode) {
    return this._resolveElementOptions(this.datasetElementType.id, mode);
  }
  resolveDataElementOptions(index2, mode) {
    return this._resolveElementOptions(this.dataElementType.id, mode, index2);
  }
  _resolveElementOptions(elementType, mode = "default", index2) {
    const active = mode === "active";
    const cache = this._cachedDataOpts;
    const cacheKey = elementType + "-" + mode;
    const cached = cache[cacheKey];
    const sharing = this.enableOptionSharing && defined(index2);
    if (cached) {
      return cloneIfNotShared(cached, sharing);
    }
    const config2 = this.chart.config;
    const scopeKeys = config2.datasetElementScopeKeys(this._type, elementType);
    const prefixes = active ? [`${elementType}Hover`, "hover", elementType, ""] : [elementType, ""];
    const scopes = config2.getOptionScopes(this.getDataset(), scopeKeys);
    const names2 = Object.keys(defaults.elements[elementType]);
    const context = () => this.getContext(index2, active, mode);
    const values = config2.resolveNamedOptions(scopes, names2, context, prefixes);
    if (values.$shared) {
      values.$shared = sharing;
      cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
    }
    return values;
  }
  _resolveAnimations(index2, transition, active) {
    const chart = this.chart;
    const cache = this._cachedDataOpts;
    const cacheKey = `animation-${transition}`;
    const cached = cache[cacheKey];
    if (cached) {
      return cached;
    }
    let options2;
    if (chart.options.animation !== false) {
      const config2 = this.chart.config;
      const scopeKeys = config2.datasetAnimationScopeKeys(this._type, transition);
      const scopes = config2.getOptionScopes(this.getDataset(), scopeKeys);
      options2 = config2.createResolver(scopes, this.getContext(index2, active, transition));
    }
    const animations = new Animations(chart, options2 && options2.animations);
    if (options2 && options2._cacheable) {
      cache[cacheKey] = Object.freeze(animations);
    }
    return animations;
  }
  getSharedOptions(options2) {
    if (!options2.$shared) {
      return;
    }
    return this._sharedOptions || (this._sharedOptions = Object.assign({}, options2));
  }
  includeOptions(mode, sharedOptions) {
    return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
  }
  _getSharedOptions(start, mode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const previouslySharedOptions = this._sharedOptions;
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
    return {
      sharedOptions,
      includeOptions
    };
  }
  updateElement(element, index2, properties, mode) {
    if (isDirectUpdateMode(mode)) {
      Object.assign(element, properties);
    } else {
      this._resolveAnimations(index2, mode).update(element, properties);
    }
  }
  updateSharedOptions(sharedOptions, mode, newOptions) {
    if (sharedOptions && !isDirectUpdateMode(mode)) {
      this._resolveAnimations(void 0, mode).update(sharedOptions, newOptions);
    }
  }
  _setStyle(element, index2, mode, active) {
    element.active = active;
    const options2 = this.getStyle(index2, active);
    this._resolveAnimations(index2, mode, active).update(element, {
      options: !active && this.getSharedOptions(options2) || options2
    });
  }
  removeHoverStyle(element, datasetIndex, index2) {
    this._setStyle(element, index2, "active", false);
  }
  setHoverStyle(element, datasetIndex, index2) {
    this._setStyle(element, index2, "active", true);
  }
  _removeDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;
    if (element) {
      this._setStyle(element, void 0, "active", false);
    }
  }
  _setDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;
    if (element) {
      this._setStyle(element, void 0, "active", true);
    }
  }
  _resyncElements(resetNewElements) {
    const data = this._data;
    const elements2 = this._cachedMeta.data;
    for (const [method, arg1, arg2] of this._syncList) {
      this[method](arg1, arg2);
    }
    this._syncList = [];
    const numMeta = elements2.length;
    const numData = data.length;
    const count = Math.min(numData, numMeta);
    if (count) {
      this.parse(0, count);
    }
    if (numData > numMeta) {
      this._insertElements(numMeta, numData - numMeta, resetNewElements);
    } else if (numData < numMeta) {
      this._removeElements(numData, numMeta - numData);
    }
  }
  _insertElements(start, count, resetNewElements = true) {
    const meta = this._cachedMeta;
    const data = meta.data;
    const end = start + count;
    let i2;
    const move = (arr) => {
      arr.length += count;
      for (i2 = arr.length - 1; i2 >= end; i2--) {
        arr[i2] = arr[i2 - count];
      }
    };
    move(data);
    for (i2 = start; i2 < end; ++i2) {
      data[i2] = new this.dataElementType();
    }
    if (this._parsing) {
      move(meta._parsed);
    }
    this.parse(start, count);
    if (resetNewElements) {
      this.updateElements(data, start, count, "reset");
    }
  }
  updateElements(element, start, count, mode) {
  }
  _removeElements(start, count) {
    const meta = this._cachedMeta;
    if (this._parsing) {
      const removed = meta._parsed.splice(start, count);
      if (meta._stacked) {
        clearStacks(meta, removed);
      }
    }
    meta.data.splice(start, count);
  }
  _sync(args) {
    if (this._parsing) {
      this._syncList.push(args);
    } else {
      const [method, arg1, arg2] = args;
      this[method](arg1, arg2);
    }
    this.chart._dataChanges.push([this.index, ...args]);
  }
  _onDataPush() {
    const count = arguments.length;
    this._sync(["_insertElements", this.getDataset().data.length - count, count]);
  }
  _onDataPop() {
    this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]);
  }
  _onDataShift() {
    this._sync(["_removeElements", 0, 1]);
  }
  _onDataSplice(start, count) {
    if (count) {
      this._sync(["_removeElements", start, count]);
    }
    const newCount = arguments.length - 2;
    if (newCount) {
      this._sync(["_insertElements", start, newCount]);
    }
  }
  _onDataUnshift() {
    this._sync(["_insertElements", 0, arguments.length]);
  }
}
function getAllScaleValues(scale, type) {
  if (!scale._cache.$bar) {
    const visibleMetas = scale.getMatchingVisibleMetas(type);
    let values = [];
    for (let i2 = 0, ilen = visibleMetas.length; i2 < ilen; i2++) {
      values = values.concat(visibleMetas[i2].controller.getAllParsedValues(scale));
    }
    scale._cache.$bar = _arrayUnique(values.sort((a2, b2) => a2 - b2));
  }
  return scale._cache.$bar;
}
function computeMinSampleSize(meta) {
  const scale = meta.iScale;
  const values = getAllScaleValues(scale, meta.type);
  let min = scale._length;
  let i2, ilen, curr, prev;
  const updateMinAndPrev = () => {
    if (curr === 32767 || curr === -32768) {
      return;
    }
    if (defined(prev)) {
      min = Math.min(min, Math.abs(curr - prev) || min);
    }
    prev = curr;
  };
  for (i2 = 0, ilen = values.length; i2 < ilen; ++i2) {
    curr = scale.getPixelForValue(values[i2]);
    updateMinAndPrev();
  }
  prev = void 0;
  for (i2 = 0, ilen = scale.ticks.length; i2 < ilen; ++i2) {
    curr = scale.getPixelForTick(i2);
    updateMinAndPrev();
  }
  return min;
}
function computeFitCategoryTraits(index2, ruler, options2, stackCount) {
  const thickness = options2.barThickness;
  let size, ratio;
  if (isNullOrUndef(thickness)) {
    size = ruler.min * options2.categoryPercentage;
    ratio = options2.barPercentage;
  } else {
    size = thickness * stackCount;
    ratio = 1;
  }
  return {
    chunk: size / stackCount,
    ratio,
    start: ruler.pixels[index2] - size / 2
  };
}
function computeFlexCategoryTraits(index2, ruler, options2, stackCount) {
  const pixels = ruler.pixels;
  const curr = pixels[index2];
  let prev = index2 > 0 ? pixels[index2 - 1] : null;
  let next = index2 < pixels.length - 1 ? pixels[index2 + 1] : null;
  const percent = options2.categoryPercentage;
  if (prev === null) {
    prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
  }
  if (next === null) {
    next = curr + curr - prev;
  }
  const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
  const size = Math.abs(next - prev) / 2 * percent;
  return {
    chunk: size / stackCount,
    ratio: options2.barPercentage,
    start
  };
}
function parseFloatBar(entry, item, vScale, i2) {
  const startValue = vScale.parse(entry[0], i2);
  const endValue = vScale.parse(entry[1], i2);
  const min = Math.min(startValue, endValue);
  const max = Math.max(startValue, endValue);
  let barStart = min;
  let barEnd = max;
  if (Math.abs(min) > Math.abs(max)) {
    barStart = max;
    barEnd = min;
  }
  item[vScale.axis] = barEnd;
  item._custom = {
    barStart,
    barEnd,
    start: startValue,
    end: endValue,
    min,
    max
  };
}
function parseValue(entry, item, vScale, i2) {
  if (isArray(entry)) {
    parseFloatBar(entry, item, vScale, i2);
  } else {
    item[vScale.axis] = vScale.parse(entry, i2);
  }
  return item;
}
function parseArrayOrPrimitive(meta, data, start, count) {
  const iScale = meta.iScale;
  const vScale = meta.vScale;
  const labels = iScale.getLabels();
  const singleScale = iScale === vScale;
  const parsed = [];
  let i2, ilen, item, entry;
  for (i2 = start, ilen = start + count; i2 < ilen; ++i2) {
    entry = data[i2];
    item = {};
    item[iScale.axis] = singleScale || iScale.parse(labels[i2], i2);
    parsed.push(parseValue(entry, item, vScale, i2));
  }
  return parsed;
}
function isFloatBar(custom) {
  return custom && custom.barStart !== void 0 && custom.barEnd !== void 0;
}
function barSign(size, vScale, actualBase) {
  if (size !== 0) {
    return sign(size);
  }
  return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
}
function borderProps(properties) {
  let reverse, start, end, top, bottom;
  if (properties.horizontal) {
    reverse = properties.base > properties.x;
    start = "left";
    end = "right";
  } else {
    reverse = properties.base < properties.y;
    start = "bottom";
    end = "top";
  }
  if (reverse) {
    top = "end";
    bottom = "start";
  } else {
    top = "start";
    bottom = "end";
  }
  return {
    start,
    end,
    reverse,
    top,
    bottom
  };
}
function setBorderSkipped(properties, options2, stack, index2) {
  let edge = options2.borderSkipped;
  const res = {};
  if (!edge) {
    properties.borderSkipped = res;
    return;
  }
  if (edge === true) {
    properties.borderSkipped = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
    return;
  }
  const {
    start,
    end,
    reverse,
    top,
    bottom
  } = borderProps(properties);
  if (edge === "middle" && stack) {
    properties.enableBorderRadius = true;
    if ((stack._top || 0) === index2) {
      edge = top;
    } else if ((stack._bottom || 0) === index2) {
      edge = bottom;
    } else {
      res[parseEdge(bottom, start, end, reverse)] = true;
      edge = top;
    }
  }
  res[parseEdge(edge, start, end, reverse)] = true;
  properties.borderSkipped = res;
}
function parseEdge(edge, a2, b2, reverse) {
  if (reverse) {
    edge = swap(edge, a2, b2);
    edge = startEnd(edge, b2, a2);
  } else {
    edge = startEnd(edge, a2, b2);
  }
  return edge;
}
function swap(orig, v1, v2) {
  return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
function startEnd(v2, start, end) {
  return v2 === "start" ? start : v2 === "end" ? end : v2;
}
function setInflateAmount(properties, {
  inflateAmount
}, ratio) {
  properties.inflateAmount = inflateAmount === "auto" ? ratio === 1 ? 0.33 : 0 : inflateAmount;
}
class BarController extends DatasetController {
  static id = "bar";
  static defaults = {
    datasetElementType: false,
    dataElementType: "bar",
    categoryPercentage: 0.8,
    barPercentage: 0.9,
    grouped: true,
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "base", "width", "height"]
      }
    }
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
        offset: true,
        grid: {
          offset: true
        }
      },
      _value_: {
        type: "linear",
        beginAtZero: true
      }
    }
  };
  parsePrimitiveData(meta, data, start, count) {
    return parseArrayOrPrimitive(meta, data, start, count);
  }
  parseArrayData(meta, data, start, count) {
    return parseArrayOrPrimitive(meta, data, start, count);
  }
  parseObjectData(meta, data, start, count) {
    const {
      iScale,
      vScale
    } = meta;
    const {
      xAxisKey = "x",
      yAxisKey = "y"
    } = this._parsing;
    const iAxisKey = iScale.axis === "x" ? xAxisKey : yAxisKey;
    const vAxisKey = vScale.axis === "x" ? xAxisKey : yAxisKey;
    const parsed = [];
    let i2, ilen, item, obj;
    for (i2 = start, ilen = start + count; i2 < ilen; ++i2) {
      obj = data[i2];
      item = {};
      item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i2);
      parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i2));
    }
    return parsed;
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    super.updateRangeFromParsed(range, scale, parsed, stack);
    const custom = parsed._custom;
    if (custom && scale === this._cachedMeta.vScale) {
      range.min = Math.min(range.min, custom.min);
      range.max = Math.max(range.max, custom.max);
    }
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const {
      iScale,
      vScale
    } = meta;
    const parsed = this.getParsed(index2);
    const custom = parsed._custom;
    const value = isFloatBar(custom) ? "[" + custom.start + ", " + custom.end + "]" : "" + vScale.getLabelForValue(parsed[vScale.axis]);
    return {
      label: "" + iScale.getLabelForValue(parsed[iScale.axis]),
      value
    };
  }
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
    const meta = this._cachedMeta;
    meta.stack = this.getDataset().stack;
  }
  update(mode) {
    const meta = this._cachedMeta;
    this.updateElements(meta.data, 0, meta.data.length, mode);
  }
  updateElements(bars, start, count, mode) {
    const reset = mode === "reset";
    const {
      index: index2,
      _cachedMeta: {
        vScale
      }
    } = this;
    const base = vScale.getBasePixel();
    const horizontal = vScale.isHorizontal();
    const ruler = this._getRuler();
    const {
      sharedOptions,
      includeOptions
    } = this._getSharedOptions(start, mode);
    for (let i2 = start; i2 < start + count; i2++) {
      const parsed = this.getParsed(i2);
      const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? {
        base,
        head: base
      } : this._calculateBarValuePixels(i2);
      const ipixels = this._calculateBarIndexPixels(i2, ruler);
      const stack = (parsed._stacks || {})[vScale.axis];
      const properties = {
        horizontal,
        base: vpixels.base,
        enableBorderRadius: !stack || isFloatBar(parsed._custom) || index2 === stack._top || index2 === stack._bottom,
        x: horizontal ? vpixels.head : ipixels.center,
        y: horizontal ? ipixels.center : vpixels.head,
        height: horizontal ? ipixels.size : Math.abs(vpixels.size),
        width: horizontal ? Math.abs(vpixels.size) : ipixels.size
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i2, bars[i2].active ? "active" : mode);
      }
      const options2 = properties.options || bars[i2].options;
      setBorderSkipped(properties, options2, stack, index2);
      setInflateAmount(properties, options2, ruler.ratio);
      this.updateElement(bars[i2], i2, properties, mode);
    }
  }
  _getStacks(last, dataIndex) {
    const {
      iScale
    } = this._cachedMeta;
    const metasets = iScale.getMatchingVisibleMetas(this._type).filter((meta) => meta.controller.options.grouped);
    const stacked = iScale.options.stacked;
    const stacks = [];
    const currentParsed = this._cachedMeta.controller.getParsed(dataIndex);
    const iScaleValue = currentParsed && currentParsed[iScale.axis];
    const skipNull = (meta) => {
      const parsed = meta._parsed.find((item) => item[iScale.axis] === iScaleValue);
      const val = parsed && parsed[meta.vScale.axis];
      if (isNullOrUndef(val) || isNaN(val)) {
        return true;
      }
    };
    for (const meta of metasets) {
      if (dataIndex !== void 0 && skipNull(meta)) {
        continue;
      }
      if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === void 0 && meta.stack === void 0) {
        stacks.push(meta.stack);
      }
      if (meta.index === last) {
        break;
      }
    }
    if (!stacks.length) {
      stacks.push(void 0);
    }
    return stacks;
  }
  _getStackCount(index2) {
    return this._getStacks(void 0, index2).length;
  }
  _getAxisCount() {
    return this._getAxis().length;
  }
  getFirstScaleIdForIndexAxis() {
    const scales2 = this.chart.scales;
    const indexScaleId = this.chart.options.indexAxis;
    return Object.keys(scales2).filter((key) => scales2[key].axis === indexScaleId).shift();
  }
  _getAxis() {
    const axis = {};
    const firstScaleAxisId = this.getFirstScaleIdForIndexAxis();
    for (const dataset of this.chart.data.datasets) {
      axis[valueOrDefault(this.chart.options.indexAxis === "x" ? dataset.xAxisID : dataset.yAxisID, firstScaleAxisId)] = true;
    }
    return Object.keys(axis);
  }
  _getStackIndex(datasetIndex, name, dataIndex) {
    const stacks = this._getStacks(datasetIndex, dataIndex);
    const index2 = name !== void 0 ? stacks.indexOf(name) : -1;
    return index2 === -1 ? stacks.length - 1 : index2;
  }
  _getRuler() {
    const opts = this.options;
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const pixels = [];
    let i2, ilen;
    for (i2 = 0, ilen = meta.data.length; i2 < ilen; ++i2) {
      pixels.push(iScale.getPixelForValue(this.getParsed(i2)[iScale.axis], i2));
    }
    const barThickness = opts.barThickness;
    const min = barThickness || computeMinSampleSize(meta);
    return {
      min,
      pixels,
      start: iScale._startPixel,
      end: iScale._endPixel,
      stackCount: this._getStackCount(),
      scale: iScale,
      grouped: opts.grouped,
      ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
    };
  }
  _calculateBarValuePixels(index2) {
    const {
      _cachedMeta: {
        vScale,
        _stacked,
        index: datasetIndex
      },
      options: {
        base: baseValue,
        minBarLength
      }
    } = this;
    const actualBase = baseValue || 0;
    const parsed = this.getParsed(index2);
    const custom = parsed._custom;
    const floating = isFloatBar(custom);
    let value = parsed[vScale.axis];
    let start = 0;
    let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
    let head, size;
    if (length !== value) {
      start = length - value;
      length = value;
    }
    if (floating) {
      value = custom.barStart;
      length = custom.barEnd - custom.barStart;
      if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
        start = 0;
      }
      start += value;
    }
    const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
    let base = vScale.getPixelForValue(startValue);
    if (this.chart.getDataVisibility(index2)) {
      head = vScale.getPixelForValue(start + length);
    } else {
      head = base;
    }
    size = head - base;
    if (Math.abs(size) < minBarLength) {
      size = barSign(size, vScale, actualBase) * minBarLength;
      if (value === actualBase) {
        base -= size / 2;
      }
      const startPixel = vScale.getPixelForDecimal(0);
      const endPixel = vScale.getPixelForDecimal(1);
      const min = Math.min(startPixel, endPixel);
      const max = Math.max(startPixel, endPixel);
      base = Math.max(Math.min(base, max), min);
      head = base + size;
      if (_stacked && !floating) {
        parsed._stacks[vScale.axis]._visualValues[datasetIndex] = vScale.getValueForPixel(head) - vScale.getValueForPixel(base);
      }
    }
    if (base === vScale.getPixelForValue(actualBase)) {
      const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2;
      base += halfGrid;
      size -= halfGrid;
    }
    return {
      size,
      base,
      head,
      center: head + size / 2
    };
  }
  _calculateBarIndexPixels(index2, ruler) {
    const scale = ruler.scale;
    const options2 = this.options;
    const skipNull = options2.skipNull;
    const maxBarThickness = valueOrDefault(options2.maxBarThickness, Infinity);
    let center, size;
    const axisCount = this._getAxisCount();
    if (ruler.grouped) {
      const stackCount = skipNull ? this._getStackCount(index2) : ruler.stackCount;
      const range = options2.barThickness === "flex" ? computeFlexCategoryTraits(index2, ruler, options2, stackCount * axisCount) : computeFitCategoryTraits(index2, ruler, options2, stackCount * axisCount);
      const axisID = this.chart.options.indexAxis === "x" ? this.getDataset().xAxisID : this.getDataset().yAxisID;
      const axisNumber = this._getAxis().indexOf(valueOrDefault(axisID, this.getFirstScaleIdForIndexAxis()));
      const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index2 : void 0) + axisNumber;
      center = range.start + range.chunk * stackIndex + range.chunk / 2;
      size = Math.min(maxBarThickness, range.chunk * range.ratio);
    } else {
      center = scale.getPixelForValue(this.getParsed(index2)[scale.axis], index2);
      size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
    }
    return {
      base: center - size / 2,
      head: center + size / 2,
      center,
      size
    };
  }
  draw() {
    const meta = this._cachedMeta;
    const vScale = meta.vScale;
    const rects = meta.data;
    const ilen = rects.length;
    let i2 = 0;
    for (; i2 < ilen; ++i2) {
      if (this.getParsed(i2)[vScale.axis] !== null && !rects[i2].hidden) {
        rects[i2].draw(this._ctx);
      }
    }
  }
}
class BubbleController extends DatasetController {
  static id = "bubble";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "borderWidth", "radius"]
      }
    }
  };
  static overrides = {
    scales: {
      x: {
        type: "linear"
      },
      y: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }
  parsePrimitiveData(meta, data, start, count) {
    const parsed = super.parsePrimitiveData(meta, data, start, count);
    for (let i2 = 0; i2 < parsed.length; i2++) {
      parsed[i2]._custom = this.resolveDataElementOptions(i2 + start).radius;
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const parsed = super.parseArrayData(meta, data, start, count);
    for (let i2 = 0; i2 < parsed.length; i2++) {
      const item = data[start + i2];
      parsed[i2]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i2 + start).radius);
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const parsed = super.parseObjectData(meta, data, start, count);
    for (let i2 = 0; i2 < parsed.length; i2++) {
      const item = data[start + i2];
      parsed[i2]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i2 + start).radius);
    }
    return parsed;
  }
  getMaxOverflow() {
    const data = this._cachedMeta.data;
    let max = 0;
    for (let i2 = data.length - 1; i2 >= 0; --i2) {
      max = Math.max(max, data[i2].size(this.resolveDataElementOptions(i2)) / 2);
    }
    return max > 0 && max;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const labels = this.chart.data.labels || [];
    const {
      xScale,
      yScale
    } = meta;
    const parsed = this.getParsed(index2);
    const x2 = xScale.getLabelForValue(parsed.x);
    const y2 = yScale.getLabelForValue(parsed.y);
    const r2 = parsed._custom;
    return {
      label: labels[index2] || "",
      value: "(" + x2 + ", " + y2 + (r2 ? ", " + r2 : "") + ")"
    };
  }
  update(mode) {
    const points = this._cachedMeta.data;
    this.updateElements(points, 0, points.length, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const {
      iScale,
      vScale
    } = this._cachedMeta;
    const {
      sharedOptions,
      includeOptions
    } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    for (let i2 = start; i2 < start + count; i2++) {
      const point = points[i2];
      const parsed = !reset && this.getParsed(i2);
      const properties = {};
      const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
      const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
      properties.skip = isNaN(iPixel) || isNaN(vPixel);
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i2, point.active ? "active" : mode);
        if (reset) {
          properties.options.radius = 0;
        }
      }
      this.updateElement(point, i2, properties, mode);
    }
  }
  resolveDataElementOptions(index2, mode) {
    const parsed = this.getParsed(index2);
    let values = super.resolveDataElementOptions(index2, mode);
    if (values.$shared) {
      values = Object.assign({}, values, {
        $shared: false
      });
    }
    const radius = values.radius;
    if (mode !== "active") {
      values.radius = 0;
    }
    values.radius += valueOrDefault(parsed && parsed._custom, radius);
    return values;
  }
}
function getRatioAndOffset(rotation, circumference, cutout) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let offsetY = 0;
  if (circumference < TAU) {
    const startAngle = rotation;
    const endAngle = startAngle + circumference;
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const calcMax = (angle, a2, b2) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a2, a2 * cutout, b2, b2 * cutout);
    const calcMin = (angle, a2, b2) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a2, a2 * cutout, b2, b2 * cutout);
    const maxX = calcMax(0, startX, endX);
    const maxY = calcMax(HALF_PI, startY, endY);
    const minX = calcMin(PI, startX, endX);
    const minY = calcMin(PI + HALF_PI, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return {
    ratioX,
    ratioY,
    offsetX,
    offsetY
  };
}
class DoughnutController extends DatasetController {
  static id = "doughnut";
  static defaults = {
    datasetElementType: false,
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: false
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"]
      }
    },
    cutout: "50%",
    rotation: 0,
    circumference: 360,
    radius: "100%",
    spacing: 0,
    spacingMode: "angular",
    indexAxis: "r"
  };
  static descriptors = {
    _scriptable: (name) => name !== "spacing" && name !== "spacingMode",
    _indexable: (name) => name !== "spacing" && name !== "spacingMode" && !name.startsWith("borderDash") && !name.startsWith("hoverBorderDash")
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(chart) {
            const data = chart.data;
            const {
              labels: {
                pointStyle,
                textAlign,
                color: color2,
                useBorderRadius,
                borderRadius
              }
            } = chart.legend.options;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i2) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i2);
                return {
                  text: label,
                  fillStyle: style.backgroundColor,
                  fontColor: color2,
                  hidden: !chart.getDataVisibility(i2),
                  lineDash: style.borderDash,
                  lineDashOffset: style.borderDashOffset,
                  lineJoin: style.borderJoinStyle,
                  lineWidth: style.borderWidth,
                  strokeStyle: style.borderColor,
                  textAlign,
                  pointStyle,
                  borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
                  index: i2
                };
              });
            }
            return [];
          }
        },
        onClick(e2, legendItem, legend) {
          legend.chart.toggleDataVisibility(legendItem.index);
          legend.chart.update();
        }
      }
    }
  };
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this.enableOptionSharing = true;
    this.innerRadius = void 0;
    this.outerRadius = void 0;
    this.offsetX = void 0;
    this.offsetY = void 0;
  }
  linkScales() {
  }
  parse(start, count) {
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    if (this._parsing === false) {
      meta._parsed = data;
    } else {
      let getter = (i3) => +data[i3];
      if (isObject(data[start])) {
        const {
          key = "value"
        } = this._parsing;
        getter = (i3) => +resolveObjectKey(data[i3], key);
      }
      let i2, ilen;
      for (i2 = start, ilen = start + count; i2 < ilen; ++i2) {
        meta._parsed[i2] = getter(i2);
      }
    }
  }
  _getRotation() {
    return toRadians(this.options.rotation - 90);
  }
  _getCircumference() {
    return toRadians(this.options.circumference);
  }
  _getRotationExtents() {
    let min = TAU;
    let max = -TAU;
    for (let i2 = 0; i2 < this.chart.data.datasets.length; ++i2) {
      if (this.chart.isDatasetVisible(i2) && this.chart.getDatasetMeta(i2).type === this._type) {
        const controller = this.chart.getDatasetMeta(i2).controller;
        const rotation = controller._getRotation();
        const circumference = controller._getCircumference();
        min = Math.min(min, rotation);
        max = Math.max(max, rotation + circumference);
      }
    }
    return {
      rotation: min,
      circumference: max - min
    };
  }
  update(mode) {
    const chart = this.chart;
    const {
      chartArea
    } = chart;
    const meta = this._cachedMeta;
    const arcs = meta.data;
    const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
    const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
    const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
    const chartWeight = this._getRingWeight(this.index);
    const {
      circumference,
      rotation
    } = this._getRotationExtents();
    const {
      ratioX,
      ratioY,
      offsetX,
      offsetY
    } = getRatioAndOffset(rotation, circumference, cutout);
    const maxWidth = (chartArea.width - spacing) / ratioX;
    const maxHeight = (chartArea.height - spacing) / ratioY;
    const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
    const outerRadius = toDimension(this.options.radius, maxRadius);
    const innerRadius = Math.max(outerRadius * cutout, 0);
    const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
    this.offsetX = offsetX * outerRadius;
    this.offsetY = offsetY * outerRadius;
    meta.total = this.calculateTotal();
    this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
    this.updateElements(arcs, 0, arcs.length, mode);
  }
  _circumference(i2, reset) {
    const opts = this.options;
    const meta = this._cachedMeta;
    const circumference = this._getCircumference();
    if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i2) || meta._parsed[i2] === null || meta.data[i2].hidden) {
      return 0;
    }
    return this.calculateCircumference(meta._parsed[i2] * circumference / TAU);
  }
  updateElements(arcs, start, count, mode) {
    const reset = mode === "reset";
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const animateScale = reset && animationOpts.animateScale;
    const innerRadius = animateScale ? 0 : this.innerRadius;
    const outerRadius = animateScale ? 0 : this.outerRadius;
    const {
      sharedOptions,
      includeOptions
    } = this._getSharedOptions(start, mode);
    let startAngle = this._getRotation();
    let i2;
    for (i2 = 0; i2 < start; ++i2) {
      startAngle += this._circumference(i2, reset);
    }
    for (i2 = start; i2 < start + count; ++i2) {
      const circumference = this._circumference(i2, reset);
      const arc = arcs[i2];
      const properties = {
        x: centerX + this.offsetX,
        y: centerY + this.offsetY,
        startAngle,
        endAngle: startAngle + circumference,
        circumference,
        outerRadius,
        innerRadius
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i2, arc.active ? "active" : mode);
      }
      startAngle += circumference;
      this.updateElement(arc, i2, properties, mode);
    }
  }
  calculateTotal() {
    const meta = this._cachedMeta;
    const metaData = meta.data;
    let total = 0;
    let i2;
    for (i2 = 0; i2 < metaData.length; i2++) {
      const value = meta._parsed[i2];
      if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i2) && !metaData[i2].hidden) {
        total += Math.abs(value);
      }
    }
    return total;
  }
  calculateCircumference(value) {
    const total = this._cachedMeta.total;
    if (total > 0 && !isNaN(value)) {
      return TAU * (Math.abs(value) / total);
    }
    return 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index2], chart.options.locale);
    return {
      label: labels[index2] || "",
      value
    };
  }
  getMaxBorderWidth(arcs) {
    let max = 0;
    const chart = this.chart;
    let i2, ilen, meta, controller, options2;
    if (!arcs) {
      for (i2 = 0, ilen = chart.data.datasets.length; i2 < ilen; ++i2) {
        if (chart.isDatasetVisible(i2)) {
          meta = chart.getDatasetMeta(i2);
          arcs = meta.data;
          controller = meta.controller;
          break;
        }
      }
    }
    if (!arcs) {
      return 0;
    }
    for (i2 = 0, ilen = arcs.length; i2 < ilen; ++i2) {
      options2 = controller.resolveDataElementOptions(i2);
      if (options2.borderAlign !== "inner") {
        max = Math.max(max, options2.borderWidth || 0, options2.hoverBorderWidth || 0);
      }
    }
    return max;
  }
  getMaxOffset(arcs) {
    let max = 0;
    for (let i2 = 0, ilen = arcs.length; i2 < ilen; ++i2) {
      const options2 = this.resolveDataElementOptions(i2);
      max = Math.max(max, options2.offset || 0, options2.hoverOffset || 0);
    }
    return max;
  }
  _getRingWeightOffset(datasetIndex) {
    let ringWeightOffset = 0;
    for (let i2 = 0; i2 < datasetIndex; ++i2) {
      if (this.chart.isDatasetVisible(i2)) {
        ringWeightOffset += this._getRingWeight(i2);
      }
    }
    return ringWeightOffset;
  }
  _getRingWeight(datasetIndex) {
    return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
class LineController extends DatasetController {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: true,
    spanGaps: false
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category"
      },
      _value_: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }
  update(mode) {
    const meta = this._cachedMeta;
    const {
      dataset: line,
      data: points = [],
      _dataset
    } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let {
      start,
      count
    } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    line._chart = this.chart;
    line._datasetIndex = this.index;
    line._decimated = !!_dataset._decimated;
    line.points = points;
    const options2 = this.resolveDatasetElementOptions(mode);
    if (!this.options.showLine) {
      options2.borderWidth = 0;
    }
    options2.segment = this.options.segment;
    this.updateElement(line, void 0, {
      animated: !animationsDisabled,
      options: options2
    }, mode);
    this.updateElements(points, start, count, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const {
      iScale,
      vScale,
      _stacked,
      _dataset
    } = this._cachedMeta;
    const {
      sharedOptions,
      includeOptions
    } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const {
      spanGaps,
      segment
    } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    const end = start + count;
    const pointsCount = points.length;
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i2 = 0; i2 < pointsCount; ++i2) {
      const point = points[i2];
      const properties = directUpdate ? point : {};
      if (i2 < start || i2 >= end) {
        properties.skip = true;
        continue;
      }
      const parsed = this.getParsed(i2);
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i2);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i2);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i2 > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i2];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i2, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i2, properties, mode);
      }
      prevParsed = parsed;
    }
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    const data = meta.data || [];
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
  draw() {
    const meta = this._cachedMeta;
    meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
    super.draw();
  }
}
class PolarAreaController extends DatasetController {
  static id = "polarArea";
  static defaults = {
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: true
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"]
      }
    },
    indexAxis: "r",
    startAngle: 0,
    spacing: 0,
    spacingMode: "proportional"
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const {
                labels: {
                  pointStyle,
                  color: color2
                }
              } = chart.legend.options;
              return data.labels.map((label, i2) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i2);
                return {
                  text: label,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  fontColor: color2,
                  lineWidth: style.borderWidth,
                  pointStyle,
                  hidden: !chart.getDataVisibility(i2),
                  index: i2
                };
              });
            }
            return [];
          }
        },
        onClick(e2, legendItem, legend) {
          legend.chart.toggleDataVisibility(legendItem.index);
          legend.chart.update();
        }
      }
    },
    scales: {
      r: {
        type: "radialLinear",
        angleLines: {
          display: false
        },
        beginAtZero: true,
        grid: {
          circular: true
        },
        pointLabels: {
          display: false
        },
        startAngle: 0
      }
    }
  };
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this.innerRadius = void 0;
    this.outerRadius = void 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index2].r, chart.options.locale);
    return {
      label: labels[index2] || "",
      value
    };
  }
  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }
  update(mode) {
    const arcs = this._cachedMeta.data;
    this._updateRadius();
    this.updateElements(arcs, 0, arcs.length, mode);
  }
  getMinMax() {
    const meta = this._cachedMeta;
    const range = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    meta.data.forEach((element, index2) => {
      const parsed = this.getParsed(index2).r;
      if (!isNaN(parsed) && this.chart.getDataVisibility(index2)) {
        if (parsed < range.min) {
          range.min = parsed;
        }
        if (parsed > range.max) {
          range.max = parsed;
        }
      }
    });
    return range;
  }
  _updateRadius() {
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
    const outerRadius = Math.max(minSize / 2, 0);
    const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
    const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
    this.outerRadius = outerRadius - radiusLength * this.index;
    this.innerRadius = this.outerRadius - radiusLength;
  }
  updateElements(arcs, start, count, mode) {
    const reset = mode === "reset";
    const chart = this.chart;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const scale = this._cachedMeta.rScale;
    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
    let angle = datasetStartAngle;
    let i2;
    const defaultAngle = 360 / this.countVisibleElements();
    for (i2 = 0; i2 < start; ++i2) {
      angle += this._computeAngle(i2, mode, defaultAngle);
    }
    for (i2 = start; i2 < start + count; i2++) {
      const arc = arcs[i2];
      let startAngle = angle;
      let endAngle = angle + this._computeAngle(i2, mode, defaultAngle);
      let outerRadius = chart.getDataVisibility(i2) ? scale.getDistanceFromCenterForValue(this.getParsed(i2).r) : 0;
      angle = endAngle;
      if (reset) {
        if (animationOpts.animateScale) {
          outerRadius = 0;
        }
        if (animationOpts.animateRotate) {
          startAngle = endAngle = datasetStartAngle;
        }
      }
      const properties = {
        x: centerX,
        y: centerY,
        innerRadius: 0,
        outerRadius,
        startAngle,
        endAngle,
        options: this.resolveDataElementOptions(i2, arc.active ? "active" : mode)
      };
      if (properties.options.spacing === 0) {
        properties.options.spacing = this.options.spacing;
      }
      if (properties.options.spacingMode === "angular") {
        properties.options.spacingMode = this.options.spacingMode;
      }
      this.updateElement(arc, i2, properties, mode);
    }
  }
  countVisibleElements() {
    const meta = this._cachedMeta;
    let count = 0;
    meta.data.forEach((element, index2) => {
      if (!isNaN(this.getParsed(index2).r) && this.chart.getDataVisibility(index2)) {
        count++;
      }
    });
    return count;
  }
  _computeAngle(index2, mode, defaultAngle) {
    return this.chart.getDataVisibility(index2) ? toRadians(this.resolveDataElementOptions(index2, mode).angle || defaultAngle) : 0;
  }
}
class PieController extends DoughnutController {
  static id = "pie";
  static defaults = {
    cutout: 0,
    rotation: 0,
    circumference: 360,
    radius: "100%"
  };
}
class RadarController extends DatasetController {
  static id = "radar";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    indexAxis: "r",
    showLine: true,
    elements: {
      line: {
        fill: "start"
      }
    }
  };
  static overrides = {
    aspectRatio: 1,
    scales: {
      r: {
        type: "radialLinear"
      }
    }
  };
  getLabelAndValue(index2) {
    const vScale = this._cachedMeta.vScale;
    const parsed = this.getParsed(index2);
    return {
      label: vScale.getLabels()[index2],
      value: "" + vScale.getLabelForValue(parsed[vScale.axis])
    };
  }
  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }
  update(mode) {
    const meta = this._cachedMeta;
    const line = meta.dataset;
    const points = meta.data || [];
    const labels = meta.iScale.getLabels();
    line.points = points;
    if (mode !== "resize") {
      const options2 = this.resolveDatasetElementOptions(mode);
      if (!this.options.showLine) {
        options2.borderWidth = 0;
      }
      const properties = {
        _loop: true,
        _fullLoop: labels.length === points.length,
        options: options2
      };
      this.updateElement(line, void 0, properties, mode);
    }
    this.updateElements(points, 0, points.length, mode);
  }
  updateElements(points, start, count, mode) {
    const scale = this._cachedMeta.rScale;
    const reset = mode === "reset";
    for (let i2 = start; i2 < start + count; i2++) {
      const point = points[i2];
      const options2 = this.resolveDataElementOptions(i2, point.active ? "active" : mode);
      const pointPosition = scale.getPointPositionForValue(i2, this.getParsed(i2).r);
      const x2 = reset ? scale.xCenter : pointPosition.x;
      const y2 = reset ? scale.yCenter : pointPosition.y;
      const properties = {
        x: x2,
        y: y2,
        angle: pointPosition.angle,
        skip: isNaN(x2) || isNaN(y2),
        options: options2
      };
      this.updateElement(point, i2, properties, mode);
    }
  }
}
class ScatterController extends DatasetController {
  static id = "scatter";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    showLine: false,
    fill: false
  };
  static overrides = {
    interaction: {
      mode: "point"
    },
    scales: {
      x: {
        type: "linear"
      },
      y: {
        type: "linear"
      }
    }
  };
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const labels = this.chart.data.labels || [];
    const {
      xScale,
      yScale
    } = meta;
    const parsed = this.getParsed(index2);
    const x2 = xScale.getLabelForValue(parsed.x);
    const y2 = yScale.getLabelForValue(parsed.y);
    return {
      label: labels[index2] || "",
      value: "(" + x2 + ", " + y2 + ")"
    };
  }
  update(mode) {
    const meta = this._cachedMeta;
    const {
      data: points = []
    } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let {
      start,
      count
    } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    if (this.options.showLine) {
      if (!this.datasetElementType) {
        this.addElements();
      }
      const {
        dataset: line,
        _dataset
      } = meta;
      line._chart = this.chart;
      line._datasetIndex = this.index;
      line._decimated = !!_dataset._decimated;
      line.points = points;
      const options2 = this.resolveDatasetElementOptions(mode);
      options2.segment = this.options.segment;
      this.updateElement(line, void 0, {
        animated: !animationsDisabled,
        options: options2
      }, mode);
    } else if (this.datasetElementType) {
      delete meta.dataset;
      this.datasetElementType = false;
    }
    this.updateElements(points, start, count, mode);
  }
  addElements() {
    const {
      showLine
    } = this.options;
    if (!this.datasetElementType && showLine) {
      this.datasetElementType = this.chart.registry.getElement("line");
    }
    super.addElements();
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const {
      iScale,
      vScale,
      _stacked,
      _dataset
    } = this._cachedMeta;
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const {
      spanGaps,
      segment
    } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i2 = start; i2 < start + count; ++i2) {
      const point = points[i2];
      const parsed = this.getParsed(i2);
      const properties = directUpdate ? point : {};
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i2);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i2);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i2 > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i2];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i2, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i2, properties, mode);
      }
      prevParsed = parsed;
    }
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const data = meta.data || [];
    if (!this.options.showLine) {
      let max = 0;
      for (let i2 = data.length - 1; i2 >= 0; --i2) {
        max = Math.max(max, data[i2].size(this.resolveDataElementOptions(i2)) / 2);
      }
      return max > 0 && max;
    }
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
}
var controllers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController
});
function abstract() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class DateAdapterBase {
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(members) {
    Object.assign(DateAdapterBase.prototype, members);
  }
  options;
  constructor(options2) {
    this.options = options2 || {};
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return abstract();
  }
  parse() {
    return abstract();
  }
  format() {
    return abstract();
  }
  add() {
    return abstract();
  }
  diff() {
    return abstract();
  }
  startOf() {
    return abstract();
  }
  endOf() {
    return abstract();
  }
}
var adapters = {
  _date: DateAdapterBase
};
function binarySearch(metaset, axis, value, intersect) {
  const {
    controller,
    data,
    _sorted
  } = metaset;
  const iScale = controller._cachedMeta.iScale;
  const spanGaps = metaset.dataset ? metaset.dataset.options ? metaset.dataset.options.spanGaps : null : null;
  if (iScale && axis === iScale.axis && axis !== "r" && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      const result = lookupMethod(data, axis, value);
      if (spanGaps) {
        const {
          vScale
        } = controller._cachedMeta;
        const {
          _parsed
        } = metaset;
        const distanceToDefinedLo = _parsed.slice(0, result.lo + 1).reverse().findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        result.lo -= Math.max(0, distanceToDefinedLo);
        const distanceToDefinedHi = _parsed.slice(result.hi).findIndex((point) => !isNullOrUndef(point[vScale.axis]));
        result.hi += Math.max(0, distanceToDefinedHi);
      }
      return result;
    } else if (controller._sharedOptions) {
      const el = data[0];
      const range = typeof el.getRange === "function" && el.getRange(axis);
      if (range) {
        const start = lookupMethod(data, axis, value - range);
        const end = lookupMethod(data, axis, value + range);
        return {
          lo: start.lo,
          hi: end.hi
        };
      }
    }
  }
  return {
    lo: 0,
    hi: data.length - 1
  };
}
function evaluateInteractionItems(chart, axis, position, handler2, intersect) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  const value = position[axis];
  for (let i2 = 0, ilen = metasets.length; i2 < ilen; ++i2) {
    const {
      index: index2,
      data
    } = metasets[i2];
    const {
      lo,
      hi
    } = binarySearch(metasets[i2], axis, value, intersect);
    for (let j2 = lo; j2 <= hi; ++j2) {
      const element = data[j2];
      if (!element.skip) {
        handler2(element, index2, j2);
      }
    }
  }
}
function getDistanceMetricForAxis(axis) {
  const useX = axis.indexOf("x") !== -1;
  const useY = axis.indexOf("y") !== -1;
  return function(pt1, pt2) {
    const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}
function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
  const items = [];
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return items;
  }
  const evaluationFunc = function(element, datasetIndex, index2) {
    if (!includeInvisible && !_isPointInArea(element, chart.chartArea, 0)) {
      return;
    }
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
    }
  };
  evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
  return items;
}
function getNearestRadialItems(chart, position, axis, useFinalPosition) {
  let items = [];
  function evaluationFunc(element, datasetIndex, index2) {
    const {
      startAngle,
      endAngle
    } = element.getProps(["startAngle", "endAngle"], useFinalPosition);
    const {
      angle
    } = getAngleFromPoint(element, {
      x: position.x,
      y: position.y
    });
    if (_angleBetween(angle, startAngle, endAngle)) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
    }
  }
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  let items = [];
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;
  function evaluationFunc(element, datasetIndex, index2) {
    const inRange2 = element.inRange(position.x, position.y, useFinalPosition);
    if (intersect && !inRange2) {
      return;
    }
    const center = element.getCenterPoint(useFinalPosition);
    const pointInArea = !!includeInvisible || chart.isPointInArea(center);
    if (!pointInArea && !inRange2) {
      return;
    }
    const distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [{
        element,
        datasetIndex,
        index: index2
      }];
      minDistance = distance;
    } else if (distance === minDistance) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
    }
  }
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return [];
  }
  return axis === "r" && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}
function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
  const items = [];
  const rangeMethod = axis === "x" ? "inXRange" : "inYRange";
  let intersectsItem = false;
  evaluateInteractionItems(chart, axis, position, (element, datasetIndex, index2) => {
    if (element[rangeMethod] && element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
      intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
    }
  });
  if (intersect && !intersectsItem) {
    return [];
  }
  return items;
}
var Interaction = {
  modes: {
    index(chart, e2, options2, useFinalPosition) {
      const position = getRelativePosition(e2, chart);
      const axis = options2.axis || "x";
      const includeInvisible = options2.includeInvisible || false;
      const items = options2.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      const elements2 = [];
      if (!items.length) {
        return [];
      }
      chart.getSortedVisibleDatasetMetas().forEach((meta) => {
        const index2 = items[0].index;
        const element = meta.data[index2];
        if (element && !element.skip) {
          elements2.push({
            element,
            datasetIndex: meta.index,
            index: index2
          });
        }
      });
      return elements2;
    },
    dataset(chart, e2, options2, useFinalPosition) {
      const position = getRelativePosition(e2, chart);
      const axis = options2.axis || "xy";
      const includeInvisible = options2.includeInvisible || false;
      let items = options2.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      if (items.length > 0) {
        const datasetIndex = items[0].datasetIndex;
        const data = chart.getDatasetMeta(datasetIndex).data;
        items = [];
        for (let i2 = 0; i2 < data.length; ++i2) {
          items.push({
            element: data[i2],
            datasetIndex,
            index: i2
          });
        }
      }
      return items;
    },
    point(chart, e2, options2, useFinalPosition) {
      const position = getRelativePosition(e2, chart);
      const axis = options2.axis || "xy";
      const includeInvisible = options2.includeInvisible || false;
      return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
    },
    nearest(chart, e2, options2, useFinalPosition) {
      const position = getRelativePosition(e2, chart);
      const axis = options2.axis || "xy";
      const includeInvisible = options2.includeInvisible || false;
      return getNearestItems(chart, position, axis, options2.intersect, useFinalPosition, includeInvisible);
    },
    x(chart, e2, options2, useFinalPosition) {
      const position = getRelativePosition(e2, chart);
      return getAxisItems(chart, position, "x", options2.intersect, useFinalPosition);
    },
    y(chart, e2, options2, useFinalPosition) {
      const position = getRelativePosition(e2, chart);
      return getAxisItems(chart, position, "y", options2.intersect, useFinalPosition);
    }
  }
};
const STATIC_POSITIONS = ["left", "top", "right", "bottom"];
function filterByPosition(array, position) {
  return array.filter((v2) => v2.pos === position);
}
function filterDynamicPositionByAxis(array, axis) {
  return array.filter((v2) => STATIC_POSITIONS.indexOf(v2.pos) === -1 && v2.box.axis === axis);
}
function sortByWeight(array, reverse) {
  return array.sort((a2, b2) => {
    const v0 = reverse ? b2 : a2;
    const v1 = reverse ? a2 : b2;
    return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
  });
}
function wrapBoxes(boxes) {
  const layoutBoxes = [];
  let i2, ilen, box, pos, stack, stackWeight;
  for (i2 = 0, ilen = (boxes || []).length; i2 < ilen; ++i2) {
    box = boxes[i2];
    ({
      position: pos,
      options: {
        stack,
        stackWeight = 1
      }
    } = box);
    layoutBoxes.push({
      index: i2,
      box,
      pos,
      horizontal: box.isHorizontal(),
      weight: box.weight,
      stack: stack && pos + stack,
      stackWeight
    });
  }
  return layoutBoxes;
}
function buildStacks(layouts2) {
  const stacks = {};
  for (const wrap of layouts2) {
    const {
      stack,
      pos,
      stackWeight
    } = wrap;
    if (!stack || !STATIC_POSITIONS.includes(pos)) {
      continue;
    }
    const _stack = stacks[stack] || (stacks[stack] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    _stack.count++;
    _stack.weight += stackWeight;
  }
  return stacks;
}
function setLayoutDims(layouts2, params) {
  const stacks = buildStacks(layouts2);
  const {
    vBoxMaxWidth,
    hBoxMaxHeight
  } = params;
  let i2, ilen, layout;
  for (i2 = 0, ilen = layouts2.length; i2 < ilen; ++i2) {
    layout = layouts2[i2];
    const {
      fullSize
    } = layout.box;
    const stack = stacks[layout.stack];
    const factor = stack && layout.stackWeight / stack.weight;
    if (layout.horizontal) {
      layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
      layout.height = hBoxMaxHeight;
    } else {
      layout.width = vBoxMaxWidth;
      layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
    }
  }
  return stacks;
}
function buildLayoutBoxes(boxes) {
  const layoutBoxes = wrapBoxes(boxes);
  const fullSize = sortByWeight(layoutBoxes.filter((wrap) => wrap.box.fullSize), true);
  const left = sortByWeight(filterByPosition(layoutBoxes, "left"), true);
  const right = sortByWeight(filterByPosition(layoutBoxes, "right"));
  const top = sortByWeight(filterByPosition(layoutBoxes, "top"), true);
  const bottom = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
  const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
  const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
  return {
    fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, "chartArea"),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom).concat(centerHorizontal)
  };
}
function getCombinedMax(maxPadding, chartArea, a2, b2) {
  return Math.max(maxPadding[a2], chartArea[a2]) + Math.max(maxPadding[b2], chartArea[b2]);
}
function updateMaxPadding(maxPadding, boxPadding) {
  maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
  maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
  maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
  maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
function updateDims(chartArea, params, layout, stacks) {
  const {
    pos,
    box
  } = layout;
  const maxPadding = chartArea.maxPadding;
  if (!isObject(pos)) {
    if (layout.size) {
      chartArea[pos] -= layout.size;
    }
    const stack = stacks[layout.stack] || {
      size: 0,
      count: 1
    };
    stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
    layout.size = stack.size / stack.count;
    chartArea[pos] += layout.size;
  }
  if (box.getPadding) {
    updateMaxPadding(maxPadding, box.getPadding());
  }
  const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, "left", "right"));
  const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, "top", "bottom"));
  const widthChanged = newWidth !== chartArea.w;
  const heightChanged = newHeight !== chartArea.h;
  chartArea.w = newWidth;
  chartArea.h = newHeight;
  return layout.horizontal ? {
    same: widthChanged,
    other: heightChanged
  } : {
    same: heightChanged,
    other: widthChanged
  };
}
function handleMaxPadding(chartArea) {
  const maxPadding = chartArea.maxPadding;
  function updatePos(pos) {
    const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
    chartArea[pos] += change;
    return change;
  }
  chartArea.y += updatePos("top");
  chartArea.x += updatePos("left");
  updatePos("right");
  updatePos("bottom");
}
function getMargins(horizontal, chartArea) {
  const maxPadding = chartArea.maxPadding;
  function marginForPositions(positions2) {
    const margin = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    positions2.forEach((pos) => {
      margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
    });
    return margin;
  }
  return horizontal ? marginForPositions(["left", "right"]) : marginForPositions(["top", "bottom"]);
}
function fitBoxes(boxes, chartArea, params, stacks) {
  const refitBoxes = [];
  let i2, ilen, layout, box, refit, changed;
  for (i2 = 0, ilen = boxes.length, refit = 0; i2 < ilen; ++i2) {
    layout = boxes[i2];
    box = layout.box;
    box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
    const {
      same,
      other
    } = updateDims(chartArea, params, layout, stacks);
    refit |= same && refitBoxes.length;
    changed = changed || other;
    if (!box.fullSize) {
      refitBoxes.push(layout);
    }
  }
  return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
function setBoxDims(box, left, top, width, height) {
  box.top = top;
  box.left = left;
  box.right = left + width;
  box.bottom = top + height;
  box.width = width;
  box.height = height;
}
function placeBoxes(boxes, chartArea, params, stacks) {
  const userPadding = params.padding;
  let {
    x: x2,
    y: y2
  } = chartArea;
  for (const layout of boxes) {
    const box = layout.box;
    const stack = stacks[layout.stack] || {
      placed: 0,
      weight: 1
    };
    const weight = layout.stackWeight / stack.weight || 1;
    if (layout.horizontal) {
      const width = chartArea.w * weight;
      const height = stack.size || box.height;
      if (defined(stack.start)) {
        y2 = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, userPadding.left, y2, params.outerWidth - userPadding.right - userPadding.left, height);
      } else {
        setBoxDims(box, chartArea.left + stack.placed, y2, width, height);
      }
      stack.start = y2;
      stack.placed += width;
      y2 = box.bottom;
    } else {
      const height = chartArea.h * weight;
      const width = stack.size || box.width;
      if (defined(stack.start)) {
        x2 = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, x2, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
      } else {
        setBoxDims(box, x2, chartArea.top + stack.placed, width, height);
      }
      stack.start = x2;
      stack.placed += height;
      x2 = box.right;
    }
  }
  chartArea.x = x2;
  chartArea.y = y2;
}
var layouts = {
  addBox(chart, item) {
    if (!chart.boxes) {
      chart.boxes = [];
    }
    item.fullSize = item.fullSize || false;
    item.position = item.position || "top";
    item.weight = item.weight || 0;
    item._layers = item._layers || function() {
      return [{
        z: 0,
        draw(chartArea) {
          item.draw(chartArea);
        }
      }];
    };
    chart.boxes.push(item);
  },
  removeBox(chart, layoutItem) {
    const index2 = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
    if (index2 !== -1) {
      chart.boxes.splice(index2, 1);
    }
  },
  configure(chart, item, options2) {
    item.fullSize = options2.fullSize;
    item.position = options2.position;
    item.weight = options2.weight;
  },
  update(chart, width, height, minPadding) {
    if (!chart) {
      return;
    }
    const padding = toPadding(chart.options.layout.padding);
    const availableWidth = Math.max(width - padding.width, 0);
    const availableHeight = Math.max(height - padding.height, 0);
    const boxes = buildLayoutBoxes(chart.boxes);
    const verticalBoxes = boxes.vertical;
    const horizontalBoxes = boxes.horizontal;
    each(chart.boxes, (box) => {
      if (typeof box.beforeLayout === "function") {
        box.beforeLayout();
      }
    });
    const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
    const params = Object.freeze({
      outerWidth: width,
      outerHeight: height,
      padding,
      availableWidth,
      availableHeight,
      vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
      hBoxMaxHeight: availableHeight / 2
    });
    const maxPadding = Object.assign({}, padding);
    updateMaxPadding(maxPadding, toPadding(minPadding));
    const chartArea = Object.assign({
      maxPadding,
      w: availableWidth,
      h: availableHeight,
      x: padding.left,
      y: padding.top
    }, padding);
    const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
    fitBoxes(boxes.fullSize, chartArea, params, stacks);
    fitBoxes(verticalBoxes, chartArea, params, stacks);
    if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
      fitBoxes(verticalBoxes, chartArea, params, stacks);
    }
    handleMaxPadding(chartArea);
    placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
    chartArea.x += chartArea.w;
    chartArea.y += chartArea.h;
    placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
    chart.chartArea = {
      left: chartArea.left,
      top: chartArea.top,
      right: chartArea.left + chartArea.w,
      bottom: chartArea.top + chartArea.h,
      height: chartArea.h,
      width: chartArea.w
    };
    each(boxes.chartArea, (layout) => {
      const box = layout.box;
      Object.assign(box, chart.chartArea);
      box.update(chartArea.w, chartArea.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class BasePlatform {
  acquireContext(canvas, aspectRatio) {
  }
  releaseContext(context) {
    return false;
  }
  addEventListener(chart, type, listener) {
  }
  removeEventListener(chart, type, listener) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(element, width, height, aspectRatio) {
    width = Math.max(0, width || element.width);
    height = height || element.height;
    return {
      width,
      height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
    };
  }
  isAttached(canvas) {
    return true;
  }
  updateConfig(config2) {
  }
}
class BasicPlatform extends BasePlatform {
  acquireContext(item) {
    return item && item.getContext && item.getContext("2d") || null;
  }
  updateConfig(config2) {
    config2.options.animation = false;
  }
}
const EXPANDO_KEY = "$chartjs";
const EVENT_TYPES = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
};
const isNullOrEmpty = (value) => value === null || value === "";
function initCanvas(canvas, aspectRatio) {
  const style = canvas.style;
  const renderHeight = canvas.getAttribute("height");
  const renderWidth = canvas.getAttribute("width");
  canvas[EXPANDO_KEY] = {
    initial: {
      height: renderHeight,
      width: renderWidth,
      style: {
        display: style.display,
        height: style.height,
        width: style.width
      }
    }
  };
  style.display = style.display || "block";
  style.boxSizing = style.boxSizing || "border-box";
  if (isNullOrEmpty(renderWidth)) {
    const displayWidth = readUsedSize(canvas, "width");
    if (displayWidth !== void 0) {
      canvas.width = displayWidth;
    }
  }
  if (isNullOrEmpty(renderHeight)) {
    if (canvas.style.height === "") {
      canvas.height = canvas.width / (aspectRatio || 2);
    } else {
      const displayHeight = readUsedSize(canvas, "height");
      if (displayHeight !== void 0) {
        canvas.height = displayHeight;
      }
    }
  }
  return canvas;
}
const eventListenerOptions = supportsEventListenerOptions ? {
  passive: true
} : false;
function addListener(node, type, listener) {
  if (node) {
    node.addEventListener(type, listener, eventListenerOptions);
  }
}
function removeListener(chart, type, listener) {
  if (chart && chart.canvas) {
    chart.canvas.removeEventListener(type, listener, eventListenerOptions);
  }
}
function fromNativeEvent(event, chart) {
  const type = EVENT_TYPES[event.type] || event.type;
  const {
    x: x2,
    y: y2
  } = getRelativePosition(event, chart);
  return {
    type,
    chart,
    native: event,
    x: x2 !== void 0 ? x2 : null,
    y: y2 !== void 0 ? y2 : null
  };
}
function nodeListContains(nodeList, canvas) {
  for (const node of nodeList) {
    if (node === canvas || node.contains(canvas)) {
      return true;
    }
  }
}
function createAttachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.addedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
function createDetachObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.removedNodes, canvas);
      trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
const drpListeningCharts = /* @__PURE__ */ new Map();
let oldDevicePixelRatio = 0;
function onWindowResize() {
  const dpr = window.devicePixelRatio;
  if (dpr === oldDevicePixelRatio) {
    return;
  }
  oldDevicePixelRatio = dpr;
  drpListeningCharts.forEach((resize, chart) => {
    if (chart.currentDevicePixelRatio !== dpr) {
      resize();
    }
  });
}
function listenDevicePixelRatioChanges(chart, resize) {
  if (!drpListeningCharts.size) {
    window.addEventListener("resize", onWindowResize);
  }
  drpListeningCharts.set(chart, resize);
}
function unlistenDevicePixelRatioChanges(chart) {
  drpListeningCharts.delete(chart);
  if (!drpListeningCharts.size) {
    window.removeEventListener("resize", onWindowResize);
  }
}
function createResizeObserver(chart, type, listener) {
  const canvas = chart.canvas;
  const container = canvas && _getParentNode(canvas);
  if (!container) {
    return;
  }
  const resize = throttled((width, height) => {
    const w2 = container.clientWidth;
    listener(width, height);
    if (w2 < container.clientWidth) {
      listener();
    }
  }, window);
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    if (width === 0 && height === 0) {
      return;
    }
    resize(width, height);
  });
  observer.observe(container);
  listenDevicePixelRatioChanges(chart, resize);
  return observer;
}
function releaseObserver(chart, type, observer) {
  if (observer) {
    observer.disconnect();
  }
  if (type === "resize") {
    unlistenDevicePixelRatioChanges(chart);
  }
}
function createProxyAndListen(chart, type, listener) {
  const canvas = chart.canvas;
  const proxy = throttled((event) => {
    if (chart.ctx !== null) {
      listener(fromNativeEvent(event, chart));
    }
  }, chart);
  addListener(canvas, type, proxy);
  return proxy;
}
class DomPlatform extends BasePlatform {
  acquireContext(canvas, aspectRatio) {
    const context = canvas && canvas.getContext && canvas.getContext("2d");
    if (context && context.canvas === canvas) {
      initCanvas(canvas, aspectRatio);
      return context;
    }
    return null;
  }
  releaseContext(context) {
    const canvas = context.canvas;
    if (!canvas[EXPANDO_KEY]) {
      return false;
    }
    const initial = canvas[EXPANDO_KEY].initial;
    ["height", "width"].forEach((prop) => {
      const value = initial[prop];
      if (isNullOrUndef(value)) {
        canvas.removeAttribute(prop);
      } else {
        canvas.setAttribute(prop, value);
      }
    });
    const style = initial.style || {};
    Object.keys(style).forEach((key) => {
      canvas.style[key] = style[key];
    });
    canvas.width = canvas.width;
    delete canvas[EXPANDO_KEY];
    return true;
  }
  addEventListener(chart, type, listener) {
    this.removeEventListener(chart, type);
    const proxies = chart.$proxies || (chart.$proxies = {});
    const handlers2 = {
      attach: createAttachObserver,
      detach: createDetachObserver,
      resize: createResizeObserver
    };
    const handler2 = handlers2[type] || createProxyAndListen;
    proxies[type] = handler2(chart, type, listener);
  }
  removeEventListener(chart, type) {
    const proxies = chart.$proxies || (chart.$proxies = {});
    const proxy = proxies[type];
    if (!proxy) {
      return;
    }
    const handlers2 = {
      attach: releaseObserver,
      detach: releaseObserver,
      resize: releaseObserver
    };
    const handler2 = handlers2[type] || removeListener;
    handler2(chart, type, proxy);
    proxies[type] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(canvas, width, height, aspectRatio) {
    return getMaximumSize(canvas, width, height, aspectRatio);
  }
  isAttached(canvas) {
    const container = canvas && _getParentNode(canvas);
    return !!(container && container.isConnected);
  }
}
function _detectPlatform(canvas) {
  if (!_isDomSupported() || typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return BasicPlatform;
  }
  return DomPlatform;
}
class Element {
  static defaults = {};
  static defaultRoutes = void 0;
  x;
  y;
  active = false;
  options;
  $animations;
  tooltipPosition(useFinalPosition) {
    const {
      x: x2,
      y: y2
    } = this.getProps(["x", "y"], useFinalPosition);
    return {
      x: x2,
      y: y2
    };
  }
  hasValue() {
    return isNumber(this.x) && isNumber(this.y);
  }
  getProps(props, final) {
    const anims = this.$animations;
    if (!final || !anims) {
      return this;
    }
    const ret = {};
    props.forEach((prop) => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
    });
    return ret;
  }
}
function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const determinedMaxTicks = determineMaxTicks(scale);
  const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
  const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const newTicks = [];
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }
  const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
  if (numMajorIndices > 0) {
    let i2, ilen;
    const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
    skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
    for (i2 = 0, ilen = numMajorIndices - 1; i2 < ilen; i2++) {
      skip(ticks, newTicks, spacing, majorIndices[i2], majorIndices[i2 + 1]);
    }
    skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
    return newTicks;
  }
  skip(ticks, newTicks, spacing);
  return newTicks;
}
function determineMaxTicks(scale) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
}
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  const evenMajorSpacing = getEvenSpacing(majorIndices);
  const spacing = ticks.length / ticksLimit;
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }
  const factors = _factorize(evenMajorSpacing);
  for (let i2 = 0, ilen = factors.length - 1; i2 < ilen; i2++) {
    const factor = factors[i2];
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}
function getMajorIndices(ticks) {
  const result = [];
  let i2, ilen;
  for (i2 = 0, ilen = ticks.length; i2 < ilen; i2++) {
    if (ticks[i2].major) {
      result.push(i2);
    }
  }
  return result;
}
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  let count = 0;
  let next = majorIndices[0];
  let i2;
  spacing = Math.ceil(spacing);
  for (i2 = 0; i2 < ticks.length; i2++) {
    if (i2 === next) {
      newTicks.push(ticks[i2]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
  const start = valueOrDefault(majorStart, 0);
  const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
  let count = 0;
  let length, i2, next;
  spacing = Math.ceil(spacing);
  if (majorEnd) {
    length = majorEnd - majorStart;
    spacing = length / Math.floor(length / spacing);
  }
  next = start;
  while (next < 0) {
    count++;
    next = Math.round(start + count * spacing);
  }
  for (i2 = Math.max(start, 0); i2 < end; i2++) {
    if (i2 === next) {
      newTicks.push(ticks[i2]);
      count++;
      next = Math.round(start + count * spacing);
    }
  }
}
function getEvenSpacing(arr) {
  const len = arr.length;
  let i2, diff;
  if (len < 2) {
    return false;
  }
  for (diff = arr[0], i2 = 1; i2 < len; ++i2) {
    if (arr[i2] - arr[i2 - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
const reverseAlign = (align) => align === "left" ? "right" : align === "right" ? "left" : align;
const offsetFromEdge = (scale, edge, offset) => edge === "top" || edge === "left" ? scale[edge] + offset : scale[edge] - offset;
const getTicksLimit = (ticksLength, maxTicksLimit) => Math.min(maxTicksLimit || ticksLength, ticksLength);
function sample(arr, numItems) {
  const result = [];
  const increment = arr.length / numItems;
  const len = arr.length;
  let i2 = 0;
  for (; i2 < len; i2 += increment) {
    result.push(arr[Math.floor(i2)]);
  }
  return result;
}
function getPixelForGridLine(scale, index2, offsetGridLines) {
  const length = scale.ticks.length;
  const validIndex2 = Math.min(index2, length - 1);
  const start = scale._startPixel;
  const end = scale._endPixel;
  const epsilon = 1e-6;
  let lineValue = scale.getPixelForTick(validIndex2);
  let offset;
  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index2 === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex2 - 1)) / 2;
    }
    lineValue += validIndex2 < index2 ? offset : -offset;
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}
function garbageCollect(caches, length) {
  each(caches, (cache) => {
    const gc = cache.gc;
    const gcLen = gc.length / 2;
    let i2;
    if (gcLen > length) {
      for (i2 = 0; i2 < gcLen; ++i2) {
        delete cache.data[gc[i2]];
      }
      gc.splice(0, gcLen);
    }
  });
}
function getTickMarkLength(options2) {
  return options2.drawTicks ? options2.tickLength : 0;
}
function getTitleHeight(options2, fallback) {
  if (!options2.display) {
    return 0;
  }
  const font = toFont(options2.font, fallback);
  const padding = toPadding(options2.padding);
  const lines = isArray(options2.text) ? options2.text.length : 1;
  return lines * font.lineHeight + padding.height;
}
function createScaleContext(parent, scale) {
  return createContext(parent, {
    scale,
    type: "scale"
  });
}
function createTickContext(parent, index2, tick) {
  return createContext(parent, {
    tick,
    index: index2,
    type: "tick"
  });
}
function titleAlign(align, position, reverse) {
  let ret = _toLeftRightCenter(align);
  if (reverse && position !== "right" || !reverse && position === "right") {
    ret = reverseAlign(ret);
  }
  return ret;
}
function titleArgs(scale, offset, position, align) {
  const {
    top,
    left,
    bottom,
    right,
    chart
  } = scale;
  const {
    chartArea,
    scales: scales2
  } = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom - top;
  const width = right - left;
  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleY = scales2[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === "center") {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleX = scales2[positionAxisID].getPixelForValue(value) - width + offset;
    } else if (position === "center") {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
    titleY = _alignStartEnd(align, bottom, top);
    rotation = position === "left" ? -HALF_PI : HALF_PI;
  }
  return {
    titleX,
    titleY,
    maxWidth,
    rotation
  };
}
class Scale extends Element {
  constructor(cfg) {
    super();
    this.id = cfg.id;
    this.type = cfg.type;
    this.options = void 0;
    this.ctx = cfg.ctx;
    this.chart = cfg.chart;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.maxWidth = void 0;
    this.maxHeight = void 0;
    this.paddingTop = void 0;
    this.paddingBottom = void 0;
    this.paddingLeft = void 0;
    this.paddingRight = void 0;
    this.axis = void 0;
    this.labelRotation = void 0;
    this.min = void 0;
    this.max = void 0;
    this._range = void 0;
    this.ticks = [];
    this._gridLineItems = null;
    this._labelItems = null;
    this._labelSizes = null;
    this._length = 0;
    this._maxLength = 0;
    this._longestTextCache = {};
    this._startPixel = void 0;
    this._endPixel = void 0;
    this._reversePixels = false;
    this._userMax = void 0;
    this._userMin = void 0;
    this._suggestedMax = void 0;
    this._suggestedMin = void 0;
    this._ticksLength = 0;
    this._borderValue = 0;
    this._cache = {};
    this._dataLimitsCached = false;
    this.$context = void 0;
  }
  init(options2) {
    this.options = options2.setContext(this.getContext());
    this.axis = options2.axis;
    this._userMin = this.parse(options2.min);
    this._userMax = this.parse(options2.max);
    this._suggestedMin = this.parse(options2.suggestedMin);
    this._suggestedMax = this.parse(options2.suggestedMax);
  }
  parse(raw, index2) {
    return raw;
  }
  getUserBounds() {
    let {
      _userMin,
      _userMax,
      _suggestedMin,
      _suggestedMax
    } = this;
    _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
    _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
    _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
    _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
    return {
      min: finiteOrDefault(_userMin, _suggestedMin),
      max: finiteOrDefault(_userMax, _suggestedMax),
      minDefined: isNumberFinite(_userMin),
      maxDefined: isNumberFinite(_userMax)
    };
  }
  getMinMax(canStack) {
    let {
      min,
      max,
      minDefined,
      maxDefined
    } = this.getUserBounds();
    let range;
    if (minDefined && maxDefined) {
      return {
        min,
        max
      };
    }
    const metas = this.getMatchingVisibleMetas();
    for (let i2 = 0, ilen = metas.length; i2 < ilen; ++i2) {
      range = metas[i2].controller.getMinMax(this, canStack);
      if (!minDefined) {
        min = Math.min(min, range.min);
      }
      if (!maxDefined) {
        max = Math.max(max, range.max);
      }
    }
    min = maxDefined && min > max ? max : min;
    max = minDefined && min > max ? min : max;
    return {
      min: finiteOrDefault(min, finiteOrDefault(max, min)),
      max: finiteOrDefault(max, finiteOrDefault(min, max))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const data = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
  }
  getLabelItems(chartArea = this.chart.chartArea) {
    const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
    return items;
  }
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }
  beforeUpdate() {
    callback(this.options.beforeUpdate, [this]);
  }
  update(maxWidth, maxHeight, margins) {
    const {
      beginAtZero,
      grace,
      ticks: tickOpts
    } = this.options;
    const sampleSize = tickOpts.sampleSize;
    this.beforeUpdate();
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, margins);
    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();
    this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = _addGrace(this, grace, beginAtZero);
      this._dataLimitsCached = true;
    }
    this.beforeBuildTicks();
    this.ticks = this.buildTicks() || [];
    this.afterBuildTicks();
    const samplingEnabled = sampleSize < this.ticks.length;
    this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
    this.configure();
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation();
    this.afterCalculateLabelRotation();
    if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === "auto")) {
      this.ticks = autoSkip(this, this.ticks);
      this._labelSizes = null;
      this.afterAutoSkip();
    }
    if (samplingEnabled) {
      this._convertTicksToLabels(this.ticks);
    }
    this.beforeFit();
    this.fit();
    this.afterFit();
    this.afterUpdate();
  }
  configure() {
    let reversePixels = this.options.reverse;
    let startPixel, endPixel;
    if (this.isHorizontal()) {
      startPixel = this.left;
      endPixel = this.right;
    } else {
      startPixel = this.top;
      endPixel = this.bottom;
      reversePixels = !reversePixels;
    }
    this._startPixel = startPixel;
    this._endPixel = endPixel;
    this._reversePixels = reversePixels;
    this._length = endPixel - startPixel;
    this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    callback(this.options.afterUpdate, [this]);
  }
  beforeSetDimensions() {
    callback(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = 0;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = 0;
      this.bottom = this.height;
    }
    this.paddingLeft = 0;
    this.paddingTop = 0;
    this.paddingRight = 0;
    this.paddingBottom = 0;
  }
  afterSetDimensions() {
    callback(this.options.afterSetDimensions, [this]);
  }
  _callHooks(name) {
    this.chart.notifyPlugins(name, this.getContext());
    callback(this.options[name], [this]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    callback(this.options.beforeTickToLabelConversion, [this]);
  }
  generateTickLabels(ticks) {
    const tickOpts = this.options.ticks;
    let i2, ilen, tick;
    for (i2 = 0, ilen = ticks.length; i2 < ilen; i2++) {
      tick = ticks[i2];
      tick.label = callback(tickOpts.callback, [tick.value, i2, ticks], this);
    }
  }
  afterTickToLabelConversion() {
    callback(this.options.afterTickToLabelConversion, [this]);
  }
  beforeCalculateLabelRotation() {
    callback(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const options2 = this.options;
    const tickOpts = options2.ticks;
    const numTicks = getTicksLimit(this.ticks.length, options2.ticks.maxTicksLimit);
    const minRotation = tickOpts.minRotation || 0;
    const maxRotation = tickOpts.maxRotation;
    let labelRotation = minRotation;
    let tickWidth, maxHeight, maxLabelDiagonal;
    if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
      this.labelRotation = minRotation;
      return;
    }
    const labelSizes = this._getLabelSizes();
    const maxLabelWidth = labelSizes.widest.width;
    const maxLabelHeight = labelSizes.highest.height;
    const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
    tickWidth = options2.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
    if (maxLabelWidth + 6 > tickWidth) {
      tickWidth = maxWidth / (numTicks - (options2.offset ? 0.5 : 1));
      maxHeight = this.maxHeight - getTickMarkLength(options2.grid) - tickOpts.padding - getTitleHeight(options2.title, this.chart.options.font);
      maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
      labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))));
      labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
    }
    this.labelRotation = labelRotation;
  }
  afterCalculateLabelRotation() {
    callback(this.options.afterCalculateLabelRotation, [this]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    callback(this.options.beforeFit, [this]);
  }
  fit() {
    const minSize = {
      width: 0,
      height: 0
    };
    const {
      chart,
      options: {
        ticks: tickOpts,
        title: titleOpts,
        grid: gridOpts
      }
    } = this;
    const display = this._isVisible();
    const isHorizontal = this.isHorizontal();
    if (display) {
      const titleHeight = getTitleHeight(titleOpts, chart.options.font);
      if (isHorizontal) {
        minSize.width = this.maxWidth;
        minSize.height = getTickMarkLength(gridOpts) + titleHeight;
      } else {
        minSize.height = this.maxHeight;
        minSize.width = getTickMarkLength(gridOpts) + titleHeight;
      }
      if (tickOpts.display && this.ticks.length) {
        const {
          first,
          last,
          widest,
          highest
        } = this._getLabelSizes();
        const tickPadding = tickOpts.padding * 2;
        const angleRadians = toRadians(this.labelRotation);
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        if (isHorizontal) {
          const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
          minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
        } else {
          const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
          minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
        }
        this._calculatePadding(first, last, sin, cos);
      }
    }
    this._handleMargins();
    if (isHorizontal) {
      this.width = this._length = chart.width - this._margins.left - this._margins.right;
      this.height = minSize.height;
    } else {
      this.width = minSize.width;
      this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
    }
  }
  _calculatePadding(first, last, sin, cos) {
    const {
      ticks: {
        align,
        padding
      },
      position
    } = this.options;
    const isRotated = this.labelRotation !== 0;
    const labelsBelowTicks = position !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const offsetLeft = this.getPixelForTick(0) - this.left;
      const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
      let paddingLeft = 0;
      let paddingRight = 0;
      if (isRotated) {
        if (labelsBelowTicks) {
          paddingLeft = cos * first.width;
          paddingRight = sin * last.height;
        } else {
          paddingLeft = sin * first.height;
          paddingRight = cos * last.width;
        }
      } else if (align === "start") {
        paddingRight = last.width;
      } else if (align === "end") {
        paddingLeft = first.width;
      } else if (align !== "inner") {
        paddingLeft = first.width / 2;
        paddingRight = last.width / 2;
      }
      this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
      this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
    } else {
      let paddingTop = last.height / 2;
      let paddingBottom = first.height / 2;
      if (align === "start") {
        paddingTop = 0;
        paddingBottom = first.height;
      } else if (align === "end") {
        paddingTop = last.height;
        paddingBottom = 0;
      }
      this.paddingTop = paddingTop + padding;
      this.paddingBottom = paddingBottom + padding;
    }
  }
  _handleMargins() {
    if (this._margins) {
      this._margins.left = Math.max(this.paddingLeft, this._margins.left);
      this._margins.top = Math.max(this.paddingTop, this._margins.top);
      this._margins.right = Math.max(this.paddingRight, this._margins.right);
      this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
    }
  }
  afterFit() {
    callback(this.options.afterFit, [this]);
  }
  isHorizontal() {
    const {
      axis,
      position
    } = this.options;
    return position === "top" || position === "bottom" || axis === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(ticks) {
    this.beforeTickToLabelConversion();
    this.generateTickLabels(ticks);
    let i2, ilen;
    for (i2 = 0, ilen = ticks.length; i2 < ilen; i2++) {
      if (isNullOrUndef(ticks[i2].label)) {
        ticks.splice(i2, 1);
        ilen--;
        i2--;
      }
    }
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let labelSizes = this._labelSizes;
    if (!labelSizes) {
      const sampleSize = this.options.ticks.sampleSize;
      let ticks = this.ticks;
      if (sampleSize < ticks.length) {
        ticks = sample(ticks, sampleSize);
      }
      this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
    }
    return labelSizes;
  }
  _computeLabelSizes(ticks, length, maxTicksLimit) {
    const {
      ctx,
      _longestTextCache: caches
    } = this;
    const widths = [];
    const heights = [];
    const increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
    let widestLabelSize = 0;
    let highestLabelSize = 0;
    let i2, j2, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
    for (i2 = 0; i2 < length; i2 += increment) {
      label = ticks[i2].label;
      tickFont = this._resolveTickFontOptions(i2);
      ctx.font = fontString = tickFont.string;
      cache = caches[fontString] = caches[fontString] || {
        data: {},
        gc: []
      };
      lineHeight = tickFont.lineHeight;
      width = height = 0;
      if (!isNullOrUndef(label) && !isArray(label)) {
        width = _measureText(ctx, cache.data, cache.gc, width, label);
        height = lineHeight;
      } else if (isArray(label)) {
        for (j2 = 0, jlen = label.length; j2 < jlen; ++j2) {
          nestedLabel = label[j2];
          if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
            width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
            height += lineHeight;
          }
        }
      }
      widths.push(width);
      heights.push(height);
      widestLabelSize = Math.max(width, widestLabelSize);
      highestLabelSize = Math.max(height, highestLabelSize);
    }
    garbageCollect(caches, length);
    const widest = widths.indexOf(widestLabelSize);
    const highest = heights.indexOf(highestLabelSize);
    const valueAt = (idx) => ({
      width: widths[idx] || 0,
      height: heights[idx] || 0
    });
    return {
      first: valueAt(0),
      last: valueAt(length - 1),
      widest: valueAt(widest),
      highest: valueAt(highest),
      widths,
      heights
    };
  }
  getLabelForValue(value) {
    return value;
  }
  getPixelForValue(value, index2) {
    return NaN;
  }
  getValueForPixel(pixel) {
  }
  getPixelForTick(index2) {
    const ticks = this.ticks;
    if (index2 < 0 || index2 > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index2].value);
  }
  getPixelForDecimal(decimal) {
    if (this._reversePixels) {
      decimal = 1 - decimal;
    }
    const pixel = this._startPixel + decimal * this._length;
    return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
  }
  getDecimalForPixel(pixel) {
    const decimal = (pixel - this._startPixel) / this._length;
    return this._reversePixels ? 1 - decimal : decimal;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const {
      min,
      max
    } = this;
    return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
  }
  getContext(index2) {
    const ticks = this.ticks || [];
    if (index2 >= 0 && index2 < ticks.length) {
      const tick = ticks[index2];
      return tick.$context || (tick.$context = createTickContext(this.getContext(), index2, tick));
    }
    return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
  }
  _tickSize() {
    const optionTicks = this.options.ticks;
    const rot = toRadians(this.labelRotation);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));
    const labelSizes = this._getLabelSizes();
    const padding = optionTicks.autoSkipPadding || 0;
    const w2 = labelSizes ? labelSizes.widest.width + padding : 0;
    const h3 = labelSizes ? labelSizes.highest.height + padding : 0;
    return this.isHorizontal() ? h3 * cos > w2 * sin ? w2 / cos : h3 / sin : h3 * sin < w2 * cos ? h3 / cos : w2 / sin;
  }
  _isVisible() {
    const display = this.options.display;
    if (display !== "auto") {
      return !!display;
    }
    return this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(chartArea) {
    const axis = this.axis;
    const chart = this.chart;
    const options2 = this.options;
    const {
      grid,
      position,
      border
    } = options2;
    const offset = grid.offset;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const ticksLength = ticks.length + (offset ? 1 : 0);
    const tl = getTickMarkLength(grid);
    const items = [];
    const borderOpts = border.setContext(this.getContext());
    const axisWidth = borderOpts.display ? borderOpts.width : 0;
    const axisHalfWidth = axisWidth / 2;
    const alignBorderValue = function(pixel) {
      return _alignPixel(chart, pixel, axisWidth);
    };
    let borderValue, i2, lineValue, alignedLineValue;
    let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
    if (position === "top") {
      borderValue = alignBorderValue(this.bottom);
      ty1 = this.bottom - tl;
      ty2 = borderValue - axisHalfWidth;
      y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
      y2 = chartArea.bottom;
    } else if (position === "bottom") {
      borderValue = alignBorderValue(this.top);
      y1 = chartArea.top;
      y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
      ty1 = borderValue + axisHalfWidth;
      ty2 = this.top + tl;
    } else if (position === "left") {
      borderValue = alignBorderValue(this.right);
      tx1 = this.right - tl;
      tx2 = borderValue - axisHalfWidth;
      x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
      x2 = chartArea.right;
    } else if (position === "right") {
      borderValue = alignBorderValue(this.left);
      x1 = chartArea.left;
      x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
      tx1 = borderValue + axisHalfWidth;
      tx2 = this.left + tl;
    } else if (axis === "x") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      y1 = chartArea.top;
      y2 = chartArea.bottom;
      ty1 = borderValue + axisHalfWidth;
      ty2 = ty1 + tl;
    } else if (axis === "y") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      tx1 = borderValue - axisHalfWidth;
      tx2 = tx1 - tl;
      x1 = chartArea.left;
      x2 = chartArea.right;
    }
    const limit = valueOrDefault(options2.ticks.maxTicksLimit, ticksLength);
    const step = Math.max(1, Math.ceil(ticksLength / limit));
    for (i2 = 0; i2 < ticksLength; i2 += step) {
      const context = this.getContext(i2);
      const optsAtIndex = grid.setContext(context);
      const optsAtIndexBorder = border.setContext(context);
      const lineWidth = optsAtIndex.lineWidth;
      const lineColor = optsAtIndex.color;
      const borderDash = optsAtIndexBorder.dash || [];
      const borderDashOffset = optsAtIndexBorder.dashOffset;
      const tickWidth = optsAtIndex.tickWidth;
      const tickColor = optsAtIndex.tickColor;
      const tickBorderDash = optsAtIndex.tickBorderDash || [];
      const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
      lineValue = getPixelForGridLine(this, i2, offset);
      if (lineValue === void 0) {
        continue;
      }
      alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
      if (isHorizontal) {
        tx1 = tx2 = x1 = x2 = alignedLineValue;
      } else {
        ty1 = ty2 = y1 = y2 = alignedLineValue;
      }
      items.push({
        tx1,
        ty1,
        tx2,
        ty2,
        x1,
        y1,
        x2,
        y2,
        width: lineWidth,
        color: lineColor,
        borderDash,
        borderDashOffset,
        tickWidth,
        tickColor,
        tickBorderDash,
        tickBorderDashOffset
      });
    }
    this._ticksLength = ticksLength;
    this._borderValue = borderValue;
    return items;
  }
  _computeLabelItems(chartArea) {
    const axis = this.axis;
    const options2 = this.options;
    const {
      position,
      ticks: optionTicks
    } = options2;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const {
      align,
      crossAlign,
      padding,
      mirror
    } = optionTicks;
    const tl = getTickMarkLength(options2.grid);
    const tickAndPadding = tl + padding;
    const hTickAndPadding = mirror ? -padding : tickAndPadding;
    const rotation = -toRadians(this.labelRotation);
    const items = [];
    let i2, ilen, tick, label, x2, y2, textAlign, pixel, font, lineHeight, lineCount, textOffset;
    let textBaseline = "middle";
    if (position === "top") {
      y2 = this.bottom - hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "bottom") {
      y2 = this.top + hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "left") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x2 = ret.x;
    } else if (position === "right") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x2 = ret.x;
    } else if (axis === "x") {
      if (position === "center") {
        y2 = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        y2 = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
      }
      textAlign = this._getXAxisLabelAlignment();
    } else if (axis === "y") {
      if (position === "center") {
        x2 = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        x2 = this.chart.scales[positionAxisID].getPixelForValue(value);
      }
      textAlign = this._getYAxisLabelAlignment(tl).textAlign;
    }
    if (axis === "y") {
      if (align === "start") {
        textBaseline = "top";
      } else if (align === "end") {
        textBaseline = "bottom";
      }
    }
    const labelSizes = this._getLabelSizes();
    for (i2 = 0, ilen = ticks.length; i2 < ilen; ++i2) {
      tick = ticks[i2];
      label = tick.label;
      const optsAtIndex = optionTicks.setContext(this.getContext(i2));
      pixel = this.getPixelForTick(i2) + optionTicks.labelOffset;
      font = this._resolveTickFontOptions(i2);
      lineHeight = font.lineHeight;
      lineCount = isArray(label) ? label.length : 1;
      const halfCount = lineCount / 2;
      const color2 = optsAtIndex.color;
      const strokeColor = optsAtIndex.textStrokeColor;
      const strokeWidth = optsAtIndex.textStrokeWidth;
      let tickTextAlign = textAlign;
      if (isHorizontal) {
        x2 = pixel;
        if (textAlign === "inner") {
          if (i2 === ilen - 1) {
            tickTextAlign = !this.options.reverse ? "right" : "left";
          } else if (i2 === 0) {
            tickTextAlign = !this.options.reverse ? "left" : "right";
          } else {
            tickTextAlign = "center";
          }
        }
        if (position === "top") {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = -lineCount * lineHeight + lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
          } else {
            textOffset = -labelSizes.highest.height + lineHeight / 2;
          }
        } else {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
          } else {
            textOffset = labelSizes.highest.height - lineCount * lineHeight;
          }
        }
        if (mirror) {
          textOffset *= -1;
        }
        if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
          x2 += lineHeight / 2 * Math.sin(rotation);
        }
      } else {
        y2 = pixel;
        textOffset = (1 - lineCount) * lineHeight / 2;
      }
      let backdrop;
      if (optsAtIndex.showLabelBackdrop) {
        const labelPadding = toPadding(optsAtIndex.backdropPadding);
        const height = labelSizes.heights[i2];
        const width = labelSizes.widths[i2];
        let top = textOffset - labelPadding.top;
        let left = 0 - labelPadding.left;
        switch (textBaseline) {
          case "middle":
            top -= height / 2;
            break;
          case "bottom":
            top -= height;
            break;
        }
        switch (textAlign) {
          case "center":
            left -= width / 2;
            break;
          case "right":
            left -= width;
            break;
          case "inner":
            if (i2 === ilen - 1) {
              left -= width;
            } else if (i2 > 0) {
              left -= width / 2;
            }
            break;
        }
        backdrop = {
          left,
          top,
          width: width + labelPadding.width,
          height: height + labelPadding.height,
          color: optsAtIndex.backdropColor
        };
      }
      items.push({
        label,
        font,
        textOffset,
        options: {
          rotation,
          color: color2,
          strokeColor,
          strokeWidth,
          textAlign: tickTextAlign,
          textBaseline,
          translation: [x2, y2],
          backdrop
        }
      });
    }
    return items;
  }
  _getXAxisLabelAlignment() {
    const {
      position,
      ticks
    } = this.options;
    const rotation = -toRadians(this.labelRotation);
    if (rotation) {
      return position === "top" ? "left" : "right";
    }
    let align = "center";
    if (ticks.align === "start") {
      align = "left";
    } else if (ticks.align === "end") {
      align = "right";
    } else if (ticks.align === "inner") {
      align = "inner";
    }
    return align;
  }
  _getYAxisLabelAlignment(tl) {
    const {
      position,
      ticks: {
        crossAlign,
        mirror,
        padding
      }
    } = this.options;
    const labelSizes = this._getLabelSizes();
    const tickAndPadding = tl + padding;
    const widest = labelSizes.widest.width;
    let textAlign;
    let x2;
    if (position === "left") {
      if (mirror) {
        x2 = this.right + padding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x2 += widest / 2;
        } else {
          textAlign = "right";
          x2 += widest;
        }
      } else {
        x2 = this.right - tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x2 -= widest / 2;
        } else {
          textAlign = "left";
          x2 = this.left;
        }
      }
    } else if (position === "right") {
      if (mirror) {
        x2 = this.left + padding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x2 -= widest / 2;
        } else {
          textAlign = "left";
          x2 -= widest;
        }
      } else {
        x2 = this.left + tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x2 += widest / 2;
        } else {
          textAlign = "right";
          x2 = this.right;
        }
      }
    } else {
      textAlign = "right";
    }
    return {
      textAlign,
      x: x2
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) {
      return;
    }
    const chart = this.chart;
    const position = this.options.position;
    if (position === "left" || position === "right") {
      return {
        top: 0,
        left: this.left,
        bottom: chart.height,
        right: this.right
      };
    }
    if (position === "top" || position === "bottom") {
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: chart.width
      };
    }
  }
  drawBackground() {
    const {
      ctx,
      options: {
        backgroundColor
      },
      left,
      top,
      width,
      height
    } = this;
    if (backgroundColor) {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  }
  getLineWidthForValue(value) {
    const grid = this.options.grid;
    if (!this._isVisible() || !grid.display) {
      return 0;
    }
    const ticks = this.ticks;
    const index2 = ticks.findIndex((t2) => t2.value === value);
    if (index2 >= 0) {
      const opts = grid.setContext(this.getContext(index2));
      return opts.lineWidth;
    }
    return 0;
  }
  drawGrid(chartArea) {
    const grid = this.options.grid;
    const ctx = this.ctx;
    const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
    let i2, ilen;
    const drawLine = (p1, p2, style) => {
      if (!style.width || !style.color) {
        return;
      }
      ctx.save();
      ctx.lineWidth = style.width;
      ctx.strokeStyle = style.color;
      ctx.setLineDash(style.borderDash || []);
      ctx.lineDashOffset = style.borderDashOffset;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    };
    if (grid.display) {
      for (i2 = 0, ilen = items.length; i2 < ilen; ++i2) {
        const item = items[i2];
        if (grid.drawOnChartArea) {
          drawLine({
            x: item.x1,
            y: item.y1
          }, {
            x: item.x2,
            y: item.y2
          }, item);
        }
        if (grid.drawTicks) {
          drawLine({
            x: item.tx1,
            y: item.ty1
          }, {
            x: item.tx2,
            y: item.ty2
          }, {
            color: item.tickColor,
            width: item.tickWidth,
            borderDash: item.tickBorderDash,
            borderDashOffset: item.tickBorderDashOffset
          });
        }
      }
    }
  }
  drawBorder() {
    const {
      chart,
      ctx,
      options: {
        border,
        grid
      }
    } = this;
    const borderOpts = border.setContext(this.getContext());
    const axisWidth = border.display ? borderOpts.width : 0;
    if (!axisWidth) {
      return;
    }
    const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
    const borderValue = this._borderValue;
    let x1, x2, y1, y2;
    if (this.isHorizontal()) {
      x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
      x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
      y1 = y2 = borderValue;
    } else {
      y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
      y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
      x1 = x2 = borderValue;
    }
    ctx.save();
    ctx.lineWidth = borderOpts.width;
    ctx.strokeStyle = borderOpts.color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  drawLabels(chartArea) {
    const optionTicks = this.options.ticks;
    if (!optionTicks.display) {
      return;
    }
    const ctx = this.ctx;
    const area = this._computeLabelArea();
    if (area) {
      clipArea(ctx, area);
    }
    const items = this.getLabelItems(chartArea);
    for (const item of items) {
      const renderTextOptions = item.options;
      const tickFont = item.font;
      const label = item.label;
      const y2 = item.textOffset;
      renderText(ctx, label, 0, y2, tickFont, renderTextOptions);
    }
    if (area) {
      unclipArea(ctx);
    }
  }
  drawTitle() {
    const {
      ctx,
      options: {
        position,
        title,
        reverse
      }
    } = this;
    if (!title.display) {
      return;
    }
    const font = toFont(title.font);
    const padding = toPadding(title.padding);
    const align = title.align;
    let offset = font.lineHeight / 2;
    if (position === "bottom" || position === "center" || isObject(position)) {
      offset += padding.bottom;
      if (isArray(title.text)) {
        offset += font.lineHeight * (title.text.length - 1);
      }
    } else {
      offset += padding.top;
    }
    const {
      titleX,
      titleY,
      maxWidth,
      rotation
    } = titleArgs(this, offset, position, align);
    renderText(ctx, title.text, 0, 0, font, {
      color: title.color,
      maxWidth,
      rotation,
      textAlign: titleAlign(align, position, reverse),
      textBaseline: "middle",
      translation: [titleX, titleY],
      strokeColor: title.strokeColor,
      strokeWidth: title.strokeWidth
    });
  }
  draw(chartArea) {
    if (!this._isVisible()) {
      return;
    }
    this.drawBackground();
    this.drawGrid(chartArea);
    this.drawBorder();
    this.drawTitle();
    this.drawLabels(chartArea);
  }
  _layers() {
    const opts = this.options;
    const tz = opts.ticks && opts.ticks.z || 0;
    const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
    const bz = valueOrDefault(opts.border && opts.border.z, 0);
    if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
      return [{
        z: tz,
        draw: (chartArea) => {
          this.draw(chartArea);
        }
      }];
    }
    return [{
      z: gz,
      draw: (chartArea) => {
        this.drawBackground();
        this.drawGrid(chartArea);
        this.drawTitle();
      }
    }, {
      z: bz,
      draw: () => {
        this.drawBorder();
      }
    }, {
      z: tz,
      draw: (chartArea) => {
        this.drawLabels(chartArea);
      }
    }];
  }
  getMatchingVisibleMetas(type) {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    const axisID = this.axis + "AxisID";
    const result = [];
    let i2, ilen;
    for (i2 = 0, ilen = metas.length; i2 < ilen; ++i2) {
      const meta = metas[i2];
      if (meta[axisID] === this.id && (!type || meta.type === type)) {
        result.push(meta);
      }
    }
    return result;
  }
  _resolveTickFontOptions(index2) {
    const opts = this.options.ticks.setContext(this.getContext(index2));
    return toFont(opts.font);
  }
  _maxDigits() {
    const fontSize = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / fontSize;
  }
}
class TypedRegistry {
  constructor(type, scope, override) {
    this.type = type;
    this.scope = scope;
    this.override = override;
    this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(type) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
  }
  register(item) {
    const proto = Object.getPrototypeOf(item);
    let parentScope;
    if (isIChartComponent(proto)) {
      parentScope = this.register(proto);
    }
    const items = this.items;
    const id = item.id;
    const scope = this.scope + "." + id;
    if (!id) {
      throw new Error("class does not have id: " + item);
    }
    if (id in items) {
      return scope;
    }
    items[id] = item;
    registerDefaults(item, scope, parentScope);
    if (this.override) {
      defaults.override(item.id, item.overrides);
    }
    return scope;
  }
  get(id) {
    return this.items[id];
  }
  unregister(item) {
    const items = this.items;
    const id = item.id;
    const scope = this.scope;
    if (id in items) {
      delete items[id];
    }
    if (scope && id in defaults[scope]) {
      delete defaults[scope][id];
      if (this.override) {
        delete overrides[id];
      }
    }
  }
}
function registerDefaults(item, scope, parentScope) {
  const itemDefaults = merge(/* @__PURE__ */ Object.create(null), [parentScope ? defaults.get(parentScope) : {}, defaults.get(scope), item.defaults]);
  defaults.set(scope, itemDefaults);
  if (item.defaultRoutes) {
    routeDefaults(scope, item.defaultRoutes);
  }
  if (item.descriptors) {
    defaults.describe(scope, item.descriptors);
  }
}
function routeDefaults(scope, routes) {
  Object.keys(routes).forEach((property) => {
    const propertyParts = property.split(".");
    const sourceName = propertyParts.pop();
    const sourceScope = [scope].concat(propertyParts).join(".");
    const parts = routes[property].split(".");
    const targetName = parts.pop();
    const targetScope = parts.join(".");
    defaults.route(sourceScope, sourceName, targetScope, targetName);
  });
}
function isIChartComponent(proto) {
  return "id" in proto && "defaults" in proto;
}
class Registry {
  constructor() {
    this.controllers = new TypedRegistry(DatasetController, "datasets", true);
    this.elements = new TypedRegistry(Element, "elements");
    this.plugins = new TypedRegistry(Object, "plugins");
    this.scales = new TypedRegistry(Scale, "scales");
    this._typedRegistries = [this.controllers, this.scales, this.elements];
  }
  add(...args) {
    this._each("register", args);
  }
  remove(...args) {
    this._each("unregister", args);
  }
  addControllers(...args) {
    this._each("register", args, this.controllers);
  }
  addElements(...args) {
    this._each("register", args, this.elements);
  }
  addPlugins(...args) {
    this._each("register", args, this.plugins);
  }
  addScales(...args) {
    this._each("register", args, this.scales);
  }
  getController(id) {
    return this._get(id, this.controllers, "controller");
  }
  getElement(id) {
    return this._get(id, this.elements, "element");
  }
  getPlugin(id) {
    return this._get(id, this.plugins, "plugin");
  }
  getScale(id) {
    return this._get(id, this.scales, "scale");
  }
  removeControllers(...args) {
    this._each("unregister", args, this.controllers);
  }
  removeElements(...args) {
    this._each("unregister", args, this.elements);
  }
  removePlugins(...args) {
    this._each("unregister", args, this.plugins);
  }
  removeScales(...args) {
    this._each("unregister", args, this.scales);
  }
  _each(method, args, typedRegistry) {
    [...args].forEach((arg) => {
      const reg = typedRegistry || this._getRegistryForType(arg);
      if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
        this._exec(method, reg, arg);
      } else {
        each(arg, (item) => {
          const itemReg = typedRegistry || this._getRegistryForType(item);
          this._exec(method, itemReg, item);
        });
      }
    });
  }
  _exec(method, registry2, component) {
    const camelMethod = _capitalize(method);
    callback(component["before" + camelMethod], [], component);
    registry2[method](component);
    callback(component["after" + camelMethod], [], component);
  }
  _getRegistryForType(type) {
    for (let i2 = 0; i2 < this._typedRegistries.length; i2++) {
      const reg = this._typedRegistries[i2];
      if (reg.isForType(type)) {
        return reg;
      }
    }
    return this.plugins;
  }
  _get(id, typedRegistry, type) {
    const item = typedRegistry.get(id);
    if (item === void 0) {
      throw new Error('"' + id + '" is not a registered ' + type + ".");
    }
    return item;
  }
}
var registry = /* @__PURE__ */ new Registry();
class PluginService {
  constructor() {
    this._init = void 0;
  }
  notify(chart, hook, args, filter) {
    if (hook === "beforeInit") {
      this._init = this._createDescriptors(chart, true);
      this._notify(this._init, chart, "install");
    }
    if (this._init === void 0) {
      return;
    }
    const descriptors2 = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
    const result = this._notify(descriptors2, chart, hook, args);
    if (hook === "afterDestroy") {
      this._notify(descriptors2, chart, "stop");
      this._notify(this._init, chart, "uninstall");
      this._init = void 0;
    }
    return result;
  }
  _notify(descriptors2, chart, hook, args) {
    args = args || {};
    for (const descriptor of descriptors2) {
      const plugin = descriptor.plugin;
      const method = plugin[hook];
      const params = [chart, args, descriptor.options];
      if (callback(method, params, plugin) === false && args.cancelable) {
        return false;
      }
    }
    return true;
  }
  invalidate() {
    if (!isNullOrUndef(this._cache)) {
      this._oldCache = this._cache;
      this._cache = void 0;
    }
  }
  _descriptors(chart) {
    if (this._cache) {
      return this._cache;
    }
    const descriptors2 = this._cache = this._createDescriptors(chart);
    this._notifyStateChanges(chart);
    return descriptors2;
  }
  _createDescriptors(chart, all) {
    const config2 = chart && chart.config;
    const options2 = valueOrDefault(config2.options && config2.options.plugins, {});
    const plugins2 = allPlugins(config2);
    return options2 === false && !all ? [] : createDescriptors(chart, plugins2, options2, all);
  }
  _notifyStateChanges(chart) {
    const previousDescriptors = this._oldCache || [];
    const descriptors2 = this._cache;
    const diff = (a2, b2) => a2.filter((x2) => !b2.some((y2) => x2.plugin.id === y2.plugin.id));
    this._notify(diff(previousDescriptors, descriptors2), chart, "stop");
    this._notify(diff(descriptors2, previousDescriptors), chart, "start");
  }
}
function allPlugins(config2) {
  const localIds = {};
  const plugins2 = [];
  const keys = Object.keys(registry.plugins.items);
  for (let i2 = 0; i2 < keys.length; i2++) {
    plugins2.push(registry.getPlugin(keys[i2]));
  }
  const local = config2.plugins || [];
  for (let i2 = 0; i2 < local.length; i2++) {
    const plugin = local[i2];
    if (plugins2.indexOf(plugin) === -1) {
      plugins2.push(plugin);
      localIds[plugin.id] = true;
    }
  }
  return {
    plugins: plugins2,
    localIds
  };
}
function getOpts(options2, all) {
  if (!all && options2 === false) {
    return null;
  }
  if (options2 === true) {
    return {};
  }
  return options2;
}
function createDescriptors(chart, {
  plugins: plugins2,
  localIds
}, options2, all) {
  const result = [];
  const context = chart.getContext();
  for (const plugin of plugins2) {
    const id = plugin.id;
    const opts = getOpts(options2[id], all);
    if (opts === null) {
      continue;
    }
    result.push({
      plugin,
      options: pluginOpts(chart.config, {
        plugin,
        local: localIds[id]
      }, opts, context)
    });
  }
  return result;
}
function pluginOpts(config2, {
  plugin,
  local
}, opts, context) {
  const keys = config2.pluginScopeKeys(plugin);
  const scopes = config2.getOptionScopes(opts, keys);
  if (local && plugin.defaults) {
    scopes.push(plugin.defaults);
  }
  return config2.createResolver(scopes, context, [""], {
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
function getIndexAxis(type, options2) {
  const datasetDefaults = defaults.datasets[type] || {};
  const datasetOptions = (options2.datasets || {})[type] || {};
  return datasetOptions.indexAxis || options2.indexAxis || datasetDefaults.indexAxis || "x";
}
function getAxisFromDefaultScaleID(id, indexAxis) {
  let axis = id;
  if (id === "_index_") {
    axis = indexAxis;
  } else if (id === "_value_") {
    axis = indexAxis === "x" ? "y" : "x";
  }
  return axis;
}
function getDefaultScaleIDFromAxis(axis, indexAxis) {
  return axis === indexAxis ? "_index_" : "_value_";
}
function idMatchesAxis(id) {
  if (id === "x" || id === "y" || id === "r") {
    return id;
  }
}
function axisFromPosition(position) {
  if (position === "top" || position === "bottom") {
    return "x";
  }
  if (position === "left" || position === "right") {
    return "y";
  }
}
function determineAxis(id, ...scaleOptions) {
  if (idMatchesAxis(id)) {
    return id;
  }
  for (const opts of scaleOptions) {
    const axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
    if (axis) {
      return axis;
    }
  }
  throw new Error(`Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`);
}
function getAxisFromDataset(id, axis, dataset) {
  if (dataset[axis + "AxisID"] === id) {
    return {
      axis
    };
  }
}
function retrieveAxisFromDatasets(id, config2) {
  if (config2.data && config2.data.datasets) {
    const boundDs = config2.data.datasets.filter((d2) => d2.xAxisID === id || d2.yAxisID === id);
    if (boundDs.length) {
      return getAxisFromDataset(id, "x", boundDs[0]) || getAxisFromDataset(id, "y", boundDs[0]);
    }
  }
  return {};
}
function mergeScaleConfig(config2, options2) {
  const chartDefaults = overrides[config2.type] || {
    scales: {}
  };
  const configScales = options2.scales || {};
  const chartIndexAxis = getIndexAxis(config2.type, options2);
  const scales2 = /* @__PURE__ */ Object.create(null);
  Object.keys(configScales).forEach((id) => {
    const scaleConf = configScales[id];
    if (!isObject(scaleConf)) {
      return console.error(`Invalid scale configuration for scale: ${id}`);
    }
    if (scaleConf._proxy) {
      return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
    }
    const axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config2), defaults.scales[scaleConf.type]);
    const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    const defaultScaleOptions = chartDefaults.scales || {};
    scales2[id] = mergeIf(/* @__PURE__ */ Object.create(null), [{
      axis
    }, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
  });
  config2.data.datasets.forEach((dataset) => {
    const type = dataset.type || config2.type;
    const indexAxis = dataset.indexAxis || getIndexAxis(type, options2);
    const datasetDefaults = overrides[type] || {};
    const defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach((defaultID) => {
      const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      const id = dataset[axis + "AxisID"] || axis;
      scales2[id] = scales2[id] || /* @__PURE__ */ Object.create(null);
      mergeIf(scales2[id], [{
        axis
      }, configScales[id], defaultScaleOptions[defaultID]]);
    });
  });
  Object.keys(scales2).forEach((key) => {
    const scale = scales2[key];
    mergeIf(scale, [defaults.scales[scale.type], defaults.scale]);
  });
  return scales2;
}
function initOptions(config2) {
  const options2 = config2.options || (config2.options = {});
  options2.plugins = valueOrDefault(options2.plugins, {});
  options2.scales = mergeScaleConfig(config2, options2);
}
function initData(data) {
  data = data || {};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];
  return data;
}
function initConfig(config2) {
  config2 = config2 || {};
  config2.data = initData(config2.data);
  initOptions(config2);
  return config2;
}
const keyCache = /* @__PURE__ */ new Map();
const keysCached = /* @__PURE__ */ new Set();
function cachedKeys(cacheKey, generate) {
  let keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}
const addIfFound = (set2, obj, key) => {
  const opts = resolveObjectKey(obj, key);
  if (opts !== void 0) {
    set2.add(opts);
  }
};
class Config {
  constructor(config2) {
    this._config = initConfig(config2);
    this._scopeCache = /* @__PURE__ */ new Map();
    this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(type) {
    this._config.type = type;
  }
  get data() {
    return this._config.data;
  }
  set data(data) {
    this._config.data = initData(data);
  }
  get options() {
    return this._config.options;
  }
  set options(options2) {
    this._config.options = options2;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const config2 = this._config;
    this.clearCache();
    initOptions(config2);
  }
  clearCache() {
    this._scopeCache.clear();
    this._resolverCache.clear();
  }
  datasetScopeKeys(datasetType) {
    return cachedKeys(datasetType, () => [[`datasets.${datasetType}`, ""]]);
  }
  datasetAnimationScopeKeys(datasetType, transition) {
    return cachedKeys(`${datasetType}.transition.${transition}`, () => [[`datasets.${datasetType}.transitions.${transition}`, `transitions.${transition}`], [`datasets.${datasetType}`, ""]]);
  }
  datasetElementScopeKeys(datasetType, elementType) {
    return cachedKeys(`${datasetType}-${elementType}`, () => [[`datasets.${datasetType}.elements.${elementType}`, `datasets.${datasetType}`, `elements.${elementType}`, ""]]);
  }
  pluginScopeKeys(plugin) {
    const id = plugin.id;
    const type = this.type;
    return cachedKeys(`${type}-plugin-${id}`, () => [[`plugins.${id}`, ...plugin.additionalOptionScopes || []]]);
  }
  _cachedScopes(mainScope, resetCache) {
    const _scopeCache = this._scopeCache;
    let cache = _scopeCache.get(mainScope);
    if (!cache || resetCache) {
      cache = /* @__PURE__ */ new Map();
      _scopeCache.set(mainScope, cache);
    }
    return cache;
  }
  getOptionScopes(mainScope, keyLists, resetCache) {
    const {
      options: options2,
      type
    } = this;
    const cache = this._cachedScopes(mainScope, resetCache);
    const cached = cache.get(keyLists);
    if (cached) {
      return cached;
    }
    const scopes = /* @__PURE__ */ new Set();
    keyLists.forEach((keys) => {
      if (mainScope) {
        scopes.add(mainScope);
        keys.forEach((key) => addIfFound(scopes, mainScope, key));
      }
      keys.forEach((key) => addIfFound(scopes, options2, key));
      keys.forEach((key) => addIfFound(scopes, overrides[type] || {}, key));
      keys.forEach((key) => addIfFound(scopes, defaults, key));
      keys.forEach((key) => addIfFound(scopes, descriptors, key));
    });
    const array = Array.from(scopes);
    if (array.length === 0) {
      array.push(/* @__PURE__ */ Object.create(null));
    }
    if (keysCached.has(keyLists)) {
      cache.set(keyLists, array);
    }
    return array;
  }
  chartOptionScopes() {
    const {
      options: options2,
      type
    } = this;
    return [options2, overrides[type] || {}, defaults.datasets[type] || {}, {
      type
    }, defaults, descriptors];
  }
  resolveNamedOptions(scopes, names2, context, prefixes = [""]) {
    const result = {
      $shared: true
    };
    const {
      resolver,
      subPrefixes
    } = getResolver(this._resolverCache, scopes, prefixes);
    let options2 = resolver;
    if (needContext(resolver, names2)) {
      result.$shared = false;
      context = isFunction(context) ? context() : context;
      const subResolver = this.createResolver(scopes, context, subPrefixes);
      options2 = _attachContext(resolver, context, subResolver);
    }
    for (const prop of names2) {
      result[prop] = options2[prop];
    }
    return result;
  }
  createResolver(scopes, context, prefixes = [""], descriptorDefaults) {
    const {
      resolver
    } = getResolver(this._resolverCache, scopes, prefixes);
    return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
  }
}
function getResolver(resolverCache, scopes, prefixes) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes);
    cached = {
      resolver,
      subPrefixes: prefixes.filter((p2) => !p2.toLowerCase().includes("hover"))
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}
const hasFunction = (value) => isObject(value) && Object.getOwnPropertyNames(value).some((key) => isFunction(value[key]));
function needContext(proxy, names2) {
  const {
    isScriptable,
    isIndexable
  } = _descriptors(proxy);
  for (const prop of names2) {
    const scriptable = isScriptable(prop);
    const indexable = isIndexable(prop);
    const value = (indexable || scriptable) && proxy[prop];
    if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
      return true;
    }
  }
  return false;
}
var version$1 = "4.6.1";
const KNOWN_POSITIONS = ["top", "bottom", "left", "right", "chartArea"];
function positionIsHorizontal(position, axis) {
  return position === "top" || position === "bottom" || KNOWN_POSITIONS.indexOf(position) === -1 && axis === "x";
}
function compare2Level(l1, l2) {
  return function(a2, b2) {
    return a2[l1] === b2[l1] ? a2[l2] - b2[l2] : a2[l1] - b2[l1];
  };
}
function onAnimationsComplete(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  chart.notifyPlugins("afterRender");
  callback(animationOptions && animationOptions.onComplete, [context], chart);
}
function onAnimationProgress(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  callback(animationOptions && animationOptions.onProgress, [context], chart);
}
function getCanvas(item) {
  if (_isDomSupported() && typeof item === "string") {
    item = document.getElementById(item);
  } else if (item && item.length) {
    item = item[0];
  }
  if (item && item.canvas) {
    item = item.canvas;
  }
  return item;
}
const instances = {};
const getChart = (key) => {
  const canvas = getCanvas(key);
  return Object.values(instances).filter((c2) => c2.canvas === canvas).pop();
};
function moveNumericKeys(obj, start, move) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const intKey = +key;
    if (intKey >= start) {
      const value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}
function determineLastEvent(e2, lastEvent, inChartArea, isClick) {
  if (!inChartArea || e2.type === "mouseout") {
    return null;
  }
  if (isClick) {
    return lastEvent;
  }
  return e2;
}
class Chart {
  static defaults = defaults;
  static instances = instances;
  static overrides = overrides;
  static registry = registry;
  static version = version$1;
  static getChart = getChart;
  static register(...items) {
    registry.add(...items);
    invalidatePlugins();
  }
  static unregister(...items) {
    registry.remove(...items);
    invalidatePlugins();
  }
  constructor(item, userConfig) {
    const config2 = this.config = new Config(userConfig);
    const initialCanvas = getCanvas(item);
    const existingChart = getChart(initialCanvas);
    if (existingChart) {
      throw new Error("Canvas is already in use. Chart with ID '" + existingChart.id + "' must be destroyed before the canvas with ID '" + existingChart.canvas.id + "' can be reused.");
    }
    const options2 = config2.createResolver(config2.chartOptionScopes(), this.getContext());
    this.platform = new (config2.platform || _detectPlatform(initialCanvas))();
    this.platform.updateConfig(config2);
    const context = this.platform.acquireContext(initialCanvas, options2.aspectRatio);
    const canvas = context && context.canvas;
    const height = canvas && canvas.height;
    const width = canvas && canvas.width;
    this.id = uid();
    this.ctx = context;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this._options = options2;
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = void 0;
    this.boxes = [];
    this.currentDevicePixelRatio = void 0;
    this.chartArea = void 0;
    this._active = [];
    this._lastEvent = void 0;
    this._listeners = {};
    this._responsiveListeners = void 0;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginService();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = void 0;
    this.$context = void 0;
    this._doResize = debounce((mode) => this.update(mode), options2.resizeDelay || 0);
    this._dataChanges = [];
    instances[this.id] = this;
    if (!context || !canvas) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    animator.listen(this, "complete", onAnimationsComplete);
    animator.listen(this, "progress", onAnimationProgress);
    this._initialize();
    if (this.attached) {
      this.update();
    }
  }
  get aspectRatio() {
    const {
      options: {
        aspectRatio,
        maintainAspectRatio
      },
      width,
      height,
      _aspectRatio
    } = this;
    if (!isNullOrUndef(aspectRatio)) {
      return aspectRatio;
    }
    if (maintainAspectRatio && _aspectRatio) {
      return _aspectRatio;
    }
    return height ? width / height : null;
  }
  get data() {
    return this.config.data;
  }
  set data(data) {
    this.config.data = data;
  }
  get options() {
    return this._options;
  }
  set options(options2) {
    this.config.options = options2;
  }
  get registry() {
    return registry;
  }
  _initialize() {
    this.notifyPlugins("beforeInit");
    if (this.options.responsive) {
      this.resize();
    } else {
      retinaScale(this, this.options.devicePixelRatio);
    }
    this.bindEvents();
    this.notifyPlugins("afterInit");
    return this;
  }
  clear() {
    clearCanvas(this.canvas, this.ctx);
    return this;
  }
  stop() {
    animator.stop(this);
    return this;
  }
  resize(width, height) {
    if (!animator.running(this)) {
      this._resize(width, height);
    } else {
      this._resizeBeforeDraw = {
        width,
        height
      };
    }
  }
  _resize(width, height) {
    const options2 = this.options;
    const canvas = this.canvas;
    const aspectRatio = options2.maintainAspectRatio && this.aspectRatio;
    const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
    const newRatio = options2.devicePixelRatio || this.platform.getDevicePixelRatio();
    const mode = this.width ? "resize" : "attach";
    this.width = newSize.width;
    this.height = newSize.height;
    this._aspectRatio = this.aspectRatio;
    if (!retinaScale(this, newRatio, true)) {
      return;
    }
    this.notifyPlugins("resize", {
      size: newSize
    });
    callback(options2.onResize, [this, newSize], this);
    if (this.attached) {
      if (this._doResize(mode)) {
        this.render();
      }
    }
  }
  ensureScalesHaveIDs() {
    const options2 = this.options;
    const scalesOptions = options2.scales || {};
    each(scalesOptions, (axisOptions, axisID) => {
      axisOptions.id = axisID;
    });
  }
  buildOrUpdateScales() {
    const options2 = this.options;
    const scaleOpts = options2.scales;
    const scales2 = this.scales;
    const updated = Object.keys(scales2).reduce((obj, id) => {
      obj[id] = false;
      return obj;
    }, {});
    let items = [];
    if (scaleOpts) {
      items = items.concat(Object.keys(scaleOpts).map((id) => {
        const scaleOptions = scaleOpts[id];
        const axis = determineAxis(id, scaleOptions);
        const isRadial = axis === "r";
        const isHorizontal = axis === "x";
        return {
          options: scaleOptions,
          dposition: isRadial ? "chartArea" : isHorizontal ? "bottom" : "left",
          dtype: isRadial ? "radialLinear" : isHorizontal ? "category" : "linear"
        };
      }));
    }
    each(items, (item) => {
      const scaleOptions = item.options;
      const id = scaleOptions.id;
      const axis = determineAxis(id, scaleOptions);
      const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
      if (scaleOptions.position === void 0 || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
        scaleOptions.position = item.dposition;
      }
      updated[id] = true;
      let scale = null;
      if (id in scales2 && scales2[id].type === scaleType) {
        scale = scales2[id];
      } else {
        const scaleClass = registry.getScale(scaleType);
        scale = new scaleClass({
          id,
          type: scaleType,
          ctx: this.ctx,
          chart: this
        });
        scales2[scale.id] = scale;
      }
      scale.init(scaleOptions, options2);
    });
    each(updated, (hasUpdated, id) => {
      if (!hasUpdated) {
        delete scales2[id];
      }
    });
    each(scales2, (scale) => {
      layouts.configure(this, scale, scale.options);
      layouts.addBox(this, scale);
    });
  }
  _updateMetasets() {
    const metasets = this._metasets;
    const numData = this.data.datasets.length;
    const numMeta = metasets.length;
    metasets.sort((a2, b2) => a2.index - b2.index);
    if (numMeta > numData) {
      for (let i2 = numData; i2 < numMeta; ++i2) {
        this._destroyDatasetMeta(i2);
      }
      metasets.splice(numData, numMeta - numData);
    }
    this._sortedMetasets = metasets.slice(0).sort(compare2Level("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const {
      _metasets: metasets,
      data: {
        datasets
      }
    } = this;
    if (metasets.length > datasets.length) {
      delete this._stacks;
    }
    metasets.forEach((meta, index2) => {
      if (datasets.filter((x2) => x2 === meta._dataset).length === 0) {
        this._destroyDatasetMeta(index2);
      }
    });
  }
  buildOrUpdateControllers() {
    const newControllers = [];
    const datasets = this.data.datasets;
    let i2, ilen;
    this._removeUnreferencedMetasets();
    for (i2 = 0, ilen = datasets.length; i2 < ilen; i2++) {
      const dataset = datasets[i2];
      let meta = this.getDatasetMeta(i2);
      const type = dataset.type || this.config.type;
      if (meta.type && meta.type !== type) {
        this._destroyDatasetMeta(i2);
        meta = this.getDatasetMeta(i2);
      }
      meta.type = type;
      meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
      meta.order = dataset.order || 0;
      meta.index = i2;
      meta.label = "" + dataset.label;
      meta.visible = this.isDatasetVisible(i2);
      if (meta.controller) {
        meta.controller.updateIndex(i2);
        meta.controller.linkScales();
      } else {
        const ControllerClass = registry.getController(type);
        const {
          datasetElementType,
          dataElementType
        } = defaults.datasets[type];
        Object.assign(ControllerClass, {
          dataElementType: registry.getElement(dataElementType),
          datasetElementType: datasetElementType && registry.getElement(datasetElementType)
        });
        meta.controller = new ControllerClass(this, i2);
        newControllers.push(meta.controller);
      }
    }
    this._updateMetasets();
    return newControllers;
  }
  _resetElements() {
    each(this.data.datasets, (dataset, datasetIndex) => {
      this.getDatasetMeta(datasetIndex).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements();
    this.notifyPlugins("reset");
  }
  update(mode) {
    const config2 = this.config;
    config2.update();
    const options2 = this._options = config2.createResolver(config2.chartOptionScopes(), this.getContext());
    const animsDisabled = this._animationsDisabled = !options2.animation;
    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();
    this._plugins.invalidate();
    if (this.notifyPlugins("beforeUpdate", {
      mode,
      cancelable: true
    }) === false) {
      return;
    }
    const newControllers = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let minPadding = 0;
    for (let i2 = 0, ilen = this.data.datasets.length; i2 < ilen; i2++) {
      const {
        controller
      } = this.getDatasetMeta(i2);
      const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
      controller.buildOrUpdateElements(reset);
      minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
    }
    minPadding = this._minPadding = options2.layout.autoPadding ? minPadding : 0;
    this._updateLayout(minPadding);
    if (!animsDisabled) {
      each(newControllers, (controller) => {
        controller.reset();
      });
    }
    this._updateDatasets(mode);
    this.notifyPlugins("afterUpdate", {
      mode
    });
    this._layers.sort(compare2Level("z", "_idx"));
    const {
      _active,
      _lastEvent
    } = this;
    if (_lastEvent) {
      this._eventHandler(_lastEvent, true);
    } else if (_active.length) {
      this._updateHoverStyles(_active, _active, true);
    }
    this.render();
  }
  _updateScales() {
    each(this.scales, (scale) => {
      layouts.removeBox(this, scale);
    });
    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const options2 = this.options;
    const existingEvents = new Set(Object.keys(this._listeners));
    const newEvents = new Set(options2.events);
    if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options2.responsive) {
      this.unbindEvents();
      this.bindEvents();
    }
  }
  _updateHiddenIndices() {
    const {
      _hiddenIndices
    } = this;
    const changes = this._getUniformDataChanges() || [];
    for (const {
      method,
      start,
      count
    } of changes) {
      const move = method === "_removeElements" ? -count : count;
      moveNumericKeys(_hiddenIndices, start, move);
    }
  }
  _getUniformDataChanges() {
    const _dataChanges = this._dataChanges;
    if (!_dataChanges || !_dataChanges.length) {
      return;
    }
    this._dataChanges = [];
    const datasetCount = this.data.datasets.length;
    const makeSet = (idx) => new Set(_dataChanges.filter((c2) => c2[0] === idx).map((c2, i2) => i2 + "," + c2.splice(1).join(",")));
    const changeSet = makeSet(0);
    for (let i2 = 1; i2 < datasetCount; i2++) {
      if (!setsEqual(changeSet, makeSet(i2))) {
        return;
      }
    }
    return Array.from(changeSet).map((c2) => c2.split(",")).map((a2) => ({
      method: a2[1],
      start: +a2[2],
      count: +a2[3]
    }));
  }
  _updateLayout(minPadding) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: true
    }) === false) {
      return;
    }
    layouts.update(this, this.width, this.height, minPadding);
    const area = this.chartArea;
    const noArea = area.width <= 0 || area.height <= 0;
    this._layers = [];
    each(this.boxes, (box) => {
      if (noArea && box.position === "chartArea") {
        return;
      }
      if (box.configure) {
        box.configure();
      }
      this._layers.push(...box._layers());
    }, this);
    this._layers.forEach((item, index2) => {
      item._idx = index2;
    });
    this.notifyPlugins("afterLayout");
  }
  _updateDatasets(mode) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode,
      cancelable: true
    }) === false) {
      return;
    }
    for (let i2 = 0, ilen = this.data.datasets.length; i2 < ilen; ++i2) {
      this.getDatasetMeta(i2).controller.configure();
    }
    for (let i2 = 0, ilen = this.data.datasets.length; i2 < ilen; ++i2) {
      this._updateDataset(i2, isFunction(mode) ? mode({
        datasetIndex: i2
      }) : mode);
    }
    this.notifyPlugins("afterDatasetsUpdate", {
      mode
    });
  }
  _updateDataset(index2, mode) {
    const meta = this.getDatasetMeta(index2);
    const args = {
      meta,
      index: index2,
      mode,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetUpdate", args) === false) {
      return;
    }
    meta.controller._update(mode);
    args.cancelable = false;
    this.notifyPlugins("afterDatasetUpdate", args);
  }
  render() {
    if (this.notifyPlugins("beforeRender", {
      cancelable: true
    }) === false) {
      return;
    }
    if (animator.has(this)) {
      if (this.attached && !animator.running(this)) {
        animator.start(this);
      }
    } else {
      this.draw();
      onAnimationsComplete({
        chart: this
      });
    }
  }
  draw() {
    let i2;
    if (this._resizeBeforeDraw) {
      const {
        width,
        height
      } = this._resizeBeforeDraw;
      this._resizeBeforeDraw = null;
      this._resize(width, height);
    }
    this.clear();
    if (this.width <= 0 || this.height <= 0) {
      return;
    }
    if (this.notifyPlugins("beforeDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const layers = this._layers;
    for (i2 = 0; i2 < layers.length && layers[i2].z <= 0; ++i2) {
      layers[i2].draw(this.chartArea);
    }
    this._drawDatasets();
    for (; i2 < layers.length; ++i2) {
      layers[i2].draw(this.chartArea);
    }
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(filterVisible) {
    const metasets = this._sortedMetasets;
    const result = [];
    let i2, ilen;
    for (i2 = 0, ilen = metasets.length; i2 < ilen; ++i2) {
      const meta = metasets[i2];
      if (!filterVisible || meta.visible) {
        result.push(meta);
      }
    }
    return result;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const metasets = this.getSortedVisibleDatasetMetas();
    for (let i2 = metasets.length - 1; i2 >= 0; --i2) {
      this._drawDataset(metasets[i2]);
    }
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(meta) {
    const ctx = this.ctx;
    const args = {
      meta,
      index: meta.index,
      cancelable: true
    };
    const clip = getDatasetClipArea(this, meta);
    if (this.notifyPlugins("beforeDatasetDraw", args) === false) {
      return;
    }
    if (clip) {
      clipArea(ctx, clip);
    }
    meta.controller.draw();
    if (clip) {
      unclipArea(ctx);
    }
    args.cancelable = false;
    this.notifyPlugins("afterDatasetDraw", args);
  }
  isPointInArea(point) {
    return _isPointInArea(point, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(e2, mode, options2, useFinalPosition) {
    const method = Interaction.modes[mode];
    if (typeof method === "function") {
      return method(this, e2, options2, useFinalPosition);
    }
    return [];
  }
  getDatasetMeta(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    const metasets = this._metasets;
    let meta = metasets.filter((x2) => x2 && x2._dataset === dataset).pop();
    if (!meta) {
      meta = {
        type: null,
        data: [],
        dataset: null,
        controller: null,
        hidden: null,
        xAxisID: null,
        yAxisID: null,
        order: dataset && dataset.order || 0,
        index: datasetIndex,
        _dataset: dataset,
        _parsed: [],
        _sorted: false
      };
      metasets.push(meta);
    }
    return meta;
  }
  getContext() {
    return this.$context || (this.$context = createContext(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    if (!dataset) {
      return false;
    }
    const meta = this.getDatasetMeta(datasetIndex);
    return typeof meta.hidden === "boolean" ? !meta.hidden : !dataset.hidden;
  }
  setDatasetVisibility(datasetIndex, visible) {
    const meta = this.getDatasetMeta(datasetIndex);
    meta.hidden = !visible;
  }
  toggleDataVisibility(index2) {
    this._hiddenIndices[index2] = !this._hiddenIndices[index2];
  }
  getDataVisibility(index2) {
    return !this._hiddenIndices[index2];
  }
  _updateVisibility(datasetIndex, dataIndex, visible) {
    const mode = visible ? "show" : "hide";
    const meta = this.getDatasetMeta(datasetIndex);
    const anims = meta.controller._resolveAnimations(void 0, mode);
    if (defined(dataIndex)) {
      meta.data[dataIndex].hidden = !visible;
      this.update();
    } else {
      this.setDatasetVisibility(datasetIndex, visible);
      anims.update(meta, {
        visible
      });
      this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : void 0);
    }
  }
  hide(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, false);
  }
  show(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, true);
  }
  _destroyDatasetMeta(datasetIndex) {
    const meta = this._metasets[datasetIndex];
    if (meta && meta.controller) {
      meta.controller._destroy();
    }
    delete this._metasets[datasetIndex];
  }
  _stop() {
    let i2, ilen;
    this.stop();
    animator.remove(this);
    for (i2 = 0, ilen = this.data.datasets.length; i2 < ilen; ++i2) {
      this._destroyDatasetMeta(i2);
    }
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const {
      canvas,
      ctx
    } = this;
    this._stop();
    this.config.clearCache();
    if (canvas) {
      this.unbindEvents();
      clearCanvas(canvas, ctx);
      this.platform.releaseContext(ctx);
      this.canvas = null;
      this.ctx = null;
    }
    delete instances[this.id];
    this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...args) {
    return this.canvas.toDataURL(...args);
  }
  bindEvents() {
    this.bindUserEvents();
    if (this.options.responsive) {
      this.bindResponsiveEvents();
    } else {
      this.attached = true;
    }
  }
  bindUserEvents() {
    const listeners = this._listeners;
    const platform = this.platform;
    const _add = (type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    };
    const listener = (e2, x2, y2) => {
      e2.offsetX = x2;
      e2.offsetY = y2;
      this._eventHandler(e2);
    };
    each(this.options.events, (type) => _add(type, listener));
  }
  bindResponsiveEvents() {
    if (!this._responsiveListeners) {
      this._responsiveListeners = {};
    }
    const listeners = this._responsiveListeners;
    const platform = this.platform;
    const _add = (type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    };
    const _remove = (type, listener2) => {
      if (listeners[type]) {
        platform.removeEventListener(this, type, listener2);
        delete listeners[type];
      }
    };
    const listener = (width, height) => {
      if (this.canvas) {
        this.resize(width, height);
      }
    };
    let detached;
    const attached = () => {
      _remove("attach", attached);
      this.attached = true;
      this.resize();
      _add("resize", listener);
      _add("detach", detached);
    };
    detached = () => {
      this.attached = false;
      _remove("resize", listener);
      this._stop();
      this._resize(0, 0);
      _add("attach", attached);
    };
    if (platform.isAttached(this.canvas)) {
      attached();
    } else {
      detached();
    }
  }
  unbindEvents() {
    each(this._listeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._listeners = {};
    each(this._responsiveListeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._responsiveListeners = void 0;
  }
  updateHoverStyle(items, mode, enabled2) {
    const prefix = enabled2 ? "set" : "remove";
    let meta, item, i2, ilen;
    if (mode === "dataset") {
      meta = this.getDatasetMeta(items[0].datasetIndex);
      meta.controller["_" + prefix + "DatasetHoverStyle"]();
    }
    for (i2 = 0, ilen = items.length; i2 < ilen; ++i2) {
      item = items[i2];
      const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
      if (controller) {
        controller[prefix + "HoverStyle"](item.element, item.datasetIndex, item.index);
      }
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements) {
    const lastActive = this._active || [];
    const active = activeElements.map(({
      datasetIndex,
      index: index2
    }) => {
      const meta = this.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("No dataset found at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index2],
        index: index2
      };
    });
    const changed = !_elementsEqual(active, lastActive);
    if (changed) {
      this._active = active;
      this._lastEvent = null;
      this._updateHoverStyles(active, lastActive);
    }
  }
  notifyPlugins(hook, args, filter) {
    return this._plugins.notify(this, hook, args, filter);
  }
  isPluginEnabled(pluginId) {
    return this._plugins._cache.filter((p2) => p2.plugin.id === pluginId).length === 1;
  }
  _updateHoverStyles(active, lastActive, replay) {
    const hoverOptions = this.options.hover;
    const diff = (a2, b2) => a2.filter((x2) => !b2.some((y2) => x2.datasetIndex === y2.datasetIndex && x2.index === y2.index));
    const deactivated = diff(lastActive, active);
    const activated = replay ? active : diff(active, lastActive);
    if (deactivated.length) {
      this.updateHoverStyle(deactivated, hoverOptions.mode, false);
    }
    if (activated.length && hoverOptions.mode) {
      this.updateHoverStyle(activated, hoverOptions.mode, true);
    }
  }
  _eventHandler(e2, replay) {
    const args = {
      event: e2,
      replay,
      cancelable: true,
      inChartArea: this.isPointInArea(e2)
    };
    const eventFilter = (plugin) => (plugin.options.events || this.options.events).includes(e2.native.type);
    if (this.notifyPlugins("beforeEvent", args, eventFilter) === false) {
      return;
    }
    const changed = this._handleEvent(e2, replay, args.inChartArea);
    args.cancelable = false;
    this.notifyPlugins("afterEvent", args, eventFilter);
    if (changed || args.changed) {
      this.render();
    }
    return this;
  }
  _handleEvent(e2, replay, inChartArea) {
    const {
      _active: lastActive = [],
      options: options2
    } = this;
    const useFinalPosition = replay;
    const active = this._getActiveElements(e2, lastActive, inChartArea, useFinalPosition);
    const isClick = _isClickEvent(e2);
    const lastEvent = determineLastEvent(e2, this._lastEvent, inChartArea, isClick);
    if (inChartArea) {
      this._lastEvent = null;
      callback(options2.onHover, [e2, active, this], this);
      if (isClick) {
        callback(options2.onClick, [e2, active, this], this);
      }
    }
    const changed = !_elementsEqual(active, lastActive);
    if (changed || replay) {
      this._active = active;
      this._updateHoverStyles(active, lastActive, replay);
    }
    this._lastEvent = lastEvent;
    return changed;
  }
  _getActiveElements(e2, lastActive, inChartArea, useFinalPosition) {
    if (e2.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive;
    }
    const hoverOptions = this.options.hover;
    return this.getElementsAtEventForMode(e2, hoverOptions.mode, hoverOptions, useFinalPosition);
  }
}
function invalidatePlugins() {
  return each(Chart.instances, (chart) => chart._plugins.invalidate());
}
function clipSelf(ctx, element, endAngle) {
  const {
    startAngle,
    x: x2,
    y: y2,
    outerRadius,
    innerRadius,
    options: options2
  } = element;
  const {
    borderWidth,
    borderJoinStyle
  } = options2;
  const outerAngleClip = Math.min(borderWidth / outerRadius, _normalizeAngle(startAngle - endAngle));
  ctx.beginPath();
  ctx.arc(x2, y2, outerRadius - borderWidth / 2, startAngle + outerAngleClip / 2, endAngle - outerAngleClip / 2);
  if (innerRadius > 0) {
    const innerAngleClip = Math.min(borderWidth / innerRadius, _normalizeAngle(startAngle - endAngle));
    ctx.arc(x2, y2, innerRadius + borderWidth / 2, endAngle - innerAngleClip / 2, startAngle + innerAngleClip / 2, true);
  } else {
    const clipWidth = Math.min(borderWidth / 2, outerRadius * _normalizeAngle(startAngle - endAngle));
    if (borderJoinStyle === "round") {
      ctx.arc(x2, y2, clipWidth, endAngle - PI / 2, startAngle + PI / 2, true);
    } else if (borderJoinStyle === "bevel") {
      const r2 = 2 * clipWidth * clipWidth;
      const endX = -r2 * Math.cos(endAngle + PI / 2) + x2;
      const endY = -r2 * Math.sin(endAngle + PI / 2) + y2;
      const startX = r2 * Math.cos(startAngle + PI / 2) + x2;
      const startY = r2 * Math.sin(startAngle + PI / 2) + y2;
      ctx.lineTo(endX, endY);
      ctx.lineTo(startX, startY);
    }
  }
  ctx.closePath();
  ctx.moveTo(0, 0);
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clip("evenodd");
}
function clipArc(ctx, element, endAngle) {
  const {
    startAngle,
    pixelMargin,
    x: x2,
    y: y2,
    outerRadius,
    innerRadius
  } = element;
  let angleMargin = pixelMargin / outerRadius;
  ctx.beginPath();
  ctx.arc(x2, y2, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
  if (innerRadius > pixelMargin) {
    angleMargin = pixelMargin / innerRadius;
    ctx.arc(x2, y2, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
  } else {
    ctx.arc(x2, y2, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
  }
  ctx.closePath();
  ctx.clip();
}
function toRadiusCorners(value) {
  return _readValueToProps(value, ["outerStart", "outerEnd", "innerStart", "innerEnd"]);
}
function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
  const o2 = toRadiusCorners(arc.options.borderRadius);
  const halfThickness = (outerRadius - innerRadius) / 2;
  const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
  const computeOuterLimit = (val) => {
    const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
    return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
  };
  return {
    outerStart: computeOuterLimit(o2.outerStart),
    outerEnd: computeOuterLimit(o2.outerEnd),
    innerStart: _limitValue(o2.innerStart, 0, innerLimit),
    innerEnd: _limitValue(o2.innerEnd, 0, innerLimit)
  };
}
function rThetaToXY(r2, theta, x2, y2) {
  return {
    x: x2 + r2 * Math.cos(theta),
    y: y2 + r2 * Math.sin(theta)
  };
}
function pathFullCircle(ctx, element, offset, spacing) {
  const {
    x: x2,
    y: y2,
    startAngle: start,
    pixelMargin,
    innerRadius: innerR
  } = element;
  const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
  ctx.beginPath();
  ctx.arc(x2, y2, outerRadius, start, start + TAU);
  if (innerRadius > 0) {
    ctx.moveTo(x2 + Math.cos(start) * innerRadius, y2 + Math.sin(start) * innerRadius);
    ctx.arc(x2, y2, innerRadius, start + TAU, start, true);
  }
  ctx.closePath();
}
function pathArc(ctx, element, offset, spacing, end, circular) {
  const {
    x: x2,
    y: y2,
    startAngle: start,
    pixelMargin,
    innerRadius: innerR
  } = element;
  const {
    spacingMode = "angular"
  } = element.options;
  const alpha2 = end - start;
  if (circular && element.options.selfJoin && Math.abs(alpha2) >= TAU - 1e-4) {
    pathFullCircle(ctx, element, offset, spacing);
    return;
  }
  const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  let innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
  let outerSpacingOffset = 0;
  let innerSpacingOffset = 0;
  const beta = outerRadius > 0 ? Math.max(1e-3, alpha2 * outerRadius - offset / PI) / outerRadius : 1e-3;
  const angleOffset = (alpha2 - beta) / 2;
  if (spacing) {
    const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
    const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
    const avgNoSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
    const proportionalOffset = (() => {
      const adjustedAngle = avgNoSpacingRadius !== 0 ? alpha2 * avgNoSpacingRadius / (avgNoSpacingRadius + spacing) : alpha2;
      return (alpha2 - adjustedAngle) / 2;
    })();
    const angularOffset = avgNoSpacingRadius > 0 ? Math.asin(Math.min(1, spacing / avgNoSpacingRadius)) : 0;
    const maxOffset = Math.max(0, beta / 2 - 1e-3);
    const maxOffsetSin = Math.sin(maxOffset);
    if (spacingMode === "parallel") {
      if (innerRadius === 0 && maxOffsetSin > 0) {
        const minInnerRadius = spacing / maxOffsetSin;
        const maxInnerRadius = Math.max(0, outerRadius - 1e-3);
        innerRadius = Math.min(minInnerRadius, maxInnerRadius);
      }
      const maxParallelSpacing = Math.min(outerRadius > 0 ? outerRadius * maxOffsetSin : Number.POSITIVE_INFINITY, innerRadius > 0 ? innerRadius * maxOffsetSin : Number.POSITIVE_INFINITY);
      const parallelSpacing = Math.min(spacing, maxParallelSpacing);
      outerSpacingOffset = outerRadius > 0 ? Math.asin(Math.min(1, parallelSpacing / outerRadius)) : Math.min(maxOffset, angularOffset);
      innerSpacingOffset = innerRadius > 0 ? Math.asin(Math.min(1, parallelSpacing / innerRadius)) : outerSpacingOffset;
    } else if (spacingMode === "proportional") {
      outerSpacingOffset = Math.min(maxOffset, proportionalOffset);
      innerSpacingOffset = Math.min(maxOffset, proportionalOffset);
    } else {
      outerSpacingOffset = Math.min(maxOffset, angularOffset);
      innerSpacingOffset = Math.min(maxOffset, angularOffset);
    }
  }
  const outerStartAngle = start + angleOffset + outerSpacingOffset;
  const outerEndAngle = end - angleOffset - outerSpacingOffset;
  const innerStartAngle = start + angleOffset + innerSpacingOffset;
  const innerEndAngle = end - angleOffset - innerSpacingOffset;
  const angleDelta = Math.min(outerEndAngle - outerStartAngle, innerEndAngle - innerStartAngle);
  const {
    outerStart,
    outerEnd,
    innerStart,
    innerEnd
  } = parseBorderRadius$1(element, innerRadius, outerRadius, angleDelta);
  const outerStartAdjustedRadius = outerRadius - outerStart;
  const outerEndAdjustedRadius = outerRadius - outerEnd;
  const outerStartAdjustedAngle = outerStartAngle + outerStart / outerStartAdjustedRadius;
  const outerEndAdjustedAngle = outerEndAngle - outerEnd / outerEndAdjustedRadius;
  const innerStartAdjustedRadius = innerRadius + innerStart;
  const innerEndAdjustedRadius = innerRadius + innerEnd;
  const innerStartAdjustedAngle = innerStartAngle + innerStart / innerStartAdjustedRadius;
  const innerEndAdjustedAngle = innerEndAngle - innerEnd / innerEndAdjustedRadius;
  ctx.beginPath();
  if (circular) {
    const outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
    ctx.arc(x2, y2, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
    ctx.arc(x2, y2, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);
    if (outerEnd > 0) {
      const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x2, y2);
      ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, outerEndAngle + HALF_PI);
    }
    const p4 = rThetaToXY(innerEndAdjustedRadius, innerEndAngle, x2, y2);
    ctx.lineTo(p4.x, p4.y);
    if (innerEnd > 0) {
      const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x2, y2);
      ctx.arc(pCenter.x, pCenter.y, innerEnd, innerEndAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
    }
    const innerMidAdjustedAngle = (innerEndAngle - innerEnd / innerRadius + (innerStartAngle + innerStart / innerRadius)) / 2;
    ctx.arc(x2, y2, innerRadius, innerEndAngle - innerEnd / innerRadius, innerMidAdjustedAngle, true);
    ctx.arc(x2, y2, innerRadius, innerMidAdjustedAngle, innerStartAngle + innerStart / innerRadius, true);
    if (innerStart > 0) {
      const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x2, y2);
      ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, innerStartAngle - HALF_PI);
    }
    const p8 = rThetaToXY(outerStartAdjustedRadius, outerStartAngle, x2, y2);
    ctx.lineTo(p8.x, p8.y);
    if (outerStart > 0) {
      const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x2, y2);
      ctx.arc(pCenter.x, pCenter.y, outerStart, outerStartAngle - HALF_PI, outerStartAdjustedAngle);
    }
  } else {
    ctx.moveTo(x2, y2);
    const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x2;
    const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y2;
    ctx.lineTo(outerStartX, outerStartY);
    const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x2;
    const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y2;
    ctx.lineTo(outerEndX, outerEndY);
  }
  ctx.closePath();
}
function drawArc(ctx, element, offset, spacing, circular) {
  const {
    fullCircles,
    startAngle,
    circumference
  } = element;
  let endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (let i2 = 0; i2 < fullCircles; ++i2) {
      ctx.fill();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % TAU || TAU);
    }
  }
  pathArc(ctx, element, offset, spacing, endAngle, circular);
  ctx.fill();
  return endAngle;
}
function drawBorder(ctx, element, offset, spacing, circular) {
  const {
    fullCircles,
    startAngle,
    circumference,
    options: options2
  } = element;
  const {
    borderWidth,
    borderJoinStyle,
    borderDash,
    borderDashOffset,
    borderRadius
  } = options2;
  const inner = options2.borderAlign === "inner";
  if (!borderWidth) {
    return;
  }
  ctx.setLineDash(borderDash || []);
  ctx.lineDashOffset = borderDashOffset;
  if (inner) {
    ctx.lineWidth = borderWidth * 2;
    ctx.lineJoin = borderJoinStyle || "round";
  } else {
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = borderJoinStyle || "bevel";
  }
  let endAngle = element.endAngle;
  const isFullCircle = Math.abs(endAngle - startAngle) >= TAU - 1e-4;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (let i2 = 0; i2 < fullCircles; ++i2) {
      ctx.stroke();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % TAU || TAU);
    }
  }
  if (inner) {
    clipArc(ctx, element, endAngle);
  }
  const skipSelfClip = isFullCircle && element.innerRadius > 0;
  if (!skipSelfClip && options2.selfJoin && endAngle - startAngle >= PI && borderRadius === 0 && borderJoinStyle !== "miter") {
    clipSelf(ctx, element, endAngle);
  }
  if (!fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    ctx.stroke();
  }
}
class ArcElement extends Element {
  static id = "arc";
  static defaults = {
    borderAlign: "center",
    borderColor: "#fff",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: void 0,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    spacingMode: "angular",
    angle: void 0,
    circular: true,
    selfJoin: false
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== "borderDash"
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  circular;
  constructor(cfg) {
    super();
    this.options = void 0;
    this.circumference = void 0;
    this.startAngle = void 0;
    this.endAngle = void 0;
    this.innerRadius = void 0;
    this.outerRadius = void 0;
    this.pixelMargin = 0;
    this.fullCircles = 0;
    this.circular = false;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(chartX, chartY, useFinalPosition) {
    const point = this.getProps(["x", "y"], useFinalPosition);
    const {
      angle,
      distance
    } = getAngleFromPoint(point, {
      x: chartX,
      y: chartY
    });
    const {
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      circumference
    } = this.getProps(["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], useFinalPosition);
    const rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
    const _circumference = valueOrDefault(circumference, endAngle - startAngle);
    const nonZeroBetween = _angleBetween(angle, startAngle, endAngle) && startAngle !== endAngle;
    const betweenAngles = _circumference >= TAU || nonZeroBetween;
    const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);
    return betweenAngles && withinRadius;
  }
  getCenterPoint(useFinalPosition) {
    const {
      x: x2,
      y: y2,
      startAngle,
      endAngle,
      innerRadius,
      outerRadius
    } = this.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"], useFinalPosition);
    const {
      offset,
      spacing
    } = this.options;
    const halfAngle = (startAngle + endAngle) / 2;
    const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
    return {
      x: x2 + Math.cos(halfAngle) * halfRadius,
      y: y2 + Math.sin(halfAngle) * halfRadius
    };
  }
  tooltipPosition(useFinalPosition) {
    return this.getCenterPoint(useFinalPosition);
  }
  draw(ctx) {
    const {
      options: options2,
      circumference
    } = this;
    const offset = (options2.offset || 0) / 4;
    const spacing = (options2.spacing || 0) / 2;
    const circular = options2.circular;
    this.pixelMargin = options2.borderAlign === "inner" ? 0.33 : 0;
    this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;
    if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
      return;
    }
    ctx.save();
    const halfAngle = (this.startAngle + this.endAngle) / 2;
    ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
    const fix = 1 - Math.sin(Math.min(PI, circumference || 0));
    const radiusOffset = offset * fix;
    ctx.fillStyle = options2.backgroundColor;
    ctx.strokeStyle = options2.borderColor;
    drawArc(ctx, this, radiusOffset, spacing, circular);
    drawBorder(ctx, this, radiusOffset, spacing, circular);
    ctx.restore();
  }
}
function setStyle(ctx, options2, style = options2) {
  ctx.lineCap = valueOrDefault(style.borderCapStyle, options2.borderCapStyle);
  ctx.setLineDash(valueOrDefault(style.borderDash, options2.borderDash));
  ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options2.borderDashOffset);
  ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options2.borderJoinStyle);
  ctx.lineWidth = valueOrDefault(style.borderWidth, options2.borderWidth);
  ctx.strokeStyle = valueOrDefault(style.borderColor, options2.borderColor);
}
function lineTo(ctx, previous, target) {
  ctx.lineTo(target.x, target.y);
}
function getLineMethod(options2) {
  if (options2.stepped) {
    return _steppedLineTo;
  }
  if (options2.tension || options2.cubicInterpolationMode === "monotone") {
    return _bezierCurveTo;
  }
  return lineTo;
}
function pathVars(points, segment, params = {}) {
  const count = points.length;
  const {
    start: paramsStart = 0,
    end: paramsEnd = count - 1
  } = params;
  const {
    start: segmentStart,
    end: segmentEnd
  } = segment;
  const start = Math.max(paramsStart, segmentStart);
  const end = Math.min(paramsEnd, segmentEnd);
  const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
  return {
    count,
    start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}
function pathSegment(ctx, line, segment, params) {
  const {
    points,
    options: options2
  } = line;
  const {
    count,
    start,
    loop,
    ilen
  } = pathVars(points, segment, params);
  const lineMethod = getLineMethod(options2);
  let {
    move = true,
    reverse
  } = params || {};
  let i2, point, prev;
  for (i2 = 0; i2 <= ilen; ++i2) {
    point = points[(start + (reverse ? ilen - i2 : i2)) % count];
    if (point.skip) {
      continue;
    } else if (move) {
      ctx.moveTo(point.x, point.y);
      move = false;
    } else {
      lineMethod(ctx, prev, point, reverse, options2.stepped);
    }
    prev = point;
  }
  if (loop) {
    point = points[(start + (reverse ? ilen : 0)) % count];
    lineMethod(ctx, prev, point, reverse, options2.stepped);
  }
  return !!loop;
}
function fastPathSegment(ctx, line, segment, params) {
  const points = line.points;
  const {
    count,
    start,
    ilen
  } = pathVars(points, segment, params);
  const {
    move = true,
    reverse
  } = params || {};
  let avgX = 0;
  let countX = 0;
  let i2, point, prevX, minY, maxY, lastY;
  const pointIndex = (index2) => (start + (reverse ? ilen - index2 : index2)) % count;
  const drawX = () => {
    if (minY !== maxY) {
      ctx.lineTo(avgX, maxY);
      ctx.lineTo(avgX, minY);
      ctx.lineTo(avgX, lastY);
    }
  };
  if (move) {
    point = points[pointIndex(0)];
    ctx.moveTo(point.x, point.y);
  }
  for (i2 = 0; i2 <= ilen; ++i2) {
    point = points[pointIndex(i2)];
    if (point.skip) {
      continue;
    }
    const x2 = point.x;
    const y2 = point.y;
    const truncX = x2 | 0;
    if (truncX === prevX) {
      if (y2 < minY) {
        minY = y2;
      } else if (y2 > maxY) {
        maxY = y2;
      }
      avgX = (countX * avgX + x2) / ++countX;
    } else {
      drawX();
      ctx.lineTo(x2, y2);
      prevX = truncX;
      countX = 0;
      minY = maxY = y2;
    }
    lastY = y2;
  }
  drawX();
}
function _getSegmentMethod(line) {
  const opts = line.options;
  const borderDash = opts.borderDash && opts.borderDash.length;
  const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== "monotone" && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}
function _getInterpolationMethod(options2) {
  if (options2.stepped) {
    return _steppedInterpolation;
  }
  if (options2.tension || options2.cubicInterpolationMode === "monotone") {
    return _bezierInterpolation;
  }
  return _pointInLine;
}
function strokePathWithCache(ctx, line, start, count) {
  let path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}
function strokePathDirect(ctx, line, start, count) {
  const {
    segments,
    options: options2
  } = line;
  const segmentMethod = _getSegmentMethod(line);
  for (const segment of segments) {
    setStyle(ctx, options2, segment.style);
    ctx.beginPath();
    if (segmentMethod(ctx, line, segment, {
      start,
      end: start + count - 1
    })) {
      ctx.closePath();
    }
    ctx.stroke();
  }
}
const usePath2D = typeof Path2D === "function";
function draw(ctx, line, start, count) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}
class LineElement extends Element {
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: true,
    cubicInterpolationMode: "default",
    fill: false,
    spanGaps: false,
    stepped: false,
    tension: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== "borderDash" && name !== "fill"
  };
  constructor(cfg) {
    super();
    this.animated = true;
    this.options = void 0;
    this._chart = void 0;
    this._loop = void 0;
    this._fullLoop = void 0;
    this._path = void 0;
    this._points = void 0;
    this._segments = void 0;
    this._decimated = false;
    this._pointsUpdated = false;
    this._datasetIndex = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  updateControlPoints(chartArea, indexAxis) {
    const options2 = this.options;
    if ((options2.tension || options2.cubicInterpolationMode === "monotone") && !options2.stepped && !this._pointsUpdated) {
      const loop = options2.spanGaps ? this._loop : this._fullLoop;
      _updateBezierControlPoints(this._points, options2, chartArea, loop, indexAxis);
      this._pointsUpdated = true;
    }
  }
  set points(points) {
    this._points = points;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = _computeSegments(this, this.options.segment));
  }
  first() {
    const segments = this.segments;
    const points = this.points;
    return segments.length && points[segments[0].start];
  }
  last() {
    const segments = this.segments;
    const points = this.points;
    const count = segments.length;
    return count && points[segments[count - 1].end];
  }
  interpolate(point, property) {
    const options2 = this.options;
    const value = point[property];
    const points = this.points;
    const segments = _boundSegments(this, {
      property,
      start: value,
      end: value
    });
    if (!segments.length) {
      return;
    }
    const result = [];
    const _interpolate = _getInterpolationMethod(options2);
    let i2, ilen;
    for (i2 = 0, ilen = segments.length; i2 < ilen; ++i2) {
      const {
        start,
        end
      } = segments[i2];
      const p1 = points[start];
      const p2 = points[end];
      if (p1 === p2) {
        result.push(p1);
        continue;
      }
      const t2 = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
      const interpolated = _interpolate(p1, p2, t2, options2.stepped);
      interpolated[property] = point[property];
      result.push(interpolated);
    }
    return result.length === 1 ? result[0] : result;
  }
  pathSegment(ctx, segment, params) {
    const segmentMethod = _getSegmentMethod(this);
    return segmentMethod(ctx, this, segment, params);
  }
  path(ctx, start, count) {
    const segments = this.segments;
    const segmentMethod = _getSegmentMethod(this);
    let loop = this._loop;
    start = start || 0;
    count = count || this.points.length - start;
    for (const segment of segments) {
      loop &= segmentMethod(ctx, this, segment, {
        start,
        end: start + count - 1
      });
    }
    return !!loop;
  }
  draw(ctx, chartArea, start, count) {
    const options2 = this.options || {};
    const points = this.points || [];
    if (points.length && options2.borderWidth) {
      ctx.save();
      draw(ctx, this, start, count);
      ctx.restore();
    }
    if (this.animated) {
      this._pointsUpdated = false;
      this._path = void 0;
    }
  }
}
function inRange$1(el, pos, axis, useFinalPosition) {
  const options2 = el.options;
  const {
    [axis]: value
  } = el.getProps([axis], useFinalPosition);
  return Math.abs(pos - value) < options2.radius + options2.hitRadius;
}
class PointElement extends Element {
  static id = "point";
  parsed;
  skip;
  stop;
  /**
  * @type {any}
  */
  static defaults = {
    borderWidth: 1,
    hitRadius: 1,
    hoverBorderWidth: 1,
    hoverRadius: 4,
    pointStyle: "circle",
    radius: 3,
    rotation: 0
  };
  /**
  * @type {any}
  */
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(cfg) {
    super();
    this.options = void 0;
    this.parsed = void 0;
    this.skip = void 0;
    this.stop = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    const options2 = this.options;
    const {
      x: x2,
      y: y2
    } = this.getProps(["x", "y"], useFinalPosition);
    return Math.pow(mouseX - x2, 2) + Math.pow(mouseY - y2, 2) < Math.pow(options2.hitRadius + options2.radius, 2);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange$1(this, mouseX, "x", useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange$1(this, mouseY, "y", useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const {
      x: x2,
      y: y2
    } = this.getProps(["x", "y"], useFinalPosition);
    return {
      x: x2,
      y: y2
    };
  }
  size(options2) {
    options2 = options2 || this.options || {};
    let radius = options2.radius || 0;
    radius = Math.max(radius, radius && options2.hoverRadius || 0);
    const borderWidth = radius && options2.borderWidth || 0;
    return (radius + borderWidth) * 2;
  }
  draw(ctx, area) {
    const options2 = this.options;
    if (this.skip || options2.radius < 0.1 || !_isPointInArea(this, area, this.size(options2) / 2)) {
      return;
    }
    ctx.strokeStyle = options2.borderColor;
    ctx.lineWidth = options2.borderWidth;
    ctx.fillStyle = options2.backgroundColor;
    drawPoint(ctx, options2, this.x, this.y);
  }
  getRange() {
    const options2 = this.options || {};
    return options2.radius + options2.hitRadius;
  }
}
function getBarBounds(bar, useFinalPosition) {
  const {
    x: x2,
    y: y2,
    base,
    width,
    height
  } = bar.getProps(["x", "y", "base", "width", "height"], useFinalPosition);
  let left, right, top, bottom, half;
  if (bar.horizontal) {
    half = height / 2;
    left = Math.min(x2, base);
    right = Math.max(x2, base);
    top = y2 - half;
    bottom = y2 + half;
  } else {
    half = width / 2;
    left = x2 - half;
    right = x2 + half;
    top = Math.min(y2, base);
    bottom = Math.max(y2, base);
  }
  return {
    left,
    top,
    right,
    bottom
  };
}
function skipOrLimit(skip2, value, min, max) {
  return skip2 ? 0 : _limitValue(value, min, max);
}
function parseBorderWidth(bar, maxW, maxH) {
  const value = bar.options.borderWidth;
  const skip2 = bar.borderSkipped;
  const o2 = toTRBL(value);
  return {
    t: skipOrLimit(skip2.top, o2.top, 0, maxH),
    r: skipOrLimit(skip2.right, o2.right, 0, maxW),
    b: skipOrLimit(skip2.bottom, o2.bottom, 0, maxH),
    l: skipOrLimit(skip2.left, o2.left, 0, maxW)
  };
}
function parseBorderRadius(bar, maxW, maxH) {
  const {
    enableBorderRadius
  } = bar.getProps(["enableBorderRadius"]);
  const value = bar.options.borderRadius;
  const o2 = toTRBLCorners(value);
  const maxR = Math.min(maxW, maxH);
  const skip2 = bar.borderSkipped;
  const enableBorder = enableBorderRadius || isObject(value);
  return {
    topLeft: skipOrLimit(!enableBorder || skip2.top || skip2.left, o2.topLeft, 0, maxR),
    topRight: skipOrLimit(!enableBorder || skip2.top || skip2.right, o2.topRight, 0, maxR),
    bottomLeft: skipOrLimit(!enableBorder || skip2.bottom || skip2.left, o2.bottomLeft, 0, maxR),
    bottomRight: skipOrLimit(!enableBorder || skip2.bottom || skip2.right, o2.bottomRight, 0, maxR)
  };
}
function boundingRects(bar) {
  const bounds = getBarBounds(bar);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(bar, width / 2, height / 2);
  const radius = parseBorderRadius(bar, width / 2, height / 2);
  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
      }
    }
  };
}
function inRange(bar, x2, y2, useFinalPosition) {
  const skipX = x2 === null;
  const skipY = y2 === null;
  const skipBoth = skipX && skipY;
  const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
  return bounds && (skipX || _isBetween(x2, bounds.left, bounds.right)) && (skipY || _isBetween(y2, bounds.top, bounds.bottom));
}
function hasRadius(radius) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}
function addNormalRectPath(ctx, rect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
function inflateRect(rect, amount, refRect = {}) {
  const x2 = rect.x !== refRect.x ? -amount : 0;
  const y2 = rect.y !== refRect.y ? -amount : 0;
  const w2 = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x2;
  const h3 = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y2;
  return {
    x: rect.x + x2,
    y: rect.y + y2,
    w: rect.w + w2,
    h: rect.h + h3,
    radius: rect.radius
  };
}
class BarElement extends Element {
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: void 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(cfg) {
    super();
    this.options = void 0;
    this.horizontal = void 0;
    this.base = void 0;
    this.width = void 0;
    this.height = void 0;
    this.inflateAmount = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  draw(ctx) {
    const {
      inflateAmount,
      options: {
        borderColor,
        backgroundColor
      }
    } = this;
    const {
      inner,
      outer
    } = boundingRects(this);
    const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
    ctx.save();
    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
      ctx.clip();
      addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
      ctx.fillStyle = borderColor;
      ctx.fill("evenodd");
    }
    ctx.beginPath();
    addRectPath(ctx, inflateRect(inner, inflateAmount));
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.restore();
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    return inRange(this, mouseX, mouseY, useFinalPosition);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange(this, mouseX, null, useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange(this, null, mouseY, useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const {
      x: x2,
      y: y2,
      base,
      horizontal
    } = this.getProps(["x", "y", "base", "horizontal"], useFinalPosition);
    return {
      x: horizontal ? (x2 + base) / 2 : x2,
      y: horizontal ? y2 : (y2 + base) / 2
    };
  }
  getRange(axis) {
    return axis === "x" ? this.width / 2 : this.height / 2;
  }
}
var elements = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcElement,
  BarElement,
  LineElement,
  PointElement
});
const BORDER_COLORS = [
  "rgb(54, 162, 235)",
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)"
  // grey
];
const BACKGROUND_COLORS = /* @__PURE__ */ BORDER_COLORS.map((color2) => color2.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function getBorderColor(i2) {
  return BORDER_COLORS[i2 % BORDER_COLORS.length];
}
function getBackgroundColor(i2) {
  return BACKGROUND_COLORS[i2 % BACKGROUND_COLORS.length];
}
function colorizeDefaultDataset(dataset, i2) {
  dataset.borderColor = getBorderColor(i2);
  dataset.backgroundColor = getBackgroundColor(i2);
  return ++i2;
}
function colorizeDoughnutDataset(dataset, i2) {
  dataset.backgroundColor = dataset.data.map(() => getBorderColor(i2++));
  return i2;
}
function colorizePolarAreaDataset(dataset, i2) {
  dataset.backgroundColor = dataset.data.map(() => getBackgroundColor(i2++));
  return i2;
}
function getColorizer(chart) {
  let i2 = 0;
  return (dataset, datasetIndex) => {
    const controller = chart.getDatasetMeta(datasetIndex).controller;
    if (controller instanceof DoughnutController) {
      i2 = colorizeDoughnutDataset(dataset, i2);
    } else if (controller instanceof PolarAreaController) {
      i2 = colorizePolarAreaDataset(dataset, i2);
    } else if (controller) {
      i2 = colorizeDefaultDataset(dataset, i2);
    }
  };
}
function containsColorsDefinitions(descriptors2) {
  let k2;
  for (k2 in descriptors2) {
    if (descriptors2[k2].borderColor || descriptors2[k2].backgroundColor) {
      return true;
    }
  }
  return false;
}
function containsColorsDefinition(descriptor) {
  return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
}
function containsDefaultColorsDefenitions() {
  return defaults.borderColor !== "rgba(0,0,0,0.1)" || defaults.backgroundColor !== "rgba(0,0,0,0.1)";
}
var plugin_colors = {
  id: "colors",
  defaults: {
    enabled: true,
    forceOverride: false
  },
  beforeLayout(chart, _args, options2) {
    if (!options2.enabled) {
      return;
    }
    const {
      data: {
        datasets
      },
      options: chartOptions
    } = chart.config;
    const {
      elements: elements2
    } = chartOptions;
    const containsColorDefenition = containsColorsDefinitions(datasets) || containsColorsDefinition(chartOptions) || elements2 && containsColorsDefinitions(elements2) || containsDefaultColorsDefenitions();
    if (!options2.forceOverride && containsColorDefenition) {
      return;
    }
    const colorizer = getColorizer(chart);
    datasets.forEach(colorizer);
  }
};
function lttbDecimation(data, start, count, availableWidth, options2) {
  const samples = options2.samples || availableWidth;
  if (samples >= count) {
    return data.slice(start, start + count);
  }
  const decimated = [];
  const bucketWidth = (count - 2) / (samples - 2);
  let sampledIndex = 0;
  const endIndex = start + count - 1;
  let a2 = start;
  let i2, maxAreaPoint, maxArea, area, nextA;
  decimated[sampledIndex++] = data[a2];
  for (i2 = 0; i2 < samples - 2; i2++) {
    let avgX = 0;
    let avgY = 0;
    let j2;
    const avgRangeStart = Math.floor((i2 + 1) * bucketWidth) + 1 + start;
    const avgRangeEnd = Math.min(Math.floor((i2 + 2) * bucketWidth) + 1, count) + start;
    const avgRangeLength = avgRangeEnd - avgRangeStart;
    for (j2 = avgRangeStart; j2 < avgRangeEnd; j2++) {
      avgX += data[j2].x;
      avgY += data[j2].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    const rangeOffs = Math.floor(i2 * bucketWidth) + 1 + start;
    const rangeTo = Math.min(Math.floor((i2 + 1) * bucketWidth) + 1, count) + start;
    const {
      x: pointAx,
      y: pointAy
    } = data[a2];
    maxArea = area = -1;
    for (j2 = rangeOffs; j2 < rangeTo; j2++) {
      area = 0.5 * Math.abs((pointAx - avgX) * (data[j2].y - pointAy) - (pointAx - data[j2].x) * (avgY - pointAy));
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j2];
        nextA = j2;
      }
    }
    decimated[sampledIndex++] = maxAreaPoint;
    a2 = nextA;
  }
  decimated[sampledIndex++] = data[endIndex];
  return decimated;
}
function minMaxDecimation(data, start, count, availableWidth) {
  let avgX = 0;
  let countX = 0;
  let i2, point, x2, y2, prevX, minIndex, maxIndex, startIndex, minY, maxY;
  const decimated = [];
  const endIndex = start + count - 1;
  const xMin = data[start].x;
  const xMax = data[endIndex].x;
  const dx = xMax - xMin;
  for (i2 = start; i2 < start + count; ++i2) {
    point = data[i2];
    x2 = (point.x - xMin) / dx * availableWidth;
    y2 = point.y;
    const truncX = x2 | 0;
    if (truncX === prevX) {
      if (y2 < minY) {
        minY = y2;
        minIndex = i2;
      } else if (y2 > maxY) {
        maxY = y2;
        maxIndex = i2;
      }
      avgX = (countX * avgX + point.x) / ++countX;
    } else {
      const lastIndex = i2 - 1;
      if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
        const intermediateIndex1 = Math.min(minIndex, maxIndex);
        const intermediateIndex2 = Math.max(minIndex, maxIndex);
        if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex1],
            x: avgX
          });
        }
        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex2],
            x: avgX
          });
        }
      }
      if (i2 > 0 && lastIndex !== startIndex) {
        decimated.push(data[lastIndex]);
      }
      decimated.push(point);
      prevX = truncX;
      countX = 0;
      minY = maxY = y2;
      minIndex = maxIndex = startIndex = i2;
    }
  }
  return decimated;
}
function cleanDecimatedDataset(dataset) {
  if (dataset._decimated) {
    const data = dataset._data;
    delete dataset._decimated;
    delete dataset._data;
    Object.defineProperty(dataset, "data", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: data
    });
  }
}
function cleanDecimatedData(chart) {
  chart.data.datasets.forEach((dataset) => {
    cleanDecimatedDataset(dataset);
  });
}
function getStartAndCountOfVisiblePointsSimplified(meta, points) {
  const pointCount = points.length;
  let start = 0;
  let count;
  const {
    iScale
  } = meta;
  const {
    min,
    max,
    minDefined,
    maxDefined
  } = iScale.getUserBounds();
  if (minDefined) {
    start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
  }
  if (maxDefined) {
    count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
  } else {
    count = pointCount - start;
  }
  return {
    start,
    count
  };
}
var plugin_decimation = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: false
  },
  beforeElementsUpdate: (chart, args, options2) => {
    if (!options2.enabled) {
      cleanDecimatedData(chart);
      return;
    }
    const availableWidth = chart.width;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const {
        _data,
        indexAxis
      } = dataset;
      const meta = chart.getDatasetMeta(datasetIndex);
      const data = _data || dataset.data;
      if (resolve([indexAxis, chart.options.indexAxis]) === "y") {
        return;
      }
      if (!meta.controller.supportsDecimation) {
        return;
      }
      const xAxis = chart.scales[meta.xAxisID];
      if (xAxis.type !== "linear" && xAxis.type !== "time") {
        return;
      }
      if (chart.options.parsing) {
        return;
      }
      let {
        start,
        count
      } = getStartAndCountOfVisiblePointsSimplified(meta, data);
      const threshold = options2.threshold || 4 * availableWidth;
      if (count <= threshold) {
        cleanDecimatedDataset(dataset);
        return;
      }
      if (isNullOrUndef(_data)) {
        dataset._data = data;
        delete dataset.data;
        Object.defineProperty(dataset, "data", {
          configurable: true,
          enumerable: true,
          get: function() {
            return this._decimated;
          },
          set: function(d2) {
            this._data = d2;
          }
        });
      }
      let decimated;
      switch (options2.algorithm) {
        case "lttb":
          decimated = lttbDecimation(data, start, count, availableWidth, options2);
          break;
        case "min-max":
          decimated = minMaxDecimation(data, start, count, availableWidth);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${options2.algorithm}'`);
      }
      dataset._decimated = decimated;
    });
  },
  destroy(chart) {
    cleanDecimatedData(chart);
  }
};
function _segments(line, target, property) {
  const segments = line.segments;
  const points = line.points;
  const tpoints = target.points;
  const parts = [];
  for (const segment of segments) {
    let {
      start,
      end
    } = segment;
    end = _findSegmentEnd(start, end, points);
    const bounds = _getBounds(property, points[start], points[end], segment.loop);
    if (!target.segments) {
      parts.push({
        source: segment,
        target: bounds,
        start: points[start],
        end: points[end]
      });
      continue;
    }
    const targetSegments = _boundSegments(target, bounds);
    for (const tgt of targetSegments) {
      const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
      const fillSources = _boundSegment(segment, points, subBounds);
      for (const fillSource of fillSources) {
        parts.push({
          source: fillSource,
          target: tgt,
          start: {
            [property]: _getEdge(bounds, subBounds, "start", Math.max)
          },
          end: {
            [property]: _getEdge(bounds, subBounds, "end", Math.min)
          }
        });
      }
    }
  }
  return parts;
}
function _getBounds(property, first, last, loop) {
  if (loop) {
    return;
  }
  let start = first[property];
  let end = last[property];
  if (property === "angle") {
    start = _normalizeAngle(start);
    end = _normalizeAngle(end);
  }
  return {
    property,
    start,
    end
  };
}
function _pointsFromSegments(boundary, line) {
  const {
    x: x2 = null,
    y: y2 = null
  } = boundary || {};
  const linePoints = line.points;
  const points = [];
  line.segments.forEach(({
    start,
    end
  }) => {
    end = _findSegmentEnd(start, end, linePoints);
    const first = linePoints[start];
    const last = linePoints[end];
    if (y2 !== null) {
      points.push({
        x: first.x,
        y: y2
      });
      points.push({
        x: last.x,
        y: y2
      });
    } else if (x2 !== null) {
      points.push({
        x: x2,
        y: first.y
      });
      points.push({
        x: x2,
        y: last.y
      });
    }
  });
  return points;
}
function _findSegmentEnd(start, end, points) {
  for (; end > start; end--) {
    const point = points[end];
    if (!isNaN(point.x) && !isNaN(point.y)) {
      break;
    }
  }
  return end;
}
function _getEdge(a2, b2, prop, fn) {
  if (a2 && b2) {
    return fn(a2[prop], b2[prop]);
  }
  return a2 ? a2[prop] : b2 ? b2[prop] : 0;
}
function _createBoundaryLine(boundary, line) {
  let points = [];
  let _loop = false;
  if (isArray(boundary)) {
    _loop = true;
    points = boundary;
  } else {
    points = _pointsFromSegments(boundary, line);
  }
  return points.length ? new LineElement({
    points,
    options: {
      tension: 0
    },
    _loop,
    _fullLoop: _loop
  }) : null;
}
function _shouldApplyFill(source) {
  return source && source.fill !== false;
}
function _resolveTarget(sources, index2, propagate) {
  const source = sources[index2];
  let fill2 = source.fill;
  const visited = [index2];
  let target;
  if (!propagate) {
    return fill2;
  }
  while (fill2 !== false && visited.indexOf(fill2) === -1) {
    if (!isNumberFinite(fill2)) {
      return fill2;
    }
    target = sources[fill2];
    if (!target) {
      return false;
    }
    if (target.visible) {
      return fill2;
    }
    visited.push(fill2);
    fill2 = target.fill;
  }
  return false;
}
function _decodeFill(line, index2, count) {
  const fill2 = parseFillOption(line);
  if (isObject(fill2)) {
    return isNaN(fill2.value) ? false : fill2;
  }
  let target = parseFloat(fill2);
  if (isNumberFinite(target) && Math.floor(target) === target) {
    return decodeTargetIndex(fill2[0], index2, target, count);
  }
  return ["origin", "start", "end", "stack", "shape"].indexOf(fill2) >= 0 && fill2;
}
function decodeTargetIndex(firstCh, index2, target, count) {
  if (firstCh === "-" || firstCh === "+") {
    target = index2 + target;
  }
  if (target === index2 || target < 0 || target >= count) {
    return false;
  }
  return target;
}
function _getTargetPixel(fill2, scale) {
  let pixel = null;
  if (fill2 === "start") {
    pixel = scale.bottom;
  } else if (fill2 === "end") {
    pixel = scale.top;
  } else if (isObject(fill2)) {
    pixel = scale.getPixelForValue(fill2.value);
  } else if (scale.getBasePixel) {
    pixel = scale.getBasePixel();
  }
  return pixel;
}
function _getTargetValue(fill2, scale, startValue) {
  let value;
  if (fill2 === "start") {
    value = startValue;
  } else if (fill2 === "end") {
    value = scale.options.reverse ? scale.min : scale.max;
  } else if (isObject(fill2)) {
    value = fill2.value;
  } else {
    value = scale.getBaseValue();
  }
  return value;
}
function parseFillOption(line) {
  const options2 = line.options;
  const fillOption = options2.fill;
  let fill2 = valueOrDefault(fillOption && fillOption.target, fillOption);
  if (fill2 === void 0) {
    fill2 = !!options2.backgroundColor;
  }
  if (fill2 === false || fill2 === null) {
    return false;
  }
  if (fill2 === true) {
    return "origin";
  }
  return fill2;
}
function _buildStackLine(source) {
  const {
    scale,
    index: index2,
    line
  } = source;
  const points = [];
  const segments = line.segments;
  const sourcePoints = line.points;
  const linesBelow = getLinesBelow(scale, index2);
  linesBelow.push(_createBoundaryLine({
    x: null,
    y: scale.bottom
  }, line));
  for (let i2 = 0; i2 < segments.length; i2++) {
    const segment = segments[i2];
    for (let j2 = segment.start; j2 <= segment.end; j2++) {
      addPointsBelow(points, sourcePoints[j2], linesBelow);
    }
  }
  return new LineElement({
    points,
    options: {}
  });
}
function getLinesBelow(scale, index2) {
  const below = [];
  const metas = scale.getMatchingVisibleMetas("line");
  for (let i2 = 0; i2 < metas.length; i2++) {
    const meta = metas[i2];
    if (meta.index === index2) {
      break;
    }
    if (!meta.hidden) {
      below.unshift(meta.dataset);
    }
  }
  return below;
}
function addPointsBelow(points, sourcePoint, linesBelow) {
  const postponed = [];
  for (let j2 = 0; j2 < linesBelow.length; j2++) {
    const line = linesBelow[j2];
    const {
      first,
      last,
      point
    } = findPoint(line, sourcePoint, "x");
    if (!point || first && last) {
      continue;
    }
    if (first) {
      postponed.unshift(point);
    } else {
      points.push(point);
      if (!last) {
        break;
      }
    }
  }
  points.push(...postponed);
}
function findPoint(line, sourcePoint, property) {
  const point = line.interpolate(sourcePoint, property);
  if (!point) {
    return {};
  }
  const pointValue = point[property];
  const segments = line.segments;
  const linePoints = line.points;
  let first = false;
  let last = false;
  for (let i2 = 0; i2 < segments.length; i2++) {
    const segment = segments[i2];
    const firstValue = linePoints[segment.start][property];
    const lastValue = linePoints[segment.end][property];
    if (_isBetween(pointValue, firstValue, lastValue)) {
      first = pointValue === firstValue;
      last = pointValue === lastValue;
      break;
    }
  }
  return {
    first,
    last,
    point
  };
}
class simpleArc {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.radius = opts.radius;
  }
  pathSegment(ctx, bounds, opts) {
    const {
      x: x2,
      y: y2,
      radius
    } = this;
    bounds = bounds || {
      start: 0,
      end: TAU
    };
    ctx.arc(x2, y2, radius, bounds.end, bounds.start, true);
    return !opts.bounds;
  }
  interpolate(point) {
    const {
      x: x2,
      y: y2,
      radius
    } = this;
    const angle = point.angle;
    return {
      x: x2 + Math.cos(angle) * radius,
      y: y2 + Math.sin(angle) * radius,
      angle
    };
  }
}
function _getTarget(source) {
  const {
    chart,
    fill: fill2,
    line
  } = source;
  if (isNumberFinite(fill2)) {
    return getLineByIndex(chart, fill2);
  }
  if (fill2 === "stack") {
    return _buildStackLine(source);
  }
  if (fill2 === "shape") {
    return true;
  }
  const boundary = computeBoundary(source);
  if (boundary instanceof simpleArc) {
    return boundary;
  }
  return _createBoundaryLine(boundary, line);
}
function getLineByIndex(chart, index2) {
  const meta = chart.getDatasetMeta(index2);
  const visible = meta && chart.isDatasetVisible(index2);
  return visible ? meta.dataset : null;
}
function computeBoundary(source) {
  const scale = source.scale || {};
  if (scale.getPointPositionForValue) {
    return computeCircularBoundary(source);
  }
  return computeLinearBoundary(source);
}
function computeLinearBoundary(source) {
  const {
    scale = {},
    fill: fill2
  } = source;
  const pixel = _getTargetPixel(fill2, scale);
  if (isNumberFinite(pixel)) {
    const horizontal = scale.isHorizontal();
    return {
      x: horizontal ? pixel : null,
      y: horizontal ? null : pixel
    };
  }
  return null;
}
function computeCircularBoundary(source) {
  const {
    scale,
    fill: fill2
  } = source;
  const options2 = scale.options;
  const length = scale.getLabels().length;
  const start = options2.reverse ? scale.max : scale.min;
  const value = _getTargetValue(fill2, scale, start);
  const target = [];
  if (options2.grid.circular) {
    const center = scale.getPointPositionForValue(0, start);
    return new simpleArc({
      x: center.x,
      y: center.y,
      radius: scale.getDistanceFromCenterForValue(value)
    });
  }
  for (let i2 = 0; i2 < length; ++i2) {
    target.push(scale.getPointPositionForValue(i2, value));
  }
  return target;
}
function _drawfill(ctx, source, area) {
  const target = _getTarget(source);
  const {
    chart,
    index: index2,
    line,
    scale,
    axis
  } = source;
  const lineOpts = line.options;
  const fillOption = lineOpts.fill;
  const color2 = lineOpts.backgroundColor;
  const {
    above = color2,
    below = color2
  } = fillOption || {};
  const meta = chart.getDatasetMeta(index2);
  const clip = getDatasetClipArea(chart, meta);
  if (target && line.points.length) {
    clipArea(ctx, clipToIndexBounds(area, meta.iScale));
    doFill(ctx, {
      line,
      target,
      above,
      below,
      area,
      scale,
      axis,
      clip
    });
    unclipArea(ctx);
  }
}
function clipToIndexBounds(area, iScale) {
  if (!iScale || iScale.getPointPositionForValue) {
    return area;
  }
  const p1 = iScale.getPixelForValue(iScale.min);
  const p2 = iScale.getPixelForValue(iScale.max);
  const lo = Math.min(p1, p2);
  const hi = Math.max(p1, p2);
  return iScale.isHorizontal() ? {
    ...area,
    left: Math.max(area.left, lo),
    right: Math.min(area.right, hi)
  } : {
    ...area,
    top: Math.max(area.top, lo),
    bottom: Math.min(area.bottom, hi)
  };
}
function doFill(ctx, cfg) {
  const {
    line,
    target,
    above,
    below,
    area,
    scale,
    clip
  } = cfg;
  const property = line._loop ? "angle" : cfg.axis;
  ctx.save();
  let fillColor = below;
  if (below !== above) {
    if (property === "x") {
      clipVertical(ctx, target, area.top);
      fill(ctx, {
        line,
        target,
        color: above,
        scale,
        property,
        clip
      });
      ctx.restore();
      ctx.save();
      clipVertical(ctx, target, area.bottom);
    } else if (property === "y") {
      clipHorizontal(ctx, target, area.left);
      fill(ctx, {
        line,
        target,
        color: below,
        scale,
        property,
        clip
      });
      ctx.restore();
      ctx.save();
      clipHorizontal(ctx, target, area.right);
      fillColor = above;
    }
  }
  fill(ctx, {
    line,
    target,
    color: fillColor,
    scale,
    property,
    clip
  });
  ctx.restore();
}
function clipVertical(ctx, target, clipY) {
  const {
    segments,
    points
  } = target;
  let first = true;
  let lineLoop = false;
  ctx.beginPath();
  for (const segment of segments) {
    const {
      start,
      end
    } = segment;
    const firstPoint = points[start];
    const lastPoint = points[_findSegmentEnd(start, end, points)];
    if (first) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      first = false;
    } else {
      ctx.lineTo(firstPoint.x, clipY);
      ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    lineLoop = !!target.pathSegment(ctx, segment, {
      move: lineLoop
    });
    if (lineLoop) {
      ctx.closePath();
    } else {
      ctx.lineTo(lastPoint.x, clipY);
    }
  }
  ctx.lineTo(target.first().x, clipY);
  ctx.closePath();
  ctx.clip();
}
function clipHorizontal(ctx, target, clipX) {
  const {
    segments,
    points
  } = target;
  let first = true;
  let lineLoop = false;
  ctx.beginPath();
  for (const segment of segments) {
    const {
      start,
      end
    } = segment;
    const firstPoint = points[start];
    const lastPoint = points[_findSegmentEnd(start, end, points)];
    if (first) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      first = false;
    } else {
      ctx.lineTo(clipX, firstPoint.y);
      ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    lineLoop = !!target.pathSegment(ctx, segment, {
      move: lineLoop
    });
    if (lineLoop) {
      ctx.closePath();
    } else {
      ctx.lineTo(clipX, lastPoint.y);
    }
  }
  ctx.lineTo(clipX, target.first().y);
  ctx.closePath();
  ctx.clip();
}
function fill(ctx, cfg) {
  const {
    line,
    target,
    property,
    color: color2,
    scale,
    clip
  } = cfg;
  const segments = _segments(line, target, property);
  for (const {
    source: src,
    target: tgt,
    start,
    end
  } of segments) {
    const {
      style: {
        backgroundColor = color2
      } = {}
    } = src;
    const notShape = target !== true;
    ctx.save();
    ctx.fillStyle = backgroundColor;
    clipBounds(ctx, scale, clip, notShape && _getBounds(property, start, end));
    ctx.beginPath();
    const lineLoop = !!line.pathSegment(ctx, src);
    let loop;
    if (notShape) {
      if (lineLoop) {
        ctx.closePath();
      } else {
        interpolatedLineTo(ctx, target, end, property);
      }
      const targetLoop = !!target.pathSegment(ctx, tgt, {
        move: lineLoop,
        reverse: true
      });
      loop = lineLoop && targetLoop;
      if (!loop) {
        interpolatedLineTo(ctx, target, start, property);
      }
    }
    ctx.closePath();
    ctx.fill(loop ? "evenodd" : "nonzero");
    ctx.restore();
  }
}
function clipBounds(ctx, scale, clip, bounds) {
  const chartArea = scale.chart.chartArea;
  const {
    property,
    start,
    end
  } = bounds || {};
  if (property === "x" || property === "y") {
    let left, top, right, bottom;
    if (property === "x") {
      left = start;
      top = chartArea.top;
      right = end;
      bottom = chartArea.bottom;
    } else {
      left = chartArea.left;
      top = start;
      right = chartArea.right;
      bottom = end;
    }
    ctx.beginPath();
    if (clip) {
      left = Math.max(left, clip.left);
      right = Math.min(right, clip.right);
      top = Math.max(top, clip.top);
      bottom = Math.min(bottom, clip.bottom);
    }
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();
  }
}
function interpolatedLineTo(ctx, target, point, property) {
  const interpolatedPoint = target.interpolate(point, property);
  if (interpolatedPoint) {
    ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}
var index = {
  id: "filler",
  afterDatasetsUpdate(chart, _args, options2) {
    const count = (chart.data.datasets || []).length;
    const sources = [];
    let meta, i2, line, source;
    for (i2 = 0; i2 < count; ++i2) {
      meta = chart.getDatasetMeta(i2);
      line = meta.dataset;
      source = null;
      if (line && line.options && line instanceof LineElement) {
        source = {
          visible: chart.isDatasetVisible(i2),
          index: i2,
          fill: _decodeFill(line, i2, count),
          chart,
          axis: meta.controller.options.indexAxis,
          scale: meta.vScale,
          line
        };
      }
      meta.$filler = source;
      sources.push(source);
    }
    for (i2 = 0; i2 < count; ++i2) {
      source = sources[i2];
      if (!source || source.fill === false) {
        continue;
      }
      source.fill = _resolveTarget(sources, i2, options2.propagate);
    }
  },
  beforeDraw(chart, _args, options2) {
    const draw2 = options2.drawTime === "beforeDraw";
    const metasets = chart.getSortedVisibleDatasetMetas();
    const area = chart.chartArea;
    for (let i2 = metasets.length - 1; i2 >= 0; --i2) {
      const source = metasets[i2].$filler;
      if (!source) {
        continue;
      }
      source.line.updateControlPoints(area, source.axis);
      if (draw2 && source.fill) {
        _drawfill(chart.ctx, source, area);
      }
    }
  },
  beforeDatasetsDraw(chart, _args, options2) {
    if (options2.drawTime !== "beforeDatasetsDraw") {
      return;
    }
    const metasets = chart.getSortedVisibleDatasetMetas();
    for (let i2 = metasets.length - 1; i2 >= 0; --i2) {
      const source = metasets[i2].$filler;
      if (_shouldApplyFill(source)) {
        _drawfill(chart.ctx, source, chart.chartArea);
      }
    }
  },
  beforeDatasetDraw(chart, args, options2) {
    const source = args.meta.$filler;
    if (!_shouldApplyFill(source) || options2.drawTime !== "beforeDatasetDraw") {
      return;
    }
    _drawfill(chart.ctx, source, chart.chartArea);
  },
  defaults: {
    propagate: true,
    drawTime: "beforeDatasetDraw"
  }
};
const getBoxSize = (labelOpts, fontSize) => {
  let {
    boxHeight = fontSize,
    boxWidth = fontSize
  } = labelOpts;
  if (labelOpts.usePointStyle) {
    boxHeight = Math.min(boxHeight, fontSize);
    boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
  }
  return {
    boxWidth,
    boxHeight,
    itemHeight: Math.max(fontSize, boxHeight)
  };
};
const itemsEqual = (a2, b2) => a2 !== null && b2 !== null && a2.datasetIndex === b2.datasetIndex && a2.index === b2.index;
class Legend extends Element {
  constructor(config2) {
    super();
    this._added = false;
    this.legendHitBoxes = [];
    this._hoveredItem = null;
    this.doughnutMode = false;
    this.chart = config2.chart;
    this.options = config2.options;
    this.ctx = config2.ctx;
    this.legendItems = void 0;
    this.columnSizes = void 0;
    this.lineWidths = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.height = void 0;
    this.width = void 0;
    this._margins = void 0;
    this.position = void 0;
    this.weight = void 0;
    this.fullSize = void 0;
  }
  update(maxWidth, maxHeight, margins) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins;
    this.setDimensions();
    this.buildLabels();
    this.fit();
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = this._margins.left;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = this._margins.top;
      this.bottom = this.height;
    }
  }
  buildLabels() {
    const labelOpts = this.options.labels || {};
    let legendItems = callback(labelOpts.generateLabels, [this.chart], this) || [];
    if (labelOpts.filter) {
      legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
    }
    if (labelOpts.sort) {
      legendItems = legendItems.sort((a2, b2) => labelOpts.sort(a2, b2, this.chart.data));
    }
    if (this.options.reverse) {
      legendItems.reverse();
    }
    this.legendItems = legendItems;
  }
  fit() {
    const {
      options: options2,
      ctx
    } = this;
    if (!options2.display) {
      this.width = this.height = 0;
      return;
    }
    const labelOpts = options2.labels;
    const labelFont = toFont(labelOpts.font);
    const fontSize = labelFont.size;
    const titleHeight = this._computeTitleHeight();
    const {
      boxWidth,
      itemHeight
    } = getBoxSize(labelOpts, fontSize);
    let width, height;
    ctx.font = labelFont.string;
    if (this.isHorizontal()) {
      width = this.maxWidth;
      height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
    } else {
      height = this.maxHeight;
      width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
    }
    this.width = Math.min(width, options2.maxWidth || this.maxWidth);
    this.height = Math.min(height, options2.maxHeight || this.maxHeight);
  }
  _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
    const {
      ctx,
      maxWidth,
      options: {
        labels: {
          padding
        }
      }
    } = this;
    const hitboxes = this.legendHitBoxes = [];
    const lineWidths = this.lineWidths = [0];
    const lineHeight = itemHeight + padding;
    let totalHeight = titleHeight;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let row = -1;
    let top = -lineHeight;
    this.legendItems.forEach((legendItem, i2) => {
      const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
      if (i2 === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
        totalHeight += lineHeight;
        lineWidths[lineWidths.length - (i2 > 0 ? 0 : 1)] = 0;
        top += lineHeight;
        row++;
      }
      hitboxes[i2] = {
        left: 0,
        top,
        row,
        width: itemWidth,
        height: itemHeight
      };
      lineWidths[lineWidths.length - 1] += itemWidth + padding;
    });
    return totalHeight;
  }
  _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
    const {
      ctx,
      maxHeight,
      options: {
        labels: {
          padding
        }
      }
    } = this;
    const hitboxes = this.legendHitBoxes = [];
    const columnSizes = this.columnSizes = [];
    const heightLimit = maxHeight - titleHeight;
    let totalWidth = padding;
    let currentColWidth = 0;
    let currentColHeight = 0;
    let left = 0;
    let col = 0;
    this.legendItems.forEach((legendItem, i2) => {
      const {
        itemWidth,
        itemHeight
      } = calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight);
      if (i2 > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
        totalWidth += currentColWidth + padding;
        columnSizes.push({
          width: currentColWidth,
          height: currentColHeight
        });
        left += currentColWidth + padding;
        col++;
        currentColWidth = currentColHeight = 0;
      }
      hitboxes[i2] = {
        left,
        top: currentColHeight,
        col,
        width: itemWidth,
        height: itemHeight
      };
      currentColWidth = Math.max(currentColWidth, itemWidth);
      currentColHeight += itemHeight + padding;
    });
    totalWidth += currentColWidth;
    columnSizes.push({
      width: currentColWidth,
      height: currentColHeight
    });
    return totalWidth;
  }
  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const titleHeight = this._computeTitleHeight();
    const {
      legendHitBoxes: hitboxes,
      options: {
        align,
        labels: {
          padding
        },
        rtl
      }
    } = this;
    const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
    if (this.isHorizontal()) {
      let row = 0;
      let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
      for (const hitbox of hitboxes) {
        if (row !== hitbox.row) {
          row = hitbox.row;
          left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
        }
        hitbox.top += this.top + titleHeight + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
        left += hitbox.width + padding;
      }
    } else {
      let col = 0;
      let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
      for (const hitbox of hitboxes) {
        if (hitbox.col !== col) {
          col = hitbox.col;
          top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
        }
        hitbox.top = top;
        hitbox.left += this.left + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
        top += hitbox.height + padding;
      }
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const ctx = this.ctx;
      clipArea(ctx, this);
      this._draw();
      unclipArea(ctx);
    }
  }
  _draw() {
    const {
      options: opts,
      columnSizes,
      lineWidths,
      ctx
    } = this;
    const {
      align,
      labels: labelOpts
    } = opts;
    const defaultColor = defaults.color;
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const labelFont = toFont(labelOpts.font);
    const {
      padding
    } = labelOpts;
    const fontSize = labelFont.size;
    const halfFontSize = fontSize / 2;
    let cursor;
    this.drawTitle();
    ctx.textAlign = rtlHelper.textAlign("left");
    ctx.textBaseline = "middle";
    ctx.lineWidth = 0.5;
    ctx.font = labelFont.string;
    const {
      boxWidth,
      boxHeight,
      itemHeight
    } = getBoxSize(labelOpts, fontSize);
    const drawLegendBox = function(x2, y2, legendItem) {
      if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
        return;
      }
      ctx.save();
      const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
      ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
      ctx.lineCap = valueOrDefault(legendItem.lineCap, "butt");
      ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
      ctx.lineJoin = valueOrDefault(legendItem.lineJoin, "miter");
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
      ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
      if (labelOpts.usePointStyle) {
        const drawOptions = {
          radius: boxHeight * Math.SQRT2 / 2,
          pointStyle: legendItem.pointStyle,
          rotation: legendItem.rotation,
          borderWidth: lineWidth
        };
        const centerX = rtlHelper.xPlus(x2, boxWidth / 2);
        const centerY = y2 + halfFontSize;
        drawPointLegend(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
      } else {
        const yBoxTop = y2 + Math.max((fontSize - boxHeight) / 2, 0);
        const xBoxLeft = rtlHelper.leftForLtr(x2, boxWidth);
        const borderRadius = toTRBLCorners(legendItem.borderRadius);
        ctx.beginPath();
        if (Object.values(borderRadius).some((v2) => v2 !== 0)) {
          addRoundedRectPath(ctx, {
            x: xBoxLeft,
            y: yBoxTop,
            w: boxWidth,
            h: boxHeight,
            radius: borderRadius
          });
        } else {
          ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
        }
        ctx.fill();
        if (lineWidth !== 0) {
          ctx.stroke();
        }
      }
      ctx.restore();
    };
    const fillText = function(x2, y2, legendItem) {
      renderText(ctx, legendItem.text, x2, y2 + itemHeight / 2, labelFont, {
        strikethrough: legendItem.hidden,
        textAlign: rtlHelper.textAlign(legendItem.textAlign)
      });
    };
    const isHorizontal = this.isHorizontal();
    const titleHeight = this._computeTitleHeight();
    if (isHorizontal) {
      cursor = {
        x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
        y: this.top + padding + titleHeight,
        line: 0
      };
    } else {
      cursor = {
        x: this.left + padding,
        y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
        line: 0
      };
    }
    overrideTextDirection(this.ctx, opts.textDirection);
    const lineHeight = itemHeight + padding;
    this.legendItems.forEach((legendItem, i2) => {
      ctx.strokeStyle = legendItem.fontColor;
      ctx.fillStyle = legendItem.fontColor;
      const textWidth = ctx.measureText(legendItem.text).width;
      const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
      const width = boxWidth + halfFontSize + textWidth;
      let x2 = cursor.x;
      let y2 = cursor.y;
      rtlHelper.setWidth(this.width);
      if (isHorizontal) {
        if (i2 > 0 && x2 + width + padding > this.right) {
          y2 = cursor.y += lineHeight;
          cursor.line++;
          x2 = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
        }
      } else if (i2 > 0 && y2 + lineHeight > this.bottom) {
        x2 = cursor.x = x2 + columnSizes[cursor.line].width + padding;
        cursor.line++;
        y2 = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
      }
      const realX = rtlHelper.x(x2);
      drawLegendBox(realX, y2, legendItem);
      x2 = _textX(textAlign, x2 + boxWidth + halfFontSize, isHorizontal ? x2 + width : this.right, opts.rtl);
      fillText(rtlHelper.x(x2), y2, legendItem);
      if (isHorizontal) {
        cursor.x += width + padding;
      } else if (typeof legendItem.text !== "string") {
        const fontLineHeight = labelFont.lineHeight;
        cursor.y += calculateLegendItemHeight(legendItem, fontLineHeight) + padding;
      } else {
        cursor.y += lineHeight;
      }
    });
    restoreTextDirection(this.ctx, opts.textDirection);
  }
  drawTitle() {
    const opts = this.options;
    const titleOpts = opts.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    if (!titleOpts.display) {
      return;
    }
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const ctx = this.ctx;
    const position = titleOpts.position;
    const halfFontSize = titleFont.size / 2;
    const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
    let y2;
    let left = this.left;
    let maxWidth = this.width;
    if (this.isHorizontal()) {
      maxWidth = Math.max(...this.lineWidths);
      y2 = this.top + topPaddingPlusHalfFontSize;
      left = _alignStartEnd(opts.align, left, this.right - maxWidth);
    } else {
      const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
      y2 = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
    }
    const x2 = _alignStartEnd(position, left, left + maxWidth);
    ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
    ctx.textBaseline = "middle";
    ctx.strokeStyle = titleOpts.color;
    ctx.fillStyle = titleOpts.color;
    ctx.font = titleFont.string;
    renderText(ctx, titleOpts.text, x2, y2, titleFont);
  }
  _computeTitleHeight() {
    const titleOpts = this.options.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
  }
  _getLegendItemAt(x2, y2) {
    let i2, hitBox, lh;
    if (_isBetween(x2, this.left, this.right) && _isBetween(y2, this.top, this.bottom)) {
      lh = this.legendHitBoxes;
      for (i2 = 0; i2 < lh.length; ++i2) {
        hitBox = lh[i2];
        if (_isBetween(x2, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y2, hitBox.top, hitBox.top + hitBox.height)) {
          return this.legendItems[i2];
        }
      }
    }
    return null;
  }
  handleEvent(e2) {
    const opts = this.options;
    if (!isListened(e2.type, opts)) {
      return;
    }
    const hoveredItem = this._getLegendItemAt(e2.x, e2.y);
    if (e2.type === "mousemove" || e2.type === "mouseout") {
      const previous = this._hoveredItem;
      const sameItem = itemsEqual(previous, hoveredItem);
      if (previous && !sameItem) {
        callback(opts.onLeave, [e2, previous, this], this);
      }
      this._hoveredItem = hoveredItem;
      if (hoveredItem && !sameItem) {
        callback(opts.onHover, [e2, hoveredItem, this], this);
      }
    } else if (hoveredItem) {
      callback(opts.onClick, [e2, hoveredItem, this], this);
    }
  }
}
function calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight) {
  const itemWidth = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
  const itemHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
  return {
    itemWidth,
    itemHeight
  };
}
function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
  let legendItemText = legendItem.text;
  if (legendItemText && typeof legendItemText !== "string") {
    legendItemText = legendItemText.reduce((a2, b2) => a2.length > b2.length ? a2 : b2);
  }
  return boxWidth + labelFont.size / 2 + ctx.measureText(legendItemText).width;
}
function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
  let itemHeight = _itemHeight;
  if (typeof legendItem.text !== "string") {
    itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
  }
  return itemHeight;
}
function calculateLegendItemHeight(legendItem, fontLineHeight) {
  const labelHeight = legendItem.text ? legendItem.text.length : 0;
  return fontLineHeight * labelHeight;
}
function isListened(type, opts) {
  if ((type === "mousemove" || type === "mouseout") && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === "click" || type === "mouseup")) {
    return true;
  }
  return false;
}
var plugin_legend = {
  id: "legend",
  _element: Legend,
  start(chart, _args, options2) {
    const legend = chart.legend = new Legend({
      ctx: chart.ctx,
      options: options2,
      chart
    });
    layouts.configure(chart, legend, options2);
    layouts.addBox(chart, legend);
  },
  stop(chart) {
    layouts.removeBox(chart, chart.legend);
    delete chart.legend;
  },
  beforeUpdate(chart, _args, options2) {
    const legend = chart.legend;
    layouts.configure(chart, legend, options2);
    legend.options = options2;
  },
  afterUpdate(chart) {
    const legend = chart.legend;
    legend.buildLabels();
    legend.adjustHitBoxes();
  },
  afterEvent(chart, args) {
    if (!args.replay) {
      chart.legend.handleEvent(args.event);
    }
  },
  defaults: {
    display: true,
    position: "top",
    align: "center",
    fullSize: true,
    reverse: false,
    weight: 1e3,
    onClick(e2, legendItem, legend) {
      const index2 = legendItem.datasetIndex;
      const ci = legend.chart;
      if (ci.isDatasetVisible(index2)) {
        ci.hide(index2);
        legendItem.hidden = true;
      } else {
        ci.show(index2);
        legendItem.hidden = false;
      }
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (ctx) => ctx.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(chart) {
        const datasets = chart.data.datasets;
        const {
          labels: {
            usePointStyle,
            pointStyle,
            textAlign,
            color: color2,
            useBorderRadius,
            borderRadius
          }
        } = chart.legend.options;
        return chart._getSortedDatasetMetas().map((meta) => {
          const style = meta.controller.getStyle(usePointStyle ? 0 : void 0);
          const borderWidth = toPadding(style.borderWidth);
          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            fontColor: color2,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: style.borderDash,
            lineDashOffset: style.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: (borderWidth.width + borderWidth.height) / 4,
            strokeStyle: style.borderColor,
            pointStyle: pointStyle || style.pointStyle,
            rotation: style.rotation,
            textAlign: textAlign || style.textAlign,
            borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
            datasetIndex: meta.index
          };
        }, this);
      }
    },
    title: {
      color: (ctx) => ctx.chart.options.color,
      display: false,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (name) => !name.startsWith("on"),
    labels: {
      _scriptable: (name) => !["generateLabels", "filter", "sort"].includes(name)
    }
  }
};
class Title extends Element {
  constructor(config2) {
    super();
    this.chart = config2.chart;
    this.options = config2.options;
    this.ctx = config2.ctx;
    this._padding = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this.position = void 0;
    this.weight = void 0;
    this.fullSize = void 0;
  }
  update(maxWidth, maxHeight) {
    const opts = this.options;
    this.left = 0;
    this.top = 0;
    if (!opts.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = maxWidth;
    this.height = this.bottom = maxHeight;
    const lineCount = isArray(opts.text) ? opts.text.length : 1;
    this._padding = toPadding(opts.padding);
    const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height;
    if (this.isHorizontal()) {
      this.height = textSize;
    } else {
      this.width = textSize;
    }
  }
  isHorizontal() {
    const pos = this.options.position;
    return pos === "top" || pos === "bottom";
  }
  _drawArgs(offset) {
    const {
      top,
      left,
      bottom,
      right,
      options: options2
    } = this;
    const align = options2.align;
    let rotation = 0;
    let maxWidth, titleX, titleY;
    if (this.isHorizontal()) {
      titleX = _alignStartEnd(align, left, right);
      titleY = top + offset;
      maxWidth = right - left;
    } else {
      if (options2.position === "left") {
        titleX = left + offset;
        titleY = _alignStartEnd(align, bottom, top);
        rotation = PI * -0.5;
      } else {
        titleX = right - offset;
        titleY = _alignStartEnd(align, top, bottom);
        rotation = PI * 0.5;
      }
      maxWidth = bottom - top;
    }
    return {
      titleX,
      titleY,
      maxWidth,
      rotation
    };
  }
  draw() {
    const ctx = this.ctx;
    const opts = this.options;
    if (!opts.display) {
      return;
    }
    const fontOpts = toFont(opts.font);
    const lineHeight = fontOpts.lineHeight;
    const offset = lineHeight / 2 + this._padding.top;
    const {
      titleX,
      titleY,
      maxWidth,
      rotation
    } = this._drawArgs(offset);
    renderText(ctx, opts.text, 0, 0, fontOpts, {
      color: opts.color,
      maxWidth,
      rotation,
      textAlign: _toLeftRightCenter(opts.align),
      textBaseline: "middle",
      translation: [titleX, titleY]
    });
  }
}
function createTitle(chart, titleOpts) {
  const title = new Title({
    ctx: chart.ctx,
    options: titleOpts,
    chart
  });
  layouts.configure(chart, title, titleOpts);
  layouts.addBox(chart, title);
  chart.titleBlock = title;
}
var plugin_title = {
  id: "title",
  _element: Title,
  start(chart, _args, options2) {
    createTitle(chart, options2);
  },
  stop(chart) {
    const titleBlock = chart.titleBlock;
    layouts.removeBox(chart, titleBlock);
    delete chart.titleBlock;
  },
  beforeUpdate(chart, _args, options2) {
    const title = chart.titleBlock;
    layouts.configure(chart, title, options2);
    title.options = options2;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "bold"
    },
    fullSize: true,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const map = /* @__PURE__ */ new WeakMap();
var plugin_subtitle = {
  id: "subtitle",
  start(chart, _args, options2) {
    const title = new Title({
      ctx: chart.ctx,
      options: options2,
      chart
    });
    layouts.configure(chart, title, options2);
    layouts.addBox(chart, title);
    map.set(chart, title);
  },
  stop(chart) {
    layouts.removeBox(chart, map.get(chart));
    map.delete(chart);
  },
  beforeUpdate(chart, _args, options2) {
    const title = map.get(chart);
    layouts.configure(chart, title, options2);
    title.options = options2;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "normal"
    },
    fullSize: true,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const positioners = {
  average(items) {
    if (!items.length) {
      return false;
    }
    let i2, len;
    let xSet = /* @__PURE__ */ new Set();
    let y2 = 0;
    let count = 0;
    for (i2 = 0, len = items.length; i2 < len; ++i2) {
      const el = items[i2].element;
      if (el && el.hasValue()) {
        const pos = el.tooltipPosition();
        xSet.add(pos.x);
        y2 += pos.y;
        ++count;
      }
    }
    if (count === 0 || xSet.size === 0) {
      return false;
    }
    const xAverage = [...xSet].reduce((a2, b2) => a2 + b2) / xSet.size;
    return {
      x: xAverage,
      y: y2 / count
    };
  },
  nearest(items, eventPosition) {
    if (!items.length) {
      return false;
    }
    let x2 = eventPosition.x;
    let y2 = eventPosition.y;
    let minDistance = Number.POSITIVE_INFINITY;
    let i2, len, nearestElement;
    for (i2 = 0, len = items.length; i2 < len; ++i2) {
      const el = items[i2].element;
      if (el && el.hasValue()) {
        const center = el.getCenterPoint();
        const d2 = distanceBetweenPoints(eventPosition, center);
        if (d2 < minDistance) {
          minDistance = d2;
          nearestElement = el;
        }
      }
    }
    if (nearestElement) {
      const tp = nearestElement.tooltipPosition();
      x2 = tp.x;
      y2 = tp.y;
    }
    return {
      x: x2,
      y: y2
    };
  }
};
function pushOrConcat(base, toPush) {
  if (toPush) {
    if (isArray(toPush)) {
      Array.prototype.push.apply(base, toPush);
    } else {
      base.push(toPush);
    }
  }
  return base;
}
function splitNewlines(str) {
  if ((typeof str === "string" || str instanceof String) && str.indexOf("\n") > -1) {
    return str.split("\n");
  }
  return str;
}
function createTooltipItem(chart, item) {
  const {
    element,
    datasetIndex,
    index: index2
  } = item;
  const controller = chart.getDatasetMeta(datasetIndex).controller;
  const {
    label,
    value
  } = controller.getLabelAndValue(index2);
  return {
    chart,
    label,
    parsed: controller.getParsed(index2),
    raw: chart.data.datasets[datasetIndex].data[index2],
    formattedValue: value,
    dataset: controller.getDataset(),
    dataIndex: index2,
    datasetIndex,
    element
  };
}
function getTooltipSize(tooltip, options2) {
  const ctx = tooltip.chart.ctx;
  const {
    body,
    footer,
    title
  } = tooltip;
  const {
    boxWidth,
    boxHeight
  } = options2;
  const bodyFont = toFont(options2.bodyFont);
  const titleFont = toFont(options2.titleFont);
  const footerFont = toFont(options2.footerFont);
  const titleLineCount = title.length;
  const footerLineCount = footer.length;
  const bodyLineItemCount = body.length;
  const padding = toPadding(options2.padding);
  let height = padding.height;
  let width = 0;
  let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
  combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
  if (titleLineCount) {
    height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options2.titleSpacing + options2.titleMarginBottom;
  }
  if (combinedBodyLength) {
    const bodyLineHeight = options2.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
    height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options2.bodySpacing;
  }
  if (footerLineCount) {
    height += options2.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options2.footerSpacing;
  }
  let widthPadding = 0;
  const maxLineWidth = function(line) {
    width = Math.max(width, ctx.measureText(line).width + widthPadding);
  };
  ctx.save();
  ctx.font = titleFont.string;
  each(tooltip.title, maxLineWidth);
  ctx.font = bodyFont.string;
  each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
  widthPadding = options2.displayColors ? boxWidth + 2 + options2.boxPadding : 0;
  each(body, (bodyItem) => {
    each(bodyItem.before, maxLineWidth);
    each(bodyItem.lines, maxLineWidth);
    each(bodyItem.after, maxLineWidth);
  });
  widthPadding = 0;
  ctx.font = footerFont.string;
  each(tooltip.footer, maxLineWidth);
  ctx.restore();
  width += padding.width;
  return {
    width,
    height
  };
}
function determineYAlign(chart, size) {
  const {
    y: y2,
    height
  } = size;
  if (y2 < height / 2) {
    return "top";
  } else if (y2 > chart.height - height / 2) {
    return "bottom";
  }
  return "center";
}
function doesNotFitWithAlign(xAlign, chart, options2, size) {
  const {
    x: x2,
    width
  } = size;
  const caret = options2.caretSize + options2.caretPadding;
  if (xAlign === "left" && x2 + width + caret > chart.width) {
    return true;
  }
  if (xAlign === "right" && x2 - width - caret < 0) {
    return true;
  }
}
function determineXAlign(chart, options2, size, yAlign) {
  const {
    x: x2,
    width
  } = size;
  const {
    width: chartWidth,
    chartArea: {
      left,
      right
    }
  } = chart;
  let xAlign = "center";
  if (yAlign === "center") {
    xAlign = x2 <= (left + right) / 2 ? "left" : "right";
  } else if (x2 <= width / 2) {
    xAlign = "left";
  } else if (x2 >= chartWidth - width / 2) {
    xAlign = "right";
  }
  if (doesNotFitWithAlign(xAlign, chart, options2, size)) {
    xAlign = "center";
  }
  return xAlign;
}
function determineAlignment(chart, options2, size) {
  const yAlign = size.yAlign || options2.yAlign || determineYAlign(chart, size);
  return {
    xAlign: size.xAlign || options2.xAlign || determineXAlign(chart, options2, size, yAlign),
    yAlign
  };
}
function alignX(size, xAlign) {
  let {
    x: x2,
    width
  } = size;
  if (xAlign === "right") {
    x2 -= width;
  } else if (xAlign === "center") {
    x2 -= width / 2;
  }
  return x2;
}
function alignY(size, yAlign, paddingAndSize) {
  let {
    y: y2,
    height
  } = size;
  if (yAlign === "top") {
    y2 += paddingAndSize;
  } else if (yAlign === "bottom") {
    y2 -= height + paddingAndSize;
  } else {
    y2 -= height / 2;
  }
  return y2;
}
function getBackgroundPoint(options2, size, alignment, chart) {
  const {
    caretSize,
    caretPadding,
    cornerRadius
  } = options2;
  const {
    xAlign,
    yAlign
  } = alignment;
  const paddingAndSize = caretSize + caretPadding;
  const {
    topLeft,
    topRight,
    bottomLeft,
    bottomRight
  } = toTRBLCorners(cornerRadius);
  let x2 = alignX(size, xAlign);
  const y2 = alignY(size, yAlign, paddingAndSize);
  if (yAlign === "center") {
    if (xAlign === "left") {
      x2 += paddingAndSize;
    } else if (xAlign === "right") {
      x2 -= paddingAndSize;
    }
  } else if (xAlign === "left") {
    x2 -= Math.max(topLeft, bottomLeft) + caretSize;
  } else if (xAlign === "right") {
    x2 += Math.max(topRight, bottomRight) + caretSize;
  }
  return {
    x: _limitValue(x2, 0, chart.width - size.width),
    y: _limitValue(y2, 0, chart.height - size.height)
  };
}
function getAlignedX(tooltip, align, options2) {
  const padding = toPadding(options2.padding);
  return align === "center" ? tooltip.x + tooltip.width / 2 : align === "right" ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
}
function getBeforeAfterBodyLines(callback2) {
  return pushOrConcat([], splitNewlines(callback2));
}
function createTooltipContext(parent, tooltip, tooltipItems) {
  return createContext(parent, {
    tooltip,
    tooltipItems,
    type: "tooltip"
  });
}
function overrideCallbacks(callbacks, context) {
  const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
  return override ? callbacks.override(override) : callbacks;
}
const defaultCallbacks = {
  beforeTitle: noop,
  title(tooltipItems) {
    if (tooltipItems.length > 0) {
      const item = tooltipItems[0];
      const labels = item.chart.data.labels;
      const labelCount = labels ? labels.length : 0;
      if (this && this.options && this.options.mode === "dataset") {
        return item.dataset.label || "";
      } else if (item.label) {
        return item.label;
      } else if (labelCount > 0 && item.dataIndex < labelCount) {
        return labels[item.dataIndex];
      }
    }
    return "";
  },
  afterTitle: noop,
  beforeBody: noop,
  beforeLabel: noop,
  label(tooltipItem) {
    if (this && this.options && this.options.mode === "dataset") {
      return tooltipItem.label + ": " + tooltipItem.formattedValue || tooltipItem.formattedValue;
    }
    let label = tooltipItem.dataset.label || "";
    if (label) {
      label += ": ";
    }
    const value = tooltipItem.formattedValue;
    if (!isNullOrUndef(value)) {
      label += value;
    }
    return label;
  },
  labelColor(tooltipItem) {
    const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    const options2 = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      borderColor: options2.borderColor,
      backgroundColor: options2.backgroundColor,
      borderWidth: options2.borderWidth,
      borderDash: options2.borderDash,
      borderDashOffset: options2.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(tooltipItem) {
    const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    const options2 = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      pointStyle: options2.pointStyle,
      rotation: options2.rotation
    };
  },
  afterLabel: noop,
  afterBody: noop,
  beforeFooter: noop,
  footer: noop,
  afterFooter: noop
};
function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
  const result = callbacks[name].call(ctx, arg);
  if (typeof result === "undefined") {
    return defaultCallbacks[name].call(ctx, arg);
  }
  return result;
}
class Tooltip extends Element {
  static positioners = positioners;
  constructor(config2) {
    super();
    this.opacity = 0;
    this._active = [];
    this._eventPosition = void 0;
    this._size = void 0;
    this._cachedAnimations = void 0;
    this._tooltipItems = [];
    this.$animations = void 0;
    this.$context = void 0;
    this.chart = config2.chart;
    this.options = config2.options;
    this.dataPoints = void 0;
    this.title = void 0;
    this.beforeBody = void 0;
    this.body = void 0;
    this.afterBody = void 0;
    this.footer = void 0;
    this.xAlign = void 0;
    this.yAlign = void 0;
    this.x = void 0;
    this.y = void 0;
    this.height = void 0;
    this.width = void 0;
    this.caretX = void 0;
    this.caretY = void 0;
    this.labelColors = void 0;
    this.labelPointStyles = void 0;
    this.labelTextColors = void 0;
  }
  initialize(options2) {
    this.options = options2;
    this._cachedAnimations = void 0;
    this.$context = void 0;
  }
  _resolveAnimations() {
    const cached = this._cachedAnimations;
    if (cached) {
      return cached;
    }
    const chart = this.chart;
    const options2 = this.options.setContext(this.getContext());
    const opts = options2.enabled && chart.options.animation && options2.animations;
    const animations = new Animations(this.chart, opts);
    if (opts._cacheable) {
      this._cachedAnimations = Object.freeze(animations);
    }
    return animations;
  }
  getContext() {
    return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(context, options2) {
    const {
      callbacks
    } = options2;
    const beforeTitle = invokeCallbackWithFallback(callbacks, "beforeTitle", this, context);
    const title = invokeCallbackWithFallback(callbacks, "title", this, context);
    const afterTitle = invokeCallbackWithFallback(callbacks, "afterTitle", this, context);
    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeTitle));
    lines = pushOrConcat(lines, splitNewlines(title));
    lines = pushOrConcat(lines, splitNewlines(afterTitle));
    return lines;
  }
  getBeforeBody(tooltipItems, options2) {
    return getBeforeAfterBodyLines(invokeCallbackWithFallback(options2.callbacks, "beforeBody", this, tooltipItems));
  }
  getBody(tooltipItems, options2) {
    const {
      callbacks
    } = options2;
    const bodyItems = [];
    each(tooltipItems, (context) => {
      const bodyItem = {
        before: [],
        lines: [],
        after: []
      };
      const scoped = overrideCallbacks(callbacks, context);
      pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, "beforeLabel", this, context)));
      pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, "label", this, context));
      pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, "afterLabel", this, context)));
      bodyItems.push(bodyItem);
    });
    return bodyItems;
  }
  getAfterBody(tooltipItems, options2) {
    return getBeforeAfterBodyLines(invokeCallbackWithFallback(options2.callbacks, "afterBody", this, tooltipItems));
  }
  getFooter(tooltipItems, options2) {
    const {
      callbacks
    } = options2;
    const beforeFooter = invokeCallbackWithFallback(callbacks, "beforeFooter", this, tooltipItems);
    const footer = invokeCallbackWithFallback(callbacks, "footer", this, tooltipItems);
    const afterFooter = invokeCallbackWithFallback(callbacks, "afterFooter", this, tooltipItems);
    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeFooter));
    lines = pushOrConcat(lines, splitNewlines(footer));
    lines = pushOrConcat(lines, splitNewlines(afterFooter));
    return lines;
  }
  _createItems(options2) {
    const active = this._active;
    const data = this.chart.data;
    const labelColors = [];
    const labelPointStyles = [];
    const labelTextColors = [];
    let tooltipItems = [];
    let i2, len;
    for (i2 = 0, len = active.length; i2 < len; ++i2) {
      tooltipItems.push(createTooltipItem(this.chart, active[i2]));
    }
    if (options2.filter) {
      tooltipItems = tooltipItems.filter((element, index2, array) => options2.filter(element, index2, array, data));
    }
    if (options2.itemSort) {
      tooltipItems = tooltipItems.sort((a2, b2) => options2.itemSort(a2, b2, data));
    }
    each(tooltipItems, (context) => {
      const scoped = overrideCallbacks(options2.callbacks, context);
      labelColors.push(invokeCallbackWithFallback(scoped, "labelColor", this, context));
      labelPointStyles.push(invokeCallbackWithFallback(scoped, "labelPointStyle", this, context));
      labelTextColors.push(invokeCallbackWithFallback(scoped, "labelTextColor", this, context));
    });
    this.labelColors = labelColors;
    this.labelPointStyles = labelPointStyles;
    this.labelTextColors = labelTextColors;
    this.dataPoints = tooltipItems;
    return tooltipItems;
  }
  update(changed, replay) {
    const options2 = this.options.setContext(this.getContext());
    const active = this._active;
    let properties;
    let tooltipItems = [];
    if (!active.length) {
      if (this.opacity !== 0) {
        properties = {
          opacity: 0
        };
      }
    } else {
      const position = positioners[options2.position].call(this, active, this._eventPosition);
      tooltipItems = this._createItems(options2);
      this.title = this.getTitle(tooltipItems, options2);
      this.beforeBody = this.getBeforeBody(tooltipItems, options2);
      this.body = this.getBody(tooltipItems, options2);
      this.afterBody = this.getAfterBody(tooltipItems, options2);
      this.footer = this.getFooter(tooltipItems, options2);
      const size = this._size = getTooltipSize(this, options2);
      const positionAndSize = Object.assign({}, position, size);
      const alignment = determineAlignment(this.chart, options2, positionAndSize);
      const backgroundPoint = getBackgroundPoint(options2, positionAndSize, alignment, this.chart);
      this.xAlign = alignment.xAlign;
      this.yAlign = alignment.yAlign;
      properties = {
        opacity: 1,
        x: backgroundPoint.x,
        y: backgroundPoint.y,
        width: size.width,
        height: size.height,
        caretX: position.x,
        caretY: position.y
      };
    }
    this._tooltipItems = tooltipItems;
    this.$context = void 0;
    if (properties) {
      this._resolveAnimations().update(this, properties);
    }
    if (changed && options2.external) {
      options2.external.call(this, {
        chart: this.chart,
        tooltip: this,
        replay
      });
    }
  }
  drawCaret(tooltipPoint, ctx, size, options2) {
    const caretPosition = this.getCaretPosition(tooltipPoint, size, options2);
    ctx.lineTo(caretPosition.x1, caretPosition.y1);
    ctx.lineTo(caretPosition.x2, caretPosition.y2);
    ctx.lineTo(caretPosition.x3, caretPosition.y3);
  }
  getCaretPosition(tooltipPoint, size, options2) {
    const {
      xAlign,
      yAlign
    } = this;
    const {
      caretSize,
      cornerRadius
    } = options2;
    const {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    } = toTRBLCorners(cornerRadius);
    const {
      x: ptX,
      y: ptY
    } = tooltipPoint;
    const {
      width,
      height
    } = size;
    let x1, x2, x3, y1, y2, y3;
    if (yAlign === "center") {
      y2 = ptY + height / 2;
      if (xAlign === "left") {
        x1 = ptX;
        x2 = x1 - caretSize;
        y1 = y2 + caretSize;
        y3 = y2 - caretSize;
      } else {
        x1 = ptX + width;
        x2 = x1 + caretSize;
        y1 = y2 - caretSize;
        y3 = y2 + caretSize;
      }
      x3 = x1;
    } else {
      if (xAlign === "left") {
        x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
      } else if (xAlign === "right") {
        x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
      } else {
        x2 = this.caretX;
      }
      if (yAlign === "top") {
        y1 = ptY;
        y2 = y1 - caretSize;
        x1 = x2 - caretSize;
        x3 = x2 + caretSize;
      } else {
        y1 = ptY + height;
        y2 = y1 + caretSize;
        x1 = x2 + caretSize;
        x3 = x2 - caretSize;
      }
      y3 = y1;
    }
    return {
      x1,
      x2,
      x3,
      y1,
      y2,
      y3
    };
  }
  drawTitle(pt, ctx, options2) {
    const title = this.title;
    const length = title.length;
    let titleFont, titleSpacing, i2;
    if (length) {
      const rtlHelper = getRtlAdapter(options2.rtl, this.x, this.width);
      pt.x = getAlignedX(this, options2.titleAlign, options2);
      ctx.textAlign = rtlHelper.textAlign(options2.titleAlign);
      ctx.textBaseline = "middle";
      titleFont = toFont(options2.titleFont);
      titleSpacing = options2.titleSpacing;
      ctx.fillStyle = options2.titleColor;
      ctx.font = titleFont.string;
      for (i2 = 0; i2 < length; ++i2) {
        ctx.fillText(title[i2], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
        pt.y += titleFont.lineHeight + titleSpacing;
        if (i2 + 1 === length) {
          pt.y += options2.titleMarginBottom - titleSpacing;
        }
      }
    }
  }
  _drawColorBox(ctx, pt, i2, rtlHelper, options2) {
    const labelColor = this.labelColors[i2];
    const labelPointStyle = this.labelPointStyles[i2];
    const {
      boxHeight,
      boxWidth
    } = options2;
    const bodyFont = toFont(options2.bodyFont);
    const colorX = getAlignedX(this, "left", options2);
    const rtlColorX = rtlHelper.x(colorX);
    const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
    const colorY = pt.y + yOffSet;
    if (options2.usePointStyle) {
      const drawOptions = {
        radius: Math.min(boxWidth, boxHeight) / 2,
        pointStyle: labelPointStyle.pointStyle,
        rotation: labelPointStyle.rotation,
        borderWidth: 1
      };
      const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
      const centerY = colorY + boxHeight / 2;
      ctx.strokeStyle = options2.multiKeyBackground;
      ctx.fillStyle = options2.multiKeyBackground;
      drawPoint(ctx, drawOptions, centerX, centerY);
      ctx.strokeStyle = labelColor.borderColor;
      ctx.fillStyle = labelColor.backgroundColor;
      drawPoint(ctx, drawOptions, centerX, centerY);
    } else {
      ctx.lineWidth = isObject(labelColor.borderWidth) ? Math.max(...Object.values(labelColor.borderWidth)) : labelColor.borderWidth || 1;
      ctx.strokeStyle = labelColor.borderColor;
      ctx.setLineDash(labelColor.borderDash || []);
      ctx.lineDashOffset = labelColor.borderDashOffset || 0;
      const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth);
      const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2);
      const borderRadius = toTRBLCorners(labelColor.borderRadius);
      if (Object.values(borderRadius).some((v2) => v2 !== 0)) {
        ctx.beginPath();
        ctx.fillStyle = options2.multiKeyBackground;
        addRoundedRectPath(ctx, {
          x: outerX,
          y: colorY,
          w: boxWidth,
          h: boxHeight,
          radius: borderRadius
        });
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = labelColor.backgroundColor;
        ctx.beginPath();
        addRoundedRectPath(ctx, {
          x: innerX,
          y: colorY + 1,
          w: boxWidth - 2,
          h: boxHeight - 2,
          radius: borderRadius
        });
        ctx.fill();
      } else {
        ctx.fillStyle = options2.multiKeyBackground;
        ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
        ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
        ctx.fillStyle = labelColor.backgroundColor;
        ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
      }
    }
    ctx.fillStyle = this.labelTextColors[i2];
  }
  drawBody(pt, ctx, options2) {
    const {
      body
    } = this;
    const {
      bodySpacing,
      bodyAlign,
      displayColors,
      boxHeight,
      boxWidth,
      boxPadding
    } = options2;
    const bodyFont = toFont(options2.bodyFont);
    let bodyLineHeight = bodyFont.lineHeight;
    let xLinePadding = 0;
    const rtlHelper = getRtlAdapter(options2.rtl, this.x, this.width);
    const fillLineOfText = function(line) {
      ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
      pt.y += bodyLineHeight + bodySpacing;
    };
    const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
    let bodyItem, textColor, lines, i2, j2, ilen, jlen;
    ctx.textAlign = bodyAlign;
    ctx.textBaseline = "middle";
    ctx.font = bodyFont.string;
    pt.x = getAlignedX(this, bodyAlignForCalculation, options2);
    ctx.fillStyle = options2.bodyColor;
    each(this.beforeBody, fillLineOfText);
    xLinePadding = displayColors && bodyAlignForCalculation !== "right" ? bodyAlign === "center" ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
    for (i2 = 0, ilen = body.length; i2 < ilen; ++i2) {
      bodyItem = body[i2];
      textColor = this.labelTextColors[i2];
      ctx.fillStyle = textColor;
      each(bodyItem.before, fillLineOfText);
      lines = bodyItem.lines;
      if (displayColors && lines.length) {
        this._drawColorBox(ctx, pt, i2, rtlHelper, options2);
        bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
      }
      for (j2 = 0, jlen = lines.length; j2 < jlen; ++j2) {
        fillLineOfText(lines[j2]);
        bodyLineHeight = bodyFont.lineHeight;
      }
      each(bodyItem.after, fillLineOfText);
    }
    xLinePadding = 0;
    bodyLineHeight = bodyFont.lineHeight;
    each(this.afterBody, fillLineOfText);
    pt.y -= bodySpacing;
  }
  drawFooter(pt, ctx, options2) {
    const footer = this.footer;
    const length = footer.length;
    let footerFont, i2;
    if (length) {
      const rtlHelper = getRtlAdapter(options2.rtl, this.x, this.width);
      pt.x = getAlignedX(this, options2.footerAlign, options2);
      pt.y += options2.footerMarginTop;
      ctx.textAlign = rtlHelper.textAlign(options2.footerAlign);
      ctx.textBaseline = "middle";
      footerFont = toFont(options2.footerFont);
      ctx.fillStyle = options2.footerColor;
      ctx.font = footerFont.string;
      for (i2 = 0; i2 < length; ++i2) {
        ctx.fillText(footer[i2], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
        pt.y += footerFont.lineHeight + options2.footerSpacing;
      }
    }
  }
  drawBackground(pt, ctx, tooltipSize, options2) {
    const {
      xAlign,
      yAlign
    } = this;
    const {
      x: x2,
      y: y2
    } = pt;
    const {
      width,
      height
    } = tooltipSize;
    const {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    } = toTRBLCorners(options2.cornerRadius);
    ctx.fillStyle = options2.backgroundColor;
    ctx.strokeStyle = options2.borderColor;
    ctx.lineWidth = options2.borderWidth;
    ctx.beginPath();
    ctx.moveTo(x2 + topLeft, y2);
    if (yAlign === "top") {
      this.drawCaret(pt, ctx, tooltipSize, options2);
    }
    ctx.lineTo(x2 + width - topRight, y2);
    ctx.quadraticCurveTo(x2 + width, y2, x2 + width, y2 + topRight);
    if (yAlign === "center" && xAlign === "right") {
      this.drawCaret(pt, ctx, tooltipSize, options2);
    }
    ctx.lineTo(x2 + width, y2 + height - bottomRight);
    ctx.quadraticCurveTo(x2 + width, y2 + height, x2 + width - bottomRight, y2 + height);
    if (yAlign === "bottom") {
      this.drawCaret(pt, ctx, tooltipSize, options2);
    }
    ctx.lineTo(x2 + bottomLeft, y2 + height);
    ctx.quadraticCurveTo(x2, y2 + height, x2, y2 + height - bottomLeft);
    if (yAlign === "center" && xAlign === "left") {
      this.drawCaret(pt, ctx, tooltipSize, options2);
    }
    ctx.lineTo(x2, y2 + topLeft);
    ctx.quadraticCurveTo(x2, y2, x2 + topLeft, y2);
    ctx.closePath();
    ctx.fill();
    if (options2.borderWidth > 0) {
      ctx.stroke();
    }
  }
  _updateAnimationTarget(options2) {
    const chart = this.chart;
    const anims = this.$animations;
    const animX = anims && anims.x;
    const animY = anims && anims.y;
    if (animX || animY) {
      const position = positioners[options2.position].call(this, this._active, this._eventPosition);
      if (!position) {
        return;
      }
      const size = this._size = getTooltipSize(this, options2);
      const positionAndSize = Object.assign({}, position, this._size);
      const alignment = determineAlignment(chart, options2, positionAndSize);
      const point = getBackgroundPoint(options2, positionAndSize, alignment, chart);
      if (animX._to !== point.x || animY._to !== point.y) {
        this.xAlign = alignment.xAlign;
        this.yAlign = alignment.yAlign;
        this.width = size.width;
        this.height = size.height;
        this.caretX = position.x;
        this.caretY = position.y;
        this._resolveAnimations().update(this, point);
      }
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(ctx) {
    const options2 = this.options.setContext(this.getContext());
    let opacity = this.opacity;
    if (!opacity) {
      return;
    }
    this._updateAnimationTarget(options2);
    const tooltipSize = {
      width: this.width,
      height: this.height
    };
    const pt = {
      x: this.x,
      y: this.y
    };
    opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
    const padding = toPadding(options2.padding);
    const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    if (options2.enabled && hasTooltipContent) {
      ctx.save();
      ctx.globalAlpha = opacity;
      this.drawBackground(pt, ctx, tooltipSize, options2);
      overrideTextDirection(ctx, options2.textDirection);
      pt.y += padding.top;
      this.drawTitle(pt, ctx, options2);
      this.drawBody(pt, ctx, options2);
      this.drawFooter(pt, ctx, options2);
      restoreTextDirection(ctx, options2.textDirection);
      ctx.restore();
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements, eventPosition) {
    const lastActive = this._active;
    const active = activeElements.map(({
      datasetIndex,
      index: index2
    }) => {
      const meta = this.chart.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("Cannot find a dataset at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index2],
        index: index2
      };
    });
    const changed = !_elementsEqual(lastActive, active);
    const positionChanged = this._positionChanged(active, eventPosition);
    if (changed || positionChanged) {
      this._active = active;
      this._eventPosition = eventPosition;
      this._ignoreReplayEvents = true;
      this.update(true);
    }
  }
  handleEvent(e2, replay, inChartArea = true) {
    if (replay && this._ignoreReplayEvents) {
      return false;
    }
    this._ignoreReplayEvents = false;
    const options2 = this.options;
    const lastActive = this._active || [];
    const active = this._getActiveElements(e2, lastActive, replay, inChartArea);
    const positionChanged = this._positionChanged(active, e2);
    const changed = replay || !_elementsEqual(active, lastActive) || positionChanged;
    if (changed) {
      this._active = active;
      if (options2.enabled || options2.external) {
        this._eventPosition = {
          x: e2.x,
          y: e2.y
        };
        this.update(true, replay);
      }
    }
    return changed;
  }
  _getActiveElements(e2, lastActive, replay, inChartArea) {
    const options2 = this.options;
    if (e2.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive.filter((i2) => this.chart.data.datasets[i2.datasetIndex] && this.chart.getDatasetMeta(i2.datasetIndex).controller.getParsed(i2.index) !== void 0);
    }
    const active = this.chart.getElementsAtEventForMode(e2, options2.mode, options2, replay);
    if (options2.reverse) {
      active.reverse();
    }
    return active;
  }
  _positionChanged(active, e2) {
    const {
      caretX,
      caretY,
      options: options2
    } = this;
    const position = positioners[options2.position].call(this, active, e2);
    return position !== false && (caretX !== position.x || caretY !== position.y);
  }
}
var plugin_tooltip = {
  id: "tooltip",
  _element: Tooltip,
  positioners,
  afterInit(chart, _args, options2) {
    if (options2) {
      chart.tooltip = new Tooltip({
        chart,
        options: options2
      });
    }
  },
  beforeUpdate(chart, _args, options2) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options2);
    }
  },
  reset(chart, _args, options2) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options2);
    }
  },
  afterDraw(chart) {
    const tooltip = chart.tooltip;
    if (tooltip && tooltip._willRender()) {
      const args = {
        tooltip
      };
      if (chart.notifyPlugins("beforeTooltipDraw", {
        ...args,
        cancelable: true
      }) === false) {
        return;
      }
      tooltip.draw(chart.ctx);
      chart.notifyPlugins("afterTooltipDraw", args);
    }
  },
  afterEvent(chart, args) {
    if (chart.tooltip) {
      const useFinalPosition = args.replay;
      if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
        args.changed = true;
      }
    }
  },
  defaults: {
    enabled: true,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (ctx, opts) => opts.bodyFont.size,
    boxWidth: (ctx, opts) => opts.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: true,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "width", "height", "caretX", "caretY"]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: defaultCallbacks
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (name) => name !== "filter" && name !== "itemSort" && name !== "external",
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false
    },
    animation: {
      _fallback: false
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: ["interaction"]
};
var plugins = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Colors: plugin_colors,
  Decimation: plugin_decimation,
  Filler: index,
  Legend: plugin_legend,
  SubTitle: plugin_subtitle,
  Title: plugin_title,
  Tooltip: plugin_tooltip
});
const addIfString = (labels, raw, index2, addedLabels) => {
  if (typeof raw === "string") {
    index2 = labels.push(raw) - 1;
    addedLabels.unshift({
      index: index2,
      label: raw
    });
  } else if (isNaN(raw)) {
    index2 = null;
  }
  return index2;
};
function findOrAddLabel(labels, raw, index2, addedLabels) {
  const first = labels.indexOf(raw);
  if (first === -1) {
    return addIfString(labels, raw, index2, addedLabels);
  }
  const last = labels.lastIndexOf(raw);
  return first !== last ? index2 : first;
}
const validIndex = (index2, max) => index2 === null ? null : _limitValue(Math.round(index2), 0, max);
function _getLabelForValue(value) {
  const labels = this.getLabels();
  if (value >= 0 && value < labels.length) {
    return labels[value];
  }
  return value;
}
class CategoryScale extends Scale {
  static id = "category";
  static defaults = {
    ticks: {
      callback: _getLabelForValue
    }
  };
  constructor(cfg) {
    super(cfg);
    this._startValue = void 0;
    this._valueRange = 0;
    this._addedLabels = [];
  }
  init(scaleOptions) {
    const added = this._addedLabels;
    if (added.length) {
      const labels = this.getLabels();
      for (const {
        index: index2,
        label
      } of added) {
        if (labels[index2] === label) {
          labels.splice(index2, 1);
        }
      }
      this._addedLabels = [];
    }
    super.init(scaleOptions);
  }
  parse(raw, index2) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    const labels = this.getLabels();
    index2 = isFinite(index2) && labels[index2] === raw ? index2 : findOrAddLabel(labels, raw, valueOrDefault(index2, raw), this._addedLabels);
    return validIndex(index2, labels.length - 1);
  }
  determineDataLimits() {
    const {
      minDefined,
      maxDefined
    } = this.getUserBounds();
    let {
      min,
      max
    } = this.getMinMax(true);
    if (this.options.bounds === "ticks") {
      if (!minDefined) {
        min = 0;
      }
      if (!maxDefined) {
        max = this.getLabels().length - 1;
      }
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const min = this.min;
    const max = this.max;
    const offset = this.options.offset;
    const ticks = [];
    let labels = this.getLabels();
    labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
    this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
    this._startValue = this.min - (offset ? 0.5 : 0);
    for (let value = min; value <= max; value++) {
      ticks.push({
        value
      });
    }
    return ticks;
  }
  getLabelForValue(value) {
    return _getLabelForValue.call(this, value);
  }
  configure() {
    super.configure();
    if (!this.isHorizontal()) {
      this._reversePixels = !this._reversePixels;
    }
  }
  getPixelForValue(value) {
    if (typeof value !== "number") {
      value = this.parse(value);
    }
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getPixelForTick(index2) {
    const ticks = this.ticks;
    if (index2 < 0 || index2 > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index2].value);
  }
  getValueForPixel(pixel) {
    return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
function generateTicks$1(generationOptions, dataRange) {
  const ticks = [];
  const MIN_SPACING = 1e-14;
  const {
    bounds,
    step,
    min,
    max,
    precision,
    count,
    maxTicks,
    maxDigits,
    includeBounds
  } = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const {
    min: rmin,
    max: rmax
  } = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [{
      value: rmin
    }, {
      value: rmax
    }];
  }
  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
  }
  if (!isNullOrUndef(precision)) {
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }
  if (bounds === "ticks") {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }
  if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1e3)) {
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    numSpaces = (niceMax - niceMin) / spacing;
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1e3)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }
  const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin));
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  let j2 = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({
        value: min
      });
      if (niceMin < min) {
        j2++;
      }
      if (almostEquals(Math.round((niceMin + j2 * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j2++;
      }
    } else if (niceMin < min) {
      j2++;
    }
  }
  for (; j2 < numSpaces; ++j2) {
    const tickValue = Math.round((niceMin + j2 * spacing) * factor) / factor;
    if (maxDefined && tickValue > max) {
      break;
    }
    ticks.push({
      value: tickValue
    });
  }
  if (maxDefined && includeBounds && niceMax !== max) {
    if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({
        value: max
      });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({
      value: niceMax
    });
  }
  return ticks;
}
function relativeLabelSize(value, minSpacing, {
  horizontal,
  minRotation
}) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 1e-3;
  const length = 0.75 * minSpacing * ("" + value).length;
  return Math.min(minSpacing / ratio, length);
}
class LinearScaleBase extends Scale {
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._endValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index2) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    if ((typeof raw === "number" || raw instanceof Number) && !isFinite(+raw)) {
      return null;
    }
    return +raw;
  }
  handleTickRangeOptions() {
    const {
      beginAtZero
    } = this.options;
    const {
      minDefined,
      maxDefined
    } = this.getUserBounds();
    let {
      min,
      max
    } = this;
    const setMin = (v2) => min = minDefined ? min : v2;
    const setMax = (v2) => max = maxDefined ? max : v2;
    if (beginAtZero) {
      const minSign = sign(min);
      const maxSign = sign(max);
      if (minSign < 0 && maxSign < 0) {
        setMax(0);
      } else if (minSign > 0 && maxSign > 0) {
        setMin(0);
      }
    }
    if (min === max) {
      let offset = max === 0 ? 1 : Math.abs(max * 0.05);
      setMax(max + offset);
      if (!beginAtZero) {
        setMin(min - offset);
      }
    }
    this.min = min;
    this.max = max;
  }
  getTickLimit() {
    const tickOpts = this.options.ticks;
    let {
      maxTicksLimit,
      stepSize
    } = tickOpts;
    let maxTicks;
    if (stepSize) {
      maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
      if (maxTicks > 1e3) {
        console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
        maxTicks = 1e3;
      }
    } else {
      maxTicks = this.computeTickLimit();
      maxTicksLimit = maxTicksLimit || 11;
    }
    if (maxTicksLimit) {
      maxTicks = Math.min(maxTicksLimit, maxTicks);
    }
    return maxTicks;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const opts = this.options;
    const tickOpts = opts.ticks;
    let maxTicks = this.getTickLimit();
    maxTicks = Math.max(2, maxTicks);
    const numericGeneratorOptions = {
      maxTicks,
      bounds: opts.bounds,
      min: opts.min,
      max: opts.max,
      precision: tickOpts.precision,
      step: tickOpts.stepSize,
      count: tickOpts.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: tickOpts.minRotation || 0,
      includeBounds: tickOpts.includeBounds !== false
    };
    const dataRange = this._range || this;
    const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  configure() {
    const ticks = this.ticks;
    let start = this.min;
    let end = this.max;
    super.configure();
    if (this.options.offset && ticks.length) {
      const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
      start -= offset;
      end += offset;
    }
    this._startValue = start;
    this._endValue = end;
    this._valueRange = end - start;
  }
  getLabelForValue(value) {
    return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
}
class LinearScale extends LinearScaleBase {
  static id = "linear";
  static defaults = {
    ticks: {
      callback: Ticks.formatters.numeric
    }
  };
  determineDataLimits() {
    const {
      min,
      max
    } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? min : 0;
    this.max = isNumberFinite(max) ? max : 1;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const horizontal = this.isHorizontal();
    const length = horizontal ? this.width : this.height;
    const minRotation = toRadians(this.options.ticks.minRotation);
    const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 1e-3;
    const tickFont = this._resolveTickFontOptions(0);
    return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
  }
  getPixelForValue(value) {
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
  }
}
const log10Floor = (v2) => Math.floor(log10(v2));
const changeExponent = (v2, m2) => Math.pow(10, log10Floor(v2) + m2);
function isMajor(tickVal) {
  const remain = tickVal / Math.pow(10, log10Floor(tickVal));
  return remain === 1;
}
function steps(min, max, rangeExp) {
  const rangeStep = Math.pow(10, rangeExp);
  const start = Math.floor(min / rangeStep);
  const end = Math.ceil(max / rangeStep);
  return end - start;
}
function startExp(min, max) {
  const range = max - min;
  let rangeExp = log10Floor(range);
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++;
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--;
  }
  return Math.min(rangeExp, log10Floor(min));
}
function generateTicks(generationOptions, {
  min,
  max
}) {
  min = finiteOrDefault(generationOptions.min, min);
  const ticks = [];
  const minExp = log10Floor(min);
  let exp = startExp(min, max);
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  const stepSize = Math.pow(10, exp);
  const base = minExp > exp ? Math.pow(10, minExp) : 0;
  const start = Math.round((min - base) * precision) / precision;
  const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
  let significand = Math.floor((start - offset) / Math.pow(10, exp));
  let value = finiteOrDefault(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
  while (value < max) {
    ticks.push({
      value,
      major: isMajor(value),
      significand
    });
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20;
    } else {
      significand++;
    }
    if (significand >= 20) {
      exp++;
      significand = 2;
      precision = exp >= 0 ? 1 : precision;
    }
    value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
  }
  const lastTick = finiteOrDefault(generationOptions.max, value);
  ticks.push({
    value: lastTick,
    major: isMajor(lastTick),
    significand
  });
  return ticks;
}
class LogarithmicScale extends Scale {
  static id = "logarithmic";
  static defaults = {
    ticks: {
      callback: Ticks.formatters.logarithmic,
      major: {
        enabled: true
      }
    }
  };
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index2) {
    const value = LinearScaleBase.prototype.parse.apply(this, [raw, index2]);
    if (value === 0) {
      this._zero = true;
      return void 0;
    }
    return isNumberFinite(value) && value > 0 ? value : null;
  }
  determineDataLimits() {
    const {
      min,
      max
    } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? Math.max(0, min) : null;
    this.max = isNumberFinite(max) ? Math.max(0, max) : null;
    if (this.options.beginAtZero) {
      this._zero = true;
    }
    if (this._zero && this.min !== this._suggestedMin && !isNumberFinite(this._userMin)) {
      this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
    }
    this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const {
      minDefined,
      maxDefined
    } = this.getUserBounds();
    let min = this.min;
    let max = this.max;
    const setMin = (v2) => min = minDefined ? min : v2;
    const setMax = (v2) => max = maxDefined ? max : v2;
    if (min === max) {
      if (min <= 0) {
        setMin(1);
        setMax(10);
      } else {
        setMin(changeExponent(min, -1));
        setMax(changeExponent(max, 1));
      }
    }
    if (min <= 0) {
      setMin(changeExponent(max, -1));
    }
    if (max <= 0) {
      setMax(changeExponent(min, 1));
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const opts = this.options;
    const generationOptions = {
      min: this._userMin,
      max: this._userMax
    };
    const ticks = generateTicks(generationOptions, this);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  getLabelForValue(value) {
    return value === void 0 ? "0" : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const start = this.min;
    super.configure();
    this._startValue = log10(start);
    this._valueRange = log10(this.max) - log10(start);
  }
  getPixelForValue(value) {
    if (value === void 0 || value === 0) {
      value = this.min;
    }
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    const decimal = this.getDecimalForPixel(pixel);
    return Math.pow(10, this._startValue + decimal * this._valueRange);
  }
}
function getTickBackdropHeight(opts) {
  const tickOpts = opts.ticks;
  if (tickOpts.display && opts.display) {
    const padding = toPadding(tickOpts.backdropPadding);
    return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
  }
  return 0;
}
function measureLabelSize(ctx, font, label) {
  label = isArray(label) ? label : [label];
  return {
    w: _longestText(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}
function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - size / 2,
      end: pos + size / 2
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }
  return {
    start: pos,
    end: pos + size
  };
}
function fitWithPointLabels(scale) {
  const orig = {
    l: scale.left + scale._padding.left,
    r: scale.right - scale._padding.right,
    t: scale.top + scale._padding.top,
    b: scale.bottom - scale._padding.bottom
  };
  const limits = Object.assign({}, orig);
  const labelSizes = [];
  const padding = [];
  const valueCount = scale._pointLabels.length;
  const pointLabelOpts = scale.options.pointLabels;
  const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0;
  for (let i2 = 0; i2 < valueCount; i2++) {
    const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i2));
    padding[i2] = opts.padding;
    const pointPosition = scale.getPointPosition(i2, scale.drawingArea + padding[i2], additionalAngle);
    const plFont = toFont(opts.font);
    const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i2]);
    labelSizes[i2] = textSize;
    const angleRadians = _normalizeAngle(scale.getIndexAngle(i2) + additionalAngle);
    const angle = Math.round(toDegrees(angleRadians));
    const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
    updateLimits(limits, orig, angleRadians, hLimits, vLimits);
  }
  scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
function updateLimits(limits, orig, angle, hLimits, vLimits) {
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));
  let x2 = 0;
  let y2 = 0;
  if (hLimits.start < orig.l) {
    x2 = (orig.l - hLimits.start) / sin;
    limits.l = Math.min(limits.l, orig.l - x2);
  } else if (hLimits.end > orig.r) {
    x2 = (hLimits.end - orig.r) / sin;
    limits.r = Math.max(limits.r, orig.r + x2);
  }
  if (vLimits.start < orig.t) {
    y2 = (orig.t - vLimits.start) / cos;
    limits.t = Math.min(limits.t, orig.t - y2);
  } else if (vLimits.end > orig.b) {
    y2 = (vLimits.end - orig.b) / cos;
    limits.b = Math.max(limits.b, orig.b + y2);
  }
}
function createPointLabelItem(scale, index2, itemOpts) {
  const outerDistance = scale.drawingArea;
  const {
    extra,
    additionalAngle,
    padding,
    size
  } = itemOpts;
  const pointLabelPosition = scale.getPointPosition(index2, outerDistance + extra + padding, additionalAngle);
  const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
  const y2 = yForAngle(pointLabelPosition.y, size.h, angle);
  const textAlign = getTextAlignForAngle(angle);
  const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
  return {
    visible: true,
    x: pointLabelPosition.x,
    y: y2,
    textAlign,
    left,
    top: y2,
    right: left + size.w,
    bottom: y2 + size.h
  };
}
function isNotOverlapped(item, area) {
  if (!area) {
    return true;
  }
  const {
    left,
    top,
    right,
    bottom
  } = item;
  const apexesInArea = _isPointInArea({
    x: left,
    y: top
  }, area) || _isPointInArea({
    x: left,
    y: bottom
  }, area) || _isPointInArea({
    x: right,
    y: top
  }, area) || _isPointInArea({
    x: right,
    y: bottom
  }, area);
  return !apexesInArea;
}
function buildPointLabelItems(scale, labelSizes, padding) {
  const items = [];
  const valueCount = scale._pointLabels.length;
  const opts = scale.options;
  const {
    centerPointLabels,
    display
  } = opts.pointLabels;
  const itemOpts = {
    extra: getTickBackdropHeight(opts) / 2,
    additionalAngle: centerPointLabels ? PI / valueCount : 0
  };
  let area;
  for (let i2 = 0; i2 < valueCount; i2++) {
    itemOpts.padding = padding[i2];
    itemOpts.size = labelSizes[i2];
    const item = createPointLabelItem(scale, i2, itemOpts);
    items.push(item);
    if (display === "auto") {
      item.visible = isNotOverlapped(item, area);
      if (item.visible) {
        area = item;
      }
    }
  }
  return items;
}
function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return "center";
  } else if (angle < 180) {
    return "left";
  }
  return "right";
}
function leftForTextAlign(x2, w2, align) {
  if (align === "right") {
    x2 -= w2;
  } else if (align === "center") {
    x2 -= w2 / 2;
  }
  return x2;
}
function yForAngle(y2, h3, angle) {
  if (angle === 90 || angle === 270) {
    y2 -= h3 / 2;
  } else if (angle > 270 || angle < 90) {
    y2 -= h3;
  }
  return y2;
}
function drawPointLabelBox(ctx, opts, item) {
  const {
    left,
    top,
    right,
    bottom
  } = item;
  const {
    backdropColor
  } = opts;
  if (!isNullOrUndef(backdropColor)) {
    const borderRadius = toTRBLCorners(opts.borderRadius);
    const padding = toPadding(opts.backdropPadding);
    ctx.fillStyle = backdropColor;
    const backdropLeft = left - padding.left;
    const backdropTop = top - padding.top;
    const backdropWidth = right - left + padding.width;
    const backdropHeight = bottom - top + padding.height;
    if (Object.values(borderRadius).some((v2) => v2 !== 0)) {
      ctx.beginPath();
      addRoundedRectPath(ctx, {
        x: backdropLeft,
        y: backdropTop,
        w: backdropWidth,
        h: backdropHeight,
        radius: borderRadius
      });
      ctx.fill();
    } else {
      ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
    }
  }
}
function drawPointLabels(scale, labelCount) {
  const {
    ctx,
    options: {
      pointLabels
    }
  } = scale;
  for (let i2 = labelCount - 1; i2 >= 0; i2--) {
    const item = scale._pointLabelItems[i2];
    if (!item.visible) {
      continue;
    }
    const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i2));
    drawPointLabelBox(ctx, optsAtIndex, item);
    const plFont = toFont(optsAtIndex.font);
    const {
      x: x2,
      y: y2,
      textAlign
    } = item;
    renderText(ctx, scale._pointLabels[i2], x2, y2 + plFont.lineHeight / 2, plFont, {
      color: optsAtIndex.color,
      textAlign,
      textBaseline: "middle"
    });
  }
}
function pathRadiusLine(scale, radius, circular, labelCount) {
  const {
    ctx
  } = scale;
  if (circular) {
    ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
  } else {
    let pointPosition = scale.getPointPosition(0, radius);
    ctx.moveTo(pointPosition.x, pointPosition.y);
    for (let i2 = 1; i2 < labelCount; i2++) {
      pointPosition = scale.getPointPosition(i2, radius);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}
function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
  const ctx = scale.ctx;
  const circular = gridLineOpts.circular;
  const {
    color: color2,
    lineWidth
  } = gridLineOpts;
  if (!circular && !labelCount || !color2 || !lineWidth || radius < 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = color2;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(borderOpts.dash || []);
  ctx.lineDashOffset = borderOpts.dashOffset;
  ctx.beginPath();
  pathRadiusLine(scale, radius, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
function createPointLabelContext(parent, index2, label) {
  return createContext(parent, {
    label,
    index: index2,
    type: "pointLabel"
  });
}
class RadialLinearScale extends LinearScaleBase {
  static id = "radialLinear";
  static defaults = {
    display: true,
    animate: true,
    position: "chartArea",
    angleLines: {
      display: true,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0
    },
    grid: {
      circular: false
    },
    startAngle: 0,
    ticks: {
      showLabelBackdrop: true,
      callback: Ticks.formatters.numeric
    },
    pointLabels: {
      backdropColor: void 0,
      backdropPadding: 2,
      display: true,
      font: {
        size: 10
      },
      callback(label) {
        return label;
      },
      padding: 5,
      centerPointLabels: false
    }
  };
  static defaultRoutes = {
    "angleLines.color": "borderColor",
    "pointLabels.color": "color",
    "ticks.color": "color"
  };
  static descriptors = {
    angleLines: {
      _fallback: "grid"
    }
  };
  constructor(cfg) {
    super(cfg);
    this.xCenter = void 0;
    this.yCenter = void 0;
    this.drawingArea = void 0;
    this._pointLabels = [];
    this._pointLabelItems = [];
  }
  setDimensions() {
    const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2);
    const w2 = this.width = this.maxWidth - padding.width;
    const h3 = this.height = this.maxHeight - padding.height;
    this.xCenter = Math.floor(this.left + w2 / 2 + padding.left);
    this.yCenter = Math.floor(this.top + h3 / 2 + padding.top);
    this.drawingArea = Math.floor(Math.min(w2, h3) / 2);
  }
  determineDataLimits() {
    const {
      min,
      max
    } = this.getMinMax(false);
    this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
    this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
  }
  generateTickLabels(ticks) {
    LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
    this._pointLabels = this.getLabels().map((value, index2) => {
      const label = callback(this.options.pointLabels.callback, [value, index2], this);
      return label || label === 0 ? label : "";
    }).filter((v2, i2) => this.chart.getDataVisibility(i2));
  }
  fit() {
    const opts = this.options;
    if (opts.display && opts.pointLabels.display) {
      fitWithPointLabels(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }
  setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
    this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
    this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
    this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
  }
  getIndexAngle(index2) {
    const angleMultiplier = TAU / (this._pointLabels.length || 1);
    const startAngle = this.options.startAngle || 0;
    return _normalizeAngle(index2 * angleMultiplier + toRadians(startAngle));
  }
  getDistanceFromCenterForValue(value) {
    if (isNullOrUndef(value)) {
      return NaN;
    }
    const scalingFactor = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - value) * scalingFactor;
    }
    return (value - this.min) * scalingFactor;
  }
  getValueForDistanceFromCenter(distance) {
    if (isNullOrUndef(distance)) {
      return NaN;
    }
    const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
  }
  getPointLabelContext(index2) {
    const pointLabels = this._pointLabels || [];
    if (index2 >= 0 && index2 < pointLabels.length) {
      const pointLabel = pointLabels[index2];
      return createPointLabelContext(this.getContext(), index2, pointLabel);
    }
  }
  getPointPosition(index2, distanceFromCenter, additionalAngle = 0) {
    const angle = this.getIndexAngle(index2) - HALF_PI + additionalAngle;
    return {
      x: Math.cos(angle) * distanceFromCenter + this.xCenter,
      y: Math.sin(angle) * distanceFromCenter + this.yCenter,
      angle
    };
  }
  getPointPositionForValue(index2, value) {
    return this.getPointPosition(index2, this.getDistanceFromCenterForValue(value));
  }
  getBasePosition(index2) {
    return this.getPointPositionForValue(index2 || 0, this.getBaseValue());
  }
  getPointLabelPosition(index2) {
    const {
      left,
      top,
      right,
      bottom
    } = this._pointLabelItems[index2];
    return {
      left,
      top,
      right,
      bottom
    };
  }
  drawBackground() {
    const {
      backgroundColor,
      grid: {
        circular
      }
    } = this.options;
    if (backgroundColor) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
      ctx.closePath();
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();
    }
  }
  drawGrid() {
    const ctx = this.ctx;
    const opts = this.options;
    const {
      angleLines,
      grid,
      border
    } = opts;
    const labelCount = this._pointLabels.length;
    let i2, offset, position;
    if (opts.pointLabels.display) {
      drawPointLabels(this, labelCount);
    }
    if (grid.display) {
      this.ticks.forEach((tick, index2) => {
        if (index2 !== 0 || index2 === 0 && this.min < 0) {
          offset = this.getDistanceFromCenterForValue(tick.value);
          const context = this.getContext(index2);
          const optsAtIndex = grid.setContext(context);
          const optsAtIndexBorder = border.setContext(context);
          drawRadiusLine(this, optsAtIndex, offset, labelCount, optsAtIndexBorder);
        }
      });
    }
    if (angleLines.display) {
      ctx.save();
      for (i2 = labelCount - 1; i2 >= 0; i2--) {
        const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i2));
        const {
          color: color2,
          lineWidth
        } = optsAtIndex;
        if (!lineWidth || !color2) {
          continue;
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color2;
        ctx.setLineDash(optsAtIndex.borderDash);
        ctx.lineDashOffset = optsAtIndex.borderDashOffset;
        offset = this.getDistanceFromCenterForValue(opts.reverse ? this.min : this.max);
        position = this.getPointPosition(i2, offset);
        ctx.beginPath();
        ctx.moveTo(this.xCenter, this.yCenter);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const ctx = this.ctx;
    const opts = this.options;
    const tickOpts = opts.ticks;
    if (!tickOpts.display) {
      return;
    }
    const startAngle = this.getIndexAngle(0);
    let offset, width;
    ctx.save();
    ctx.translate(this.xCenter, this.yCenter);
    ctx.rotate(startAngle);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.ticks.forEach((tick, index2) => {
      if (index2 === 0 && this.min >= 0 && !opts.reverse) {
        return;
      }
      const optsAtIndex = tickOpts.setContext(this.getContext(index2));
      const tickFont = toFont(optsAtIndex.font);
      offset = this.getDistanceFromCenterForValue(this.ticks[index2].value);
      if (optsAtIndex.showLabelBackdrop) {
        ctx.font = tickFont.string;
        width = ctx.measureText(tick.label).width;
        ctx.fillStyle = optsAtIndex.backdropColor;
        const padding = toPadding(optsAtIndex.backdropPadding);
        ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
      }
      renderText(ctx, tick.label, 0, -offset, tickFont, {
        color: optsAtIndex.color,
        strokeColor: optsAtIndex.textStrokeColor,
        strokeWidth: optsAtIndex.textStrokeWidth
      });
    });
    ctx.restore();
  }
  drawTitle() {
  }
}
const INTERVALS = {
  millisecond: {
    common: true,
    size: 1,
    steps: 1e3
  },
  second: {
    common: true,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: true,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: true,
    size: 36e5,
    steps: 24
  },
  day: {
    common: true,
    size: 864e5,
    steps: 30
  },
  week: {
    common: false,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: true,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: false,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: true,
    size: 3154e7
  }
};
const UNITS = /* @__PURE__ */ Object.keys(INTERVALS);
function sorter(a2, b2) {
  return a2 - b2;
}
function parse(scale, input) {
  if (isNullOrUndef(input)) {
    return null;
  }
  const adapter = scale._adapter;
  const {
    parser,
    round: round2,
    isoWeekday
  } = scale._parseOpts;
  let value = input;
  if (typeof parser === "function") {
    value = parser(value);
  }
  if (!isNumberFinite(value)) {
    value = typeof parser === "string" ? adapter.parse(value, parser) : adapter.parse(value);
  }
  if (value === null) {
    return null;
  }
  if (round2) {
    value = round2 === "week" && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, "isoWeek", isoWeekday) : adapter.startOf(value, round2);
  }
  return +value;
}
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  const ilen = UNITS.length;
  for (let i2 = UNITS.indexOf(minUnit); i2 < ilen - 1; ++i2) {
    const interval = INTERVALS[UNITS[i2]];
    const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i2];
    }
  }
  return UNITS[ilen - 1];
}
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (let i2 = UNITS.length - 1; i2 >= UNITS.indexOf(minUnit); i2--) {
    const unit = UNITS[i2];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
function determineMajorUnit(unit) {
  for (let i2 = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i2 < ilen; ++i2) {
    if (INTERVALS[UNITS[i2]].common) {
      return UNITS[i2];
    }
  }
}
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    const {
      lo,
      hi
    } = _lookup(timestamps, time);
    const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}
function setMajorTicks(scale, ticks, map2, majorUnit) {
  const adapter = scale._adapter;
  const first = +adapter.startOf(ticks[0].value, majorUnit);
  const last = ticks[ticks.length - 1].value;
  let major2, index2;
  for (major2 = first; major2 <= last; major2 = +adapter.add(major2, 1, majorUnit)) {
    index2 = map2[major2];
    if (index2 >= 0) {
      ticks[index2].major = true;
    }
  }
  return ticks;
}
function ticksFromTimestamps(scale, values, majorUnit) {
  const ticks = [];
  const map2 = {};
  const ilen = values.length;
  let i2, value;
  for (i2 = 0; i2 < ilen; ++i2) {
    value = values[i2];
    map2[value] = i2;
    ticks.push({
      value,
      major: false
    });
  }
  return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map2, majorUnit);
}
class TimeScale extends Scale {
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: false,
      unit: false,
      round: false,
      isoWeekday: false,
      minUnit: "millisecond",
      displayFormats: {}
    },
    ticks: {
      source: "auto",
      callback: false,
      major: {
        enabled: false
      }
    }
  };
  constructor(props) {
    super(props);
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
    this._unit = "day";
    this._majorUnit = void 0;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = void 0;
  }
  init(scaleOpts, opts = {}) {
    const time = scaleOpts.time || (scaleOpts.time = {});
    const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
    adapter.init(opts);
    mergeIf(time.displayFormats, adapter.formats());
    this._parseOpts = {
      parser: time.parser,
      round: time.round,
      isoWeekday: time.isoWeekday
    };
    super.init(scaleOpts);
    this._normalized = opts.normalized;
  }
  parse(raw, index2) {
    if (raw === void 0) {
      return null;
    }
    return parse(this, raw);
  }
  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const options2 = this.options;
    const adapter = this._adapter;
    const unit = options2.time.unit || "day";
    let {
      min,
      max,
      minDefined,
      maxDefined
    } = this.getUserBounds();
    function _applyBounds(bounds) {
      if (!minDefined && !isNaN(bounds.min)) {
        min = Math.min(min, bounds.min);
      }
      if (!maxDefined && !isNaN(bounds.max)) {
        max = Math.max(max, bounds.max);
      }
    }
    if (!minDefined || !maxDefined) {
      _applyBounds(this._getLabelBounds());
      if (options2.bounds !== "ticks" || options2.ticks.source !== "labels") {
        _applyBounds(this.getMinMax(false));
      }
    }
    min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
    max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
    this.min = Math.min(min, max - 1);
    this.max = Math.max(min + 1, max);
  }
  _getLabelBounds() {
    const arr = this.getLabelTimestamps();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    if (arr.length) {
      min = arr[0];
      max = arr[arr.length - 1];
    }
    return {
      min,
      max
    };
  }
  buildTicks() {
    const options2 = this.options;
    const timeOpts = options2.time;
    const tickOpts = options2.ticks;
    const timestamps = tickOpts.source === "labels" ? this.getLabelTimestamps() : this._generate();
    if (options2.bounds === "ticks" && timestamps.length) {
      this.min = this._userMin || timestamps[0];
      this.max = this._userMax || timestamps[timestamps.length - 1];
    }
    const min = this.min;
    const max = this.max;
    const ticks = _filterBetween(timestamps, min, max);
    this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
    this._majorUnit = !tickOpts.major.enabled || this._unit === "year" ? void 0 : determineMajorUnit(this._unit);
    this.initOffsets(timestamps);
    if (options2.reverse) {
      ticks.reverse();
    }
    return ticksFromTimestamps(this, ticks, this._majorUnit);
  }
  afterAutoSkip() {
    if (this.options.offsetAfterAutoskip) {
      this.initOffsets(this.ticks.map((tick) => +tick.value));
    }
  }
  initOffsets(timestamps = []) {
    let start = 0;
    let end = 0;
    let first, last;
    if (this.options.offset && timestamps.length) {
      first = this.getDecimalForValue(timestamps[0]);
      if (timestamps.length === 1) {
        start = 1 - first;
      } else {
        start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
      }
      last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
      if (timestamps.length === 1) {
        end = last;
      } else {
        end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
      }
    }
    const limit = timestamps.length < 3 ? 0.5 : 0.25;
    start = _limitValue(start, 0, limit);
    end = _limitValue(end, 0, limit);
    this._offsets = {
      start,
      end,
      factor: 1 / (start + 1 + end)
    };
  }
  _generate() {
    const adapter = this._adapter;
    const min = this.min;
    const max = this.max;
    const options2 = this.options;
    const timeOpts = options2.time;
    const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
    const stepSize = valueOrDefault(options2.ticks.stepSize, 1);
    const weekday = minor === "week" ? timeOpts.isoWeekday : false;
    const hasWeekday = isNumber(weekday) || weekday === true;
    const ticks = {};
    let first = min;
    let time, count;
    if (hasWeekday) {
      first = +adapter.startOf(first, "isoWeek", weekday);
    }
    first = +adapter.startOf(first, hasWeekday ? "day" : minor);
    if (adapter.diff(max, min, minor) > 1e5 * stepSize) {
      throw new Error(min + " and " + max + " are too far apart with stepSize of " + stepSize + " " + minor);
    }
    const timestamps = options2.ticks.source === "data" && this.getDataTimestamps();
    for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
      addTick(ticks, time, timestamps);
    }
    if (time === max || options2.bounds === "ticks" || count === 1) {
      addTick(ticks, time, timestamps);
    }
    return Object.keys(ticks).sort(sorter).map((x2) => +x2);
  }
  getLabelForValue(value) {
    const adapter = this._adapter;
    const timeOpts = this.options.time;
    if (timeOpts.tooltipFormat) {
      return adapter.format(value, timeOpts.tooltipFormat);
    }
    return adapter.format(value, timeOpts.displayFormats.datetime);
  }
  format(value, format) {
    const options2 = this.options;
    const formats = options2.time.displayFormats;
    const unit = this._unit;
    const fmt = format || formats[unit];
    return this._adapter.format(value, fmt);
  }
  _tickFormatFunction(time, index2, ticks, format) {
    const options2 = this.options;
    const formatter = options2.ticks.callback;
    if (formatter) {
      return callback(formatter, [time, index2, ticks], this);
    }
    const formats = options2.time.displayFormats;
    const unit = this._unit;
    const majorUnit = this._majorUnit;
    const minorFormat = unit && formats[unit];
    const majorFormat = majorUnit && formats[majorUnit];
    const tick = ticks[index2];
    const major2 = majorUnit && majorFormat && tick && tick.major;
    return this._adapter.format(time, format || (major2 ? majorFormat : minorFormat));
  }
  generateTickLabels(ticks) {
    let i2, ilen, tick;
    for (i2 = 0, ilen = ticks.length; i2 < ilen; ++i2) {
      tick = ticks[i2];
      tick.label = this._tickFormatFunction(tick.value, i2, ticks);
    }
  }
  getDecimalForValue(value) {
    return value === null ? NaN : (value - this.min) / (this.max - this.min);
  }
  getPixelForValue(value) {
    const offsets = this._offsets;
    const pos = this.getDecimalForValue(value);
    return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return this.min + pos * (this.max - this.min);
  }
  _getLabelSize(label) {
    const ticksOpts = this.options.ticks;
    const tickLabelWidth = this.ctx.measureText(label).width;
    const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
    const cosRotation = Math.cos(angle);
    const sinRotation = Math.sin(angle);
    const tickFontSize = this._resolveTickFontOptions(0).size;
    return {
      w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
      h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
    };
  }
  _getLabelCapacity(exampleTime) {
    const timeOpts = this.options.time;
    const displayFormats = timeOpts.displayFormats;
    const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
    const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [exampleTime], this._majorUnit), format);
    const size = this._getLabelSize(exampleLabel);
    const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
    return capacity > 0 ? capacity : 1;
  }
  getDataTimestamps() {
    let timestamps = this._cache.data || [];
    let i2, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const metas = this.getMatchingVisibleMetas();
    if (this._normalized && metas.length) {
      return this._cache.data = metas[0].controller.getAllParsedValues(this);
    }
    for (i2 = 0, ilen = metas.length; i2 < ilen; ++i2) {
      timestamps = timestamps.concat(metas[i2].controller.getAllParsedValues(this));
    }
    return this._cache.data = this.normalize(timestamps);
  }
  getLabelTimestamps() {
    const timestamps = this._cache.labels || [];
    let i2, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const labels = this.getLabels();
    for (i2 = 0, ilen = labels.length; i2 < ilen; ++i2) {
      timestamps.push(parse(this, labels[i2]));
    }
    return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
  }
  normalize(values) {
    return _arrayUnique(values.sort(sorter));
  }
}
function interpolate(table, val, reverse) {
  let lo = 0;
  let hi = table.length - 1;
  let prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      ({
        lo,
        hi
      } = _lookupByKey(table, "pos", val));
    }
    ({
      pos: prevSource,
      time: prevTarget
    } = table[lo]);
    ({
      pos: nextSource,
      time: nextTarget
    } = table[hi]);
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      ({
        lo,
        hi
      } = _lookupByKey(table, "time", val));
    }
    ({
      time: prevSource,
      pos: prevTarget
    } = table[lo]);
    ({
      time: nextSource,
      pos: nextTarget
    } = table[hi]);
  }
  const span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
class TimeSeriesScale extends TimeScale {
  static id = "timeseries";
  static defaults = TimeScale.defaults;
  constructor(props) {
    super(props);
    this._table = [];
    this._minPos = void 0;
    this._tableRange = void 0;
  }
  initOffsets() {
    const timestamps = this._getTimestampsForTable();
    const table = this._table = this.buildLookupTable(timestamps);
    this._minPos = interpolate(table, this.min);
    this._tableRange = interpolate(table, this.max) - this._minPos;
    super.initOffsets(timestamps);
  }
  buildLookupTable(timestamps) {
    const {
      min,
      max
    } = this;
    const items = [];
    const table = [];
    let i2, ilen, prev, curr, next;
    for (i2 = 0, ilen = timestamps.length; i2 < ilen; ++i2) {
      curr = timestamps[i2];
      if (curr >= min && curr <= max) {
        items.push(curr);
      }
    }
    if (items.length < 2) {
      return [{
        time: min,
        pos: 0
      }, {
        time: max,
        pos: 1
      }];
    }
    for (i2 = 0, ilen = items.length; i2 < ilen; ++i2) {
      next = items[i2 + 1];
      prev = items[i2 - 1];
      curr = items[i2];
      if (Math.round((next + prev) / 2) !== curr) {
        table.push({
          time: curr,
          pos: i2 / (ilen - 1)
        });
      }
    }
    return table;
  }
  _generate() {
    const min = this.min;
    const max = this.max;
    let timestamps = super.getDataTimestamps();
    if (!timestamps.includes(min) || !timestamps.length) {
      timestamps.splice(0, 0, min);
    }
    if (!timestamps.includes(max) || timestamps.length === 1) {
      timestamps.push(max);
    }
    return timestamps.sort((a2, b2) => a2 - b2);
  }
  _getTimestampsForTable() {
    let timestamps = this._cache.all || [];
    if (timestamps.length) {
      return timestamps;
    }
    const data = this.getDataTimestamps();
    const label = this.getLabelTimestamps();
    if (data.length && label.length) {
      timestamps = this.normalize(data.concat(label));
    } else {
      timestamps = data.length ? data : label;
    }
    timestamps = this._cache.all = timestamps;
    return timestamps;
  }
  getDecimalForValue(value) {
    return (interpolate(this._table, value) - this._minPos) / this._tableRange;
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
  }
}
var scales = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale
});
const registerables = [controllers, elements, plugins, scales];
function f(C2, E2, k2) {
  return E2 - k2 * C2;
}
function exact(t2, c0, E2, k2) {
  if (k2 === 0) {
    return c0 + E2 * t2;
  }
  return E2 / k2 + (c0 - E2 / k2) * Math.exp(-k2 * t2);
}
function simulate(c0, E2, k2, T2, h3) {
  const n2 = Math.max(0, Math.floor(T2 / h3));
  const t2 = [];
  const ex = [];
  const he = [];
  const rk = [];
  let ch = c0;
  let cr = c0;
  for (let i2 = 0; i2 <= n2; i2++) {
    const ti = i2 * h3;
    t2.push(ti);
    ex.push(exact(ti, c0, E2, k2));
    he.push(ch);
    rk.push(cr);
    if (i2 < n2) {
      const k1h = h3 * f(ch, E2, k2);
      const k2h = h3 * f(ch + k1h, E2, k2);
      ch = ch + (k1h + k2h) / 2;
      const k1 = h3 * f(cr, E2, k2);
      const k22 = h3 * f(cr + k1 / 2, E2, k2);
      const k3 = h3 * f(cr + k22 / 2, E2, k2);
      const k4 = h3 * f(cr + k3, E2, k2);
      cr = cr + (k1 + 2 * k22 + 2 * k3 + k4) / 6;
    }
  }
  return {
    t: t2,
    exact: ex,
    heun: he,
    rk4: rk
  };
}
function rmse(num, ex) {
  const n2 = Math.min(num.length, ex.length);
  if (n2 === 0) return 0;
  let sum = 0;
  for (let i2 = 0; i2 < n2; i2++) {
    const d2 = num[i2] - ex[i2];
    sum += d2 * d2;
  }
  return Math.sqrt(sum / n2);
}
function maxAbsError(num, ex) {
  const n2 = Math.min(num.length, ex.length);
  let m2 = 0;
  for (let i2 = 0; i2 < n2; i2++) {
    m2 = Math.max(m2, Math.abs(num[i2] - ex[i2]));
  }
  return m2;
}
function metrics(c0, E2, k2, T2, h3) {
  const res = simulate(c0, E2, k2, T2, h3);
  return {
    h: h3,
    steps: res.t.length - 1,
    maxAbsErrorHeun: maxAbsError(res.heun, res.exact),
    maxAbsErrorRk4: maxAbsError(res.rk4, res.exact),
    rmseHeun: rmse(res.heun, res.exact),
    rmseRk4: rmse(res.rk4, res.exact),
    finalExact: res.exact[res.exact.length - 1],
    finalHeun: res.heun[res.heun.length - 1],
    finalRk4: res.rk4[res.rk4.length - 1]
  };
}
function compareTwoSteps(c0, E2, k2, T2, h12, h22) {
  return [metrics(c0, E2, k2, T2, h12), metrics(c0, E2, k2, T2, h22)];
}
function timeToThreshold(t2, values, threshold) {
  if (values.length === 0) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first >= threshold && last >= threshold) {
    return 0;
  }
  if (first <= threshold && last >= threshold) {
    for (let i2 = 0; i2 < values.length; i2++) {
      if (values[i2] >= threshold) return t2[i2];
    }
  }
  if (first >= threshold && last <= threshold) {
    for (let i2 = 0; i2 < values.length; i2++) {
      if (values[i2] <= threshold) return t2[i2];
    }
  }
  return null;
}
function validateInputs(c0, E2, k2, T2, h12, h22, threshold) {
  const errors = [];
  if (!Number.isFinite(c0) || c0 < 0) errors.push("C0 debe ser >= 0 (µg/m³)");
  if (!Number.isFinite(E2) || E2 < 0) errors.push("E debe ser >= 0 (µg/(m³·h))");
  if (!Number.isFinite(k2) || k2 <= 0) errors.push("k debe ser > 0 (h⁻¹)");
  if (!Number.isFinite(T2) || T2 <= 0) errors.push("T debe ser > 0 (h)");
  if (!Number.isFinite(h12) || h12 <= 0) errors.push("h1 debe ser > 0 (h)");
  if (!Number.isFinite(h22) || h22 <= 0) errors.push("h2 debe ser > 0 (h)");
  if (!Number.isFinite(threshold) || threshold <= 0) {
    errors.push("Umbral debe ser > 0 (µg/m³)");
  }
  return errors;
}
const $$_tpl_1$3 = ['<div class="flex flex-col gap-1"><label ', ' class="text-sm font-medium text-gray-700">', ' <span class="text-gray-500">(', ")</span></label><input ", ' type="number" ', " ", " ", " ", " ", ">", "", "</div>"];
const $$_tpl_2$2 = ['<p class="text-xs text-gray-500">', "</p>"];
const $$_tpl_3$1 = ['<p class="text-xs text-red-600">', "</p>"];
function InputField(props) {
  return a$2($$_tpl_1$3, l$2("for", props.id), s$2(props.label), s$2(props.unit), l$2("id", props.id), l$2("value", props.value), l$2("min", props.min), l$2("step", props.step ?? "any"), l$2("oninput", (e2) => props.onChange(e2.currentTarget.value)), l$2("class", `border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.error ? "border-red-500" : "border-gray-300"}`), s$2(props.help && a$2($$_tpl_2$2, s$2(props.help))), s$2(props.error && a$2($$_tpl_3$1, s$2(props.error))));
}
const $$_tpl_1$2 = ['<div class="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-800 whitespace-pre-line">', "</div>"];
function Interpretation(props) {
  return a$2($$_tpl_1$2, s$2(props.text));
}
const $$_tpl_1$1 = ['<div class="overflow-x-auto"><table class="min-w-full text-sm border border-gray-200"><thead class="bg-gray-100"><tr><th class="px-2 py-1 border">t (h)</th><th class="px-2 py-1 border">C_exacta (µg/m³)</th><th class="px-2 py-1 border">C_Heun (µg/m³)</th><th class="px-2 py-1 border">C_RK4 (µg/m³)</th><th class="px-2 py-1 border">ErrAbs Heun</th><th class="px-2 py-1 border">ErrAbs RK4</th><th class="px-2 py-1 border">ErrRel% Heun</th><th class="px-2 py-1 border">ErrRel% RK4</th></tr></thead><tbody>', "</tbody></table></div>"];
const $$_tpl_2$1 = ["<tr ", ' class="odd:bg-white even:bg-gray-50"><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', "</td></tr>"];
function ResultsTable(props) {
  const {
    t: t2,
    exact: exact2,
    heun,
    rk4
  } = props.result;
  return a$2($$_tpl_1$1, s$2(t2.map((ti, i2) => {
    const eh = Math.abs(heun[i2] - exact2[i2]);
    const er = Math.abs(rk4[i2] - exact2[i2]);
    const rph = exact2[i2] === 0 ? "—" : (eh / Math.abs(exact2[i2]) * 100).toFixed(4) + "%";
    const rpr = exact2[i2] === 0 ? "—" : (er / Math.abs(exact2[i2]) * 100).toFixed(4) + "%";
    return a$2($$_tpl_2$1, l$2("key", i2), s$2(ti.toFixed(3)), s$2(exact2[i2].toFixed(4)), s$2(heun[i2].toFixed(4)), s$2(rk4[i2].toFixed(4)), s$2(eh.toFixed(4)), s$2(er.toFixed(4)), s$2(rph), s$2(rpr));
  })));
}
const $$_tpl_1 = ['<div class="flex flex-col gap-6"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">', "", "", "", "", "", "", "</div>", "<button ", ' class="self-start px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Ejecutar simulacion</button>', "</div>"];
const $$_tpl_2 = ['<div class="bg-red-50 border border-red-300 rounded p-3 text-sm text-red-700"><ul class="list-disc pl-5">', "</ul></div>"];
const $$_tpl_3 = ["<li ", ">", "</li>"];
const $$_tpl_4 = ['<section class="flex flex-col gap-2"><h2 class="text-xl font-semibold">Grafica de concentracion</h2><div class="h-72"><canvas ', '></canvas></div></section><section class="flex flex-col gap-2"><h2 class="text-xl font-semibold">Grafica de error absoluto</h2><div class="h-72"><canvas ', '></canvas></div></section><section class="flex flex-col gap-2"><h2 class="text-xl font-semibold">Tabla comparativa (paso h1)</h2>', "</section>", "", ""];
const $$_tpl_5 = ['<section class="flex flex-col gap-2"><h2 class="text-xl font-semibold">Comparacion de dos tamanos de paso</h2><div class="overflow-x-auto"><table class="min-w-full text-sm border border-gray-200"><thead class="bg-gray-100"><tr><th class="px-2 py-1 border">Metrica</th><th class="px-2 py-1 border">h = ', '</th><th class="px-2 py-1 border">h = ', '</th></tr></thead><tbody><tr><td class="px-2 py-1 border">Pasos (n)</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td></tr><tr><td class="px-2 py-1 border">ErrAbs max Heun</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td></tr><tr><td class="px-2 py-1 border">ErrAbs max RK4</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td></tr><tr><td class="px-2 py-1 border">RMSE Heun</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', '</td></tr><tr><td class="px-2 py-1 border">RMSE RK4</td><td class="px-2 py-1 border">', '</td><td class="px-2 py-1 border">', "</td></tr></tbody></table></div></section>"];
const $$_tpl_6 = ['<section class="flex flex-col gap-2"><h2 class="text-xl font-semibold">Interpretacion</h2>', "</section>"];
Chart.register(...registerables);
function Simulator() {
  const [c0, setC0] = d$1("150");
  const [E2, setE] = d$1("0");
  const [k2, setK] = d$1("0.1");
  const [T2, setT] = d$1("24");
  const [h12, setH1] = d$1("1");
  const [h22, setH2] = d$1("0.5");
  const [threshold, setThreshold] = d$1("50");
  const [result, setResult] = d$1(null);
  const [m1, setM1] = d$1(null);
  const [m2, setM2] = d$1(null);
  const [errors, setErrors] = d$1([]);
  const [interpretation, setInterpretation] = d$1("");
  const concRef = A(null);
  const errRef = A(null);
  const concChart = A(null);
  const errChart = A(null);
  function run2() {
    const nC0 = Number(c0);
    const nE = Number(E2);
    const nK = Number(k2);
    const nT = Number(T2);
    const nH1 = Number(h12);
    const nH2 = Number(h22);
    const nThreshold = Number(threshold);
    const errs = validateInputs(nC0, nE, nK, nT, nH1, nH2, nThreshold);
    setErrors(errs);
    if (errs.length > 0) {
      setResult(null);
      setM1(null);
      setM2(null);
      setInterpretation("");
      return;
    }
    const r1 = simulate(nC0, nE, nK, nT, nH1);
    setResult(r1);
    const [mm1, mm2] = compareTwoSteps(nC0, nE, nK, nT, nH1, nH2);
    setM1(mm1);
    setM2(mm2);
    const tThresh = timeToThreshold(r1.t, r1.exact, nThreshold);
    const betterMethod = mm1.maxAbsErrorHeun <= mm1.maxAbsErrorRk4 ? "Heun" : "RK4";
    let text = `Concentracion final a t=${nT} h: exacta ${mm1.finalExact.toFixed(2)} µg/m³, Heun ${mm1.finalHeun.toFixed(2)} µg/m³, RK4 ${mm1.finalRk4.toFixed(2)} µg/m³. `;
    if (tThresh === null) {
      text += `En el intervalo simulado la concentracion no cruza el umbral de ${nThreshold} µg/m³. `;
    } else {
      text += `Se alcanza el umbral de ${nThreshold} µg/m³ aproximadamente a las ${tThresh.toFixed(2)} h. `;
    }
    text += `El metodo con menor error maximo absoluto fue ${betterMethod}. `;
    if (mm1.finalExact > nThreshold) {
      text += "La concentracion final supera el umbral: se recomienda restringir actividad fisica intensa al aire libre para grupos sensibles (ninos, adultos mayores, personas con asma).";
    } else {
      text += "La concentracion final se mantiene por debajo del umbral en el horizonte simulado.";
    }
    setInterpretation(text);
  }
  h$1(() => {
    if (!result || !concRef.current) return;
    if (concChart.current) concChart.current.destroy();
    const ctx = concRef.current.getContext("2d");
    if (!ctx) return;
    concChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: result.t.map((v2) => v2.toFixed(2)),
        datasets: [{
          label: "Exacta",
          data: result.exact,
          borderColor: "#111827",
          backgroundColor: "transparent",
          tension: 0.2,
          pointRadius: 0
        }, {
          label: "Heun",
          data: result.heun,
          borderColor: "#2563eb",
          backgroundColor: "transparent",
          tension: 0.2,
          pointRadius: 0
        }, {
          label: "RK4",
          data: result.rk4,
          borderColor: "#16a34a",
          backgroundColor: "transparent",
          tension: 0.2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "t (h)"
            }
          },
          y: {
            title: {
              display: true,
              text: "C (µg/m³)"
            }
          }
        }
      }
    });
    return () => {
      concChart.current?.destroy();
      concChart.current = null;
    };
  }, [result]);
  h$1(() => {
    if (!result || !errRef.current) return;
    if (errChart.current) errChart.current.destroy();
    const ctx = errRef.current.getContext("2d");
    if (!ctx) return;
    const errHeun = result.heun.map((v2, i2) => Math.abs(v2 - result.exact[i2]));
    const errRk4 = result.rk4.map((v2, i2) => Math.abs(v2 - result.exact[i2]));
    errChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: result.t.map((v2) => v2.toFixed(2)),
        datasets: [{
          label: "ErrAbs Heun",
          data: errHeun,
          borderColor: "#2563eb",
          backgroundColor: "transparent",
          tension: 0.2,
          pointRadius: 0
        }, {
          label: "ErrAbs RK4",
          data: errRk4,
          borderColor: "#16a34a",
          backgroundColor: "transparent",
          tension: 0.2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "t (h)"
            }
          },
          y: {
            title: {
              display: true,
              text: "Error absoluto (µg/m³)"
            }
          }
        }
      }
    });
    return () => {
      errChart.current?.destroy();
      errChart.current = null;
    };
  }, [result]);
  return a$2($$_tpl_1, u$2(InputField, {
    id: "c0",
    label: "C0 (condicion inicial)",
    unit: "µg/m³",
    value: c0,
    onChange: setC0,
    min: 0,
    help: "Concentracion inicial de PM2.5"
  }), u$2(InputField, {
    id: "E",
    label: "E (emision/entrada)",
    unit: "µg/(m³·h)",
    value: E2,
    onChange: setE,
    min: 0,
    help: "Tasa de emision de contaminantes"
  }), u$2(InputField, {
    id: "k",
    label: "k (eliminacion)",
    unit: "h⁻¹",
    value: k2,
    onChange: setK,
    min: 0,
    step: "0.001",
    help: "Dispersión, deposicion y lavado"
  }), u$2(InputField, {
    id: "T",
    label: "T (tiempo de simulacion)",
    unit: "h",
    value: T2,
    onChange: setT,
    min: 0,
    help: "Horizonte de simulacion"
  }), u$2(InputField, {
    id: "h1",
    label: "h1 (paso 1)",
    unit: "h",
    value: h12,
    onChange: setH1,
    min: 0,
    step: "0.01"
  }), u$2(InputField, {
    id: "h2",
    label: "h2 (paso 2)",
    unit: "h",
    value: h22,
    onChange: setH2,
    min: 0,
    step: "0.01"
  }), u$2(InputField, {
    id: "threshold",
    label: "Umbral de calidad",
    unit: "µg/m³",
    value: threshold,
    onChange: setThreshold,
    min: 0,
    help: "Nivel de alerta (ej. 50)"
  }), s$2(errors.length > 0 && a$2($$_tpl_2, s$2(errors.map((e2, i2) => a$2($$_tpl_3, l$2("key", i2), s$2(e2)))))), l$2("onclick", run2), s$2(result && a$2($$_tpl_4, l$2("ref", concRef), l$2("ref", errRef), u$2(ResultsTable, {
    result
  }), s$2(m1 && m2 && a$2($$_tpl_5, s$2(m1.h), s$2(m2.h), s$2(m1.steps), s$2(m2.steps), s$2(m1.maxAbsErrorHeun.toFixed(6)), s$2(m2.maxAbsErrorHeun.toFixed(6)), s$2(m1.maxAbsErrorRk4.toFixed(6)), s$2(m2.maxAbsErrorRk4.toFixed(6)), s$2(m1.rmseHeun.toFixed(6)), s$2(m2.rmseHeun.toFixed(6)), s$2(m1.rmseRk4.toFixed(6)), s$2(m2.rmseRk4.toFixed(6)))), s$2(interpretation && a$2($$_tpl_6, u$2(Interpretation, {
    text: interpretation
  }))))));
}
const Simulator$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Simulator
}, Symbol.toStringTag, {
  value: "Module"
}));
function normalizePathname(pathname) {
  return "/" + pathname.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}
function staticFiles$1() {
  return async function freshServeStaticFiles(ctx) {
    const {
      req,
      url,
      config: config2
    } = ctx;
    const buildCache = getBuildCache(ctx);
    if (buildCache === null) return await ctx.next();
    let pathname = url.pathname;
    if (config2.basePath) {
      pathname = pathname !== config2.basePath ? pathname.slice(config2.basePath.length) : "/";
    }
    try {
      pathname = normalizePathname(decodeURIComponent(pathname));
    } catch (_e) {
      if (!(_e instanceof URIError)) throw _e;
      return await ctx.next();
    }
    const startTime = performance.now() + performance.timeOrigin;
    const file = await buildCache.readFile(pathname);
    if (pathname === "/" || file === null) {
      if (pathname === "/favicon.ico") {
        return new Response(null, {
          status: 404
        });
      }
      return await ctx.next();
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      file.close();
      return new Response("Method Not Allowed", {
        status: 405
      });
    }
    const span = tracer.startSpan("static file", {
      attributes: {
        "fresh.span_type": "static_file"
      },
      startTime
    });
    try {
      const cacheKey = url.searchParams.get(ASSET_CACHE_BUST_KEY);
      if (cacheKey !== null && BUILD_ID !== cacheKey) {
        url.searchParams.delete(ASSET_CACHE_BUST_KEY);
        const location = url.pathname + url.search;
        file.close();
        span.setAttribute("fresh.cache", "invalid_bust_key");
        span.setAttribute("fresh.cache_key", cacheKey);
        return new Response(null, {
          status: 307,
          headers: {
            location
          }
        });
      }
      const etag = file.hash;
      const headers = new Headers({
        "Content-Type": file.contentType,
        vary: "If-None-Match"
      });
      if (ctx.config.mode !== "development") {
        const ifNoneMatch = req.headers.get("If-None-Match");
        if (ifNoneMatch !== null && (ifNoneMatch === etag || ifNoneMatch === `W/"${etag}"`)) {
          file.close();
          span.setAttribute("fresh.cache", "not_modified");
          return new Response(null, {
            status: 304,
            headers
          });
        } else if (etag !== null) {
          headers.set("Etag", `W/"${etag}"`);
        }
      }
      if (ctx.config.mode !== "development" && (BUILD_ID === cacheKey || url.pathname.startsWith(`${ctx.config.basePath}/_fresh/js/${BUILD_ID}/`) || file.immutable)) {
        span.setAttribute("fresh.cache", "immutable");
        headers.append("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        span.setAttribute("fresh.cache", "no_cache");
        headers.append("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      }
      headers.set("Content-Length", String(file.size));
      if (req.method === "HEAD") {
        file.close();
        return new Response(null, {
          status: 200,
          headers
        });
      }
      return new Response(file.readable, {
        headers
      });
    } finally {
      span.end();
    }
  };
}
function createDefine() {
  return {
    handlers(handlers2) {
      return handlers2;
    },
    page(render) {
      return render;
    },
    layout(render) {
      return render;
    },
    middleware(middleware) {
      return middleware;
    }
  };
}
const define = createDefine();
const _app = define.page(function App2({
  Component
}) {
  return u$2("html", {
    lang: "es",
    children: [u$2("head", {
      children: [u$2("meta", {
        charset: "utf-8"
      }), u$2("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }), u$2("title", {
        children: "Modelado de PM2.5 en La Paz"
      })]
    }), u$2("body", {
      class: "bg-gray-50",
      children: u$2(Component, null)
    })]
  });
});
const routeCss = ["__FRESH_CSS_PLACEHOLDER__"];
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute____app = _app;
const fsRoute_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  config,
  css,
  default: _freshRoute____app,
  handler,
  handlers
}, Symbol.toStringTag, {
  value: "Module"
}));
const clientEntry = "./assets/client-entry-CKY5Xx0K.js";
const version = "f451b3477b44f97de599232b7556f128bcf8a54c";
const islands = /* @__PURE__ */ new Map();
const islandPreparer = new IslandPreparer();
islandPreparer.prepare(islands, Counter$1, "/assets/fresh-island__Counter-BwuM8JjX.js", "Counter", []);
islandPreparer.prepare(islands, Simulator$1, "/assets/fresh-island__Simulator-CjKiJdwC.js", "Simulator", []);
const staticFiles = /* @__PURE__ */ new Map([["/assets/hooks.module-PVAUNicQ.js", {
  "name": "/assets/hooks.module-PVAUNicQ.js",
  "hash": "61a29c8ad152a426f8d8d94fbe65176d514e4e9733b2d9791504b72f29c0fe27",
  "filePath": "client/assets/hooks.module-PVAUNicQ.js",
  "contentType": "text/javascript; charset=UTF-8",
  "immutable": true
}], ["/assets/jsxRuntime.module-BCl3Xay8.js", {
  "name": "/assets/jsxRuntime.module-BCl3Xay8.js",
  "hash": "e1fced2d37000d24c392357dc9f3e61d5524d3b72b3e2b9b52aef2811f904be5",
  "filePath": "client/assets/jsxRuntime.module-BCl3Xay8.js",
  "contentType": "text/javascript; charset=UTF-8",
  "immutable": true
}], ["/assets/preact.module-DADv7Q-6.js", {
  "name": "/assets/preact.module-DADv7Q-6.js",
  "hash": "0c01d6f3771d306e759393bb5a82c93b554d4e064f1c4b30966b81fb4860c8ff",
  "filePath": "client/assets/preact.module-DADv7Q-6.js",
  "contentType": "text/javascript; charset=UTF-8",
  "immutable": true
}], ["/assets/client-entry-CKY5Xx0K.js", {
  "name": "/assets/client-entry-CKY5Xx0K.js",
  "hash": "aad0d5e2c0d7545546fa15f3ceecd28a80b597dcd6c11764da7825b1e98b01d2",
  "filePath": "client/assets/client-entry-CKY5Xx0K.js",
  "contentType": "text/javascript; charset=UTF-8",
  "immutable": true
}], ["/assets/client-entry-CPMAbeYm.css", {
  "name": "/assets/client-entry-CPMAbeYm.css",
  "hash": "15c0204abab1fd9101977d47f285bd0461c93d27fd2ef00c09ec99ed5e6aa886",
  "filePath": "client/assets/client-entry-CPMAbeYm.css",
  "contentType": "text/css; charset=UTF-8",
  "immutable": true
}], ["/assets/fresh-island__Counter-BwuM8JjX.js", {
  "name": "/assets/fresh-island__Counter-BwuM8JjX.js",
  "hash": "0c9000d4b92417989c2ac1fa0c101b7d1cf2c5338ff16864e8420903763de10f",
  "filePath": "client/assets/fresh-island__Counter-BwuM8JjX.js",
  "contentType": "text/javascript; charset=UTF-8",
  "immutable": true
}], ["/assets/fresh-island__Simulator-CjKiJdwC.js", {
  "name": "/assets/fresh-island__Simulator-CjKiJdwC.js",
  "hash": "d881faa23dd5ea0066dc7f79e5063507aa46d09d1736c80cdd318cfe061062f4",
  "filePath": "client/assets/fresh-island__Simulator-CjKiJdwC.js",
  "contentType": "text/javascript; charset=UTF-8",
  "immutable": true
}], ["/favicon.ico", {
  "name": "/favicon.ico",
  "hash": "ceefc31bd51194e03c78f9d35f9ca4d8b474b01280f83cd1490fb96a87c0dd12",
  "filePath": "client/favicon.ico",
  "contentType": "image/vnd.microsoft.icon"
}], ["/logo.svg", {
  "name": "/logo.svg",
  "hash": "bf1196aeac0c511ec4b81b846993de208012c4158fba73d17b575236164d63ce",
  "filePath": "client/logo.svg",
  "contentType": "image/svg+xml"
}]]);
const entryAssets = ["/assets/client-entry-CPMAbeYm.css"];
const fsRoutes = [{
  id: "/_app",
  mod: fsRoute_0,
  type: "app",
  pattern: "*",
  routePattern: "*"
}, {
  id: "/index",
  mod: () => import("./_fresh-route___index-BTMveAFl-8BX-urit.mjs"),
  type: "route",
  pattern: "/",
  routePattern: "/"
}, {
  id: "/api/[name]",
  mod: () => import("./_fresh-route___api_name_-CGq2LBhg-BdZR9gQ5.mjs"),
  type: "route",
  pattern: "/api/:name",
  routePattern: "/api/:name"
}];
const snapshot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientEntry,
  entryAssets,
  fsRoutes,
  islands,
  staticFiles,
  version
}, Symbol.toStringTag, {
  value: "Module"
}));
const app = new App();
app.use(staticFiles$1());
app.use(async (ctx) => {
  ctx.state.shared = "hello";
  return await ctx.next();
});
app.get("/api2/:name", (ctx) => {
  const name = ctx.params.name;
  return new Response(`Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`);
});
const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(exampleLoggerMiddleware);
app.fsRoutes();
const root = join(import.meta.dirname, "..");
setBuildCache(app, new ProdBuildCache(root, snapshot), "production");
const _fresh_server_entry = {
  fetch: app.handler()
};
const server$1 = {
  fetch: _fresh_server_entry.fetch
};
const server = {
  fetch: server$1.fetch
};
const workerEntry = server ?? {};
export {
  Head as H,
  Simulator as S,
  a$2 as a,
  define as d,
  u$2 as u,
  workerEntry as w
};
//# sourceMappingURL=worker-entry-CPBxE0QZ.mjs.map
