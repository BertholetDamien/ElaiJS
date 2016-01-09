<div class="moduletitle" id="{{w.id}}_title"></div>

<div class="features_area {{#w.collapsed}}hide{{/w.collapsed}}">
  <div class="features_label colorable">
    {{#lang}}features{{/lang}}
  </div>
  <div class="features">
    {{#w.module.features}}
  		<div id="{{w.module.name}}_{{name}}">
  		</div>
  	{{/w.module.features}}
  </div>
</div>