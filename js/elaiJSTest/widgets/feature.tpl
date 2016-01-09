<div class="colorable feature_label">
  <span class="label">{{w.feature.index}}. {{w.feature.name}}</span>
  <div class="time">
    {{#w.feature.tested}}
      <span>
        {{#lang}}
          key=time&time={{w.feature.time}}
        {{/lang}}
      </span>
    {{/w.feature.tested}}
  </div>
  <div title="{{#lang}}title_showfeaturecode{{/lang}}" class="icon code_icon code_black_icon"></div>
</div>
<div class="feature_message" id="featuremessage_{{w.id}}"></div>