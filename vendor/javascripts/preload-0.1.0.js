/*
* AbstractLoader for PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2012 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @module PreloadJS
 */
(function (window) {

	/**
	 * The base loader, which handles all callbacks. All loaders should extend this class.
	 * @class AbstractLoader
	 * @constructor
	 */
	var AbstractLoader = function () {
		this.init();
	};

	AbstractLoader.prototype = {};
	var p = AbstractLoader.prototype;

	/**
	 * Determine if this loader has completed already.
	 * @property loaded
	 * @type Boolean
	 * @default false
	 */
	p.loaded = false;

	/**
	 * The current load progress (percentage) for this item.
	 * @property progress
	 * @type Number
	 * @default 0
	 */
	p.progress = 0;

	// The manifest item we are loading
	p._item = null;

//Callbacks
	/**
	 * The callback to fire when progress changes.
	 * @event onProgress
	 */
	p.onProgress = null;

	/**
	 * The callback to fire when a load starts.
	 * @event onLoadStart
	 */
	p.onLoadStart = null;

	/**
	 * The callback to fire when a file completes.
	 * @event onFileLoad
	 */
	p.onFileLoad = null;

	/**
	 * The callback to fire when a file progress changes.
	 * @event onFileProgress
	 */
	p.onFileProgress = null;

	/**
	 * The callback to fire when all loading is complete.
	 * @event onComplete
	 */
	p.onComplete = null;

	/**
	 * The callback to fire when the loader encounters an error. If the error was encountered
	 * by a file, the event will contain the required file data, but the target will be the loader.
	 * @event onFileError
	 */
	p.onError = null;


	/**
	 * Get a reference to the manifest item that is loaded by this loader.
	 * @return {Object} The manifest item
	 */
	p.getItem = function() {
		return this._item;
	};

	/**
	 * Initialize the loader.
	 * @private
	 */
	p.init = function () {};

	/**
	 * Begin the load.
	 */
	p.load = function() {};

	/**
	 * Cancel the load.
	 */
	p.cancel = function() {};


//Callback proxies
	p._sendLoadStart = function(value) {
		if (this.onLoadStart) {
			this.onLoadStart({target:this});
		}
	};

	p._sendProgress = function(value) {
		var event;
		if (value instanceof Number) {
			this.progress = value;
			event = {loaded:this.progress, total:1};
		} else {
			event = value;
			this.progress = value.loaded / value.total;
			if (isNaN(this.progress) || this.progress == Infinity) { this.progress = 0; }
		}
		event.target = this;
		if (this.onProgress) {
			this.onProgress(event);
		}
	};

	p._sendFileProgress = function(event) {
		if (this.onFileProgress) {
			event.target = this;
			this.onFileProgress(event);
		}
	};

	p._sendComplete = function() {
		if (this.onComplete) {
			this.onComplete({target:this});
		}
	};

	p._sendFileComplete = function(event) {
		if (this.onFileLoad) {
			event.target = this;
			this.onFileLoad(event);
		}
	};

	p._sendError = function(event) {
		if (this.onError) {
			if (event == null) { event = {}; }
			event.target = this;
			this.onError(event);
		}
	};

	p.toString = function() {
		return "[PreloadJS AbstractLoader]";
	};

	// Note: Abstract Loader is initialized before Preload, so it has to live on Window instead of PreloadJS.lib
	window.AbstractLoader = AbstractLoader;

}(window));/*
* PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2012 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * PreloadJS provides a consistent API for preloading content in HTML5.
 * @module PreloadJS
 */
