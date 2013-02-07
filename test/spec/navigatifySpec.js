describe("Navigatify Plugin", function() {

  var Navigatify = $.navigatify.object;
  // $.navigatify.defaults.singleton = false;

  it("should be defined on jQuery object", function() {
    expect($.navigatify).toEqual(jasmine.any(Function));
  });

  it("should provide access to class object", function() {
    expect($.navigatify.object).toBeDefined();
  });

  it("should provide access to default options", function() {
    expect($.navigatify.defaults).toBeDefined();
  });

  describe("Init", function() {

    var html, nav;

    beforeEach(function() {
      html = [
        '<article>',
        '<section><h2>Section #1</h2></section>',
        '<section data-label="data label"><h2>Section #2</h2></section>',
        '<section><h2>Section #3</h2></section>',
        '</article>'
      ].join();
      setFixtures($(html))
    });

    afterEach(function() {
      nav.destroy();
    });
    
    it("should return an instance of plugin object", function() {
      nav = $.navigatify();
      var Navigatify = $.navigatify.object;
      expect(nav).toEqual(jasmine.any(Navigatify));
    });

    it("should invoke `init` method upon instantiation", function() {
      spyOn(Navigatify.prototype, "init");
      nav = $.navigatify();
      expect(nav.init).toHaveBeenCalled();
    });

    it("should have default selectors when instantized w/o arguments", function() {
      nav = $.navigatify();
      var o = nav.options;
      expect(o.articleSelector).toEqual(jasmine.any(String));
      expect(o.sectionSelector).toEqual(jasmine.any(String));
      expect(o.headingSelector).toEqual(jasmine.any(String));
    });

    it("should mix in passed arguments", function() {
      nav = $.navigatify({ custom: 'is custom' });
      expect(nav.options.custom).toEqual('is custom');
    });

    describe("Parse", function() {

      it('should throw an exception when article not found', function() {
        setFixtures('');
        expect($.navigatify).toThrow();
      });

      it('should find just one article as jQuery object', function() {
        setFixtures($(html + html));
        nav = $.navigatify();
        expect(nav.$article.length).toEqual(1);
      });

      it('should throw an exception when no section was found', function() {
        setFixtures('<article></article>');
        expect($.navigatify).toThrow();
      });

      it('should find sections within article element', function() {
        var html2 = '<article role="main"><section></section></article>';
        setFixtures($(html + html2));
        nav = $.navigatify();
        expect(nav.$sections.length).toEqual(3);
      });

      it("should create section objects for each section", function() {
        var Section = $.navigatify.defaults.objects.section;
        nav = $.navigatify();
        var s = nav.sections;
        expect(s.length).toEqual(3);
        expect(s[0] instanceof Section).toBeTruthy();
        expect(s[1] instanceof Section).toBeTruthy();
        expect(s[2] instanceof Section).toBeTruthy();
      });

      describe("Headings", function() {
        var nav;

        beforeEach(function() {
          nav = $.navigatify();
        });

        afterEach(function() {
          nav.destroy();
        });

        it("should prefer `data-heading` header", function() {
          var $element = $('<div data-heading="data heading"><h2>heading</h2></div>');
          expect(nav._findHeading($element)).toEqual('data heading');
        });

        it("should find heading inside inside heading selector", function() {
          var $element = $('<div><h2>heading</h2></div>');
          expect(nav._findHeading($element)).toEqual('heading');        
        });

        it("should return 'not found' string when no heading was found", function() {
          var $element = $('<div></div>');
          expect(nav._findHeading($element)).toEqual('not found');        
        });
        
      });
    });
  });

  describe("Create", function() {

    var html, nav;

    beforeEach(function() {
      html = [
        '<article>',
        '<section><h2>Section #1</h2></section>',
        '<section data-label="data label"><h2>Section #2</h2></section>',
        '<section><h2>Section #3</h2></section>',
        '</article>'
      ].join();
      setFixtures($(html));
      nav = $.navigatify();
    });

    afterEach(function() {
      nav.destroy();
    });

    it('shoud create DOM nodes w/ proper CSS classes', function() {
      var $element = nav.$element;
      
      expect($element).toHaveClass('navigatify');
      expect($element).toContain('div.wrapper');
      expect($element).toContain('div.container');
      expect($element).toContain('div.viewport-top');
      expect($element).toContain('div.viewport-left');
      expect($element).toContain('div.viewport-right');
      expect($element).toContain('div.viewport-bottom');
    });

    it('shoud assign proper CSS styles to created elements', function() {
      expect(nav.$element).toHaveCss({ position: 'fixed' });
      expect(nav.$wrapper).toHaveCss({ position: 'relative' });
    });

    it("should create an element for each section", function() {
      expect(nav.$element.find('div.section').length).toEqual(3);
    });  

    it("should listen to onscroll and onresize events", function() {
      expect($(window)).toHandle('scroll');
      expect($(window)).toHandle('resize');
    });
  });

  describe("Calculate", function() {
    it("should calculate and cache sections' top, height & ratio", function() {
      
    });

    it("should calculate the first visible section", function() {
      
    });

    it("should calculate the last visible section", function() {
      
    });

  });

  describe("Destroy", function() {

    var html, nav;

    beforeEach(function() {
      html = [
        '<article>',
        '<section><h2>Section #1</h2></section>',
        '<section data-label="data label"><h2>Section #2</h2></section>',
        '<section><h2>Section #3</h2></section>',
        '</article>'
      ].join();
      setFixtures($(html));
      nav = $.navigatify();
    });

    afterEach(function() {
      nav.destroy();
    });

    it("should unbind onscroll and onresize events", function() {
      nav.destroy();   
      expect($(window)).not.toHandle('scroll');
      expect($(window)).not.toHandle('resize');
    });

    it("should destroy DOM nodes", function() {
      nav.destroy();
      expect($('nav.navigatify').length).toEqual(0);
    });  
    
  });
  
});