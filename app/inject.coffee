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
      computedStyle = window.getComputedStyle @$target
      box =
        width: rect.width
        height: rect.height
        top: rect.top + window.pageYOffset
        left: rect.left + window.pageXOffset
        margin:
          top: computedStyle.marginTop
          right: computedStyle.marginRight
          bottom: computedStyle.marginBottom
          left: computedStyle.marginLeft

      # pluck negative margins
      for key, val of box.margin
        val = parseInt val, 10
        box.margin[key] = if val > 0 then val else 0
        

      overlayVStyle = "
        top: #{box.top}px;
        height: #{box.height}px;
        "

      overlayHStyle = "
        top: #{window.pageYOffset}px;
        left: #{box.left}px;
        width: #{box.width}px;
        "

      overlayStyle = "
        top: #{box.top - box.margin.top}px;
        left: #{box.left - box.margin.left}px;
        width: #{box.width}px;
        height: #{box.height}px;
        border-width: #{box.margin.top}px #{box.margin.right}px #{box.margin.bottom}px #{box.margin.left}px;
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




