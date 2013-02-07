describe("Section", function() {
  
  var Section = $.navigatify.defaults.objects.section;
  var section;
  var label = 'some label';
  var $section = $('<div/>');

  beforeEach(function() {
    section = new Section(label, $section);
  });

  it("should assign the 1st argument to this.label", function() {
    expect(section.label).toEqual(label);
  });

  it("should assign the 2nd argument to this.$section", function() {
    expect(section.$section).toBe($section);
  });

  it("should create this.$element as jQuery object", function() {
    expect(section.$element instanceof jQuery).toBeTruthy();
    expect(section.$element.length).toEqual(1);
  });

});