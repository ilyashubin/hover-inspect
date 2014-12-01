injected = injected or do ->
 
  enabled = false

  class TinyInspect

    createNodes: ->
      do appendOverlay = =>
        overlayTemplate = "
          <div class='tl-overlayWrap'>
            <div class='tl-overlayW'></div>
            <div class='tl-overlayH'></div>
            <div class='tl-overlay'></div>
          </div>
          "
        $overlayFrag = @fragmentFromString overlayTemplate

        document.body.appendChild $overlayFrag

      do appendLogger = =>
        logTemplate = "
          <div class='tl-loggerWrap'>
            <code class='language-markup'>&lt;html&gt;</code>
          </div>
          "
        $logFrag = @fragmentFromString logTemplate

        document.body.appendChild $logFrag


      @$overlayWrap = document.querySelector '.tl-overlayWrap'
      @$overlayW = document.querySelector '.tl-overlayW'
      @$overlayH = document.querySelector '.tl-overlayH'
      @$overlay = document.querySelector '.tl-overlay'
      @$wrap = document.querySelector '.tl-loggerWrap'
      @$code = document.querySelector '.tl-loggerWrap code'

    destroy: ->
      @$wrap.classList.add '-out'
      document.removeEventListener 'mousemove', @logg
      @$overlayWrap.outerHTML = ''
      setTimeout =>
        @$wrap.outerHTML = ''
      , 600

    registerEvents: ->
      @highlight()
      document.addEventListener 'mousemove', @logg

    logg: (e)=>
      $target = e.target
      targetRect = $target.getBoundingClientRect()
      targetWidth = targetRect.width
      targetHeight = targetRect.height
      targetTop = targetRect.top + window.pageYOffset
      targetLeft = targetRect.left + window.pageXOffset

      overlayWStyle = "
        top: #{targetTop}px;
        height: #{targetHeight}px;
        "

      overlayHStyle = "
        top: #{window.pageYOffset}px;
        left: #{targetLeft}px;
        width: #{targetWidth}px;
        "

      overlayStyle = "
        top: #{targetTop}px;
        left: #{targetLeft}px;
        width: #{targetWidth}px;
        height: #{targetHeight}px;
        "

      @$overlayW.style.cssText = overlayWStyle
      @$overlayH.style.cssText = overlayHStyle
      @$overlay.style.cssText = overlayStyle

      $clone = $target.cloneNode()

      serializer  = new XMLSerializer()
      stringified = serializer.serializeToString $clone
      stringified = stringified
        .slice 0, stringified.indexOf('>')+1
        .replace /( xmlns=")(.*?)(")/, ''

      @$code.innerText = stringified
      @highlight()

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