(function (window) {

	//TODO: Add an API to clear the preloader. Handy if we want to reuse it, and don't want the composite progress.

	/**
	 * PreloadJS provides a consistent way to preload content for use in HTML applications.
	 * @class PreloadJS
	 * @param Boolean useXHR2 Determines whether the preload instance will use XmlHttpRequests, or fall back on tag loading.
	 * @constructor
	 * @extends AbstractLoader
	 */
	var PreloadJS = function(useXHR2) {
		this.initialize(useXHR2);
	};

	var p = PreloadJS.prototype = new AbstractLoader();
	var s = PreloadJS;

	// Preload Types
	/**
	 * The preload type for image files, usually png, gif, or jpg/jpeg
	 * @property IMAGE
	 * @type String
	 * @default image
	 * @static
	 */
	s.IMAGE = "image";

	/**
	 * The preload type for sound files, usually mp3, ogg, or wav.
	 * @property SOUND
	 * @type String
	 * @default sound
	 * @static
	 */
	s.SOUND = "sound";

	/**
	 * The preload type for json files, usually with the "json" file extension.
	 * @property JSON
	 * @type String
	 * @default json
	 * @static
	 */
	s.JSON = "json";

	/**
	 * The preload type for javascript files, usually with the "js" file extension.
	 * @property JAVASCRIPT
	 * @type String
	 * @default javascript
	 * @static
	 */
	s.JAVASCRIPT = "javascript";

	/**
	 * The preload type for css files.
	 * @property CSS
	 * @type String
	 * @default css
	 * @static
	 */
	s.CSS = "css";

	/**
	 * The preload type for xml files.
	 * @property XML
	 * @type String
	 * @default xml
	 * @static
	 */
	s.XML = "xml";

	/**
	 * The preload type for text files, which is also the default file type if the type can not be determined.
	 * @property TEXT
	 * @type String
	 * @default text
	 * @static
	 */
	s.TEXT = "text";

	/**
	 * Time in millseconds to assume a load has failed.
	 * @property TIMEOUT_TIME
	 * @type Number
	 * @default 8000
	 * @static
	 */
	s.TIMEOUT_TIME = 8000;

	// Flags
	/**
	 * Use XMLHttpRequest when possible.
	 * @property useXHR
	 * @type Boolean
	 * @default true
	 */
	p.useXHR = true;

	/* //TODO: Implement syncronous behaviour
	 * Use asynchronous XMLHttpRequests.
	 * @property async
	 * @type Boolean
	 * @default false
	 *
	p.useAsync = false;*/

	/**
	 * Stop processing the current queue when an error is encountered.
	 * @property stopOnError
	 * @type Boolean
	 * @default false
	 */
	p.stopOnError = false;

	/**
	 * Ensure loaded scripts "complete" in the order they are specified.
	 * @property maintainScriptOrder
	 * @type Boolean
	 * @default true
	 */
	p.maintainScriptOrder = true;

	/**
	 * The next preload queue to process when this one is complete.
	 * @property next
	 * @type PreloadJS
	 * @default null
	 */
	p.next = null;

	//Protected properties
	p.typeHandlers = null;
	p.extensionHandlers = null;

	p._maxConnections = 1;
	p._currentLoads = null;
	p._loadQueue = null;
	p._loadedItemsById = null;
	p._loadedItemsBySrc = null;
	p._targetProgress = 0; // Actual Progress
	//TODO: Progress tweening
	//p._currentProgress = 0; // Progress to Display when tweening
	//p._progressInterval = null;
	p._numItems = 0;
	p._numItemsLoaded = null;
	p._scriptOrder = null;
	p._loadedScripts = null;

	// Browser Capabilities
	p.TAG_LOAD_OGGS = true;

	/**
	 * Initialize a PreloadJS instance
	 * @method initialize
	 * @param useXHR Use XHR for loading (vs tag/script loading)
	 */
	p.initialize = function(useXHR) {
		this._numItems = 0;
		this._numItemsLoaded = 0;
		this._targetProgress = 0;
		this._paused = false;
		this._currentLoads = [];
		this._loadQueue = [];
		this._scriptOrder = [];
		this._loadedScripts = [];
		this._loadedItemsById = {};
		this._loadedItemsBySrc = {};
		this.typeHandlers = {};
		this.extensionHandlers = {};

		this.useXHR = (useXHR != false && window.XMLHttpRequest != null);
		this.determineCapabilities();
	};

	/**
	 * Determine the capabilities based on the current browser/version.
	 * @method determineCapabilities
	 * @private
	 */
	p.determineCapabilities = function() {
		var BD = PreloadJS.lib.BrowserDetect;
		if (BD == null) { return; }
		PreloadJS.TAG_LOAD_OGGS = BD.isFirefox || BD.isOpera;
			// && (otherCondictions)
	}

	/**
	 * Determine if a specific type should be loaded as a binary file
	 * @method isBinary
	 * @param type The type to check
	 * @private
	 */
	s.isBinary = function(type) {
		switch (type) {
			case PreloadJS.IMAGE:
			case PreloadJS.SOUND:
				return true;
			default:
				return false;
		}
	};

	/**
	 * Register a plugin. Plugins can map to both load types (sound, image, etc), or can map to specific
	 * extensions (png, mp3, etc). Only one plugin can currently exist per suffix/type.
	 * Plugins must return an object containing:
	 *  * callback: The function to call
	 *  * types: An array of types to handle
	 *  * extensions: An array of extensions to handle. This is overriden by type handlers
	 * @method installPlugin
	 * @param {Function} plugin The plugin to install
	 */
	p.installPlugin = function(plugin) {
		if (plugin == null || plugin.getPreloadHandlers == null) { return; }
		var map = plugin.getPreloadHandlers();
		if (map.types != null) {
			for (var i=0, l=map.types.length; i<l; i++) {
				this.typeHandlers[map.types[i]] = map.callback;
			}
		}
		if (map.extensions != null) {
			for (i=0, l=map.extensions.length; i<l; i++) {
				this.extensionHandlers[map.extensions[i]] = map.callback;
			}
		}
	};

	/**
	 * Set the maximum number of concurrent connections.
	 * @method setMaxConnections
	 * @param {Number} value The number of concurrent loads to allow. By default, only a single connection is open at any time.
	 * Note that browsers and servers may have a built-in maximum number of open connections
	 */
	p.setMaxConnections = function (value) {
		this._maxConnections = value;
		if (!this._paused) {
			this._loadNext();
		}
	}

	/**
	 * Load a single file. Note that calling loadFile appends to the current queue, so it can be used multiple times to
	 * add files. Use <b>loadManifest()</b> to add multiple files at onces. To clear the queue first use the <b>close()</b> method.
	 * @method loadFile
	 * @param {Object | String} file The file object or path to load. A file can be either
     * <ol>
     *     <li>a path to a resource (string). Note that this kind of load item will be
     *     converted to an object (next item) in the background.</li>
     *     <li>OR an object that contains:<ul>
     *         <li>src: The source of the file that is being loaded. This property is <b>required</b>. The source can either be a string (recommended), or an HTML tag.</li>
     *         <li>type: The type of file that will be loaded (image, sound, json, etc).
     *         PreloadJS does auto-detection of types using the extension. Supported types are defined on PreloadJS, such as PreloadJS.IMAGE.
	 *         It is recommended that a type is specified when a non-standard file URI (such as a php script) us used.</li>
     *         <li>id: A string indentifier which can be used to reference the loaded object.</li>
     *         <li>data: An arbitrary data object, which is included with the loaded object</li>
     *     </ul>
     * </ol>
	 * @param {Boolean} loadNow Kick off an immediate load (true) or wait for a load call (false). The default value is true. If the queue is paused, and this value
	 * is true, the queue will resume.
	 */
	p.loadFile = function(file, loadNow) {
		this._addItem(file);

		if (loadNow !== false) {
			this.setPaused(false);
		}
	}

	/**
	 * Load a manifest. This is a shortcut method to load a group of files. To load a single file, use the loadFile method.
	 * Note that calling loadManifest appends to the current queue, so it can be used multiple times to add files. To clear
	 * the queue first, use the <b>close()</b> method.
	 * @method loadManifest
	 * @param {Array} manifest The list of files to load. Each file can be either
	 * <ol>
	 *     <li>a path to a resource (string). Note that this kind of load item will be
	 *     converted to an object (next item) in the background.</li>
	 *     <li>OR an object that contains:<ul>
	 *         <li>src: The source of the file that is being loaded. This property is <b>required</b>.
	 *         The source can either be a string (recommended), or an HTML tag. </li>
	 *         <li>type: The type of file that will be loaded (image, sound, json, etc).
	 *         PreloadJS does auto-detection of types using the extension. Supported types are defined on PreloadJS, such as PreloadJS.IMAGE.
	 *         It is recommended that a type is specified when a non-standard file URI (such as a php script) us used.</li>
	 *         <li>id: A string indentifier which can be used to reference the loaded object.</li>
	 *         <li>data: An arbitrary data object, which is included with the loaded object</li>
	 *     </ul>
	 * </ol>
	 * @param {Boolean} loadNow Kick off an immediate load (true) or wait for a load call (false). The default value is true. If the queue is paused, and this value
	 * is true, the queue will resume.
	 */
	p.loadManifest = function(manifest, loadNow) {
		var data;

		if (manifest instanceof Array) {
			data = manifest;
		} else if (manifest instanceof Object) {
			data = [manifest];
		}

		for (var i=0, l=data.length; i<l; i++) {
			this._addItem(data[i], false);
		}

		if (loadNow !== false) {
			this._loadNext();
		}
	};

	/**
	 * Begin loading the queued items.
	 * @method load
	 */
	p.load = function() {
		this.setPaused(false);
	};

	/**
	 * Lookup a loaded item using either the "id" or "src" that was specified when loading it.
	 * @method getResult
	 * @param {String} value The "id" or "src" of the loaded item.
	 * @return {Object} A result object containing the contents of the object that was initially requested using loadFile or loadManifest, including:
     * <ol>
     *     <li>src: The source of the file that was requested.</li>
     *     <li>type: The type of file that was loaded. If it was not specified, this is auto-detected by PreloadJS using the file extension.</li>
     *     <li>id: The id of the loaded object. If it was not specified, the ID will be the same as the "src" property.</li>
     *     <li>data: Any arbitrary data that was specified, otherwise it will be undefined.
	 *     <li>result: The loaded object. PreloadJS provides usable tag elements when possible:<ul>
	 *          <li>An HTMLImageElement tag (&lt;image /&gt;) for images</li>
	 *          <li>An HTMLAudioElement tag (&lt;audio &gt;) for audio</li>
	 *          <li>A script tag for JavaScript (&lt;script&gt;&lt;/script&gt;)</li>
	 *          <li>A style tag for CSS (&lt;style&gt;&lt;/style&gt;)</li>
	 *          <li>Raw text for JSON or any other kind of loaded item</li>
	 *     </ul></li>
     * </ol>
     * This object is also returned via the "onFileLoad" callback, although a "target" will be included, which is a reference to the PreloadJS instance.
	 */
	p.getResult = function(value) {
		return this._loadedItemsById[value] || this._loadedItemsBySrc[value];
	};

	/**
	 * Pause or resume the current load. The active item will not cancel, but the next
	 * items in the queue will not be processed.
	 * @method setPaused
	 * @param {Boolean} value Whether the queue should be paused or not.
	 */
	p.setPaused = function(value) {
		this._paused = value;
		if (!this._paused) {
			this._loadNext();
		}
	};

	/**
	 * Close the active queue. Closing a queue completely empties the queue, and prevents any remaining items from starting to
	 * download. Note that currently there any active loads will remain open, and events may be processed.<br/><br/>
	 * To stop and restart a queue, use the <b>setPaused(true|false)</b> method instead.
	 * @method close
	 */
	p.close = function() {
		//TODO: Remove or prevent events fired after this.
		while (this._currentLoads.length) {
			this._currentLoads.pop().cancel();
		}
		this._currentLoads = [];
		this._scriptOrder = [];
		this._loadedScripts = [];
	};


//Protected Methods
	p._addItem = function(item) {
		var loadItem = this._createLoadItem(item);
		if (loadItem != null) {
			this._loadQueue.push(loadItem);

			this._numItems++;
			this._updateProgress();

			if (loadItem.getItem().type == PreloadJS.JAVASCRIPT) {
				this._scriptOrder.push(loadItem.getItem());
				this._loadedScripts.push(null);
			}
		}
	};

	p._loadNext = function() {
		if (this._paused) { return; }

		//TODO: Test this.
		if (this._loadQueue.length == 0) {
			this._sendComplete();
			if (this.next && this.next.load) {
				//LM: Do we need to apply here?
				this.next.load.apply(this.next);
			}
		}

		while (this._loadQueue.length && this._currentLoads.length < this._maxConnections) {
			var loadItem = this._loadQueue.shift();

			loadItem.onProgress = PreloadJS.proxy(this._handleProgress, this);
			loadItem.onComplete = PreloadJS.proxy(this._handleFileComplete, this);
			loadItem.onError = PreloadJS.proxy(this._handleFileError, this);

			this._currentLoads.push(loadItem);

			loadItem.load();
		}
	};

	p._handleFileError = function(event) {
		var loader = event.target;
		var resultData = this._createResultData(loader.getItem());
		this._numItemsLoaded++;
		this._updateProgress();

		this._sendError(resultData);
		if (!this.stopOnError) {
			this._removeLoadItem(loader);
			this._loadNext();
		}
	};

	p._createResultData = function(item) {
		return {id:item.id, result:null, data:item.data, type:item.type, src:item.src};
	};

	p._handleFileComplete = function(event) {
		this._numItemsLoaded++;

		var loader = event.target;
		var item = loader.getItem();
		this._removeLoadItem(loader);

		var resultData = this._createResultData(item);

		//Convert to proper tag ... if we need to.
		if (loader instanceof PreloadJS.lib.XHRLoader) {
			resultData.result = this._createResult(item, loader.getResult());
		} else {
			resultData.result = item.tag;
		}

		this._loadedItemsById[item.id] = resultData;
		this._loadedItemsBySrc[item.src] = resultData;

		var _this = this;

		//TODO: Move tag creation to XHR?
		switch (item.type) {
			case PreloadJS.IMAGE: //LM: Consider moving this to XHRLoader
				if(loader instanceof PreloadJS.lib.XHRLoader) {
					resultData.result.onload = function(event) {
						_this._handleFileTagComplete(item, resultData);
					}
					return;
				}
				break;
			case PreloadJS.JAVASCRIPT:
				if (this.maintainScriptOrder) {
					this._loadedScripts[this._scriptOrder.indexOf(item)] = item;
					this._checkScriptLoadOrder();
					return;
				}
				break;
		}
		this._handleFileTagComplete(item, resultData);
	};

	p._checkScriptLoadOrder = function () {
		var l = this._loadedScripts.length;

		for (var i=0;i<l;i++) {
			var order = this._loadedScripts[i];
			if (order === null) { break; }
			if (order === true) { continue; }

			var item = this.getResult(order.src);
            var resultData = this._createResultData(item);
            resultData.result = item.result;
			this._handleFileTagComplete(item, resultData);
			this._loadedScripts[i] = true;
			i--;
			l--;
		}
	};

	p._handleFileTagComplete = function(item, resultData) {
		if (item.completeHandler) {
			item.completeHandler(resultData);
		}

		this._updateProgress();
		this._sendFileComplete(resultData);

		this._loadNext();
	};

	p._removeLoadItem = function(loader) {
		var l = this._currentLoads.length;
		for (var i=0;i<l;i++) {
			if (this._currentLoads[i] == loader) {
				this._currentLoads.splice(i,1); break;
			}
		}
	};

	p._createResult = function(item, data) {
		var tag = null;
		var resultData;
		switch (item.type) {
			case PreloadJS.IMAGE:
				tag = this._createImage(); break;
			case PreloadJS.SOUND:
				tag = item.tag || this._createAudio(); break;
			case PreloadJS.CSS:
				tag = this._createLink(); break;
			case PreloadJS.JAVASCRIPT:
				tag = this._createScript(); break;
			case PreloadJS.XML:
				if (window.DOMParser) {
					var parser = new DOMParser();
					data = parser.parseFromString(data, "text/xml");
				} else { // Internet Explorer
					var parser = new ActiveXObject("Microsoft.XMLDOM");
					parser.async = false;
					parser.loadXML(data);
					resultData = parser;
				}
				break;
			case PreloadJS.JSON:
			case PreloadJS.TEXT:
				resultData = data;
		}

		//LM: Might not need to do this with Audio.
		if (tag) {
			if (item.type == PreloadJS.CSS) {
				tag.href = item.src;
			} else {
				tag.src = item.src;
			}
			return tag;
		} else {
			return resultData;
		}
	};

	// This is item progress!
	p._handleProgress = function(event) {
		var loader = event.target;
		var resultData = this._createResultData(loader.getItem());
		resultData.progress = loader.progress;
		this._sendFileProgress(resultData);
		this._updateProgress();
	};

	p._updateProgress = function () {
		var loaded = this._numItemsLoaded / this._numItems; // Fully Loaded Progress
		var remaining = this._numItems-this._numItemsLoaded;
		if (remaining > 0) {
			var chunk = 0;
			for (var i=0, l=this._currentLoads.length; i<l; i++) {
				chunk += this._currentLoads[i].progress;
			}
			loaded += (chunk / remaining) * (remaining/this._numItems);
		}
		this._sendProgress({loaded:loaded, total:1});
	}

	p._createLoadItem = function(loadItem) {
		var item = {};

		// Create/modify a load item
		switch(typeof(loadItem)) {
			case "string":
				item.src = loadItem; break;
			case "object":
				if (loadItem instanceof HTMLAudioElement) {
					item.tag = loadItem;
					item.src = item.tag.src;
					item.type = PreloadJS.SOUND;
				} else {
					item = loadItem;
				}
				break;
			default:
				break;
		}

		// Get source extension
		item.ext = this._getNameAfter(item.src, ".");
		if (!item.type) {
			item.type = this.getType(item.ext)
		}
		//If theres no id, set one now.
		if (item.id == null || item.id == "") {
			//item.id = this._getNameAfter(item.src, "/");
            item.id = item.src; //[SB] Using the full src is more robust, and more useful from a user perspective.
		}


		// Give plugins a chance to modify the loadItem
		var customHandler = this.typeHandlers[item.type] || this.extensionHandlers[item.ext];
		if (customHandler) {
			var result = customHandler(item.src, item.type, item.id, item.data);
			//Plugin will handle the load, so just ignore it.
			if (result === false) {
				return null;

			// Load as normal
			} else if (result === true) {
				// Do Nothing
			// Result is a loader class
			} else {
				if (result.src != null) { item.src = result.src; }
				if (result.id != null) { item.id = result.id; }
				if (result.tag != null && result.tag.load instanceof Function) { //Item has what we need load
					item.tag = result.tag;
				}
			}

			// Update the extension in case the type changed
			item.ext = this._getNameAfter(item.src, ".");
		}

		var useXHR2 = this.useXHR;

		// Determine the XHR2 usage overrides
		switch (item.type) {
			case PreloadJS.JSON:
			case PreloadJS.XML:
			case PreloadJS.TEXT:
				useXHR2 = true; // Always use XHR2 with text
				break;
			case PreloadJS.SOUND:
				if (item.ext == "ogg" && PreloadJS.TAG_LOAD_OGGS) {
					useXHR2 = false; // OGGs do not work well with XHR in Firefox.
				}
				break;
		}

		if (useXHR2) {
			return new PreloadJS.lib.XHRLoader(item);
		} else if (!item.tag) {
			var tag;
			var srcAttr = "src";
			var useXHR = false;

			//Create TagItem
			switch(item.type) {
				case PreloadJS.IMAGE:
					tag = this._createImage();
					break;
				case PreloadJS.SOUND:
					tag = this._createAudio();
					break;
				case PreloadJS.CSS:
					srcAttr = "href";
					useXHR = true;
					tag = this._createLink();
					break;
				case PreloadJS.JAVASCRIPT:
					useXHR = true; //We can't properly get onLoad events from <script /> tags.
					tag = this._createScript();
					break;
				default:
			}

			item.tag = tag;
			return new PreloadJS.lib.TagLoader(item, srcAttr, useXHR);

		} else {
			return new PreloadJS.lib.TagLoader(item);
		}
	};

	p.getType = function(ext) {
		switch (ext) {
			case "jpeg":
			case "jpg":
			case "gif":
			case "png":
				return PreloadJS.IMAGE;
			case "ogg":
			case "mp3":
			case "wav":
				return PreloadJS.SOUND;
			case "json":
				return PreloadJS.JSON;
			case "xml":
				return PreloadJS.XML;
			case "css":
				return PreloadJS.CSS;
			case "js":
				return PreloadJS.JAVASCRIPT;
			default:
				return PreloadJS.TEXT;
		}
	};

	p._getNameAfter = function(path, token) {
		var dotIndex = path.lastIndexOf(token);
		var lastPiece = path.substr(dotIndex+1);
		var endIndex = lastPiece.lastIndexOf(/[\b|\?|\#|\s]/);
		return (endIndex == -1) ? lastPiece : lastPiece.substr(0, endIndex);
	};

	p._createImage = function() {
		return document.createElement("img");
	};

	p._createAudio = function () {
		var tag = document.createElement("audio");
		tag.autoplay = false;
		tag.type = "audio/ogg";
		return tag;
	};

	p._createScript = function() {
		var tag = document.createElement("script");
		tag.type = "text/javascript";
		return tag;
	};

	p._createLink = function () {
		var tag = document.createElement("link");
		tag.type = "text/css";
		tag.rel  = "stylesheet";
		return tag;
	};

	p.toString = function() {
		return "[PreloadJS]";
	};

// Static methods
	/**
	 * A function proxy for PreloadJS methods. By default, JavaScript methods do not maintain scope, so passing a
	 * method as a callback will result in the method getting called in the scope of the caller. Using a proxy
	 * ensures that the method gets called in the correct scope. All internal callbacks in PreloadJS use this approach.
	 * @method proxy
	 * @param {Function} method The function to call
	 * @param {Object} scope The scope to call the method name on
	 * @static
	 * @private
	 */
	s.proxy = function(method, scope) {
		return function(event) {
			return method.apply(scope, arguments);
		};
	}

	PreloadJS.lib = {};

	window.PreloadJS = PreloadJS;


	/**
	 * An additional module to detemermine the current browser, version, operating system, and other environment variables.
	 */
	function BrowserDetect() {}

	BrowserDetect.init = function() {
		var agent = navigator.userAgent;
		BrowserDetect.isFirefox = (agent.indexOf("Firefox")> -1);
		BrowserDetect.isOpera = (window.opera != null);
		BrowserDetect.isIOS = agent.indexOf("iPod") > -1 || agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1;
	}

	BrowserDetect.init();

	PreloadJS.lib.BrowserDetect = BrowserDetect;

}(window));

/*
* TagLoader for PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2012 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @module PreloadJS
 */
(function (window) {

	/**
	 * The loader that handles loading items using a tag-based approach. There is a built-in
	 * fallback for XHR loading for tags that do not fire onload events, such as &lt;script&gt; and &lt;style&gt;.
	 * @class TagLoader
	 * @constructor
	 * @extends AbstractLoader
	 * @param {String | Object} item The item to load
	 * @param {String} srcAttr The attribute to use as the "source" param, since some tags use different items, such as <style>
	 * @param {Boolean} useXHR Determine if the content should be loaded via XHR before being put on the tag.
	 */
	var TagLoader = function (item, srcAttr, useXHR) {
		this.init(item, srcAttr, useXHR);
	};
	var p = TagLoader.prototype = new AbstractLoader();

	//Protected
	p._srcAttr = null;
	p._loadTimeOutTimeout = null;
	p.tagCompleteProxy = null;

	p.init = function (item, srcAttr, useXHR) {
		this._item = item;
		this._srcAttr = srcAttr || "src";
		this._useXHR = (useXHR == true);
		this.isAudio = (item.tag instanceof HTMLAudioElement);
		this.tagCompleteProxy = PreloadJS.proxy(this._handleTagLoad, this);
	};

	p.cancel = function() {
		this._clean();
		var item = this.getItem();
		if (item != null) { item.src = null; }
	};

	p.load = function() {
		if (this._useXHR) {
			this.loadXHR();
		} else {
			this.loadTag();
		}
	};

// XHR Loading
	p.loadXHR = function() {
		var item = this.getItem();
		var xhr = new PreloadJS.lib.XHRLoader(item);

		xhr.onProgress = PreloadJS.proxy(this._handleProgress, this);
		xhr.onFileLoad = PreloadJS.proxy(this._handleXHRComplete, this);
		//xhr.onComplete = PreloadJS.proxy(this._handleXHRComplete, this);
		xhr.onFileError = PreloadJS.proxy(this._handleLoadError, this);
		xhr.load();
	};

	p._handleXHRComplete = function(loader) {
		this._clean();

		var item = loader.getItem();
		var result = loader.getResult();

		//LM: Consider moving this to XHRLoader
		if (item.type == PreloadJS.IMAGE) {
			item.tag.onload = PreloadJS.proxy(this._sendComplete, this);
			item.tag.src = item.src;
		} else {
			item.tag[this._srcAttr] = item.src;
			this._sendComplete();
		}
	};

	p._handleLoadError = function(event) {
		this._clean();
		this._sendError(event);
	};


// Tag Loading
	p.loadTag = function() {
		var item = this.getItem();
		var tag = item.tag;

		// In case we don't get any events...
		clearTimeout(this._loadTimeOutTimeout);
		this._loadTimeOutTimeout = setTimeout(PreloadJS.proxy(this._handleLoadTimeOut, this), PreloadJS.TIMEOUT_TIME);

		if (this.isAudio) {
			tag.src = null;
			//tag.type = "audio/ogg"; // TODO: Set proper types
			tag.preload = "auto";
			tag.setAttribute("data-temp", "true"); //LM: Do we need this?
		}

		// Handlers for all tags
		tag.onerror = PreloadJS.proxy(this._handleLoadError, this);
		tag.onprogress = PreloadJS.proxy(this._handleProgress, this);

		if (this.isAudio) {
			// Handlers for audio tags
			tag.onstalled = PreloadJS.proxy(this._handleStalled, this);
			tag.addEventListener("canplaythrough", this.tagCompleteProxy); //LM: oncanplaythrough callback does not work in Chrome.
		} else {
			// Handlers for non-audio tags
			tag.onload = PreloadJS.proxy(this._handleTagLoad, this);
		}

		// Set the src after the events are all added.
		tag[this._srcAttr] = item.src;

		// We can NOT call load() for OGG in Firefox.
		var isOgg = (item.type == PreloadJS.SOUND && item.ext == "ogg" && PreloadJS.lib.BrowserDetect.isFirefox);
		if (tag.load != null && !isOgg) {
			tag.load();
		}
	}

	p._handleLoadTimeOut = function() {
		this._clean();
		this._sendError();
	};

	p._handleStalled = function() {
		//Ignore, let the timeout take care of it. Sometimes its not really stopped.
	};

	p._handleLoadError = function(event) {
		this._clean();
		this._sendError();
	};

	p._handleTagLoad = function(event) {
		var tag = this.getItem().tag;
		clearTimeout(this._loadTimeOutTimeout);
		if (this.isAudio && tag.readyState !== 4) { return; }

		if (this.loaded) { return; }
		this.loaded = true;
		this._clean();
		this._sendComplete();
	};

	p._clean = function() {
		clearTimeout(this._loadTimeOutTimeout);

		// Delete handlers.
		var tag = this.getItem().tag;
		tag.onload = null;
		tag.removeEventListener("canplaythrough", this.tagCompleteProxy);
		tag.onstalled = null;
		tag.onprogress = null;
		tag.onerror = null;
	};

	p._handleProgress = function(event) {
		clearTimeout(this._loadTimeOutTimeout);
		var progress = event;
		//TODO: Check if this works with XHR Audio...
		if (this.isAudio) {
			var item = this.getItem();
			if (item.buffered == null) { return; }
			progress = {loaded:(item.buffered.length > 0) ? item.buffered.end(0) : 0, total: item.duration};
		}
		this._sendProgress(progress);
	};

	p.toString = function() {
		return "[PreloadJS TagLoader]";
	}

	PreloadJS.lib.TagLoader = TagLoader;

}(window));
/*
* XHRLoader for PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2012 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @module PreloadJS
 */
(function (window) {

	/**
	 * The loader that handles XmlHttpRequests.
	 * @class XHRLoader
	 * @constructor
	 * @param {Object} file The object that defines the file to load.
	 * @extends AbstractLoader
	 */
	var XHRLoader = function (file) {
		this.init(file);
	};

	var p = XHRLoader.prototype = new AbstractLoader();

	//Protected
	p._wasLoaded = false;
	p._request = null;
	p._loadTimeOutTimeout = null;

	/**
	 * Is the browsers XMLHTTPRequest version 1 or 2.
	 * There is no way to accurately detect v1 vs v2 ... so its our best guess.
	 * @private
	 */
	p._xhrLevel = null;

	p.init = function (item) {
		this._item = item;
		if (!this._createXHR(item)) {
			//TODO: Throw error?
		}
	};

	p.getResult = function() {
		//[SB] When loading XML IE9 does not return .response, instead it returns responseXML.xml
	    try {
			return this._request.responseText;
	    } catch (error) {}
		return this._request.response;
	}

	p.cancel = function() {
		this._clean();
		this._request.abort();
	};

	p.load = function() {
		if (this._request == null) {
			this.handleError();
			return;
		}

		//Setup timeout if we're not using XHR2
		if (this._xhrLevel == 1) {
			this._loadTimeOutTimeout = setTimeout(PreloadJS.proxy(this.handleTimeout, this), PreloadJS.TIMEOUT_TIME);
		}
		
		//Events
		this._request.onloadstart = PreloadJS.proxy(this.handleLoadStart, this);
		this._request.onprogress = PreloadJS.proxy(this.handleProgress, this);
		this._request.onabort = PreloadJS.proxy(this.handleAbort, this);
		this._request.onerror = PreloadJS.proxy(this.handleError, this);
		this._request.ontimeout = PreloadJS.proxy(this.handleTimeout, this);
		//this._request.onloadend = PreloadJS.proxy(this.handleLoadEnd, this);

		//LM: Firefox does not get onload. Chrome gets both. Might need onload for other things.
		this._request.onload = PreloadJS.proxy(this.handleLoad, this);
		this._request.onreadystatechange = PreloadJS.proxy(this.handleReadyStateChange, this);

		try { // Sometimes we get back 404s immediately, particularly when there is a cross origin request.
			this._request.send();
		} catch (error) {}
	};

	p.handleProgress = function(event) {
		if (event.loaded > 0 && event.total == 0) {
			return; // Sometimes we get no "total", so just ignore the progress event.
		}
		this._sendProgress({loaded:event.loaded, total:event.total});
	};

	p.handleLoadStart = function() {
		clearTimeout(this._loadTimeOutTimeout);
		this._sendLoadStart();
	};

	p.handleAbort = function() {
		this._clean();
		this._sendError();
	};

	p.handleError = function() {
		this._clean();
		this._sendError();
	};

	p.handleReadyStateChange = function() {
		if (this._request.readyState == 4) {
			this.handleLoad();
		}
	}

    p._checkError = function() {
        //LM: Probably need additional handlers here.
        var status = parseInt(this._request.status);
        switch (status) {
            case 404:   // Not Found
            case 0:     // Not Loaded
                return false;
        }

        if (this._request.response == null) {
		    try {
		        // We have to check this for IE, and other browsers will throw errors, so we have to try/catch it.
		        if (this._request.responseXML != null) { return true; }
		    } catch (error) {}
	        return false; }
        return true;
    };

    p.handleLoad = function(event) {
		if (this.loaded) { return; }
		this.loaded = true;

		if(!this._checkError()) {
			this.handleError();
			return;
		}

		this._clean();
		this._sendComplete();
	};



	p.handleTimeout = function() {
		this._clean();
		this._sendError();
	};

	p.handleLoadEnd = function() {
		this._clean();
	};

	p._createXHR = function(item) {
		this._xhrLevel = 1;
		
		if (window.ArrayBuffer) {
			this._xhrLevel = 2;
		}

		// Old IE versions use a different approach
		if (window.XMLHttpRequest) {
		    this._request = new XMLHttpRequest();
		} else {
			try {
				this._request = new ActiveXObject("MSXML2.XMLHTTP.3.0");
			} catch(ex) {
				return null;
			}
		}

		if (item.type == PreloadJS.TEXT) {
			this._request.overrideMimeType('text/plain; charset=x-user-defined');
		}

		this._request.open('GET', item.src, true);

		if (PreloadJS.isBinary(item.type)) {
			this._request.responseType = 'arraybuffer';
		}
        return true;
	};

	p._clean = function() {
		clearTimeout(this._loadTimeOutTimeout);

		var req = this._request;
		req.onloadstart = null;
		req.onprogress = null;
		req.onabort = null;
		req.onerror = null;
		req.onload = null;
		req.ontimeout = null;
		req.onloadend = null;
		req.onreadystatechange = null;

		clearInterval(this._checkLoadInterval);
	};

	p.toString = function() {
		return "[PreloadJS XHRLoader]";
	}

	PreloadJS.lib.XHRLoader = XHRLoader;

}(window));
