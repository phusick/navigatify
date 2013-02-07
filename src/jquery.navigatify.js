;(function($, window, document, undefined) {

  var pluginName = "navigatify",
      instance = null,
      handlers = {
        onscroll: null,
        onresize: null
      },
      defaults = {
        articleSelector: "article",
        sectionSelector: "section",
        headingSelector: "h2",

        headerOffset: 0,
        footerOffset: 0,

        horizontalOffset: 0,
        verticalOffset: 0,

        snapTo: "window", // window || article

        appendTo: "body",

        singleton: true,
        objects: {
          section: Section,
          viewport: Viewport
        }
    };

  function Section(label, section) {
    this.label = label;
    this.$section = $(section);
    this.$element = $("<div/>", {
      text: label,
      "class": "section"
    });
  }

  function Viewport() {
    this.$top = $('<div/>', { style: "position:absolute;", "class": "viewport-top" });
    this.$left = $('<div/>', { style: "position:absolute;", "class": "viewport-left" });
    this.$right = $('<div/>', { style: "position:absolute;", "class": "viewport-right" });
    this.$bottom = $('<div/>', { style: "position:absolute;", "class": "viewport-bottom" });
  }

  Viewport.prototype = {

    position: function(top, height) {
      thickness = this.$top.outerHeight();
      this.$top.css({ top: top });
      this.$left.css({ top: thickness + top, height: height });
      this.$right.css({ top: thickness + top, height: height });
      this.$bottom.css({ top: thickness + height + top });
    }

  };

  var Navigatify = function(options) {
    this.options = $.extend({}, defaults, options);
    this.init();
  };

  Navigatify.prototype = {

    constructor: Navigatify,

    init: function() {
      this._parse(); // TODO create class Parser?
      this._create();
      this._append();
      this._bind();
      this._calculate();
      this._update();
    },

    _parse: function() {
      this._findArticle();
      this._findSections();
    },

    _create: function() {
      this.$element = $('<nav/>', { style: "position:fixed;", "class": pluginName });
      this.$wrapper = $('<div/>', { style: "position:relative;", "class": "wrapper" });
      this.$container = $('<div/>', { "class": "container" });

      this.$element.append(this.$wrapper);
      this.$wrapper.append(this.$container);

      this._createViewport();
      this._createSections();
    },

    _createViewport: function() {
      var Viewport = this.options.objects.viewport;
      var viewport = this.viewport = new Viewport();
      this.$wrapper.append(viewport.$top);
      this.$wrapper.append(viewport.$left);
      this.$wrapper.append(viewport.$right);
      this.$wrapper.append(viewport.$bottom);
    },

    _createSections: function() {
      var self = this;
      $.each(this.sections, function() {
        self.$container.append(this.$element);
      });
    },

    _findArticle: function() {
      var selector = this.options.articleSelector;
      this.$article = $(selector).first();
      if (this.$article.length === 0) {
        throw new Error("Article not found for selector '" + selector + "'");
      }
    },

    _findSections: function() {
      var self = this;
      var Section = this.options.objects.section;
      var selector = this.options.sectionSelector;
      this.$sections = this.$article.find(selector);
      if (this.$sections.length === 0) {
        throw new Error('No section found for selector: `' + selector + '`');
      }

      this.sections = [];

      this.$sections.each(function() {
        var $element = $(this);
        self.sections.push(new Section(self._findHeading($element), $element));
      });
    },

    _findHeading: function($element) {
      if ($element.data("heading")) { return $element.data("heading"); }

      var heading = $element.find(this.options.headingSelector).first().text();

      return heading || "not found";
    },

    _append: function() {
      $(this.options.appendTo).append(this.$element);
    },

    _bind: function() {
      handlers.onscroll = $.proxy(this._update, this);
      handlers.onresize = $.proxy(this._update, this);

      $(window).on("scroll", handlers.onscroll);
      $(window).on("resize", handlers.onresize);
    },

    _unbind: function() {
      $(window).off("scroll", handlers.onscroll);
      $(window).off("resize", handlers.onresize);
    },

    _calculate: function() {
      var self = this;

      // top
      $.each(this.sections, function() {
        this.cache = {};
        this.cache.top = this.$section.offset().top;
      });

      // height
      $.each(this.sections, function(index) {
        var sections = self.sections;
        var cache = this.cache;
        if (index + 1 < sections.length) {
          cache.height = sections[index + 1].cache.top - sections[index].cache.top;
        }
      });

      var len = this.sections.length;
      var lastSection = this.sections[len - 1];
      var $helper = $('<div/>');
      lastSection.$section.after($helper);
      var height = $helper.offset().top - this.sections[len - 1].cache.top;
      lastSection.cache.height = height;
      $helper.remove();

      // alternative height calculation
      // $.each(this.sections, function() {
      //   var $helper = $('<div/>', { style: "height: 0;" });
      //   this.$section.after($helper);
      //   this.cache.bottom = $helper.offset().top;
      //   this.cache.height = this.cache.bottom - this.cache.top;
      //   $helper.remove();
      // });

      // ratio
      var articleHeight = 0;
      $.each(this.sections, function() {
        articleHeight += this.cache.height;
      });
      $.each(this.sections, function() {
        this.cache.ratio = this.cache.height / articleHeight;
      });
    },

    _update: function() {
      this._position();
      this._viewport();
    },

    _position: function() {
      // the position of the widget
    },

    _viewport: function() {
      var first = this._firstVisible();
      var last = this._lastVisible();
      var index, ratio, sectionHeight;

      // top
      index = first.index;
      ratio = first.ratio > 1 ? 1 : first.ratio;
      sectionHeight = this.sections[index].$element.outerHeight();
      var top = Math.round(index * sectionHeight + (sectionHeight * ratio));

      // height
      index = last.index;
      ratio = last.ratio;
      sectionHeight = this.sections[index].$element.outerHeight();
      var height = (Math.floor(index * sectionHeight + ratio * sectionHeight)) - top;
      var maxHeight = this.$wrapper.outerHeight();
      if (top + height > maxHeight) {
        height = maxHeight - top;
      }

      this.viewport.position(top, height);
    },

    _scroll: function() {
      // TODO make it setter too
      return $(window).scrollTop();
    },

    _firstVisible: function() {
      var headerOffset = this.options.headerOffset;
      var start = this.sections[0].cache.top - headerOffset;
      var scroll = this._scroll();

      if (start > scroll) { return { index:0, ratio: 0 }; }

      var top, index = 0, ratio;
      $.each(this.sections, function (i) {
        top = this.cache.top - scroll - headerOffset;
        if (top < 0) { index = i; }
      });

      top = this.sections[index].cache.top - scroll - headerOffset;
      ratio = Math.abs(top / this.sections[index].cache.height);

      return { index: index, ratio: ratio };
    },

    _lastVisible: function() {
      var viewport = $(window).height();
      var scroll = this._scroll();

      var index = 0, top, notVisible, ratio;
      $.each(this.sections, function(i) {
        top = this.cache.top;
        if (top < viewport + scroll) {
          index = i;
        }
      });

      top = this.sections[index].cache.top - scroll;
      height = this.sections[index].cache.height;
      notVisible = (top + height) - viewport;
      ratio = notVisible / height;
      ratio = ratio < 0 ? 1 : 1 - ratio;

      return { index: index, ratio: ratio };
    },

    destroy: function() {
      this._unbind();
      $(this.$element).wrap('<div/>').parent().empty();
      instance = null;
    }

  };

  $[pluginName] = function(options) {
    if (defaults.singleton === false) { return new Navigatify(options); }

    if (null === instance) {
      instance = new Navigatify(options);
    }
    return instance;
  };

  $[pluginName].defaults = defaults;
  $[pluginName].object = Navigatify;
  
})(jQuery, window, document);