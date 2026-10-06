/* Cold Read: placeholder development art for test.html. Not the real art.
   Deliberately leaves out some keys (intro-missing, p-victim, loc-flat) to test placeholders. */
(function () {
  var bg = "<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#1d2329'/><stop offset='1' stop-color='#0c0f12'/></linearGradient></defs><rect width='1000' height='600' fill='url(#g)'/>";
  function scene(inner) { return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'>" + bg + inner + "</svg>"; }
  function portrait(c, hair) {
    return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 360'><rect width='300' height='360' fill='#161b20'/>" +
      "<path d='M40 360 Q150 230 260 360Z' fill='" + c + "'/><ellipse cx='150' cy='150' rx='62' ry='78' fill='#8a7a6c'/>" +
      "<path d='M88 130 Q150 40 212 130 Q200 80 150 72 Q100 80 88 130Z' fill='" + hair + "'/>" +
      "<rect x='0' y='0' width='300' height='360' fill='#000' opacity='.25'/></svg>";
  }
  window.ART = {
    map: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'><rect width='1000' height='600' fill='#11161a'/>" +
      "<path d='M0 470 Q250 430 420 500 T1000 460 V600 H0Z' fill='#0a1720'/>" +
      "<g stroke='#2b343c' stroke-width='3' fill='none'><path d='M100 0 L180 600'/><path d='M0 300 L1000 260'/><path d='M600 0 L520 600'/><path d='M0 120 L1000 200'/></g>" +
      "<g fill='#55616b' font-family='serif' font-size='22' letter-spacing='4'><text x='140' y='560'>THE DOCKS</text><text x='700' y='90'>HILLCREST</text><text x='450' y='250'>OLD TOWN</text></g></svg>",
    intro: {
      "intro-1": scene("<rect x='0' y='380' width='1000' height='220' fill='#0b141b'/><g fill='#222b33'><rect x='80' y='200' width='120' height='190'/><rect x='240' y='150' width='90' height='240'/><rect x='700' y='230' width='160' height='160'/></g><circle cx='820' cy='110' r='40' fill='#cfc6b0' opacity='.25'/>"),
      "intro-2": scene("<rect x='380' y='160' width='240' height='300' fill='#151a1f' stroke='#3a444d'/><path d='M420 460 L460 360 L540 360 L580 460Z' fill='#0a0c0e'/><ellipse cx='500' cy='470' rx='130' ry='16' fill='#000' opacity='.6'/><rect x='300' y='0' width='4' height='600' fill='#7a1f1f' opacity='.5'/>")
    },
    scenes: {
      "loc-hq": scene("<rect x='0' y='420' width='1000' height='180' fill='#1a1f24'/><rect x='200' y='340' width='240' height='80' fill='#2c2620'/><rect x='250' y='355' width='90' height='50' fill='#d8d0bd' opacity='.7'/><rect x='640' y='300' width='160' height='70' fill='#2a2f35'/><rect x='560' y='60' width='300' height='180' fill='#0f1418' stroke='#333'/>"),
      "loc-bar": scene("<rect x='0' y='330' width='1000' height='270' fill='#20160f'/><rect x='0' y='310' width='780' height='30' fill='#3a2a1c'/><g fill='#9fb3bf' opacity='.6'><rect x='400' y='270' width='16' height='34'/><rect x='428' y='274' width='16' height='30'/></g><rect x='620' y='290' width='40' height='22' fill='#e9e2d0' opacity='.8'/><rect x='810' y='120' width='110' height='260' fill='#2a1f16' stroke='#4a3a2a'/>")
    },
    portraits: {
      "p-sam": portrait("#2a3540", "#1a1410"),
      "p-ivy": portrait("#3a2a30", "#5a3a28"),
      "p-rex": portrait("#2e2a26", "#777066")
    }
  };
  /* p-ivy uses a real photo; p-sam points at a missing file to test the fall back to SVG. */
  window.ART.photos = { "p-ivy": "images/p-hanna.jpg", "p-sam": "images/does-not-exist.jpg" };
})();
