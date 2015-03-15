# Hover inspect extension for Chrome
# https://github.com/NV0/hover-inspect

injected = injected or do ->
 
  class HoverInspect
    constructor: ->
      @$target = @$cacheEl = document.body
      @serializer = new XMLSerializer()

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

      stringified = @serializer.serializeToString $clone
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
        box.margin[key] = Math.max val, 0

      @$overlayV.style.cssText = "
        top: #{box.top}px;
        height: #{box.height}px;
        "

      @$overlayH.style.cssText = "
        top: #{window.pageYOffset}px;
        left: #{box.left}px;
        width: #{box.width}px;
        "

      @$overlay.style.cssText = "
        top: #{box.top - box.margin.top}px;
        left: #{box.left - box.margin.left}px;
        width: #{box.width}px;
        height: #{box.height}px;
        border-width: #{box.margin.top}px #{box.margin.right}px #{box.margin.bottom}px #{box.margin.left}px;
        "

    highlight: =>
      Prism.highlightElement @$code

    fragmentFromString: (strHTML)->
      temp = document.createElement 'template'
      temp.innerHTML = strHTML
      return temp.content

    deactivate: ->
      @$wrap.classList.add '-out'
      document.removeEventListener 'mousemove', @logg
      setTimeout =>
        @$wrap.outerHTML = ''
      , 600

    activate: ->
      @createNodes()
      @registerEvents()



  hi = new HoverInspect()

  chrome.runtime.onMessage.addListener (request, sender, sendResponse)->
    if request.action == 'activate'
      hi.activate()
    else
      hi.deactivate()

  return true




