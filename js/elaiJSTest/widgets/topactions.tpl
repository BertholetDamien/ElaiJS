<div class="date">
  {{#loc}}fct=toLocaleString&arrayParams={{w.templateData}}{{/loc}}
</div>
<select class="languages">
  {{#config.languages}}
    <option class="{{code}}" value="{{code}}">
      {{label}}
    </option>
  {{/config.languages}}
</select>
<select class="themes">
  {{#config.themes}}
    <option class="{{key}}{{^key}}undefined{{/key}}" value="{{key}}">
      {{#lang}}
        {{label}}
      {{/lang}}
    </option>
  {{/config.themes}}
</select>
<select class="modes">
    <option class="nomode" value>
      No Mode
    </option>
    <option class="alternative" value="alternative">
      Alternative
    </option>
</select>