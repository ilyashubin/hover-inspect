var injected = injected || (function(){

  var enabled = false;

  var TinyInspect, inspector,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  TinyInspect = (function() {
    function TinyInspect() {
      this.highlight = __bind(this.highlight, this);
      this.logg = __bind(this.logg, this);
    }

    TinyInspect.prototype.createNodes = function() {
      var $code, $logg;

      $logg = document.createElement('div');
      $logg.classList.add('tl-loggerWrap');
      $code = document.createElement('code');
      $code.classList.add('language-markup');
      $code.appendChild(document.createTextNode('<html>'));
      $logg.appendChild($code);
      document.body.appendChild($logg);

      this.$wrap = document.querySelector('.tl-loggerWrap');
      this.$codeWrap = document.querySelector('.tl-loggerWrap code');
    };

    TinyInspect.prototype.registerEvents = function() {
      this.highlight();
      document.addEventListener('mousemove', this.logg);
    };

    TinyInspect.prototype.destroy = function() {
      this.$wrap.classList.add('-out');
      setTimeout((function(_this) {
        return function() {
          _this.$wrap.outerHTML = '';
          document.removeEventListener('mousemove', _this.logg);
        };
      })(this), 600);
    };

    TinyInspect.prototype.logg = function(e) {
      var $clone, $target, serializer, stringified;

      $target = e.target;
      $clone = $target.cloneNode();
      serializer = new XMLSerializer();
      stringified = serializer.serializeToString($clone);
      stringified = stringified.slice(0, stringified.indexOf('>') + 1).replace(' xmlns="http://www.w3.org/1999/xhtml"', "");
      this.$codeWrap.innerText = stringified;
      this.highlight();
    };

    TinyInspect.prototype.highlight = function() {
      Prism.highlightElement(this.$codeWrap);
    };

    return TinyInspect;

  })();

  inspector = new TinyInspect();


  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    enabled = enabled ? false : true;

    if (enabled) {
      inspector.createNodes();
      inspector.registerEvents();
    } else {
      inspector.destroy();
    }
  });

  return true;
})();
