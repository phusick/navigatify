describe("Viewport", function() {

  var Viewport, viewport;

  beforeEach(function() {
    Viewport = $.navigatify.defaults.objects.viewport;
    viewport = new Viewport();
  });

  it("should create DOM nodes w/ proper CSS classes", function() {
    expect(viewport.$top).toHaveClass('viewport-top');
    expect(viewport.$left).toHaveClass('viewport-left');
    expect(viewport.$right).toHaveClass('viewport-right');
    expect(viewport.$bottom).toHaveClass('viewport-bottom');
  });

  it("should should assign proper CSS styles to created elements", function() {
    expect(viewport.$top).toHaveCss({ position: 'absolute'}); 
    expect(viewport.$left).toHaveCss({ position: 'absolute'}); 
    expect(viewport.$right).toHaveCss({ position: 'absolute'}); 
    expect(viewport.$bottom).toHaveCss({ position: 'absolute'}); 
  });

  it("should position viewport elements", function() {
    var div = $('<div/>');
    setFixtures(div);
    setStyleFixtures('.viewport-top { height: 5px; }');
    div.append(viewport.$top);    
    div.append(viewport.$left);
    div.append(viewport.$right);
    div.append(viewport.$bottom);

    viewport.position(20, 80);
    expect(viewport.$top.position().top).toEqual(20);
    expect(viewport.$left.position().top).toEqual(25);
    expect(viewport.$right.position().top).toEqual(25);
    expect(viewport.$bottom.position().top).toEqual(105);
  });
  
});