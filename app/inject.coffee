injected = injected or do ->
 
  enabled = false

  class TinyInspect
    constructor: ->
      @$target = @$cacheEl = document.body

    createNodes: ->

      template = "
        <div class='tl-wrap'>
          <div class='tl-overlayV'></div>
          <div class='tl-overlayH'></div>
          <div class='tl-overlay'></div>
          <div class='tl-codeWrap'>
            <code class='tl-code language-markup'>&lt;html&gt;</code>
          </div>
        </div>
        "

      $template = @fragmentFromString template
      document.body.appendChild $template

      @$wrap = document.querySelector '.tl-wrap'
      @$overlay = document.querySelector '.tl-overlay'
      @$overlayV = document.querySelector '.tl-overlayV'
      @$overlayH = document.querySelector '.tl-overlayH'
      @$code = document.querySelector '.tl-code'

      @highlight()

    registerEvents: ->
      document.addEventListener 'mousemove', @logg

    logg: (e)=>
      @$target = e.target
      return if @$cacheEl is @$target
      @$cacheEl = @$target
      @layout()

      $clone = @$target.cloneNode()

      serializer  = new XMLSerializer()
      stringified = serializer.serializeToString $clone
      stringified = stringified
        .slice 0, stringified.indexOf('>')+1
        .replace /( xmlns=")(.*?)(")/, ''
      @$code.innerText = stringified

      @highlight()

    layout: ->
      rect = @$target.getBoundingClientRect()
      width = rect.width
      height = rect.height
      top = rect.top + window.pageYOffset
      left = rect.left + window.pageXOffset

      overlayVStyle = "
        top: #{top}px;
        height: #{height}px;
        "

      overlayHStyle = "
        top: #{window.pageYOffset}px;
        left: #{left}px;
        width: #{width}px;
        "

      overlayStyle = "
        top: #{top}px;
        left: #{left}px;
        width: #{width}px;
        height: #{height}px;
        "

      @$overlayV.style.cssText = overlayVStyle
      @$overlayH.style.cssText = overlayHStyle
      @$overlay.style.cssText = overlayStyle


    destroy: ->
      @$wrap.classList.add '-out'
      document.removeEventListener 'mousemove', @logg
      setTimeout =>
        @$wrap.outerHTML = ''
      , 600

    highlight: =>
      Prism.highlightElement @$code

    fragmentFromString: (strHTML)->
      temp = document.createElement 'template'
      temp.innerHTML = strHTML
      return temp.content



  inspector = new TinyInspect()

  chrome.runtime.onMessage.addListener (request, sender, sendResponse)->
    enabled = !enabled
    if enabled
      inspector.createNodes()
      inspector.registerEvents()
    else
      inspector.destroy()

  return true




